        // FALLBACK ICONS DICTIONARY (Ensures zero visual breakage in offline / CDN-blocked environments)
        const fallbackSvgIcons = {
            'layers': '<polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline>',
            'map-pin': '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle>',
            'user-check': '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><polyline points="16 11 18 13 22 9"></polyline>',
            'user-plus': '<path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line>',
            'user': '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle>',
            'shield': '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>',
            'bar-chart-3': '<path d="M3 3v18h18"></path><path d="M18 17V9"></path><path d="M13 17V5"></path><path d="M8 17v-3"></path>',
            'bell': '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path>',
            'inbox': '<polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path>',
            'git-pull-request': '<circle cx="18" cy="18" r="3"></circle><circle cx="6" cy="6" r="3"></circle><path d="M13 6h3a2 2 0 0 1 2 2v7"></path><line x1="6" y1="9" x2="6" y2="21"></line>',
            'pie-chart': '<path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path>',
            'map': '<polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon><line x1="8" y1="2" x2="8" y2="18"></line><line x1="16" y1="6" x2="16" y2="22"></line>',
            'hash': '<line x1="4" y1="9" x2="20" y2="9"></line><line x1="4" y1="15" x2="20" y2="15"></line><line x1="10" y1="3" x2="8" y2="21"></line><line x1="16" y1="3" x2="14" y2="21"></line>',
            'search': '<circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>',
            'sparkles': '<path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"></path>',
            'download': '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line>',
            'chevron-right': '<polyline points="9 18 15 12 9 6"></polyline>',
            'chevron-down': '<polyline points="6 9 12 15 18 9"></polyline>',
            'shield-alert': '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>',
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
            'building-2': '<path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"></path><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"></path><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"></path><path d="M10 6h4"></path><path d="M10 10h4"></path><path d="M10 14h4"></path><path d="M10 18h4"></path>',
            'send': '<line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>',
            'check': '<polyline points="20 6 9 17 4 12"></polyline>',
            'check-circle': '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>',
            'check-circle-2': '<circle cx="12" cy="12" r="10"></circle><path d="m9 12 2 2 4-4"></path>',
            'zap': '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>',
            'activity': '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>',
            'award': '<circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>',
            'arrow-left': '<line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline>',
            'x': '<line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>',
            'maximize': '<path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>',
            'shield-check': '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><polyline points="9 12 11 14 15 10"></polyline>'
        };

        function renderIcons() {
            if (window.lucide && typeof window.lucide.createIcons === 'function') {
                try {
                    window.lucide.createIcons();
                    return;
                } catch (e) {
                    console.warn("Lucide CDN error, falling back to inline SVGs", e);
                }
            }
            // Offline/CDN-blocked fallback: populate data-lucide tags with inline SVGs
            document.querySelectorAll("[data-lucide]").forEach(el => {
                const iconName = el.getAttribute("data-lucide");
                const w = el.style.width || "19px";
                const h = el.style.height || "19px";
                const pathData = fallbackSvgIcons[iconName] || '<circle cx="12" cy="12" r="8"></circle>';
                el.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-${iconName}">${pathData}</svg>`;
                el.style.display = "inline-flex";
                el.style.alignItems = "center";
                el.style.justifyContent = "center";
            });
        }

        if (!window.lucide) {
            window.lucide = { createIcons: renderIcons };
        }

        // MOCK DATA: LAND CONFLICT QUEUE
        const mockConflicts = [
            {
                id: 8,
                ulpin: "TN-04-3420-2921-7744",
                state: "TN",
                stateLabel: "Tamil Nadu",
                khasra: "Khasra 99/A, Tiruvallur",
                type: "spatial_overlap",
                typeLabel: "Live GIS Discrepancy (Overlapping Cadastral Boundary)",
                silos: ["Survey", "Revenue"],
                severity: "critical",
                score: 42,
                slaHours: 168,
                slaStatus: "normal",
                stage: "Detected",
                stepIndex: 1,
                assignedOfficer: "Harvinder Singh, Field Kanungo",
                isNew: true,
                details: {
                    revenue: "Jamabandi Area: 1.25 Acres",
                    registration: "Deed: 1.25 Acres",
                    survey: "Drone Survey: 1.14 Acres (-0.11 Acre encroachment alert)",
                    urban: "Outside municipal planning master plan"
                }
            },
            {
                id: 1,
                ulpin: "CH-04-0012-8821-9041",
                state: "CH",
                stateLabel: "Chandigarh",
                khasra: "Khasra 142/2, Sec 17",
                type: "spatial_overlap",
                typeLabel: "Spatial Boundary Overlap (52 sq.yd)",
                silos: ["Revenue", "SRO", "Cadastral Survey"],
                severity: "critical",
                score: 48,
                slaHours: 14,
                slaStatus: "warning",
                stage: "Under Review",
                stepIndex: 3,
                assignedOfficer: "Harvinder Singh, Field Kanungo",
                details: {
                    revenue: "Owner: Gurpreet Singh | Area: 450 sq.yd",
                    registration: "Deed #2024/8891 | Area: 450 sq.yd",
                    survey: "Cadastral Polygon: 398 sq.yd (-52 sq.yd overlap)",
                    urban: "Property Tax ID: CH-MC-908 (Zoning R-2)"
                }
            },
            {
                id: 2,
                ulpin: "TN-12-4091-7712-3302",
                state: "TN",
                stateLabel: "Tamil Nadu",
                khasra: "Patta 418, Chengalpattu",
                type: "owner_mismatch",
                typeLabel: "Deed / Patta Transliteration Mismatch",
                silos: ["Revenue", "Registration"],
                severity: "major",
                score: 68,
                slaHours: 42,
                slaStatus: "normal",
                stage: "Assigned",
                stepIndex: 2,
                assignedOfficer: "S. Meenakshi, Head Surveyor",
                details: {
                    revenue: "Patta Registered: Annamalai Muthuvel",
                    registration: "Deed Nominee: A. M. Velu (Transliteration)",
                    survey: "Sub-division FMB #418-A Verified",
                    urban: "Panchayat Agricultural Assessment"
                }
            },
            {
                id: 3,
                ulpin: "TN-08-9921-1200-5541",
                state: "TN",
                stateLabel: "Tamil Nadu",
                khasra: "Survey #88/4B, Sriperumbudur",
                type: "overdue_mutation",
                typeLabel: "Overdue Mutation (> 28 Days)",
                silos: ["Revenue", "Registration"],
                severity: "critical",
                score: 41,
                slaHours: -8, // Breached
                slaStatus: "breached",
                stage: "Assigned",
                stepIndex: 2,
                assignedOfficer: "Harvinder Singh, Field Kanungo",
                details: {
                    revenue: "Mutation Pending at Tehsildar Desk",
                    registration: "Sale Deed Executed: 29 Days Ago",
                    survey: "Boundary Unchanged",
                    urban: "DTCP Approval Pending"
                }
            },
            {
                id: 4,
                ulpin: "CH-02-7710-4412-1090",
                state: "CH",
                stateLabel: "Chandigarh",
                khasra: "Plot 89, Industrial Area Phase II",
                type: "land_use_drift",
                typeLabel: "Master Plan Land-Use Drift Flag",
                silos: ["Urban Dev", "Revenue"],
                severity: "major",
                score: 64,
                slaHours: 64,
                slaStatus: "normal",
                stage: "Under Review",
                stepIndex: 3,
                assignedOfficer: "Priya Sharma, Revenue Inspector",
                details: {
                    revenue: "Agricultural / Warehousing classification",
                    registration: "Lease agreement for Commercial Retail",
                    survey: "Plotted area conforms with master plan",
                    urban: "Unapproved commercial conversion flagged"
                }
            },
            {
                id: 5,
                ulpin: "TN-14-1182-3390-4411",
                state: "TN",
                stateLabel: "Tamil Nadu",
                khasra: "Survey #112/1, Kanchipuram",
                type: "spatial_overlap",
                typeLabel: "Waterbody Encroachment Buffer Breach",
                silos: ["Cadastral Survey", "Urban Dev"],
                severity: "critical",
                score: 38,
                slaHours: 6,
                slaStatus: "warning",
                stage: "Detected",
                stepIndex: 1,
                assignedOfficer: "Harvinder Singh, Field Kanungo",
                details: {
                    revenue: "Poramboke waterbody buffer margin violated",
                    registration: "Prior mortgage lien recorded 2021",
                    survey: "Boundary crosses ERIS Lake conservation line by 4.2m",
                    urban: "No NOC issued by Water Resources Dept"
                }
            },
            {
                id: 6,
                ulpin: "CH-05-9921-0021-4478",
                state: "CH",
                stateLabel: "Chandigarh",
                khasra: "Khasra 210, Mani Majra",
                type: "owner_mismatch",
                typeLabel: "Unsettled Succession Share Dispute",
                silos: ["Revenue"],
                severity: "moderate",
                score: 72,
                slaHours: 92,
                slaStatus: "normal",
                stage: "Under Review",
                stepIndex: 3,
                assignedOfficer: "K. Ramanathan, Tahsildar",
                details: {
                    revenue: "Mutated in name of single heir; caveat filed by siblings",
                    registration: "Gift deed challenged at Civil Court",
                    survey: "No spatial discrepancy",
                    urban: "Property tax billing on hold"
                }
            },
            {
                id: 7,
                ulpin: "TN-03-8821-4411-9920",
                state: "TN",
                stateLabel: "Tamil Nadu",
                khasra: "Old S.No 45/2, Coimbatore North",
                type: "overdue_mutation",
                typeLabel: "Automated FMB Resurvey Flag",
                silos: ["Survey", "Revenue"],
                severity: "moderate",
                score: 76,
                slaHours: 110,
                slaStatus: "normal",
                stage: "Assigned",
                stepIndex: 2,
                assignedOfficer: "Harvinder Singh, Field Kanungo",
                details: {
                    revenue: "Chitta verified against 2025 re-survey",
                    registration: "Deed verified",
                    survey: "Stone missing at Tri-junction marker B-14",
                    urban: "Not within municipal limits"
                }
            }
        ];

        async function loadConflicts() {
            try {
                if (window.conflictService && window.conflictService.getConflicts) {
                    const res = await window.conflictService.getConflicts();
                    if (res && res.conflicts) {
                        const apiConflicts = res.conflicts.map((c, i) => ({
                            id: 1000 + i,
                            ulpin: c.ulpin,
                            state: "CH",
                            stateLabel: "Chandigarh",
                            khasra: "Khasra -",
                            type: c.conflict_type.toLowerCase(),
                            typeLabel: c.conflict_type.replace(/_/g, ' '),
                            silos: c.involved_departments || [],
                            severity: c.severity ? c.severity.toLowerCase() : "moderate",
                            score: c.severity === 'HIGH' ? 85 : 50,
                            slaHours: 24,
                            slaStatus: "normal",
                            stage: "Reported",
                            stepIndex: 1,
                            assignedOfficer: "Pending Assignment",
                            isNew: true,
                            details: {
                                revenue: c.details,
                                registration: "-",
                                survey: "-",
                                urban: "-"
                            },
                            trackingId: c.conflicting_values?.tracking_id
                        }));
                        return [...apiConflicts, ...mockConflicts];
                    }
                }
            } catch (e) {
                console.warn("Failed to fetch conflicts from API, using mock", e);
            }
            return Promise.resolve(mockConflicts);
        }

        // APPLICATION STATE
        let conflictsData = [];

        // Translation Helper Functions for Dynamic Content
        let currentDetailConflictId = 8; // Default active conflict

        function getTypeTranslation(item) {
            if (!item) return "";
            if (window.DharaaI18n) {
                if (item.type === "spatial_overlap") {
                    if (item.id === 8) return window.DharaaI18n.t("type_live_gis_discrepancy");
                    return window.DharaaI18n.t("type_spatial_overlap");
                }
                if (item.type === "area_mismatch") return window.DharaaI18n.t("type_area_mismatch");
                if (item.type === "owner_mismatch") return window.DharaaI18n.t("type_owner_mismatch");
                if (item.type === "encumbrance_dispute") return window.DharaaI18n.t("type_encumbrance_dispute");
                if (item.type === "overdue_mutation") return window.DharaaI18n.t("type_mutation_sla");
                if (item.type === "land_use_drift") return window.DharaaI18n.t("type_land_use_drift");
            }
            return item.typeLabel || item.type;
        }

        function getStageTranslation(stage) {
            if (!stage) return "";
            if (!window.DharaaI18n) return stage;
            const s = stage.toLowerCase();
            if (s.includes("detect")) return window.DharaaI18n.t("step_detected").replace(/^\d+\.\s*/, "");
            if (s.includes("assign")) return window.DharaaI18n.t("step_assigned").replace(/^\d+\.\s*/, "");
            if (s.includes("review")) return window.DharaaI18n.t("step_review").replace(/^\d+\.\s*/, "");
            if (s.includes("harmoniz") || s.includes("resolv")) return window.DharaaI18n.t("step_harmonized").replace(/^\d+\.\s*/, "");
            return stage;
        }

        function getSiloTranslation(silo) {
            if (!silo) return "";
            if (!window.DharaaI18n) return silo;
            const s = silo.toLowerCase();
            if (s.includes("rev")) return window.DharaaI18n.t("silo_revenue");
            if (s.includes("reg") || s.includes("sro")) return window.DharaaI18n.t("silo_registration");
            if (s.includes("surv") || s.includes("cadastral")) return window.DharaaI18n.t("silo_survey");
            if (s.includes("urb") || s.includes("ulb")) return window.DharaaI18n.t("silo_urban");
            return silo;
        }

        window.reRenderActiveDetailView = function() {
            if (currentDetailConflictId !== null) {
                openDetailView(currentDetailConflictId, false);
            }
        };

        let currentRole = 'officer'; // 'officer' | 'admin' | 'policymaker'
        let currentOpenRowId = null;
        let activeWorkflowStep = 3; // 1: Detected, 2: Assigned, 3: Under Review, 4: Resolved
        let pendingAssignConflictId = null;

        // INITIALIZATION
        document.addEventListener("DOMContentLoaded", async () => {
            if (window.DharaaI18n) {
                window.DharaaI18n.init();
            }

            // Check server health to handle cold starts before loading data
            if (window.apiClient) {
                const loadingMsg = document.createElement("div");
                loadingMsg.id = "server-wake-msg";
                loadingMsg.style.cssText = "position:fixed; top:20px; left:50%; transform:translateX(-50%); background:#1e293b; color:#fff; padding:12px 24px; border-radius:8px; z-index:9999; box-shadow:0 10px 15px -3px rgb(0 0 0 / 0.1); font-size:14px; display:flex; align-items:center; gap:8px;";
                loadingMsg.innerHTML = `<svg class="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg> <span>Waking up the server, this can take up to a minute...</span>`;
                document.body.appendChild(loadingMsg);
                
                await window.apiClient.checkHealth();
                
                if (document.body.contains(loadingMsg)) {
                    document.body.removeChild(loadingMsg);
                }
            }

            conflictsData = await loadConflicts();
            filterQueue();
            updateNotificationCount();
            initCounters();
            setTrustScore(48);
            renderIcons();
            if (window.DharaaServices) {
                console.info("DHARAA Service Layer initialized:", Object.keys(window.DharaaServices));
            }
        });


        // MULTILINGUAL LANGUAGE SWITCHER HANDLER
        function changeLanguage(lang) {
            if (window.DharaaI18n) {
                window.DharaaI18n.setLanguage(lang);
            }
        }

        // RENDER QUEUE TABLE
        function renderQueueTable(data) {
            const tbody = document.getElementById("queueTableBody");
            if (!tbody) return;
            tbody.innerHTML = "";

            if (data.length === 0) {
                tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 32px; color: var(--slate-400);">${window.DharaaI18n ? window.DharaaI18n.t("empty_filter_message") : "No conflicts match the selected filter criteria."}</td></tr>`;
                return;
            }

            data.forEach(item => {
                const isAlert = item.isNew || item.slaStatus === 'breached' || item.slaHours < 0;

                // Main Row
                const tr = document.createElement("tr");
                tr.className = `conflict-row ${item.id === 1 && currentOpenRowId === null ? 'is-open' : item.id === currentOpenRowId ? 'is-open' : ''} ${isAlert ? 'new-anomaly' : ''}`;
                tr.id = `row-${item.id}`;
                tr.onclick = (e) => {
                    // Avoid accordion toggle when clicking direct action buttons
                    if (e.target.closest("button") || e.target.closest("a") || e.target.closest("select")) return;
                    toggleRowAccordion(item.id);
                };

                const tCritical = window.DharaaI18n ? window.DharaaI18n.t('severity_critical') : 'CRITICAL';
                const tMajor = window.DharaaI18n ? window.DharaaI18n.t('severity_major') : 'MAJOR';
                const tModerate = window.DharaaI18n ? window.DharaaI18n.t('severity_moderate') : 'MODERATE';
                const tSeveritySuffix = window.DharaaI18n ? window.DharaaI18n.t('severity_suffix') : 'SEVERITY';

                const severityBadge = item.severity === 'critical'
                    ? `<span class="badge badge-critical"><i data-lucide="shield-alert" style="width:13px;height:13px;"></i> ${tCritical} ${tSeveritySuffix}</span>`
                    : item.severity === 'major'
                        ? `<span class="badge badge-major"><i data-lucide="alert-circle" style="width:13px;height:13px;"></i> ${tMajor} ${tSeveritySuffix}</span>`
                        : `<span class="badge badge-moderate">${tModerate} ${tSeveritySuffix}</span>`;

                const stateBadge = item.state === 'CH'
                    ? `<span class="badge badge-state-ch">CH UT</span>`
                    : `<span class="badge badge-state-tn">TN</span>`;

                const tBreached = window.DharaaI18n ? window.DharaaI18n.t("sla_breached") : "Breached";
                const tAgo = window.DharaaI18n ? window.DharaaI18n.t("sla_ago") : "ago";
                const tLeft = window.DharaaI18n ? window.DharaaI18n.t("sla_left") : "left";

                const slaDisplay = item.slaHours < 0
                    ? `<span class="sla-timer breached"><i data-lucide="alert-octagon" style="width:16px;height:16px;"></i> ${tBreached} (${Math.abs(item.slaHours)}h ${tAgo})</span>`
                    : item.slaHours <= 24
                        ? `<span class="sla-timer warning"><i data-lucide="clock" style="width:16px;height:16px;"></i> ${item.slaHours}h ${tLeft}</span>`
                        : `<span class="sla-timer normal">${item.slaHours}h ${tLeft}</span>`;

                const itemTypeLabel = getTypeTranslation(item);
                const itemStageLabel = getStageTranslation(item.stage);
                const tUnassigned = window.DharaaI18n ? window.DharaaI18n.t("unassigned") : "Unassigned";

                tr.innerHTML = `
          <td>
            <i data-lucide="${currentOpenRowId === item.id || (item.id === 8 && currentOpenRowId === null) ? 'chevron-down' : 'chevron-right'}"
               id="chevron-${item.id}" style="width: 18px; height: 18px; color: var(--slate-400);"></i>
          </td>
          <td>
            <div style="font-weight: 600; color: var(--navy-900); font-size: 15.5px;" class="mono">${item.ulpin}</div>
            <div style="font-size: 13px; color: var(--slate-500); display: flex; align-items: center; gap: 6px; margin-top: 3px;">
              ${stateBadge}
              <span>${item.khasra}</span>
            </div>
          </td>
          <td>
            <div style="font-weight: 500; color: var(--slate-800); font-size: 15px;">${itemTypeLabel}</div>
          </td>
          <td>
            <div style="font-size: 13px; color: var(--slate-600); display: flex; gap: 5px; flex-wrap: wrap;">
              ${item.silos.map(s => `<span style="background:var(--slate-100); padding:2px 8px; border-radius:4px; font-size:12.5px;">${getSiloTranslation(s)}</span>`).join('')}
            </div>
          </td>
          <td>${severityBadge}</td>
          <td>${slaDisplay}</td>
          <td>
            <div style="font-size: 14.5px; font-weight: 600; color: var(--slate-700);">${itemStageLabel}</div>
            <div style="font-size: 13px; color: var(--slate-500); display: flex; align-items: center; gap: 5px; margin-top: 3px;">
              <i data-lucide="user" style="width: 14px; height: 14px; color: var(--slate-400);"></i>
              <span class="officer-name-display">${item.assignedOfficer || tUnassigned}</span>
            </div>
          </td>
          <td style="text-align: right;">
            <button class="btn-action" style="padding: 6px 12px; font-size: 14px; display: inline-flex; align-items: center; gap: 6px;" onclick="openDetailView(${item.id})">
              <i data-lucide="external-link" style="width: 15px; height: 15px;"></i> ${window.DharaaI18n ? window.DharaaI18n.t("btn_inspect") : "Inspect"}
            </button>
          </td>
        `;

                // Expansion Accordion Row
                const expTr = document.createElement("tr");
                expTr.className = `expansion-drawer ${item.id === 8 && currentOpenRowId === null ? 'is-open' : item.id === currentOpenRowId ? 'is-open' : ''}`;
                expTr.id = `drawer-${item.id}`;

                const tDrawerTitle = window.DharaaI18n ? window.DharaaI18n.t("drawer_snapshot_title") : "Cross-Departmental Record Discrepancy Snapshot";
                const tDrawerApi = window.DharaaI18n ? window.DharaaI18n.t("drawer_api_validated") : "Auto-validated via Open Land API v2.4";
                const tDeptRev = window.DharaaI18n ? window.DharaaI18n.t("dept_revenue") : "1. Revenue Registry";
                const tDeptReg = window.DharaaI18n ? window.DharaaI18n.t("dept_registration") : "2. Registration (SRO)";
                const tDeptSurv = window.DharaaI18n ? window.DharaaI18n.t("dept_survey") : "3. Cadastral Survey";
                const tDeptUrb = window.DharaaI18n ? window.DharaaI18n.t("dept_urban") : "4. Urban Dev (ULB)";
                const tRootCause = window.DharaaI18n ? window.DharaaI18n.t("drawer_root_cause_prefix") : "Root Cause: SRO deed executed without verifying real-time Cadastral GIS geo-fence.";
                const tAssignedLbl = window.DharaaI18n ? window.DharaaI18n.t("assigned_officer_label") : "Assigned:";

                expTr.innerHTML = `
          <td colspan="8" style="padding: 0;">
            <div class="drawer-content">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <div style="font-size: 14px; font-weight: 600; color: var(--navy-900);">
                  ${tDrawerTitle} &bull; <span class="mono">${item.ulpin}</span>
                </div>
                <div style="font-size: 13px; color: var(--slate-500);">${tDrawerApi}</div>
              </div>

              <div class="dept-reconciliation-grid">
                <div class="dept-cell">
                  <div class="dept-cell-header"><span>${tDeptRev}</span><i data-lucide="book" style="width:15px;height:15px;"></i></div>
                  <div class="dept-cell-value" style="font-size: 13.5px;">${item.details.revenue}</div>
                </div>
                <div class="dept-cell">
                  <div class="dept-cell-header"><span>${tDeptReg}</span><i data-lucide="file-check" style="width:15px;height:15px;"></i></div>
                  <div class="dept-cell-value" style="font-size: 13.5px;">${item.details.registration}</div>
                </div>
                <div class="dept-cell">
                  <div class="dept-cell-header"><span>${tDeptSurv}</span><i data-lucide="compass" style="width:15px;height:15px;"></i></div>
                  <div class="dept-cell-value ${item.type === 'spatial_overlap' ? 'mismatch' : ''}" style="font-size: 13.5px;">${item.details.survey}</div>
                </div>
                <div class="dept-cell">
                  <div class="dept-cell-header"><span>${tDeptUrb}</span><i data-lucide="building" style="width:15px;height:15px;"></i></div>
                  <div class="dept-cell-value" style="font-size: 13.5px;">${item.details.urban}</div>
                </div>
              </div>

              <div class="drawer-actions">
                <div style="font-size: 13px; color: var(--slate-500);">
                  ${tRootCause} &bull; <strong>${tAssignedLbl}</strong> ${item.assignedOfficer || tUnassigned}
                </div>
                <div style="display: flex; gap: 8px;">
                  ${currentRole === 'admin' ? `
                  <button class="btn-action" style="font-size: 14px; padding: 7px 14px; background: #e0f2fe; color: var(--navy-900); border-color: #bae6fd;" onclick="openAssignModal(${item.id})">
                    <i data-lucide="user-plus" style="width: 15px; height: 15px; color: var(--navy-600);"></i> ${window.DharaaI18n ? window.DharaaI18n.t("btn_assign") : "Assign"}
                  </button>
                  ` : ''}
                  <button class="btn-action" style="font-size: 14px; padding: 7px 14px;" onclick="openOrderModal(${item.id})">
                    <i data-lucide="send" style="width: 15px; height: 15px;"></i> ${window.DharaaI18n ? window.DharaaI18n.t("btn_order_notice") : "Order Joint Field Notice"}
                  </button>
                  <button class="btn-action btn-primary" style="font-size: 14px; padding: 7px 14px;" onclick="openDetailView(${item.id})">
                    ${window.DharaaI18n ? window.DharaaI18n.t("btn_open_stepper") : "Open Full Workflow Stepper &rarr;"}
                  </button>
                </div>
              </div>
            </div>
          </td>
        `;

                tbody.appendChild(tr);
                tbody.appendChild(expTr);
            });

            renderIcons();
        }

        // ACCORDION TOGGLE
        function toggleRowAccordion(id) {
            const allDrawers = document.querySelectorAll(".expansion-drawer");
            const allChevrons = document.querySelectorAll("[id^='chevron-']");
            const allRows = document.querySelectorAll(".conflict-row");

            const targetDrawer = document.getElementById(`drawer-${id}`);
            const targetChevron = document.getElementById(`chevron-${id}`);
            const targetRow = document.getElementById(`row-${id}`);

            if (!targetDrawer || !targetRow) return;

            const wasOpen = targetDrawer.classList.contains("is-open");

            allDrawers.forEach(d => d.classList.remove("is-open"));
            allRows.forEach(r => r.classList.remove("is-open"));
            allChevrons.forEach(c => c.setAttribute("data-lucide", "chevron-right"));

            if (!wasOpen) {
                targetDrawer.classList.add("is-open");
                targetRow.classList.add("is-open");
                if (targetChevron) targetChevron.setAttribute("data-lucide", "chevron-down");
                currentOpenRowId = id;
            } else {
                currentOpenRowId = null;
            }

            renderIcons();
        }

        // TAB TRANSITIONS (DIRECT DATA-TAB ATTRIBUTE MAPPING)
        function switchTab(tabName) {
            document.querySelectorAll(".view-container").forEach(el => el.classList.remove("active"));
            document.querySelectorAll(".side-nav .nav-item").forEach(el => el.classList.remove("active"));

            const targetView = document.getElementById(`tab-${tabName}`);
            if (targetView) targetView.classList.add("active");

            // Direct data attribute matching - resilient against nav reordering or additions
            const activeNavItem = document.querySelector(`.side-nav .nav-item[data-tab="${tabName}"]`);
            if (activeNavItem) {
                activeNavItem.classList.add("active");
            }

            // PHASE 3: Initialize or resize GIS Cadastral Leaflet map
            if (tabName === 'gis' && window.gisService) {
                window.gisService.initOrResizeMap();
            }

            renderIcons();
        }

        // DETAIL VIEW LOADER
        function openDetailView(id, shouldSwitchTab = true) {
            const conflict = conflictsData.find(c => c.id === id) || conflictsData[0];
            currentDetailConflictId = conflict.id;

            const detailUlpin = document.getElementById("detailUlpin");
            if (detailUlpin) detailUlpin.textContent = `ULPIN: ${conflict.ulpin}`;

            const localizedType = getTypeTranslation(conflict);
            const localizedSilos = conflict.silos.map(s => getSiloTranslation(s)).join(" + ");
            const tInvolves = window.DharaaI18n ? window.DharaaI18n.t("summary_involves") : "Involves";
            const tAcross = window.DharaaI18n ? window.DharaaI18n.t("summary_across") : "across";
            const detailSummary = document.getElementById("detailSummary");
            if (detailSummary) detailSummary.textContent = `${localizedType} — ${tInvolves} ${localizedSilos} ${tAcross} ${conflict.khasra}.`;

            const sevBadge = document.getElementById("detailSeverity");
            if (sevBadge) {
                const tSev = window.DharaaI18n ? window.DharaaI18n.t("severity_" + conflict.severity) : conflict.severity.toUpperCase();
                const tSevSuffix = window.DharaaI18n ? window.DharaaI18n.t("severity_suffix") : "SEVERITY";
                sevBadge.textContent = `${tSev} ${tSevSuffix}`;
                sevBadge.className = `badge ${conflict.severity === 'critical' ? 'badge-critical' : conflict.severity === 'major' ? 'badge-major' : 'badge-moderate'}`;
            }

            activeWorkflowStep = conflict.stepIndex || 2;
            updateStepperDisplay();

            let targetScore;
            if (activeWorkflowStep === 4) {
                targetScore = 98;
            } else if (conflict.score) {
                targetScore = conflict.score;
            } else if (conflict.severity === 'critical') {
                targetScore = 48;
            } else if (conflict.severity === 'major') {
                targetScore = 68;
            } else {
                targetScore = 78;
            }
            setTrustScore(targetScore);

            const poly = document.getElementById("hazardPolygon");
            const txt = document.getElementById("hazardText");
            if (poly && txt) {
                if (activeWorkflowStep === 4) {
                    poly.style.display = "none";
                    txt.style.display = "none";
                } else if (overlayVisible) {
                    poly.style.display = "block";
                    txt.style.display = "block";
                }
            }

            if (shouldSwitchTab) {
                switchTab('detail');
                const tLoaded = window.DharaaI18n ? window.DharaaI18n.t("toast_dossier_loaded") : "Loaded resolution dossier for";
                showToast(`${tLoaded} ${conflict.ulpin}`);
            }
        }

        // WORKFLOW STEPPER ANIMATION
        function updateStepperDisplay() {
            const steps = [1, 2, 3, 4];
            const track = document.getElementById("stepperTrack");

            const progressPercentages = { 1: "0%", 2: "33%", 3: "66%", 4: "100%" };
            if (track) track.style.width = progressPercentages[activeWorkflowStep];

            const stepKeys = {
                1: { title: "step_detected", desc: "step_detected_desc" },
                2: { title: "step_assigned", desc: "step_assigned_desc" },
                3: { title: "step_review", desc: "step_review_desc" },
                4: { title: "step_harmonized", desc: "step_harmonized_desc" }
            };

            steps.forEach(s => {
                const el = document.getElementById(`step${s}`);
                if (!el) return;
                el.className = "step-item";
                const circle = el.querySelector(".step-circle");

                if (s < activeWorkflowStep) {
                    el.classList.add("completed");
                    if (circle) circle.innerHTML = `<i data-lucide="check" style="width:20px;height:20px;"></i>`;
                } else if (s === activeWorkflowStep) {
                    el.classList.add("current");
                    if (circle) circle.innerHTML = `${s}`;
                } else {
                    if (circle) circle.innerHTML = `${s}`;
                }

                if (window.DharaaI18n) {
                    const titleEl = el.querySelector(".step-title");
                    const descEl = el.querySelector(".step-meta");
                    if (titleEl) titleEl.textContent = window.DharaaI18n.t(stepKeys[s].title);
                    if (descEl) descEl.textContent = window.DharaaI18n.t(stepKeys[s].desc);
                }
            });

            renderIcons();
        }

        function advanceActiveWorkflow() {
            if (activeWorkflowStep < 4) {
                activeWorkflowStep++;
                updateStepperDisplay();

                const stepNames = {
                    2: "Assigned to Nodal Revenue Officer",
                    3: "Field Demarcation & Joint Review in progress",
                    4: "Harmonized! Golden Record committed to Registry"
                };

                // Update Trust Score and Cadastral Map when reaching step 4 (Harmonized)
                if (activeWorkflowStep === 4) {
                    setTrustScore(98, "Golden record committed to Registry. Spatial overlap resolved & all 4 department ledgers locked.");

                    // Hide hazard overlap polygon on map upon resolution (as in FILE B)
                    const poly = document.getElementById("hazardPolygon");
                    const txt = document.getElementById("hazardText");
                    if (poly) poly.style.display = "none";
                    if (txt) txt.style.display = "none";
                } else if (activeWorkflowStep === 3) {
                    setTrustScore(68, "Field Demarcation & Joint Review underway. Boundary rover survey in progress.");
                } else if (activeWorkflowStep === 2) {
                    setTrustScore(54, "Assigned to Nodal Officer. Initial notice dispatch in queue.");
                }

                // Add to audit trail dynamically
                const trailBox = document.getElementById("auditTrailBox");
                const node = document.createElement("div");
                node.className = "timeline-node";
                node.innerHTML = `
          <div class="timeline-dot" style="border-color: var(--emerald-600);"></div>
          <div class="timeline-content" style="border-left: 3px solid var(--emerald-600);">
            <div class="timeline-header">
              <span>${stepNames[activeWorkflowStep]}</span>
              <span class="mono" style="font-size: 13px; color: var(--slate-400);">Just Now (Demo Action)</span>
            </div>
            <div style="font-size: 14.5px; color: var(--slate-600);">Status transitioned by authenticated nodal credential. Cryptographic hash verified.</div>
          </div>
        `;
                trailBox.insertBefore(node, trailBox.firstChild);

                if (activeWorkflowStep === 4) {
                    showToast(window.DharaaI18n ? window.DharaaI18n.t("toast_harmonized_success") : "DHARAA Trust Engine: Parcel harmonized & locked to Golden Registry.");
                } else {
                    showToast(`${window.DharaaI18n ? window.DharaaI18n.t("toast_workflow_advanced") : "Workflow advanced:"} Step ${activeWorkflowStep} (${stepNames[activeWorkflowStep]})`);
                }
            } else {
                showToast(window.DharaaI18n ? window.DharaaI18n.t("toast_already_resolved") : "Case is already in 'Resolved & Harmonized' status.");
            }
        }

        // TRUST SCORE GAUGE CONTROLLER
        function setTrustScore(val, customDesc) {
            const gaugeVal = document.getElementById("gaugeVal");
            const gaugeArc = document.getElementById("gaugeArc");
            const trustTitle = document.getElementById("trustTitle");
            const trustBadge = document.getElementById("trustBadge");
            const trustDesc = document.getElementById("trustDesc");

            if (!gaugeVal || !gaugeArc) return;

            gaugeVal.textContent = val;

            const circumference = 182.2;
            const offset = circumference - (val / 100) * circumference;
            gaugeArc.style.strokeDashoffset = offset;

            const tTrustLbl = window.DharaaI18n ? window.DharaaI18n.t("trust_index_label") : "Trust Index:";
            if (val > 80) {
                gaugeArc.style.stroke = "var(--emerald-600)";
                gaugeVal.style.color = "var(--emerald-700)";
                if (trustTitle) {
                    const tHarm = window.DharaaI18n ? window.DharaaI18n.t("trust_harmonized") : "Harmonized (Gold Registry)";
                    trustTitle.textContent = `${tTrustLbl} ${tHarm} (${val}/100)`;
                    trustTitle.style.color = "var(--emerald-700)";
                }
                if (trustBadge) {
                    trustBadge.className = "badge";
                    trustBadge.style.background = "var(--emerald-50)";
                    trustBadge.style.color = "var(--emerald-700)";
                    trustBadge.style.borderColor = "#a7f3d0";
                    const tBadgeHarm = window.DharaaI18n ? window.DharaaI18n.t("badge_golden_record") : "GOLDEN RECORD COMMITTED";
                    trustBadge.innerHTML = `<i data-lucide="shield-check" style="width:13px;height:13px;"></i> ${tBadgeHarm}`;
                }
                if (trustDesc) {
                    trustDesc.textContent = customDesc || (window.DharaaI18n ? window.DharaaI18n.t("desc_golden_record") : "All 4 departments (Revenue, Registration, Cadastral GIS, Urban ULB) harmonized with zero variance. Golden Record committed to Registry.");
                }
            } else if (val > 60) {
                gaugeArc.style.stroke = "var(--amber-500)";
                gaugeVal.style.color = "var(--amber-600)";
                if (trustTitle) {
                    const tReview = window.DharaaI18n ? window.DharaaI18n.t("trust_under_review") : "Under Review";
                    trustTitle.textContent = `${tTrustLbl} ${tReview} (${val}/100)`;
                    trustTitle.style.color = "var(--amber-700)";
                }
                if (trustBadge) {
                    trustBadge.className = "badge badge-major";
                    trustBadge.style.background = "";
                    trustBadge.style.color = "";
                    trustBadge.style.borderColor = "";
                    const tBadgeReview = window.DharaaI18n ? window.DharaaI18n.t("badge_field_review") : "FIELD REVIEW ACTIVE";
                    trustBadge.innerHTML = `<i data-lucide="alert-circle" style="width:13px;height:13px;"></i> ${tBadgeReview}`;
                }
                if (trustDesc) {
                    trustDesc.textContent = customDesc || (window.DharaaI18n ? window.DharaaI18n.t("desc_field_review") : "Active reconciliation pipeline. Discrepancy identified between statutory datasets awaiting nodal resolution.");
                }
            } else {
                gaugeArc.style.stroke = "var(--red-500)";
                gaugeVal.style.color = "var(--red-600)";
                if (trustTitle) {
                    const tComp = window.DharaaI18n ? window.DharaaI18n.t("trust_compromised") : "Compromised";
                    trustTitle.textContent = `${tTrustLbl} ${tComp} (${val}/100)`;
                    trustTitle.style.color = "var(--red-700)";
                }
                if (trustBadge) {
                    trustBadge.className = "badge badge-critical";
                    trustBadge.style.background = "";
                    trustBadge.style.color = "";
                    trustBadge.style.borderColor = "";
                    const tBadgeHold = window.DharaaI18n ? window.DharaaI18n.t("badge_mutation_hold") : "MUTATION ON HOLD";
                    trustBadge.innerHTML = `<i data-lucide="shield-alert" style="width:13px;height:13px;"></i> ${tBadgeHold}`;
                }
                if (trustDesc) {
                    trustDesc.textContent = customDesc || (window.DharaaI18n ? window.DharaaI18n.t("desc_mutation_hold") : "Mutation hold triggered. Land Trust Engine flagged -52 sq.yd spatial deviation against surveyed Cadastre.");
                }
            }

            renderIcons();
        }

        // CADASTRAL MAP OVERLAY TOGGLE
        let overlayVisible = true;

        function toggleOverlay() {
            overlayVisible = !overlayVisible;
            const poly = document.getElementById("hazardPolygon");
            const txt = document.getElementById("hazardText");
            const btn = document.getElementById("btnOverlay");

            if (overlayVisible) {
                if (poly) poly.style.display = "block";
                if (txt) txt.style.display = "block";
                if (btn) {
                    btn.innerHTML = `<i data-lucide="layers" style="width: 16px; height: 16px; color: var(--navy-600);"></i> <span>${window.DharaaI18n ? window.DharaaI18n.t("btn_drone_diff") : "Drone Resurvey Diff (Active)"}</span>`;
                    btn.style.background = "";
                    btn.style.color = "";
                }
                showToast(window.DharaaI18n ? window.DharaaI18n.t("toast_overlay_enabled") : "Cadastral DGPS Drone overlay enabled.");
            } else {
                if (poly) poly.style.display = "none";
                if (txt) txt.style.display = "none";
                if (btn) {
                    btn.innerHTML = `<i data-lucide="layers" style="width: 16px; height: 16px; color: var(--slate-400);"></i> <span>${window.DharaaI18n ? window.DharaaI18n.t("btn_hide_overlay") : "Drone Resurvey Diff (Hidden)"}</span>`;
                    btn.style.background = "var(--slate-100)";
                    btn.style.color = "var(--slate-500)";
                }
                showToast(window.DharaaI18n ? window.DharaaI18n.t("toast_overlay_hidden") : "Cadastral DGPS Drone overlay hidden.");
            }
            renderIcons();
        }

        // ACCESSIBILITY TEXT RESIZER CONTROLLER
        let currentFontScale = 100;
        function setFontResizer(action) {
            if (action === 'increase') {
                if (currentFontScale < 120) currentFontScale += 5;
            } else if (action === 'decrease') {
                if (currentFontScale > 85) currentFontScale -= 5;
            } else {
                currentFontScale = 100;
            }
            document.documentElement.style.fontSize = `${currentFontScale}%`;
            document.querySelectorAll('.btn-resizer').forEach(btn => btn.classList.remove('active'));
            if (action === 'reset') {
                const resetBtn = document.querySelector('.btn-resizer[onclick*="reset"]');
                if (resetBtn) resetBtn.classList.add('active');
            }
        }
        window.setFontResizer = setFontResizer;

        // ROLE SWITCHER LOGIC (DRIVEN BY currentRole)
        function switchRole(role, evt) {
            currentRole = role;

            document.querySelectorAll(".role-btn").forEach(b => b.classList.remove("active"));
            if (evt && evt.currentTarget) {
                evt.currentTarget.classList.add("active");
            } else {
                const activeBtn = document.querySelector(`.role-btn[data-role="${role}"]`) ||
                    document.querySelector(`.role-btn[onclick*="'${role}'"]`);
                if (activeBtn) activeBtn.classList.add("active");
            }

            const badge = document.getElementById("jurisdictionBadge");
            const queueNav = document.querySelector('.side-nav .nav-item[data-tab="queue"]');
            const detailNav = document.querySelector('.side-nav .nav-item[data-tab="detail"]');
            const coreCategory = document.getElementById("coreWorkflowsCategory");

            const headerAddBtn = document.getElementById("headerAddNewParcelBtn");
            const gisAddBtn = document.getElementById("gisAddNewParcelBtn");

            if (role === 'officer') {
                if (queueNav) queueNav.style.display = '';
                if (detailNav) detailNav.style.display = '';
                if (coreCategory) coreCategory.style.display = '';
                if (headerAddBtn) headerAddBtn.style.display = 'inline-flex';
                if (gisAddBtn) gisAddBtn.style.display = 'inline-flex';
                showToast(window.DharaaI18n ? window.DharaaI18n.t("toast_switched_officer") : "Switched to Nodal Officer View");
                if (badge) {
                    badge.innerHTML = `
                        <div class="officer-card-avatar">
                            <i data-lucide="user-check" style="width: 17px; height: 17px;"></i>
                            <span class="officer-session-dot" title="Active DHARAA Session"></span>
                        </div>
                        <div class="officer-card-info">
                            <div class="officer-card-name">Harvinder Singh</div>
                            <div class="officer-card-designation">Kanungo / Revenue Inspector</div>
                            <div class="officer-card-jurisdiction">Tehsil: Sriperumbudur, Dist: Kanchipuram</div>
                        </div>
                    `;
                }

                const currentActiveTab = document.querySelector(".view-container.active");
                if (currentActiveTab && currentActiveTab.id === "tab-analytics") {
                    switchTab('queue');
                }
            } else if (role === 'admin') {
                if (queueNav) queueNav.style.display = '';
                if (detailNav) detailNav.style.display = '';
                if (coreCategory) coreCategory.style.display = '';
                if (headerAddBtn) headerAddBtn.style.display = 'inline-flex';
                if (gisAddBtn) gisAddBtn.style.display = 'inline-flex';
                showToast(window.DharaaI18n ? window.DharaaI18n.t("toast_switched_admin") : "Switched to District Admin View");
                if (badge) {
                    badge.innerHTML = `
                        <div class="officer-card-avatar" style="background: rgba(30, 64, 175, 0.4); border-color: rgba(96, 165, 250, 0.5);">
                            <i data-lucide="shield" style="width: 17px; height: 17px; color: #60a5fa;"></i>
                            <span class="officer-session-dot" title="Active DHARAA Session"></span>
                        </div>
                        <div class="officer-card-info">
                            <div class="officer-card-name">Dr. Rajesh Varma, IAS</div>
                            <div class="officer-card-designation">District Collector & District Magistrate</div>
                            <div class="officer-card-jurisdiction">Dist: Kanchipuram &amp; UT Chandigarh</div>
                        </div>
                    `;
                }
            } else if (role === 'policymaker') {
                // Decision-makers shouldn't see raw case queues or parcel creation
                if (queueNav) queueNav.style.display = 'none';
                if (detailNav) detailNav.style.display = 'none';
                if (coreCategory) coreCategory.style.display = 'none';
                if (headerAddBtn) headerAddBtn.style.display = 'none';
                if (gisAddBtn) gisAddBtn.style.display = 'none';
                showToast(window.DharaaI18n ? window.DharaaI18n.t("toast_switched_policymaker") : "Switched to Decision Maker View");
                if (badge) {
                    badge.innerHTML = `
                        <div class="officer-card-avatar" style="background: rgba(180, 83, 9, 0.4); border-color: rgba(251, 191, 36, 0.5);">
                            <i data-lucide="award" style="width: 17px; height: 17px; color: #fde047;"></i>
                            <span class="officer-session-dot" title="Active DHARAA Session"></span>
                        </div>
                        <div class="officer-card-info">
                            <div class="officer-card-name">Smt. Ananya Sen</div>
                            <div class="officer-card-designation">Joint Secretary (Land Reforms), DoLR</div>
                            <div class="officer-card-jurisdiction">Ministry of Rural Development, New Delhi</div>
                        </div>
                    `;
                }
                switchTab('analytics');
            }

            filterQueue();
            renderIcons();
        }

        // COUNT-UP ANIMATIONS
        function initCounters() {
            const counters = document.querySelectorAll(".counter");
            counters.forEach(c => {
                const target = parseFloat(c.getAttribute("data-target"));
                let count = 0;
                const duration = 1200; // ms
                const steps = 40;
                const increment = target / steps;
                const stepTime = duration / steps;

                const timer = setInterval(() => {
                    count += increment;
                    if (count >= target) {
                        c.textContent = target;
                        clearInterval(timer);
                    } else {
                        c.textContent = target % 1 === 0 ? Math.floor(count) : count.toFixed(1);
                    }
                }, stepTime);
            });
        }

        // QUEUE FILTERING (FUNCTIONAL ROLE FILTERING)
        function filterQueue() {
            const query = (document.getElementById("queueSearch")?.value || "").toLowerCase();
            const state = document.getElementById("stateFilter")?.value || "all";
            const type = document.getElementById("conflictTypeFilter")?.value || "all";

            const filtered = conflictsData.filter(item => {
                // Role filter: Nodal officer only sees their assigned conflicts
                if (currentRole === 'officer') {
                    if (item.assignedOfficer !== "Harvinder Singh, Field Kanungo") {
                        return false;
                    }
                }

                // Text search query
                const matchQuery = !query ||
                    item.ulpin.toLowerCase().includes(query) ||
                    item.khasra.toLowerCase().includes(query) ||
                    item.typeLabel.toLowerCase().includes(query) ||
                    (item.assignedOfficer && item.assignedOfficer.toLowerCase().includes(query));

                // State & type selectors
                const matchState = (state === 'all') || (item.state === state);
                const matchType = (type === 'all') || (item.type === type);

                return matchQuery && matchState && matchType;
            });

            renderQueueTable(filtered);

            // Update badge count according to active perspective
            const badgeCount = document.getElementById("queueBadgeCount");
            if (badgeCount) {
                if (currentRole === 'officer') {
                    const officerItems = conflictsData.filter(c => c.assignedOfficer === "Harvinder Singh, Field Kanungo");
                    badgeCount.textContent = officerItems.length;
                } else {
                    badgeCount.textContent = conflictsData.length;
                }
            }
        }

        // NOTIFICATION BELL SYSTEM
        function updateNotificationCount() {
            const alerts = conflictsData.filter(c => c.isNew || c.slaStatus === 'breached' || c.slaHours < 0);
            const badge = document.getElementById("notifBadgeCount");
            if (badge) {
                badge.textContent = alerts.length;
                badge.style.display = alerts.length > 0 ? "flex" : "none";
            }
        }

        function handleNotificationClick() {
            // If policymaker, switch to admin so the queue and stepper are visible
            if (currentRole === 'policymaker') {
                switchRole('admin');
            }

            // Navigate to queue tab
            switchTab('queue');

            // Reset query filters to ensure alert rows are displayed
            const searchInput = document.getElementById("queueSearch");
            const stateFilter = document.getElementById("stateFilter");
            const typeFilter = document.getElementById("conflictTypeFilter");
            if (searchInput) searchInput.value = "";
            if (stateFilter) stateFilter.value = "all";
            if (typeFilter) typeFilter.value = "all";

            // If in officer mode and some breaches are assigned to other officers, switch to admin to inspect all alerts
            const alerts = conflictsData.filter(c => c.isNew || c.slaStatus === 'breached' || c.slaHours < 0);
            const outsideOfficer = alerts.some(c => c.assignedOfficer !== "Harvinder Singh, Field Kanungo");
            if (currentRole === 'officer' && outsideOfficer) {
                switchRole('admin');
            } else {
                filterQueue();
            }

            // Scroll to the first alert row and highlight with a subtle ring effect
            setTimeout(() => {
                const targetRow = document.querySelector(".conflict-row.new-anomaly");
                if (targetRow) {
                    targetRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    targetRow.style.boxShadow = "0 0 0 3px rgba(239, 68, 68, 0.4)";
                    setTimeout(() => {
                        targetRow.style.boxShadow = "";
                    }, 3200);
                }
            }, 120);

            showToast(`${window.DharaaI18n ? window.DharaaI18n.t("toast_focused_alerts") : "Focused critical SLA breaches and anomaly alerts."} (${alerts.length})`);
        }

        // SIMULATE REAL-TIME ANOMALY INGESTION
        async function simulateNewConflict() {
            const newId = (conflictsData.length > 0 ? Math.max(...conflictsData.map(c => c.id)) : 0) + 1;
            const simulatedItem = {
                id: newId,
                ulpin: `TN-04-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-7744`,
                state: "TN",
                stateLabel: "Tamil Nadu",
                khasra: "Khasra 99/A, Tiruvallur",
                type: "spatial_overlap",
                typeLabel: "Live GIS Discrepancy (Overlapping Cadastral Boundary)",
                silos: ["Survey", "Revenue"],
                severity: "critical",
                slaHours: 168,
                slaStatus: "normal",
                stage: "Detected",
                stepIndex: 1,
                assignedOfficer: "Harvinder Singh, Field Kanungo",
                isNew: true,
                details: {
                    revenue: "Jamabandi Area: 1.25 Acres",
                    registration: "Deed: 1.25 Acres",
                    survey: "Drone Survey: 1.14 Acres (-0.11 Acre encroachment alert)",
                    urban: "Outside municipal planning master plan"
                }
            };

            // Ingest into mock data store and reload through API seam
            mockConflicts.unshift(simulatedItem);
            conflictsData = await loadConflicts();

            filterQueue();
            updateNotificationCount();

            showToast(`⚡ Land Trust Engine flagged fresh anomaly on ${simulatedItem.ulpin}!`);
        }

        // TOAST SYSTEM
        function showToast(msg) {
            const toast = document.getElementById("toastBox");
            const text = document.getElementById("toastMsg");
            text.textContent = msg;
            toast.classList.add("show");

            setTimeout(() => {
                toast.classList.remove("show");
            }, 3400);
        }

        // MODAL HANDLERS
        function openOrderModal(id) {
            document.getElementById("resolutionModal").classList.add("open");
        }
        function closeModal() {
            document.getElementById("resolutionModal").classList.remove("open");
        }
        function confirmModalAction() {
            closeModal();
            showToast(window.DharaaI18n ? window.DharaaI18n.t("toast_order_issued") : "Joint Field Notice issued under Land Revenue Code.");
        }

        // ADMIN REASSIGNMENT MODAL HANDLERS
        function openAssignModal(id) {
            pendingAssignConflictId = id;
            const conflict = conflictsData.find(c => c.id === id);
            if (!conflict) return;

            const ulpinDisplay = document.getElementById("assignModalUlpin");
            if (ulpinDisplay) ulpinDisplay.textContent = conflict.ulpin;

            const officerSelect = document.getElementById("assignOfficerSelect");
            if (officerSelect && conflict.assignedOfficer) {
                officerSelect.value = conflict.assignedOfficer;
            }

            const stageSelect = document.getElementById("assignStageSelect");
            if (stageSelect) {
                stageSelect.value = (conflict.stage === "Under Review" || conflict.stage === "Assigned") ? conflict.stage : "Assigned";
            }

            document.getElementById("assignModal").classList.add("open");
            renderIcons();
        }

        function closeAssignModal() {
            document.getElementById("assignModal").classList.remove("open");
            pendingAssignConflictId = null;
        }

        function confirmAssignModalAction() {
            if (!pendingAssignConflictId) return;

            const conflict = conflictsData.find(c => c.id === pendingAssignConflictId);
            const mockEntry = mockConflicts.find(c => c.id === pendingAssignConflictId);
            const newOfficer = document.getElementById("assignOfficerSelect").value;
            const newStage = document.getElementById("assignStageSelect").value;

            if (conflict) {
                conflict.assignedOfficer = newOfficer;
                conflict.stage = newStage;
                if (newStage === "Under Review" && conflict.stepIndex < 3) {
                    conflict.stepIndex = 3;
                } else if (newStage === "Assigned" && conflict.stepIndex < 2) {
                    conflict.stepIndex = 2;
                }
            }

            if (mockEntry) {
                mockEntry.assignedOfficer = newOfficer;
                mockEntry.stage = newStage;
                if (conflict) mockEntry.stepIndex = conflict.stepIndex;
            }

            closeAssignModal();
            filterQueue();
            showToast(`${window.DharaaI18n ? window.DharaaI18n.t("toast_reassigned") : "Reassigned"} ${conflict.ulpin} → ${newOfficer}`);
        }


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

