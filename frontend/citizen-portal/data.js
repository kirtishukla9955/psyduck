/**
 * DHARAA — P3 Citizen Portal Mock Data & API Seam Module
 * Part of Project DHARAA (Land Stack) • Smart India Hackathon 2026
 * 
 * Centralized data contract shared with P4 Admin Dashboard.
 * Async loader functions provide an immediate mock implementation and a 1-line swap to REST APIs.
 */

// =============================================================================
// 1. MOCK PARCEL REGISTRY (Consistent with P4 Admin Dashboard & Backend Seeds)
// =============================================================================
const mockParcels = [
    {
        ulpin: "CH-04-0012-8821-9041",
        state: "CH",
        stateLabel: "Chandigarh (UT)",
        district: "Chandigarh",
        tehsil: "Sector 17",
        village: "Urban Sector 17",
        khasra: "Khasra 142/2",
        ownerName: "Gurpreet Singh",
        coOwners: ["Paramjit Kaur (Spouse)"],
        landUse: "Residential (R-2)",
        zoningStatus: "Conforming to Master Plan 2031",
        area: {
            value: 450,
            unit: "sq.yd",
            sqMeters: 376.26,
            localDisplay: "450 sq.yd (15 Marla)"
        },
        trustScore: 48,
        verificationStatus: "conflict", // 'verified' | 'pending' | 'conflict' | 'unavailable'
        verificationLabel: "Conflict Detected — Spatial Overlap",
        lastUpdated: "2026-08-28T10:30:00Z",
        dataFreshness: "2 hours ago (Auto-synced via Land Trust Engine)",
        conflictDetails: {
            whatDetected: "A 52 sq.yd spatial divergence was detected between registered sale deed #VAS-2024-8891 (450 sq.yd) and cadastral drone polygon CH-17-A (398 sq.yd). An overlap hazard alert is active along the eastern boundary of adjacent plot 142/3.",
            inconsistentRecords: "Registration Deed VAS-2024-8891 records 450 sq.yd; Cadastral DGPS Drone Resurvey Sheet CH-17-A computes 398 sq.yd.",
            handlingDepartment: "Revenue & Survey Department (Kanungo Circle Sector 17) & Sub-Divisional Magistrate (SDM) Central.",
            assignedOfficer: "Harvinder Singh, Field Kanungo",
            currentStatus: "Stage 3 (Field Review & Joint Demarcation). Field notice dispatched; on-site DGPS rover inspection scheduled for 15-Sep-2026 at 10:30 AM.",
            actionRequired: "Yes. Citizen must keep original registered deed #VAS-2024-8891 available during on-site rover demarcation. Supporting documents can be submitted via the Service Request portal.",
            whatHappensNext: "Upon completion of the joint rover demarcation with adjacent plot owners, Kanungo Harvinder Singh will submit a boundary rectification dossier to the SDM for Stage 4 Golden Record harmonization."
        },
        departments: {
            revenue: {
                recordId: "JAM-CH-2024-8821",
                owner: "Gurpreet Singh",
                area: "450 sq.yd (15 Marla)",
                tenure: "Freehold Allotment",
                taxStatus: "Paid up to FY 2025-26",
                jamabandiYear: "2024-2025",
                mutationStatus: "Zer-Tajweez (In Progress)"
            },
            registration: {
                deedNo: "VAS-2024-8891 / SRO-Sec17",
                deedDate: "2024-08-14",
                executants: "Estate Office Chandigarh to Gurpreet Singh",
                areaRecorded: "450 sq.yd",
                consideration: "₹ 1,85,00,000",
                stampDuty: "₹ 11,10,000 (Paid)",
                status: "Registered & Digitally Sealed"
            },
            survey: {
                fmbRef: "Cadastral Survey Sheet CH-17-A",
                gisArea: "398 sq.yd (-52 sq.yd divergence)",
                coordinates: "30.7412° N, 76.7854° E",
                roverSurveyDate: "2026-08-22 (DGPS Rover Survey)",
                discrepancyNote: "52 sq.yd overlap with boundary of adjacent plot 142/3 (Bila-Paimaish)"
            },
            urban: {
                authority: "Municipal Corporation Chandigarh (MCC)",
                propertyTaxId: "CH-MC-908",
                zoning: "R-2 Residential Low Density",
                buildingPlanStatus: "Sanctioned (B-Plan 2019/402)",
                nocStatus: "Fire & PHE NOC Active"
            }
        },
        encumbrance: {
            isMortgaged: false,
            liens: [],
            caveats: ["Boundary clarification caveat filed under Sec 34 Land Revenue Act"],
            legalDisputes: 0
        },
        activeTransaction: {
            refNo: "MUT-2026-CH-8821",
            type: "Joint Demarcation & Area Harmonization",
            appliedDate: "2026-08-20",
            currentStage: "Field Inspection",
            stepIndex: 3,
            assignedOfficer: "Harvinder Singh, Field Kanungo",
            handlingDept: "Revenue & Survey Department, Sector 17 Circle",
            slaDaysRemaining: 1,
            slaHoursRemaining: 14,
            slaStatus: "warning",
            slaTotalDays: 30,
            slaTotalHours: 720,
            pendingAction: "Keep original registered sale deed #VAS-2024-8891 available for on-site rover demarcation on 15-Sep-2026 at 10:30 AM.",
            stages: [
                { index: 1, name: "Filed", date: "20-Aug-2026", status: "completed", by: "DHARAA Land Trust Engine (Auto-Triggered)", description: "Spatial divergence flagged between SRO Deed #VAS-2024-8891 (450 sq.yd) and Cadastral polygon CH-17-A (398 sq.yd)." },
                { index: 2, name: "Under Verification", date: "22-Aug-2026", status: "completed", by: "Tehsildar Office / Sub-Registrar", description: "Statutory notice issued to adjacent plot 142/3; assigned to Kanungo Harvinder Singh." },
                { index: 3, name: "Field Inspection", date: "In Progress (15-Sep)", status: "current", by: "Kanungo Harvinder Singh & DGPS Survey Team", description: "Joint on-site DGPS rover demarcation scheduled with adjacent boundary owners." },
                { index: 4, name: "Approved / Rejected", date: "Pending", status: "pending", by: "Sub-Divisional Magistrate (SDM) Central", description: "Submission of boundary rectification dossier for Golden Record harmonization." }
            ],
            documentChecklist: [
                { id: "doc-1", name: "Registered Sale Deed #VAS-2024-8891", status: "received", source: "SRO Sector 17", dateVerified: "14-Aug-2024", action: null },
                { id: "doc-2", name: "Record of Rights (Jamabandi FY 2024-25)", status: "received", source: "Revenue Registry", dateVerified: "20-Aug-2026", action: null },
                { id: "doc-3", name: "Cadastral Drone Resurvey Sheet CH-17-A", status: "received", source: "Survey & Settlement", dateVerified: "22-Aug-2026", action: null },
                { id: "doc-4", name: "Joint Rover Demarcation Field Report", status: "pending", source: "Field Kanungo Harvinder Singh", dateVerified: null, action: "Scheduled on-site for 15-Sep-2026 (10:30 AM)" },
                { id: "doc-5", name: "Adjacent Landholder NOC (Plot 142/3)", status: "pending", source: "Sub-Divisional Hearing", dateVerified: null, action: "Notice Dispatched (Hearing on-site)" },
                { id: "doc-6", name: "Citizen Aadhaar Identity Proof (e-KYC)", status: "received", source: "UIDAI e-KYC Gateway", dateVerified: "20-Aug-2026", action: null }
            ]
        },
        coordinates: [
            [76.7845, 30.7405],
            [76.7860, 30.7405],
            [76.7860, 30.7420],
            [76.7845, 30.7420],
            [76.7845, 30.7405]
        ]
    },
    {
        ulpin: "CH-01-1002-3344-5566",
        state: "CH",
        stateLabel: "Chandigarh (UT)",
        district: "Chandigarh",
        tehsil: "Sector 17",
        village: "Urban Sector 17-C",
        khasra: "Plot 12, Commercial Belt",
        ownerName: "Ramesh Kumar",
        coOwners: ["Gurpreet Singh (Business Associate)"],
        landUse: "Commercial Retail",
        zoningStatus: "Conforming to Master Plan 2031",
        area: {
            value: 500,
            unit: "sq.yd",
            sqMeters: 418.06,
            localDisplay: "500 sq.yd"
        },
        trustScore: 98,
        verificationStatus: "verified",
        verificationLabel: "Verified — Harmonized Across All Departments",
        lastUpdated: "2026-09-01T08:15:00Z",
        dataFreshness: "1 day ago (100% Consensus)",
        conflictDetails: null,
        departments: {
            revenue: {
                recordId: "JAM-CH-2024-1002",
                owner: "Ramesh Kumar",
                area: "500 sq.yd",
                tenure: "Freehold Commercial",
                taxStatus: "Paid up to FY 2026-27",
                jamabandiYear: "2024-2025",
                mutationStatus: "Manzoor (Mutated & Confirmed)"
            },
            registration: {
                deedNo: "VAS-2021-3344 / SRO-Sec17",
                deedDate: "2021-03-10",
                executants: "Commercial Allotment Board to Ramesh Kumar",
                areaRecorded: "500 sq.yd",
                consideration: "₹ 3,20,00,000",
                stampDuty: "₹ 19,20,000 (Paid)",
                status: "Registered & Verified"
            },
            survey: {
                fmbRef: "Cadastral Survey Sheet CH-17-C-12",
                gisArea: "500 sq.yd (0% variance)",
                coordinates: "30.7425° N, 76.7865° E",
                roverSurveyDate: "2025-11-14",
                discrepancyNote: "Nil. Boundary pillars intact and verified by ETS rover."
            },
            urban: {
                authority: "Municipal Corporation Chandigarh (MCC)",
                propertyTaxId: "CH-MC-1002",
                zoning: "C-1 Commercial",
                buildingPlanStatus: "Completed (Occupancy Certificate Issued)",
                nocStatus: "All NOCs Cleared"
            }
        },
        encumbrance: {
            isMortgaged: false,
            liens: [],
            caveats: [],
            legalDisputes: 0
        },
        activeTransaction: {
            refNo: "MUT-2025-CH-1002",
            type: "Sale Deed Mutation & Title Confirmation",
            appliedDate: "2025-04-10",
            currentStage: "Approved",
            stepIndex: 4,
            assignedOfficer: "K. Ramanathan, Tahsildar",
            handlingDept: "Central Land Registry, Sector 17",
            slaDaysRemaining: 0,
            slaHoursRemaining: 0,
            slaStatus: "completed",
            slaTotalDays: 30,
            slaTotalHours: 720,
            pendingAction: "None. Title legally confirmed and mutated in central Record of Rights.",
            stages: [
                { index: 1, name: "Filed", date: "10-Apr-2025", status: "completed", by: "Citizen Portal", description: "Mutation application filed following registered conveyance deed #VAS-2021-3344." },
                { index: 2, name: "Under Verification", date: "14-Apr-2025", status: "completed", by: "SRO Sector 17", description: "Deed and consideration payment authenticated against state treasury." },
                { index: 3, name: "Field Inspection", date: "22-Apr-2025", status: "completed", by: "Field Kanungo", description: "Field boundaries inspected and verified intact with zero variance." },
                { index: 4, name: "Approved / Rejected", date: "28-Apr-2025", status: "completed", by: "Tehsildar Office", description: "Order passed (Manzoor) and Record of Rights updated." }
            ],
            documentChecklist: [
                { id: "doc-1", name: "Registered Conveyance Deed #VAS-2021-3344", status: "received", source: "SRO Sector 17", dateVerified: "10-Mar-2021", action: null },
                { id: "doc-2", name: "Record of Rights (Jamabandi Manzoor Extract)", status: "received", source: "Revenue Department", dateVerified: "28-Apr-2025", action: null },
                { id: "doc-3", name: "Cadastral Survey Sheet CH-17-C-12", status: "received", source: "Survey & Settlement", dateVerified: "14-Nov-2025", action: null },
                { id: "doc-4", name: "Municipal Property Tax Clearance Certificate", status: "received", source: "Municipal Corporation Chandigarh", dateVerified: "05-Apr-2025", action: null },
                { id: "doc-5", name: "Non-Encumbrance Certificate (30 Years)", status: "received", source: "SRO Central Registry", dateVerified: "15-Jul-2026", action: null },
                { id: "doc-6", name: "Allotment Letter & Sanctioned Building Plan", status: "received", source: "Estate Office Chandigarh", dateVerified: "10-Mar-2021", action: null }
            ]
        },
        coordinates: [
            [76.7865, 30.7420],
            [76.7880, 30.7420],
            [76.7880, 30.7435],
            [76.7865, 30.7435],
            [76.7865, 30.7420]
        ]
    },
    {
        ulpin: "CH-02-0045-1190-2021",
        state: "CH",
        stateLabel: "Chandigarh (UT)",
        district: "Chandigarh",
        tehsil: "Mani Majra",
        village: "Mani Majra Rural",
        khasra: "Khata 45, Abadi Deh",
        ownerName: "Gurpreet Singh",
        coOwners: ["Inherited Ancestral Share"],
        landUse: "Rural Homestead (Lal Dora)",
        zoningStatus: "Pre-Master Plan Settlement",
        area: {
            value: 280,
            unit: "sq.yd",
            sqMeters: 234.11,
            localDisplay: "280 sq.yd (9.3 Marla)"
        },
        trustScore: null,
        verificationStatus: "unavailable",
        verificationLabel: "Digital Record Unavailable — SVAMITVA Resurvey in Progress",
        lastUpdated: "2026-07-15T09:00:00Z",
        dataFreshness: "Legacy Paper Record (SVAMITVA drone survey pending)",
        conflictDetails: {
            whatDetected: "Digital record consensus is currently unavailable. This rural Lal Dora parcel is transitioning from legacy paper Shajra/Missal-Haqiat records to the digital Cadastre under the national SVAMITVA Scheme.",
            inconsistentRecords: "Offline paper Jamabandi entry exists (Khata 45), but digital GIS polygon and SRO deed integration are pending drone mapping.",
            handlingDepartment: "Directorate of Land Records, UT Chandigarh & Survey of India (SOI) SVAMITVA Cell.",
            assignedOfficer: "P. S. Brar, Nodal Tehsildar (SVAMITVA)",
            currentStatus: "Pre-Survey Ground Truthing. Chunam marking completed; drone flight scheduled for Q4 2026.",
            actionRequired: "No immediate dispute action required. Landholder should preserve ancestral legacy inheritance documents and ensure physical property boundaries are clearly marked.",
            whatHappensNext: "Following the drone flight and GIS feature extraction, a Form-1 Property Card draft will be published for public 30-day claims and objections before issuing the final digital ULPIN."
        },
        departments: {
            revenue: {
                recordId: "OFFLINE-MISL-1988/45",
                owner: "Gurpreet Singh (Ancestral)",
                area: "280 sq.yd (Approx)",
                tenure: "Abadi Deh / Lal Dora",
                taxStatus: "Rural Chulha Tax Exempt",
                jamabandiYear: "1988-89 (Paper Record)",
                mutationStatus: "Awaiting Digital Migration"
            },
            registration: {
                deedNo: "N/A — Inherited Ancestral Title",
                deedDate: "N/A",
                executants: "Ancestral Family Partition (Paper Sanad)",
                areaRecorded: "280 sq.yd",
                consideration: "Inheritance",
                stampDuty: "Exempt",
                status: "Offline Family Sanad Recorded"
            },
            survey: {
                fmbRef: "Shajra Sheet Mani Majra Rural #4",
                gisArea: "Pending SVAMITVA Drone Resurvey",
                coordinates: "30.7220° N, 76.8450° E",
                roverSurveyDate: "Pending Drone Flight",
                discrepancyNote: "Digital vector polygon not yet ingested into DPI database."
            },
            urban: {
                authority: "UT Rural Development & Panchayats",
                propertyTaxId: "Pending SVAMITVA Property Card",
                zoning: "Rural Abadi Deh",
                buildingPlanStatus: "Exempt under Lal Dora Rules",
                nocStatus: "Panchayat NOC on File"
            }
        },
        encumbrance: {
            isMortgaged: false,
            liens: [],
            caveats: [],
            legalDisputes: 0
        },
        activeTransaction: null,
        coordinates: [
            [76.8440, 30.7210],
            [76.8460, 30.7210],
            [76.8460, 30.7230],
            [76.8440, 30.7230],
            [76.8440, 30.7210]
        ]
    },
    {
        ulpin: "TN-12-4091-7712-3302",
        state: "TN",
        stateLabel: "Tamil Nadu",
        district: "Chengalpattu",
        tehsil: "Thiruporur",
        village: "Kelambakkam",
        khasra: "Patta #418, Survey 102/3",
        ownerName: "Annamalai Muthuvel",
        coOwners: ["M. Velu (Transliteration Alias)"],
        landUse: "Agricultural / Homestead (Nanjai)",
        zoningStatus: "CMDA Agricultural Green Belt",
        area: {
            value: 2.5,
            unit: "grounds",
            sqMeters: 557.4,
            localDisplay: "2.50 Grounds (6,000 sq.ft)"
        },
        trustScore: 68,
        verificationStatus: "pending",
        verificationLabel: "Pending Verification — Transliteration Review",
        lastUpdated: "2026-09-05T14:20:00Z",
        dataFreshness: "3 hours ago",
        conflictDetails: {
            whatDetected: "Discrepancy in recorded owner nomenclature between Tamil Patta register ('அண்ணாமலை முத்துவேல்' / Annamalai Muthuvel) and English SRO Registered Deed ('A. M. Velu').",
            inconsistentRecords: "Tamil Nilam Patta #418 reflects 'Annamalai Muthuvel'; SRO Deed #TN-SRO-TP-2024/9021 records 'A. M. Velu'.",
            handlingDepartment: "Revenue Department (Thiruporur Taluk) & Sub-Registrar Office.",
            assignedOfficer: "S. Meenakshi, Head Surveyor / VAO Desk",
            currentStatus: "Stage 2 (Assigned for Identity Match). Village Administrative Officer (VAO) inquiry notice issued.",
            actionRequired: "Citizen should submit Aadhaar e-KYC biometric affirmation linking the abbreviation 'A. M. Velu' to Annamalai Muthuvel.",
            whatHappensNext: "Once VAO certifies the biometric affidavit, the Land Trust Engine will automatically update the Tamil Nilam ledger and issue a harmonized digital Patta."
        },
        departments: {
            revenue: {
                recordId: "PATTA-TN-2024-418",
                owner: "Annamalai Muthuvel",
                area: "2.50 Grounds",
                tenure: "Ryotwari Patta",
                taxStatus: "Kist cleared up to Fasli 1434",
                jamabandiYear: "2024-2025",
                mutationStatus: "Nilavaiyil (Under Verification)"
            },
            registration: {
                deedNo: "TN-SRO-TP-2024/9021",
                deedDate: "2024-07-19",
                executants: "Subramanian to A. M. Velu",
                areaRecorded: "2.50 Grounds",
                consideration: "₹ 45,00,000",
                stampDuty: "₹ 3,15,000",
                status: "Deed Executed (Transliteration alias flagged)"
            },
            survey: {
                fmbRef: "FMB Sketch Sub-division 102/3A",
                gisArea: "2.50 Grounds (Conforming)",
                coordinates: "12.7845° N, 80.2210° E",
                roverSurveyDate: "2026-04-11",
                discrepancyNote: "Physical boundaries match FMB stone markers."
            },
            urban: {
                authority: "Kelambakkam Village Panchayat / DTCP",
                propertyTaxId: "TN-VP-KB-418",
                zoning: "Primary Agricultural Zone",
                buildingPlanStatus: "Farmhouse NOC Eligible",
                nocStatus: "Groundwater Extraction NOC Active"
            }
        },
        encumbrance: {
            isMortgaged: false,
            liens: [],
            caveats: [],
            legalDisputes: 0
        },
        activeTransaction: {
            refNo: "MUT-2026-TN-4091",
            type: "Deed Transliteration & Name Harmonization",
            appliedDate: "2026-08-25",
            currentStage: "Under Verification",
            stepIndex: 2,
            assignedOfficer: "S. Meenakshi, Head Surveyor / VAO Desk",
            handlingDept: "Revenue Department (Thiruporur Taluk)",
            slaDaysRemaining: 1,
            slaHoursRemaining: 42,
            slaStatus: "normal",
            slaTotalDays: 15,
            slaTotalHours: 360,
            pendingAction: "Submit digital biometric affirmation to affirm 'A. M. Velu' alias matches Annamalai Muthuvel for Patta #418 harmonization.",
            stages: [
                { index: 1, name: "Filed", date: "25-Aug-2026", status: "completed", by: "Citizen Portal", description: "Application submitted for name harmonization between English deed and Tamil Patta." },
                { index: 2, name: "Under Verification", date: "27-Aug-2026", status: "current", by: "Tahsildar Thiruporur", description: "Referred to Village Administrative Officer (VAO) desk for alias verification." },
                { index: 3, name: "Field Inspection", date: "Pending", status: "pending", by: "VAO Kelambakkam & Revenue Inspector", description: "In-person inquiry with local revenue village panchnama." },
                { index: 4, name: "Approved / Rejected", date: "Pending", status: "pending", by: "District Revenue Officer (DRO)", description: "Updating Tamil Nilam electronic land records system." }
            ],
            documentChecklist: [
                { id: "doc-1", name: "SRO Registered Sale Deed #TN-SRO-TP-2024/9021", status: "received", source: "SRO Thiruporur", dateVerified: "19-Jul-2024", action: null },
                { id: "doc-2", name: "Tamil Nilam Patta #418 Extract", status: "received", source: "Revenue Department (TN)", dateVerified: "25-Aug-2026", action: null },
                { id: "doc-3", name: "FMB Sketch Sub-division 102/3A", status: "received", source: "Survey & Settlement Desk", dateVerified: "11-Apr-2026", action: null },
                { id: "doc-4", name: "Aadhaar e-KYC Identity Affirmation Affidavit", status: "pending", source: "Citizen Online Submission", dateVerified: null, action: "Action Required: Click 'Submit Biometric Affirmation'" },
                { id: "doc-5", name: "VAO In-Person Inquiry Certificate", status: "pending", source: "Village Administrative Officer Kelambakkam", dateVerified: null, action: "Awaiting VAO Report" }
            ]
        },
        coordinates: [
            [80.2200, 12.7835],
            [80.2220, 12.7835],
            [80.2220, 12.7855],
            [80.2200, 12.7855],
            [80.2200, 12.7835]
        ]
    },
    {
        ulpin: "TN-08-9921-1200-5541",
        state: "TN",
        stateLabel: "Tamil Nadu",
        district: "Kanchipuram",
        tehsil: "Sriperumbudur",
        village: "Irungattukottai",
        khasra: "Survey #88/4B",
        ownerName: "K. Sundaram",
        coOwners: ["Annamalai Muthuvel (Joint Purchaser)"],
        landUse: "Commercial / Warehousing",
        zoningStatus: "SIPCOT Industrial Corridor",
        area: {
            value: 1.2,
            unit: "acres",
            sqMeters: 4856.23,
            localDisplay: "1.20 Acres"
        },
        trustScore: 41,
        verificationStatus: "conflict",
        verificationLabel: "SLA Breached — Overdue Mutation (> 28 Days)",
        lastUpdated: "2026-09-08T11:00:00Z",
        dataFreshness: "1 hour ago",
        conflictDetails: {
            whatDetected: "Statutory SLA breach on auto-triggered sale deed mutation. Mutation pendency at the Taluk Tahsildar desk exceeds the 28-day statutory mandate under Tamil Nadu Right to Public Services.",
            inconsistentRecords: "Registration occurred on 01-Aug-2026 (STAR 2.0 Deed #1109), but Tamil Nilam revenue record still reflects prior owner P. Natarajan.",
            handlingDepartment: "Revenue Department (Sriperumbudur Taluk) & Sub-Collector Office Kanchipuram.",
            assignedOfficer: "Harvinder Singh, Field Kanungo",
            currentStatus: "Stage 2 (Under Verification — Overdue & Escalated). Auto-escalation trigger dispatched to Revenue Divisional Officer (RDO).",
            actionRequired: "No further citizen filing required. Application is escalated under Right to Public Service Guarantee. Citizen may track the RDO hearing date.",
            whatHappensNext: "RDO will conduct a summary hearing within 7 working days to order mandatory Patta name transfer."
        },
        departments: {
            revenue: {
                recordId: "PATTA-TN-2023-884",
                owner: "P. Natarajan (Prior Owner — Mutation Pending)",
                area: "1.20 Acres",
                tenure: "Patta Land",
                taxStatus: "Overdue Notice Issued",
                jamabandiYear: "2023-2024",
                mutationStatus: "Overdue at Tehsildar Desk (> 28 days)"
            },
            registration: {
                deedNo: "TN-SRO-SPB-2026/1109",
                deedDate: "2026-08-01",
                executants: "P. Natarajan to K. Sundaram",
                areaRecorded: "1.20 Acres",
                consideration: "₹ 1,10,00,000",
                stampDuty: "₹ 7,70,000",
                status: "Sale Deed Registered 29 Days Ago"
            },
            survey: {
                fmbRef: "FMB 88/4B Sriperumbudur",
                gisArea: "1.20 Acres",
                coordinates: "12.9780° N, 79.9720° E",
                roverSurveyDate: "2025-06-20",
                discrepancyNote: "Physical boundaries match surveyed bounds."
            },
            urban: {
                authority: "DTCP / SIPCOT Special Project Desk",
                propertyTaxId: "TN-SIP-884",
                zoning: "Industrial Logistics Zone",
                buildingPlanStatus: "Application Under Review",
                nocStatus: "Pollution Control Board NOC Submitted"
            }
        },
        encumbrance: {
            isMortgaged: false,
            liens: [],
            caveats: [],
            legalDisputes: 0
        },
        activeTransaction: {
            refNo: "MUT-2026-TN-1109",
            type: "Online Sale Deed Mutation & Patta Transfer",
            appliedDate: "2026-08-02",
            currentStage: "Under Verification (Overdue)",
            stepIndex: 2,
            assignedOfficer: "Harvinder Singh, Field Kanungo",
            handlingDept: "Revenue Department (Sriperumbudur Taluk)",
            slaDaysRemaining: -0.3,
            slaHoursRemaining: -8,
            slaStatus: "breached",
            slaTotalDays: 28,
            slaTotalHours: 672,
            pendingAction: "Application auto-escalated to Revenue Divisional Officer (RDO) Kanchipuram under Right to Public Service Guarantee. Attend summary hearing if summoned.",
            stages: [
                { index: 1, name: "Filed", date: "02-Aug-2026", status: "completed", by: "STAR 2.0 Integration", description: "Auto-triggered mutation initiated upon deed registration." },
                { index: 2, name: "Under Verification", date: "Breached (8h ago)", status: "current", by: "Sriperumbudur Taluk", description: "Statutory 28-day SLA elapsed; escalated to RDO." },
                { index: 3, name: "Field Inspection", date: "Pending", status: "pending", by: "Field Surveyor Sriperumbudur", description: "Sub-division inspection pending clearance." },
                { index: 4, name: "Approved / Rejected", date: "Pending", status: "pending", by: "Revenue Divisional Officer (RDO)", description: "Statutory mandatory mutation order to be passed." }
            ],
            documentChecklist: [
                { id: "doc-1", name: "STAR 2.0 Registered Deed #1109/2026", status: "received", source: "SRO Sriperumbudur", dateVerified: "01-Aug-2026", action: null },
                { id: "doc-2", name: "Prior Patta Extract (P. Natarajan)", status: "received", source: "Tamil Nilam Ledger", dateVerified: "01-Aug-2026", action: null },
                { id: "doc-3", name: "FMB 88/4B Cadastral Boundary Sketch", status: "received", source: "Survey Department", dateVerified: "20-Jun-2025", action: null },
                { id: "doc-4", name: "Revenue Inspector Field Verification Certificate", status: "pending", source: "Taluk RI Desk", dateVerified: null, action: "Overdue at Officer Desk (>28 Days)" },
                { id: "doc-5", name: "Statutory RDO Escalation Notice #ESC-2026-9921", status: "received", source: "Land Trust Engine Right to Service", dateVerified: "08-Sep-2026", action: null }
            ]
        },
        coordinates: [
            [79.9710, 12.9770],
            [79.9730, 12.9770],
            [79.9730, 12.9790],
            [79.9710, 12.9790],
            [79.9710, 12.9770]
        ]
    },
    {
        ulpin: "TN-04-3420-2921-7744",
        state: "TN",
        stateLabel: "Tamil Nadu",
        district: "Tiruvallur",
        tehsil: "Ponneri",
        village: "Minjur",
        khasra: "Khasra 99/A",
        ownerName: "R. Jayaram",
        coOwners: ["J. Saraswathi"],
        landUse: "Agricultural (Nansey)",
        zoningStatus: "Coastal Regulation & Agr. Buffer",
        area: {
            value: 1.25,
            unit: "acres",
            sqMeters: 5058.57,
            localDisplay: "1.25 Acres (Deed) vs 1.14 Acres (Cadastral)"
        },
        trustScore: 38,
        verificationStatus: "conflict",
        verificationLabel: "Live GIS Discrepancy — Boundary Encroachment Alert",
        lastUpdated: "2026-09-10T09:00:00Z",
        dataFreshness: "5 hours ago (Drone Resurvey 2026)",
        conflictDetails: {
            whatDetected: "Spatial overlap with protected water catchment Poramboke land. Drone orthophoto resurvey reveals that 0.11 Acres of surveyed area extends across the ERIS Lake public drainage buffer line.",
            inconsistentRecords: "Sale Deed #TN-SRO-PON-2022/4412 registers 1.25 Acres; High precision DGPS Resurvey calculates only 1.14 Acres outside conservation buffer.",
            handlingDepartment: "Water Resources Department (WRD) & Survey & Land Records Directorate.",
            assignedOfficer: "Harvinder Singh, Field Kanungo",
            currentStatus: "Stage 1 (Detected & Flagged). Encroachment hazard overlay activated; Water Resources Dept NOC denied.",
            actionRequired: "Citizen must respond to PWD boundary demarcation notice and maintain physical setback beyond the 10-meter lake embankment margin.",
            whatHappensNext: "Survey inspection team will establish geo-referenced stone pillars at the 1.14 Acre boundary to regularize the legitimate agricultural title."
        },
        departments: {
            revenue: {
                recordId: "PATTA-TN-2024-99A",
                owner: "R. Jayaram",
                area: "1.25 Acres",
                tenure: "Ryotwari Patta",
                taxStatus: "Paid",
                jamabandiYear: "2024-2025",
                mutationStatus: "Flagged by AI GIS Anomaly Detector"
            },
            registration: {
                deedNo: "TN-SRO-PON-2022/4412",
                deedDate: "2022-04-18",
                executants: "G. Soundararajan to R. Jayaram",
                areaRecorded: "1.25 Acres",
                consideration: "₹ 62,50,000",
                stampDuty: "₹ 4,37,500",
                status: "Prior Deed Registered"
            },
            survey: {
                fmbRef: "Drone Orthophoto Resurvey DGPS-2026-09",
                gisArea: "1.14 Acres (-0.11 Acre encroachment into public drainage poramboke)",
                coordinates: "13.2750° N, 80.2610° E",
                roverSurveyDate: "2026-08-30",
                discrepancyNote: "High precision drone polygon reveals boundary overlap with water catchment line."
            },
            urban: {
                authority: "Minjur Town Panchayat",
                propertyTaxId: "TN-TP-MJ-99A",
                zoning: "Drainage Channel Buffer Zone",
                buildingPlanStatus: "Prohibited (Poramboke Buffer)",
                nocStatus: "Water Resources Dept NOC Denied"
            }
        },
        encumbrance: {
            isMortgaged: false,
            liens: ["Poramboke Encroachment Caveat by PWD"],
            caveats: [],
            legalDisputes: 1
        },
        activeTransaction: null,
        coordinates: [
            [80.2600, 13.2740],
            [80.2620, 13.2740],
            [80.2620, 13.2760],
            [80.2600, 13.2760],
            [80.2600, 13.2740]
        ]
    }
];

