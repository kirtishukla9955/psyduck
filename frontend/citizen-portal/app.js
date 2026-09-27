/**
 * DHARAA — P3 Citizen Portal Application Controller
 * Part of Project DHARAA (Land Stack) • Smart India Hackathon 2026
 * 
 * Manages view routing, interactive progressive disclosure, search filtering,
 * mutation tracking stepper, service request filings, and P1 GIS integration.
 */

// =============================================================================
// 1. FALLBACK ICONS DICTIONARY (Offline & CDN-Blocked Resilience)
// =============================================================================
const fallbackSvgIcons = {
    'layers': '<polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline>',
    'map-pin': '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle>',
    'user-check': '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><polyline points="16 11 18 13 22 9"></polyline>',
    'user': '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle>',
    'shield': '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>',
    'shield-alert': '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>',
    'shield-check': '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><polyline points="9 12 11 14 15 10"></polyline>',
    'bell': '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path>',
    'inbox': '<polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path>',
    'git-pull-request': '<circle cx="18" cy="18" r="3"></circle><circle cx="6" cy="6" r="3"></circle><path d="M13 6h3a2 2 0 0 1 2 2v7"></path><line x1="6" y1="9" x2="6" y2="21"></line>',
    'search': '<circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>',
    'download': '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line>',
    'chevron-right': '<polyline points="9 18 15 12 9 6"></polyline>',
    'chevron-down': '<polyline points="6 9 12 15 18 9"></polyline>',
    'alert-circle': '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>',
    'alert-octagon': '<polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"></polygon><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>',
    'alert-triangle': '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line>',
    'clock': '<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>',
    'external-link': '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line>',
    'book': '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>',
    'book-open': '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>',
    'file-check': '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><path d="m9 15 2 2 4-4"></path>',
    'file-text': '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline>',
    'compass': '<circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>',
    'building': '<rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><path d="M9 22v-4h6v4"></path><line x1="8" y1="6" x2="8.01" y2="6"></line><line x1="16" y1="6" x2="16.01" y2="6"></line><line x1="8" y1="10" x2="8.01" y2="10"></line><line x1="16" y1="10" x2="16.01" y2="10"></line><line x1="8" y1="14" x2="8.01" y2="14"></line><line x1="16" y1="14" x2="16.01" y2="14"></line>',
    'send': '<line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>',
    'check': '<polyline points="20 6 9 17 4 12"></polyline>',
    'check-circle': '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>',
    'check-circle-2': '<circle cx="12" cy="12" r="10"></circle><path d="m9 12 2 2 4-4"></path>',
    'activity': '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>',
    'x': '<line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>',
    'map': '<polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon><line x1="8" y1="2" x2="8" y2="18"></line><line x1="16" y1="6" x2="16" y2="22"></line>',
    'users': '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>',
    'settings': '<circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>',
    'upload': '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line>',
    'smartphone': '<rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line>',
    'key': '<path d="m21 2-2 2m-1.5 1.5L14 9a5.5 5.5 0 1 1-5 5L2 21h3v-2h2v-2h2l1.5-1.5"></path>',
    'globe': '<circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>',
    'info': '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line>'
};

function renderIcons() {
    if (window.lucide && typeof window.lucide.createIcons === 'function' && window.lucide !== window._fallbackLucide) {
        try {
            window.lucide.createIcons();
            return;
        } catch (e) {
            console.warn("Lucide CDN error, using offline SVG dictionary fallback", e);
        }
    }
    document.querySelectorAll("[data-lucide]").forEach(el => {
        const iconName = el.getAttribute("data-lucide");
        const w = el.style.width || "18px";
        const h = el.style.height || "18px";
        const pathData = fallbackSvgIcons[iconName] || '<circle cx="12" cy="12" r="8"></circle>';
        el.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-${iconName}">${pathData}</svg>`;
        el.style.display = "inline-flex";
        el.style.alignItems = "center";
        el.style.justifyContent = "center";
    });
}

if (!window.lucide) {
    window._fallbackLucide = { createIcons: renderIcons };
    window.lucide = window._fallbackLucide;
}

// =============================================================================
// 2. APPLICATION STATE & I18N BRIDGES
// =============================================================================
let currentCitizenKey = 'gurpreet'; // 'gurpreet' | 'ramesh' | 'annamalai'
let currentCitizen = null;
let linkedParcels = [];
let activeParcel = null;
let selectedTxRefNo = null;
let activeTab = 'home';
let toastTimeout = null;

function t(key, fallback = null) {
    if (window.DharaaI18n && typeof window.DharaaI18n.t === 'function') {
        return window.DharaaI18n.t(key, fallback);
    }
    return fallback !== null ? fallback : key;
}

// =============================================================================
// 3. INITIALIZATION
// =============================================================================
document.addEventListener("DOMContentLoaded", async () => {
    await initCitizenPortal();
});

async function initCitizenPortal() {
    try {
        currentCitizen = await loadCitizenProfile(currentCitizenKey);
        linkedParcels = await loadCitizenParcels(currentCitizenKey);
        activeParcel = linkedParcels[0] || (await loadParcelDetail("CH-04-0012-8821-9041"));

        // Initialize Centralized i18n Engine & Language Selector
        if (window.DharaaI18n) {
            window.DharaaI18n.initI18n();
            initLanguageSelector();
            window.DharaaI18n.onLanguageChange(() => {
                updateCitizenHeader();
                renderHomeDashboard();
                renderSearchResults();
                renderGlossary();
                renderProfileView();
                if (activeParcel) {
                    loadAndDisplayParcel(activeParcel.ulpin);
                }
                renderIcons();
            });
        }

        // Update UI state
        updateCitizenHeader();
        renderHomeDashboard();
        renderSearchResults();
        renderGlossary();
        renderProfileView();
        await loadAndDisplayParcel(activeParcel.ulpin);
        await refreshServiceRequests();
        await refreshNotifications();

        // Mount P1 GIS Component
        if (window.P1GISAdapter) {
            window.P1GISAdapter.mount("p1-gis-container");
            window.P1GISAdapter.setParcel(activeParcel);
        }

        renderIcons();
    } catch (err) {
        console.error("Initialization error:", err);
        showToast("Error loading citizen portal records", "error");
    }
}

// =============================================================================
// 4. TAB ROUTING & NAVIGATION
// =============================================================================
function switchTab(tabName) {
    activeTab = tabName;

    // View toggles
    document.querySelectorAll(".view-container").forEach(v => v.classList.remove("active"));
    const target = document.getElementById(`tab-${tabName}`);
    if (target) target.classList.add("active");

    // Desktop Nav links
    document.querySelectorAll(".citizen-nav-inner .c-nav-link").forEach(l => {
        l.classList.toggle("active", l.getAttribute("data-tab") === tabName);
    });

    // Mobile Bottom Nav links
    document.querySelectorAll(".mobile-bottom-nav .m-nav-item").forEach(m => {
        m.classList.toggle("active", m.getAttribute("data-tab") === tabName);
    });

    // Scroll to top of content
    window.scrollTo({ top: 0, behavior: 'smooth' });

    renderIcons();
}

// =============================================================================
// 5. CITIZEN PROFILE & HEADER CONTROLLERS
// =============================================================================
function updateCitizenHeader() {
    if (!currentCitizen) return;
    const nameEl = document.getElementById("citizenHeaderName");
    const avatarLetter = document.getElementById("citizenAvatarLetter");

    if (nameEl) nameEl.textContent = currentCitizen.fullName;
    if (avatarLetter) avatarLetter.textContent = currentCitizen.fullName.charAt(0);
}

async function switchCitizenProfile(key) {
    currentCitizenKey = key;
    closeModal('modalAuth');
    await initCitizenPortal();
    showToast(`Switched active citizen to ${currentCitizen.fullName} (${currentCitizen.stateLabel})`);
}

