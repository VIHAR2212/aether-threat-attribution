from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class CaseCreate(BaseModel):
    evidence_id: str = Field(min_length=1, max_length=32)
    actor_name: str = Field(min_length=1, max_length=128)
    aliases: list[str] = Field(default_factory=list)
    origin_ip: str = ""
    geo: str = ""
    asn: str = ""
    pgp_fingerprint: str = ""
    btc_root: str = ""
    confidence: float = 0.0
    onion_url: str = ""
    target_url: str = ""
    target_type: str = "domain"


class CustodyEntryCreate(BaseModel):
    actor: str = Field(min_length=1, max_length=128)
    action: str = Field(min_length=1)


class CustodyEntryOut(BaseModel):
    seq: int
    timestamp: str
    actor: str
    action: str
    prev_hash: str
    entry_hash: str

    model_config = ConfigDict(from_attributes=True)


class EvidenceCreate(BaseModel):
    evidence_type: str = Field(..., description="ORIGIN_IP, PGP_KEY, BTC_WALLET, FAVICON_HASH, TLS_JARM, STYLOMETRY, etc.")
    title: str = Field(..., max_length=256)
    raw_value: str
    normalized_hash: str = ""
    confidence: float = Field(1.0, ge=0.0, le=1.0)
    provenance: str = Field("DEMO_DATA", description="LIVE_SOURCE, DEMO_DATA, STATIC_OSINT, SOURCE_UNAVAILABLE")
    source_reference: str = ""
    metadata_json: dict = Field(default_factory=dict)


class EvidenceOut(BaseModel):
    id: int
    case_id: int
    evidence_type: str
    title: str
    raw_value: str
    normalized_hash: str
    confidence: float
    provenance: str
    source_reference: str
    metadata_json: dict
    created_at: datetime | str | None = None

    model_config = ConfigDict(from_attributes=True)


class EvidenceCorrelationOut(BaseModel):
    id: int
    case_id: int
    source_node: str
    target_node: str
    relationship_type: str
    weight: float
    deterministic: int
    notes: str

    model_config = ConfigDict(from_attributes=True)


class AuditLogOut(BaseModel):
    id: int
    timestamp: str
    operator: str
    action: str
    details: dict

    model_config = ConfigDict(from_attributes=True)


class CaseOut(BaseModel):
    evidence_id: str
    actor_name: str
    aliases: list[str]
    origin_ip: str
    geo: str
    asn: str
    pgp_fingerprint: str
    btc_root: str
    confidence: float
    onion_url: str
    target_url: str = ""
    target_type: str = "domain"
    status: str = "ACTIVE"
    custody: list[CustodyEntryOut] = Field(default_factory=list)
    evidence_records: list[EvidenceOut] = Field(default_factory=list)
    correlations: list[EvidenceCorrelationOut] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)


class CaseListItem(BaseModel):
    id: int
    evidence_id: str
    actor_name: str
    target_url: str = ""
    target_type: str = "domain"
    confidence: float = 0.0
    status: str = "ACTIVE"
    created_at: str | None = None
    evidence_count: int = 0
    custody_count: int = 0

    model_config = ConfigDict(from_attributes=True)


class InvestigationStartRequest(BaseModel):
    case_name: str = Field(..., min_length=2, max_length=64, description="Human reference, e.g. Operation Chimera")
    evidence_id: str | None = Field(None, max_length=32, description="Case ID, e.g. AT-2026-0048")
    actor_name: str = Field("UNC-3844", max_length=128)
    target: str = Field(..., min_length=3, max_length=512, description="Domain, IP, URL, or onion descriptor")
    target_type: str = Field("domain", description="domain, ip, onion, btc, pgp")
    known_pgp: str | None = None
    known_btc: str | None = None
    text_sample: str | None = None
    mode: str = Field("auto", description="'live' (authorized public only), 'demo' (synthetic benchmark), 'auto'")


class InvestigationResultOut(BaseModel):
    case: CaseOut
    attribution: dict
    graph: dict
    diurnal: dict
    stylometry: dict
    custody_verification: dict
    provenance_summary: dict
    timeline: list[dict] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)


class VerifyResult(BaseModel):
    valid: bool
    broken_at_seq: int | None
    entry_count: int
    seal: str