// =============================================================================
// 2. MOCK CITIZEN PROFILES
// =============================================================================
const mockCitizenProfiles = {
    "gurpreet": {
        id: "CIT-CH-8821",
        fullName: "Gurpreet Singh",
        fatherName: "S. Jaswant Singh",
        mobile: "+91 98765-43210",
        email: "gurpreet.singh@example.in",
        aadhaarMasked: "XXXX-XXXX-9041",
        state: "CH",
        stateLabel: "Chandigarh (UT)",
        address: "# 142/2, Sector 17, Chandigarh - 160017",
        linkedUlpins: [
            "CH-04-0012-8821-9041",
            "CH-01-1002-3344-5566",
            "CH-02-0045-1190-2021"
        ],
        preferences: {
            language: "en",
            smsAlerts: true,
            whatsappAlerts: true
        },
        pendingAction: {
            title: "Joint Demarcation Rover Inspection",
            deadline: "15-Sep-2026 at 10:30 AM",
            ulpin: "CH-04-0012-8821-9041",
            description: "Field Kanungo Harvinder Singh has scheduled on-site rover demarcation for Khasra 142/2. Citizen must keep registered deed #VAS-2024-8891 available on-site.",
            severity: "warning",
            buttonLabel: "View Demarcation Notice",
            tabTarget: "transactions"
        }
    },
    "ramesh": {
        id: "CIT-CH-1002",
        fullName: "Ramesh Kumar",
        fatherName: "Sh. Om Prakash",
        mobile: "+91 94170-10020",
        email: "ramesh.kumar@example.in",
        aadhaarMasked: "XXXX-XXXX-5566",
        state: "CH",
        stateLabel: "Chandigarh (UT)",
        address: "# 12, Commercial Belt, Sector 17-C, Chandigarh - 160017",
        linkedUlpins: [
            "CH-01-1002-3344-5566"
        ],
        preferences: {
            language: "en",
            smsAlerts: true,
            whatsappAlerts: true
        },
        pendingAction: null
    },
    "annamalai": {
        id: "CIT-TN-4091",
        fullName: "Annamalai Muthuvel",
        fatherName: "M. Muthuvel Pillai",
        mobile: "+91 94440-12345",
        email: "annamalai.velu@example.in",
        aadhaarMasked: "XXXX-XXXX-3302",
        state: "TN",
        stateLabel: "Tamil Nadu",
        address: "Plot 12, Mettu Street, Kelambakkam, Chengalpattu - 603103",
        linkedUlpins: [
            "TN-12-4091-7712-3302",
            "TN-08-9921-1200-5541",
            "TN-04-3420-2921-7744"
        ],
        preferences: {
            language: "ta",
            smsAlerts: true,
            whatsappAlerts: false
        },
        pendingAction: {
            title: "Aadhaar e-KYC Identity Affirmation",
            deadline: "18-Sep-2026 (Within 7 Days)",
            ulpin: "TN-12-4091-7712-3302",
            description: "Submit digital biometric affirmation to affirm 'A. M. Velu' alias matches Annamalai Muthuvel for Patta #418 harmonization.",
            severity: "warning",
            buttonLabel: "Submit Biometric Affirmation",
            tabTarget: "verification"
        }
    }
};

