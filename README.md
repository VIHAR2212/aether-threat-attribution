# AETHER

**Dark Web Threat Actor De-Anonymization**
Smart India Hackathon 2026 / Problem Statement 26151 / NTRO

This project consists of:

1. **`aether-frontend/`** — Next.js 15+ (App Router) + Tailwind CSS application. Features exact 1-to-1 visual fidelity, 0px border-radius, industrial dark steel palette, 3D stacked anchor cards, interactive circadian timeline, and live FastAPI wiring with zero-crash client-side fallbacks.
2. **`index.html`** — a zero-dependency, single-file frontend prototype.
3. **`aether-backend/`** — FastAPI + PostgreSQL backend with a real SHA-256 tamper-evident custody chain, server-side STIX 2.1 / CSV export, stylometry cosine engine, diurnal timezone engine, and Bitcoin peel clustering. See `aether-backend/README.md`.

## Design constraints (frontend)

- Palette: `#000000`, `#ffffff`, `#f8fafc`, `#e2e8f0`, `#0f172a` only
- Geometry: `border-radius: 0` everywhere, 1px solid borders
- Typography: system monospace and sans-serif
- Delivery: one standalone `index.html`

## Build status

| Stage | Module | Status |
|---|---|---|
| 00 | Frontend scaffold, design system, stage navigation | Complete |
| 01 | Frontend: Dark Web Recon and Origin Discovery (simulated) | Complete |
| 02 | Frontend: correlation graph, stylometry lab, diurnal engine | Complete |
| 03 | Frontend: evidence dossier, client-side STIX 2.1 / CSV export, court PDF | Complete |
| B1 | Backend: FastAPI + PostgreSQL, real tamper-evident custody chain, server-side STIX 2.1 / CSV | Complete |
| B2 | Backend: Knowledge graph (Cypher generator & BTC peel clustering) | Complete |
| B3 | Backend: Elasticsearch indexing and search | Pending |
| B4 | Backend: Stylometry NLP engine (Token/n-gram vectorizer & cosine similarity) | Complete |
| B5 | Backend: Tor/SOCKS5 + Shodan/Censys recon client (authorized targets only) | Pending |
| B6 | Frontend wired to the live backend | Complete (Auto-detecting FastAPI gateway with zero-failure fallback) |

## Deviations from the original technology-stack slide

Two components were deliberately substituted. Everything else on the slide (FastAPI, PostgreSQL, Neo4j, Elasticsearch, STIX 2.1 via the official `stix2` SDK, Tor/SOCKS5, Shodan, Censys, mmh3, JARM) is being built as specified.

| Slide item | Built instead | Why |
|---|---|---|
| Apache Spark (BTC peel-chain clustering) | Plain Python clustering | A single root-address cluster for a demo case doesn't need a distributed compute engine. Spark adds a JVM service that can fail independently during judging, for no visible difference in the demo output. |
| Siamese RoBERTa + Hugging Face Transformers + ONNX Runtime | A smaller PyTorch model trained on a labelled synthetic corpus | Two short forum posts are too little text for a transformer to reliably outperform n-gram cosine similarity. A full train/export/serve pipeline (HF -> ONNX) is two deployment paths for a feature that already works client-side. The result is labelled as a small trained model, not presented as production-grade NLP. |

Full detail in `aether-backend/README.md`.

## Run locally

**Next.js Frontend (recommended)**:

```bash
cd aether-frontend
npm install
npm run dev
# Live on http://localhost:3000
```

**FastAPI Backend**:

```bash
cd aether-backend
python -m uvicorn app.main:app --port 8000
# API on http://localhost:8000, Swagger docs at http://localhost:8000/docs
```

**Full stack via Docker Compose**:

```bash
docker compose up --build
./aether-backend/scripts/smoke_test.sh
```

## Repository layout

```
aether-threat-attribution/
  aether-frontend/     Next.js + Tailwind CSS application (port 3000)
  aether-backend/      FastAPI backend with analysis & custody engines (port 8000)
  index.html           Standalone single-file frontend fallback
  docker-compose.yml   PostgreSQL + API services
  docs/
    project_aether_executive_brief.md   Quick Reference Brief for SIH 2026 PS 26151
  README.md
  .gitignore
```

## Notice

All indicators, hashes, IP addresses, handles and case identifiers in this project are simulated demonstration data. No live network activity is performed.
