import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

citizen_html = """
<!-- CITIZEN PORTAL VIEW (STEP 2) -->
<div id="view-citizen-portal" class="hidden" style="padding: 24px; max-width: 1200px; margin: 0 auto; display: none;">
    <!-- 2.1 Search & Hero -->
    <div class="citizen-hero-search-card" style="background: white; border-radius: 12px; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); margin-bottom: 24px; text-align: center; border-top: 4px solid #3b82f6;">
        <h2 style="font-size: 24px; font-weight: 700; color: #1e293b; margin-bottom: 12px;">Verify Land Record / Know Your Land (अपना भू-अभिलेख जानें)</h2>
        <p style="color: #64748b; margin-bottom: 24px;">Search by 14-digit ULPIN, Owner Name, or Khasra/Survey Number</p>
        
        <form class="hero-search-box" onsubmit="handleCitizenSearch(event)" style="display: flex; gap: 8px; max-width: 600px; margin: 0 auto;">
            <input type="text" id="citizenSearchInput" class="hero-search-input mono" placeholder="Enter ULPIN (e.g. CH-04-0012-8821-9041)..." required autocomplete="off" style="flex: 1; padding: 12px 16px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 15px;">
            <button type="submit" class="hero-search-btn" style="background: #3b82f6; color: white; border: none; border-radius: 8px; padding: 0 24px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px;">
                <i data-lucide="search" style="width: 18px; height: 18px;"></i> Search
            </button>
        </form>
        
        <div class="hero-quick-chips" style="margin-top: 20px; font-size: 13px; color: #64748b;">
            <span>Try Sample ULPINs:</span>
            <button type="button" class="quick-chip mono" onclick="citizenQuickSearch('CH-04-0012-8821-9041')" style="background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 16px; padding: 4px 12px; cursor: pointer; margin-left: 8px;">CH-04-0012-8821-9041</button>
            <button type="button" class="quick-chip mono" onclick="citizenQuickSearch('TN-04-3420-2921-7744')" style="background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 16px; padding: 4px 12px; cursor: pointer; margin-left: 8px;">TN-04-3420-2921-7744</button>
        </div>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
        <!-- 2.3 RoR Card -->
        <div id="citizenRorCard" style="background: white; border-radius: 12px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); display: none;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 16px;">
                <h3 style="font-size: 18px; font-weight: 700; color: #1e293b;">Digital Record of Rights (RoR)</h3>
                <span id="citSatelliteBadge" style="background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600; display: flex; align-items: center; gap: 4px;">
                    <i data-lucide="satellite" style="width: 14px; height: 14px;"></i> Sentinel-2 Verified
                </span>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px;">
                <div><div style="font-size: 12px; color: #64748b; text-transform: uppercase;">ULPIN</div><div id="citUlpin" class="mono" style="font-weight: 600; font-size: 15px;">-</div></div>
                <div><div style="font-size: 12px; color: #64748b; text-transform: uppercase;">Khasra No.</div><div id="citKhasra" style="font-weight: 600; font-size: 15px;">-</div></div>
                <div><div style="font-size: 12px; color: #64748b; text-transform: uppercase;">Registered Owner</div><div id="citOwner" style="font-weight: 600; font-size: 15px;">-</div></div>
                <div><div style="font-size: 12px; color: #64748b; text-transform: uppercase;">Total Area</div><div id="citArea" style="font-weight: 600; font-size: 15px;">-</div></div>
                <div><div style="font-size: 12px; color: #64748b; text-transform: uppercase;">Land Classification</div><div id="citClass" style="font-weight: 600; font-size: 15px;">-</div></div>
                <div><div style="font-size: 12px; color: #64748b; text-transform: uppercase;">Encumbrance (भार स्थिति)</div><div id="citEncumb" style="font-weight: 600; font-size: 15px; color: #059669;">-</div></div>
                <div style="grid-column: span 2;"><div style="font-size: 12px; color: #64748b; text-transform: uppercase;">Dispute Status</div><div id="citDispute" style="font-weight: 600; font-size: 15px; color: #dc2626;">-</div></div>
            </div>

            <div style="display: flex; gap: 12px; border-top: 1px solid #e2e8f0; padding-top: 16px;">
                <button class="btn-action" style="flex: 1; justify-content: center; background: #f8fafc; border: 1px solid #cbd5e1;" onclick="alert('Downloading Certified Digital Copy (Demo)...')">
                    📄 Download Certified Copy
                </button>
                <button class="btn-action" style="flex: 1; justify-content: center; background: #fef2f2; color: #dc2626; border: 1px solid #fecaca;" onclick="openDiscrepancyModal()">
                    ⚠️ Report Discrepancy
                </button>
            </div>
        </div>

        <!-- 2.2 Map Container -->
        <div id="citizenMapContainer" style="background: white; border-radius: 12px; padding: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); display: none; flex-direction: column;">
            <h3 style="font-size: 16px; font-weight: 600; margin-bottom: 12px;">Cadastral Map</h3>
            <!-- We will append the existing gisService map div here via DOM manipulation in JS, or create a new one -->
            <div id="citMapProxy" style="flex: 1; min-height: 350px; background: #f1f5f9; border-radius: 8px; overflow: hidden; position: relative;"></div>
        </div>
    </div>
</div>

<!-- 2.4 Report Discrepancy Modal -->
<div id="discrepancyModal" class="hidden" style="position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 1000; display: none; align-items: center; justify-content: center;">
    <div style="background: white; border-radius: 12px; padding: 24px; width: 100%; max-width: 500px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);">
        <h3 style="font-size: 18px; font-weight: 700; margin-bottom: 16px;">Report Land Record Discrepancy</h3>
        <form id="discrepancyForm" onsubmit="submitDiscrepancy(event)">
            <input type="hidden" id="discUlpin">
            <div style="margin-bottom: 12px;">
                <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 4px;">Citizen Name</label>
                <input type="text" id="discName" required style="width: 100%; padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 6px;">
            </div>
            <div style="margin-bottom: 12px;">
                <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 4px;">Phone / Aadhaar</label>
                <input type="text" id="discPhone" required style="width: 100%; padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 6px;">
            </div>
            <div style="margin-bottom: 12px;">
                <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 4px;">Discrepancy Type</label>
                <select id="discType" required style="width: 100%; padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 6px;">
                    <option value="spatial_overlap">Boundary / Area mismatch</option>
                    <option value="owner_mismatch">Ownership / Name dispute</option>
                    <option value="encumbrance_dispute">Mortgage / Encumbrance error</option>
                </select>
            </div>
            <div style="margin-bottom: 16px;">
                <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 4px;">Description</label>
                <textarea id="discDesc" required rows="3" style="width: 100%; padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 6px;"></textarea>
            </div>
            <div style="margin-bottom: 20px;">
                <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 4px;">Attachment</label>
                <input type="file" style="font-size: 13px;">
            </div>
            <div style="display: flex; gap: 12px; justify-content: flex-end;">
                <button type="button" onclick="closeDiscrepancyModal()" style="padding: 8px 16px; background: white; border: 1px solid #cbd5e1; border-radius: 6px; cursor: pointer;">Cancel</button>
                <button type="submit" style="padding: 8px 16px; background: #dc2626; color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer;">Submit Grievance</button>
            </div>
        </form>
    </div>
</div>
"""

# Insert citizen HTML before the closing </main>
if '</main>' in content:
    content = content.replace('</main>', citizen_html + '\n</main>')
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Injected citizen portal HTML into index.html")
else:
    print("Could not find </main> in index.html")