// =============================================================================
// 3. MOCK SERVICE REQUESTS (Citizen-Filed Inquiries & Demarcations)
// =============================================================================
let mockServiceRequests = [
    {
        requestId: "SR-2026-CH-0941",
        citizenId: "CIT-CH-8821",
        ulpin: "CH-04-0012-8821-9041",
        category: "Boundary Demarcation & Area Correction",
        categoryLabel: "Boundary Demarcation & Area Correction",
        submissionDate: "2026-08-22T09:45:00Z",
        status: "in_progress", // 'submitted' | 'in_progress' | 'resolved' | 'rejected'
        statusLabel: "In Progress (Field Notice Issued)",
        assignedDept: "Revenue & Survey Department (Kanungo Circle)",
        assignedOfficer: "Harvinder Singh, Field Kanungo",
        description: "Registered sale deed #VAS-2024-8891 reflects 450 sq.yd. Cadastral portal reflects 398 sq.yd. Requesting immediate joint DGPS rover demarcation with adjacent plot owners.",
        attachmentName: "Sale_Deed_2024_8891_Extract.pdf",
        responseMessage: "Field verification scheduled. Joint demarcation notice dispatched to plot 142/3 owners for 15-Sep-2026 at 10:30 AM.",
        slaDeadline: "2026-09-18T17:00:00Z"
    },
    {
        requestId: "SR-2026-CH-0112",
        citizenId: "CIT-CH-8821",
        ulpin: "CH-01-1002-3344-5566",
        category: "Certified Non-Encumbrance Certificate (NEC)",
        categoryLabel: "Certified Non-Encumbrance Certificate (NEC)",
        submissionDate: "2026-07-10T14:10:00Z",
        status: "resolved",
        statusLabel: "Resolved & Digitally Certified",
        assignedDept: "Sub-Registrar Office (SRO Sector 17)",
        assignedOfficer: "Rajesh Bansal, Sub-Registrar",
        description: "Application for 30-year digital non-encumbrance certificate for commercial bank financing.",
        attachmentName: "Property_Tax_Clearance_2026.pdf",
        responseMessage: "Non-Encumbrance Certificate generated and verified against tamper-proof registry hash. Digitally signed and delivered.",
        slaDeadline: "2026-07-15T17:00:00Z"
    }
];

