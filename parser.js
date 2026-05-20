// ─── File Parser ──────────────────────────────────────────────────────────────
// Extracts and validates SSCCs from uploaded files.
// Supports: EDIFACT, IDoc SAP, XML, CSV, TXT (generic fallback)
// Everything runs client-side — no data leaves the browser.

// ─── DOM Safety ──────────────────────────────────────────────────────────────
// Escape user-controlled strings before inserting into innerHTML
function escapeHTML(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// ─── Format Detection ─────────────────────────────────────────────────────────

function detectFormat(text) {
    const t = text.trimStart();
    if (/^UNA|^UNB\+/.test(t))                          return 'edifact';
    if (/<\?xml|<ORDERS|<DESADV|<IDOC|<EDI_DC/i.test(t)) return 'xml';
    if (/^[A-Z]{3}\+/.test(t))                           return 'edifact'; // no UNA header
    return 'generic'; // CSV, TXT, JSON, anything else
}

// ─── EDIFACT Parser ───────────────────────────────────────────────────────────
// SSCC appears in these segments:
//   GIN+BJ+<SSCC>         — Goods Identity Number, qualifier BJ = SSCC
//   PAC+++<count>:<type>+<SSCC> — Package level (less common)
//   RFF+SI:<SSCC>         — Reference, qualifier SI = Shipment ID (sometimes SSCC)
//   BGM+<type>+<SSCC>     — some implementations put SSCC in BGM

function parseEDIFACT(text) {
    const found = [];

    // Normalise: remove line breaks inside segments, split on segment terminator
    // Handle custom delimiters from UNA if present
    let compSep  = ':';
    let elemSep  = '+';
    let segTerm  = "'";

    const unaMatch = text.match(/^UNA(.{6})/);
    if (unaMatch) {
        compSep = unaMatch[1][0];
        elemSep = unaMatch[1][1];
        segTerm = unaMatch[1][5];
    }

    // Split into segments
    const segments = text
        .replace(/\r?\n/g, '')
        .split(segTerm)
        .map(s => s.trim())
        .filter(Boolean);

    segments.forEach((seg, idx) => {
        const elements = seg.split(elemSep);
        const tag      = elements[0];

        // GIN+BJ:<SSCC> — primary location for SSCC in DESADV/IFTMIN
        if (tag === 'GIN') {
            elements.slice(1).forEach(el => {
                const parts = el.split(compSep);
                // qualifier BJ = SSCC
                if (parts[0] === 'BJ' && parts[1]) {
                    tryAddSSCC(parts[1], `GIN+BJ (segment ${idx + 1})`, found);
                } else if (parts.length === 1) {
                    // Some implementations omit qualifier
                    tryAddSSCC(parts[0], `GIN (segment ${idx + 1})`, found);
                }
            });
        }

        // RFF+SI:<SSCC>
        if (tag === 'RFF') {
            elements.slice(1).forEach(el => {
                const parts = el.split(compSep);
                if (parts[0] === 'SI' && parts[1]) {
                    tryAddSSCC(parts[1], `RFF+SI (segment ${idx + 1})`, found);
                }
                if (parts[0] === 'AAK' && parts[1]) {
                    tryAddSSCC(parts[1], `RFF+AAK (segment ${idx + 1})`, found);
                }
            });
        }

        // PAC — package segment, SSCC sometimes in element 4 or 5
        if (tag === 'PAC') {
            elements.slice(1).forEach(el => {
                const parts = el.split(compSep);
                parts.forEach(p => tryAddSSCC(p, `PAC (segment ${idx + 1})`, found));
            });
        }

        // BGM — some non-standard implementations
        if (tag === 'BGM') {
            elements.slice(1).forEach(el => {
                tryAddSSCC(el.split(compSep)[0], `BGM (segment ${idx + 1})`, found);
            });
        }
    });

    return found;
}

// ─── XML / IDoc Parser ────────────────────────────────────────────────────────
// Looks for SSCC values in common XML tags/attributes.
// IDoc: E1HANDLING_UNIT > EXIDV, VHILM_KU, EXIDV2
// Generic XML: any tag whose name contains "sscc", "serialship", "nve", "gin"

function parseXML(text) {
    const found = [];

    // Known IDoc / XML field names that carry SSCCs
    const knownTags = [
        'EXIDV', 'EXIDV2', 'VHILM_KU',           // SAP IDoc
        'SSCC', 'NVE', 'GIN', 'SERIAL_SHIP',      // generic
        'ShipmentContainerId', 'ContainerId',       // some WMS
        'PackageId', 'PalletId', 'HandlingUnitId',  // generic
    ];

    knownTags.forEach(tag => {
        const re = new RegExp(`<${tag}[^>]*>([^<]+)</${tag}>`, 'gi');
        let m;
        while ((m = re.exec(text)) !== null) {
            tryAddSSCC(m[1].trim(), `<${tag}>`, found);
        }
    });

    // Also scan all tag content with regex as fallback
    const allContent = text.replace(/<[^>]+>/g, ' ');
    extractGeneric(allContent, 'XML content', found);

    return found;
}

// ─── Generic Parser ───────────────────────────────────────────────────────────
// Regex scan for anything that looks like an SSCC:
//   - (00) followed by 18 digits
//   - 00 followed by 18 digits (20 total)
//   - standalone 18-digit number
//   - standalone 17-digit number (body only)

function parseGeneric(text) {
    const found = [];
    extractGeneric(text, 'file content', found);
    return found;
}

function extractGeneric(text, source, found) {
    let m;

    // Pattern 1: (00)XXXXXXXXXXXXXXXXXX — explicit AI notation
    const reAI = /\(00\)(\d{18})/g;
    while ((m = reAI.exec(text)) !== null) {
        tryAddSSCC(m[1], source, found);
    }

    // Pattern 2: 00XXXXXXXXXXXXXXXXXX — 20 digits starting with 00
    // Lookbehind ensures we don't start mid-number.
    // No lookahead — in fixed-width files the SSCC can be immediately
    // followed by more digits (e.g. line number). We always take exactly
    // the first 20 digits (AI 00 + 18-digit SSCC).
    const re20 = /(?<!\d)(00\d{18})/g;
    while ((m = re20.exec(text)) !== null) {
        tryAddSSCC(m[1], source, found);
    }

    // Pattern 3: standalone 18-digit numbers
    const re18 = /(?<!\d)(\d{18})(?!\d)/g;
    while ((m = re18.exec(text)) !== null) {
        tryAddSSCC(m[1], source, found);
    }
}

// ─── SSCC Candidate Validator ────────────────────────────────────────────────

// ─── SSCC Quality Filters ────────────────────────────────────────────────────

/**
 * Filter 1 — GS1 prefix validation.
 * The GS1 prefix is digits 1–3 of the 18-digit SSCC (after the extension digit).
 * Returns true if the prefix matches a known GS1 member range.
 */
// Valid GS1 prefix ranges (source: GS1 General Specifications 2025)
// Self-contained in parser.js — does not depend on app.js GS1_FLAGS
const VALID_GS1_RANGES = [
    [1,19],[30,39],[60,139],          // USA
    [200,299],                         // Restricted circulation
    [300,379],                         // France/Monaco
    [380,380],[383,383],[385,385],[387,387],[389,390], // SE Europe
    [400,440],                         // Germany
    [450,459],[490,499],               // Japan
    [460,469],[470,470],[471,471],[474,489], // Russia + ex-USSR + Asia
    [500,509],                         // UK
    [520,521],[528,531],[535,535],[539,539], // Greece, Lebanon, Cyprus, Albania, Macedonia, Malta, Ireland
    [540,549],                         // Belgium & Luxembourg
    [560,560],[569,569],[570,579],     // Portugal, Iceland, Denmark
    [590,590],[594,594],[599,599],     // Poland, Romania, Hungary
    [600,601],[603,632],               // Africa & Middle East
    [640,649],                         // Finland
    [680,681],[690,699],               // China
    [700,709],[729,729],[730,739],     // Norway, Israel, Sweden
    [740,746],[750,750],[754,755],[758,759], // Central America, Mexico, Canada, Venezuela
    [760,769],[770,771],[773,773],[775,775],[777,777],[778,779],[780,780],[784,784],[786,786],[789,790], // South America + Switzerland
    [800,839],                         // Italy
    [840,849],                         // Spain ← 842 is here
    [850,850],[858,860],[865,865],[867,869], // Cuba, Slovakia, Czech, Serbia, Mongolia, N.Korea, Turkey
    [870,879],[880,881],[883,883],[884,885],[888,888],[890,890],[893,894],[896,896],[899,899], // Netherlands, Korea, SE Asia, India, Bangladesh, Pakistan, Indonesia
    [900,919],                         // Austria
    [930,939],[940,949],               // Australia, New Zealand
    [950,952],[955,955],[958,958],     // Global Office, Malaysia, Macau
    [977,984],[990,999],               // Serials, ISBN, coupons
];

function isValidGS1Prefix(body18) {
    const prefix = parseInt(body18.substring(1, 4));
    for (const [lo, hi] of VALID_GS1_RANGES) {
        if (prefix >= lo && prefix <= hi) return true;
    }
    return false;
}

/**
 * Filter 2 — Trivial sequence rejection.
 * Rejects strings that are clearly not real SSCCs:
 *   - More than 10 identical consecutive digits (e.g. 00000000000000228820)
 *   - All same digit (e.g. 111111111111111111)
 *   - Sequential runs (e.g. 012345678901234567)
 */
function isTrivialSequence(digits) {
    // More than 10 identical consecutive digits anywhere (e.g. 00000000000228820)
    if (/(\d)\1{9,}/.test(digits)) return true;
    // String is entirely one repeated digit (e.g. 111111111111111111)
    if (/^(\d)\1+$/.test(digits)) return true;
    return false;
}

function tryAddSSCC(raw, source, found) {
    if (!raw) return;
    const digits = raw.replace(/\D/g, '');

    let body18; // 18-digit SSCC

    if (digits.length === 20 && digits.startsWith('00')) {
        body18 = digits.substring(2);
    } else if (digits.length === 18) {
        body18 = digits;
    } else if (digits.length === 17) {
        // Body only — apply filters before generating
        if (isTrivialSequence(digits)) return;
        const full = digits + getCD(digits);
        if (!isValidGS1Prefix(full)) return;
        const cd = getCD(digits);
        if (!found.some(f => f.plain === `00${full}`)) {
            found.push({
                code:   formatSSCC(digits, cd, null),
                label:  'GEN',
                status: 'gen',
                flag:   getFlag(full),
                plain:  `00${full}`,
                source,
            });
        }
        return;
    } else {
        return; // not an SSCC
    }

    // Apply quality filters
    if (isTrivialSequence(body18))      return; // e.g. 00000000000000228820
    if (!isValidGS1Prefix(body18))      return; // unknown GS1 prefix

    // Validate check digit
    const body     = body18.substring(0, 17);
    const provided = parseInt(body18[17]);
    const expected = getCD(body);
    const ok       = provided === expected;

    // Deduplicate by plain value
    const plain = `00${body18}`;
    if (found.some(f => f.plain === plain)) return;

    found.push({
        code:   formatSSCC(body, expected, provided),
        label:  ok ? 'PASS' : `FAIL: expected ${expected}`,
        status: ok ? 'valid' : 'invalid',
        flag:   getFlag(body18),
        plain,
        source,
    });
}

// ─── Main Entry Point ─────────────────────────────────────────────────────────

function parseFile(text, filename) {
    const fmt = detectFormat(text);

    let results;
    switch (fmt) {
        case 'edifact': results = parseEDIFACT(text); break;
        case 'xml':     results = parseXML(text);     break;
        default:        results = parseGeneric(text);  break;
    }

    // If structured parsers found nothing, fallback to generic scan
    if (results.length === 0 && fmt !== 'generic') {
        results = parseGeneric(text);
    }

    return { format: fmt, results };
}

// ─── File Upload UI ───────────────────────────────────────────────────────────

function initFileUpload() {
    const zone = document.getElementById('drop-zone');
    const input = document.getElementById('file-input');
    if (!zone || !input) return;

    // Click to open file picker
    zone.addEventListener('click', () => input.click());

    // File picker change
    input.addEventListener('change', e => {
        if (e.target.files[0]) handleFile(e.target.files[0]);
        input.value = ''; // reset so same file can be re-uploaded
    });

    // Drag & drop
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
    if (BINARY_EXTENSIONS.has(ext)) {
        const banner = document.getElementById('file-banner');
        if (banner) {
            banner.innerHTML = `<span class="file-banner-name">📄 ${escapeHTML(file.name)}</span>
                <span class="file-banner-info" style="color:var(--danger)">Binary format not supported — use EDIFACT, XML, CSV or TXT</span>`;
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
        showFileResult(file.name, format, results);
        render();
    };
    reader.readAsText(file, 'UTF-8');
}

function showFileResult(filename, format, results) {
    const banner = document.getElementById('file-banner');
    if (!banner) return;

    const fmtLabel = { edifact: 'EDIFACT', xml: 'XML / IDoc', generic: 'Generic' }[format] || format;
    const count    = results.length;

    if (!count) {
        banner.innerHTML = `<span class="file-banner-name">📄 ${escapeHTML(filename)}</span>
            <span class="file-banner-info" style="color:var(--danger)">No SSCCs found (${escapeHTML(fmtLabel)})</span>`;
    } else {
        const valid   = results.filter(r => r.status === 'valid').length;
        const invalid = results.filter(r => r.status === 'invalid').length;
        const gen     = results.filter(r => r.status === 'gen').length;
        banner.innerHTML = `<span class="file-banner-name">📄 ${escapeHTML(filename)}</span>
            <span class="file-banner-info">${escapeHTML(fmtLabel)} · ${count} SSCC${count !== 1 ? 's' : ''} found
                ${valid   ? `· <span style="color:var(--success)">${valid} valid</span>`   : ''}
                ${invalid ? `· <span style="color:var(--danger)">${invalid} invalid</span>` : ''}
                ${gen     ? `· <span style="color:var(--primary)">${gen} generated</span>`  : ''}
            </span>`;
    }

    banner.style.display = 'flex';
}

// ─── Global drag guard ───────────────────────────────────────────────────────
// Prevents the browser from navigating away if a file is dropped outside the zone.

document.addEventListener('dragover', e => {
    const zone = document.getElementById('drop-zone');
    if (zone && zone.contains(e.target)) return; // let the zone handle it
    e.preventDefault();
    e.dataTransfer.dropEffect = 'none';
});

document.addEventListener('drop', e => {
    const zone = document.getElementById('drop-zone');
    if (zone && zone.contains(e.target)) return; // let the zone handle it
    e.preventDefault();
    e.stopPropagation();
});

// Init on DOM ready
document.addEventListener('DOMContentLoaded', initFileUpload);
