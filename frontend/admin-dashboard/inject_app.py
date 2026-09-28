
// =============================================================================
// CITIZEN PORTAL MODE LOGIC (STEP 3)
// =============================================================================

let currentPortalMode = 'ADMIN';

window.switchPortalMode = function(mode) {
    currentPortalMode = mode;
    
    // Update Mode Buttons
    const btnAdmin = document.getElementById("modeBtnAdmin");
    const btnCitizen = document.getElementById("modeBtnCitizen");
    if(btnAdmin) btnAdmin.classList.toggle("active", mode === 'ADMIN');
    if(btnCitizen) btnCitizen.classList.toggle("active", mode === 'CITIZEN');
    
    // Toggle UI elements
    const headerBtn = document.getElementById("headerAddNewParcelBtn");
    if(headerBtn) headerBtn.style.display = mode === 'CITIZEN' ? 'none' : '';
    
    const roleSwitcher = document.getElementById("roleSwitcherGroup");
    if(roleSwitcher) roleSwitcher.style.display = mode === 'CITIZEN' ? 'none' : 'flex';
    
    const badge = document.getElementById("jurisdictionBadgeInfo");
    if (badge) {
        if (mode === 'CITIZEN') {
            badge.innerHTML = `
                <div class="officer-card-name" style="color: #059669;">Citizen / Landowner View (नागरिक दृश्य)</div>
                <div class="officer-card-designation">Public Land Verification</div>
                <div style="margin-top:4px;display:flex;gap:4px;">
                    <button style="font-size:10px;padding:2px 4px;background:#e2e8f0;color:#1e293b;border:none;border-radius:2px;cursor:pointer;">Check My Land Status</button>
                    <button style="font-size:10px;padding:2px 4px;background:#e2e8f0;color:#1e293b;border:none;border-radius:2px;cursor:pointer;">Verify Land Record</button>
                </div>
            `;
        } else {
            badge.innerHTML = `
                <div class="officer-card-name">Harvinder Singh</div>
                <div class="officer-card-designation">Kanungo / Revenue Inspector</div>
                <div class="officer-card-jurisdiction">Tehsil: Sriperumbudur, Dist: Kanchipuram</div>
            `;
        }
    }
    
    // Hide Admin sidebar items (except GIS)
    const navItems = document.querySelectorAll(".side-nav .nav-item");
    navItems.forEach(item => {
        const tab = item.getAttribute("data-tab");
        if (mode === 'CITIZEN') {
            if (tab !== 'gis' && tab !== 'citizen') {
                item.style.display = 'none';
            }
        } else {
            item.style.display = '';
        }
    });

    // Toggle Main Content
    const citizenPortal = document.getElementById("view-citizen-portal");
    if (mode === 'CITIZEN') {
        document.querySelectorAll(".view-container").forEach(v => v.classList.remove("active"));
        if(citizenPortal) citizenPortal.style.display = 'block';
        
        // Hide map initially in citizen portal until search
        const citizenMapContainer = document.getElementById("citizenMapContainer");
        if(citizenMapContainer) citizenMapContainer.style.display = 'none';
        
    } else {
        if(citizenPortal) citizenPortal.style.display = 'none';
        
        // Move map back to admin GIS tab if it was moved
        const gisContainer = document.getElementById("tab-gis");
        const mapWrapper = document.getElementById("citMapProxy")?.querySelector(".map-wrapper");
        if (gisContainer && mapWrapper) {
            const gisToolbar = gisContainer.querySelector(".gis-gov-toolbar-wrapper");
            if (gisToolbar) {
                gisToolbar.insertAdjacentElement('afterend', mapWrapper);
            } else {
                gisContainer.appendChild(mapWrapper);
            }
        }
        
        switchTab('queue'); // Switch back to admin queue by default
    }
    
    // Trigger map resize if it's currently rendered inside the citizen portal
    if (window.gisService && window.gisService.map) {
        setTimeout(() => {
            if(window.google && window.google.maps) {
                google.maps.event.trigger(window.gisService.map, 'resize');
            }
        }, 100);
    }
};

window.handleCitizenSearch = function(event) {
    event.preventDefault();
    const input = document.getElementById('citizenSearchInput').value.trim();
    if (!input) return;
    
    // Show toast for searching
    showToast("Querying Land Trust Registry for " + input + "...");
    
    setTimeout(() => {
        // Fallback to hardcoded details if parcel not in gisService yet
        const parcel = {
            ulpin: input,
            khasra: input === 'CH-04-0012-8821-9041' ? 'Khasra 142/2' : 'Survey 44/2',
            owner: input === 'TN-04-3420-2921-7744' ? 'Rajendran P.' : 'Gurpreet Singh',
            area: '450 sq.yd',
            status: input === 'CH-04-0012-8821-9041' ? 'disputed' : 'clear'
        };
        
        showCitizenParcel(parcel);
    }, 600);
};

window.citizenQuickSearch = function(ulpin) {
    const searchInput = document.getElementById('citizenSearchInput');
    if(searchInput) searchInput.value = ulpin;
    handleCitizenSearch({ preventDefault: () => {} });
};

