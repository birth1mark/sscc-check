// SSCC Pro Vision — Core Application Logic (v5.8.0)

// State
let store = [];
window.store = store;
let activeWorkspaceTab = 'validate';
let historySaveTimer = null;

// GS1 Prefix Country Flag (source: GS1 General Specifications 2025)
const GS1_FLAGS = [
    [[1,19],'🇺🇸'],[[30,39],'🇺🇸'],[[60,139],'🇺🇸'],
    [[200,299],'🏢'],
    [[300,379],'🇫🇷'],
    [[380,380],'🇧🇬'],[[383,383],'🇸🇮'],[[385,385],'🇭🇷'],
    [[387,387],'🇧🇦'],[[389,389],'🇽🇰'],[[390,390],'🇲🇪'],
    [[400,440],'🇩🇪'],
    [[450,459],'🇯🇵'],[[490,499],'🇯🇵'],
    [[460,469],'🇷🇺'],[[470,470],'🇰🇬'],[[471,471],'🇹🇼'],
    [[474,474],'🇪🇪'],[[475,475],'🇱🇻'],[[476,476],'🇦🇿'],
    [[477,477],'🇱🇹'],[[478,478],'🇺🇿'],[[479,479],'🇱🇰'],
    [[480,480],'🇵🇭'],[[481,481],'🇧🇾'],[[482,482],'🇺🇦'],
    [[483,483],'🇹🇲'],[[484,484],'🇲🇩'],[[485,485],'🇦🇲'],
    [[486,486],'🇬🇪'],[[487,487],'🇰🇿'],[[488,488],'🇹🇯'],[[489,489],'🇭🇰'],
    [[500,509],'🇬🇧'],
    [[520,521],'🇬🇷'],[[528,528],'🇱🇧'],[[529,529],'🇨🇾'],
    [[530,530],'🇦🇱'],[[531,531],'🇲🇰'],[[535,535],'🇲🇹'],[[539,539],'🇮🇪'],
    [[540,549],'🇧🇪'],
    [[560,560],'🇵🇹'],[[569,569],'🇮🇸'],[[570,579],'🇩🇰'],
    [[590,590],'🇵🇱'],[[594,594],'🇷🇴'],[[599,599],'🇭🇺'],
    [[600,601],'🇿🇦'],[[603,603],'🇬🇭'],[[604,604],'🇸🇳'],
    [[605,605],'🇺🇬'],[[606,606],'🇦🇴'],[[607,607],'🇴🇲'],
    [[608,608],'🇧🇭'],[[609,609],'🇲🇺'],[[611,611],'🇲🇦'],
    [[613,613],'🇩🇿'],[[615,615],'🇳🇬'],[[616,616],'🇰🇪'],
    [[617,617],'🇨🇲'],[[618,618],'🇨🇮'],[[619,619],'🇹🇳'],
    [[620,620],'🇹🇿'],[[621,621],'🇸🇾'],[[622,622],'🇪🇬'],
    [[623,623],'🌐'],[[624,624],'🇱🇾'],[[625,625],'🇯🇴'],
    [[626,626],'🇮🇷'],[[627,627],'🇰🇼'],[[628,628],'🇸🇦'],
    [[629,629],'🇦🇪'],[[630,630],'🇶🇦'],[[631,631],'🇳🇦'],[[632,632],'🇷🇼'],
    [[640,649],'🇫🇮'],
    [[680,681],'🇨🇳'],[[690,699],'🇨🇳'],
    [[700,709],'🇳🇴'],[[729,729],'🇮🇱'],[[730,739],'🇸🇪'],
    [[740,740],'🇬🇹'],[[741,741],'🇸🇻'],[[742,742],'🇭🇳'],
    [[743,743],'🇳🇮'],[[744,744],'🇨🇷'],[[745,745],'🇵🇦'],[[746,746],'🇩🇴'],
    [[750,750],'🇲🇽'],[[754,755],'🇨🇦'],[[758,758],'🌐'],[[759,759],'🇻🇪'],
    [[760,769],'🇨🇭'],[[770,771],'🇨🇴'],[[773,773],'🇺🇾'],
    [[775,775],'🇵🇪'],[[777,777],'🇧🇴'],[[778,779],'🇦🇷'],
    [[780,780],'🇨🇱'],[[784,784],'🇵🇾'],[[786,786],'🇪🇨'],[[789,790],'🇧🇷'],
    [[800,839],'🇮🇹'],
    [[840,849],'🇪🇸'],
    [[850,850],'🇨🇺'],[[858,858],'🇸🇰'],[[859,859],'🇨🇿'],
    [[860,860],'🇷🇸'],[[865,865],'🇲🇳'],[[867,867],'🇰🇵'],
    [[868,869],'🇹🇷'],[[870,879],'🇳🇱'],
    [[880,881],'🇰🇷'],[[883,883],'🇲🇲'],[[884,884],'🇰🇭'],
    [[885,885],'🇹🇭'],[[888,888],'🇸🇬'],[[890,890],'🇮🇳'],
    [[893,893],'🇻🇳'],[[894,894],'🇧🇩'],[[896,896],'🇵🇰'],[[899,899],'🇮🇩'],
    [[900,919],'🇦🇹'],
    [[930,939],'🇦🇺'],[[940,949],'🇳🇿'],
    [[950,952],'🌐'],[[955,955],'🇲🇾'],[[958,958],'🇲🇴'],
    [[977,984],'🌐'],[[990,999],'🌐']
];