// =============================================================================
// 6. HOME DASHBOARD RENDERER
// =============================================================================
function renderHomeDashboard() {
    if (!currentCitizen) return;

    // Telemetry big numbers
    document.getElementById("statLinkedParcels").textContent = linkedParcels.length;

    // Average or primary trust score
    const primaryParcel = linkedParcels[0] || mockParcels[0];
    if (primaryParcel.trustScore !== null) {
        document.getElementById("statTrustScore").textContent = primaryParcel.trustScore;
        const statusMap = {
            'verified': t('status_verified', "100% Registry Consensus"),
            'conflict': t('status_conflict', "Conflict Detected — Spatial Overlap"),
            'pending': t('status_pending', "Verification In Progress"),
            'unavailable': t('status_unavailable', "SVAMITVA Resurvey in Progress")
        };
        document.getElementById("statTrustLabel").textContent = statusMap[primaryParcel.verificationStatus] || primaryParcel.verificationLabel;
    } else {
        document.getElementById("statTrustScore").textContent = "N/A";
        document.getElementById("statTrustLabel").textContent = t('status_unavailable', "SVAMITVA Resurvey in Progress");
    }

    // SLA Timer
    const slaEl = document.getElementById("statSlaTimer");
    if (primaryParcel.activeTransaction) {
        const tx = primaryParcel.activeTransaction;
        if (tx.slaDaysRemaining !== undefined) {
            if (tx.slaDaysRemaining < 0) {
                slaEl.textContent = `${Math.abs(tx.slaDaysRemaining)}d ${t('sla_overdue_breach', 'Overdue')}`;
            } else if (tx.slaDaysRemaining === 0) {
                slaEl.textContent = `${tx.slaHoursRemaining}h ${t('sla_hours_remaining', 'left')}`;
            } else {
                slaEl.textContent = `${tx.slaDaysRemaining}d ${t('sla_days_remaining', 'left')}`;
            }
        } else {
            slaEl.textContent = `${Math.abs(tx.slaHoursRemaining)}h`;
        }
    } else {
        slaEl.textContent = "—";
    }

    // Pending Citizen Action Callout
    const pendingBox = document.getElementById("homePendingActionContainer");
    if (pendingBox) {
        if (currentCitizen && currentCitizen.pendingAction) {
            const pa = currentCitizen.pendingAction;
            pendingBox.style.display = "block";
            pendingBox.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; margin-bottom: 24px; padding: 14px 18px; border-radius: 8px; background: #eff6ff; border: 1px solid #bfdbfe; border-left: 4px solid #2563eb;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div style="width: 36px; height: 36px; border-radius: 6px; background: #dbeafe; display: flex; align-items: center; justify-content: center; color: #1d4ed8; flex-shrink: 0;">
                            <i data-lucide="alert-circle" style="width: 20px; height: 20px;"></i>
                        </div>
                        <div>
                            <div style="font-weight: 700; color: #1e3a8a; font-size: 14.5px;">${t('action_required', 'Action Required by Citizen')}: ${pa.title}</div>
                            <div style="font-size: 13px; color: #3b82f6; margin-top: 2px;">
                                Target ULPIN: <span class="mono" style="font-weight: 600;">${pa.ulpin}</span> &bull; Scheduled / Due: <strong>${pa.deadline}</strong> &bull; ${pa.description}
                            </div>
                        </div>
                    </div>
                    <button class="btn-action btn-primary" style="font-size: 13px; padding: 6px 14px;" onclick="switchTab('${pa.tabTarget || 'transactions'}')">
                        ${pa.buttonLabel || 'Resolve Action'} &rarr;
                    </button>
                </div>
            `;
        } else {
            pendingBox.style.display = "none";
            pendingBox.innerHTML = "";
        }
    }

    // Active discrepancy banner state
    const alertBanner = document.getElementById("homeAlertBanner");
    if (primaryParcel.verificationStatus === 'conflict') {
        alertBanner.style.display = 'flex';
    } else {
        alertBanner.style.display = 'none';
    }

    // Linked parcels list
    const container = document.getElementById("linkedParcelsContainer");
    container.innerHTML = "";

    if (linkedParcels.length === 0) {
        container.innerHTML = `
            <div class="state-container">
                <div class="state-icon-wrap empty"><i data-lucide="map-pin" style="width:28px;height:28px;"></i></div>
                <div class="state-title">No Land Parcels Linked</div>
                <div class="state-sub">No registered parcels match your Citizen ID. Use the Search Parcel tab to query by ULPIN.</div>
            </div>
        `;
        return;
    }

    linkedParcels.forEach(p => {
        const card = document.createElement("div");
        card.className = "parcel-card-item";

        const statusBadge = p.verificationStatus === 'verified'
            ? `<span class="badge badge-verified"><i data-lucide="check-circle" style="width:13px;height:13px;"></i> ${t('status_verified', 'VERIFIED')}</span>`
            : p.verificationStatus === 'conflict'
                ? `<span class="badge badge-critical"><i data-lucide="alert-circle" style="width:13px;height:13px;"></i> ${t('status_conflict', 'CONFLICT DETECTED')}</span>`
                : p.verificationStatus === 'unavailable'
                    ? `<span class="badge badge-unavailable"><i data-lucide="info" style="width:13px;height:13px;"></i> ${t('status_unavailable', 'UNAVAILABLE')}</span>`
                    : `<span class="badge badge-major"><i data-lucide="clock" style="width:13px;height:13px;"></i> ${t('status_pending', 'PENDING REVIEW')}</span>`;

        const trustValHtml = p.trustScore !== null
            ? `<span class="meta-val" style="font-weight: 700; color: ${p.trustScore >= 80 ? 'var(--emerald-600)' : 'var(--red-600)'};">${p.trustScore} / 100</span>`
            : `<span class="meta-val" style="font-weight: 600; color: var(--slate-500);">N/A (Drone Survey)</span>`;

        card.innerHTML = `
            <div class="parcel-card-top">
                <div>
                    <div class="parcel-ulpin-title mono">${p.ulpin}</div>
                    <div style="font-size: 13.5px; color: var(--slate-500); margin-top: 3px;">
                        ${p.khasra} &bull; ${p.village}, ${p.district} (${p.stateLabel})
                    </div>
                </div>
                <div style="display: flex; gap: 8px; align-items: center;">
                    ${statusBadge}
                    <span class="badge badge-state-${p.state.toLowerCase()}">${p.state}</span>
                </div>
            </div>

            <div class="parcel-meta-grid">
                <div class="parcel-meta-cell">
                    <span class="meta-label">${t('area_label', 'Recorded Land Area')}</span>
                    <span class="meta-val">${p.area.localDisplay}</span>
                </div>
                <div class="parcel-meta-cell">
                    <span class="meta-label">${t('trust_score_label', 'Consensus Trust Score')}</span>
                    ${trustValHtml}
                </div>
                <div class="parcel-meta-cell">
                    <span class="meta-label">Land Use Classification</span>
                    <span class="meta-val">${p.landUse}</span>
                </div>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 10px; border-top: 1px solid var(--border-subtle); flex-wrap: wrap; gap: 10px;">
                <div style="font-size: 13px; color: var(--slate-500);">
                    <i data-lucide="clock" style="width: 13px; height: 13px;"></i> Last audited: ${p.dataFreshness}
                </div>
                <div style="display: flex; gap: 8px;">
                    <button class="btn-action" style="font-size: 13.5px; padding: 6px 12px;" onclick="loadAndDisplayParcel('${p.ulpin}', true)">
                        <i data-lucide="file-text" style="width: 14px; height: 14px;"></i> ${t('btn_view_details', 'Inspect Dossier')}
                    </button>
                    <button class="btn-action btn-primary" style="font-size: 13.5px; padding: 6px 12px;" onclick="inspectOwnershipForParcel('${p.ulpin}')">
                        <i data-lucide="shield-check" style="width: 14px; height: 14px;"></i> ${t('btn_track_mutation', 'Check Trust Status')}
                    </button>
                </div>
            </div>
        `;
        container.appendChild(card);
    });

    renderIcons();
}

function inspectParcelFromHome(ulpin) {
    loadAndDisplayParcel(ulpin, true);
}

function inspectOwnershipForParcel(ulpin) {
    loadAndDisplayParcel(ulpin, false);
    switchTab('verification');
}

// =============================================================================
// 7. PARCEL DETAILS & PROGRESSIVE DISCLOSURE
// =============================================================================
async function loadAndDisplayParcel(ulpin, switchTabToParcel = false) {
    const parcel = await loadParcelDetail(ulpin);
    if (!parcel) {
        showToast(`Parcel ${ulpin} not found`, "error");
        return;
    }
    activeParcel = parcel;
    selectedTxRefNo = null;

    // Header updates
    document.getElementById("detailUlpinDisplay").textContent = parcel.ulpin;
    document.getElementById("detailLocationDisplay").innerHTML = `
        ${parcel.khasra} &bull; ${parcel.village}, ${parcel.district} &bull; Recorded Owner: <strong>${parcel.ownerName}</strong>
    `;

    // Status Badge
    const badgeEl = document.getElementById("detailStatusBadge");
    if (parcel.verificationStatus === 'verified') {
        badgeEl.className = "badge badge-verified";
        badgeEl.textContent = t('status_verified', "VERIFIED — 100% CONSENSUS");
    } else if (parcel.verificationStatus === 'conflict') {
        badgeEl.className = "badge badge-critical";
        badgeEl.textContent = t('status_conflict', "CONFLICT DETECTED");
    } else if (parcel.verificationStatus === 'unavailable') {
        badgeEl.className = "badge badge-unavailable";
        badgeEl.textContent = t('status_unavailable', "UNAVAILABLE — SVAMITVA RESURVEY");
    } else {
        badgeEl.className = "badge badge-major";
        badgeEl.textContent = t('status_pending', "PENDING VERIFICATION");
    }

    // State Badge
    const stateBadge = document.getElementById("detailStateBadge");
    stateBadge.className = `badge badge-state-${parcel.state.toLowerCase()}`;
    stateBadge.textContent = parcel.state === 'CH' ? 'CH UT' : 'TN';

    // Trust Score
    document.getElementById("detailTrustScoreDisplay").textContent = parcel.trustScore !== null ? `${parcel.trustScore} / 100` : "N/A";

    // Metadata Values
    document.getElementById("detailOwnerVal").textContent = parcel.ownerName;
    document.getElementById("detailAreaVal").textContent = `${parcel.area.localDisplay} (${parcel.area.sqMeters} sq.m)`;
    document.getElementById("detailLandUseVal").textContent = parcel.landUse;
    document.getElementById("detailEncumbranceVal").textContent = parcel.encumbrance.caveats.length > 0
        ? `Caveats: ${parcel.encumbrance.caveats[0]}`
        : "Clean Record (No Mortgages)";
    document.getElementById("detailMutationVal").textContent = parcel.activeTransaction
        ? `${parcel.activeTransaction.refNo} (${parcel.activeTransaction.currentStage})`
        : "None (Title Settled)";
    document.getElementById("detailFreshnessVal").textContent = parcel.dataFreshness;

    // 4-Department Reconciliation Grid
    renderDepartmentGrid(parcel);

    // Encumbrance Drawer Content
    renderEncumbranceDrawer(parcel);

    // P1 GIS Component Update
    if (window.P1GISAdapter) {
        window.P1GISAdapter.setParcel(parcel);
    }

    // Ownership Verification View Update
    renderOwnershipVerification(parcel);

    // Transaction Tracker Update
    renderTransactionTracker(parcel);

    if (switchTabToParcel) {
        switchTab('parcel');
        showToast(`Loaded parcel dossier for ${parcel.ulpin}`);
    }

    renderIcons();
}

function toggleParcelDrawer(drawerId) {
    const drawer = document.getElementById(drawerId);
    const chevron = document.getElementById(`drawer-chevron-${drawerId}`);
    if (!drawer) return;

    const isOpen = drawer.classList.contains("is-open");
    drawer.classList.toggle("is-open", !isOpen);

    if (chevron) {
        chevron.setAttribute("data-lucide", isOpen ? "chevron-right" : "chevron-down");
        renderIcons();
    }
}

function renderDepartmentGrid(parcel) {
    const grid = document.getElementById("detailDeptGrid");
    if (!grid) return;

    const depts = parcel.departments;
    const isSpatialDiscrepancy = parcel.ulpin === "CH-04-0012-8821-9041" || parcel.ulpin === "TN-04-3420-2921-7744";

    grid.innerHTML = `
        <div class="dept-cell">
            <div class="dept-cell-header">
                <span>1. Revenue Registry (RoR)</span>
                <i data-lucide="book" style="width:15px;height:15px;"></i>
            </div>
            <div class="dept-cell-value" style="font-size: 13.5px;">
                <strong>Record:</strong> ${depts.revenue ? depts.revenue.recordId : 'N/A'}<br>
                <strong>Owner:</strong> ${depts.revenue ? depts.revenue.owner : 'N/A'}<br>
                <strong>Area:</strong> ${depts.revenue ? depts.revenue.area : 'N/A'}<br>
                <strong>Status:</strong> ${depts.revenue ? depts.revenue.mutationStatus : 'N/A'}
            </div>
        </div>

        <div class="dept-cell">
            <div class="dept-cell-header">
                <span>2. Registration (SRO)</span>
                <i data-lucide="file-check" style="width:15px;height:15px;"></i>
            </div>
            <div class="dept-cell-value" style="font-size: 13.5px;">
                <strong>Deed No:</strong> ${depts.registration ? depts.registration.deedNo : 'N/A'}<br>
                <strong>Executants:</strong> ${depts.registration ? depts.registration.executants : 'N/A'}<br>
                <strong>Area Recorded:</strong> ${depts.registration ? depts.registration.areaRecorded : 'N/A'}<br>
                <strong>Sealed:</strong> ${depts.registration ? depts.registration.status : 'N/A'}
            </div>
        </div>

        <div class="dept-cell">
            <div class="dept-cell-header">
                <span>3. Cadastral Survey & GIS</span>
                <i data-lucide="compass" style="width:15px;height:15px;"></i>
            </div>
            <div class="dept-cell-value ${isSpatialDiscrepancy ? 'mismatch' : ''}" style="font-size: 13.5px;">
                <strong>FMB / Sheet:</strong> ${depts.survey ? depts.survey.fmbRef : 'N/A'}<br>
                <strong>GIS Area:</strong> ${depts.survey ? depts.survey.gisArea : 'N/A'}<br>
                <strong>Coordinates:</strong> ${depts.survey ? depts.survey.coordinates : 'N/A'}<br>
                <strong>Alert:</strong> ${depts.survey ? depts.survey.discrepancyNote : 'Boundary intact'}
            </div>
        </div>

        <div class="dept-cell">
            <div class="dept-cell-header">
                <span>4. Urban ULB & Town Planning</span>
                <i data-lucide="building" style="width:15px;height:15px;"></i>
            </div>
            <div class="dept-cell-value" style="font-size: 13.5px;">
                <strong>Authority:</strong> ${depts.urban ? depts.urban.authority : 'N/A'}<br>
                <strong>Property Tax ID:</strong> ${depts.urban ? depts.urban.propertyTaxId : 'N/A'}<br>
                <strong>Zoning:</strong> ${depts.urban ? depts.urban.zoning : 'N/A'}<br>
                <strong>B-Plan Status:</strong> ${depts.urban ? depts.urban.buildingPlanStatus : 'N/A'}
            </div>
        </div>
    `;
}

function renderEncumbranceDrawer(parcel) {
    const box = document.getElementById("detailEncumbranceContent");
    if (!box) return;

    if (parcel.encumbrance.caveats.length === 0 && !parcel.encumbrance.isMortgaged) {
        box.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px; color: var(--emerald-700);">
                <i data-lucide="check-circle" style="width: 20px; height: 20px;"></i>
                <div>
                    <strong>Clear Marketable Title:</strong> No registered mortgages, judicial caveats, or pending attachment warrants recorded against this parcel.
                </div>
            </div>
        `;
    } else {
        box.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 8px;">
                <div style="display: flex; align-items: center; gap: 8px; color: var(--red-600); font-weight: 600;">
                    <i data-lucide="alert-triangle" style="width: 18px; height: 18px;"></i>
                    <span>Notice of Active Caveat / Legal Restriction:</span>
                </div>
                <div style="background: var(--red-50); padding: 12px 14px; border-radius: 6px; border: 1px solid var(--red-100); font-size: 13.5px; color: var(--slate-800);">
                    ${parcel.encumbrance.caveats.join("<br>")}
                </div>
            </div>
        `;
    }
}

// =============================================================================
// 8. OWNERSHIP VERIFICATION & TRUST ANALYSIS RENDERER
// =============================================================================
function renderOwnershipVerification(parcel) {
    const container = document.getElementById("verificationBannerContainer");
    const matrixBody = document.getElementById("verificationMatrixBody");
    const nextSteps = document.getElementById("verificationNextSteps");
    if (!container || !matrixBody) return;

    const cd = parcel.conflictDetails || {};

    if (parcel.verificationStatus === 'verified') {
        container.innerHTML = `
            <div class="trust-status-banner verified">
                <div class="trust-icon-box">
                    <i data-lucide="check-circle" style="width: 26px; height: 26px;"></i>
                </div>
                <div class="trust-banner-info">
                    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
                        <div class="trust-banner-title">Ownership Fully Verified & Harmonized &bull; ${parcel.trustScore}/100 Trust Score</div>
                        <span class="badge badge-verified">100% REGISTRY CONSENSUS</span>
                    </div>
                    <div class="trust-banner-desc">
                        All four statutory registries (Revenue Jamabandi, SRO Registration Deed, Cadastral GIS Survey, and Municipal Corporation) are in complete mathematical and titular consensus. No ownership disputes, boundary variances, or tax arrears exist for this parcel.
                    </div>
                </div>
            </div>
        `;

        matrixBody.innerHTML = `
            <tr>
                <td><strong>1. Revenue Department (RoR)</strong></td>
                <td>${parcel.departments.revenue ? parcel.departments.revenue.owner : parcel.ownerName}</td>
                <td>${parcel.area.localDisplay}</td>
                <td><span class="badge badge-verified"><i data-lucide="check"></i> Verified Consensus</span></td>
            </tr>
            <tr>
                <td><strong>2. Sub-Registrar Office (SRO)</strong></td>
                <td>${parcel.departments.registration ? parcel.departments.registration.executants : parcel.ownerName}</td>
                <td>${parcel.area.localDisplay}</td>
                <td><span class="badge badge-verified"><i data-lucide="check"></i> Deed Authenticated</span></td>
            </tr>
            <tr>
                <td><strong>3. Cadastral Survey & GIS</strong></td>
                <td>${parcel.ownerName}</td>
                <td>${parcel.area.localDisplay}</td>
                <td><span class="badge badge-verified"><i data-lucide="check"></i> Zero Polygon Divergence</span></td>
            </tr>
            <tr>
                <td><strong>4. Urban Development / ULB</strong></td>
                <td>${parcel.ownerName}</td>
                <td>${parcel.area.localDisplay}</td>
                <td><span class="badge badge-verified"><i data-lucide="check"></i> Tax & Zoning Cleared</span></td>
            </tr>
        `;

        nextSteps.innerHTML = `
            <div style="font-weight: 600; color: var(--emerald-700); margin-bottom: 4px;">
                Citizen Advice & Title Status
            </div>
            <div style="font-size: 14px; color: var(--slate-700); line-height: 1.5;">
                Your title is clear, unencumbered, and marketable across all statutory registers. You can download an official digitally sealed Record of Rights (RoR) extract or apply for a certified Non-Encumbrance Certificate at any time.
            </div>
        `;
    } else if (parcel.verificationStatus === 'conflict') {
        container.innerHTML = `
            <div class="trust-status-banner conflict">
                <div class="trust-icon-box">
                    <i data-lucide="alert-circle" style="width: 26px; height: 26px;"></i>
                </div>
                <div class="trust-banner-info">
                    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
                        <div class="trust-banner-title">Cross-Departmental Anomaly Under Statutory Review &bull; ${parcel.trustScore}/100 Trust Score</div>
                        <span class="badge badge-critical">DISCREPANCY FLAGGED</span>
                    </div>
                    <div class="trust-banner-desc">
                        ${cd.whatDetected || "A cross-registry divergence was identified between statutory departmental registries."}
                    </div>
                </div>
            </div>
        `;

        const isSpatial = parcel.ulpin === "CH-04-0012-8821-9041";
        const isAlias = parcel.ulpin === "TN-12-4091-7712-3302";
        const isSlaBreach = parcel.ulpin === "TN-08-9921-1200-5541";

        if (isSpatial) {
            matrixBody.innerHTML = `
                <tr>
                    <td><strong>1. Revenue Department (Jamabandi)</strong></td>
                    <td>${parcel.departments.revenue.owner}</td>
                    <td>450 sq.yd (15 Marla)</td>
                    <td><span class="badge badge-verified"><i data-lucide="check"></i> Valid Title</span></td>
                </tr>
                <tr>
                    <td><strong>2. Sub-Registrar Office (SRO Deed)</strong></td>
                    <td>${parcel.ownerName}</td>
                    <td>450 sq.yd</td>
                    <td><span class="badge badge-verified"><i data-lucide="check"></i> Valid Deed</span></td>
                </tr>
                <tr>
                    <td><strong>3. Cadastral Survey & GIS</strong></td>
                    <td>Adjacent Overlap Flagged</td>
                    <td style="color: var(--red-600); font-weight: 600;">398 sq.yd (-52 sq.yd)</td>
                    <td><span class="badge badge-critical"><i data-lucide="alert-triangle"></i> Spatial Overlap (52 sq.yd)</span></td>
                </tr>
                <tr>
                    <td><strong>4. Urban Development (MCC)</strong></td>
                    <td>${parcel.ownerName}</td>
                    <td>450 sq.yd (R-2 Zoning)</td>
                    <td><span class="badge badge-moderate">Zoned Conforming</span></td>
                </tr>
            `;
        } else if (isAlias) {
            matrixBody.innerHTML = `
                <tr>
                    <td><strong>1. Revenue Department (Tamil Nilam Patta)</strong></td>
                    <td>A. M. Velu (Initials Format)</td>
                    <td>2,400 sq.ft</td>
                    <td><span class="badge badge-major"><i data-lucide="clock"></i> Transliteration Divergence</span></td>
                </tr>
                <tr>
                    <td><strong>2. Sub-Registrar Office (SRO Deed)</strong></td>
                    <td>Annamalai Muthuvel (Full Legal Name)</td>
                    <td>2,400 sq.ft</td>
                    <td><span class="badge badge-verified"><i data-lucide="check"></i> Registered Deed Valid</span></td>
                </tr>
                <tr>
                    <td><strong>3. Cadastral Survey & GIS</strong></td>
                    <td>Sub-division 102/3A</td>
                    <td>2,400 sq.ft</td>
                    <td><span class="badge badge-verified"><i data-lucide="check"></i> Boundaries Match FMB</span></td>
                </tr>
                <tr>
                    <td><strong>4. Urban / Panchayat Desk</strong></td>
                    <td>Annamalai Muthuvel</td>
                    <td>2,400 sq.ft</td>
                    <td><span class="badge badge-verified"><i data-lucide="check"></i> Tax Assessment Cleared</span></td>
                </tr>
            `;
        } else if (isSlaBreach) {
            matrixBody.innerHTML = `
                <tr>
                    <td><strong>1. Revenue Department (Taluk Patta)</strong></td>
                    <td>P. Natarajan (Prior Owner)</td>
                    <td>1.20 Acres</td>
                    <td><span class="badge badge-critical"><i data-lucide="alert-octagon"></i> Overdue Mutation (>28 Days)</span></td>
                </tr>
                <tr>
                    <td><strong>2. Sub-Registrar Office (STAR 2.0 Deed)</strong></td>
                    <td>K. Sundaram & Annamalai Muthuvel</td>
                    <td>1.20 Acres</td>
                    <td><span class="badge badge-verified"><i data-lucide="check"></i> Conveyance Registered</span></td>
                </tr>
                <tr>
                    <td><strong>3. Cadastral Survey & GIS</strong></td>
                    <td>FMB 88/4B Sriperumbudur</td>
                    <td>1.20 Acres</td>
                    <td><span class="badge badge-verified"><i data-lucide="check"></i> Physical Bounds Intact</span></td>
                </tr>
                <tr>
                    <td><strong>4. Urban / SIPCOT Special Desk</strong></td>
                    <td>Under Review</td>
                    <td>1.20 Acres</td>
                    <td><span class="badge badge-moderate">Zoned Logistics</span></td>
                </tr>
            `;
        } else {
            matrixBody.innerHTML = `
                <tr>
                    <td><strong>1. Revenue Department</strong></td>
                    <td>${parcel.departments.revenue ? parcel.departments.revenue.owner : parcel.ownerName}</td>
                    <td>${parcel.departments.revenue ? parcel.departments.revenue.area : parcel.area.localDisplay}</td>
                    <td><span class="badge badge-major"><i data-lucide="clock"></i> Review Flagged</span></td>
                </tr>
                <tr>
                    <td><strong>2. Sub-Registrar Office (SRO)</strong></td>
                    <td>${parcel.ownerName}</td>
                    <td>${parcel.departments.registration ? parcel.departments.registration.areaRecorded : parcel.area.localDisplay}</td>
                    <td><span class="badge badge-verified"><i data-lucide="check"></i> Registered</span></td>
                </tr>
                <tr>
                    <td><strong>3. Cadastral Survey & GIS</strong></td>
                    <td>${parcel.ownerName}</td>
                    <td style="color: var(--red-600); font-weight: 600;">${parcel.departments.survey ? parcel.departments.survey.gisArea : 'Variance Detected'}</td>
                    <td><span class="badge badge-critical"><i data-lucide="alert-triangle"></i> Discrepancy</span></td>
                </tr>
                <tr>
                    <td><strong>4. Urban Planning / ULB</strong></td>
                    <td>${parcel.ownerName}</td>
                    <td>${parcel.area.localDisplay}</td>
                    <td><span class="badge badge-moderate">Pending Review</span></td>
                </tr>
            `;
        }

        // 4-Part Neutral Conflict Explanation Box
        nextSteps.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 14px;">
                <div style="font-weight: 700; color: var(--navy-900); font-size: 15px; display: flex; align-items: center; gap: 8px;">
                    <i data-lucide="info" style="width: 18px; height: 18px; color: var(--navy-700);"></i>
                    <span>Statutory Reconciliation Guidance (Neutral Plain-Language Assessment)</span>
                </div>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 12px;">
                    <div style="background: var(--slate-50); padding: 12px 14px; border-radius: 6px; border: 1px solid var(--border-subtle);">
                        <div style="font-weight: 600; color: var(--navy-900); font-size: 13px; margin-bottom: 4px;">1. What Was Detected</div>
                        <div style="font-size: 13px; color: var(--slate-600); line-height: 1.4;">${cd.whatDetected || "A cross-registry divergence was identified by the Land Trust Engine."}</div>
                    </div>
                    <div style="background: var(--slate-50); padding: 12px 14px; border-radius: 6px; border: 1px solid var(--border-subtle);">
                        <div style="font-weight: 600; color: var(--navy-900); font-size: 13px; margin-bottom: 4px;">2. Inconsistent Records</div>
                        <div style="font-size: 13px; color: var(--slate-600); line-height: 1.4;">${cd.inconsistentRecords || "Variance noted between registration deed and cadastral GIS layers."}</div>
                    </div>
                    <div style="background: var(--slate-50); padding: 12px 14px; border-radius: 6px; border: 1px solid var(--border-subtle);">
                        <div style="font-weight: 600; color: var(--navy-900); font-size: 13px; margin-bottom: 4px;">3. Current Statutory Status</div>
                        <div style="font-size: 13px; color: var(--slate-600); line-height: 1.4;">${cd.currentStatus || "Reconciliation proceeding in accordance with statutory state rules."}</div>
                    </div>
                    <div style="background: var(--slate-50); padding: 12px 14px; border-radius: 6px; border: 1px solid var(--border-subtle);">
                        <div style="font-weight: 600; color: var(--navy-900); font-size: 13px; margin-bottom: 4px;">4. Citizen Action Required</div>
                        <div style="font-size: 13px; color: var(--slate-600); line-height: 1.4;">${cd.actionRequired || "Keep original title documents available during on-site survey."}</div>
                    </div>
                </div>
            </div>
        `;
    } else if (parcel.verificationStatus === 'unavailable') {
        container.innerHTML = `
            <div class="trust-status-banner" style="background: var(--slate-100); border: 1px solid var(--slate-300);">
                <div class="trust-icon-box" style="background: var(--slate-200); color: var(--slate-700);">
                    <i data-lucide="info" style="width: 26px; height: 26px;"></i>
                </div>
                <div class="trust-banner-info">
                    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
                        <div class="trust-banner-title" style="color: var(--slate-900);">Digital Record Consensus Unavailable &bull; SVAMITVA Scheme Resurvey</div>
                        <span class="badge badge-unavailable">RURAL LAL DORA (ABADI DEH)</span>
                    </div>
                    <div class="trust-banner-desc" style="color: var(--slate-700);">
                        This rural parcel is located in the traditional inhabited village site (Abadi Deh / Lal Dora). It is transitioning from legacy paper Shajra/Missal records to a georeferenced Digital Property Card under the national SVAMITVA Scheme. Offline paper Jamabandi status is legally confirmed in the Revenue Patwari record room.
                    </div>
                </div>
            </div>
        `;

        matrixBody.innerHTML = `
            <tr>
                <td><strong>1. Revenue Department (Jamabandi)</strong></td>
                <td>${parcel.ownerName}</td>
                <td>280 sq.yd (Approx)</td>
                <td><span class="badge badge-verified"><i data-lucide="check"></i> Paper Record Intact (Khata 45)</span></td>
            </tr>
            <tr>
                <td><strong>2. Sub-Registrar Office (SRO)</strong></td>
                <td>Ancestral Allotment</td>
                <td>280 sq.yd</td>
                <td><span class="badge badge-moderate">Abadi Deh Exemption</span></td>
            </tr>
            <tr>
                <td><strong>3. Cadastral Survey & GIS</strong></td>
                <td>Chunam Marking Completed</td>
                <td>Pending Drone Flight</td>
                <td><span class="badge badge-major"><i data-lucide="clock"></i> Resurvey in Progress</span></td>
            </tr>
            <tr>
                <td><strong>4. Urban / Panchayat Desk</strong></td>
                <td>Gram Panchayat Mani Majra</td>
                <td>280 sq.yd</td>
                <td><span class="badge badge-verified"><i data-lucide="check"></i> Homestead Enrolled</span></td>
            </tr>
        `;

        nextSteps.innerHTML = `
            <div style="font-weight: 600; color: var(--slate-800); margin-bottom: 6px;">
                SVAMITVA Scheme Advisory for Citizen
            </div>
            <div style="font-size: 14px; color: var(--slate-700); line-height: 1.5;">
                <strong>Legal Status:</strong> Physical paper Jamabandi extract remains legally binding for all ownership and administrative rights.<br>
                <strong>What Happens Next:</strong> Following the drone resurvey flight and spatial boundary extraction, a draft Form-1 Property Card will be published for public inspection. Upon completion of the 30-day claims window, a digital ULPIN will be issued.<br>
                <strong>Dispute Status:</strong> Zero disputes or caveats recorded against this ancestral homestead.
            </div>
        `;
    } else {
        container.innerHTML = `
            <div class="trust-status-banner pending">
                <div class="trust-icon-box">
                    <i data-lucide="clock" style="width: 26px; height: 26px;"></i>
                </div>
                <div class="trust-banner-info">
                    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
                        <div class="trust-banner-title">Procedural Verification In Progress &bull; ${parcel.trustScore}/100 Trust Score</div>
                        <span class="badge badge-major">PROCEDURAL REVIEW</span>
                    </div>
                    <div class="trust-banner-desc">
                        ${parcel.verificationLabel}. Field verification inquiry is currently assigned to the local surveyor / VAO desk. No adverse title claim has been registered.
                    </div>
                </div>
            </div>
        `;

        matrixBody.innerHTML = `
            <tr>
                <td><strong>1. Revenue Department</strong></td>
                <td>${parcel.ownerName}</td>
                <td>${parcel.area.localDisplay}</td>
                <td><span class="badge badge-major"><i data-lucide="clock"></i> Under Review</span></td>
            </tr>
            <tr>
                <td><strong>2. Sub-Registrar Office</strong></td>
                <td>${parcel.ownerName}</td>
                <td>${parcel.area.localDisplay}</td>
                <td><span class="badge badge-verified"><i data-lucide="check"></i> Verified</span></td>
            </tr>
            <tr>
                <td><strong>3. Cadastral Survey</strong></td>
                <td>${parcel.ownerName}</td>
                <td>${parcel.area.localDisplay}</td>
                <td><span class="badge badge-verified"><i data-lucide="check"></i> Conforming</span></td>
            </tr>
            <tr>
                <td><strong>4. Urban Planning</strong></td>
                <td>${parcel.ownerName}</td>
                <td>${parcel.area.localDisplay}</td>
                <td><span class="badge badge-moderate">Pending NOC</span></td>
            </tr>
        `;

        nextSteps.innerHTML = `
            <div style="font-weight: 600; color: var(--amber-600); margin-bottom: 4px;">
                Procedural Review in Progress
            </div>
            <div style="font-size: 14px; color: var(--slate-700); line-height: 1.5;">
                Application has been routed to the Taluk Tahsildar / Head Surveyor desk for standard procedural endorsement. No adverse dispute exists on this parcel.
            </div>
        `;
    }

    renderIcons();
}

// =============================================================================
// 9. TRANSACTION & MUTATION TRACKER RENDERER
// =============================================================================
function renderTransactionTracker(parcel) {
    // 1. Resolve target parcel and transaction
    let targetParcel = parcel;
    const citizenTxs = [];
    linkedParcels.forEach(p => {
        if (p.activeTransaction) {
            citizenTxs.push({ tx: p.activeTransaction, parcel: p });
        }
    });

    if (selectedTxRefNo) {
        const found = citizenTxs.find(item => item.tx.refNo === selectedTxRefNo);
        if (found) {
            targetParcel = found.parcel;
        }
    } else if (!targetParcel.activeTransaction && citizenTxs.length > 0) {
        targetParcel = citizenTxs[0].parcel;
    }

    const tx = targetParcel.activeTransaction;

    // 2. Render Transaction Selector Pills
    const selectorContainer = document.getElementById("txSelectorContainer");
    if (selectorContainer) {
        if (citizenTxs.length > 1) {
            selectorContainer.style.display = "flex";
            selectorContainer.innerHTML = citizenTxs.map(item => {
                const isSelected = tx && item.tx.refNo === tx.refNo;
                return `
                    <button type="button" class="tx-pill ${isSelected ? 'active' : ''}" onclick="selectTransaction('${item.tx.refNo}')">
                        <span class="mono" style="font-weight: 600;">${item.tx.refNo}</span> &bull; ${item.tx.currentStage} (${item.parcel.ulpin})
                    </button>
                `;
            }).join("");
        } else {
            selectorContainer.style.display = "none";
            selectorContainer.innerHTML = "";
        }
    }

    // 3. Handle case where no transaction exists
    if (!tx) {
        document.getElementById("txRefNo").textContent = "NO ACTIVE TRANSACTION";
        document.getElementById("txStageBadge").textContent = "SETTLED";
        document.getElementById("txStageBadge").className = "badge badge-verified";
        const ulpinEl = document.getElementById("txUlpinDisplay");
        if (ulpinEl) ulpinEl.textContent = targetParcel.ulpin;
        const typeEl = document.getElementById("txTypeDateDisplay");
        if (typeEl) typeEl.textContent = "Title Settled & Fully Mutated in Record of Rights";
        
        const slaContainer = document.getElementById("txSlaContainer");
        if (slaContainer) {
            slaContainer.innerHTML = `
                <span class="sla-timer normal">
                    <i data-lucide="check-circle" style="width: 15px; height: 15px;"></i>
                    <span>No active statutory SLA (Record Settled)</span>
                </span>
            `;
        }

        document.getElementById("citizenStepperTrack").style.width = "100%";
        document.getElementById("cstep1").className = "step-item completed";
        document.getElementById("cstep2").className = "step-item completed";
        document.getElementById("cstep3").className = "step-item completed";
        document.getElementById("cstep4").className = "step-item completed";

        document.getElementById("txOfficerVal").textContent = "Registry Completed";
        document.getElementById("txDeptVal").textContent = "Central Land Registry";
        document.getElementById("txSlaWindowVal").textContent = "Closed";
        const stateSumEl = document.getElementById("txStateSummaryVal");
        if (stateSumEl) stateSumEl.textContent = "Stage 4: Approved & Mutated";

        const pendingActionBox = document.getElementById("txPendingActionBox");
        if (pendingActionBox) pendingActionBox.style.display = "none";

        const docCard = document.getElementById("txDocChecklistCard");
        if (docCard) docCard.style.display = "none";

        document.getElementById("txActivityLog").innerHTML = `
            <div class="timeline-node">
                <div class="timeline-dot" style="border-color: var(--emerald-600);"></div>
                <div class="timeline-content" style="border-left: 3px solid var(--emerald-600);">
                    <div class="timeline-header">
                        <span>Record Harmonized</span>
                        <span class="mono" style="font-size:13px; color:var(--slate-400);">Completed</span>
                    </div>
                    <div style="font-size: 14px; color: var(--slate-600);">Title legally mutated and confirmed in central Record of Rights.</div>
                </div>
            </div>
        `;
        renderIcons();
        return;
    }

    // 4. Update Header Strip
    document.getElementById("txRefNo").textContent = tx.refNo;
    document.getElementById("txStageBadge").textContent = tx.currentStage.toUpperCase();
    document.getElementById("txStageBadge").className = tx.stepIndex === 4
        ? "badge badge-verified"
        : tx.slaStatus === 'breached'
            ? "badge badge-critical"
            : "badge badge-major";

    const ulpinEl = document.getElementById("txUlpinDisplay");
    if (ulpinEl) ulpinEl.textContent = targetParcel.ulpin;

    const typeEl = document.getElementById("txTypeDateDisplay");
    if (typeEl) typeEl.textContent = `${tx.type} • Applied: ${tx.appliedDate || 'Recent'}`;

    // 5. Precise Days and Hours SLA Timer Countdown
    const slaContainer = document.getElementById("txSlaContainer");
    if (slaContainer) {
        if (tx.slaDaysRemaining !== undefined) {
            if (tx.slaDaysRemaining < 0) {
                slaContainer.innerHTML = `
                    <span class="sla-timer breached">
                        <i data-lucide="alert-octagon" style="width: 15px; height: 15px;"></i>
                        <span>${t('sla_overdue_breach', 'SLA Breached')} by ${Math.abs(tx.slaDaysRemaining)}d (${Math.abs(tx.slaHoursRemaining)}h) — Escalated</span>
                    </span>
                `;
            } else if (tx.slaDaysRemaining === 0) {
                slaContainer.innerHTML = `
                    <span class="sla-timer warning">
                        <i data-lucide="clock" style="width: 15px; height: 15px;"></i>
                        <span>${tx.slaHoursRemaining} ${t('sla_hours_remaining', 'Hours Remaining')} (Statutory SLA Window)</span>
                    </span>
                `;
            } else {
                slaContainer.innerHTML = `
                    <span class="sla-timer normal">
                        <i data-lucide="clock" style="width: 15px; height: 15px;"></i>
                        <span>${tx.slaDaysRemaining} ${t('sla_days_remaining', 'Days Remaining')} (${tx.slaHoursRemaining}h)</span>
                    </span>
                `;
            }
        } else {
            if (tx.slaHoursRemaining < 0) {
                slaContainer.innerHTML = `
                    <span class="sla-timer breached">
                        <i data-lucide="alert-octagon" style="width: 15px; height: 15px;"></i>
                        <span>${t('sla_overdue_breach', 'SLA Breached')} by ${Math.abs(tx.slaHoursRemaining)}h (Escalated)</span>
                    </span>
                `;
            } else if (tx.slaHoursRemaining <= 24) {
                slaContainer.innerHTML = `
                    <span class="sla-timer warning">
                        <i data-lucide="clock" style="width: 15px; height: 15px;"></i>
                        <span>${tx.slaHoursRemaining}h ${t('sla_hours_remaining', 'remaining')}</span>
                    </span>
                `;
            } else {
                slaContainer.innerHTML = `
                    <span class="sla-timer normal">
                        <i data-lucide="clock" style="width: 15px; height: 15px;"></i>
                        <span>${tx.slaHoursRemaining}h ${t('sla_hours_remaining', 'remaining')}</span>
                    </span>
                `;
            }
        }
    }

    // 6. Standardized 4-Stage Stepper: Filed -> Under Verification -> Field Inspection -> Approved / Rejected
    const progressWidths = { 1: "0%", 2: "33%", 3: "66%", 4: "100%" };
    document.getElementById("citizenStepperTrack").style.width = progressWidths[tx.stepIndex || 3];

    const stepLabels = [
        { num: 1, title: `1. ${t('stage_filed', 'Filed')}`, meta: tx.stages && tx.stages[0] ? tx.stages[0].date : "Auto-Triggered" },
        { num: 2, title: `2. ${t('stage_verification', 'Under Verification')}`, meta: tx.stages && tx.stages[1] ? tx.stages[1].status : "In Progress" },
        { num: 3, title: `3. ${t('stage_field_inspection', 'Field Inspection')}`, meta: tx.stages && tx.stages[2] ? tx.stages[2].status : "Pending" },
        { num: 4, title: `4. ${t('stage_approved', 'Approved / Rejected')}`, meta: tx.stages && tx.stages[3] ? tx.stages[3].status : "Statutory Order" }
    ];

    for (let i = 1; i <= 4; i++) {
        const stepEl = document.getElementById(`cstep${i}`);
        const titleEl = document.getElementById(`cstep${i}Title`);
        const metaEl = document.getElementById(`cstep${i}Meta`);
        if (titleEl) titleEl.textContent = stepLabels[i - 1].title;
        if (metaEl) metaEl.textContent = stepLabels[i - 1].meta;

        if (i < tx.stepIndex) {
            stepEl.className = "step-item completed";
            stepEl.querySelector(".step-circle").innerHTML = `<i data-lucide="check" style="width:18px;height:18px;"></i>`;
        } else if (i === tx.stepIndex) {
            stepEl.className = "step-item current";
            stepEl.querySelector(".step-circle").textContent = i;
        } else {
            stepEl.className = "step-item";
            stepEl.querySelector(".step-circle").textContent = i;
        }
    }

    // 7. Transaction Accountability Details
    document.getElementById("txOfficerVal").textContent = tx.assignedOfficer;
    document.getElementById("txDeptVal").textContent = tx.handlingDept || "Revenue & Survey Office";
    document.getElementById("txSlaWindowVal").textContent = `${tx.slaTotalDays || 30} Days (Right to Service Guarantee)`;
    const stateSumEl = document.getElementById("txStateSummaryVal");
    if (stateSumEl) stateSumEl.textContent = `Stage ${tx.stepIndex}: ${tx.currentStage}`;

    // 8. Pending Citizen Action Callout
    const pendingActionBox = document.getElementById("txPendingActionBox");
    if (pendingActionBox) {
        if (tx.pendingAction && !tx.pendingAction.startsWith("None")) {
            pendingActionBox.style.display = "block";
            pendingActionBox.innerHTML = `
                <div style="background: #fffbeb; border: 1px solid #fef3c7; border-left: 4px solid #f59e0b; padding: 14px 18px; border-radius: 6px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
                        <div style="font-weight: 700; color: #92400e; font-size: 14.5px; display: flex; align-items: center; gap: 8px;">
                            <i data-lucide="alert-triangle" style="width: 17px; height: 17px; color: #d97706;"></i>
                            <span>Action Required by Citizen</span>
                        </div>
                        <span class="badge badge-major" style="background: #fde68a; color: #78350f;">Mandatory Action</span>
                    </div>
                    <div style="font-size: 13.5px; color: #78350f; margin-top: 6px; line-height: 1.5;">
                        ${tx.pendingAction}
                    </div>
                </div>
            `;
        } else {
            pendingActionBox.style.display = "none";
            pendingActionBox.innerHTML = "";
        }
    }

    // 9. Document & Statutory Compliance Checklist (Received vs Pending)
    const docCard = document.getElementById("txDocChecklistCard");
    const docGrid = document.getElementById("txDocChecklistGrid");
    const docProgress = document.getElementById("txDocProgressText");

    if (docCard && docGrid) {
        if (tx.documentChecklist && tx.documentChecklist.length > 0) {
            docCard.style.display = "block";
            const verifiedCount = tx.documentChecklist.filter(d => d.status === 'received').length;
            if (docProgress) {
                docProgress.textContent = `${verifiedCount} of ${tx.documentChecklist.length} Verified`;
            }

            docGrid.innerHTML = tx.documentChecklist.map(d => `
                <div class="doc-item-row ${d.status}">
                    <div class="doc-item-left">
                        <div class="doc-icon-wrap ${d.status}">
                            <i data-lucide="${d.status === 'received' ? 'check-circle' : 'clock'}" style="width: 16px; height: 16px;"></i>
                        </div>
                        <div>
                            <div class="doc-name">${d.name}</div>
                            <div class="doc-source">${d.source} &bull; ${d.status === 'received' ? 'Verified: ' + d.dateVerified : (d.action || 'Pending Statutory Submission')}</div>
                        </div>
                    </div>
                    <div>
                        ${d.status === 'received' 
                            ? '<span class="badge badge-verified" style="font-size: 11px;">VERIFIED</span>' 
                            : `<button class="btn-action doc-item-action-btn" onclick="openNewRequestModal('${targetParcel.ulpin}')"><i data-lucide="upload" style="width: 12px; height: 12px;"></i> Upload / Affirm</button>`
                        }
                    </div>
                </div>
            `).join("");
        } else {
            docCard.style.display = "none";
        }
    }

    // 10. Timestamped Procedural Audit History
    const logBox = document.getElementById("txActivityLog");
    if (logBox) {
        logBox.innerHTML = "";
        tx.stages.forEach(s => {
            const node = document.createElement("div");
            node.className = "timeline-node";
            const color = s.status === 'completed' ? 'var(--emerald-600)' : s.status === 'current' ? 'var(--navy-800)' : 'var(--slate-300)';
            node.innerHTML = `
                <div class="timeline-dot" style="border-color: ${color};"></div>
                <div class="timeline-content" style="border-left: 3px solid ${color};">
                    <div class="timeline-header">
                        <span>${s.name}</span>
                        <span class="mono" style="font-size: 13px; color: var(--slate-400);">${s.date}</span>
                    </div>
                    <div style="font-size: 14px; color: var(--slate-600);">Action Agency: ${s.by} &bull; Status: <strong style="text-transform: capitalize;">${s.status}</strong></div>
                    ${s.description ? `<div style="font-size: 13px; color: var(--slate-500); margin-top: 3px;">${s.description}</div>` : ''}
                </div>
            `;
            logBox.appendChild(node);
        });
    }

    renderIcons();
}

function selectTransaction(refNo) {
    selectedTxRefNo = refNo;
    renderTransactionTracker(activeParcel);
}

// =============================================================================
// 10. SEARCH CONTROLLER
// =============================================================================
async function renderSearchResults() {
    const input = document.getElementById("mainSearchInput");
    const stateFilter = document.getElementById("searchStateFilter");
    const query = input ? input.value : "";
    const state = stateFilter ? stateFilter.value : "ALL";

    const results = await searchParcelsQuery(query, state);
    const countEl = document.getElementById("searchResultCount");
    if (countEl) countEl.textContent = `${results.length} parcel${results.length === 1 ? '' : 's'} matching criteria`;

    const container = document.getElementById("searchResultsList");
    if (!container) return;
    container.innerHTML = "";

    if (results.length === 0) {
        container.innerHTML = `
            <div class="state-container">
                <div class="state-icon-wrap empty"><i data-lucide="search" style="width:28px;height:28px;"></i></div>
                <div class="state-title">No Land Parcels Found</div>
                <div class="state-sub">Try searching with a valid ULPIN like <span class="mono">CH-04-0012-8821-9041</span> or changing the state filter.</div>
            </div>
        `;
        renderIcons();
        return;
    }

    results.forEach(p => {
        const card = document.createElement("div");
        card.className = "parcel-card-item";

        const badge = p.verificationStatus === 'verified'
            ? `<span class="badge badge-verified"><i data-lucide="check-circle" style="width:13px;height:13px;"></i> VERIFIED</span>`
            : p.verificationStatus === 'conflict'
                ? `<span class="badge badge-critical"><i data-lucide="alert-circle" style="width:13px;height:13px;"></i> CONFLICT</span>`
                : `<span class="badge badge-major"><i data-lucide="clock" style="width:13px;height:13px;"></i> PENDING</span>`;

        card.innerHTML = `
            <div class="parcel-card-top">
                <div>
                    <div class="parcel-ulpin-title mono">${p.ulpin}</div>
                    <div style="font-size: 13.5px; color: var(--slate-500); margin-top: 3px;">
                        ${p.khasra} &bull; ${p.village}, ${p.district} (${p.stateLabel})
                    </div>
                </div>
                <div style="display: flex; gap: 8px; align-items: center;">
                    ${badge}
                    <span class="badge badge-state-${p.state.toLowerCase()}">${p.state}</span>
                </div>
            </div>

            <div class="parcel-meta-grid">
                <div class="parcel-meta-cell">
                    <span class="meta-label">Title Holder</span>
                    <span class="meta-val">${p.ownerName}</span>
                </div>
                <div class="parcel-meta-cell">
                    <span class="meta-label">Land Area</span>
                    <span class="meta-val">${p.area.localDisplay}</span>
                </div>
                <div class="parcel-meta-cell">
                    <span class="meta-label">Trust Index</span>
                    <span class="meta-val" style="font-weight: 700; color: ${p.trustScore >= 80 ? 'var(--emerald-600)' : 'var(--red-600)'};">${p.trustScore} / 100</span>
                </div>
            </div>

            <div style="display: flex; justify-content: flex-end; gap: 8px; padding-top: 10px; border-top: 1px solid var(--border-subtle);">
                <button class="btn-action" onclick="loadAndDisplayParcel('${p.ulpin}', true)">
                    <i data-lucide="file-text" style="width: 14px; height: 14px;"></i> Inspect Dossier
                </button>
                <button class="btn-action btn-primary" onclick="inspectOwnershipForParcel('${p.ulpin}')">
                    <i data-lucide="shield-check" style="width: 14px; height: 14px;"></i> Verify Title
                </button>
            </div>
        `;
        container.appendChild(card);
    });

    renderIcons();
}

function handleSearchInputChange(val) {
    renderSearchResults();
}

function filterSearchResults() {
    renderSearchResults();
}

function handleHeroSearch(e) {
    e.preventDefault();
    const input = document.getElementById("heroSearchInput");
    const state = document.getElementById("heroStateFilter");
    if (!input || !input.value.trim()) return;

    const val = input.value.trim();
    const mainInput = document.getElementById("mainSearchInput");
    const mainState = document.getElementById("searchStateFilter");

    if (mainInput) mainInput.value = val;
    if (mainState && state) mainState.value = state.value;

    switchTab('search');
    renderSearchResults();
}

function quickLoadParcel(ulpin) {
    loadAndDisplayParcel(ulpin, true);
}

// =============================================================================
// 11. SERVICE REQUESTS CONTROLLER
// =============================================================================
async function refreshServiceRequests() {
    if (!currentCitizen) return;
    const list = await loadServiceRequests(currentCitizen.id);
    const container = document.getElementById("serviceRequestsList");
    const countBadge = document.getElementById("requestsCountBadge");
    const mCountBadge = document.getElementById("mRequestsCountBadge");
    const statEl = document.getElementById("statServiceRequests");

    if (countBadge) countBadge.textContent = list.length;
    if (mCountBadge) mCountBadge.textContent = list.length;
    if (statEl) statEl.textContent = list.length;

    if (!container) return;
    container.innerHTML = "";

    if (list.length === 0) {
        container.innerHTML = `
            <div class="state-container">
                <div class="state-icon-wrap empty"><i data-lucide="send" style="width:28px;height:28px;"></i></div>
                <div class="state-title">No Active Service Requests</div>
                <div class="state-sub">You have not submitted any boundary clarification or encumbrance certificate requests yet.</div>
                <button class="btn-action btn-primary" style="margin-top:8px;" onclick="openNewRequestModal()">
                    File First Service Request &rarr;
                </button>
            </div>
        `;
        renderIcons();
        return;
    }

    list.forEach(sr => {
        const card = document.createElement("div");
        card.className = "sr-card";

        const statusPill = sr.status === 'resolved'
            ? `<span class="badge badge-verified"><i data-lucide="check-circle" style="width:13px;height:13px;"></i> ${sr.statusLabel}</span>`
            : `<span class="badge badge-major"><i data-lucide="clock" style="width:13px;height:13px;"></i> ${sr.statusLabel}</span>`;

        card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 10px;">
                <div>
                    <div style="font-size: 16px; font-weight: 700; color: var(--navy-900);">
                        ${sr.categoryLabel}
                    </div>
                    <div style="font-size: 13px; color: var(--slate-500); display: flex; align-items: center; gap: 8px; margin-top: 3px;">
                        <span class="mono" style="font-weight: 600; color: var(--navy-700);">${sr.requestId}</span>
                        &bull; Target ULPIN: <span class="mono">${sr.ulpin}</span>
                    </div>
                </div>
                ${statusPill}
            </div>

            <div style="background: var(--slate-50); padding: 12px 14px; border-radius: 6px; font-size: 14px; color: var(--slate-700); line-height: 1.5; border: 1px solid var(--border-subtle);">
                <strong>Citizen Filing:</strong> ${sr.description}
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; font-size: 13px; color: var(--slate-500); padding-top: 8px; border-top: 1px solid var(--border-subtle);">
                <div>
                    <strong>Assigned:</strong> ${sr.assignedOfficer} &bull; ${sr.assignedDept}
                </div>
                <div>
                    <strong>Official Response:</strong> ${sr.responseMessage}
                </div>
            </div>
        `;
        container.appendChild(card);
    });

    renderIcons();
}

function openNewRequestModal(prefillUlpin = null) {
    const modal = document.getElementById("modalServiceRequest");
    const ulpinSelect = document.getElementById("srFormUlpin");
    if (!modal || !ulpinSelect) return;

    ulpinSelect.innerHTML = "";
    mockParcels.forEach(p => {
        const opt = document.createElement("option");
        opt.value = p.ulpin;
        opt.textContent = `${p.ulpin} — ${p.khasra} (${p.ownerName})`;
        if (prefillUlpin && p.ulpin === prefillUlpin) {
            opt.selected = true;
        } else if (!prefillUlpin && activeParcel && p.ulpin === activeParcel.ulpin) {
            opt.selected = true;
        }
        ulpinSelect.appendChild(opt);
    });

    modal.style.display = "flex";
    renderIcons();
}

async function handleServiceRequestSubmit(e) {
    e.preventDefault();
    const ulpin = document.getElementById("srFormUlpin").value;
    const category = document.getElementById("srFormCategory").value;
    const desc = document.getElementById("srFormDesc").value;

    const payload = {
        citizenId: currentCitizen ? currentCitizen.id : "CIT-CH-8821",
        state: currentCitizen ? currentCitizen.state : "CH",
        ulpin: ulpin,
        category: category,
        description: desc,
        attachmentName: "Deed_Extract.pdf"
    };

    const res = await submitServiceRequest(payload);
    closeModal('modalServiceRequest');
    await refreshServiceRequests();

    showToast(`Service Request ${res.record.requestId} filed successfully! SLA timer started.`);
    switchTab('requests');
}

function handleFileSelected(e) {
    const file = e.target.files[0];
    const display = document.getElementById("srFileDisplay");
    if (file && display) {
        display.textContent = `Attached: ${file.name} (${Math.round(file.size / 1024)} KB)`;
        display.style.color = "var(--emerald-700)";
    }
}

// =============================================================================
// 12. NOTIFICATIONS CONTROLLER
// =============================================================================
async function refreshNotifications() {
    if (!currentCitizen) return;
    const list = await loadNotifications(currentCitizen.id);
    const container = document.getElementById("notificationsList");
    const badge = document.getElementById("notifBadgeCount");

    const unreadCount = list.filter(n => !n.read).length;
    if (badge) {
        badge.textContent = unreadCount;
        badge.style.display = unreadCount > 0 ? "flex" : "none";
    }

    if (!container) return;
    container.innerHTML = "";

    if (list.length === 0) {
        container.innerHTML = `
            <div class="state-container">
                <div class="state-icon-wrap empty"><i data-lucide="bell" style="width:28px;height:28px;"></i></div>
                <div class="state-title">All Caught Up</div>
                <div class="state-sub">You have no unread notifications or SLA alerts.</div>
            </div>
        `;
        renderIcons();
        return;
    }

    list.forEach(n => {
        const item = document.createElement("div");
        item.className = "parcel-card-item";
        item.style.borderLeft = n.severity === 'warning' ? '4px solid var(--amber-500)' : n.severity === 'success' ? '4px solid var(--emerald-600)' : '4px solid var(--navy-700)';

        item.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 10px;">
                <div style="display: flex; align-items: center; gap: 8px;">
                    <i data-lucide="${n.severity === 'warning' ? 'alert-triangle' : n.severity === 'success' ? 'check-circle-2' : 'bell'}" 
                       style="width: 18px; height: 18px; color: ${n.severity === 'warning' ? 'var(--amber-600)' : n.severity === 'success' ? 'var(--emerald-600)' : 'var(--navy-600)'};"></i>
                    <strong style="font-size: 15px; color: var(--navy-900);">${n.title}</strong>
                </div>
                <span class="mono" style="font-size: 12px; color: var(--slate-400);">
                    ${new Date(n.timestamp).toLocaleDateString()}
                </span>
            </div>
            <div style="font-size: 14px; color: var(--slate-700); line-height: 1.5;">
                ${n.message}
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; font-size: 12.5px; color: var(--slate-500); padding-top: 6px;">
                <span>Related ULPIN: <strong class="mono">${n.ulpin}</strong></span>
                <button class="btn-action" style="font-size: 12.5px; padding: 4px 8px;" onclick="loadAndDisplayParcel('${n.ulpin}', true)">
                    Inspect Parcel &rarr;
                </button>
            </div>
        `;
        container.appendChild(item);
    });

    renderIcons();
}

function markAllNotificationsRead() {
    mockNotifications.forEach(n => n.read = true);
    refreshNotifications();
    showToast("All alerts marked as read");
}

// =============================================================================
// 13. GLOSSARY & HELP RENDERER
// =============================================================================
function renderGlossary() {
    const grid = document.getElementById("glossaryGrid");
    if (!grid) return;

    grid.innerHTML = "";
    landGlossary.forEach(item => {
        const card = document.createElement("div");
        card.className = "glossary-card";
        card.innerHTML = `
            <div class="glossary-term">
                <i data-lucide="book" style="width: 16px; height: 16px; color: var(--navy-700);"></i>
                <span>${item.term}</span>
            </div>
            <div class="glossary-full">${item.fullName}</div>
            <div class="glossary-def">${item.definition}</div>
        `;
        grid.appendChild(card);
    });

    renderIcons();
}

// =============================================================================
// 14. PROFILE VIEW RENDERER
// =============================================================================
function renderProfileView() {
    if (!currentCitizen) return;

    document.getElementById("profileFullName").textContent = currentCitizen.fullName;
    document.getElementById("profileAvatarLarge").textContent = currentCitizen.fullName.charAt(0);
    document.getElementById("profileIdSub").textContent = `Citizen ID: ${currentCitizen.id} • Aadhaar Masked: ${currentCitizen.aadhaarMasked}`;
    document.getElementById("profileFatherVal").textContent = currentCitizen.fatherName;
    document.getElementById("profileMobileVal").textContent = `${currentCitizen.mobile} (OTP Verified)`;
    document.getElementById("profileEmailVal").textContent = currentCitizen.email;
    document.getElementById("profileAddressVal").textContent = currentCitizen.address;
    document.getElementById("profileStateVal").textContent = currentCitizen.stateLabel;
    document.getElementById("profileLinkedCountVal").textContent = `${currentCitizen.linkedUlpins.length} Land Parcels`;

    // Initialize Preferences
    if (currentCitizen.preferences) {
        updateLanguageSelectorUI();

        const smsToggle = document.getElementById('prefSmsToggle');
        if (smsToggle) smsToggle.checked = currentCitizen.preferences.smsAlerts !== false;

        const waToggle = document.getElementById('prefWaToggle');
        if (waToggle) waToggle.checked = currentCitizen.preferences.whatsappAlerts === true;
    }
}

// =============================================================================
// 14b. CENTRALIZED LANGUAGE SELECTOR & I18N BRIDGES
// =============================================================================
function initLanguageSelector() {
    renderLanguageDropdownList();
    populateProfileLanguageSelect();
    updateLanguageSelectorUI();

    // Close language dropdown when clicking outside
    document.addEventListener("click", (e) => {
        const wrapper = document.getElementById("langSelectorWrapper");
        const menu = document.getElementById("langDropdownMenu");
        if (wrapper && menu && !wrapper.contains(e.target)) {
            menu.classList.remove("show");
            const btn = document.getElementById("langSelectorBtn");
            if (btn) btn.setAttribute("aria-expanded", "false");
        }
    });

    // Close on Escape key
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            const menu = document.getElementById("langDropdownMenu");
            if (menu && menu.classList.contains("show")) {
                menu.classList.remove("show");
                const btn = document.getElementById("langSelectorBtn");
                if (btn) {
                    btn.setAttribute("aria-expanded", "false");
                    btn.focus();
                }
            }
        }
    });
}

