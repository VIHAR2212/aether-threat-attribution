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
    custody: list[CustodyEntryOut]

    model_config = ConfigDict(from_attributes=True)


class VerifyResult(BaseModel):
    valid: bool
    broken_at_seq: int | None
    entry_count: int
    seal: str