window.handleCitizenSearch = async function(event) {
    event.preventDefault();
    const input = document.getElementById('citizenSearchInput').value.trim();
    if (!input) return;
    
    showToast("Querying Land Trust Registry for " + input + "...");
    
    try {
        let backendParcel = null;
        if (window.parcelService) {
            try {
                backendParcel = await window.parcelService.getParcelByUlpin(input);
            } catch (err) {
                // Not found by ULPIN, try by owner name if it's an API error
                if (err && err.status === 404) {
                    const searchRes = await window.parcelService.getParcels({ owner_name: input });
                    if (searchRes && searchRes.length > 0) {
                        // Grab the first one and fetch its full details
                        backendParcel = await window.parcelService.getParcelByUlpin(searchRes[0].ulpin);
                    }
                } else {
                    throw err;
                }
            }
        }

        if (backendParcel) {
            const mappedParcel = {
                ulpin: backendParcel.ulpin,
                khasra: backendParcel.khasra_no || "N/A",
                owner: backendParcel.owner_name || "Unknown",
                area: backendParcel.area_sqm ? backendParcel.area_sqm + " sqm" : "Unknown",
                type: backendParcel.land_use || "Agricultural",
                status: (backendParcel.trust_status === 'VERIFIED' && !backendParcel.dispute_flag && backendParcel.active_conflicts_count === 0) ? 'clear' : 'disputed',
                lat: backendParcel.centroid_lat,
                lng: backendParcel.centroid_lon
            };
            showCitizenParcel(mappedParcel);
        } else {
            showToast("No record found for this ULPIN or Owner Name.", "error");
            document.getElementById("citizenRorCard").style.display = "none";
        }
    } catch (err) {
        console.error("Citizen search failed:", err);
        showToast("No record found for this ULPIN or Owner Name.", "error");
        document.getElementById("citizenRorCard").style.display = "none";
    }
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
        try {
            const res = await window.conflictService.createConflict(payload);
            showToast("Grievance Tracking Number: " + (res.tracking_id || res.trackingId || "GRV-SUCCESS"), "success");
            closeDiscrepancyModal();
            
            if (typeof loadConflicts === 'function') {
                conflictsData = await loadConflicts();
                if (typeof filterQueue === 'function') filterQueue();
            }
        } catch (err) {
            showToast("Failed to submit grievance", "error");
        }
    } else {
        showToast("Tracking ID: GRV-12345 (Service missing)", "success");
        closeDiscrepancyModal();
    }
};

