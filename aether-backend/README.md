# AETHER Backend — Stage 1

FastAPI + PostgreSQL service backing Project AETHER. This stage delivers:

- **Case storage** (PostgreSQL via SQLAlchemy)
- **Tamper-evident chain of custody**: a real SHA-256 hash chain (`app/services/custody.py`), not a static "Verified" label. Editing or deleting any past entry breaks verification.
- **Server-side STIX 2.1 export**, built with the official `stix2` SDK, which validates every object against the spec on construction.
- **Server-side CSV export**, RFC 4180 quoted, with spreadsheet formula-injection defused.

## What changed from the original slide, and why

| Slide item | What this stage does instead | Why |
|---|---|---|
| Apache Spark for BTC peel-chain clustering | Plain Python clustering (coming in a later stage) | A root-address cluster for a demo case is a few dozen lines of Python. Standing up a Spark cluster adds real operational risk (another JVM service to keep alive during judging) for no visible difference in the demo. |
| Siamese RoBERTa + Hugging Face Transformers + ONNX Runtime | A smaller PyTorch model, trained on a labelled synthetic corpus (coming in a later stage) | Two short forum posts are not enough text for a transformer to reliably beat n-gram cosine similarity, and a full HF+ONNX export/serve pipeline is two deployment paths for a feature that already works. The result will be labelled as a small trained model, not oversold as production NLP. |

Everything else on the slide — FastAPI, PostgreSQL, Neo4j, Elasticsearch, STIX 2.1 via the `stix2` SDK, Tor/SOCKS5, Shodan/Censys, mmh3, JARM — is being built as specified, in later stages.

## What's real vs simulated in this stage

- **Real**: the hash chain, the STIX bundle (spec-validated by the SDK), the CSV, the Postgres persistence, the FastAPI endpoints.
- **Simulated**: the actual case data you POST (origin IP, PGP fingerprint, BTC address) is demonstration data, same as the frontend. This stage does not yet perform real recon — that's a later stage, and it will only run against hosts you're authorized to test.

## Endpoints

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/health` | Liveness check |
| POST | `/api/cases` | Create a case |
| GET | `/api/cases/{evidence_id}` | Read a case with its full custody ledger |
| POST | `/api/cases/{evidence_id}/custody` | Append a custody entry (extends the hash chain) |
| GET | `/api/cases/{evidence_id}/verify` | Recompute and verify the hash chain; returns `valid`, `broken_at_seq`, and the digital seal |
| GET | `/api/cases/{evidence_id}/export/stix` | Download a STIX 2.1 bundle |
| GET | `/api/cases/{evidence_id}/export/csv` | Download the forensic CSV |

Interactive API docs: `http://localhost:8000/docs` once running.

## Run it

### With Docker (recommended)

From the repo root:

```bash
docker compose up --build
```

This starts PostgreSQL and the API. Once it's up:

```bash
./aether-backend/scripts/smoke_test.sh
```

That script hits the real running API — creates a case, appends custody entries, verifies the chain, and downloads both exports — and checks each response.

### Locally without Docker

```bash
cd aether-backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements-dev.txt
uvicorn app.main:app --reload
```

By default this uses a local SQLite file (`aether_dev.db`) instead of Postgres, so you can develop without Docker. Set `DATABASE_URL` to point at Postgres if you want parity with production.

## Tests

```bash
pip install -r requirements-dev.txt
pytest -q
```

26 tests, all against real code paths — no mocked business logic:
- `test_custody.py`: the hash chain itself, including tamper detection (edited entry, edited-and-rehashed entry, deleted entry)
- `test_export.py`: STIX bundle validity via `stix2.parse` (the official parser, not a hand check), CSV structure and formula-injection defusing
- `test_api.py`: real HTTP requests through FastAPI's `TestClient` against a real (in-memory) SQLite database, including a test that tampers with a row directly at the database layer and confirms `/verify` catches it

Run against the exact pinned dependency versions in `requirements.txt` before every delivery, not just against whatever happens to be installed.

## Not yet built (later stages)

1. Neo4j knowledge graph
2. Elasticsearch indexing and search
3. Stylometry model (PyTorch, small trained model)
4. Tor/SOCKS5 + Shodan/Censys recon client (clearnet-authorized targets only)
5. Frontend wiring: `index.html` calling this API, falling back to its built-in demo data if the API is unreachable
