# DHARAA — Citizen Land Record & Transparency Portal (P3 Module)

Part of **Project DHARAA** ("Digital Hub for Aggregated Records and Administration") &bull; *Smart India Hackathon 2026*  
Unified Parcel Reconciliation & Land Conflict Resolution Digital Public Infrastructure (DPI) for Land Governance (Ministry of Rural Development / DoLR).

---

## 1. Overview & Purpose

This directory contains the completed **Citizen Portal** frontend module (P3) for DHARAA. It provides Indian citizens, landholders, prospective property buyers, and farmers with an unmissable, plain-language digital public interface designed to eliminate bureaucratic opacity:

- **12-Stage End-to-End Citizen Journey**: From public ULPIN inquiry and identity authentication (Aadhaar OTP / e-KYC simulation) to multi-registry consensus inspection, boundary GIS exploration, mutation SLA tracking, document checklist compliance, and service request filing.
- **4 Ownership Verification States**: Plain-language assessment across all statutory registers without legal intimidation:
  1. `VERIFIED` — 100% consensus across Revenue, SRO, Survey GIS, and ULB (e.g. Ramesh Kumar, 98/100).
  2. `PENDING` — Procedural review in progress at Taluk Tahsildar / VAO desk without adverse claims.
  3. `CONFLICT DETECTED` — Cross-departmental anomaly under statutory review featuring a **neutral 4-part explanation box** (What was detected, Inconsistent records, Current status, Citizen action required).
  4. `UNAVAILABLE` — Transitioning from legacy paper Jamabandi/Shajra to digital Property Cards under the national **SVAMITVA Scheme** (Rural Lal Dora / Abadi Deh).
- **Standardized 4-Stage Mutation Tracker**: Stepper nodes harmonized to:
  $$\text{1. Filed} \longrightarrow \text{2. Under Verification} \longrightarrow \text{3. Field Inspection} \longrightarrow \text{4. Approved / Rejected}$$
- **Days and Hours SLA Countdown**: Real-time statutory Right to Public Service Guarantee countdowns (`X Days Remaining`, `X Hours Remaining`, `SLA Overdue by Xd (Breached & Escalated)`).
- **Document & Statutory Compliance Checklist**: Received vs. pending status indicator for each statutory document required for mutation, with action buttons to submit affirmations or upload missing records.
- **Citizen Preferences & I18n Ready**: Language preferences (`en`, `hi`, `ta`) and SMS/WhatsApp statutory alert notification toggles.
- **Cadastral GIS Boundary Integration (P1 Seam)**: Swappable boundary adapter (`p1GisAdapter.js`) rendering surveyed boundaries, coordinate vertices, adjacent parcels, and red hatched encroachment overlays.

---

## 2. Directory Structure

```
frontend/citizen-portal/
├── index.html         # Semantic HTML5 layout, GovTech design system markup, 12-stage citizen views
├── styles.css         # Extends ../admin-dashboard/styles.css with mobile-first citizen layouts and fallback tokens
├── app.js             # View controller, state machine, progressive disclosure, stepper & modal logic
├── data.js            # Normalized mock datasets, multi-department records, and async API loaders
├── p1GisAdapter.js    # Clean boundary interface adapter for P1 GIS team
└── README.md          # Module technical documentation and quick start guide
```

---

## 3. How to Run

This is a pure static GovTech frontend module with **zero external build steps or node_modules dependencies**.