function getFlag(sscc18) {
    const prefix = parseInt(sscc18.substring(1, 4), 10);
    for (const [[lo, hi], flag] of GS1_FLAGS) {
        if (prefix >= lo && prefix <= hi) return flag;
    }
    return '';
}

function getCD(s17) {
    let sum = 0;
    const digits = s17.split('').reverse();
    for (let i = 0; i < digits.length; i++) {
        sum += parseInt(digits[i], 10) * (i % 2 === 0 ? 3 : 1);
    }
    return (10 - (sum % 10)) % 10;
}

function toBody(raw) {
    const d = raw.replace(/\D/g, '');
    if (d.length === 17) return d;
    if (d.length === 18) return d.substring(0, 17);
    if (d.length === 20 && d.startsWith('00')) return d.substring(2, 19);
    return null;
}

const MAX_RANGE = 500;

function parseRangeLine(line) {
    const m = line.trim().match(
        /^(\(?00\)?\s*)?(\d{17,20})\s*(?:-|\bto\b)\s*(\(?00\)?\s*)?(\d{17,20})$/i
    );
    if (!m) return null;
    const bodyA = toBody(m[2]);
    const bodyB = toBody(m[4]);
    if (!bodyA || !bodyB) return null;
    return [bodyA, bodyB];
}

function expandRange(bodyA, bodyB) {
    const start = BigInt(bodyA);
    const end   = BigInt(bodyB);
    if (end < start) return { error: 'Range end is smaller than range start.' };
    const count = end - start + 1n;
    if (count > BigInt(MAX_RANGE)) return { error: `Range too large: ${count} codes (maximum ${MAX_RANGE}).` };
    const results = [];
    for (let n = start; n <= end; n++) {
        results.push(n.toString().padStart(17, '0'));
    }
    return results;
}

function formatSSCC(body, cd, provided) {
    const ai  = `<span class="sscc-ai">(00)</span>`;
    const ext = `<span class="sscc-ext" title="Extension Digit">${body[0]}</span>`;
    const b   = `<span class="sscc-body" title="GS1 Company Prefix &amp; Serial Reference">${body.substring(1)}</span>`;

    let cdHtml;
    if (provided === null || provided === cd) {
        cdHtml = `<span class="sscc-cd" title="Valid Check Digit (${cd})">${cd}</span>`;
    } else {
        cdHtml = `<span class="sscc-cd-err" title="Invalid Check Digit: provided ${provided}, expected ${cd}">${provided}</span>`;
    }

    return `${ai} ${ext} ${b} ${cdHtml}`;
}

function plainSSCC(body, cd) {
    return body + cd;
}

