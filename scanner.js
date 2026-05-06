// ─── Scanner State ────────────────────────────────────────────────────────────
let isScanning = false;
let codeReader = null;
let lastScan   = 0;

const DEBOUNCE_MS = 2000;

// ─── Beep (Web Audio API) ─────────────────────────────────────────────────────

let audioCtx = null;

function beep() {
    try {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();

        const oscillator = audioCtx.createOscillator();
        const gainNode   = audioCtx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator.type            = 'sine';
        oscillator.frequency.value = 1480; // high-pitched, scanner-like
        gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);

        oscillator.start(audioCtx.currentTime);
        oscillator.stop(audioCtx.currentTime + 0.15);
    } catch (_) {
        // Audio not available — silent fail
    }
}

// ─── SSCC Extraction ──────────────────────────────────────────────────────────

function extractSSCC(raw) {
    const digits = raw.replace(/\D/g, '');
    if (digits.length === 20 && digits.startsWith('00')) return digits.substring(2);
    if (digits.length === 18) return digits;
    if (digits.length === 17) return digits;
    if (digits.length > 20)   return digits.substring(digits.length - 18);
    return null;
}

// ─── UI Helpers ───────────────────────────────────────────────────────────────

function setScannerUI(active) {
    const wrap = document.getElementById('viewport-wrap');
    const btn  = document.getElementById('btnToggle');
    wrap.style.display   = active ? 'block' : 'none';
    btn.style.background = active ? 'var(--danger)' : 'var(--primary)';

    btn.innerText = active ? 'STOP SCANNER' : 'START SCANNER';
}

function setStatus(msg) {
    document.getElementById('scan-status').textContent = msg;
}

// ─── Scanner Control ──────────────────────────────────────────────────────────

function toggleScanner() {
    isScanning ? stopScanner() : startScanner();
}

async function startScanner() {
    setScannerUI(true);
    isScanning = true;
    lastScan   = 0;
    setStatus('Starting camera…');

    try {
        codeReader = new ZXing.BrowserMultiFormatReader();

        let deviceId = null;
        try {
            const devices = await codeReader.listVideoInputDevices();
            for (const device of devices) {
                const label = device.label.toLowerCase();
                if (label.includes('back') || label.includes('rear') ||
                    label.includes('environment') || label.includes('traseira')) {
                    deviceId = device.deviceId;
                    break;
                }
            }
            if (!deviceId && devices.length > 0) deviceId = devices[devices.length - 1].deviceId;
        } catch (_) {
            deviceId = null;
        }

        setStatus('Reading barcode…');

        await codeReader.decodeFromVideoDevice(
            deviceId,
            document.getElementById('video'),
            (result, err) => {
                if (!result) return;

                const now = Date.now();
                if (now - lastScan < DEBOUNCE_MS) return;

                const sscc = extractSSCC(result.getText());
                if (!sscc) {
                    setStatus(`Unrecognized format (${result.getText().replace(/\D/g, '').length} digits)`);
                    return;
                }

                lastScan = now;

                const input    = document.getElementById('input');
                const existing = input.value.trim();
                if (existing.split('\n').pop() === sscc) return;

                input.value = existing ? `${existing}\n${sscc}` : sscc;

                // Feedback: vibration + beep
                if (navigator.vibrate) navigator.vibrate([80, 40, 80]);
                beep();

                // Save to history (camera scans only)
                if (typeof historyAdd === 'function') historyAdd(sscc);

                stopScanner();
                process();
            }
        );

    } catch (err) {
        alert('Camera error: ' + err.message);
        stopScanner();
    }
}

function stopScanner() {
    if (codeReader) { codeReader.reset(); codeReader = null; }
    setScannerUI(false);
    isScanning = false;
}
