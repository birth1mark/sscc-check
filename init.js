/**
 * Initialization for SSCC Pro Vision
 * Standard version without multilingue overhead.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Inicializa ícones Lucide
    if (window.lucide) lucide.createIcons();
    
    // Inicializa lógica de ficheiros do parser.js
    if (typeof initFileUpload === 'function') initFileUpload();
});

// Registo do Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sscc-check/service-worker.js')
            .catch(err => console.warn('SW registration failed:', err));
    });
}