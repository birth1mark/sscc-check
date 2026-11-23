/**
 * SSCC Pro Vision — GS1 Logistics Pallet Label & Multi-AI Barcode Engine (v5.8.0)
 *
 * Implements:
 * 1. Pure vector GS1-128 (Code 128 Subset C + Subset B with FNC1) SVG generator.
 * 2. Primary lower barcode: AI (00) SSCC-18 with dynamic GS1 Company Prefix (GCP) HRI spacing.
 * 3. Optional secondary upper barcode: AI (02) Content GTIN-14 + AI (15) Best Before YYMMDD + AI (37) Count + AI (10) Batch/Lot.
 * 4. GS1 Logistics Pallet Label layouts (A5 standard, A6 compact, 4x6" Zebra thermal).
 * 5. Single and Batch ZPL-II (Zebra Programming Language) export for industrial printers.
 */

// Code 128 Patterns (Codes 0 to 106)
const C128_PATTERNS = [
    '212222', '222122', '222221', '121223', '121322', '131222', '122213', '122312', '132212', '221213',
    '221312', '231212', '112232', '122132', '122231', '113222', '123122', '123221', '223211', '221132',
    '221231', '213212', '223112', '312131', '311222', '321122', '321221', '312212', '322112', '322211',
    '212123', '212321', '232121', '111323', '131123', '131321', '112313', '132113', '132311', '211313',
    '231113', '231311', '112133', '112331', '132131', '113123', '113321', '133121', '313121', '211331',
    '231131', '213113', '213311', '213131', '311123', '311321', '331121', '312113', '312311', '332111',
    '314111', '221411', '431111', '111224', '111422', '121124', '121421', '141122', '141221', '112214',
    '112412', '122114', '122411', '142112', '142211', '241211', '221114', '413111', '241112', '134111',
    '111242', '121142', '121241', '114212', '124112', '124211', '411212', '421112', '421211', '212141',
    '214121', '412121', '111143', '111341', '131141', '114113', '114311', '411113', '411311', '113141',
    '114131', '311141', '411131', '211412', '211214', '211232', '2331112'
];

const LABEL_DEFAULTS_KEY = 'sscc_label_defaults_v56';

function getLabelDefaults() {
    try {
        const stored = localStorage.getItem(LABEL_DEFAULTS_KEY);
        if (stored) return JSON.parse(stored);
    } catch (e) {}
    return {
        sender: 'LOGISTICS DISPATCH SERVICES LTD',
        recipient: 'CENTRAL DISTRIBUTION HUB',
        contents: 'EURO PALLET (MIXED CARGO)',
        weight: '450 KG',
        orderNo: 'PO-2026-994',
        gtin: '',
        unitCount: '',
        batchNo: '',
        expiryDate: '',
        format: 'a5'
    };
}

function saveLabelDefaults(data) {
    try {
        localStorage.setItem(LABEL_DEFAULTS_KEY, JSON.stringify(data));
    } catch (e) {}
}

/**
 * Renders an array of Code 128 symbol values (excluding start/checksum/stop) into an SVG barcode.
 */
function renderCode128ValuesToSVG(startCode, values, height = 70) {
    let checksum = startCode;
    for (let idx = 0; idx < values.length; idx++) {
        checksum += values[idx] * (idx + 1);
    }
    checksum = checksum % 103;

    const allCodes = [startCode, ...values, checksum, 106];
    const quietZone = 12;
    let x = quietZone;
    const rects = [];

    for (const code of allCodes) {
        const pattern = C128_PATTERNS[code];
        let isBar = true;
        for (let j = 0; j < pattern.length; j++) {
            const width = parseInt(pattern[j], 10);
            if (isBar) {
                rects.push(`<rect x="${x}" y="0" width="${width}" height="${height}" fill="#000000"/>`);
            }
            x += width;
            isBar = !isBar;
        }
    }

    const totalWidth = x + quietZone;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalWidth} ${height}" preserveAspectRatio="none" style="width:100%;height:${height}px;display:block;">${rects.join('')}</svg>`;
}

/**
 * Generates an optimized, standard GS1-128 SVG barcode for an SSCC.
 * Encodes AI (00) followed by 18 SSCC digits using Code 128 Subset C + FNC1.
 */