function copyCode(plain, btn) {
    navigator.clipboard.writeText(plain).then(() => {
        const orig = btn.innerHTML;
        btn.innerHTML = `<i data-lucide="check" style="width:13px;height:13px;color:var(--success);vertical-align:middle;"></i>`;
        if (window.lucide) lucide.createIcons();
        setTimeout(() => {
            btn.innerHTML = orig;
            if (window.lucide) lucide.createIcons();
        }, 1400);
    });
}

function exportCSV() {
    if (!store.length) return;
    const rows = [
        ['SSCC', 'Status', 'Duplicate', 'Country', 'Check_Digit'].join(','),
        ...store
            .filter(i => i.plain)
            .map(i => [
                `"${i.plain}"`,
                `"${i.status.toUpperCase()}"`,
                `"${i.isDuplicate ? 'DUPLICATE_x' + i.duplicateCount : 'UNIQUE'}"`,
                `"${i.flag || ''}"`,
                `"${i.plain.slice(-1)}"`
            ].join(','))
    ];
    const blob = new Blob([rows.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `sscc_export_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}

/**
 * Switches between the two primary workspace tabs: 'validate' and 'labels'.
 */
function switchWorkspaceTab(tabName) {
    activeWorkspaceTab = tabName;

    const btnVal = document.getElementById('tab-btn-validate');
    const btnLbl = document.getElementById('tab-btn-labels');
    const panelVal = document.getElementById('panel-validate');
    const panelLbl = document.getElementById('panel-labels');

    if (tabName === 'labels') {
        if (typeof stopScanner === 'function' && typeof isScanning !== 'undefined' && isScanning) {
            stopScanner();
        }
        if (btnVal) { btnVal.classList.remove('active'); btnVal.setAttribute('aria-selected', 'false'); }
        if (btnLbl) { btnLbl.classList.add('active'); btnLbl.setAttribute('aria-selected', 'true'); }
        if (panelVal) panelVal.style.display = 'none';
        if (panelLbl) panelLbl.style.display = 'block';

        if (typeof initLabelStudioIfNeeded === 'function') {
            initLabelStudioIfNeeded();
        }
    } else {
        if (btnVal) { btnVal.classList.add('active'); btnVal.setAttribute('aria-selected', 'true'); }
        if (btnLbl) { btnLbl.classList.remove('active'); btnLbl.setAttribute('aria-selected', 'false'); }
        if (panelVal) panelVal.style.display = 'block';
        if (panelLbl) panelLbl.style.display = 'none';
    }

    if (window.lucide) lucide.createIcons();
}

/**
 * Handles live input from the textarea without requiring an explicit "AUDIT" click.
 */
function handleLiveInput() {
    dismissFileBanner();
    process(false);

    clearTimeout(historySaveTimer);
    historySaveTimer = setTimeout(() => {
        const raw = document.getElementById('input')?.value || '';
        if (store.some(i => i.plain)) {
            saveSessionToHistory(raw, store);
        }
    }, 1200);
}

/**
 * Loads sample SSCC codes to demonstrate validation, check digit calc, ranges, and error fixing.
 */
function loadSampleCodes(presetType = 'mixed') {
    const input = document.getElementById('input');
    if (!input) return;

    dismissFileBanner();

    if (presetType === 'single') {
        input.value = '356012345600000016';
    } else if (presetType === 'calc17') {
        input.value = '35601234560000002';
    } else if (presetType === 'range') {
        input.value = '356012345600000016 - 356012345600000020';
    } else {
        input.value = [
            '356012345600000016',
            '34012345670000009',
            '384012345600000010 - 384012345600000012'
        ].join('\n');
    }

    process(true);
    showToast('Sample SSCC batch loaded.');
}

function dismissFileBanner() {
    const banner = document.getElementById('file-banner');
    if (banner) banner.style.display = 'none';
}

/**
 * Computes duplicate frequency across store items.
 */
function annotateDuplicates(items) {
    const freq = {};
    items.forEach(item => {
        const key = item.submittedPlain || item.plain;
        if (key) {
            freq[key] = (freq[key] || 0) + (item.fileOccurrences || 1);
        }
    });
    items.forEach(item => {
        const key = item.submittedPlain || item.plain;
        if (key && freq[key] > 1) {
            item.isDuplicate = true;
            item.duplicateCount = freq[key];
        } else {
            item.isDuplicate = false;
            item.duplicateCount = 1;
        }
    });
}

/**
 * Fixes a single invalid SSCC check digit with 1 click.
 */
function fixSingleCheckDigit(storeIdx) {
    const item = store[storeIdx];
    if (!item || !item.body17 || item.expectedCD === undefined) return;

    const fixedSSCC = item.body17 + item.expectedCD;
    const inputEl = document.getElementById('input');
    if (inputEl) {
        const lines = inputEl.value.split(/\r?\n/);
        if (item.lineIdx !== undefined && lines[item.lineIdx] !== undefined) {
            lines[item.lineIdx] = fixedSSCC;
        } else {
            const idx = lines.findIndex(l => l.replace(/\D/g, '').endsWith(item.body17 + item.providedCD));
            if (idx !== -1) lines[idx] = fixedSSCC;
        }
        inputEl.value = lines.join('\n');
    }

    process(true);
    showToast(`✓ Fixed check digit → (00) ${fixedSSCC}`, 'success');
}

/**
 * Fixes all invalid SSCC check digits in the current batch.
 */
function fixAllCheckDigits() {
    const fixables = store.filter(i => i.status === 'invalid' && i.body17 && i.expectedCD !== undefined);
    if (!fixables.length) return;

    const inputEl = document.getElementById('input');
    if (inputEl) {
        const lines = inputEl.value.split(/\r?\n/);
        fixables.forEach(item => {
            const fixedSSCC = item.body17 + item.expectedCD;
            if (item.lineIdx !== undefined && lines[item.lineIdx] !== undefined) {
                lines[item.lineIdx] = fixedSSCC;
            }
        });
        inputEl.value = lines.join('\n');
    }

    process(true);
    showToast(`✓ Fixed ${fixables.length} invalid check digit(s).`, 'success');
}

/**
 * Removes duplicate SSCC codes from the current batch while preserving order.
 */
function deduplicateBatch() {
    const seen = new Set();
    const uniqueLines = [];
    let removed = 0;

    store.forEach(item => {
        const key = item.submittedPlain || item.plain;
        if (!key) return;
        if (seen.has(key)) {
            removed++;
        } else {
            seen.add(key);
            uniqueLines.push(item.status === 'invalid' && item.submittedPlain ? item.submittedPlain : item.plain);
            if (item.fileOccurrences && item.fileOccurrences > 1) {
                removed += (item.fileOccurrences - 1);
            }
        }
    });

    const inputEl = document.getElementById('input');
    if (inputEl && uniqueLines.length) {
        inputEl.value = uniqueLines.join('\n');
    }

    process(true);
    showToast(`✓ Deduplicated batch (${removed} duplicate${removed !== 1 ? 's' : ''} removed).`, 'success');
}

function process(saveImmediate = true) {
    const inputEl = document.getElementById('input');
    const raw = inputEl ? inputEl.value : '';
    const lines = raw.split(/\r?\n/);
    store = [];
    window.store = store;

    const clearBtn = document.getElementById('btn-clear-input');
    if (clearBtn) {
        clearBtn.style.display = raw.trim().length > 0 ? 'inline-flex' : 'none';
    }

    lines.forEach((line, lineIdx) => {
        const trimmed = line.trim();
        if (!trimmed) return;

        const range = parseRangeLine(trimmed);
        if (range) {
            const [bodyA, bodyB] = range;
            const expanded = expandRange(bodyA, bodyB);
            if (expanded.error) {
                store.push({ code: expanded.error, label: 'ERR', status: 'invalid', flag: '', plain: null, lineIdx });
                return;
            }
            expanded.forEach(body => {
                const cd   = getCD(body);
                const full = body + cd;
                store.push({
                    code:           formatSSCC(body, cd, null),
                    label:          'GEN',
                    status:         'gen',
                    flag:           getFlag(full),
                    plain:          plainSSCC(body, cd),
                    submittedPlain: plainSSCC(body, cd),
                    lineIdx
                });
            });
            return;
        }

        const val = trimmed.replace(/\D/g, '');

        if (val.length === 18 || (val.length === 20 && val.startsWith('00'))) {
            const body     = toBody(val);
            const cd       = getCD(body);
            const provided = parseInt(val.length === 18 ? val[17] : val[19], 10);
            const ok       = provided === cd;
            const flag     = getFlag(body + cd);
            store.push({
                code:           formatSSCC(body, cd, provided),
                label:          ok ? 'VALID' : `FAIL · exp ${cd}`,
                status:         ok ? 'valid' : 'invalid',
                flag,
                plain:          plainSSCC(body, cd),
                submittedPlain: body + provided,
                body17:         body,
                expectedCD:     cd,
                providedCD:     provided,
                lineIdx
            });

        } else if (val.length === 17) {
            const cd   = getCD(val);
            const flag = getFlag(val + cd);
            store.push({
                code:           formatSSCC(val, cd, null),
                label:          'GEN · +' + cd,
                status:         'gen',
                flag,
                plain:          plainSSCC(val, cd),
                submittedPlain: plainSSCC(val, cd),
                lineIdx
            });
        } else if (val.length > 0) {
            store.push({
                code:   `<span style="color:var(--text-muted);">${escapeHtml(trimmed)}</span>`,
                label:  `${val.length} digits (need 17/18)`,
                status: 'invalid',
                flag:   '',
                plain:  null,
                lineIdx
            });
        }
    });

    annotateDuplicates(store);
    render();

    if (saveImmediate && store.some(i => i.plain)) {
        saveSessionToHistory(raw, store);
    }
}

function updateWorkspaceBadges() {
    const validOrGen = store.filter(i => (i.status === 'valid' || i.status === 'gen') && i.plain);
    const badgeEl = document.getElementById('tab-validate-badge');
    if (badgeEl) {
        if (store.length > 0) {
            badgeEl.textContent = store.length;
            badgeEl.style.display = 'inline-block';
        } else {
            badgeEl.style.display = 'none';
        }
    }

    const srcAuditedLabel = document.getElementById('src-audited-label');
    if (srcAuditedLabel) {
        srcAuditedLabel.textContent = `Validated List (${validOrGen.length})`;
    }
}

function render() {
    const out = document.getElementById('output');
    updateWorkspaceBadges();
    if (!out) return;

    if (!store.length) {
        out.innerHTML = `<div class="empty-state">
            <div class="empty-state-icon">
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/>
                    <path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/>
                    <rect x="7" y="8" width="2" height="8" rx="1"/><rect x="11" y="8" width="1" height="8" rx="0.5"/>
                    <rect x="14" y="8" width="3" height="8" rx="1"/>
                </svg>
            </div>
            <div class="empty-state-label">Ready to validate or extract SSCC codes</div>
            <div class="empty-state-hint">Paste codes above, scan a GS1-128 barcode, or drop an EDIFACT / XML / CSV file</div>
            <div class="sample-chips">
                <button type="button" class="sample-chip" onclick="loadSampleCodes('single')">18-Digit SSCC</button>
                <button type="button" class="sample-chip" onclick="loadSampleCodes('calc17')">17-Digit Check Calc</button>
                <button type="button" class="sample-chip" onclick="loadSampleCodes('range')">5-Pallet Range</button>
            </div>
        </div>`;
        return;
    }

    const valid      = store.filter(i => i.status === 'valid').length;
    const invalid    = store.filter(i => i.status === 'invalid').length;
    const gen        = store.filter(i => i.status === 'gen').length;
    const total      = store.filter(i => i.plain).length;
    const validOrGen = store.filter(i => (i.status === 'valid' || i.status === 'gen') && i.plain);
    const fixables   = store.filter(i => i.status === 'invalid' && i.body17 && i.expectedCD !== undefined);
    const dupItems   = store.filter(i => i.isDuplicate);
    const uniqueDups = new Set(dupItems.map(i => i.submittedPlain || i.plain)).size;

    let summary = `<div class="results-summary"><div class="summary-badges">`;
    if (valid)      summary += `<span class="badge badge-pass">${valid} VALID</span>`;
    if (gen)        summary += `<span class="badge badge-gen">${gen} GENERATED</span>`;
    if (invalid)    summary += `<span class="badge badge-fail">${invalid} INVALID</span>`;
    if (uniqueDups) summary += `<span class="badge badge-dup" title="Duplicate SSCC codes detected in batch">⚠️ ${uniqueDups} DUPLICATE${uniqueDups > 1 ? 'S' : ''}</span>`;
    summary += `</div><div class="summary-actions">`;

    if (fixables.length > 0) {
        summary += `<button type="button" class="btn-export btn-fix-all" onclick="fixAllCheckDigits()" title="Automatically fix all ${fixables.length} invalid Modulo 10 check digits">
            <i data-lucide="wrench" style="width:12px;height:12px;"></i>
            <span>Fix All (${fixables.length})</span>
        </button>`;
    }

    if (uniqueDups > 0) {
        summary += `<button type="button" class="btn-export" onclick="deduplicateBatch()" title="Remove duplicate SSCC lines">
            <i data-lucide="filter" style="width:12px;height:12px;"></i>
            <span>Deduplicate</span>
        </button>`;
    }

    if (validOrGen.length > 0) {
        summary += `<button type="button" class="btn-export btn-batch-labels" onclick="openBatchLabelsModal()" title="Open Pallet Label Studio with these ${validOrGen.length} codes">
            <i data-lucide="printer" style="width:12px;height:12px;"></i>
            <span>Print Labels (${validOrGen.length})</span>
        </button>`;
    }

    if (total > 0) {
        summary += `<button type="button" class="btn-export" onclick="exportCSV()" title="Export results to CSV">
            <i data-lucide="download" style="width:12px;height:12px;"></i>
            <span>CSV</span>
        </button>`;
        summary += `<button type="button" class="btn-export" onclick="shareBatch()" title="Copy shareable link to this batch">
            <i data-lucide="share-2" style="width:12px;height:12px;"></i>
            <span>Share</span>
        </button>`;
    }

    summary += `</div></div>`;

    const legend = `<div class="sscc-legend">
        <div class="legend-items">
            <span><span class="sscc-ai">(00)</span> AI</span>
            <span><span class="legend-dot" style="background:var(--primary);"></span>Ext</span>
            <span><span class="legend-dot" style="background:var(--text-main);"></span>GS1 Prefix &amp; Serial</span>
            <span><span class="legend-dot" style="background:var(--success);"></span>Check Digit</span>
        </div>
        <span>${store.length} item${store.length !== 1 ? 's' : ''}</span>
    </div>`;

    const rows = store.map((item, idx) => {
        const badgeClass = item.status === 'valid'   ? 'badge-pass'
                         : item.status === 'invalid' ? 'badge-fail'
                         :                             'badge-gen';
        const dupBadge = item.isDuplicate
            ? `<span class="badge badge-dup" title="This SSCC appears ${item.duplicateCount} times in the current batch">DUP ×${item.duplicateCount}</span>`
            : '';
        const fixBtn = (item.status === 'invalid' && item.body17 && item.expectedCD !== undefined)
            ? `<button type="button" class="btn-fix-cd" onclick="fixSingleCheckDigit(${idx})" title="Replace invalid check digit (${item.providedCD}) with valid Modulo 10 digit (${item.expectedCD})">🔧 Fix → ${item.expectedCD}</button>`
            : '';
        const copyBtn = item.plain
            ? `<button type="button" class="btn-copy" onclick="copyCode('${item.plain}', this)" title="Copy valid 18-digit SSCC"><i data-lucide="copy" style="width:13px;height:13px;"></i></button>`
            : '';
        const labelBtn = (item.status === 'valid' || item.status === 'gen') && item.plain
            ? `<button type="button" class="btn-copy" onclick="openLabelModal('${item.plain}')" title="Open GS1 Pallet Label for this SSCC"><i data-lucide="tag" style="width:13px;height:13px;"></i></button>`
            : '';
        const sourceSub = item.source ? `<span class="result-source">${escapeHtml(item.source)}</span>` : '';

        return `
        <div class="result-row">
            <div class="result-code-wrap">
                <span class="result-code">${item.code}</span>
                ${sourceSub}
            </div>
            <span class="result-meta">
                <span class="flag">${item.flag || ''}</span>
                ${dupBadge}
                <span class="badge ${badgeClass}">${item.label}</span>
                ${fixBtn}
                ${copyBtn}
                ${labelBtn}
            </span>
        </div>`;
    }).join('');

    out.innerHTML = summary + legend + rows;
    if (window.lucide) lucide.createIcons();
}

function clearAll() {
    const input = document.getElementById('input');
    if (input) input.value = '';
    const clearBtn = document.getElementById('btn-clear-input');
    if (clearBtn) clearBtn.style.display = 'none';
    dismissFileBanner();
    store = [];
    window.store = store;
    render();
}

/* ==========================================================================
   PERSISTENT AUDIT HISTORY, GS1 GCP STORAGE, SHARING & HARDWARE SCANNER
   ========================================================================== */

const HISTORY_KEY = 'sscc_audit_history_v1';

function getHistory() {
    try {
        const h = localStorage.getItem(HISTORY_KEY);
        return h ? JSON.parse(h) : [];
    } catch (e) {
        return [];
    }
}

function saveSessionToHistory(rawText, storeItems) {
    if (!rawText || !rawText.trim() || !storeItems.length) return;
    try {
        const history = getHistory();
        const validCount = storeItems.filter(i => (i.status === 'valid' || i.status === 'gen') && i.plain).length;
        if (validCount === 0) return;

        if (history.length > 0 && history[0].rawText === rawText.trim()) {
            return;
        }

        const newEntry = {
            id: Date.now(),
            date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' · ' + new Date().toLocaleDateString(),
            count: storeItems.length,
            validCount: validCount,
            rawText: rawText.trim()
        };

        history.unshift(newEntry);
        if (history.length > 30) history.pop();
        localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
        updateHistoryCount();
    } catch (e) {}
}

function updateHistoryCount() {
    const el = document.getElementById('history-count-badge');
    if (!el) return;
    const h = getHistory();
    el.textContent = h.length;
    el.style.display = h.length ? 'inline-block' : 'none';
}

function openHistoryModal() {
    const listEl = document.getElementById('history-list-box');
    if (!listEl) return;
    const history = getHistory();

    if (!history.length) {
        listEl.innerHTML = `<div style="text-align:center;padding:24px;color:var(--text-muted);font-size:12px;">No audit history saved yet.<br>Validated batches are kept privately in local browser storage.</div>`;
    } else {
        listEl.innerHTML = history.map(item => `
            <div class="history-item">
                <div class="history-info">
                    <div class="history-date">${escapeHtml(item.date)}</div>
                    <div class="history-meta">${item.count} codes (${item.validCount} valid)</div>
                </div>
                <div class="history-actions">
                    <button class="btn-export" onclick="restoreHistoryItem(${item.id})">Restore</button>
                    <button class="btn-copy" onclick="deleteHistoryItem(${item.id})" title="Delete"><i data-lucide="trash-2" style="width:13px;height:13px;color:var(--danger);"></i></button>
                </div>
            </div>
        `).join('');
    }

    const modal = document.getElementById('history-modal-backdrop');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
    if (window.lucide) lucide.createIcons();
}

function closeHistoryModal() {
    const modal = document.getElementById('history-modal-backdrop');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
}

function restoreHistoryItem(id) {
    const history = getHistory();
    const item = history.find(h => h.id === id);
    if (!item) return;
    document.getElementById('input').value = item.rawText;
    closeHistoryModal();
    switchWorkspaceTab('validate');
    process(false);
    showToast(`Session restored (${item.validCount} pallets).`);
}

function deleteHistoryItem(id) {
    let history = getHistory();
    history = history.filter(h => h.id !== id);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    updateHistoryCount();
    openHistoryModal();
}

function clearAllHistory() {
    if (!confirm('Clear all local audit history?')) return;
    localStorage.removeItem(HISTORY_KEY);
    updateHistoryCount();
    openHistoryModal();
}

// GS1 Company Prefix (GCP) Persistence (shared directly with Tab 2 Studio)
const GCP_SETTINGS_KEY = 'sscc_gcp_settings_v1';

function getGCPSettings() {
    try {
        const s = localStorage.getItem(GCP_SETTINGS_KEY);
        if (s) return JSON.parse(s);
    } catch (e) {}
    return {
        prefix: '5601234',
        extDigit: '0',
        lastSerial: 1000
    };
}

function saveGCPSettings(data) {
    try {
        localStorage.setItem(GCP_SETTINGS_KEY, JSON.stringify(data));
    } catch (e) {}
}

// Serverless URL Hash Sharing
function shareBatch() {
    const validCodes = store.filter(i => i.plain).map(i => i.plain);
    const raw = document.getElementById('input').value.trim() || validCodes.join('\n');
    if (!raw) {
        showToast('Nothing to share.', 'warn');
        return;
    }

    try {
        const encoded = encodeURIComponent(btoa(unescape(encodeURIComponent(raw))));
        const shareUrl = `${window.location.origin}${window.location.pathname}#share=${encoded}`;
        navigator.clipboard.writeText(shareUrl).then(() => {
            showToast('🔗 Shareable batch link copied to clipboard!');
        }).catch(() => {
            prompt('Copy your share link:', shareUrl);
        });
    } catch (e) {
        alert('Failed to generate share link.');
    }
}

function checkUrlShare() {
    try {
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code') || params.get('sscc');
        if (code) {
            document.getElementById('input').value = code;
            process(true);
            if (params.get('label') === '1' || window.location.hash === '#label') {
                setTimeout(() => openLabelModal(code), 150);
            }
            return;
        }
    } catch (e) {}

    if (window.location.hash === '#labels' || window.location.hash === '#label') {
        switchWorkspaceTab('labels');
        return;
    }

    if (window.location.hash.startsWith('#share=')) {
        try {
            const rawHash = window.location.hash.substring(7);
            const decoded = decodeURIComponent(escape(atob(decodeURIComponent(rawHash))));
            if (decoded) {
                document.getElementById('input').value = decoded;
                process(true);
                showToast('Shared batch loaded!');
                history.replaceState(null, null, window.location.pathname);
            }
        } catch (e) {
            console.warn('Failed to decode share URL:', e);
        }
    }
}

// Hardware / Laser Barcode Scanner Listener (Wedge)
let scannerBuffer = '';
let lastKeyTime = 0;

function initHardwareScannerListener() {
    window.addEventListener('keydown', e => {
        const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
        if ((activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') && document.activeElement.id !== 'file-input') {
            return;
        }

        const now = Date.now();
        const diff = now - lastKeyTime;
        lastKeyTime = now;

        if (diff > 55) {
            scannerBuffer = '';
        }

        if (e.key === 'Enter') {
            const trimmed = scannerBuffer.trim();
            if (trimmed.length >= 17) {
                e.preventDefault();
                switchWorkspaceTab('validate');
                const input = document.getElementById('input');
                input.value = (input.value.trim() ? input.value.trim() + '\n' : '') + trimmed;
                if (typeof beep === 'function') beep();
                process(true);
                showToast(`Scanned via hardware: ${trimmed.slice(-8)}`);
            }
            scannerBuffer = '';
            return;
        }

        if (e.key.length === 1) {
            scannerBuffer += e.key;
        }
    });
}

function escapeHtml(str) {
    return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function showToast(msg, type = 'info') {
    let toast = document.getElementById('app-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'app-toast';
        toast.className = 'app-toast';
        document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.className = `app-toast show type-${type}`;
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
        toast.className = 'app-toast';
    }, 2800);
}