function toggleLanguageDropdown(e) {
    if (e) {
        e.stopPropagation();
        e.preventDefault();
    }
    const menu = document.getElementById("langDropdownMenu");
    const btn = document.getElementById("langSelectorBtn");
    if (!menu) return;

    const isOpen = menu.classList.contains("show");
    if (isOpen) {
        menu.classList.remove("show");
        if (btn) btn.setAttribute("aria-expanded", "false");
    } else {
        menu.classList.add("show");
        if (btn) btn.setAttribute("aria-expanded", "true");
        const searchInput = document.getElementById("langSearchInput");
        if (searchInput) {
            searchInput.value = "";
            filterLanguageList("");
            setTimeout(() => searchInput.focus(), 50);
        }
    }
}

function filterLanguageList(query) {
    const list = document.getElementById("langDropdownList");
    if (!list) return;
    const cleanQuery = (query || "").toLowerCase().trim();
    const items = list.querySelectorAll(".lang-menu-item");
    items.forEach(item => {
        const text = item.getAttribute("data-search") || item.textContent.toLowerCase();
        if (!cleanQuery || text.includes(cleanQuery)) {
            item.style.display = "flex";
        } else {
            item.style.display = "none";
        }
    });
}

function renderLanguageDropdownList() {
    const list = document.getElementById("langDropdownList");
    if (!list || !window.DharaaI18n) return;

    const languages = window.DharaaI18n.getAllLanguages();
    const currentCode = window.DharaaI18n.getLanguage();

    list.innerHTML = languages.map(lang => {
        const isActive = lang.code === currentCode;
        const isRtl = lang.dir === 'rtl';
        const tagText = lang.code === 'en' ? 'Default' : isRtl ? 'RTL • Sch 8' : 'Sch 8';
        const searchKeywords = `${lang.name.toLowerCase()} ${lang.native.toLowerCase()} ${lang.code}`;
        return `
            <button type="button" class="lang-menu-item ${isActive ? 'active' : ''}" 
                    role="menuitem"
                    data-code="${lang.code}" 
                    data-search="${searchKeywords}"
                    onclick="setPortalLanguage('${lang.code}')">
                <div class="lang-item-names">
                    <span class="lang-item-native">${lang.native}</span>
                    <span class="lang-item-english">${lang.name}</span>
                </div>
                <span class="lang-item-tag">${tagText}</span>
            </button>
        `;
    }).join("");
}