function generateGS1BarcodeSVG(sscc18, height = 75) {
    const clean = sscc18.replace(/\D/g, '');
    let s18 = clean;
    if (clean.length === 20 && clean.startsWith('00')) s18 = clean.substring(2);
    s18 = s18.padStart(18, '0');

    const fullDigits = '00' + s18;
    const values = [102]; // FNC1 designates GS1 standard

    for (let i = 0; i < 20; i += 2) {
        values.push(parseInt(fullDigits.substring(i, i + 2), 10));
    }

    return renderCode128ValuesToSVG(105, values, height);
}

/**
 * Normalizes an expiry date string (e.g. '2026-12-31' or '261231') into 6-digit YYMMDD for GS1 AI (15).
 */
function normalizeExpiryToYYMMDD(rawExpiry) {
    const clean = String(rawExpiry || '').trim();
    if (!clean) return '';
    // YYYY-MM-DD
    const iso = clean.match(/^(\d{4})[-/](\d{2})[-/](\d{2})$/);
    if (iso) return iso[1].slice(2) + iso[2] + iso[3];
    const digits = clean.replace(/\D/g, '');
    if (digits.length === 8) return digits.slice(2); // YYYYMMDD -> YYMMDD
    if (digits.length === 6) return digits;          // YYMMDD
    return '';
}

/**
 * Normalizes a GTIN (8, 12, 13, or 14 digits) into a 14-digit GTIN-14 for GS1 AI (02).
 */
function normalizeToGTIN14(rawGtin) {
    const digits = String(rawGtin || '').replace(/\D/g, '');
    if (!digits) return '';
    if (digits.length === 14) return digits;
    if (digits.length === 13 || digits.length === 12 || digits.length === 8) {
        return digits.padStart(14, '0');
    }
    return '';
}

/**
 * Builds the optional Secondary Upper GS1-128 Barcode for homogeneous pallet trade items:
 * Supports fixed-length AIs: (02) GTIN-14, (15) Best Before YYMMDD
 * And variable-length AIs: (37) Unit Count, (10) Batch / Lot Number
 */
function buildSecondaryGS1Barcode(meta, height = 54) {
    const gtin14    = normalizeToGTIN14(meta.gtin);
    const yymmdd    = normalizeExpiryToYYMMDD(meta.expiryDate);
    const countStr  = String(meta.unitCount || '').replace(/\D/g, '').slice(0, 8);
    const batchClean = String(meta.batchNo || '').trim().toUpperCase().replace(/[^\x21-\x5F]/g, '').slice(0, 20);

    if (!gtin14 && !yymmdd && !countStr && !batchClean) {
        return null;
    }

    const hriParts = [];
    let fixedNumericPrefix = '';

    // 1. Fixed-length numeric AIs first (no FNC1 separator required after fixed-length AIs 02 and 15)
    if (gtin14) {
        fixedNumericPrefix += '02' + gtin14;
        hriParts.push(`(02) ${gtin14}`);
    }
    if (yymmdd) {
        fixedNumericPrefix += '15' + yymmdd;
        hriParts.push(`(15) ${yymmdd}`);
    }

    // 2. Variable-length AIs: (37) Count, then (10) Batch/Lot
    // If only numeric data and even length, use Subset C; otherwise switch cleanly to Subset B
    const values = [102]; // Leading FNC1
    let currentSubset = 'C';

    // Encode fixedNumericPrefix in Subset C (guaranteed even length: 16 and/or 8 digits)
    for (let i = 0; i < fixedNumericPrefix.length; i += 2) {
        values.push(parseInt(fixedNumericPrefix.substring(i, i + 2), 10));
    }

    let zplData = '>8' + fixedNumericPrefix;

    if (countStr) {
        hriParts.push(`(37) ${countStr}`);
        const ai37Full = '37' + countStr;
        if (ai37Full.length % 2 === 0 && currentSubset === 'C') {
            for (let i = 0; i < ai37Full.length; i += 2) {
                values.push(parseInt(ai37Full.substring(i, i + 2), 10));
            }
        } else {
            if (currentSubset === 'C') {
                values.push(100); // Switch C -> B
                currentSubset = 'B';
            }
            for (const ch of ai37Full) {
                values.push(ch.charCodeAt(0) - 32);
            }
        }
        zplData += ai37Full;
        // If batch follows variable-length AI (37), insert FNC1 group separator
        if (batchClean) {
            values.push(102); // FNC1
            zplData += '>8';
        }
    }

    if (batchClean) {
        hriParts.push(`(10) ${batchClean}`);
        const ai10Full = '10' + batchClean;
        if (/^\d+$/.test(ai10Full) && ai10Full.length % 2 === 0 && currentSubset === 'C') {
            for (let i = 0; i < ai10Full.length; i += 2) {
                values.push(parseInt(ai10Full.substring(i, i + 2), 10));
            }
        } else {
            if (currentSubset === 'C') {
                values.push(100); // Switch C -> B
                currentSubset = 'B';
            }
            for (const ch of ai10Full) {
                values.push(ch.charCodeAt(0) - 32);
            }
        }
        zplData += (currentSubset === 'B' ? '>6' : '') + ai10Full;
    }

    return {
        hri: hriParts.join('  '),
        svg: renderCode128ValuesToSVG(105, values, height),
        zplData
    };
}

