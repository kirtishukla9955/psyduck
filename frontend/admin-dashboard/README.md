# DHARAA — Admin & Department Dashboard (P4 Module)

Part of **Project DHARAA (Land Stack)** &bull; *Smart India Hackathon 2026*  
Unified Parcel Reconciliation & Land Conflict Resolution Digital Public Infrastructure (DPI).

---

## 1. Overview & Purpose

This directory contains the **Admin & Department Dashboard** frontend module (P4) for DHARAA. It provides nodal revenue officers, district administrators, and state/national policymakers with a unified interface to inspect, reconcile, and resolve inter-departmental land record anomalies across silos (Revenue Jamabandi, Registration/SRO Deeds, Cadastral GIS Surveys, and Urban ULB Planning).

### Key Features
- **Conflict Resolution Queue**: Real-time triage table tracking ULPIN discrepancies, SLA deadlines, multi-department silos, and resolution stages.
- **Role-Based Perspectives (RBAC)**:
  - **Nodal Officer**: Tailored queue displaying only cases assigned to the authenticated nodal field officer (`Harvinder Singh, Field Kanungo`), with statutory action triggers.
  - **District Admin**: Unfiltered multi-district queue with case reassignment modals to transfer ownership and update workflow stages.
  - **Decision Maker (Policymaker)**: Statewide macro telemetry focusing on regional anomaly hotspots (Chandigarh UT vs. Tamil Nadu) and departmental bottleneck latencies.
- **Resolution Stepper & Audit Dossier**: 4-stage pipeline (*Detected &rarr; Assigned &rarr; Field Review &rarr; Harmonized*) backed by an immutable cryptographically-chained DPI audit log.
- **Radial Trust Score Gauge**: Dynamic 0–100 parcel integrity metric reflecting multi-registry consensus.
- **Cadastral GIS Spatial Overlap Layer**: Interactive SVG boundary comparison rendering high-precision DGPS drone resurvey polygons against legacy registered deeds with togglable encroachment overlays.

---

## 2. Directory Structure

```
frontend/admin-dashboard/
├── index.html     # Semantic HTML5 layout, GovTech design system markup, modal structures
├── styles.css     # CSS custom properties (:root palette), responsive layouts, animations
├── app.js         # State machine, RBAC logic, table/stepper renderers, GIS/Trust gauge controllers
└── README.md      # Module technical documentation and quick start guide
```

---

## 3. How to Run

This is a pure static frontend module with **no build step, bundler, or package manager** required.

### Option A: Serve via Local HTTP Server (Recommended)
From inside this directory (`frontend/admin-dashboard/`):
```bash
# Using Python 3
python -m http.server 8000
```
Then visit [`http://localhost:8000`](http://localhost:8000) in any modern web browser.

### Option B: Open Directly
Double-click `index.html` or open it directly in Google Chrome, Microsoft Edge, Mozilla Firefox, or Safari (`file:///.../index.html`).

---

## 4. Current State & Backend API Seam

The module currently runs on a high-fidelity mock dataset (`mockConflicts` in `app.js`).

It includes an **API-ready seam** via the asynchronous function:
```javascript
// app.js
async function loadConflicts() {
    return Promise.resolve(mockConflicts);
}
```
To connect to the live DHARAA Land Trust Engine backend, replace the body of `loadConflicts()` with a REST/GraphQL fetch call:
```javascript
async function loadConflicts() {
    const res = await fetch('/api/v1/conflicts');
    return await res.json();
}
```

---

## 5. External Dependencies & Offline Resilience

- **Google Fonts**: `Inter` (UI typography) and `JetBrains Mono` (ULPIN codes and telemetry data), loaded in `index.html`.
- **Lucide Icons**: Loaded via unpkg CDN (`https://unpkg.com/lucide@latest`).
- **Offline / CDN-Blocked Fallback**: `app.js` includes a complete internal SVG icon dictionary (`fallbackSvgIcons`). If CDN connectivity is unavailable or firewalled, `renderIcons()` automatically injects inline SVGs with identical geometry so the dashboard renders with zero visual breakage.
