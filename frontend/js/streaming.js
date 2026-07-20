/**
 * NextHire — Streaming Consumer & Markdown Renderer (streaming.js)
 * Wraps the apiStream call to update a DOM element recursively with typing effect.
 */

(function() {
    'use strict';

    /**
     * Start a streaming AI response and render it to a container.
     * @param {Object} config
     * @param {string} config.endpoint - API path
     * @param {Object} config.body     - Request body payload
     * @param {string} config.containerId - DOM element ID to render markdown into
     * @param {string} config.indicatorId - DOM element ID for typing indicator
     * @param {Function} config.onComplete - Callback when stream finishes
     * @param {Function} config.onError    - Callback on error
     * @returns {Function} Abort function
     */
    window.startStreamingResponse = function(config) {
        const { endpoint, body, containerId, indicatorId, onComplete, onError } = config;
        
        const container = document.getElementById(containerId);
        const indicator = document.getElementById(indicatorId);
        
        if (!container) throw new Error(`Container #${containerId} not found`);
        
        // Reset state
        container.innerHTML = '';
        let fullMarkdownText = '';
        
        if (indicator) {
            indicator.classList.remove('hidden');
        }

        const abortStream = apiStream(endpoint, body, {
            onChunk: (chunkText) => {
                fullMarkdownText += chunkText;
                
                // Parse markdown to HTML using Marked.
                if (window.marked) {
                    marked.setOptions({
                        gfm: true,
                        breaks: false,
                        smartLists: true,
                        smartypants: false,
                        mangle: false,
                        headerIds: false
                    });
                    container.innerHTML = marked.parse(fullMarkdownText);
                } else {
                    // Fallback to simple text append if marked is not available
                    container.innerHTML = `<pre style="white-space: pre-wrap; font-family: inherit;">${fullMarkdownText}</pre>`;
                }
                
                // Auto-scroll to bottom if near the bottom.
                const parent = container.parentElement;
                if (parent && parent.scrollHeight - parent.scrollTop < parent.clientHeight + 100) {
                    parent.scrollTo(0, parent.scrollHeight);
                }
            },
            onComplete: () => {
                if (indicator) {
                    indicator.classList.add('hidden');
                }
                if (onComplete) onComplete(fullMarkdownText);
            },
            onError: (err) => {
                if (indicator) {
                    indicator.classList.add('hidden');
                }
                if (onError) {
                    onError(err);
                } else {
                    Toast.error(err.message || 'Stream connection failed.');
                }
            }
        });

        return abortStream;
    };
})();
