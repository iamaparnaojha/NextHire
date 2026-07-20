/**
 * NextHire — Toast Notification System (toast.js)
 * Animated, auto-dismissing toast notifications with variants.
 */

(function() {
    'use strict';

    // Ensure container exists
    function getContainer() {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.className = 'toast-container';
            document.body.appendChild(container);
        }
        return container;
    }

    const ICONS = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️',
    };

    const TITLES = {
        success: 'Success',
        error: 'Error',
        warning: 'Warning',
        info: 'Info',
    };

    /**
     * Show a toast notification.
     * @param {string} message  - Toast message text
     * @param {string} type     - 'success' | 'error' | 'warning' | 'info'
     * @param {number} duration - Auto-dismiss time in ms (default: 4000)
     */
    function showToast(message, type = 'info', duration = 4000) {
        const container = getContainer();

        const toast = document.createElement('div');
        toast.className = `toast toast--${type}`;
        toast.innerHTML = `
            <span class="toast-icon">${ICONS[type] || ICONS.info}</span>
            <div class="toast-body">
                <div class="toast-title">${TITLES[type] || TITLES.info}</div>
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close" aria-label="Close notification">✕</button>
        `;

        // Close button
        toast.querySelector('.toast-close').addEventListener('click', () => dismiss(toast));

        container.appendChild(toast);

        // Auto dismiss
        if (duration > 0) {
            setTimeout(() => dismiss(toast), duration);
        }

        // Limit to 5 visible toasts
        const toasts = container.querySelectorAll('.toast:not(.removing)');
        if (toasts.length > 5) {
            dismiss(toasts[0]);
        }

        return toast;
    }

    function dismiss(toast) {
        if (!toast || toast.classList.contains('removing')) return;
        toast.classList.add('removing');
        toast.addEventListener('animationend', () => {
            toast.remove();
        });
    }

    // Expose globally
    window.showToast = showToast;
    window.Toast = {
        success: (msg, dur) => showToast(msg, 'success', dur),
        error: (msg, dur) => showToast(msg, 'error', dur),
        warning: (msg, dur) => showToast(msg, 'warning', dur),
        info: (msg, dur) => showToast(msg, 'info', dur),
    };
})();