function populateProfileLanguageSelect() {
    const select = document.getElementById("profileLanguageSelect");
    if (!select || !window.DharaaI18n) return;

    const languages = window.DharaaI18n.getAllLanguages();
    const currentCode = window.DharaaI18n.getLanguage();

    select.innerHTML = languages.map(lang => {
        const isRtl = lang.dir === 'rtl' ? ' (RTL)' : '';
        return `<option value="${lang.code}" ${lang.code === currentCode ? 'selected' : ''}>${lang.native} — ${lang.name}${isRtl}</option>`;
    }).join("");
}

function updateLanguageSelectorUI() {
    if (!window.DharaaI18n) return;
    const currentCode = window.DharaaI18n.getLanguage();
    const meta = window.DharaaI18n.getLanguageMeta(currentCode);

    // Update header button label
    const nameEl = document.getElementById("langSelectorCurrentName");
    if (nameEl) {
        nameEl.textContent = meta ? meta.native : 'English';
    }

    // Update dropdown items active class
    const list = document.getElementById("langDropdownList");
    if (list) {
        list.querySelectorAll(".lang-menu-item").forEach(item => {
            item.classList.toggle("active", item.getAttribute("data-code") === currentCode);
        });
    }

    // Update profile select
    const select = document.getElementById("profileLanguageSelect");
    if (select) {
        select.value = currentCode;
    }

    // Update profile quick pills
    document.querySelectorAll(".lang-pill").forEach(pill => {
        pill.classList.toggle("active", pill.getAttribute("data-lang") === currentCode);
    });
}

