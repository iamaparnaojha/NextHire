/**
 * NextHire — Router / Auth Guard (router.js)
 * Protects authenticated pages and provides redirect-after-login.
 */

(function() {
    'use strict';

    /**
     * Check if user is authenticated.
     * @returns {boolean}
     */
    function isAuthenticated() {
        const token = localStorage.getItem('nexthire_token');
        if (!token) return false;

        // Decode JWT and check expiry (basic check)
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const now = Math.floor(Date.now() / 1000);
            if (payload.exp && payload.exp < now) {
                // Token is expired
                localStorage.removeItem('nexthire_token');
                localStorage.removeItem('nexthire_user');
                return false;
            }
            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * Require authentication to access the current page.
     * Redirects to /login if not authenticated, preserving the intended page.
     */
    function requireAuth() {
        if (!isAuthenticated()) {
            const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
            window.location.href = `/login?redirect=${returnUrl}`;
        }
    }

    /**
     * If user is already logged in, redirect away from the login page.
     * @param {string} defaultRedirect - Where to go if no redirect param exists
     */
    function redirectIfAuth(defaultRedirect = '/dashboard') {
        if (isAuthenticated()) {
            const params = new URLSearchParams(window.location.search);
            const redirect = params.get('redirect') || defaultRedirect;
            window.location.href = decodeURIComponent(redirect);
        }
    }

    /**
     * Get the post-login redirect URL.
     * @returns {string}
     */
    function getRedirectUrl() {
        const params = new URLSearchParams(window.location.search);
        return params.get('redirect') || '/dashboard';
    }

    /**
     * Get current user data from localStorage.
     * @returns {object|null}
     */
    function getCurrentUser() {
        try {
            return JSON.parse(localStorage.getItem('nexthire_user'));
        } catch (e) {
            return null;
        }
    }

    // Expose globally
    window.isAuthenticated = isAuthenticated;
    window.requireAuth = requireAuth;
    window.redirectIfAuth = redirectIfAuth;
    window.getRedirectUrl = getRedirectUrl;
    window.getCurrentUser = getCurrentUser;
})();
