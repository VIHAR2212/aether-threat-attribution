from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import PlainTextResponse, Response
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db import get_db
from app.models import Case
from app.schemas import EVIDENCE_ID_PATTERN
from app.security import InvestigatorPrincipal, record_audit_log, verify_investigator_auth
from app.services.custody import CustodyChain
from app.services.export import build_csv, build_stix_bundle

router = APIRouter(prefix="/api/cases", tags=["export"])


def _validate_evidence_id(evidence_id: str) -> str:
    cleaned = evidence_id.strip()
    if not EVIDENCE_ID_PATTERN.match(cleaned):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid evidence_id format for export.",
        )
    return cleaned


def _case_dict_for_export(case: Case) -> dict:
    rows = [
        {"seq": r.seq, "timestamp": r.timestamp, "actor": r.actor, "action": r.action,
         "prev_hash": r.prev_hash, "entry_hash": r.entry_hash}
        for r in case.custody
    ]
    seal = CustodyChain.from_rows(rows).seal()
    return {
        "evidence_id": case.evidence_id,
        "actor_name": case.actor_name,
        "aliases": case.aliases or [],
        "origin_ip": case.origin_ip,
        "geo": case.geo,
        "asn": case.asn,
        "pgp_fingerprint": case.pgp_fingerprint,
        "btc_root": case.btc_root,
        "confidence": case.confidence,
        "seal_hash": seal,
    }


@router.get("/{evidence_id}/export/stix")
def export_stix(
    evidence_id: str,
    db: Session = Depends(get_db),
    principal: InvestigatorPrincipal = Depends(verify_investigator_auth),
) -> Response:
    valid_id = _validate_evidence_id(evidence_id)
    case = db.execute(select(Case).where(Case.evidence_id == valid_id)).scalar_one_or_none()
    if case is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"No case with evidence_id '{evidence_id}'")

    bundle = build_stix_bundle(_case_dict_for_export(case))
    filename = f"aether_stix_bundle_{case.evidence_id}.json"

    record_audit_log(
        db=db,
        operator=principal.operator,
        action="EXPORT_STIX_2_1",
        case_id=case.id,
        details={"evidence_id": case.evidence_id, "filename": filename},
    )

    return Response(
        content=bundle.serialize(pretty=True),
        media_type="application/json",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("/{evidence_id}/export/csv")
def export_csv(
    evidence_id: str,
    db: Session = Depends(get_db),
    principal: InvestigatorPrincipal = Depends(verify_investigator_auth),
) -> Response:
    valid_id = _validate_evidence_id(evidence_id)
    case = db.execute(select(Case).where(Case.evidence_id == valid_id)).scalar_one_or_none()
    if case is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"No case with evidence_id '{evidence_id}'")

    csv_text = build_csv(_case_dict_for_export(case))
    filename = f"aether_attribution_matrix_{case.evidence_id}.csv"

    record_audit_log(
        db=db,
        operator=principal.operator,
        action="EXPORT_FORENSIC_CSV",
        case_id=case.id,
        details={"evidence_id": case.evidence_id, "filename": filename},
    )

    return PlainTextResponse(
        content=csv_text,
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
