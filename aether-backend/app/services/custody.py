"""
Tamper-evident chain of custody.

Each ledger entry is hashed together with the hash of the entry before it
(a Merkle-style hash chain, the same idea git commits and blockchains use).
Changing, reordering, or deleting any past entry breaks every hash after it,
so verification is a single linear walk that either matches or doesn't.

This is real cryptography (hashlib.sha256), not a cosmetic "Verified" tag.
"""
from __future__ import annotations

import hashlib
import json
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Optional

GENESIS_HASH = "0" * 64


def _canonical(obj: dict) -> bytes:
    """Deterministic JSON encoding so the same entry always hashes the same way."""
    return json.dumps(obj, sort_keys=True, separators=(",", ":")).encode("utf-8")


@dataclass
class CustodyEntry:
    seq: int
    timestamp: str
    actor: str
    action: str
    prev_hash: str
    entry_hash: str = field(init=False)

    def __post_init__(self) -> None:
        payload = {
            "seq": self.seq,
            "timestamp": self.timestamp,
            "actor": self.actor,
            "action": self.action,
            "prev_hash": self.prev_hash,
        }
        self.entry_hash = hashlib.sha256(_canonical(payload)).hexdigest()

    def to_dict(self) -> dict:
        return {
            "seq": self.seq,
            "timestamp": self.timestamp,
            "actor": self.actor,
            "action": self.action,
            "prev_hash": self.prev_hash,
            "entry_hash": self.entry_hash,
        }


class CustodyChain:
    """In-memory hash chain builder. The API layer persists entries to Postgres
    and rebuilds / verifies this chain from the stored rows."""

    def __init__(self) -> None:
        self.entries: list[CustodyEntry] = []

    def append(self, actor: str, action: str, timestamp: Optional[str] = None) -> CustodyEntry:
        prev_hash = self.entries[-1].entry_hash if self.entries else GENESIS_HASH
        entry = CustodyEntry(
            seq=len(self.entries) + 1,
            timestamp=timestamp or datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
            actor=actor,
            action=action,
            prev_hash=prev_hash,
        )
        self.entries.append(entry)
        return entry

    def verify(self) -> tuple[bool, Optional[int]]:
        """Returns (is_valid, first_broken_seq_or_None)."""
        prev_hash = GENESIS_HASH
        for e in self.entries:
            if e.prev_hash != prev_hash:
                return False, e.seq
            recomputed = CustodyEntry(
                seq=e.seq, timestamp=e.timestamp, actor=e.actor, action=e.action, prev_hash=e.prev_hash
            ).entry_hash
            if recomputed != e.entry_hash:
                return False, e.seq
            prev_hash = e.entry_hash
        return True, None

    @classmethod
    def from_rows(cls, rows: list[dict]) -> "CustodyChain":
        """Rebuild a chain from stored rows (as read back from Postgres) without
        re-deriving hashes, so verify() can detect if a row was edited at rest."""
        chain = cls()
        for r in rows:
            e = CustodyEntry.__new__(CustodyEntry)
            e.seq = r["seq"]
            e.timestamp = r["timestamp"]
            e.actor = r["actor"]
            e.action = r["action"]
            e.prev_hash = r["prev_hash"]
            e.entry_hash = r["entry_hash"]  # stored hash, NOT recomputed here
            chain.entries.append(e)
        return chain

    def seal(self) -> str:
        """Digital hash seal over the entire chain: sha256 of the final entry's
        hash concatenated with the chain length. Placed on the dossier."""
        if not self.entries:
            return hashlib.sha256(GENESIS_HASH.encode()).hexdigest()
        tip = self.entries[-1].entry_hash
        return hashlib.sha256(f"{tip}:{len(self.entries)}".encode()).hexdigest()
