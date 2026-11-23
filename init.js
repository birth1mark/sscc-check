/**
 * Initialization for SSCCAPI (v5.7.0)
 */

let deferredInstallPrompt = null;

document.addEventListener('DOMContentLoaded', () => {
    // Render empty state and initialize workspace
    if (typeof render === 'function') render();

    // Initialize file upload drag & drop
    if (typeof initFileUpload === 'function') initFileUpload();

    // Initialize hardware laser / Bluetooth barcode scanner wedge listener
    if (typeof initHardwareScannerListener === 'function') initHardwareScannerListener();

    // Check URL parameters (?code=..., #share=..., #labels)
    if (typeof checkUrlShare === 'function') checkUrlShare();

    // Check Stripe Checkout redirect (?session_id=cs_...) to auto-claim Pro API Key
    if (typeof checkStripeCheckoutClaim === 'function') checkStripeCheckoutClaim();

    // Update session audit count in history pill
    if (typeof updateHistoryCount === 'function') updateHistoryCount();

    // Initialize Lucide icons
    if (window.lucide) lucide.createIcons();

    // Online / Offline Status Indicator
    const updateNetworkStatus = () => {
        const dot = document.querySelector('.brand-dot');
        if (!dot) return;
        if (navigator.onLine) {
            dot.style.background = 'var(--success)';
            dot.title = 'Online — PWA ready';
        } else {
            dot.style.background = '#f59e0b';
            dot.title = 'Offline Mode Active (Local cache)';
        }
    };
    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);
    updateNetworkStatus();
});

// PWA Installation Support
window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    deferredInstallPrompt = e;
    const pwaBtn = document.getElementById('btn-pwa-install');
    if (pwaBtn) pwaBtn.style.display = 'inline-flex';
});

function triggerPWAInstall() {
    if (!deferredInstallPrompt) return;
    deferredInstallPrompt.prompt();
    deferredInstallPrompt.userChoice.then(() => {
        deferredInstallPrompt = null;
        const pwaBtn = document.getElementById('btn-pwa-install');
        if (pwaBtn) pwaBtn.style.display = 'none';
    });
}

// Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./service-worker.js')
            .catch(err => console.warn('SW registration failed:', err));
    });
}