### Option A: Serve via Local HTTP Server (Recommended)
From the repository root (`land-stack/`):
```bash
# Using Python 3
python -m http.server 8000
```
Then visit:
- **P3 Citizen Portal**: [`http://localhost:8000/frontend/citizen-portal/`](http://localhost:8000/frontend/citizen-portal/)
- **P4 Admin Dashboard**: [`http://localhost:8000/frontend/admin-dashboard/`](http://localhost:8000/frontend/admin-dashboard/)

### Option B: Open Directly (`file:///`)
Double-click `frontend/citizen-portal/index.html` or open it directly in Google Chrome, Microsoft Edge, Mozilla Firefox, or Safari. The styling and icons are bundled with offline-resilient SVG dictionaries and fallback CSS rules to render pixel-perfect even under strict browser CORS `file:///` restrictions.

---

## 4. Multi-Persona Testing Suite & Citizen Journeys

Click the **Switch Citizen** button in the top navigation bar to test three realistic Indian landholder personas:

| Persona | Jurisdiction | Scenario / Key Test Flow | Primary ULPIN | Status State |
| :--- | :--- | :--- | :--- | :--- |
| **Gurpreet Singh** | Chandigarh (UT) | Flagship 52 sq.yd spatial divergence between SRO Deed and Cadastral Drone polygon; Step 3 joint rover demarcation scheduled; 14h SLA warning. Also owns ancestral rural Lal Dora parcel transitioning under SVAMITVA. | `CH-04-0012-8821-9041` | `CONFLICT DETECTED` & `UNAVAILABLE` |
| **Ramesh Kumar** | Chandigarh (UT) | Clean title demo; 100% agreement across all 4 departments; Trust Score 98/100; Step 4 approved and harmonized; All 6 statutory documents verified. | `CH-01-1002-3344-5566` | `VERIFIED` |
| **Annamalai Muthuvel** | Tamil Nadu | Multi-parcel holder with Patta/Deed transliteration mismatch (`A. M. Velu` vs `Annamalai Muthuvel`), and an overdue commercial mutation SLA breach (>28 days) escalated to the Revenue Divisional Officer (RDO). | `TN-12-4091-7712-3302` | `PENDING` & `CONFLICT DETECTED` |

### Simulated Aadhaar OTP Login
In the identity modal, switch to the **Mobile / Aadhaar OTP** tab:
1. Enter any registered phone number (e.g., `+91 98765-43210` for Gurpreet, `+91 94170-10020` for Ramesh, or `+91 94440-12345` for Annamalai).
2. Click **Send OTP** to trigger the simulated SMS dispatch.
3. Click **Verify & Authenticate Citizen** to simulate e-KYC Level-2 biometric authentication and automatically load the citizen's indexed land holdings.

---

## 5. Integration Boundaries & Seams

### P1 GIS Boundary (`p1GisAdapter.js`)
- Exposes `window.P1GISAdapter = { mount, setParcel, highlightConflict, toggleLayer }`.
- Automatically connects with P1's live Mapbox/Leaflet container (`window.DharaaLiveMap`) if available in the DOM.
- Renders a high-fidelity SVG fallback complete with surveyed boundary vertices, North arrow, scale indicator, coordinate tooltips, and hatched encroachment overlay when running standalone.

### P2 Backend REST API Seam (`data.js`)
All UI controllers invoke async loader functions. Switching to production REST APIs requires a single-line update in each loader:
```javascript
// Mock implementation:
async function loadCitizenParcels(citizenId) {
    return Promise.resolve(mockCitizenParcels);
}

// Live backend handoff (1-line swap):
// async function loadCitizenParcels(citizenId) {
//     const res = await fetch(`/api/v1/citizen/${citizenId}/parcels`);
//     return await res.json();
// }
```

---

## 6. Strict Architectural Guardrails Maintained

- **P4 Admin Dashboard Frozen**: `frontend/admin-dashboard/*` and `frontend/admin-dashboard/DESIGN_SYSTEM.md` were preserved in an untouched, read-only state.
- **Exact Token & Layout Inheritance**: Citizen Portal inherits exact colors (`--navy-900`, `--emerald-600`, `--amber-500`, `--red-600`, `--slate-*`), typography (Inter + JetBrains Mono), component shapes (metric cards, badges, steppers, drawers, modals, toasts), and 4-tier GovTech hierarchy from P4's design system.
- **Product Identity**: Branded exclusively as **DHARAA** ("Digital Hub for Aggregated Records and Administration"). "Land Stack" is cited only as the underlying GoI problem statement context.

