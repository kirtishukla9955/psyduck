/**
 * DHARAA Land Trust Engine - Admin Dashboard
 * Admin Parcel Management Service & UI Controller
 * Enables authorized District Admins and Nodal Officers to create and update cadastral parcels,
 * with full database persistence, spatial integrity validation, and real-time GIS map synchronization.
 */

const dharaaAdmin = {
    isEditMode: false,
    activeUlpin: null,
    drawnOverlay: null,
    drawingModeActive: false,
    manualVertices: [],
    manualMarkers: [],
    manualPolyline: null,

    // Sample Cadastral Polygons for quick demo/testing
    SAMPLE_POLYGONS: {
        CH_SEC17: {
            name: "Chandigarh Sector 17 Commercial Plot",
            state: "Chandigarh",
            state_code: "CH",
            district: "Chandigarh South",
            land_use: "Commercial",
            coordinates: [
                [76.7820, 30.7410],
                [76.7836, 30.7410],
                [76.7836, 30.7424],
                [76.7820, 30.7424],
                [76.7820, 30.7410]
            ]
        },
        CH_SEC22: {
            name: "Chandigarh Sector 22 Residential Plot",
            state: "Chandigarh",
            state_code: "CH",
            district: "Chandigarh West",
            land_use: "Residential",
            coordinates: [
                [76.7720, 30.7350],
                [76.7734, 30.7350],
                [76.7734, 30.7362],
                [76.7720, 30.7362],
                [76.7720, 30.7350]
            ]
        },
        TN_CHENGALPATTU: {
            name: "Tamil Nadu Chengalpattu Agricultural Parcel",
            state: "Tamil Nadu",
            state_code: "TN",
            district: "Chengalpattu",
            land_use: "Agricultural",
            coordinates: [
                [79.7020, 15.6670],
                [79.7035, 15.6670],
                [79.7035, 15.6682],
                [79.7020, 15.6682],
                [79.7020, 15.6670]
            ]
        }
    },

    /**
     * Open Parcel Entry or Edit Modal
     * @param {string|null} ulpin - If provided, opens in Edit mode for that parcel
     */
    async openParcelModal(ulpin = null) {
        const modal = document.getElementById('parcelModal');
        if (!modal) return;

        this.clearAlert();
        const submitBtn = document.getElementById('parcelFormSubmitBtn');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i data-lucide="check" style="width:16px;height:16px;"></i> <span>Save Parcel</span>';
        }

        if (ulpin && typeof ulpin === 'string' && ulpin.trim()) {
            // EDIT MODE
            this.isEditMode = true;
            this.activeUlpin = ulpin.trim();

            const titleEl = document.getElementById('parcelModalTitle');
            if (titleEl) {
                titleEl.innerHTML = `<i data-lucide="edit-3" style="width: 20px; height: 20px; color: var(--navy-600);"></i> <span>Edit Parcel: <strong class="mono" style="color:var(--navy-700);">${this.activeUlpin}</strong></span>`;
            }

            const ulpinInput = document.getElementById('parcelFormUlpin');
            if (ulpinInput) {
                ulpinInput.value = this.activeUlpin;
                ulpinInput.readOnly = true;
                ulpinInput.style.backgroundColor = 'var(--slate-100)';
            }
            const autoUlpinBtn = document.getElementById('btnAutoGenerateUlpin');
            if (autoUlpinBtn) autoUlpinBtn.style.display = 'none';

            // Show loading placeholder while fetching latest record
            this.showAlert('Loading parcel record from database...', 'info');

            try {
                const parcel = await window.parcelService.getParcelByUlpin(this.activeUlpin);
                this.clearAlert();
                this.populateForm(parcel);
            } catch (err) {
                console.error('[Admin] Failed to load parcel for editing:', err);
                this.showAlert(`Error loading parcel ${this.activeUlpin}: ${err.message}`, 'error');
            }

        } else {
            // CREATE MODE
            this.isEditMode = false;
            this.activeUlpin = null;

            const titleEl = document.getElementById('parcelModalTitle');
            if (titleEl) {
                titleEl.innerHTML = `<i data-lucide="plus-circle" style="width: 20px; height: 20px; color: var(--navy-600);"></i> <span>Add New Cadastral Parcel</span>`;
            }

            const ulpinInput = document.getElementById('parcelFormUlpin');
            if (ulpinInput) {
                ulpinInput.value = '';
                ulpinInput.readOnly = false;
                ulpinInput.style.backgroundColor = '';
                ulpinInput.placeholder = '14-digit ULPIN (or click Auto-Generate)';
            }
            const autoUlpinBtn = document.getElementById('btnAutoGenerateUlpin');
            if (autoUlpinBtn) autoUlpinBtn.style.display = 'inline-flex';

            this.resetForm();
            // Pre-generate a draft ULPIN
            this.autoGenerateUlpin();
        }

        modal.classList.add('open');
        modal.classList.add('active');
        modal.style.display = 'flex';
        modal.style.visibility = 'visible';
        if (typeof lucide !== 'undefined') lucide.createIcons();
    },

    /**
     * Close the Parcel Entry/Edit Modal
     */
    closeParcelModal() {
        const modal = document.getElementById('parcelModal');
        if (modal) {
            modal.classList.remove('open');
            modal.classList.remove('active');
            modal.style.display = 'none';
        }
        this.clearAlert();
    },

    /**
     * Populate form fields with existing parcel data
     */
    populateForm(parcel) {
        const setVal = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.value = (val !== null && val !== undefined) ? val : '';
        };

        setVal('parcelFormOwner', parcel.owner_name || '');
        setVal('parcelFormLandUse', parcel.land_use || 'Residential');
        setVal('parcelFormArea', parcel.area_sqm ? Number(parcel.area_sqm).toFixed(2) : '');
        setVal('parcelFormAreaUnit', 'sqm');
        setVal('parcelFormState', parcel.state || 'Chandigarh');
        setVal('parcelFormDistrict', parcel.village_or_city || '');
        setVal('parcelFormTrustStatus', parcel.trust_status || 'VERIFIED');
        setVal('parcelFormTaxDue', parcel.property_tax_due ? Number(parcel.property_tax_due).toFixed(2) : '0.00');

        const notes = parcel.ror_data?.admin_notes || parcel.notes || '';
        setVal('parcelFormNotes', notes);

        const geomTextarea = document.getElementById('parcelFormGeometry');
        if (geomTextarea && parcel.geometry) {
            geomTextarea.value = JSON.stringify(parcel.geometry, null, 2);
        }
    },

    /**
     * Reset form fields to defaults
     */
    resetForm() {
        const setVal = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.value = val;
        };

        setVal('parcelFormOwner', '');
        setVal('parcelFormLandUse', 'Residential');
        setVal('parcelFormArea', '');
        setVal('parcelFormAreaUnit', 'sqm');
        setVal('parcelFormState', 'Chandigarh');
        setVal('parcelFormDistrict', 'Chandigarh South');
        setVal('parcelFormTrustStatus', 'PENDING_VERIFICATION');
        setVal('parcelFormTaxDue', '0.00');
        setVal('parcelFormNotes', '');

        // Default to Chandigarh sample polygon
        const sample = this.SAMPLE_POLYGONS.CH_SEC17;
        const geomTextarea = document.getElementById('parcelFormGeometry');
        if (geomTextarea) {
            const geom = {
                type: 'Polygon',
                coordinates: [sample.coordinates]
            };
            geomTextarea.value = JSON.stringify(geom, null, 2);
        }
    },

    /**
     * Generate standard 14-character ULPIN with state prefix
     */
    autoGenerateUlpin() {
        const stateSelect = document.getElementById('parcelFormState');
        const state = stateSelect ? stateSelect.value : 'Chandigarh';
        let prefix = '01'; // Default Chandigarh
        if (state.includes('Tamil') || state === 'TN') prefix = '33';
        else if (state.includes('Andhra') || state === 'AP') prefix = '28';
        else if (state.includes('Delhi') || state === 'DL') prefix = '07';
        else if (state.includes('Uttar') || state === 'UP') prefix = '09';
        else if (state.includes('Maha') || state === 'MH') prefix = '27';
        else if (state.includes('Rajas') || state === 'RJ') prefix = '08';
        else if (state.includes('Guja') || state === 'GJ') prefix = '24';
        else if (state.includes('Bih') || state === 'BR') prefix = '10';
        else if (state.includes('West') || state === 'WB') prefix = '19';

        // 12 random numeric digits
        const randDigits = Array.from({ length: 12 }, () => Math.floor(Math.random() * 10)).join('');
        const ulpin = `${prefix}${randDigits}`;

        const ulpinInput = document.getElementById('parcelFormUlpin');
        if (ulpinInput) {
            ulpinInput.value = ulpin;
        }
        return ulpin;
    },

    /**
     * Load one of the preset sample polygons
     */
    loadSamplePolygon(key) {
        const sample = this.SAMPLE_POLYGONS[key];
        if (!sample) return;

        const geomTextarea = document.getElementById('parcelFormGeometry');
        if (geomTextarea) {
            const geom = {
                type: 'Polygon',
                coordinates: [sample.coordinates]
            };
            geomTextarea.value = JSON.stringify(geom, null, 2);
        }

        const stateEl = document.getElementById('parcelFormState');
        if (stateEl) stateEl.value = sample.state;

        const districtEl = document.getElementById('parcelFormDistrict');
        if (districtEl) districtEl.value = sample.district;

        const landUseEl = document.getElementById('parcelFormLandUse');
        if (landUseEl) landUseEl.value = sample.land_use;

        if (!this.isEditMode) {
            this.autoGenerateUlpin();
        }

        this.calculateAreaFromTextarea();
        this.showAlert(`Loaded sample: ${sample.name}`, 'info');
    },

    /**
     * Handle .geojson or .json file upload
     */
    handleGeoJsonFileUpload(event) {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const parsed = JSON.parse(e.target.result);
                let geometry = parsed;
                if (parsed.type === 'Feature' && parsed.geometry) {
                    geometry = parsed.geometry;
                } else if (parsed.type === 'FeatureCollection' && parsed.features?.[0]?.geometry) {
                    geometry = parsed.features[0].geometry;
                }

                if (!geometry.type || !geometry.coordinates) {
                    throw new Error('File does not contain valid GeoJSON Polygon or MultiPolygon geometry');
                }

                const geomTextarea = document.getElementById('parcelFormGeometry');
                if (geomTextarea) {
                    geomTextarea.value = JSON.stringify(geometry, null, 2);
                }

                this.calculateAreaFromTextarea();
                this.showAlert(`Successfully loaded GeoJSON geometry from ${file.name}`, 'info');
            } catch (err) {
                this.showAlert(`Failed to parse GeoJSON file: ${err.message}`, 'error');
            }
        };
        reader.readAsText(file);
        event.target.value = ''; // Reset input
    },

    /**
     * Compute approximate geodesic area in sq.m from GeoJSON textarea
     */
    calculateAreaFromTextarea() {
        const geomTextarea = document.getElementById('parcelFormGeometry');
        if (!geomTextarea || !geomTextarea.value.trim()) return;

        try {
            const geom = JSON.parse(geomTextarea.value.trim());
            const coords = (geom.type === 'Polygon') ? geom.coordinates[0] : (geom.type === 'MultiPolygon' ? geom.coordinates[0][0] : null);
            if (!coords || coords.length < 3) return;

            // If Google Maps geometry library is available, use spherical computeArea
            if (window.google?.maps?.geometry?.spherical) {
                const path = coords.map(([lng, lat]) => new google.maps.LatLng(lat, lng));
                const areaSqm = google.maps.geometry.spherical.computeArea(path);
                const areaInput = document.getElementById('parcelFormArea');
                const unitSelect = document.getElementById('parcelFormAreaUnit');
                if (areaInput && (!areaInput.value || Number(areaInput.value) <= 0)) {
                    if (unitSelect && unitSelect.value === 'acres') {
                        areaInput.value = (areaSqm / 4046.8564).toFixed(3);
                    } else {
                        areaInput.value = areaSqm.toFixed(2);
                    }
                }
            }
        } catch (e) {
            // Silent ignore during typing
        }
    },

    /**
     * Start interactive polygon drawing on Google Maps
     */
    startMapDrawing() {
        // Hide modal temporarily
        const modal = document.getElementById('parcelModal');
        if (modal) modal.style.visibility = 'hidden';

        // Switch to GIS tab so user sees the map
        if (typeof switchTab === 'function') {
            switchTab('gis');
        }

        // Show floating drawing control banner
        const toolbar = document.getElementById('gisDrawingToolbar');
        if (toolbar) toolbar.style.display = 'flex';

        this.drawingModeActive = true;
        this.manualVertices = [];
        this.clearDrawnOverlays();

        const map = window.gisService?.map;
        if (!map) {
            this.showAlert('Google Maps is still initializing. Please wait a moment and try again.', 'error');
            this.cancelMapDrawing();
            return;
        }

        this.updateDrawingBadge();

        // Check if DrawingManager is available
        if (window.google?.maps?.drawing?.DrawingManager) {
            this.drawingManager = new google.maps.drawing.DrawingManager({
                drawingMode: google.maps.drawing.OverlayType.POLYGON,
                drawingControl: false,
                polygonOptions: {
                    fillColor: '#38bdf8',
                    fillOpacity: 0.35,
                    strokeWeight: 2.5,
                    strokeColor: '#0284c7',
                    clickable: false,
                    editable: true,
                    zIndex: 20
                }
            });
            this.drawingManager.setMap(map);

            google.maps.event.addListener(this.drawingManager, 'polygoncomplete', (polygon) => {
                this.drawnOverlay = polygon;
                this.drawingManager.setDrawingMode(null);
                const path = polygon.getPath().getArray();
                this.manualVertices = path.map(pt => [Number(pt.lng().toFixed(6)), Number(pt.lat().toFixed(6))]);
                this.updateDrawingBadge();
            });
        }

        // Fallback manual click listener on Google Map
        this.mapClickListener = map.addListener('click', (e) => {
            if (!this.drawingModeActive) return;
            const lat = Number(e.latLng.lat().toFixed(6));
            const lng = Number(e.latLng.lng().toFixed(6));
            this.manualVertices.push([lng, lat]);
            this.updateManualDrawingOnMap(map);
            this.updateDrawingBadge();
        });

        if (window.showToast) {
            showToast('Drawing Mode Active: Click map corners to outline parcel boundary.');
        }
    },

    /**
     * Render temporary markers and polyline for manual clicks
     */
    updateManualDrawingOnMap(map) {
        if (!this.manualPolyline) {
            this.manualPolyline = new google.maps.Polyline({
                map: map,
                path: this.manualVertices.map(([lng, lat]) => ({ lat, lng })),
                strokeColor: '#0284c7',
                strokeWeight: 2.5,
                zIndex: 20
            });
        } else {
            this.manualPolyline.setPath(this.manualVertices.map(([lng, lat]) => ({ lat, lng })));
        }

        // Add a vertex marker
        const lastPt = this.manualVertices[this.manualVertices.length - 1];
        if (lastPt) {
            const marker = new google.maps.Marker({
                position: { lat: lastPt[1], lng: lastPt[0] },
                map: map,
                icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 5,
                    fillColor: '#0284c7',
                    fillOpacity: 1,
                    strokeColor: '#ffffff',
                    strokeWeight: 2
                },
                zIndex: 21
            });
            this.manualMarkers.push(marker);
        }
    },

    updateDrawingBadge() {
        const badge = document.getElementById('drawingVertexCountBadge');
        if (badge) {
            const count = this.manualVertices.length;
            badge.textContent = `${count} ${count === 1 ? 'vertex' : 'vertices'}`;
        }
    },

    /**
     * Finish interactive drawing, export GeoJSON and restore modal
     */
    finishMapDrawing() {
        let coords = [...this.manualVertices];

        // If drawn via DrawingManager overlay
        if (this.drawnOverlay && this.drawnOverlay.getPath) {
            const path = this.drawnOverlay.getPath().getArray();
            coords = path.map(pt => [Number(pt.lng().toFixed(6)), Number(pt.lat().toFixed(6))]);
        }

        if (coords.length < 3) {
            alert('Please place at least 3 vertices on the map to define a valid polygon.');
            return;
        }

        // Close polygon ring (first vertex == last vertex)
        if (coords[0][0] !== coords[coords.length - 1][0] || coords[0][1] !== coords[coords.length - 1][1]) {
            coords.push([...coords[0]]);
        }

        const geojson = {
            type: 'Polygon',
            coordinates: [coords]
        };

        const geomTextarea = document.getElementById('parcelFormGeometry');
        if (geomTextarea) {
            geomTextarea.value = JSON.stringify(geojson, null, 2);
        }

        this.calculateAreaFromTextarea();
        this.cancelMapDrawing(false); // Cleanup without alerting

        // Restore modal
        const modal = document.getElementById('parcelModal');
        if (modal) {
            modal.style.visibility = 'visible';
            modal.style.display = 'flex';
            modal.classList.add('open');
            modal.classList.add('active');
        }

        if (window.showToast) {
            showToast('Cadastral geometry captured from map drawing.');
        }
    },

    /**
     * Cancel drawing mode and cleanup overlays
     */
    cancelMapDrawing(restoreModal = true) {
        this.drawingModeActive = false;
        this.clearDrawnOverlays();

        const toolbar = document.getElementById('gisDrawingToolbar');
        if (toolbar) toolbar.style.display = 'none';

        if (this.mapClickListener) {
            google.maps.event.removeListener(this.mapClickListener);
            this.mapClickListener = null;
        }

        if (this.drawingManager) {
            this.drawingManager.setMap(null);
            this.drawingManager = null;
        }

        if (restoreModal) {
            const modal = document.getElementById('parcelModal');
            if (modal) {
                modal.style.visibility = 'visible';
                modal.style.display = 'flex';
                modal.classList.add('open');
                modal.classList.add('active');
            }
        }
    },

    clearDrawnOverlays() {
        if (this.drawnOverlay) {
            this.drawnOverlay.setMap(null);
            this.drawnOverlay = null;
        }
        if (this.manualPolyline) {
            this.manualPolyline.setMap(null);
            this.manualPolyline = null;
        }
        if (this.manualMarkers) {
            this.manualMarkers.forEach(m => m.setMap(null));
            this.manualMarkers = [];
        }
        this.manualVertices = [];
    },

    /**
     * Validate and submit the parcel form (Create or Update)
     */
    async handleParcelFormSubmit(event) {
        if (event) event.preventDefault();
        this.clearAlert();

        const getVal = (id) => document.getElementById(id)?.value?.trim() || '';

        const ulpin = getVal('parcelFormUlpin');
        const ownerName = getVal('parcelFormOwner');
        const landUse = getVal('parcelFormLandUse') || 'Residential';
        const areaStr = getVal('parcelFormArea');
        const areaUnit = getVal('parcelFormAreaUnit') || 'sqm';
        const state = getVal('parcelFormState') || 'Chandigarh';
        const district = getVal('parcelFormDistrict') || 'Chandigarh South';
        const trustStatus = getVal('parcelFormTrustStatus') || 'PENDING_VERIFICATION';
        const taxDueStr = getVal('parcelFormTaxDue');
        const notes = getVal('parcelFormNotes');
        const geomRaw = document.getElementById('parcelFormGeometry')?.value?.trim();

        // 1. Basic validation
        if (!ownerName) {
            this.showAlert('Owner Legal Name is required.', 'error');
            document.getElementById('parcelFormOwner')?.focus();
            return;
        }

        if (!geomRaw) {
            this.showAlert('Cadastral Geometry (GeoJSON) is required. Please paste GeoJSON or use "Draw on Map".', 'error');
            return;
        }

        let geometry;
        try {
            geometry = JSON.parse(geomRaw);
        } catch (e) {
            this.showAlert(`Malformed GeoJSON syntax: ${e.message}`, 'error');
            return;
        }

        // Determine area in sqm or acres
        let areaSqm = null;
        let areaAcres = null;
        if (areaStr && !isNaN(Number(areaStr))) {
            const num = parseFloat(areaStr);
            if (num > 0) {
                if (areaUnit === 'acres') areaAcres = num;
                else areaSqm = num;
            }
        }

        const taxDue = (taxDueStr && !isNaN(Number(taxDueStr))) ? parseFloat(taxDueStr) : 0.0;

        // 2. Prepare payload
        const payload = {
            owner_name: ownerName,
            land_use: landUse,
            geometry: geometry,
            state: state,
            district: district,
            village_or_city: district,
            trust_status: trustStatus,
            property_tax_due: taxDue,
            notes: notes
        };

        if (areaSqm !== null) payload.area_sqm = areaSqm;
        if (areaAcres !== null) payload.area_acres = areaAcres;

        const submitBtn = document.getElementById('parcelFormSubmitBtn');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner-small"></span> <span>Persisting Record...</span>';
        }

        try {
            let result;
            if (this.isEditMode) {
                // UPDATE
                result = await window.parcelService.updateParcel(this.activeUlpin, payload);
                if (window.showToast) {
                    showToast(`Parcel ${result.ulpin} updated successfully!`);
                }
            } else {
                // CREATE
                if (ulpin) payload.ulpin = ulpin;
                result = await window.parcelService.createParcel(payload);
                if (window.showToast) {
                    showToast(`Parcel ${result.ulpin} registered and committed to database!`);
                }
            }

            // Close modal
            this.closeParcelModal();

            // Synchronize with GIS map
            await this.syncWithGisMap(result);

        } catch (err) {
            console.error('[Admin] Submission error:', err);
            let errMsg = err.message || 'Server error occurred during parcel persistence.';
            if (err.data && err.data.detail) {
                errMsg = typeof err.data.detail === 'string' ? err.data.detail : JSON.stringify(err.data.detail);
            }
            this.showAlert(errMsg, 'error');

            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i data-lucide="check" style="width:16px;height:16px;"></i> <span>Save Parcel</span>';
                if (typeof lucide !== 'undefined') lucide.createIcons();
            }
        }
    },

    /**
     * Post-submission GIS synchronization:
     * - Invalidate cached record
     * - Switch to GIS tab
     * - Center & fit map bounds to the parcel geometry
     * - Re-fetch viewport parcels so the polygon renders immediately
     * - Select the parcel and pop up its InfoWindow
     */
    async syncWithGisMap(parcel) {
        if (!parcel || !parcel.ulpin) return;

        // Switch to GIS tab
        if (typeof switchTab === 'function') {
            switchTab('gis');
        }

        const gis = window.gisService;
        if (!gis) return;

        // Invalidate cache
        if (gis.cachedParcelDetails) {
            delete gis.cachedParcelDetails[parcel.ulpin];
        }

        // Center map on parcel geometry
        if (gis.map && parcel.geometry) {
            const bounds = new google.maps.LatLngBounds();
            const coords = (parcel.geometry.type === 'Polygon')
                ? parcel.geometry.coordinates[0]
                : (parcel.geometry.type === 'MultiPolygon' ? parcel.geometry.coordinates[0][0] : []);

            coords.forEach(([lng, lat]) => bounds.extend({ lat, lng }));
            gis.map.fitBounds(bounds, { top: 90, bottom: 90, left: 90, right: 90 });
        }

        // Re-fetch viewport parcels immediately
        if (typeof gis.loadParcelsInViewport === 'function') {
            await gis.loadParcelsInViewport();
        }

        // Auto-select parcel to render InfoWindow
        setTimeout(() => {
            if (typeof gis.selectParcel === 'function') {
                gis.selectParcel(parcel.ulpin);
            }
        }, 300);
    },

    /**
     * Display inline alert box inside the modal
     */
    showAlert(msg, type = 'error') {
        const box = document.getElementById('parcelModalAlert');
        if (!box) return;

        box.textContent = msg;
        box.style.display = 'block';

        if (type === 'error') {
            box.style.background = '#fef2f2';
            box.style.color = '#dc2626';
            box.style.border = '1px solid #fecaca';
        } else if (type === 'info') {
            box.style.background = '#f0fdf4';
            box.style.color = '#15803d';
            box.style.border = '1px solid #bbf7d0';
        }
    },

    clearAlert() {
        const box = document.getElementById('parcelModalAlert');
        if (box) {
            box.style.display = 'none';
            box.textContent = '';
        }
    }
};

// Global attachment
if (typeof window !== 'undefined') {
    window.dharaaAdmin = dharaaAdmin;
    window.DharaaServices = window.DharaaServices || {};
    window.DharaaServices.adminParcelManager = dharaaAdmin;
}