/**
 * Formats the 18-digit SSCC HRI using the active GS1 Company Prefix length (6 to 11 digits).
 */
function formatDynamicSSCCHRI(s18) {
    const gcpEl = document.getElementById('batch-gcp');
    const s = typeof getGCPSettings === 'function' ? getGCPSettings() : null;
    const rawGcp = (gcpEl && gcpEl.value ? gcpEl.value : (s && s.prefix ? s.prefix : '5601234')).replace(/\D/g, '');
    const gcpLen = (rawGcp.length >= 6 && rawGcp.length <= 11) ? rawGcp.length : 7;

    const ext    = s18[0];
    const prefix = s18.substring(1, 1 + gcpLen);
    const serial = s18.substring(1 + gcpLen, 17);
    const cd     = s18[17];
    return `(00) ${ext} ${prefix} ${serial} ${cd}`;
}

/**
 * Generates industrial Zebra ZPL-II code for a single 4x6" thermal pallet label.
 */
function generateGS1ZPL(sscc18, meta, indexInfo = '') {
    const clean = sscc18.replace(/\D/g, '');
    const s18 = (clean.length === 20 && clean.startsWith('00') ? clean.substring(2) : clean).padStart(18, '0');
    const hri = formatDynamicSSCCHRI(s18);

    const sender = (meta.sender || 'LOGISTICS DISPATCH SERVICES LTD').toUpperCase().replace(/[\^~]/g, '');
    const recipient = (meta.recipient || 'CENTRAL DISTRIBUTION HUB').toUpperCase().replace(/[\^~]/g, '');
    const contents = (meta.contents || 'EURO PALLET').toUpperCase().replace(/[\^~]/g, '');
    const weight = (meta.weight || '').toUpperCase().replace(/[\^~]/g, '');
    const orderNo = (meta.orderNo || '').toUpperCase().replace(/[\^~]/g, '');
    const batchNo = (meta.batchNo || '').toUpperCase().replace(/[\^~]/g, '');
    const expiry = (meta.expiryDate || '').toUpperCase().replace(/[\^~]/g, '');
    const today = new Date().toISOString().slice(0, 10);

    let extraInfo = '';
    if (batchNo) extraInfo += `BATCH: ${batchNo}  `;
    if (expiry) extraInfo += `EXP: ${expiry}  `;
    if (weight) extraInfo += `WEIGHT: ${weight}`;

    const palletTagZPL = indexInfo ? `^FO520,65^A0N,24,24^FD${indexInfo.toUpperCase()}^FS` : '';
    const secondary = buildSecondaryGS1Barcode(meta, 50);

    if (secondary) {
        return `^XA
^PW812
^LL1218
^FO40,40^GB732,1138,4^FS
^FO60,62^A0N,22,22^FDCONSIGNOR / FROM:^FS
${palletTagZPL}
^FO60,90^A0N,26,26^FD${sender}^FS
^FO40,155^GB732,0,2^FS
^FO60,172^A0N,22,22^FDCONSIGNEE / TO:^FS
^FO60,200^A0N,26,26^FD${recipient}^FS
^FO40,265^GB732,0,2^FS
^FO60,282^A0N,22,22^FDCONTENTS: ${contents}^FS
^FO60,312^A0N,20,20^FD${extraInfo || `DOC REF: ${orderNo}`}^FS
^FO60,342^A0N,19,19^FDDATE: ${today}   |   DOC: ${orderNo}^FS
^FO40,375^GB732,0,2^FS
^FO60,395^A0N,22,22^FD${secondary.hri}^FS
^FO65,428^BY2,3,130^BCN,130,N,N,N,A^FD${secondary.zplData}^FS
^FO40,585^GB732,0,4^FS
^FO60,610^A0N,28,28^FDSSCC (SERIAL SHIPPING CONTAINER CODE):^FS
^FO60,650^A0N,36,36^FD${hri}^FS
^FO65,705^BY3,3,200^BCN,200,N,N,N,D^FD>8>500${s18}^FS
^XZ`;
    }

    return `^XA
^PW812
^LL1218
^FO40,40^GB732,1138,4^FS
^FO60,65^A0N,24,24^FDCONSIGNOR / FROM:^FS
${palletTagZPL}
^FO60,98^A0N,28,28^FD${sender}^FS
^FO40,175^GB732,0,2^FS
^FO60,195^A0N,24,24^FDCONSIGNEE / TO:^FS
^FO60,228^A0N,28,28^FD${recipient}^FS
^FO40,305^GB732,0,2^FS
^FO60,325^A0N,22,22^FDCONTENTS: ${contents}^FS
^FO60,358^A0N,22,22^FD${extraInfo || `DOC REF: ${orderNo}`}^FS
^FO60,390^A0N,20,20^FDDATE: ${today}   |   DOC: ${orderNo}^FS
^FO40,430^GB732,0,4^FS
^FO60,460^A0N,30,30^FDSSCC (SERIAL SHIPPING CONTAINER CODE):^FS
^FO60,505^A0N,38,38^FD${hri}^FS
^FO65,570^BY3,3,210^BCN,210,N,N,N,D^FD>8>500${s18}^FS
^XZ`;
}