function setPortalLanguage(lang) {
    if (!window.DharaaI18n) return;
    window.DharaaI18n.setLanguage(lang);

    if (currentCitizen && currentCitizen.preferences) {
        currentCitizen.preferences.language = lang;
    }

    updateLanguageSelectorUI();

    // Close dropdown
    const menu = document.getElementById("langDropdownMenu");
    const btn = document.getElementById("langSelectorBtn");
    if (menu) menu.classList.remove("show");
    if (btn) btn.setAttribute("aria-expanded", "false");

    const meta = window.DharaaI18n.getLanguageMeta(lang);
    const toastPrefix = t('toast_lang_saved', "Portal display language updated to");
    showToast(`${toastPrefix}: ${meta ? meta.native + ' (' + meta.name + ')' : lang}`);
}

function handlePreferenceToggle(channel, isChecked) {
    if (currentCitizen && currentCitizen.preferences) {
        if (channel === 'sms') currentCitizen.preferences.smsAlerts = isChecked;
        if (channel === 'whatsapp') currentCitizen.preferences.whatsappAlerts = isChecked;
    }
    const channelName = channel === 'sms' ? 'SMS telemetry alerts' : 'WhatsApp records gateway';
    showToast(`${channelName} ${isChecked ? 'enabled' : 'disabled'} for ${currentCitizen ? currentCitizen.mobile : 'profile'}`);
}