// =============================================================================
// 4. MOCK NOTIFICATIONS
// =============================================================================
let mockNotifications = [
    {
        id: "NOTIF-101",
        citizenId: "CIT-CH-8821",
        ulpin: "CH-04-0012-8821-9041",
        type: "sla_warning",
        title: "SLA Countdown Alert: 14 Hours Remaining",
        message: "Your boundary demarcation review for Khasra 142/2 is nearing the 30-day statutory SLA window. Field Kanungo office has scheduled joint inspection.",
        timestamp: "2026-09-12T14:30:00Z",
        read: false,
        severity: "warning"
    },
    {
        id: "NOTIF-102",
        citizenId: "CIT-CH-8821",
        ulpin: "CH-04-0012-8821-9041",
        type: "service_request",
        title: "Joint Demarcation Date Scheduled",
        message: "Reference SR-2026-CH-0941: Nodal Kanungo Harvinder Singh has confirmed on-site DGPS inspection on 15-Sep-2026 at 10:30 AM.",
        timestamp: "2026-09-11T16:00:00Z",
        read: false,
        severity: "normal"
    },
    {
        id: "NOTIF-103",
        citizenId: "CIT-CH-8821",
        ulpin: "CH-01-1002-3344-5566",
        type: "trust_score",
        title: "Golden Record Consensus Confirmed (98/100)",
        message: "Parcel CH-01-1002-3344-5566 has achieved 98/100 Trust Score across Revenue, SRO, Cadastral GIS, and Urban repositories. Title is clean and marketable.",
        timestamp: "2026-09-01T08:15:00Z",
        read: true,
        severity: "success"
    },
    {
        id: "NOTIF-104",
        citizenId: "CIT-TN-4091",
        ulpin: "TN-08-9921-1200-5541",
        type: "sla_breach",
        title: "Statutory SLA Breached (-8h) — Escalated to RDO",
        message: "Sale deed mutation for Survey #88/4B exceeded the 28-day statutory window. Land Trust Engine has automatically escalated case to Revenue Divisional Officer Kanchipuram.",
        timestamp: "2026-09-12T12:00:00Z",
        read: false,
        severity: "critical"
    }
];

