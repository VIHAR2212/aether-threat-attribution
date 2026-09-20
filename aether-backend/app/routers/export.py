from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import PlainTextResponse, Response
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db import get_db
from app.models import Case
from app.services.custody import CustodyChain
from app.services.export import build_csv, build_stix_bundle

router = APIRouter(prefix="/api/cases", tags=["export"])


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
def export_stix(evidence_id: str, db: Session = Depends(get_db)) -> Response:
    case = db.execute(select(Case).where(Case.evidence_id == evidence_id)).scalar_one_or_none()
    if case is None:
        raise HTTPException(status_code=404, detail=f"No case with evidence_id '{evidence_id}'")

    bundle = build_stix_bundle(_case_dict_for_export(case))
    filename = f"aether_stix_bundle_{case.evidence_id}.json"
    return Response(
        content=bundle.serialize(pretty=True),
        media_type="application/json",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("/{evidence_id}/export/csv")
def export_csv(evidence_id: str, db: Session = Depends(get_db)) -> Response:
    case = db.execute(select(Case).where(Case.evidence_id == evidence_id)).scalar_one_or_none()
    if case is None:
        raise HTTPException(status_code=404, detail=f"No case with evidence_id '{evidence_id}'")

    csv_text = build_csv(_case_dict_for_export(case))
    filename = "aether_attribution_matrix.csv"
    return PlainTextResponse(
        content=csv_text,
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
