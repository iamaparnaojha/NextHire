/**
 * NextHire — API Client (api.js)
 * Centralized fetch wrapper with JWT authorization header injection,
 * response handling, and error management.
 */

const API_BASE = '';  // Same origin — served by FastAPI

/**
 * Make an API request with automatic JWT injection.
 * @param {string} endpoint   - API path (e.g. '/api/auth/login')
 * @param {object} options    - Fetch options override
 * @returns {Promise<object>} - Parsed JSON response
 */
async function apiFetch(endpoint, options = {}) {
    const token = localStorage.getItem('nexthire_token');

    const defaultHeaders = {
        'Content-Type': 'application/json',
    };

    if (token) {
        defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    // If body is FormData, don't set Content-Type (browser sets multipart boundary)
    if (options.body instanceof FormData) {
        delete defaultHeaders['Content-Type'];
    }

    const config = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...(options.headers || {}),
        },
    };

    try {
        const response = await fetch(`${API_BASE}${endpoint}`, config);

        // Handle 401 — token expired or invalid
        if (response.status === 401) {
            localStorage.removeItem('nexthire_token');
            localStorage.removeItem('nexthire_user');
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
            throw new Error('Session expired. Please sign in again.');
        }

        // Handle non-OK responses
        if (!response.ok) {
            let errorMessage = 'Something went wrong';
            try {
                const errorData = await response.json();
                errorMessage = errorData.detail || errorData.message || errorMessage;
            } catch (e) {
                // Response wasn't JSON
                errorMessage = response.statusText || errorMessage;
            }
            throw new Error(errorMessage);
        }

        // Handle 204 No Content
        if (response.status === 204) {
            return null;
        }

        return await response.json();

    } catch (error) {
        // Network errors
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            throw new Error('Network error. Please check your connection.');
        }
        throw error;
    }
}

/**
 * Upload a file via multipart form.
 * @param {string} endpoint   - API path
 * @param {FormData} formData - Form data with file
 * @returns {Promise<object>}
 */
async function apiUpload(endpoint, formData) {
    return apiFetch(endpoint, {
        method: 'POST',
        body: formData,
        // Don't set Content-Type — browser handles multipart boundary
    });
}

/**
 * Connect to a Server-Sent Events endpoint with JWT auth.
 * @param {string} endpoint        - SSE endpoint path
 * @param {object} body            - Request body (sent as POST)
 * @param {function} onChunk       - Called for each text chunk
 * @param {function} onComplete    - Called when stream ends
 * @param {function} onError       - Called on error
 * @returns {function}             - Abort function
 */
function apiStream(endpoint, body, { onChunk, onComplete, onError }) {
    const token = localStorage.getItem('nexthire_token');
    const controller = new AbortController();

    (async () => {
        try {
            const response = await fetch(`${API_BASE}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
                },
                body: JSON.stringify(body),
                signal: controller.signal,
            });

            if (!response.ok) {
                let errorMsg = 'Stream error';
                try {
                    const err = await response.json();
                    errorMsg = err.detail || errorMsg;
                } catch (e) {}
                throw new Error(errorMsg);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';
            let eventLines = [];

            const processEvent = (lines) => {
                if (lines.length === 0) return;
                const data = lines.join('\n');
                if (data === '[DONE]') {
                    if (onComplete) onComplete();
                    return true;
                }
                if (onChunk) onChunk(data);
                return false;
            };

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const rawLine of lines) {
                    const line = rawLine.replace(/\r$/, '');
                    if (line === '') {
                        const doneSignal = processEvent(eventLines);
                        eventLines = [];
                        if (doneSignal) return;
                        continue;
                    }

                    if (line.startsWith('data:')) {
                        let data = line.slice(5);
                        if (data.startsWith(' ')) data = data.slice(1);
                        eventLines.push(data);
                    }
                }
            }

            if (buffer) {
                const rawLine = buffer.replace(/\r$/, '');
                if (rawLine.startsWith('data:')) {
                    let data = rawLine.slice(5);
                    if (data.startsWith(' ')) data = data.slice(1);
                    eventLines.push(data);
                }
            }

            if (eventLines.length > 0) {
                processEvent(eventLines);
            }

            if (onComplete) onComplete();
        } catch (error) {
            if (error.name === 'AbortError') return;
            if (onError) onError(error);
        }
    })();

    // Return abort function
    return () => controller.abort();
}
