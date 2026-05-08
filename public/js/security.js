/**
 * Security.js
 * Handles CSRF token retrieval and injection for fetch calls.
 */

// Robust dynamic URL detection for Localhost (with spaces/dashes) and Ngrok
window.BASE_URL = window.BASE_URL || window.location.origin + window.location.pathname.split('/public/')[0];
var SECURITY_API = window.BASE_URL + "/public/index.php/api";

console.log("[Security] Base URL:", BASE_URL);
console.log("[Security] API URL:", SECURITY_API);

window.CSRF_TOKEN = "";

/**
 * Fetches a new CSRF token from the server
 */
async function refreshCsrfToken() {
    try {
        const response = await fetch(`${SECURITY_API}/auth/csrf`, { credentials: 'include' });
        const data = await response.json();
        if (data.csrf_token) {
            window.CSRF_TOKEN = data.csrf_token;
            console.log("CSRF Token Refreshed");
        }
    } catch (error) {
        console.error("Failed to fetch CSRF token:", error);
    }
}

/**
 * Enhanced fetch wrapper that automatically includes CSRF token
 */
async function secureFetch(url, options = {}) {
    if (!window.CSRF_TOKEN) {
        await refreshCsrfToken();
    }

    const method = (options.method || 'GET').toUpperCase();
    
    // Initialize headers if they don't exist
    options.headers = options.headers || {};

    // Add CSRF token for state-changing methods
    if (['POST', 'PUT', 'DELETE'].includes(method)) {
        options.headers['X-CSRF-TOKEN'] = window.CSRF_TOKEN;
    }

    // Ensure credentials are sent for sessions
    options.credentials = 'include';

    let response = await fetch(url, options);

    // If forbidden, maybe CSRF expired? Refresh and try once more.
    if (response.status === 403 && ['POST', 'PUT', 'DELETE'].includes(method)) {
        await refreshCsrfToken();
        options.headers['X-CSRF-TOKEN'] = window.CSRF_TOKEN;
        response = await fetch(url, options);
    }

    return response;
}

// Initial fetch
refreshCsrfToken();
