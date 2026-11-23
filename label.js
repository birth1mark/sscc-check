/**
 * SSCC Pro Vision — Cloud Label & Barcode API Client SDK (Open-Core Edition)
 *
 * The commercial GS1-128, 2D QR Digital Link (ISO/IEC 18004) & Zebra ZPL-II compiler
 * is hosted on the Cloudflare Edge API: https://sscc-labels.birth1mark.workers.dev
 * and the official Web Studio: https://ssccapi.com/
 *
 * - Free Evaluation Tier: 25 labels included per GS1 Company Prefix (GCP)
 * - Pro API Keys (X-API-Key: sscc_pro_...): https://ssccapi.com/sscc-api-guide.html
 */

const LABELS_API_BASE_URL = 'https://ssccapi.com';
const PRO_API_KEY_STORAGE_KEY = 'sscc_pro_api_key_v1';

/**
 * Official JavaScript SDK helper: Generate single or batch GS1 Pallet Labels or Barcodes via Cloud API.
 * @param {Object} options - { gcp, startSerial, quantity, ssccs, layout: 'full'|'barcode-only', symbology: 'dual'|'gs1-128'|'qr', format: 'json'|'zpl'|'html'|'svg', apiKey }
 */
async function generateSSCCLabelsViaCloud(options = {}) {
    const apiKey = options.apiKey || (typeof localStorage !== 'undefined' ? localStorage.getItem(PRO_API_KEY_STORAGE_KEY) : '') || '';
    const headers = { 'Content-Type': 'application/json' };
    if (apiKey) headers['X-API-Key'] = apiKey;

    const res = await fetch(`${LABELS_API_BASE_URL}/v1/labels`, {
        method: 'POST',
        headers,
        body: JSON.stringify(options)
    });
    if (options.format === 'zpl' || options.format === 'html' || options.format === 'svg') {
        return await res.text();
    }
    return await res.json();
}

/**
 * Official JavaScript SDK helper: Generate a standalone SSCC Barcode (1D GS1-128, 2D QR, or Both).
 * @param {string} sscc - 17, 18, or 20-digit SSCC
 * @param {'gs1-128'|'qr'|'both'} type - Barcode symbology to return
 * @param {'svg'|'json'|'zpl'} format - Output format
 */
async function generateSSCCBarcodeViaCloud(sscc, type = 'both', format = 'svg') {
    const url = `${LABELS_API_BASE_URL}/v1/barcode?sscc=${encodeURIComponent(sscc)}&type=${encodeURIComponent(type)}&format=${encodeURIComponent(format)}`;
    const res = await fetch(url);
    return format === 'json' ? await res.json() : await res.text();
}

// Redirect self-hosted / cloned label studio interactions to the official hosted studio at ssccapi.com/
function redirectToHostedLabelStudio(sscc = '') {
    const target = sscc
        ? `https://ssccapi.com/?sscc=${encodeURIComponent(sscc)}&label=1`
        : 'https://ssccapi.com/#labels';
    window.location.href = target;
}

function initLabelGeneratorStudio() {
    const preview = document.getElementById('lbl-preview-box');
    if (preview) {
        preview.innerHTML = `<div style="padding:20px;text-align:center;background:#080a0f;border:1px solid #222c3d;border-radius:10px;font-family:monospace;">
            <p style="color:#f59e0b;font-weight:700;margin-bottom:8px;">⚡ SSCC Pro Vision — Cloud Label &amp; ZPL Studio</p>
            <p style="color:#94a3b8;font-size:12px;margin-bottom:14px;">The commercial GS1-128, 2D QR Digital Link &amp; Zebra ZPL-II engine runs on the official hosted studio and Cloudflare Edge API.</p>
            <a href="https://ssccapi.com/#labels" style="display:inline-block;background:#f59e0b;color:#0b0e14;padding:8px 16px;border-radius:6px;font-weight:700;text-decoration:none;font-size:12px;">Open Official Label Studio (ssccapi.com) →</a>
        </div>`;
    }
}

function openGS1LabelModal(s18) { redirectToHostedLabelStudio(s18); }
function openBatchGS1LabelModal() { redirectToHostedLabelStudio(); }
function printGS1Label() { redirectToHostedLabelStudio(); }
function downloadGS1ZPL() { redirectToHostedLabelStudio(); }
function downloadGS1SVG() { redirectToHostedLabelStudio(); }
function downloadGS1PNG() { redirectToHostedLabelStudio(); }
function setLabelSymbology() { redirectToHostedLabelStudio(); }
function setLabelLayoutMode() { redirectToHostedLabelStudio(); }
function setLabelSourceMode() { redirectToHostedLabelStudio(); }
function regenerateBatchSequence() {}
function updateLabelPreview() {}
function syncBatchStudioCount() {}
function openProUpgradeModal() { window.location.href = 'https://ssccapi.com/sscc-api-guide.html#quotas-pricing'; }
function closeProUpgradeModal() {}
function applyRetailerComplianceProfile() { redirectToHostedLabelStudio(); }
function updateRetailerComplianceBanner() {}
function inspectCurrentOrCustomZPL() { redirectToHostedLabelStudio(); }
function copyInspectedZPL() {}
function downloadStudioEDIFACT() { redirectToHostedLabelStudio(); }
function downloadStudioSAPIDoc() { redirectToHostedLabelStudio(); }
function contactForCustomFeatures() {
    const email = atob('cGVkcm8=') + '@' + atob('cG9ybWVub3Jlcy5uZXQ=');
    window.location.href = 'mailto:' + email + '?subject=' + encodeURIComponent('SSCC Pro Vision — Custom Features / ERP Integration');
}