// Studio State
let labelStudioInitialized = false;
let labelSourceMode = 'sequential'; // 'sequential' | 'audited'
let currentLabelSSCC = '';
let currentBatchSSCCs = [];
let currentBatchIndex = 0;

function normalizeTo18Digits(rawSSCC) {
    const clean = String(rawSSCC || '').replace(/\D/g, '');
    if (clean.length === 20 && clean.startsWith('00')) return clean.substring(2);
    if (clean.length === 17 && typeof getCD === 'function') return clean + getCD(clean);
    if (clean.length === 18) return clean;
    return null;
}

function initLabelStudioIfNeeded() {
    if (labelStudioInitialized && currentBatchSSCCs.length > 0) {
        updateWorkspaceBadges();
        return;
    }
    labelStudioInitialized = true;
    loadStoredFormDefaults();

    const s = typeof getGCPSettings === 'function' ? getGCPSettings() : null;
    const gcp = (s && s.prefix) ? s.prefix : '5601234';
    const ext = (s && s.extDigit) ? s.extDigit : '0';
    const startSerial = (s && s.lastSerial) ? (parseInt(s.lastSerial, 10) + 1) : 1001;

    const gcpInput = document.getElementById('batch-gcp');
    const extSelect = document.getElementById('batch-ext');
    const startInput = document.getElementById('batch-start-serial');
    const qtyInput = document.getElementById('batch-qty');

    if (gcpInput) gcpInput.value = gcp;
    if (extSelect) extSelect.value = ext;
    if (startInput) startInput.value = startSerial;
    if (qtyInput) qtyInput.value = 1;

    setLabelSourceMode('sequential');
}

