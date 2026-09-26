/**
 * DHARAA Land Trust Engine - Admin Dashboard
 * Mutation Service
 * Connects to backend FastAPI /mutations endpoints
 */

const mutationService = {
    /**
     * Retrieve list of land title mutation applications with live SLA tracking
     * @param {Object} [params] - Query parameters
     * @param {string} [params.ulpin] - Filter by parcel ULPIN
     * @param {string} [params.status] - Filter by status (PENDING, UNDER_REVIEW, APPROVED, REJECTED)
     * @param {boolean} [params.overdue_only=false] - Filter only mutations that breached statutory SLA
     * @param {number} [params.skip=0] - Offset
     * @param {number} [params.limit=100] - Limit
     * @returns {Promise<Array<Object>>} List of MutationOut objects
     */
    async getMutations(params = {}) {
        const client = (typeof window !== 'undefined' && window.apiClient) ? window.apiClient : apiClient;
        const queryParams = {};
        if (params.ulpin) queryParams.ulpin = params.ulpin;
        if (params.status) queryParams.status = params.status;
        if (params.overdue_only) queryParams.overdue_only = 'true';
        if (params.skip !== undefined) queryParams.skip = params.skip;
        if (params.limit !== undefined) queryParams.limit = params.limit;
        return await client.get('/mutations', queryParams);
    },

    /**
     * Fetch single mutation by its business identifier (e.g. MUT-2026-0001)
     * @param {string} mutationId - Business mutation ID
     * @returns {Promise<Object>} MutationOut object
     */
    async getMutationById(mutationId) {
        if (!mutationId || typeof mutationId !== 'string') {
            throw new Error('Valid mutation ID is required');
        }
        const client = (typeof window !== 'undefined' && window.apiClient) ? window.apiClient : apiClient;
        return await client.get(`/mutations/${encodeURIComponent(mutationId.trim())}`);
    }
};

// Global browser window attachment
if (typeof window !== 'undefined') {
    window.mutationService = mutationService;
    window.DharaaServices = window.DharaaServices || {};
    window.DharaaServices.mutationService = mutationService;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = mutationService;
}
