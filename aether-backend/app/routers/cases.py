from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db import get_db
from app.models import Case, CustodyRow
from app.schemas import CaseCreate, CaseOut, CustodyEntryCreate, CustodyEntryOut, VerifyResult
from app.services.custody import GENESIS_HASH, CustodyChain, CustodyEntry

router = APIRouter(prefix="/api/cases", tags=["cases"])


def _get_case_or_404(db: Session, evidence_id: str) -> Case:
    case = db.execute(select(Case).where(Case.evidence_id == evidence_id)).scalar_one_or_none()
    if case is None:
        raise HTTPException(status_code=404, detail=f"No case with evidence_id '{evidence_id}'")
    return case


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
