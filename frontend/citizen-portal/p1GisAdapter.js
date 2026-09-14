/**
 * DHARAA — P3 / P1 GIS Interface Boundary Adapter
 * Part of Project DHARAA (Land Stack) • Smart India Hackathon 2026
 * 
 * Provides a clean, isolated integration seam for Presenter 1's GIS map layer.
 * P3 consumes this contract without hardcoding Mapbox/Leaflet or GIS calculations.
 */

(function (window) {
    'use strict';

    const P1GISAdapter = {
        version: "1.2.0",
        containerElement: null,
        searchContainerElement: null,
        currentParcel: null,
        layers: {
            revenue: true,
            registration: true,
            cadastral: true,
            overlapConflict: true
        },

        /**
         * Mount GIS viewport into target DOM element
         * @param {string|HTMLElement} target - Element ID or DOM node
         * @param {Object} options - Configuration options (center, zoom, layers)
         */
        mount: function (target, options = {}) {
            const el = typeof target === 'string' ? document.getElementById(target) : target;
            if (!el) {
                console.warn("[P1-GIS-Adapter] Mount target element not found:", target);
                return;
            }
            this.containerElement = el;
            if (this.currentParcel) {
                this.renderCadastralSvg(this.currentParcel);
            } else {
                this.renderPlaceholder(options);
            }
        },

        /**
         * Mount Search GIS Map Viewport for spatial parcel locator
         * @param {string|HTMLElement} target - Element ID or DOM node
         */
        mountSearchMap: function (target) {
            const el = typeof target === 'string' ? document.getElementById(target) : target;
            if (!el) return;
            this.searchContainerElement = el;
            this.renderSearchMapSvg();
        },

        /**
         * Set current active parcel boundary
         * @param {Object} parcel - Normalized parcel object with coordinates and ULPIN
         */
        setParcel: function (parcel) {
            this.currentParcel = parcel;
            if (!this.containerElement) return;

            // If P1 has injected a live Mapbox/Leaflet instance onto window.DharaaLiveMap, delegate to it
            if (window.DharaaLiveMap && typeof window.DharaaLiveMap.flyToParcel === 'function') {
                window.DharaaLiveMap.flyToParcel(parcel.ulpin, parcel.coordinates);
                return;
            }

            // High-fidelity fallback SVG cadastral renderer
            this.renderCadastralSvg(parcel);
        },

        /**
         * Highlight or toggle spatial conflict overlay
         * @param {string} conflictType - 'spatial_overlap' | 'buffer_breach' | 'encroachment'
         */
        highlightConflict: function (conflictType) {
            const overlay = this.containerElement ? this.containerElement.querySelector('.hazard-polygon') : null;
            if (overlay) {
                overlay.style.display = overlay.style.display === 'none' ? 'block' : 'none';
            }
        },

        /**
         * Toggle individual department boundary layers
         */
        toggleLayer: function (layerKey, isVisible) {
            this.layers[layerKey] = isVisible;
            if (this.currentParcel) {
                this.renderCadastralSvg(this.currentParcel);
            }
        },

        /**
         * Render default standby placeholder state
         */
        renderPlaceholder: function (options) {
            if (!this.containerElement) return;
            this.containerElement.innerHTML = `
                <div class="gis-placeholder-state">
                    <div class="gis-crosshair"></div>
                    <div class="gis-overlay-badge">
                        <i data-lucide="compass" style="width: 14px; height: 14px;"></i>
                        <span>P1 GIS Layer Boundary &bull; WGS84 Geodetic Grid</span>
                    </div>
                    <div style="text-align: center; color: var(--slate-400); padding: 40px 20px;">
                        <i data-lucide="map" style="width: 36px; height: 36px; stroke-width: 1.5; margin-bottom: 8px;"></i>
                        <div style="font-size: 14.5px; font-weight: 500; color: var(--slate-600);">Spatial Layer Standby</div>
                        <div style="font-size: 13px; color: var(--slate-400); max-width: 320px; margin-top: 4px;">
                            Select a parcel or search by ULPIN to render GIS boundary vectors and cadastral overlays.
                        </div>
                    </div>
                </div>
            `;
            if (window.renderIcons) window.renderIcons();
        },

        /**
         * High-fidelity fallback SVG Cadastral Renderer
         * Shows 4-department spatial boundaries, rover coordinates, and divergence polygons
         */
        renderCadastralSvg: function (parcel) {
            if (!this.containerElement) return;

            const isOverlapCase = parcel.ulpin === "CH-04-0012-8821-9041";
            const isVerifiedCase = parcel.ulpin === "CH-01-1002-3344-5566";
            const isEncroachCase = parcel.ulpin === "TN-04-3420-2921-7744";
            const isUnavailableCase = parcel.ulpin === "CH-02-0045-1190-2021";
            const coords = parcel.departments.survey ? parcel.departments.survey.coordinates : "30.7412° N, 76.7854° E";

            this.containerElement.innerHTML = `
                <div class="cadastral-gis-viewport">
                    <!-- Map Controls Header -->
                    <div class="gis-control-bar">
                        <div class="gis-badge">
                            <span class="gis-live-dot" style="${isUnavailableCase ? 'background: var(--slate-400); box-shadow: none;' : ''}"></span>
                            <span class="mono" style="font-size: 12px; font-weight: 600;">
                                ${isUnavailableCase ? 'SVAMITVA DRONE FLIGHT PENDING' : 'DGPS ROVER: ' + coords}
                            </span>
                        </div>
                        <div class="gis-layer-toggles">
                            <label class="gis-toggle-pill ${this.layers.registration ? 'active' : ''}">
                                <input type="checkbox" ${this.layers.registration ? 'checked' : ''} onchange="P1GISAdapter.toggleLayer('registration', this.checked)">
                                <span>SRO Deed</span>
                            </label>
                            <label class="gis-toggle-pill ${this.layers.cadastral ? 'active' : ''}">
                                <input type="checkbox" ${this.layers.cadastral ? 'checked' : ''} onchange="P1GISAdapter.toggleLayer('cadastral', this.checked)">
                                <span>Cadastral GIS</span>
                            </label>
                            ${(isOverlapCase || isEncroachCase) ? `
                            <label class="gis-toggle-pill danger ${this.layers.overlapConflict ? 'active' : ''}">
                                <input type="checkbox" ${this.layers.overlapConflict ? 'checked' : ''} onchange="P1GISAdapter.toggleLayer('overlapConflict', this.checked)">
                                <span>Encroachment Area</span>
                            </label>
                            ` : ''}
                        </div>
                    </div>

                    <!-- Cadastral Vector Map Stage -->
                    <svg viewBox="0 0 600 340" class="cadastral-svg" preserveAspectRatio="xMidYMid meet">
                        <defs>
                            <pattern id="gridPattern" width="30" height="30" patternUnits="userSpaceOnUse">
                                <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(203, 213, 225, 0.4)" stroke-width="1"/>
                            </pattern>
                            <pattern id="hazardStripe" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                                <line x1="0" y1="0" x2="0" y2="8" stroke="rgba(220, 38, 38, 0.7)" stroke-width="3" />
                            </pattern>
                            <pattern id="dotsPattern" width="12" height="12" patternUnits="userSpaceOnUse">
                                <circle cx="2" cy="2" r="1.5" fill="rgba(100, 116, 139, 0.4)" />
                            </pattern>
                        </defs>

                        <!-- Background Grid -->
                        <rect width="100%" height="100%" fill="#f8fafc" />
                        <rect width="100%" height="100%" fill="url(#gridPattern)" />

                        <!-- Adjacent Parcels (Context) -->
                        <polygon points="40,40 220,40 220,130 40,130" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1.5" opacity="0.6"/>
                        <text x="75" y="90" fill="#64748b" font-size="12" font-family="Inter">Adjacent Plot (North)</text>

                        <polygon points="410,40 560,40 560,280 410,280" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1.5" opacity="0.6"/>
                        <text x="440" y="160" fill="#64748b" font-size="12" font-family="Inter">Statutory Service Road</text>

                        ${isUnavailableCase ? `
                        <!-- Legacy Lal Dora Offline Boundary (Dashed Orange/Slate) -->
                        <polygon points="120,80 390,80 390,260 120,260" 
                                 fill="url(#dotsPattern)" 
                                 stroke="var(--slate-400)" 
                                 stroke-width="2" 
                                 stroke-dasharray="6 4" />
                        <rect x="150" y="140" width="300" height="50" rx="6" fill="var(--slate-900)" opacity="0.9" />
                        <text x="170" y="162" fill="#e2e8f0" font-size="12" font-weight="700" font-family="Inter">
                            SVAMITVA DRONE RESURVEY PENDING
                        </text>
                        <text x="170" y="178" fill="#94a3b8" font-size="11" font-family="Inter">
                            Paper Record Misl-Haqiat Khata 45 &bull; Ground Truthing Q4 2026
                        </text>
                        ` : isVerifiedCase ? `
                        <!-- Clean Verified Boundary: SRO and Cadastral in 100% Agreement -->
                        <polygon points="120,80 390,80 390,260 120,260" 
                                 fill="rgba(5, 150, 105, 0.12)" 
                                 stroke="var(--emerald-600)" 
                                 stroke-width="2.5" />
                        <text x="135" y="105" fill="var(--emerald-700)" font-size="12" font-weight="700" font-family="Inter">
                            Harmonized Boundary &bull; 100% Agreement (500 sq.yd / 0% variance)
                        </text>
                        <text x="135" y="245" fill="var(--emerald-600)" font-size="11.5" font-weight="600" font-family="JetBrains Mono">
                            Consensus Sealed &bull; All 4 Registries Verified
                        </text>
                        ` : `
                        <!-- Primary Parcel: SRO Deed Boundary (Blue Outline) -->
                        ${this.layers.registration ? `
                        <polygon points="120,80 390,80 390,260 120,260" 
                                 fill="rgba(37, 99, 235, 0.08)" 
                                 stroke="var(--navy-600)" 
                                 stroke-width="2.5" 
                                 stroke-dasharray="none" />
                        <text x="135" y="105" fill="var(--navy-700)" font-size="12" font-weight="600" font-family="Inter">
                            SRO Registered Deed Boundary (${parcel.area.localDisplay})
                        </text>
                        ` : ''}

                        <!-- Cadastral DGPS Drone Boundary (Teal/Emerald Polygon) -->
                        ${this.layers.cadastral ? `
                        <polygon points="${isOverlapCase ? '120,80 340,80 340,260 120,260' : isEncroachCase ? '120,80 360,80 360,260 120,260' : '120,80 390,80 390,260 120,260'}" 
                                 fill="rgba(13, 148, 136, 0.12)" 
                                 stroke="var(--teal-600)" 
                                 stroke-width="2" 
                                 stroke-dasharray="5 3" />
                        <text x="135" y="245" fill="var(--teal-800)" font-size="12" font-weight="600" font-family="Inter">
                            Cadastral Survey Polygon (${isOverlapCase ? '398 sq.yd' : isEncroachCase ? '1.14 Acres' : parcel.area.localDisplay})
                        </text>
                        ` : ''}

                        <!-- Divergence / Conflict Overlay Region -->
                        ${(isOverlapCase && this.layers.overlapConflict) ? `
                        <g class="hazard-polygon">
                            <polygon points="340,80 390,80 390,260 340,260" 
                                     fill="url(#hazardStripe)" 
                                     stroke="var(--red-600)" 
                                     stroke-width="2" />
                            <rect x="330" y="140" width="125" height="42" rx="4" fill="var(--navy-950)" opacity="0.95"/>
                            <text x="340" y="157" fill="#fecaca" font-size="10.5" font-weight="700" font-family="Inter">OVERLAP ALERT</text>
                            <text x="340" y="172" fill="#ffffff" font-size="11" font-weight="600" font-family="JetBrains Mono">-52 sq.yd Discrepancy</text>
                        </g>
                        ` : (isEncroachCase && this.layers.overlapConflict) ? `
                        <g class="hazard-polygon">
                            <polygon points="360,80 390,80 390,260 360,260" 
                                     fill="url(#hazardStripe)" 
                                     stroke="var(--red-600)" 
                                     stroke-width="2" />
                            <rect x="340" y="140" width="130" height="42" rx="4" fill="var(--navy-950)" opacity="0.95"/>
                            <text x="348" y="157" fill="#fecaca" font-size="10.5" font-weight="700" font-family="Inter">WATERBODY BUFFER</text>
                            <text x="348" y="172" fill="#ffffff" font-size="11" font-weight="600" font-family="JetBrains Mono">-0.11 Acre Encroachment</text>
                        </g>
                        ` : ''}
                        `}

                        <!-- Corner Boundary Coordinates Markers -->
                        <circle cx="120" cy="80" r="4" fill="var(--navy-900)" />
                        <circle cx="390" cy="80" r="4" fill="var(--navy-900)" />
                        <circle cx="390" cy="260" r="4" fill="var(--navy-900)" />
                        <circle cx="120" cy="260" r="4" fill="var(--navy-900)" />

                        <!-- Compass Rose / North Arrow -->
                        <g transform="translate(540, 45)">
                            <circle cx="0" cy="0" r="16" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>
                            <polygon points="0,-12 4,2 0,0 -4,2" fill="var(--red-600)" />
                            <polygon points="0,12 4,2 0,0 -4,2" fill="var(--slate-600)" />
                            <text x="-4" y="-14" fill="var(--slate-800)" font-size="9" font-weight="700" font-family="Inter">N</text>
                        </g>
                    </svg>

                    <!-- Spatial Metadata Footer -->
                    <div class="gis-footer-strip">
                        <div><strong style="color: var(--slate-700);">ULPIN:</strong> <span class="mono">${parcel.ulpin}</span></div>
                        <div><strong style="color: var(--slate-700);">Centroid:</strong> ${coords}</div>
                        <div><strong style="color: var(--slate-700);">Datum:</strong> EPSG:4326 (WGS84 Geodetic)</div>
                    </div>
                </div>
            `;
            if (window.renderIcons) window.renderIcons();
        },

        /**
         * Render Search Map SVG Overview (Spatial Parcel Locator)
         */
        renderSearchMapSvg: function () {
            if (!this.searchContainerElement) return;

            this.searchContainerElement.innerHTML = `
                <div class="cadastral-gis-viewport" style="border: 1px solid var(--border-subtle); border-radius: var(--radius); overflow: hidden;">
                    <div class="gis-control-bar">
                        <div class="gis-badge">
                            <span class="gis-live-dot"></span>
                            <span style="font-size: 12.5px; font-weight: 600; color: var(--slate-800);">P1 GIS Spatial Parcel Map &bull; Multi-District Cadastral Overview</span>
                        </div>
                        <div style="font-size: 12px; color: var(--slate-500);">
                            Click a parcel pin to inspect live dossier
                        </div>
                    </div>

                    <svg viewBox="0 0 800 320" class="cadastral-svg" style="min-height: 240px;" preserveAspectRatio="xMidYMid meet">
                        <defs>
                            <pattern id="searchGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(203, 213, 225, 0.45)" stroke-width="1"/>
                            </pattern>
                        </defs>

                        <rect width="100%" height="100%" fill="#f1f5f9" />
                        <rect width="100%" height="100%" fill="url(#searchGrid)" />

                        <!-- Region A: Chandigarh UT Sector Cluster -->
                        <rect x="60" y="40" width="300" height="230" rx="8" fill="#ffffff" stroke="var(--border-strong)" stroke-width="1.5" />
                        <text x="80" y="70" fill="var(--navy-900)" font-size="14" font-weight="700" font-family="Inter">Chandigarh (UT) Cluster</text>
                        <text x="80" y="88" fill="var(--slate-500)" font-size="12" font-family="Inter">Sector 17 & Mani Majra Cadastre</text>

                        <!-- Plot 1: CH-04 Flagship Conflict -->
                        <g style="cursor: pointer;" onclick="loadAndDisplayParcel('CH-04-0012-8821-9041', true)">
                            <rect x="85" y="110" width="120" height="65" rx="4" fill="rgba(239, 68, 68, 0.1)" stroke="var(--red-500)" stroke-width="1.8" />
                            <text x="95" y="132" fill="var(--red-600)" font-size="11" font-weight="700" font-family="Inter">CH-04...9041</text>
                            <text x="95" y="148" fill="var(--slate-700)" font-size="10" font-family="Inter">Khasra 142/2 (48/100)</text>
                            <text x="95" y="163" fill="var(--red-500)" font-size="9.5" font-weight="600" font-family="Inter">Spatial Overlap Alert</text>
                        </g>

                        <!-- Plot 2: CH-01 Verified -->
                        <g style="cursor: pointer;" onclick="loadAndDisplayParcel('CH-01-1002-3344-5566', true)">
                            <rect x="220" y="110" width="120" height="65" rx="4" fill="rgba(5, 150, 105, 0.1)" stroke="var(--emerald-600)" stroke-width="1.8" />
                            <text x="230" y="132" fill="var(--emerald-700)" font-size="11" font-weight="700" font-family="Inter">CH-01...5566</text>
                            <text x="230" y="148" fill="var(--slate-700)" font-size="10" font-family="Inter">Plot 12 (98/100)</text>
                            <text x="230" y="163" fill="var(--emerald-600)" font-size="9.5" font-weight="600" font-family="Inter">100% Verified Title</text>
                        </g>

                        <!-- Plot 3: CH-02 Unavailable -->
                        <g style="cursor: pointer;" onclick="loadAndDisplayParcel('CH-02-0045-1190-2021', true)">
                            <rect x="85" y="190" width="255" height="55" rx="4" fill="rgba(148, 163, 184, 0.15)" stroke="var(--slate-400)" stroke-width="1.5" stroke-dasharray="4 3" />
                            <text x="95" y="212" fill="var(--slate-700)" font-size="11" font-weight="700" font-family="Inter">CH-02-0045-1190-2021 &bull; Mani Majra Rural</text>
                            <text x="95" y="230" fill="var(--slate-500)" font-size="10" font-family="Inter">Legacy Lal Dora Paper Record (SVAMITVA Resurvey Pending)</text>
                        </g>

                        <!-- Region B: Tamil Nadu Pilot Cluster -->
                        <rect x="420" y="40" width="340" height="230" rx="8" fill="#ffffff" stroke="var(--border-strong)" stroke-width="1.5" />
                        <text x="440" y="70" fill="var(--navy-900)" font-size="14" font-weight="700" font-family="Inter">Tamil Nadu Pilot Cluster</text>
                        <text x="440" y="88" fill="var(--slate-500)" font-size="12" font-family="Inter">Chengalpattu & Kanchipuram Taluks</text>

                        <!-- Plot 4: TN-12 Pending -->
                        <g style="cursor: pointer;" onclick="loadAndDisplayParcel('TN-12-4091-7712-3302', true)">
                            <rect x="440" y="110" width="140" height="65" rx="4" fill="rgba(245, 158, 11, 0.1)" stroke="var(--amber-500)" stroke-width="1.8" />
                            <text x="450" y="132" fill="var(--amber-600)" font-size="11" font-weight="700" font-family="Inter">TN-12...3302</text>
                            <text x="450" y="148" fill="var(--slate-700)" font-size="10" font-family="Inter">Patta #418 (68/100)</text>
                            <text x="450" y="163" fill="var(--amber-600)" font-size="9.5" font-weight="600" font-family="Inter">Transliteration Review</text>
                        </g>

                        <!-- Plot 5: TN-08 Overdue Mutation -->
                        <g style="cursor: pointer;" onclick="loadAndDisplayParcel('TN-08-9921-1200-5541', true)">
                            <rect x="595" y="110" width="145" height="65" rx="4" fill="rgba(220, 38, 38, 0.1)" stroke="var(--red-600)" stroke-width="1.8" />
                            <text x="605" y="132" fill="var(--red-600)" font-size="11" font-weight="700" font-family="Inter">TN-08...5541</text>
                            <text x="605" y="148" fill="var(--slate-700)" font-size="10" font-family="Inter">Survey 88/4B (41/100)</text>
                            <text x="605" y="163" fill="var(--red-600)" font-size="9.5" font-weight="600" font-family="Inter">SLA Breached (-8h)</text>
                        </g>

                        <!-- Plot 6: TN-04 Encroachment -->
                        <g style="cursor: pointer;" onclick="loadAndDisplayParcel('TN-04-3420-2921-7744', true)">
                            <rect x="440" y="190" width="300" height="55" rx="4" fill="rgba(220, 38, 38, 0.08)" stroke="var(--red-500)" stroke-width="1.5" />
                            <text x="450" y="212" fill="var(--red-600)" font-size="11" font-weight="700" font-family="Inter">TN-04-3420-2921-7744 &bull; Minjur Agricultural (38/100)</text>
                            <text x="450" y="230" fill="var(--slate-600)" font-size="10" font-family="Inter">ERIS Lake Poramboke Buffer Encroachment Alert (-0.11 Acre)</text>
                        </g>
                    </svg>

                    <div class="gis-footer-strip">
                        <div><strong style="color: var(--slate-700);">Active Projection:</strong> Web Mercator / WGS84</div>
                        <div><strong style="color: var(--slate-700);">Ingested Pilots:</strong> Chandigarh (UT) &bull; Tamil Nadu</div>
                        <div><strong style="color: var(--slate-700);">P1 Layer Status:</strong> Ready for Live Vector Tile Injection</div>
                    </div>
                </div>
            `;
            if (window.renderIcons) window.renderIcons();
        }
    };

    window.P1GISAdapter = P1GISAdapter;

})(window);
