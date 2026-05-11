/**
 * Initialization for SSCC Pro Vision
 * Moved out of inline <script> to allow stricter CSP (no 'unsafe-inline').
 */

document.addEventListener('DOMContentLoaded', () => {
    if (window.lucide) lucide.createIcons();
    if (typeof initFileUpload === 'function') initFileUpload();
});

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sscc-check/service-worker.js')
            .catch(err => console.warn('SW registration failed:', err));
    });
}