// =============================================================================
// 5. PLAIN-LANGUAGE GLOSSARY (Citizen Educational Aid)
// =============================================================================
const landGlossary = [
    {
        term: "ULPIN",
        fullName: "Unique Land Parcel Identification Number",
        definition: "A unique 14-digit alphanumeric code assigned to every physical land parcel in India, based on its latitude and longitude coordinates. Often called the 'Aadhaar for Land'."
    },
    {
        term: "RoR / Jamabandi",
        fullName: "Record of Rights",
        definition: "The official government register maintained by the State Revenue Department detailing legal ownership, shareholding, tenancy rights, cultivating status, and land revenue payable."
    },
    {
        term: "Mutation / Intiqal",
        fullName: "Mutation of Title",
        definition: "The statutory process of changing the title ownership record in the Revenue Department's Record of Rights following a sale, inheritance, gift, or partition."
    },
    {
        term: "Encumbrance",
        fullName: "Legal Charge or Mortgage",
        definition: "Any legal claim, bank mortgage, tax lien, or pending court injunction against the property that may restrict the owner's legal right to sell or transfer it."
    },
    {
        term: "Patta / Chitta",
        fullName: "Revenue Land Title Deed (Southern States)",
        definition: "A revenue document issued by the Tahsildar in states like Tamil Nadu establishing who owns a particular land parcel according to the government revenue records."
    },
    {
        term: "Cadastral Survey",
        fullName: "Boundary & Geo-spatial Demarcation",
        definition: "High-precision geographic boundary mapping showing exact physical dimensions, rover survey coordinates, and parcel boundaries on an official government GIS map."
    },
    {
        term: "Poramboke",
        fullName: "Government / Public Utility Land",
        definition: "Unassessed government land reserved for public purposes, such as water bodies (Eris, lakes), grazing grounds, public roads, and conservation areas."
    },
    {
        term: "Zoning & Master Plan",
        fullName: "Permissible Land Use Classification",
        definition: "Statutory classification defined by the Urban Planning / Town Planning Authority (e.g. Residential, Commercial, Agricultural, Industrial Buffer) determining what structures may legally be built."
    }
];

