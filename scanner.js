// ─── Scanner State ────────────────────────────────────────────────────────────
let isScanning  = false;
let codeReader  = null;
let lastScan    = 0;

const DEBOUNCE_MS = 2000;

// ─── SSCC Extraction ─────────────────────────────────────────────────────────

/**
 * Extracts the 18-digit SSCC from the raw string returned by ZXing.
 *
 * GS1-128 barcodes with AI (00) encode 20 numeric characters:
 *   "00" + 18 SSCC digits
 * ZXing returns the raw string without parentheses, e.g. "00123456789012345678".
 * Taking the last 18 would incorrectly include the "00" AI prefix and drop
 * the first 2 real SSCC digits — causing check digit failures.
 */
function extractSSCC(raw) {
    const digits = raw.replace(/\D/g, '');

    if (digits.length === 20 && digits.startsWith('00')) return digits.substring(2); // AI (00) + 18
    if (digits.length === 18) return digits;   // bare SSCC
    if (digits.length === 17) return digits;   // for check digit generation
    if (digits.length > 20)   return digits.substring(digits.length - 18); // last-resort fallback

    return null;
}

// ─── UI Helpers ───────────────────────────────────────────────────────────────

function setScannerUI(active) {
    const wrap   = document.getElementById('viewport-wrap');
    const btn    = document.getElementById('btnToggle');

    wrap.style.display      = active ? 'block' : 'none';
    btn.innerText           = active ? 'STOP SCANNER' : 'START SCANNER';
    btn.style.background    = active ? 'var(--danger)' : 'var(--primary)';
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

        // listVideoInputDevices is an instance method in ZXing 0.18.x (not static)
        let deviceId = null;
        try {
            const devices = await codeReader.listVideoInputDevices();

            // Prefer rear/environment-facing camera
            for (const device of devices) {
                const label = device.label.toLowerCase();
                if (label.includes('back') || label.includes('rear') ||
                    label.includes('environment') || label.includes('traseira')) {
                    deviceId = device.deviceId;
                    break;
                }
            }

            // Fallback: last device in list (usually rear on mobile)
            if (!deviceId && devices.length > 0) {
                deviceId = devices[devices.length - 1].deviceId;
            }
        } catch (_) {
            // Permissions not yet granted or API unavailable — let ZXing choose
            deviceId = null;
        }

        setStatus('Reading barcode…');

        await codeReader.decodeFromVideoDevice(
            deviceId,
            document.getElementById('video'),
            (result, err) => {
                if (!result) return; // frame errors are normal in continuous mode

                // Debounce: ignore rapid repeated reads of the same code
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

                // Avoid consecutive duplicate
                if (existing.split('\n').pop() === sscc) return;

                input.value = existing ? `${existing}\n${sscc}` : sscc;

                if (navigator.vibrate) navigator.vibrate([80, 40, 80]);

                stopScanner();
                process(); // defined in app.js
            }
        );

    } catch (err) {
        alert('Camera error: ' + err.message);
        stopScanner();
    }
}

function stopScanner() {
    if (codeReader) {
        codeReader.reset();
        codeReader = null;
    }
    setScannerUI(false);
    isScanning = false;
}
