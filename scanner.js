// ─── Continuous Batch Camera Scanner (v5.8.0) ────────────────────────────────
let isScanning       = false;
let codeReader       = null;
let lastScan         = 0;
let lastScannedCode  = '';
let sessionScanCount = 0;

const SAME_CODE_DEBOUNCE_MS = 3500;
const NEXT_CODE_COOLDOWN_MS = 750;

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
        oscillator.frequency.value = 1480;
        gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);

        oscillator.start(audioCtx.currentTime);
        oscillator.stop(audioCtx.currentTime + 0.15);
    } catch (_) {}
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
    const txt  = document.getElementById('btnToggleText');
    if (wrap) wrap.style.display = active ? 'block' : 'none';
    if (btn) {
        btn.classList.toggle('scanning-active', active);
        if (txt) {
            txt.textContent = active ? 'Stop Scanner' : 'Scan Barcode';
        } else {
            btn.innerText = active ? 'STOP SCANNER' : 'SCAN BARCODE';
        }
    }
}

function setStatus(msg) {
    const el = document.getElementById('scan-status');
    if (el) el.textContent = msg;
}

function triggerScanVisualFlash() {
    const wrap = document.getElementById('viewport-wrap');
    if (!wrap) return;
    wrap.classList.add('scan-flash-success');
    setTimeout(() => wrap.classList.remove('scan-flash-success'), 450);
}

// ─── Scanner Control ──────────────────────────────────────────────────────────

function toggleScanner() {
    isScanning ? stopScanner() : startScanner();
}

async function startScanner() {
    setScannerUI(true);
    isScanning       = true;
    lastScan         = 0;
    lastScannedCode  = '';
    sessionScanCount = 0;
    setStatus('Starting camera (continuous batch mode)…');

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

        setStatus('Point camera at GS1-128 barcodes (continuous scan)…');

        await codeReader.decodeFromVideoDevice(
            deviceId,
            document.getElementById('video'),
            (result) => {
                if (!result) return;

                const now = Date.now();
                const sscc = extractSSCC(result.getText());
                if (!sscc) {
                    setStatus(`Unrecognized barcode (${result.getText().replace(/\D/g, '').length} digits)`);
                    return;
                }

                // Prevent camera frame bounce on the exact same label within 3.5s
                if (sscc === lastScannedCode && (now - lastScan < SAME_CODE_DEBOUNCE_MS)) return;
                // Short cooldown between distinct pallets
                if (now - lastScan < NEXT_CODE_COOLDOWN_MS) return;

                lastScan        = now;
                lastScannedCode = sscc;
                sessionScanCount++;

                const input    = document.getElementById('input');
                const existing = input.value.trim();
                input.value    = existing ? `${existing}\n${sscc}` : sscc;

                if (navigator.vibrate) navigator.vibrate([70, 40, 70]);
                beep();
                triggerScanVisualFlash();

                setStatus(`✓ Scanned #${sessionScanCount}: (00) …${sscc.slice(-8)} — Point at next pallet`);

                if (typeof process === 'function') process(true);
                if (typeof showToast === 'function') {
                    showToast(`📷 Scanned #${sessionScanCount}: (00) ${sscc}`, 'success');
                }
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