// =============================================================================
// 6. ASYNC LOADER SEAM (Mock Implementation Ready for 1-Line REST API Swap)
// =============================================================================

async function loadCitizenProfile(citizenKey = "gurpreet") {
    // Live API Seam:
    // const res = await fetch(`/api/v1/citizen/profile?id=${citizenKey}`);
    // return await res.json();
    return Promise.resolve(mockCitizenProfiles[citizenKey] || mockCitizenProfiles["gurpreet"]);
}

async function loadCitizenParcels(citizenKey = "gurpreet") {
    // Live API Seam:
    // const res = await fetch(`/api/v1/citizen/parcels?id=${citizenKey}`);
    // return await res.json();
    const profile = mockCitizenProfiles[citizenKey] || mockCitizenProfiles["gurpreet"];
    const parcels = mockParcels.filter(p => profile.linkedUlpins.includes(p.ulpin));
    return Promise.resolve(parcels);
}

async function loadParcelDetail(ulpin) {
    // Live API Seam:
    // const res = await fetch(`/api/v1/parcels/${encodeURIComponent(ulpin)}`);
    // return await res.json();
    const found = mockParcels.find(p => p.ulpin.toUpperCase() === ulpin.trim().toUpperCase());
    return Promise.resolve(found || null);
}

async function loadOwnershipVerification(ulpin) {
    // Live API Seam:
    // const res = await fetch(`/api/v1/parcels/${encodeURIComponent(ulpin)}/verification`);
    // return await res.json();
    const found = mockParcels.find(p => p.ulpin.toUpperCase() === ulpin.trim().toUpperCase());
    if (!found) return Promise.resolve(null);

    return Promise.resolve({
        ulpin: found.ulpin,
        ownerName: found.ownerName,
        status: found.verificationStatus,
        statusLabel: found.verificationLabel,
        trustScore: found.trustScore,
        conflictDetails: found.conflictDetails,
        departments: found.departments,
        encumbrance: found.encumbrance,
        lastUpdated: found.lastUpdated
    });
}

