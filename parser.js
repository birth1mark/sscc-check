// ─── File Parser (v5.7.0) ─────────────────────────────────────────────────────
// Extracts and validates SSCCs from uploaded files.
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

    const allContent = text.replace(/<[^>]+>/g, ' ');
    extractGeneric(allContent, 'XML content', found);

    return found;
}

function parseGeneric(text) {
    const found = [];
    extractGeneric(text, 'File extract', found);
    return found;
}

function extractGeneric(text, source, found) {
    let m;

    const reAI = /\(00\)(\d{18})/g;
    while ((m = reAI.exec(text)) !== null) {
        tryAddSSCC(m[1], source, found);
    }

    const re20 = /(?<!\d)(00\d{18})/g;
    while ((m = re20.exec(text)) !== null) {
        tryAddSSCC(m[1], source, found);
    }

    const re18 = /(?<!\d)(\d{18})(?!\d)/g;
    while ((m = re18.exec(text)) !== null) {
        tryAddSSCC(m[1], source, found);
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
        if (!found.some(f => f.plain === full)) {
            found.push({
                code:   formatSSCC(digits, cd, null),
                label:  'GEN · +' + cd,
                status: 'gen',
                flag:   getFlag(full),
                plain:  full,
                source,
            });
        }
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

    const plain = body18;
    if (found.some(f => f.plain === plain)) return;

    found.push({
        code:   formatSSCC(body, expected, provided),
        label:  ok ? 'VALID' : `FAIL · exp ${expected}`,
        status: ok ? 'valid' : 'invalid',
        flag:   getFlag(body18),
        plain,
        source,
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
            inputEl.value = results.filter(r => r.plain).map(r => r.plain).join('\n');
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
        content.innerHTML = `<span class="file-banner-name">📄 ${escapeHTML(filename)}</span>
            <span class="file-banner-info">${escapeHTML(fmtLabel)} · <strong>${count}</strong> SSCC${count !== 1 ? 's' : ''} extracted
                ${valid   ? `· <span style="color:var(--success)">${valid} valid</span>`   : ''}
                ${invalid ? `· <span style="color:var(--danger)">${invalid} invalid</span>` : ''}
                ${gen     ? `· <span style="color:var(--primary)">${gen} generated</span>`  : ''}
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