function setLabelSourceMode(mode, customAuditedCodes = null) {
    const btnSeq = document.getElementById('src-btn-seq');
    const btnAud = document.getElementById('src-btn-audited');
    const seqCard = document.getElementById('seq-generator-card');
    const audCard = document.getElementById('audited-source-card');
    const audText = document.getElementById('audited-batch-summary-text');

    if (mode === 'audited') {
        const codes = customAuditedCodes || (window.store || [])
            .filter(item => (item.status === 'valid' || item.status === 'gen') && item.plain)
            .map(item => normalizeTo18Digits(item.plain))
            .filter(Boolean);

        if (!codes.length) {
            if (typeof showToast === 'function') {
                showToast('No validated SSCCs in Validator yet. Using Sequential Generator.', 'warn');
            }
            mode = 'sequential';
        } else {
            labelSourceMode = 'audited';
            currentBatchSSCCs = codes;
            currentBatchIndex = 0;
            currentLabelSSCC = codes[0];

            if (btnSeq) btnSeq.classList.remove('active');
            if (btnAud) btnAud.classList.add('active');
            if (seqCard) seqCard.style.display = 'none';
            if (audCard) audCard.style.display = 'flex';
            if (audText) {
                audText.textContent = codes.length === 1
                    ? `Printing 1 validated SSCC: (00) ${codes[0]}`
                    : `Printing batch of ${codes.length} validated SSCC codes from Validator`;
            }

            updateLabelPreview();
            return;
        }
    }

    labelSourceMode = 'sequential';
    if (btnSeq) btnSeq.classList.add('active');
    if (btnAud) btnAud.classList.remove('active');
    if (seqCard) seqCard.style.display = 'block';
    if (audCard) audCard.style.display = 'none';

    regenerateBatchSequence();
}

function openCurrentOrSampleLabel() {
    initLabelStudioIfNeeded();
    setLabelSourceMode('sequential');
    if (typeof switchWorkspaceTab === 'function') {
        switchWorkspaceTab('labels');
    }
}

function openLabelModal(rawSSCC) {
    const s18 = normalizeTo18Digits(rawSSCC);
    if (!s18) {
        alert('Invalid SSCC code for label generation (requires 18 digits).');
        return;
    }

    initLabelStudioIfNeeded();
    if (typeof switchWorkspaceTab === 'function') {
        switchWorkspaceTab('labels');
    }
    setLabelSourceMode('audited', [s18]);
}

function openBatchLabelsModal() {
    const valids = (window.store || [])
        .filter(item => (item.status === 'valid' || item.status === 'gen') && item.plain)
        .map(item => normalizeTo18Digits(item.plain))
        .filter(Boolean);

    if (!valids.length) {
        if (typeof showToast === 'function') {
            showToast('No valid SSCC codes found to print.', 'warn');
        }
        return;
    }

    initLabelStudioIfNeeded();
    if (typeof switchWorkspaceTab === 'function') {
        switchWorkspaceTab('labels');
    }
    setLabelSourceMode('audited', valids);
}

function sendGeneratedBatchToValidator() {
    if (!currentBatchSSCCs.length) return;
    const input = document.getElementById('input');
    if (input) {
        input.value = currentBatchSSCCs.join('\n');
    }
    if (typeof process === 'function') process(true);
    if (typeof switchWorkspaceTab === 'function') switchWorkspaceTab('validate');
    if (typeof showToast === 'function') {
        showToast(`Loaded ${currentBatchSSCCs.length} generated SSCC(s) into Validator.`);
    }
}

