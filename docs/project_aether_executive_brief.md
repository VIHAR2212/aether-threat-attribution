# Project AETHER — Quick Reference Brief
**Problem Statement ID:** 26151 (NTRO / Smart India Hackathon 2026)  
**Theme:** Dark Web Threat Actor De-Anonymization

---

## 1. The Problem
* Threat actors operate ransomware syndicates and darknet markets behind Tor hidden services (`.onion`), rotating usernames across forums, and using crypto to hide their tracks.
* Breaking Tor's encryption mathematically is computationally impossible.
* Investigators face slow, fragmented manual hunting that produces weak, unverified leads inadmissible in court.

---

## 2. Our Approach & Solution
We bypass Tor cryptography by targeting operational security (OpSec) blunders, reputation reuse, and subconscious human habits:

1. **Origin Infrastructure Unmasking:** Extracts favicon MurmurHash3 (`mmh3`), JARM TLS fingerprints, and Apache `/server-status` leaks to query Shodan/Censys and find the true clearnet hosting IP.
2. **Deterministic Identity Resolution:** Uses 40-character PGP public keys and multi-input Bitcoin transaction clustering to prove that separate market aliases belong to the same entity.
3. **AI Profiling & Attribution:** Employs NLP stylometry (token embedding cosine similarity) to identify syntax habits and diurnal activity modeling (sleep troughs) to establish the suspect's operational UTC timezone.
4. **Calibrated Confidence Scoring ($C_{attr}$):** Separates deterministic mathematical facts (PGP, IP) from probabilistic AI leads, applying contradiction penalties to avoid false accusations.

---

## 3. Main Output
* **Unmasked Origin IP:** Concrete clearnet IP and hosting provider (ISP/ASN) for immediate server takedown or ISP subpoena.
* **Unified Actor Dossier:** Single de-anonymized identity linking all aliases, PGP fingerprints, and wallet cash-out nodes.
* **Court-Ready Evidence Package:**
  * Machine-readable **OASIS STIX 2.1 JSON** bundle for NTRO/CERT-In SOC ingestion.
  * Structured **Attribution CSV** matrix for audit logs.
  * SHA-256 sealed **Statutory Evidence PDF** for judicial submission.

---

## 4. Current Build Status

| Layer | Status | Built Components | Remaining Work |
| :--- | :--- | :--- | :--- |
| **Frontend** | **Completed** | Full 3-stage UI (`index.html`): Recon terminal, SVG knowledge graph, stylometry comparison, diurnal sleep clock, and court export triggers. | Wire API fetch calls to backend endpoints. |
| **Backend** | **Stage 1 Done** | FastAPI + PostgreSQL API for case management, SHA-256 tamper-evident custody chain with verification, STIX/CSV generators, and 26 passing tests. | Run & verify Docker Compose setup. |
| **Integrations** | **Pending** | Basic structure defined in architecture plan. | Connect Neo4j graph queries, standalone PyTorch model, and live Tor SOCKS5 crawler client. |