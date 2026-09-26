/**
 * DHARAA Land Trust Engine - Admin Dashboard
 * Service Configuration
 */

const DharaaConfig = {
    // Configurable backend base URL (defaults to standard local FastAPI port)
    API_BASE_URL: 'http://localhost:8000',

    /**
     * Google Maps Browser API Key (Configurable)
     * To enable live Google Maps satellite & roadmap tiles:
     * 1. Add your Google Maps JavaScript API key below: GOOGLE_MAPS_API_KEY: 'AIzaSy...'
     * 2. Or pass it as a URL parameter: ?gmaps_key=YOUR_KEY
     * 3. Or enter it in the GIS view configuration prompt in the dashboard.
     * Note: Restrict this browser key by HTTP referrer in Google Cloud Console for security.
     */
    GOOGLE_MAPS_API_KEY: '',

    // Request timeout in milliseconds
    REQUEST_TIMEOUT_MS: 8000,

    // Environment and debug flags
    DEBUG: false,

    // Supported language codes
    SUPPORTED_LANGUAGES: ['en', 'hi', 'mr'],
    DEFAULT_LANGUAGE: 'en'
};

// Global browser window attachment for zero-build script inclusion
if (typeof window !== 'undefined') {
    window.DharaaConfig = DharaaConfig;
    window.DharaaServices = window.DharaaServices || {};
    window.DharaaServices.config = DharaaConfig;
}

// ES module export support
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DharaaConfig;
}
