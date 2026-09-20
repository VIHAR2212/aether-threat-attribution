"""Calibrated attribution confidence scoring service for Project AETHER.

Implements the forensic confidence calculation formula:
    C_attr = clamp(w_det * S_det + w_ai * S_ai - P_contradiction, 0.0, 1.0)

Separates deterministic mathematical cryptographic facts (PGP, IP unmasking,
BTC clustering) from probabilistic AI leads (stylometry, diurnal modeling),
and strictly penalizes evidentiary contradictions to prevent false accusations.
"""

from __future__ import annotations

from typing import Any, Dict, List


def calculate_calibrated_confidence(
    deterministic_signals: Dict[str, float],
    probabilistic_signals: Dict[str, float],
    contradictions: List[Dict[str, Any]] | None = None,
    weight_det: float = 0.70,
    weight_ai: float = 0.30,
) -> Dict[str, Any]:
    """Calculate calibrated attribution confidence score (C_attr).

    Args:
        deterministic_signals: Dict containing:
            - 'pgp_match': float in [0.0, 1.0] (default weight 0.40)
            - 'origin_ip_match': float in [0.0, 1.0] (default weight 0.35)
            - 'btc_cluster_match': float in [0.0, 1.0] (default weight 0.25)
        probabilistic_signals: Dict containing:
            - 'stylometry_similarity': float in [0.0, 1.0] (default weight 0.60)
            - 'diurnal_consistency': float in [0.0, 1.0] (default weight 0.40)
        contradictions: List of dicts with 'name' and 'penalty' (e.g. 0.20, 0.40)
        weight_det: Overall weighting factor for deterministic proofs (default 0.70)
        weight_ai: Overall weighting factor for AI profiling (default 0.30)
    """
    # 1. Deterministic Sub-score (S_det)
    pgp_val = min(1.0, max(0.0, deterministic_signals.get("pgp_match", 0.0)))
    ip_val = min(1.0, max(0.0, deterministic_signals.get("origin_ip_match", 0.0)))
    btc_val = min(1.0, max(0.0, deterministic_signals.get("btc_cluster_match", 0.0)))

    s_det = round((0.40 * pgp_val) + (0.35 * ip_val) + (0.25 * btc_val), 4)

    # 2. Probabilistic Sub-score (S_ai)
    stylo_val = min(1.0, max(0.0, probabilistic_signals.get("stylometry_similarity", 0.0)))
    diurnal_val = min(1.0, max(0.0, probabilistic_signals.get("diurnal_consistency", 0.0)))

    s_ai = round((0.60 * stylo_val) + (0.40 * diurnal_val), 4)

    # 3. Contradiction Penalties (P_contradiction)
    penalties_list = contradictions or []
    total_penalty = round(sum(p.get("penalty", 0.0) for p in penalties_list), 4)

    # 4. Final Calibrated Attribution Confidence (C_attr)
    raw_score = (weight_det * s_det) + (weight_ai * s_ai) - total_penalty
    c_attr = round(min(1.0, max(0.0, raw_score)), 4)

    # Determine confidence category
    if total_penalty >= 0.35 and c_attr < 0.50:
        tier = "CONTRADICTION DETECTED - EVIDENCE CONFLICT"
    elif c_attr >= 0.90:
        tier = "DEFINITIVE JUDICIAL ATTRIBUTION"
    elif c_attr >= 0.75:
        tier = "HIGH FORENSIC CONFIDENCE"
    elif c_attr >= 0.50:
        tier = "MODERATE INVESTIGATIVE LEAD"
    else:
        tier = "INCONCLUSIVE / INSUFFICIENT EVIDENCE"

    return {
        "confidence_score": c_attr,
        "confidence_tier": tier,
        "breakdown": {
            "s_det": s_det,
            "s_ai": s_ai,
            "weight_det": weight_det,
            "weight_ai": weight_ai,
            "total_penalty": total_penalty,
            "deterministic_inputs": {
                "pgp_match": pgp_val,
                "origin_ip_match": ip_val,
                "btc_cluster_match": btc_val,
            },
            "probabilistic_inputs": {
                "stylometry_similarity": stylo_val,
                "diurnal_consistency": diurnal_val,
            },
            "contradiction_penalties": penalties_list,
        },
    }