// =============================================================================
// 15. MODAL, AUTH TABS & OTP SIMULATION CONTROLLERS
// =============================================================================
function openAuthModal() {
    const modal = document.getElementById("modalAuth");
    if (modal) modal.style.display = "flex";
    renderIcons();
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = "none";
}

function switchAuthTab(tab) {
    const btnPersonas = document.getElementById("authTabBtnPersonas");
    const btnOtp = document.getElementById("authTabBtnOtp");
    const panelPersonas = document.getElementById("authPanelPersonas");
    const panelOtp = document.getElementById("authPanelOtp");

    if (tab === 'personas') {
        if (btnPersonas) btnPersonas.classList.add("active");
        if (btnOtp) btnOtp.classList.remove("active");
        if (panelPersonas) panelPersonas.style.display = "flex";
        if (panelOtp) panelOtp.style.display = "none";
    } else {
        if (btnPersonas) btnPersonas.classList.remove("active");
        if (btnOtp) btnOtp.classList.add("active");
        if (panelPersonas) panelPersonas.style.display = "none";
        if (panelOtp) panelOtp.style.display = "flex";
    }
    renderIcons();
}

function simulateSendOtp() {
    const input = document.getElementById("otpMobileInput");
    const val = input ? input.value.trim() : "";
    if (!val) {
        showToast("Please enter a valid mobile number or Aadhaar", "error");
        return;
    }

    const otpArea = document.getElementById("otpInputArea");
    if (otpArea) {
        otpArea.style.display = "block";
    }
    showToast("Simulation OTP 123456 dispatched to registered mobile via UIDAI SMS gateway");
}

