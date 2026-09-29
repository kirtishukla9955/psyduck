/**
 * DHARAA Land Trust Engine - Admin Dashboard
 * Unified API Client (Zero-Build Fetch Wrapper)
 */

class ApiError extends Error {
    constructor(message, status = null, data = null, isNetworkError = false) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.data = data;
        this.isNetworkError = isNetworkError;
    }
}

const apiClient = {
    /**
     * Get the active backend base URL
     */
    getBaseUrl() {
        const config = (typeof window !== 'undefined' && window.DharaaConfig) 
            ? window.DharaaConfig 
            : (typeof DharaaConfig !== 'undefined' ? DharaaConfig : { API_BASE_URL: 'http://localhost:8000' });
        return config.API_BASE_URL.replace(/\/+$/, '');
    },

    /**
     * Execute an HTTP request with structured error handling & timeout
     */
    async request(method, endpoint, body = null, queryParams = null, options = {}) {
        const baseUrl = this.getBaseUrl();
        const timeoutMs = options.timeoutMs || 
            ((typeof window !== 'undefined' && window.DharaaConfig?.REQUEST_TIMEOUT_MS) || 10000);

        const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
        let url = `${baseUrl}${cleanEndpoint}`;

        if (queryParams && typeof queryParams === 'object') {
            const searchParams = new URLSearchParams();
            for (const [key, value] of Object.entries(queryParams)) {
                if (value !== null && value !== undefined && value !== '') {
                    searchParams.append(key, String(value));
                }
            }
            const queryString = searchParams.toString();
            if (queryString) {
                url += (url.includes('?') ? '&' : '?') + queryString;
            }
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

        const headers = {
            'Accept': 'application/json',
            ...(options.headers || {})
        };
        if (body && !headers['Content-Type']) {
            headers['Content-Type'] = 'application/json';
        }

        try {
            const response = await fetch(url, {
                method: method.toUpperCase(),
                headers,
                body: body ? JSON.stringify(body) : undefined,
                signal: controller.signal,
                ...options
            });

            clearTimeout(timeoutId);

            let responseData = null;
            const contentType = response.headers.get('content-type') || '';
            if (contentType.includes('application/json')) {
                try {
                    responseData = await response.json();
                } catch (parseErr) {
                    throw new ApiError('Failed to parse response JSON from backend', response.status, null);
                }
            } else {
                responseData = await response.text();
            }

            if (!response.ok) {
                const detailMsg = (responseData && typeof responseData === 'object' && responseData.detail)
                    ? responseData.detail
                    : `HTTP ${response.status}: ${response.statusText || 'Request failed'}`;
                throw new ApiError(detailMsg, response.status, responseData, false);
            }

            return responseData;
        } catch (err) {
            clearTimeout(timeoutId);

            if (err instanceof ApiError) {
                throw err;
            }

            if (err.name === 'AbortError') {
                throw new ApiError(`Request timed out after ${timeoutMs}ms (${url})`, null, null, true);
            }

            throw new ApiError(
                `Network error: Unable to reach backend at ${baseUrl}. Ensure backend is running. (${err.message})`,
                null,
                null,
                true
            );
        }
    },

    /**
     * Execute a GET request with structured error handling & timeout
     */
    async get(endpoint, queryParams = null, options = {}) {
        return this.request('GET', endpoint, null, queryParams, options);
    },

    /**
     * Execute a POST request with JSON body
     */
    async post(endpoint, body = null, options = {}) {
        return this.request('POST', endpoint, body, null, options);
    },

    /**
     * Execute a PUT request with JSON body
     */
    async put(endpoint, body = null, options = {}) {
        return this.request('PUT', endpoint, body, null, options);
    },

    /**
     * Execute a PATCH request with JSON body
     */
    async patch(endpoint, body = null, options = {}) {
        return this.request('PATCH', endpoint, body, null, options);
    },

    /**
     * Check if the backend is reachable
     * @returns {Promise<{available: boolean, service?: string, error?: string}>}
     */
    async checkHealth() {
        try {
            const res = await this.get('/', null, { timeoutMs: 45000 });
            return { available: true, data: res };
        } catch (err) {
            return { available: false, error: err.message, isNetworkError: err.isNetworkError };
        }
    }
};

// Global browser window attachment
if (typeof window !== 'undefined') {
    window.ApiError = ApiError;
    window.apiClient = apiClient;
    window.DharaaServices = window.DharaaServices || {};
    window.DharaaServices.apiClient = apiClient;
    window.DharaaServices.ApiError = ApiError;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { apiClient, ApiError };
}
