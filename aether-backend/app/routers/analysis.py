"""FastAPI router for analytical engines in Project AETHER.

Exposes endpoints for stylometry NLP, diurnal timezone inference,
Bitcoin peel clustering, entity knowledge graph generation, and calibrated
confidence scoring.
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional
from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.services.diurnal import analyze_diurnal_activity
from app.services.graph import (
    build_default_case_graph,
    cluster_bitcoin_transactions,
)
from app.services.scoring import calculate_calibrated_confidence
from app.services.stylometry import analyze_stylometry

router = APIRouter(prefix="/api/analysis", tags=["analysis"])


# ---------- Request & Response Schemas ---------- #

class StylometryRequest(BaseModel):
    text_a: str = Field(..., description="First text sample (e.g. forum post on Dread)")
    text_b: str = Field(..., description="Second text sample (e.g. forum post on Exploit.in)")


class DiurnalRequest(BaseModel):
    timestamps: List[str] = Field(..., description="List of ISO 8601 UTC timestamps")
    window_size: int = Field(6, ge=4, le=10, description="Sliding sleep trough window in hours")


class GraphRequest(BaseModel):
    evidence_id: Optional[str] = Field("AT-2026-0047", description="Evidence case identifier")
    case_data: Optional[Dict[str, Any]] = Field(None, description="Optional custom case parameters")


class BtcClusterRequest(BaseModel):
    transactions: List[Dict[str, Any]] = Field(..., description="List of transaction dictionaries with inputs and outputs")


class ScoreRequest(BaseModel):
    deterministic_signals: Dict[str, float] = Field(
        default_factory=lambda: {"pgp_match": 1.0, "origin_ip_match": 0.95, "btc_cluster_match": 0.88}
    )
    probabilistic_signals: Dict[str, float] = Field(
        default_factory=lambda: {"stylometry_similarity": 0.87, "diurnal_consistency": 0.82}
    )
    contradictions: Optional[List[Dict[str, Any]]] = Field(default_factory=list)


# ---------- Endpoints ---------- #

@router.post("/stylometry")
def compare_stylometry(payload: StylometryRequest) -> Dict[str, Any]:
    """Compare two text samples using token/char n-gram cosine similarity and lexical metrics."""
    return analyze_stylometry(payload.text_a, payload.text_b)


@router.post("/diurnal")
def evaluate_diurnal(payload: DiurnalRequest) -> Dict[str, Any]:
    """Analyze activity timestamps to identify sleep trough and estimate operational UTC timezone."""
    return analyze_diurnal_activity(payload.timestamps, window_size=payload.window_size)


@router.post("/graph")
def get_entity_graph(payload: GraphRequest) -> Dict[str, Any]:
    """Generate entity relationship graph and Neo4j Cypher statements."""
    data = payload.case_data or {}
    if "evidence_id" not in data and payload.evidence_id:
        data["evidence_id"] = payload.evidence_id
    graph = build_default_case_graph(data if data else None)
    result = graph.to_dict()
    result["cypher_statements"] = graph.to_cypher()
    return result


@router.post("/btc-cluster")
def cluster_bitcoin(payload: BtcClusterRequest) -> Dict[str, Any]:
    """Execute multi-input peel-chain heuristic clustering on transaction inputs."""
    return cluster_bitcoin_transactions(payload.transactions)


@router.post("/score")
def compute_attribution_score(payload: ScoreRequest) -> Dict[str, Any]:
    """Calculate calibrated confidence score (C_attr) with contradiction deductions."""
    return calculate_calibrated_confidence(
        deterministic_signals=payload.deterministic_signals,
        probabilistic_signals=payload.probabilistic_signals,
        contradictions=payload.contradictions,
    )
