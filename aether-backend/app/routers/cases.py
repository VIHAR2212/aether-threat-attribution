from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db import get_db
from app.models import Case, CustodyRow
from app.schemas import (
    CaseCreate,
    CaseListItem,
    CaseOut,
    CustodyEntryCreate,
    CustodyEntryOut,
    InvestigationResultOut,
    InvestigationStartRequest,
    VerifyResult,
)
from app.services.custody import GENESIS_HASH, CustodyChain, CustodyEntry
from app.services.investigation import run_full_investigation

router = APIRouter(prefix="/api/cases", tags=["cases"])


def _get_case_or_404(db: Session, evidence_id: str) -> Case:
    case = db.execute(select(Case).where(Case.evidence_id == evidence_id)).scalar_one_or_none()
    if case is None:
        raise HTTPException(status_code=404, detail=f"No case with evidence_id '{evidence_id}'")
    return case


@router.get("", response_model=list[CaseListItem])
def list_cases(db: Session = Depends(get_db)) -> list[CaseListItem]:
    cases = db.execute(select(Case).order_by(Case.id.desc())).scalars().all()
    items = []
    for c in cases:
        items.append(
            CaseListItem(
                id=c.id,
                evidence_id=c.evidence_id,
                actor_name=c.actor_name,
                target_url=c.target_url or c.onion_url or "",
                target_type=c.target_type or "domain",
                confidence=c.confidence,
                status=c.status,
                created_at=c.created_at.isoformat() if c.created_at else None,
                evidence_count=len(c.evidence_records),
                custody_count=len(c.custody),
            )
        )
    return items


@router.post("/investigate", response_model=InvestigationResultOut, status_code=200)
def start_investigation(payload: InvestigationStartRequest, db: Session = Depends(get_db)) -> InvestigationResultOut:
    return run_full_investigation(payload, db)


@router.get("/{evidence_id}/investigation", response_model=InvestigationResultOut)
def get_case_investigation(evidence_id: str, db: Session = Depends(get_db)) -> InvestigationResultOut:
    case = _get_case_or_404(db, evidence_id)
    # If case has no evidence records yet, run investigation with default target
    req = InvestigationStartRequest(
        case_name=f"Case {case.evidence_id}",
        evidence_id=case.evidence_id,
        actor_name=case.actor_name,
        target=case.target_url or case.onion_url or "185.220.101.42",
        target_type=case.target_type or "onion",
        known_pgp=case.pgp_fingerprint,
        known_btc=case.btc_root,
    )
    return run_full_investigation(req, db)


@router.post("", response_model=CaseOut, status_code=201)
def create_case(payload: CaseCreate, db: Session = Depends(get_db)) -> Case:
    existing = db.execute(select(Case).where(Case.evidence_id == payload.evidence_id)).scalar_one_or_none()
    if existing is not None:
        raise HTTPException(status_code=409, detail=f"Case '{payload.evidence_id}' already exists")

    case = Case(**payload.model_dump())
    db.add(case)
    db.commit()
    db.refresh(case)
    return case


@router.get("/{evidence_id}", response_model=CaseOut)
def get_case(evidence_id: str, db: Session = Depends(get_db)) -> Case:
    return _get_case_or_404(db, evidence_id)



@router.post("/{evidence_id}/custody", response_model=CustodyEntryOut, status_code=201)
def add_custody_entry(evidence_id: str, payload: CustodyEntryCreate, db: Session = Depends(get_db)) -> CustodyRow:
    case = _get_case_or_404(db, evidence_id)

    prev_hash = case.custody[-1].entry_hash if case.custody else GENESIS_HASH
    next_seq = (case.custody[-1].seq + 1) if case.custody else 1
    timestamp = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")

    entry = CustodyEntry(seq=next_seq, timestamp=timestamp, actor=payload.actor, action=payload.action, prev_hash=prev_hash)

    row = CustodyRow(
        case_id=case.id, seq=entry.seq, timestamp=entry.timestamp,
        actor=entry.actor, action=entry.action, prev_hash=entry.prev_hash, entry_hash=entry.entry_hash,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


@router.get("/{evidence_id}/verify", response_model=VerifyResult)
def verify_custody_chain(evidence_id: str, db: Session = Depends(get_db)) -> VerifyResult:
    case = _get_case_or_404(db, evidence_id)
    rows = [
        {"seq": r.seq, "timestamp": r.timestamp, "actor": r.actor, "action": r.action,
         "prev_hash": r.prev_hash, "entry_hash": r.entry_hash}
        for r in case.custody
    ]
    chain = CustodyChain.from_rows(rows)
    valid, broken_at = chain.verify()
    return VerifyResult(valid=valid, broken_at_seq=broken_at, entry_count=len(chain.entries), seal=chain.seal())