function regenerateBatchSequence() {
    const gcpInput = document.getElementById('batch-gcp');
    const extSelect = document.getElementById('batch-ext');
    const startInput = document.getElementById('batch-start-serial');
    const qtyInput = document.getElementById('batch-qty');
    const summaryRange = document.getElementById('batch-range-text');
    const summaryTag = document.getElementById('batch-total-tag');

    if (!gcpInput || !startInput || !qtyInput) return;

    const gcp = gcpInput.value.replace(/\D/g, '') || '5601234';
    const ext = extSelect ? extSelect.value.replace(/\D/g, '') || '0' : '0';
    let start = parseInt(startInput.value, 10);
    if (isNaN(start) || start < 1) start = 1;
    let qty = parseInt(qtyInput.value, 10);
    if (isNaN(qty) || qty < 1) qty = 1;
    if (qty > 500) qty = 500;

    const serialLen = 17 - 1 - gcp.length;
    if (serialLen <= 0) {
        if (typeof showToast === 'function') {
            showToast('GS1 Company Prefix is too long (max 11 digits).', 'warn');
        }
        return;
    }

    if (typeof saveGCPSettings === 'function') {
        saveGCPSettings({
            prefix: gcp,
            extDigit: ext,
            lastSerial: Math.max(0, start - 1)
        });
    }

    const batch = [];
    for (let i = 0; i < qty; i++) {
        const curSerialNum = start + i;
        const serialStr = String(curSerialNum).padStart(serialLen, '0');
        const body17 = `${ext}${gcp}${serialStr}`;
        const cd = typeof getCD === 'function' ? getCD(body17) : '0';
        batch.push(body17 + cd);
    }

    currentBatchSSCCs = batch;
    if (currentBatchIndex >= currentBatchSSCCs.length) {
        currentBatchIndex = 0;
    }
    currentLabelSSCC = currentBatchSSCCs[currentBatchIndex];

    if (summaryRange && summaryTag) {
        if (batch.length === 1) {
            summaryRange.textContent = `(00) ${batch[0]}`;
            summaryTag.textContent = '1 Pallet';
        } else {
            const first = batch[0];
            const last = batch[batch.length - 1];
            summaryRange.innerHTML = `<span>(00) …${first.slice(-7)}</span> &nbsp;→&nbsp; <span>(00) …${last.slice(-7)}</span>`;
            summaryTag.textContent = `${batch.length} Pallets`;
        }
    }

    document.querySelectorAll('.btn-preset').forEach(btn => {
        const q = parseInt(btn.getAttribute('data-qty'), 10);
        if (q === qty) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    updateLabelPreview();
}

function setBatchQty(n) {
    const qtyInput = document.getElementById('batch-qty');
    if (qtyInput) {
        qtyInput.value = n;
        regenerateBatchSequence();
    }
}

function adjustBatchQty(delta) {
    const qtyInput = document.getElementById('batch-qty');
    if (!qtyInput) return;
    let val = parseInt(qtyInput.value, 10) || 1;
    val = Math.max(1, Math.min(500, val + delta));
    qtyInput.value = val;
    regenerateBatchSequence();
}

function adjustBatchStartSerial(delta) {
    const serialInput = document.getElementById('batch-start-serial');
    if (!serialInput) return;
    let val = parseInt(serialInput.value, 10) || 1;
    val = Math.max(1, val + delta);
    serialInput.value = val;
    regenerateBatchSequence();
}

function updateStoredLastSerialOnDispatch() {
    if (labelSourceMode !== 'sequential') return;

    const startInput = document.getElementById('batch-start-serial');
    const qtyInput = document.getElementById('batch-qty');
    const gcpInput = document.getElementById('batch-gcp');
    const extSelect = document.getElementById('batch-ext');

    if (!startInput || !qtyInput) return;

    const start = parseInt(startInput.value, 10);
    const qty = parseInt(qtyInput.value, 10);
    const gcp = gcpInput ? gcpInput.value.replace(/\D/g, '') : '';
    const ext = extSelect ? extSelect.value : '0';

    if (start && qty && typeof saveGCPSettings === 'function') {
        const lastUsed = start + qty - 1;
        saveGCPSettings({
            prefix: gcp,
            extDigit: ext,
            lastSerial: lastUsed
        });
        startInput.value = lastUsed + 1;
        if (typeof showToast === 'function') {
            showToast(`Dispatched ${qty} pallet(s). Next serial advanced to ${lastUsed + 1}.`);
        }
    }
}

function prevBatchLabel() {
    if (currentBatchIndex > 0) {
        currentBatchIndex--;
        currentLabelSSCC = currentBatchSSCCs[currentBatchIndex];
        updateLabelPreview();
    }
}

function nextBatchLabel() {
    if (currentBatchIndex < currentBatchSSCCs.length - 1) {
        currentBatchIndex++;
        currentLabelSSCC = currentBatchSSCCs[currentBatchIndex];
        updateLabelPreview();
    }
}

function loadStoredFormDefaults() {
    const d = getLabelDefaults();
    if (document.getElementById('lbl-sender')) document.getElementById('lbl-sender').value = d.sender || '';
    if (document.getElementById('lbl-recipient')) document.getElementById('lbl-recipient').value = d.recipient || '';
    if (document.getElementById('lbl-contents')) document.getElementById('lbl-contents').value = d.contents || '';
    if (document.getElementById('lbl-weight')) document.getElementById('lbl-weight').value = d.weight || '';
    if (document.getElementById('lbl-order')) document.getElementById('lbl-order').value = d.orderNo || '';
    if (document.getElementById('lbl-gtin')) document.getElementById('lbl-gtin').value = d.gtin || '';
    if (document.getElementById('lbl-count')) document.getElementById('lbl-count').value = d.unitCount || '';
    if (document.getElementById('lbl-batch')) document.getElementById('lbl-batch').value = d.batchNo || '';
    if (document.getElementById('lbl-expiry')) document.getElementById('lbl-expiry').value = d.expiryDate || '';
    if (document.getElementById('lbl-format')) document.getElementById('lbl-format').value = d.format || 'a5';
}

function persistCurrentFormValues() {
    const data = {
        sender: document.getElementById('lbl-sender')?.value || '',
        recipient: document.getElementById('lbl-recipient')?.value || '',
        contents: document.getElementById('lbl-contents')?.value || '',
        weight: document.getElementById('lbl-weight')?.value || '',
        orderNo: document.getElementById('lbl-order')?.value || '',
        gtin: document.getElementById('lbl-gtin')?.value || '',
        unitCount: document.getElementById('lbl-count')?.value || '',
        batchNo: document.getElementById('lbl-batch')?.value || '',
        expiryDate: document.getElementById('lbl-expiry')?.value || '',
        format: document.getElementById('lbl-format')?.value || 'a5'
    };
    saveLabelDefaults(data);
    return data;
}

/**
 * Builds HTML markup for a single GS1 physical pallet label sheet.
 */
function buildLabelSheetHTML(s18, meta, indexInfo = '') {
    const sender = meta.sender || 'LOGISTICS DISPATCH SERVICES LTD';
    const recipient = meta.recipient || 'CENTRAL DISTRIBUTION HUB';
    const contents = meta.contents || 'EURO PALLET (MIXED CARGO)';
    const weight = meta.weight || '450 KG';
    const orderNo = meta.orderNo || 'PO-2026-994';
    const batchNo = meta.batchNo || '';
    const expiry = meta.expiryDate || '';
    const unitCount = meta.unitCount || '';
    const today = new Date().toISOString().slice(0, 10);

    const hriFormatted = formatDynamicSSCCHRI(s18);
    const barcodeSvg = generateGS1BarcodeSVG(s18, 70);
    const secondary = buildSecondaryGS1Barcode(meta, 52);

    const secondarySectionHtml = secondary ? `
        <div class="lbl-row lbl-sscc-section" style="border-bottom:2px solid #000000;padding:8px 0 6px;">
            <span class="lbl-field-tag" style="text-align:left;margin-bottom:2px;">GS1-128 TRADE ITEM &amp; BATCH IDENTIFIERS</span>
            <div class="lbl-sscc-hri" style="font-size:12px;margin-bottom:5px;">${escapeHtml(secondary.hri)}</div>
            <div class="lbl-barcode-wrap">
                ${secondary.svg}
            </div>
        </div>` : '';

    return `
    <div class="gs1-label-sheet format-${meta.format || 'a5'}">
        <div class="lbl-row lbl-header-row">
            <div class="lbl-col lbl-sender-col">
                <span class="lbl-field-tag">CONSIGNOR / FROM</span>
                <div class="lbl-company">${escapeHtml(sender)}</div>
                <div class="lbl-subtext">Logistics Dispatch Center</div>
            </div>
            <div class="lbl-col lbl-carrier-col" style="text-align:right;">
                <span class="lbl-field-tag">DATE</span>
                <div class="lbl-meta-value">${today}</div>
                <span class="lbl-field-tag" style="margin-top:4px;">ORDER / DOC</span>
                <div class="lbl-meta-value">${escapeHtml(orderNo)}</div>
            </div>
        </div>

        <div class="lbl-row lbl-dest-row">
            <div class="lbl-col" style="width:100%;">
                <span class="lbl-field-tag">CONSIGNEE / TO</span>
                <div class="lbl-company">${escapeHtml(recipient)}</div>
                <div class="lbl-subtext">Central Distribution Hub</div>
            </div>
        </div>

        <div class="lbl-row lbl-cargo-row">
            <div class="lbl-col" style="width:55%;">
                <span class="lbl-field-tag">CARGO / CONTENTS</span>
                <div class="lbl-meta-value">${escapeHtml(contents)}${unitCount ? ` (${escapeHtml(unitCount)} units)` : ''}</div>
            </div>
            <div class="lbl-col" style="width:45%; text-align:right;">
                <span class="lbl-field-tag">GROSS WEIGHT / BATCH</span>
                <div class="lbl-meta-value">${escapeHtml(weight)}${batchNo ? ' | Lot: ' + escapeHtml(batchNo) : ''}</div>
                ${expiry ? `<div class="lbl-subtext" style="font-weight:700;color:#000;">Best Before: ${escapeHtml(expiry)}</div>` : ''}
            </div>
        </div>

        ${secondarySectionHtml}

        <div class="lbl-row lbl-sscc-section">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
                <span class="lbl-sscc-title">SSCC (SERIAL SHIPPING CONTAINER CODE)</span>
                ${indexInfo ? `<span class="lbl-pallet-tag">${indexInfo.toUpperCase()}</span>` : ''}
            </div>
            <div class="lbl-sscc-hri">${hriFormatted}</div>
            <div class="lbl-barcode-wrap">
                ${barcodeSvg}
            </div>
        </div>
    </div>`;
}

/**
 * Updates live label preview in the Tab 2 Studio.
 */
function updateLabelPreview() {
    if (!currentLabelSSCC) return;

    const meta = persistCurrentFormValues();
    const isBatch = currentBatchSSCCs.length > 1;
    const indexInfo = isBatch ? `Pallet ${currentBatchIndex + 1} of ${currentBatchSSCCs.length}` : '';

    const previewContainer = document.getElementById('lbl-preview-box');
    if (previewContainer) {
        previewContainer.innerHTML = buildLabelSheetHTML(currentLabelSSCC, meta, indexInfo);
    }

    const batchNav = document.getElementById('lbl-batch-nav');
    if (batchNav) {
        if (isBatch) {
            batchNav.style.display = 'flex';
            const counter = document.getElementById('lbl-batch-counter');
            if (counter) counter.textContent = `Pallet ${currentBatchIndex + 1} of ${currentBatchSSCCs.length}`;
            const btnPrev = document.getElementById('lbl-btn-prev');
            const btnNext = document.getElementById('lbl-btn-next');
            if (btnPrev) btnPrev.disabled = (currentBatchIndex === 0);
            if (btnNext) btnNext.disabled = (currentBatchIndex === currentBatchSSCCs.length - 1);
        } else {
            batchNav.style.display = 'none';
        }
    }

    const printBtnText = document.getElementById('lbl-print-btn-text');
    if (printBtnText) {
        printBtnText.textContent = isBatch ? `PRINT ALL (${currentBatchSSCCs.length} PALLETS)` : `PRINT LABEL (A5 / 4×6")`;
    }

    const zplBtnText = document.getElementById('lbl-zpl-btn-text');
    if (zplBtnText) {
        zplBtnText.textContent = isBatch ? `DOWNLOAD ZPL (${currentBatchSSCCs.length})` : `DOWNLOAD ZPL`;
    }
}

function printGS1Label() {
    const meta = persistCurrentFormValues();
    const isBatch = currentBatchSSCCs.length > 1;

    let printArea = document.getElementById('print-batch-container');
    if (!printArea) {
        printArea = document.createElement('div');
        printArea.id = 'print-batch-container';
        printArea.className = 'print-only-container';
        document.body.appendChild(printArea);
    }

    const targets = isBatch ? currentBatchSSCCs : [currentLabelSSCC];
    let allHtml = '';
    targets.forEach((sscc, idx) => {
        const info = isBatch ? `Pallet ${idx + 1} of ${targets.length}` : '';
        allHtml += buildLabelSheetHTML(sscc, meta, info);
    });

    printArea.innerHTML = allHtml;
    updateStoredLastSerialOnDispatch();
    window.print();
}

function downloadGS1ZPL() {
    if (!currentBatchSSCCs.length) return;
    const meta = persistCurrentFormValues();
    const isBatch = currentBatchSSCCs.length > 1;

    let zplOutput = '';
    currentBatchSSCCs.forEach((sscc, idx) => {
        const info = isBatch ? `Pallet ${idx + 1} of ${currentBatchSSCCs.length}` : '';
        zplOutput += generateGS1ZPL(sscc, meta, info) + '\n';
    });

    updateStoredLastSerialOnDispatch();

    const blob = new Blob([zplOutput], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = isBatch
        ? `gs1_pallet_labels_${currentBatchSSCCs.length}units.zpl`
        : `gs1_sscc_label_${currentLabelSSCC}.zpl`;
    a.click();
    URL.revokeObjectURL(url);
}
