/**
 * Initialization for SSCC Pro Vision (v5.6.0)
 */

let deferredInstallPrompt = null;

document.addEventListener('DOMContentLoaded', () => {
    // Inicializa ícones Lucide
    if (window.lucide) lucide.createIcons();

    // Inicializa lógica de ficheiros do parser.js
    if (typeof initFileUpload === 'function') initFileUpload();

    // Inicializa suporte a hardware scanner (laser / Bluetooth wedge)
    if (typeof initHardwareScannerListener === 'function') initHardwareScannerListener();

    // Verifica partilhas por URL (#share=...)
    if (typeof checkUrlShare === 'function') checkUrlShare();

    // Atualiza contagem de sessões no histórico
    if (typeof updateHistoryCount === 'function') updateHistoryCount();

    // Indicador de Online / Offline
    const updateNetworkStatus = () => {
        const dot = document.querySelector('.brand-dot');
        if (!dot) return;
        if (navigator.onLine) {
            dot.style.background = 'var(--success)';
            dot.title = 'Online — PWA pronta';
        } else {
            dot.style.background = '#f59e0b';
            dot.title = 'Modo Offline Ativo (Cache local)';
        }
    };
    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);
    updateNetworkStatus();
});

// Suporte para instalação PWA
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

// Registo do Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./service-worker.js')
            .catch(err => console.warn('SW registration failed:', err));
    });
}
