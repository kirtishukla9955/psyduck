/**
 * DHARAA Land Trust Engine - Admin Dashboard
 * Parcel Service
 * Connects to backend FastAPI /parcels endpoints
 */

const parcelService = {
    /**
     * Fetch single parcel by ULPIN with full ROR, encumbrance, and trust status
     * @param {string} ulpin - Deterministic 14-character ULPIN
     * @returns {Promise<Object>} ParcelOut model from backend
     */
    async getParcelByUlpin(ulpin) {
        if (!ulpin || typeof ulpin !== 'string') {
            throw new Error('Valid ULPIN string is required');
        }
        const client = (typeof window !== 'undefined' && window.apiClient) ? window.apiClient : apiClient;
        return await client.get(`/parcels/${encodeURIComponent(ulpin.trim())}`);
    },

    /**
     * List parcels with optional pagination and filters
     * @param {Object} [params] - Query parameters
     * @param {number} [params.skip=0] - Offset
     * @param {number} [params.limit=100] - Limit (1 to 500)
     * @param {string} [params.owner_name] - Substring search on owner name
     * @param {string} [params.state] - State code filter (e.g. 'CH', 'PB', 'HR', 'TN')
     * @returns {Promise<Array<Object>>} List of ParcelSummary objects
     */
    async getParcels(params = {}) {
        const client = (typeof window !== 'undefined' && window.apiClient) ? window.apiClient : apiClient;
        const queryParams = {};
        if (params.skip !== undefined) queryParams.skip = params.skip;
        if (params.limit !== undefined) queryParams.limit = params.limit;
        if (params.owner_name) queryParams.owner_name = params.owner_name;
        if (params.state) queryParams.state = params.state;
        return await client.get('/parcels', queryParams);
    },

    /**
     * Fetch geographic bounding box and default cluster summary
     * @returns {Promise<Object>} Bounding box metadata
     */
    async getParcelBounds() {
        const client = (typeof window !== 'undefined' && window.apiClient) ? window.apiClient : apiClient;
        return await client.get('/parcels/bounds');
    },

    /**
     * Fetch parcels within a geographic viewport bounding box
     * @param {number} minLng - Minimum Longitude (West)
     * @param {number} minLat - Minimum Latitude (South)
     * @param {number} maxLng - Maximum Longitude (East)
     * @param {number} maxLat - Maximum Latitude (North)
     * @returns {Promise<Object>} GeoJSON FeatureCollection
     */
    async getParcelsInBbox(minLng, minLat, maxLng, maxLat) {
        const client = (typeof window !== 'undefined' && window.apiClient) ? window.apiClient : apiClient;
        const bboxStr = `${minLng},${minLat},${maxLng},${maxLat}`;
        return await client.get('/parcels', { bbox: bboxStr });
    },

    /**
     * Register / Create a new cadastral parcel in the database
     * @param {Object} data - ParcelCreate schema (owner_name, geometry, ulpin, land_use, area_sqm, etc.)
     * @returns {Promise<Object>} Created ParcelOut feature
     */
    async createParcel(data) {
        if (!data || typeof data !== 'object') {
            throw new Error('Parcel payload data object is required');
        }
        const client = (typeof window !== 'undefined' && window.apiClient) ? window.apiClient : apiClient;
        return await client.post('/parcels', data);
    },

    /**
     * Update an existing parcel record and geometry
     * @param {string} ulpin - Unique Land Parcel Identification Number
     * @param {Object} data - ParcelUpdate schema
     * @returns {Promise<Object>} Updated ParcelOut feature
     */
    async updateParcel(ulpin, data) {
        if (!ulpin || typeof ulpin !== 'string') {
            throw new Error('Valid ULPIN string is required for update');
        }
        if (!data || typeof data !== 'object') {
            throw new Error('Parcel update payload data is required');
        }
        const client = (typeof window !== 'undefined' && window.apiClient) ? window.apiClient : apiClient;
        return await client.put(`/parcels/${encodeURIComponent(ulpin.trim())}`, data);
    }
};

// Global browser window attachment
if (typeof window !== 'undefined') {
    window.parcelService = parcelService;
    window.DharaaServices = window.DharaaServices || {};
    window.DharaaServices.parcelService = parcelService;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = parcelService;
}