async function simulateVerifyOtp() {
    const input = document.getElementById("otpMobileInput");
    const val = input ? input.value.trim() : "";

    let targetPersona = 'gurpreet';
    if (val.includes("94440") || val.includes("3302") || val.toLowerCase().includes("annamalai")) {
        targetPersona = 'annamalai';
    } else if (val.includes("94170") || val.includes("5566") || val.toLowerCase().includes("ramesh")) {
        targetPersona = 'ramesh';
    }

    closeModal('modalAuth');
    currentCitizenKey = targetPersona;
    await initCitizenPortal();
    showToast(`Authenticated as ${currentCitizen.fullName} (${currentCitizen.stateLabel}) via Aadhaar e-KYC Level-2`);
}

function showToast(msg, type = "success") {
    const toast = document.getElementById("toastBox");
    const msgEl = document.getElementById("toastMsg");
    const iconEl = document.getElementById("toastIcon");
    if (!toast || !msgEl) return;

    msgEl.textContent = msg;
    if (iconEl) {
        iconEl.setAttribute("data-lucide", type === "error" ? "alert-circle" : "check-circle-2");
        iconEl.style.color = type === "error" ? "var(--red-500)" : "#34d399";
    }

    toast.classList.add("show");
    renderIcons();

    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
        toast.classList.remove("show");
    }, 3200);
}
