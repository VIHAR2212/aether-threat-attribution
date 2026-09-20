"""
STIX 2.1 + CSV export using the official OASIS `stix2` Python SDK.

The SDK validates every object on construction (required properties, id format,
timestamp format, reference types), so a bundle built here is spec-valid by
construction rather than by hand-rolled JSON.
"""
from __future__ import annotations

import csv
import io
from datetime import datetime, timezone

import stix2


def _now() -> datetime:
    return datetime.now(timezone.utc)


def build_stix_bundle(case: dict) -> stix2.Bundle:
    """case keys: evidence_id, actor_name, aliases, origin_ip, geo, asn,
    pgp_fingerprint, btc_root, confidence, seal_hash"""
    ts = _now()

    identity = stix2.Identity(
        name="AETHER Forensic Attribution Workbench",
        identity_class="system",
        description=f"Producer of this bundle. Case {case['evidence_id']}.",
        created=ts, modified=ts,
    )

    actor = stix2.ThreatActor(
        name=case["actor_name"],
        description=f"Suspected actor operating under aliases: {', '.join(case['aliases'])}.",
        threat_actor_types=["criminal"],
        aliases=case["aliases"],
        confidence=int(round(case["confidence"])),
        created_by_ref=identity.id,
        external_references=[
            stix2.ExternalReference(source_name="aether-evidence-id", external_id=case["evidence_id"]),
            stix2.ExternalReference(source_name="sha256-seal", description=case["seal_hash"]),
        ],
        created=ts, modified=ts,
    )

    ip_sco = stix2.IPv4Address(value=case["origin_ip"])

    ind_ip = stix2.Indicator(
        name="Recovered origin IP of dark web market",
        description=f"Origin clearnet IP. {case['geo']}, {case['asn']}.",
        indicator_types=["attribution"],
        pattern=f"[ipv4-addr:value = '{case['origin_ip']}']",
        pattern_type="stix",
        valid_from=ts,
        confidence=95,
        created_by_ref=identity.id,
        created=ts, modified=ts,
    )

    ind_pgp = stix2.Indicator(
        name="PGP key fingerprint linked to actor",
        description="40 character PGP fingerprint reused across forum profiles.",
        indicator_types=["attribution"],
        pattern=f"[x509-certificate:hashes.'SHA-1' = '{case['pgp_fingerprint']}']",
        pattern_type="stix",
        valid_from=ts,
        confidence=90,
        created_by_ref=identity.id,
        created=ts, modified=ts,
    )

    ind_btc = stix2.Indicator(
        name="Bitcoin peel-chain root address",
        description="Root of a co-spent peel-chain cluster.",
        indicator_types=["attribution"],
        pattern=f"[user-account:account_login = '{case['btc_root']}']",
        pattern_type="stix",
        valid_from=ts,
        confidence=85,
        created_by_ref=identity.id,
        created=ts, modified=ts,
    )

    def rel(src, rtype, tgt, note):
        return stix2.Relationship(
            relationship_type=rtype, source_ref=src.id, target_ref=tgt.id,
            description=note, created_by_ref=identity.id, created=ts, modified=ts,
        )

    relationships = [
        rel(ind_ip, "indicates", actor, "Origin IP indicates actor infrastructure."),
        rel(ind_pgp, "indicates", actor, "PGP fingerprint indicates actor."),
        rel(ind_btc, "indicates", actor, "BTC cluster indicates actor."),
    ]

    report = stix2.Report(
        name=f"Attribution Report {case['evidence_id']}",
        description=f"Calibrated confidence {case['confidence']}%.",
        report_types=["attribution", "threat-actor"],
        published=ts,
        object_refs=[actor.id, ind_ip.id, ind_pgp.id, ind_btc.id, ip_sco.id],
        created_by_ref=identity.id,
        created=ts, modified=ts,
    )

    return stix2.Bundle(
        objects=[identity, actor, ip_sco, ind_ip, ind_pgp, ind_btc, *relationships, report],
        allow_custom=False,
    )


def _defuse(cell: str) -> str:
    """Defuse spreadsheet formula injection (=, +, -, @, tab, CR at cell start)."""
    s = "" if cell is None else str(cell)
    if s and s[0] in ("=", "+", "-", "@", "\t", "\r"):
        return "'" + s
    return s


def build_csv(case: dict, extra_rows: list[list[str]] | None = None) -> str:
    header = ["entity_type", "entity_value", "description", "source_stage", "confidence"]
    rows = [
        ["evidence_id", case["evidence_id"], "Case reference", "case", ""],
        ["threat_actor", case["actor_name"], "Suspected actor cluster", "stage_2", f"{case['confidence']}%"],
        *[["alias", a, "Forum alias", "stage_2", ""] for a in case["aliases"]],
        ["ipv4", case["origin_ip"], f"Discovered origin IP, {case['geo']}", "stage_1", "95%"],
        ["asn", case["asn"], "Hosting provider of origin IP", "stage_1", ""],
        ["pgp_fingerprint", case["pgp_fingerprint"], "40 character PGP fingerprint", "stage_2", "90%"],
        ["btc_wallet", case["btc_root"], "Root of co-spent peel-chain cluster", "stage_2", "85%"],
        ["sha256_seal", case["seal_hash"], "Digital hash seal of custody chain", "stage_3", ""],
    ]
    if extra_rows:
        rows.extend(extra_rows)

    buf = io.StringIO()
    writer = csv.writer(buf, quoting=csv.QUOTE_ALL, lineterminator="\r\n")
    writer.writerow(header)
    for r in rows:
        writer.writerow([_defuse(c) for c in r])
    return "\ufeff" + buf.getvalue()