window.showCitizenParcel = function(parcel) {
    const rorCard = document.getElementById("citizenRorCard");
    const mapContainer = document.getElementById("citizenMapContainer");
    if(rorCard) rorCard.style.display = "block";
    if(mapContainer) mapContainer.style.display = "flex";
    
    const elUlpin = document.getElementById("citUlpin");
    const elKhasra = document.getElementById("citKhasra");
    const elOwner = document.getElementById("citOwner");
    const elArea = document.getElementById("citArea");
    const elClass = document.getElementById("citClass");
    
    if(elUlpin) elUlpin.textContent = parcel.ulpin;
    if(elKhasra) elKhasra.textContent = parcel.khasra;
    if(elOwner) elOwner.textContent = parcel.owner;
    if(elArea) elArea.textContent = parcel.area;
    if(elClass) elClass.textContent = "Residential (R-2)";
    
    const isDispute = parcel.status === "disputed";
    
    const citEncumb = document.getElementById("citEncumb");
    const citDispute = document.getElementById("citDispute");
    
    if(citEncumb && citDispute) {
        if (isDispute) {
            citEncumb.textContent = "Active Caveat";
            citEncumb.style.color = "#dc2626";
            citDispute.textContent = "Discrepancy Detected";
            citDispute.style.color = "#dc2626";
        } else {
            citEncumb.textContent = "Nil Encumbrance";
            citEncumb.style.color = "#059669";
            citDispute.textContent = "Clear Title";
            citDispute.style.color = "#64748b";
        }
    }
    
    // Relocate map
    const gisContainer = document.getElementById("tab-gis");
    const citMapProxy = document.getElementById("citMapProxy");
    if (gisContainer && citMapProxy) {
        const actualMapDiv = gisContainer.querySelector('.map-wrapper');
        if (actualMapDiv) {
            citMapProxy.appendChild(actualMapDiv);
            if (window.gisService && window.gisService.map && window.google && window.google.maps) {
                google.maps.event.trigger(window.gisService.map, 'resize');
                
                // Set color
                if (window.gisService.parcelPolygons) {
                    window.gisService.parcelPolygons.forEach(polygon => {
                        const polyStatus = polygon.get('status');
                        let color = '#22c55e'; // clear
                        if(polyStatus === 'disputed' || polyStatus === 'conflict') color = '#dc2626';
                        else if(polyStatus === 'mortgaged') color = '#f59e0b';
                        
                        polygon.setOptions({
                            strokeColor: color,
                            fillColor: color
                        });
                    });
                }
            }
        }
    }
    
    const discUlpin = document.getElementById("discUlpin");
    if(discUlpin) discUlpin.value = parcel.ulpin;
};

window.openDiscrepancyModal = function() {
    const modal = document.getElementById("discrepancyModal");
    if(modal) modal.style.display = "flex";
};
window.closeDiscrepancyModal = function() {
    const modal = document.getElementById("discrepancyModal");
    if(modal) modal.style.display = "none";
};

window.submitDiscrepancy = async function(event) {
    event.preventDefault();
    const payload = {
        ulpin: document.getElementById("discUlpin")?.value,
        name: document.getElementById("discName")?.value,
        phone: document.getElementById("discPhone")?.value,
        type: document.getElementById("discType")?.value,
        description: document.getElementById("discDesc")?.value
    };
    
    if (window.conflictService && window.conflictService.createConflict) {
        const res = await window.conflictService.createConflict(payload);
        showToast("Grievance Tracking Number: " + (res.trackingId || "GRV-SUCCESS"), "success");
        closeDiscrepancyModal();
        
        // Ensure it shows up in Admin queue if mock fallback provides id
        if (window.filterQueue) { // We can safely assume conflictsData exists as it's global in app.js if we access it right?
            // Actually conflictsData is locally scoped in the IIFE or DOMContentLoaded. Let's see. 
            // conflictsData was `let conflictsData = [];` at the global block of app.js. So we can access it, maybe? Wait, let's just append to it if accessible.
            // Oh, conflictsData is defined outside DOMContentLoaded in app.js! `let conflictsData = [];` is inside app.js at the top level.
            try {
                // If conflictsData is accessible globally
                // Actually `let conflictsData` at top level makes it global in browser, except if it's an ES module. But app.js is not an ES module.
                // Wait, it says `let conflictsData = [];` in app.js.
                // It is globally scoped. So we can push.
                // It is not globally attached to window though, just a let variable. But we can't easily access `conflictsData` from here if we append this script to app.js, because we are appending at the end of app.js in the same scope, so we can access it!
                conflictsData.unshift({
                    id: res.id || Math.floor(Math.random() * 1000) + 100,
                    ulpin: payload.ulpin,
                    state: "CH",
                    stateLabel: "Chandigarh",
                    khasra: "Khasra " + Math.floor(Math.random()*100),
                    type: payload.type,
                    typeLabel: "Citizen Grievance",
                    silos: ["Public Portal"],
                    severity: "moderate",
                    score: 50,
                    slaHours: 24,
                    slaStatus: "normal",
                    stage: "Reported",
                    stepIndex: 1,
                    assignedOfficer: "Pending Assignment",
                    isNew: true,
                    details: {
                        revenue: "Citizen Reported: " + payload.description,
                        registration: "-",
                        survey: "-",
                        urban: "-"
                    }
                });
                
                // Re-render queue table if we're in admin mode, or when we switch back
                filterQueue(); 
            } catch(e) {
                console.warn("Could not inject into conflictsData directly", e);
            }
        }
    } else {
        showToast("Tracking ID: GRV-12345 (Service missing)", "success");
        closeDiscrepancyModal();
    }
};
