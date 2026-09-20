import copy

from app.services.custody import CustodyChain, GENESIS_HASH


def test_first_entry_links_to_genesis():
    chain = CustodyChain()
    e1 = chain.append("Analyst-01", "Target acquired")
    assert e1.prev_hash == GENESIS_HASH
    assert len(e1.entry_hash) == 64  # sha256 hex digest length


def test_chain_links_sequentially():
    chain = CustodyChain()
    e1 = chain.append("Analyst-01", "Step one")
    e2 = chain.append("Analyst-01", "Step two")
    e3 = chain.append("Analyst-02", "Step three")
    assert e2.prev_hash == e1.entry_hash
    assert e3.prev_hash == e2.entry_hash


def test_valid_chain_verifies():
    chain = CustodyChain()
    for i in range(7):
        chain.append(f"Actor-{i}", f"Action {i}")
    ok, broken_at = chain.verify()
    assert ok is True
    assert broken_at is None


def test_tampering_with_an_action_breaks_verification():
    chain = CustodyChain()
    for i in range(5):
        chain.append(f"Actor-{i}", f"Action {i}")

    rows = [e.to_dict() for e in chain.entries]
    tampered = copy.deepcopy(rows)
    tampered[2]["action"] = "Action 2 -- MALICIOUSLY EDITED"
    # entry_hash NOT recomputed, simulating someone editing the DB row directly

    rebuilt = CustodyChain.from_rows(tampered)
    ok, broken_at = rebuilt.verify()
    assert ok is False
    assert broken_at == 3  # seq is 1-indexed, entry 3 (index 2) was tampered


def test_tampering_and_rehashing_still_breaks_downstream_chain():
    """Even if an attacker recomputes the hash for the row they edited, every
    entry after it still points to the old prev_hash, so the chain still breaks."""
    chain = CustodyChain()
    for i in range(5):
        chain.append(f"Actor-{i}", f"Action {i}")

    rows = [e.to_dict() for e in chain.entries]
    tampered = copy.deepcopy(rows)
    tampered[2]["action"] = "edited"
    from app.services.custody import CustodyEntry
    fixed = CustodyEntry(
        seq=tampered[2]["seq"], timestamp=tampered[2]["timestamp"],
        actor=tampered[2]["actor"], action=tampered[2]["action"], prev_hash=tampered[2]["prev_hash"],
    )
    tampered[2]["entry_hash"] = fixed.entry_hash  # attacker "fixes" this row's own hash

    rebuilt = CustodyChain.from_rows(tampered)
    ok, broken_at = rebuilt.verify()
    assert ok is False
    assert broken_at == 4  # entry 4 still references the OLD hash of entry 3


def test_deleting_an_entry_breaks_the_chain():
    chain = CustodyChain()
    for i in range(5):
        chain.append(f"Actor-{i}", f"Action {i}")
    rows = [e.to_dict() for e in chain.entries]
    rows.pop(2)  # delete the 3rd entry outright

    rebuilt = CustodyChain.from_rows(rows)
    ok, broken_at = rebuilt.verify()
    assert ok is False


def test_seal_changes_when_chain_changes():
    chain_a = CustodyChain()
    chain_a.append("Analyst-01", "Step one")
    seal_a = chain_a.seal()

    chain_b = CustodyChain()
    chain_b.append("Analyst-01", "Step one (different wording)")
    seal_b = chain_b.seal()

    assert seal_a != seal_b
    assert len(seal_a) == 64


def test_seal_is_deterministic_for_identical_chains():
    def build():
        c = CustodyChain()
        c.append("Analyst-01", "Step one", timestamp="2026-01-01T00:00:00Z")
        c.append("Analyst-02", "Step two", timestamp="2026-01-01T00:05:00Z")
        return c

    assert build().seal() == build().seal()


def test_empty_chain_has_stable_seal():
    assert CustodyChain().seal() == CustodyChain().seal()
