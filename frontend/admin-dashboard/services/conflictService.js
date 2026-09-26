/**
 * DHARAA Land Trust Engine - Admin Dashboard
 * Conflict Service
 * Connects to backend FastAPI /conflicts endpoints
 */

const conflictService = {
    /**
     * Retrieve all active multi-department anomalies, boundary overlaps, and overdue mutations
     * @returns {Promise<Object>} SystemConflictSummary model from backend
     */
    async getConflicts() {
        const client = (typeof window !== 'undefined' && window.apiClient) ? window.apiClient : apiClient;
        return await client.get('/conflicts');
    },

    /**
     * Inspect multi-department discrepancies for a specific parcel ULPIN
     * @param {string} ulpin - Deterministic 14-character ULPIN
     * @returns {Promise<Object>} ConflictReport model from backend
     */
    async getConflictByUlpin(ulpin) {
        if (!ulpin || typeof ulpin !== 'string') {
            throw new Error('Valid ULPIN string is required');
        }
        const client = (typeof window !== 'undefined' && window.apiClient) ? window.apiClient : apiClient;
        return await client.get(`/conflicts/${encodeURIComponent(ulpin.trim())}`);
    }
};

// Global browser window attachment
if (typeof window !== 'undefined') {
    window.conflictService = conflictService;
    window.DharaaServices = window.DharaaServices || {};
    window.DharaaServices.conflictService = conflictService;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = conflictService;
}