async function loadTransactionStatus(ulpin) {
    // Live API Seam:
    // const res = await fetch(`/api/v1/parcels/${encodeURIComponent(ulpin)}/transactions`);
    // return await res.json();
    const found = mockParcels.find(p => p.ulpin.toUpperCase() === ulpin.trim().toUpperCase());
    return Promise.resolve(found ? found.activeTransaction : null);
}

async function loadAllTransactions(citizenKey = "gurpreet") {
    // Live API Seam:
    // const res = await fetch(`/api/v1/citizen/transactions?id=${citizenKey}`);
    // return await res.json();
    const profile = mockCitizenProfiles[citizenKey] || mockCitizenProfiles["gurpreet"];
    const list = [];
    mockParcels.forEach(p => {
        if (profile.linkedUlpins.includes(p.ulpin) && p.activeTransaction) {
            list.push({
                ulpin: p.ulpin,
                khasra: p.khasra,
                ownerName: p.ownerName,
                transaction: p.activeTransaction
            });
        }
    });
    return Promise.resolve(list);
}

async function loadServiceRequests(citizenId = "CIT-CH-8821") {
    // Live API Seam:
    // const res = await fetch(`/api/v1/citizen/service-requests?citizen_id=${citizenId}`);
    // return await res.json();
    const list = mockServiceRequests.filter(sr => sr.citizenId === citizenId);
    return Promise.resolve(list);
}

