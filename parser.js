// ─── File Parser (v5.8.0) ─────────────────────────────────────────────────────
// Extracts and validates SSCCs from uploaded files with duplicate detection.
// Supports: EDIFACT, IDoc SAP, XML, CSV, TXT (generic fallback)
// Everything runs client-side — no data leaves the browser.

function escapeHTML(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function detectFormat(text) {
    const t = text.trimStart();
    if (/^UNA|^UNB\+/.test(t))                          return 'edifact';
    if (/<\?xml|<ORDERS|<DESADV|<IDOC|<EDI_DC/i.test(t)) return 'xml';
    if (/^[A-Z]{3}\+/.test(t))                           return 'edifact';
    return 'generic';
}

function parseEDIFACT(text) {
    const found = [];

    let compSep  = ':';
    let elemSep  = '+';
    let segTerm  = "'";

    const unaMatch = text.match(/^UNA(.{6})/);
    if (unaMatch) {
        compSep = unaMatch[1][0];
        elemSep = unaMatch[1][1];
        segTerm = unaMatch[1][5];
    }

    const segments = text
        .replace(/\r?\n/g, '')
        .split(segTerm)
        .map(s => s.trim())
        .filter(Boolean);

    segments.forEach((seg, idx) => {
        const elements = seg.split(elemSep);
        const tag      = elements[0];

        if (tag === 'GIN') {
            const isBJ = elements[1] === 'BJ';
            const dataElements = isBJ ? elements.slice(2) : elements.slice(1);
            dataElements.forEach(el => {
                el.split(compSep).forEach(p => {
                    tryAddSSCC(p, isBJ ? `GIN+BJ (seg ${idx + 1})` : `GIN (seg ${idx + 1})`, found);
                });
            });
            if (elements[1] && elements[1].includes(compSep)) {
                const parts = elements[1].split(compSep);
                if (parts[0] === 'BJ' && parts[1]) {
                    tryAddSSCC(parts[1], `GIN+BJ (seg ${idx + 1})`, found);
                }
            }
        }

        if (tag === 'RFF') {
            elements.slice(1).forEach(el => {
                const parts = el.split(compSep);
                if (parts[0] === 'SI' && parts[1]) {
                    tryAddSSCC(parts[1], `RFF+SI (seg ${idx + 1})`, found);
                }
                if (parts[0] === 'AAK' && parts[1]) {
                    tryAddSSCC(parts[1], `RFF+AAK (seg ${idx + 1})`, found);
                }
            });
        }

        if (tag === 'PAC') {
            elements.slice(1).forEach(el => {
                const parts = el.split(compSep);
                parts.forEach(p => tryAddSSCC(p, `PAC (seg ${idx + 1})`, found));
            });
        }

        if (tag === 'BGM') {
            elements.slice(1).forEach(el => {
                tryAddSSCC(el.split(compSep)[0], `BGM (seg ${idx + 1})`, found);
            });
        }
    });

    return found;
}

function parseXML(text) {
    const found = [];

    const knownTags = [
        'EXIDV', 'EXIDV2', 'VHILM_KU',
        'SSCC', 'NVE', 'GIN', 'SERIAL_SHIP',
        'ShipmentContainerId', 'ContainerId',
        'PackageId', 'PalletId', 'HandlingUnitId',
    ];

    knownTags.forEach(tag => {
        const re = new RegExp(`<${tag}[^>]*>([^<]+)</${tag}>`, 'gi');
        let m;
        while ((m = re.exec(text)) !== null) {
            tryAddSSCC(m[1].trim(), `<${tag}>`, found);
        }
    });

    // If structured tags were found, avoid double-counting from raw text fallback
    if (found.length === 0) {
        const allContent = text.replace(/<[^>]+>/g, ' ');
        extractGeneric(allContent, 'XML content', found);
    }

    return found;
}

function parseGeneric(text) {
    const found = [];
    extractGeneric(text, 'File extract', found);
    return found;
}

function extractGeneric(text, source, found) {
    // Unified non-overlapping regex for (00)18-digits, 00+18-digits, or standalone 18-digits
    const reUnified = /(?:\(00\)(\d{18}))|(?<!\d)(?:(00\d{18})|(\d{18})(?!\d))/g;
    let m;
    while ((m = reUnified.exec(text)) !== null) {
        const token = m[1] || m[2] || m[3];
        if (token) tryAddSSCC(token, source, found);
    }
}

const VALID_GS1_RANGES = [
    [1,19],[30,39],[60,139],
    [200,299],
    [300,379],
    [380,380],[383,383],[385,385],[387,387],[389,390],
    [400,440],
    [450,459],[490,499],
    [460,469],[470,470],[471,471],[474,489],
    [500,509],
    [520,521],[528,531],[535,535],[539,539],
    [540,549],
    [560,560],[569,569],[570,579],
    [590,590],[594,594],[599,599],
    [600,601],[603,632],
    [640,649],
    [680,681],[690,699],
    [700,709],[729,729],[730,739],
    [740,746],[750,750],[754,755],[758,759],
    [760,769],[770,771],[773,773],[775,775],[777,777],[778,779],[780,780],[784,784],[786,786],[789,790],
    [800,839],
    [840,849],
    [850,850],[858,860],[865,865],[867,869],
    [870,879],[880,881],[883,883],[884,885],[888,888],[890,890],[893,894],[896,896],[899,899],
    [900,919],
    [930,939],[940,949],
    [950,952],[955,955],[958,958],
    [977,984],[990,999],
];

function isValidGS1Prefix(body18) {
    const prefix = parseInt(body18.substring(1, 4), 10);
    for (const [lo, hi] of VALID_GS1_RANGES) {
        if (prefix >= lo && prefix <= hi) return true;
    }
    return false;
}

function isTrivialSequence(digits) {
    if (/(\d)\1{9,}/.test(digits)) return true;
    if (/^(\d)\1+$/.test(digits)) return true;
    return false;
}

function tryAddSSCC(raw, source, found) {
    if (!raw) return;
    const digits = raw.replace(/\D/g, '');

    let body18;

    if (digits.length === 20 && digits.startsWith('00')) {
        body18 = digits.substring(2);
    } else if (digits.length === 18) {
        body18 = digits;
    } else if (digits.length === 17) {
        if (isTrivialSequence(digits)) return;
        const cd = getCD(digits);
        const full = digits + cd;
        if (!isValidGS1Prefix(full)) return;
        const existing = found.find(f => f.submittedPlain === full);
        if (existing) {
            existing.fileOccurrences = (existing.fileOccurrences || 1) + 1;
            existing.isDuplicate = true;
            existing.duplicateCount = existing.fileOccurrences;
            return;
        }
        found.push({
            code:            formatSSCC(digits, cd, null),
            label:           'GEN · +' + cd,
            status:          'gen',
            flag:            getFlag(full),
            plain:           full,
            submittedPlain:  full,
            source,
            fileOccurrences: 1,
            isDuplicate:     false,
            duplicateCount:  1,
            lineIdx:         found.length
        });
        return;
    } else {
        return;
    }

    if (isTrivialSequence(body18)) return;
    if (!isValidGS1Prefix(body18)) return;

    const body     = body18.substring(0, 17);
    const provided = parseInt(body18[17], 10);
    const expected = getCD(body);
    const ok       = provided === expected;

    const plain = body + expected;
    const submittedPlain = body18;

    const existing = found.find(f => f.submittedPlain === submittedPlain);
    if (existing) {
        existing.fileOccurrences = (existing.fileOccurrences || 1) + 1;
        existing.isDuplicate = true;
        existing.duplicateCount = existing.fileOccurrences;
        if (source && existing.source && !existing.source.includes(source)) {
            existing.source += `, ${source}`;
        }
        return;
    }

    found.push({
        code:            formatSSCC(body, expected, provided),
        label:           ok ? 'VALID' : `FAIL · exp ${expected}`,
        status:          ok ? 'valid' : 'invalid',
        flag:            getFlag(body18),
        plain,
        submittedPlain,
        body17:          body,
        expectedCD:      expected,
        providedCD:      provided,
        source,
        fileOccurrences: 1,
        isDuplicate:     false,
        duplicateCount:  1,
        lineIdx:         found.length
    });
}

function parseFile(text) {
    const fmt = detectFormat(text);

    let results;
    switch (fmt) {
        case 'edifact': results = parseEDIFACT(text); break;
        case 'xml':     results = parseXML(text);     break;
        default:        results = parseGeneric(text); break;
    }

    if (results.length === 0 && fmt !== 'generic') {
        results = parseGeneric(text);
    }

    return { format: fmt, results };
}

let fileUploadInitialized = false;

function initFileUpload() {
    if (fileUploadInitialized) return;
    fileUploadInitialized = true;

    const zone = document.getElementById('drop-zone');
    const input = document.getElementById('file-input');
    if (!zone || !input) return;

    zone.addEventListener('click', () => input.click());

    input.addEventListener('change', e => {
        if (e.target.files[0]) handleFile(e.target.files[0]);
        input.value = '';
    });

    zone.addEventListener('dragover', e => {
        e.preventDefault();
        zone.classList.add('drag-over');
    });
    zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
    zone.addEventListener('drop', e => {
        e.preventDefault();
        zone.classList.remove('drag-over');
        if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
    });
}

const BINARY_EXTENSIONS = new Set([
    'jpg','jpeg','png','gif','bmp','webp','ico','tiff','tif',
    'mp4','avi','mov','mkv','wmv','flv','webm',
    'mp3','wav','aac','ogg','flac','m4a',
    'doc','xls','ppt',
    'exe','dll','so','bin','dmg','apk','class',
    'zip','rar','7z','tar','gz','bz2',
    'pdf',
    'db','sqlite','mdb','accdb',
    'ttf','otf','woff','woff2',
]);

function handleFile(file) {
    const ext = file.name.split('.').pop().toLowerCase();
    const banner = document.getElementById('file-banner');
    const content = document.getElementById('file-banner-content');

    if (BINARY_EXTENSIONS.has(ext)) {
        if (banner && content) {
            content.innerHTML = `<span class="file-banner-name">📄 ${escapeHTML(file.name)}</span>
                <span class="file-banner-info" style="color:var(--danger)">Binary format not supported — use EDIFACT, XML, IDoc, CSV or TXT</span>`;
            banner.style.display = 'flex';
        }
        return;
    }

    const reader = new FileReader();
    reader.onload = e => {
        const text = e.target.result;
        const { format, results } = parseFile(text, file.name);

        if (!results.length) {
            showFileResult(file.name, format, []);
            return;
        }

        store = results;
        window.store = store;

        const inputEl = document.getElementById('input');
        if (inputEl) {
            const expandedLines = [];
            results.forEach(r => {
                const count = r.fileOccurrences || 1;
                const codeStr = r.submittedPlain || r.plain;
                if (codeStr) {
                    for (let k = 0; k < count; k++) expandedLines.push(codeStr);
                }
            });
            inputEl.value = expandedLines.join('\n');
        }
        const clearBtn = document.getElementById('btn-clear-input');
        if (clearBtn) clearBtn.style.display = 'inline-flex';

        showFileResult(file.name, format, results);
        render();

        if (typeof saveSessionToHistory === 'function' && inputEl) {
            saveSessionToHistory(inputEl.value, store);
        }
    };
    reader.readAsText(file, 'UTF-8');
}

function showFileResult(filename, format, results) {
    const banner = document.getElementById('file-banner');
    const content = document.getElementById('file-banner-content');
    if (!banner || !content) return;

    const fmtLabel = { edifact: 'EDIFACT', xml: 'XML / SAP IDoc', generic: 'CSV / Text' }[format] || format;
    const count    = results.length;

    if (!count) {
        content.innerHTML = `<span class="file-banner-name">📄 ${escapeHTML(filename)}</span>
            <span class="file-banner-info" style="color:var(--danger)">No valid GS1 SSCCs found (${escapeHTML(fmtLabel)})</span>`;
    } else {
        const valid   = results.filter(r => r.status === 'valid').length;
        const invalid = results.filter(r => r.status === 'invalid').length;
        const gen     = results.filter(r => r.status === 'gen').length;
        const dups    = results.filter(r => r.isDuplicate).length;
        content.innerHTML = `<span class="file-banner-name">📄 ${escapeHTML(filename)}</span>
            <span class="file-banner-info">${escapeHTML(fmtLabel)} · <strong>${count}</strong> unique SSCC${count !== 1 ? 's' : ''}
                ${valid   ? `· <span style="color:var(--success)">${valid} valid</span>`   : ''}
                ${invalid ? `· <span style="color:var(--danger)">${invalid} invalid</span>` : ''}
                ${gen     ? `· <span style="color:var(--primary)">${gen} generated</span>`  : ''}
                ${dups    ? `· <span style="color:var(--primary);font-weight:700;">⚠️ ${dups} duplicated</span>` : ''}
            </span>`;
    }

    banner.style.display = 'flex';
}

document.addEventListener('dragover', e => {
    const zone = document.getElementById('drop-zone');
    if (zone && zone.contains(e.target)) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'none';
});

document.addEventListener('drop', e => {
    const zone = document.getElementById('drop-zone');
    if (zone && zone.contains(e.target)) return;
    e.preventDefault();
    e.stopPropagation();
});

// ─── EDI & SAP IDoc Generators & Export Helpers ──────────────────────────────

/**
 * Downloads arbitrary text/blob data as a file in the browser.
 */
function downloadEDIFile(content, filename, mimeType = 'text/plain') {
    const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * Generates a standard UN/EDIFACT D.96A DESADV (Despatch Advice) message for WMS/EDI test pipelines.
 * @param {Array<string|Object>} ssccList - List of 18-digit SSCC codes or item objects.
 * @param {Object} options - Shipment metadata (orderNo, senderGln, recipientGln, gtin, count, batch, expiry, weight).
 * @returns {string} Fully compliant EDIFACT DESADV message.
 */
function generateEDIFACT_DESADV(ssccList, options = {}) {
    const list = Array.isArray(ssccList) ? ssccList : [ssccList];
    const now = new Date();
    const pad = n => String(n).padStart(2, '0');
    const dateYYMMDD = `${String(now.getFullYear()).slice(-2)}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
    const timeHHMM = `${pad(now.getHours())}${pad(now.getMinutes())}`;
    const dateYYYYMMDD = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;

    const orderNo = (options.orderNo || options.order || 'PO-2026-994').replace(/[^A-Za-z0-9_-]/g, '');
    const docRef = (options.docRef || 'DESADV-' + dateYYMMDD + '-' + Math.floor(Math.random() * 8999 + 1000));
    const senderGln = (options.senderGln || '5601234000019').replace(/\D/g, '').padEnd(13, '0').slice(0, 13);
    const recipientGln = (options.recipientGln || '5609876000018').replace(/\D/g, '').padEnd(13, '0').slice(0, 13);
    const senderName = (options.senderName || options.sender || 'LOGISTICS DISPATCH SERVICES LTD').slice(0, 35);
    const recipientName = (options.recipientName || options.recipient || 'CENTRAL DISTRIBUTION HUB').slice(0, 35);

    const segments = [];
    segments.push("UNA:+.? '");
    segments.push(`UNB+UNOC:3+${senderGln}:14+${recipientGln}:14+${dateYYMMDD}:${timeHHMM}+10001'`);
    segments.push(`UNH+1+DESADV:D:96A:UN:EAN005'`);
    segments.push(`BGM+351+${docRef}+9'`);
    segments.push(`DTM+137:${dateYYYYMMDD}:102'`);
    segments.push(`RFF+ON:${orderNo}'`);
    segments.push(`NAD+CZ+${recipientGln}::9++${recipientName}'`);
    segments.push(`NAD+SU+${senderGln}::9++${senderName}'`);

    let segCount = 7;
    let cpsIndex = 0;

    list.forEach((item, idx) => {
        const sscc = typeof item === 'string' ? item.replace(/\D/g, '') : (item.sscc || item.plain || '').replace(/\D/g, '');
        if (!sscc || sscc.length !== 18) return;

        cpsIndex++;
        segments.push(`CPS+${cpsIndex}'`);
        segments.push(`PAC+1++201::9'`);
        if (options.weight) {
            const wNum = parseFloat(String(options.weight).replace(/[^\d.]/g, '')) || 450;
            segments.push(`MEA+PD+G+KGM:${wNum}'`);
            segCount++;
        }
        segments.push(`PCI+33E'`);
        segments.push(`GIN+BJ+${sscc}'`);
        segCount += 4;

        const gtin = options.gtin ? options.gtin.replace(/\D/g, '') : (typeof item === 'object' && item.gtin ? item.gtin.replace(/\D/g, '') : '');
        const count = options.unitCount || options.count || (typeof item === 'object' && item.count ? item.count : '48');
        const batch = options.batchNo || options.batch || (typeof item === 'object' && item.batch ? item.batch : '');
        const expiry = options.expiryDate || options.expiry || (typeof item === 'object' && item.expiry ? item.expiry : '');

        if (gtin) {
            segments.push(`LIN+${idx + 1}++${gtin}:SRV'`);
            segments.push(`QTY+52:${count}:PCE'`);
            segCount += 2;
            if (expiry) {
                const expClean = expiry.replace(/\D/g, '');
                const expFmt = expClean.length === 6 ? `20${expClean}` : expClean.slice(0, 8);
                segments.push(`DTM+361:${expFmt}:102'`);
                segCount++;
            }
            if (batch) {
                segments.push(`PCI+17'`);
                segments.push(`GIN+BX+${batch.replace(/[^A-Za-z0-9_-]/g, '')}'`);
                segCount += 2;
            }
        }
    });

    segments.push(`CNT+2:${cpsIndex}'`);
    segCount += 2;
    segments.push(`UNT+${segCount}+1'`);
    segments.push(`UNZ+1+10001'`);

    return segments.join('\n');
}

/**
 * Generates a standard SAP IDoc DELVRY03 XML document with E1EDL20, E1EDL37 & E1EDL44 handling units.
 * @param {Array<string|Object>} ssccList - List of 18-digit SSCC codes or item objects.
 * @param {Object} options - Shipment metadata (orderNo, senderGln, recipientGln, gtin, count, batch, expiry, weight).
 * @returns {string} Fully compliant SAP IDoc DELVRY03 XML document.
 */
function generateSAP_IDoc_DELVRY03(ssccList, options = {}) {
    const list = Array.isArray(ssccList) ? ssccList : [ssccList];
    const now = new Date();
    const pad = n => String(n).padStart(2, '0');
    const dateYYYYMMDD = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
    const timeHHMMSS = `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;

    const orderNo = (options.orderNo || options.order || 'PO-2026-994').replace(/[^A-Za-z0-9_-]/g, '');
    const deliveryNo = '0080' + String(Math.floor(Math.random() * 899999 + 100000));
    const docNum = '000000000' + String(Math.floor(Math.random() * 8999999 + 1000000));
    const sender = (options.sender || 'LOGISTICS_WMS').replace(/[^A-Za-z0-9_-]/g, '').slice(0, 10) || 'WMS_NODE';
    const recipient = (options.recipient || 'RETAILER_HUB').replace(/[^A-Za-z0-9_-]/g, '').slice(0, 10) || 'EDI_HUB';
    const gtin = (options.gtin || '05601234567892').replace(/\D/g, '');
    const count = parseInt(options.unitCount || options.count || '48', 10) || 48;
    const batch = (options.batchNo || options.batch || 'LOT-2026').replace(/[^A-Za-z0-9_-]/g, '');
    const weightNum = parseFloat(String(options.weight || '450').replace(/[^\d.]/g, '')) || 450.0;

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<DELVRY03>\n`;
    xml += `  <IDOC BEGIN="1">\n`;
    xml += `    <EDI_DC40 SEGMENT="1">\n`;
    xml += `      <TABNAM>EDI_DC40</TABNAM>\n`;
    xml += `      <MANDT>100</MANDT>\n`;
    xml += `      <DOCNUM>${docNum}</DOCNUM>\n`;
    xml += `      <DOCREL>740</DOCREL>\n`;
    xml += `      <STATUS>30</STATUS>\n`;
    xml += `      <DIRECT>1</DIRECT>\n`;
    xml += `      <OUTMOD>2</OUTMOD>\n`;
    xml += `      <IDOCTYP>DELVRY03</IDOCTYP>\n`;
    xml += `      <MESTYP>DESADV</MESTYP>\n`;
    xml += `      <SNDPOR>SAPWMS</SNDPOR>\n`;
    xml += `      <SNDPRT>LS</SNDPRT>\n`;
    xml += `      <SNDPRN>${sender}</SNDPRN>\n`;
    xml += `      <RCVPOR>SAPEDI</RCVPOR>\n`;
    xml += `      <RCVPRT>LS</RCVPRT>\n`;
    xml += `      <RCVPRN>${recipient}</RCVPRN>\n`;
    xml += `      <CREDAT>${dateYYYYMMDD}</CREDAT>\n`;
    xml += `      <CRETIM>${timeHHMMSS}</CRETIM>\n`;
    xml += `    </EDI_DC40>\n`;
    xml += `    <E1EDL20 SEGMENT="1">\n`;
    xml += `      <VBELN>${deliveryNo}</VBELN>\n`;
    xml += `      <VKORG>1000</VKORG>\n`;
    xml += `      <LFDAT>${dateYYYYMMDD}</LFDAT>\n`;
    xml += `      <LFART>NL</LFART>\n`;
    xml += `      <BOLNR>${orderNo}</BOLNR>\n`;

    list.forEach((item, idx) => {
        const sscc = typeof item === 'string' ? item.replace(/\D/g, '') : (item.sscc || item.plain || '').replace(/\D/g, '');
        if (!sscc || sscc.length !== 18) return;

        const posNr = String((idx + 1) * 10).padStart(6, '0');
        xml += `      <E1EDL37 SEGMENT="1">\n`;
        xml += `        <EXIDV>${sscc}</EXIDV>\n`;
        xml += `        <VHILM>PALLET_EUR</VHILM>\n`;
        xml += `        <VHILM_KU>00</VHILM_KU>\n`;
        xml += `        <BRGEW>${weightNum.toFixed(3)}</BRGEW>\n`;
        xml += `        <GEWEI>KGM</GEWEI>\n`;
        xml += `        <E1EDL44 SEGMENT="1">\n`;
        xml += `          <VELIN>1</VELIN>\n`;
        xml += `          <VBELN>${deliveryNo}</VBELN>\n`;
        xml += `          <POSNR>${posNr}</POSNR>\n`;
        xml += `          <MATNR>${gtin}</MATNR>\n`;
        xml += `          <CHARG>${batch}</CHARG>\n`;
        xml += `          <VEMNG>${count.toFixed(3)}</VEMNG>\n`;
        xml += `          <VEMEH>PCE</VEMEH>\n`;
        xml += `          <EXIDV>${sscc}</EXIDV>\n`;
        xml += `        </E1EDL44>\n`;
        xml += `      </E1EDL37>\n`;
    });

    xml += `    </E1EDL20>\n`;
    xml += `  </IDOC>\n`;
    xml += `</DELVRY03>\n`;

    return xml;
}
