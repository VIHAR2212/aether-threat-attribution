# AETHER

**Dark Web Threat Actor De-Anonymization**
Smart India Hackathon 2026 / Problem Statement 26151 / NTRO

A zero-dependency, single-file forensic attribution workbench. Open `index.html` in any modern browser. No npm, no build step, no server.

## Design constraints

- Palette: `#000000`, `#ffffff`, `#f8fafc`, `#e2e8f0`, `#0f172a` only
- Geometry: `border-radius: 0` everywhere, 1px solid borders
- Typography: system monospace and sans-serif
- Delivery: one standalone `index.html`

## Build status

| Stage | Module | Status |
|---|---|---|
| 00 | Scaffold, design system, stage navigation | Complete |
| 01 | Dark Web Recon and Origin Discovery | Pending |
| 02 | Correlation graph, stylometry lab, diurnal engine | Pending |
| 03 | Evidence dossier, STIX 2.1 and CSV export, court PDF | Pending |

## Run locally

Double-click `index.html`, or:

```bash
# optional: serve locally
python3 -m http.server 8080
# then open http://localhost:8080
```

## Repository layout

```
aether-threat-attribution/
  index.html    application (HTML, CSS, JS in one file)
  README.md
  .gitignore
```

## Notice

All indicators, hashes, IP addresses, handles and case identifiers in this project are simulated demonstration data. No live network activity is performed.