async function submitServiceRequest(payload) {
    // Live API Seam:
    // const res = await fetch('/api/v1/citizen/service-requests', { method: 'POST', body: JSON.stringify(payload) });
    // return await res.json();
    const newId = `SR-2026-${payload.state || 'CH'}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newRecord = {
        requestId: newId,
        citizenId: payload.citizenId || "CIT-CH-8821",
        ulpin: payload.ulpin,
        category: payload.category,
        categoryLabel: payload.category,
        submissionDate: new Date().toISOString(),
        status: "submitted",
        statusLabel: "Submitted & Queued for Verification",
        assignedDept: payload.state === "TN" ? "Revenue & Registration (Taluk Tahsildar)" : "Revenue Department (SDM / Kanungo Circle)",
        assignedOfficer: "Pending Assignment (Kanungo Circle)",
        description: payload.description,
        attachmentName: payload.attachmentName || "Supporting_Document.pdf",
        responseMessage: "Application registered under Right to Public Service Guarantee. Digital receipt generated.",
        slaDeadline: new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString()
    };
    mockServiceRequests.unshift(newRecord);
    return Promise.resolve({ success: true, record: newRecord });
}

async function loadNotifications(citizenId = "CIT-CH-8821") {
    // Live API Seam:
    // const res = await fetch(`/api/v1/citizen/notifications?citizen_id=${citizenId}`);
    // return await res.json();
    const list = mockNotifications.filter(n => n.citizenId === citizenId);
    return Promise.resolve(list);
}

async function searchParcelsQuery(query, stateFilter = "ALL") {
    // Live API Seam:
    // const res = await fetch(`/api/v1/parcels/search?q=${encodeURIComponent(query)}&state=${stateFilter}`);
    // return await res.json();
    const q = (query || "").toLowerCase().trim();
    let results = mockParcels.filter(p => {
        const matchesQuery = !q ||
            p.ulpin.toLowerCase().includes(q) ||
            p.khasra.toLowerCase().includes(q) ||
            p.ownerName.toLowerCase().includes(q) ||
            p.district.toLowerCase().includes(q) ||
            p.village.toLowerCase().includes(q);
        const matchesState = stateFilter === "ALL" || p.state === stateFilter;
        return matchesQuery && matchesState;
    });
    return Promise.resolve(results);
}
