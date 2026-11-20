// SSCC Pro Vision — Core Application Logic (v5.6.0)

// State
let store = [];
window.store = store;

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
    if (end < start) return { error: 'O fim do intervalo é menor que o início.' };
    const count = end - start + 1n;
    if (count > BigInt(MAX_RANGE)) return { error: `Intervalo demasiado grande: ${count} códigos (máximo ${MAX_RANGE}).` };
    const results = [];
    for (let n = start; n <= end; n++) {
        results.push(n.toString().padStart(17, '0'));
    }
    return results;
}

function formatSSCC(body, cd, provided) {
    const ai  = `<span class="sscc-ai">(00)</span>`;
    const ext = `<span class="sscc-ext">${body[0]}</span>`;
    const b   = `<span class="sscc-body">${body.substring(1)}</span>`;

    let cdHtml;
    if (provided === null) {
        cdHtml = `<span class="sscc-cd">${cd}</span>`;
    } else if (provided === cd) {
        cdHtml = `<span class="sscc-cd">${cd}</span>`;
    } else {
        cdHtml = `<span class="sscc-cd-err" title="Expected ${cd}">${provided}</span>`;
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
        }, 1500);
    });
}

function exportCSV() {
    if (!store.length) return;
    const rows = [
        ['SSCC', 'Status', 'Country', 'Check_Digit'].join(','),
        ...store
            .filter(i => i.plain)
            .map(i => [
                `"${i.plain}"`,
                `"${i.status.toUpperCase()}"`,
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

function process() {
    const raw = document.getElementById('input').value;
    const lines = raw.split(/\r?\n/);
    store = [];
    window.store = store;

    lines.forEach(line => {
        const trimmed = line.trim();
        if (!trimmed) return;

        const range = parseRangeLine(trimmed);
        if (range) {
            const [bodyA, bodyB] = range;
            const expanded = expandRange(bodyA, bodyB);
            if (expanded.error) {
                store.push({ code: expanded.error, label: 'ERR', status: 'invalid', flag: '', plain: null });
                return;
            }
            expanded.forEach(body => {
                const cd   = getCD(body);
                const full = body + cd;
                store.push({
                    code:  formatSSCC(body, cd, null),
                    label: 'GEN',
                    status:'gen',
                    flag:  getFlag(full),
                    plain: plainSSCC(body, cd),
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
                code:   formatSSCC(body, cd, provided),
                label:  ok ? 'PASS' : `FAIL: expected ${cd}`,
                status: ok ? 'valid' : 'invalid',
                flag,
                plain:  plainSSCC(body, cd),
            });

        } else if (val.length === 17) {
            const cd   = getCD(val);
            const flag = getFlag(val + cd);
            store.push({
                code:  formatSSCC(val, cd, null),
                label: 'GEN',
                status:'gen',
                flag,
                plain: plainSSCC(val, cd),
            });
        }
    });

    render();

    // Auto-save session to history if there are valid results
    if (store.some(i => i.plain)) {
        saveSessionToHistory(raw, store);
    }
}

function render() {
    const out = document.getElementById('output');

    if (!store.length) {
        out.innerHTML = `<div class="empty-state">
            <div class="empty-state-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/>
                    <path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/>
                    <rect x="7" y="8" width="2" height="8" rx="1"/><rect x="11" y="8" width="1" height="8" rx="0.5"/>
                    <rect x="14" y="8" width="3" height="8" rx="1"/>
                </svg>
            </div>
            <div class="empty-state-label">Scan a barcode or enter an SSCC</div>
            <div class="empty-state-hint">e.g. 356012345600000016 or START - END</div>
        </div>`;
        return;
    }

    const valid      = store.filter(i => i.status === 'valid').length;
    const invalid    = store.filter(i => i.status === 'invalid').length;
    const gen        = store.filter(i => i.status === 'gen').length;
    const total      = store.filter(i => i.plain).length;
    const validOrGen = store.filter(i => (i.status === 'valid' || i.status === 'gen') && i.plain);

    let summary = `<div class="results-summary">`;
    if (gen)     summary += `<span class="badge badge-gen">${gen} GEN</span>`;
    if (valid)   summary += `<span class="badge badge-pass">${valid} PASS</span>`;
    if (invalid) summary += `<span class="badge badge-fail">${invalid} FAIL</span>`;
    
    // Batch Labels Button
    if (validOrGen.length > 0) {
        summary += `<button class="btn-export btn-batch-labels" onclick="openBatchLabelsModal()" title="Imprimir etiquetas GS1 ou exportar ZPL em lote">
            <i data-lucide="printer" style="width:12px;height:12px;vertical-align:middle;margin-right:4px;"></i>Etiquetas (${validOrGen.length})
        </button>`;
    }
    
    if (total > 1) {
        summary += `<button class="btn-export" onclick="exportCSV()" title="Exportar tabela para CSV">
            <i data-lucide="download" style="width:12px;height:12px;vertical-align:middle;margin-right:4px;"></i>CSV
        </button>`;
    }

    if (total > 0) {
        summary += `<button class="btn-export" onclick="shareBatch()" title="Partilhar lista via link direto">
            <i data-lucide="share-2" style="width:12px;height:12px;vertical-align:middle;margin-right:4px;"></i>Partilhar
        </button>`;
    }

    summary += `</div>`;

    const rows = store.map((item, idx) => {
        const badgeClass = item.status === 'valid'   ? 'badge-pass'
                         : item.status === 'invalid' ? 'badge-fail'
                         :                            'badge-gen';
        const rowStyle = item.status === 'invalid' ? 'color:#f87171' : '';
        const copyBtn  = item.plain
            ? `<button class="btn-copy" onclick="copyCode('${item.plain}', this)" title="Copy SSCC"><i data-lucide="copy" style="width:13px;height:13px;vertical-align:middle;"></i></button>`
            : '';
        const labelBtn = (item.status === 'valid' || item.status === 'gen') && item.plain
            ? `<button class="btn-copy" onclick="openLabelModal('${item.plain}')" title="Gerar Etiqueta GS1 (Print / ZPL)"><i data-lucide="tag" style="width:13px;height:13px;vertical-align:middle;"></i></button>`
            : '';

        return `
        <div class="result-row" style="${rowStyle}">
            <span class="result-code">${item.code}</span>
            <span class="result-meta">
                <span class="flag">${item.flag || ''}</span>
                <span class="badge ${badgeClass}">${item.label}</span>
                ${copyBtn}
                ${labelBtn}
            </span>
        </div>`;
    }).join('');

    out.innerHTML = summary + rows;
    if (window.lucide) lucide.createIcons();
}

function clearAll() {
    document.getElementById('input').value = '';
    store = [];
    window.store = store;
    render();
}

/* ==========================================================================
   FEATURE 3: USABILIDADE, ARMAZENAMENTO & PWA
   ========================================================================== */

// 1. Histórico Local Persistente (LocalStorage)
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
    if (!rawText.trim() || !storeItems.length) return;
    try {
        const history = getHistory();
        const validCount = storeItems.filter(i => (i.status === 'valid' || i.status === 'gen') && i.plain).length;
        if (validCount === 0) return;

        // Evitar duplicar sessão exatamente igual em menos de 10 segundos
        if (history.length > 0 && history[0].rawText === rawText && (Date.now() - history[0].id) < 10000) {
            return;
        }

        const newEntry = {
            id: Date.now(),
            date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date().toLocaleDateString(),
            count: storeItems.length,
            validCount: validCount,
            rawText: rawText
        };

        history.unshift(newEntry);
        if (history.length > 30) history.pop(); // Guarda até 30 sessões
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
        listEl.innerHTML = `<div style="text-align:center;padding:24px;color:var(--text-muted);font-size:12px;">Nenhum histórico guardado ainda.<br>Os lotes auditados são guardados localmente de forma privada.</div>`;
    } else {
        listEl.innerHTML = history.map(item => `
            <div class="history-item">
                <div class="history-info">
                    <div class="history-date">${escapeHtml(item.date)}</div>
                    <div class="history-meta">${item.count} códigos (${item.validCount} válidos)</div>
                </div>
                <div class="history-actions">
                    <button class="btn-export" onclick="restoreHistoryItem(${item.id})">Restaurar</button>
                    <button class="btn-copy" onclick="deleteHistoryItem(${item.id})" title="Eliminar"><i data-lucide="trash-2" style="width:13px;height:13px;color:var(--danger);"></i></button>
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
    process();
    showToast(`Sessão restaurada (${item.validCount} paletes).`);
}

function deleteHistoryItem(id) {
    let history = getHistory();
    history = history.filter(h => h.id !== id);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    updateHistoryCount();
    openHistoryModal(); // Refresh modal
}

function clearAllHistory() {
    if (!confirm('Eliminar todo o histórico local?')) return;
    localStorage.removeItem(HISTORY_KEY);
    updateHistoryCount();
    openHistoryModal();
}

// 2. Configurador de Prefixo GS1 da Empresa (GCP)
const GCP_SETTINGS_KEY = 'sscc_gcp_settings_v1';

function getGCPSettings() {
    try {
        const s = localStorage.getItem(GCP_SETTINGS_KEY);
        if (s) return JSON.parse(s);
    } catch (e) {}
    return {
        prefix: '',
        extDigit: '0',
        lastSerial: 1
    };
}

function saveGCPSettings(data) {
    try {
        localStorage.setItem(GCP_SETTINGS_KEY, JSON.stringify(data));
    } catch (e) {}
}

function openSettingsModal() {
    const s = getGCPSettings();
    if (document.getElementById('cfg-prefix')) document.getElementById('cfg-prefix').value = s.prefix || '';
    if (document.getElementById('cfg-ext')) document.getElementById('cfg-ext').value = s.extDigit || '0';
    if (document.getElementById('cfg-serial')) document.getElementById('cfg-serial').value = s.lastSerial || '1';

    const modal = document.getElementById('settings-modal-backdrop');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function closeSettingsModal() {
    const modal = document.getElementById('settings-modal-backdrop');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
}

function saveSettingsForm() {
    const prefix = (document.getElementById('cfg-prefix')?.value || '').replace(/\D/g, '');
    const extDigit = (document.getElementById('cfg-ext')?.value || '0').replace(/\D/g, '') || '0';
    const lastSerial = parseInt(document.getElementById('cfg-serial')?.value || '1', 10);

    if (prefix && (prefix.length < 6 || prefix.length > 11)) {
        alert('O Prefixo de Empresa GS1 (GCP) tem tipicamente entre 6 e 11 dígitos.');
        return;
    }

    saveGCPSettings({
        prefix,
        extDigit: extDigit.slice(0, 1),
        lastSerial: isNaN(lastSerial) ? 1 : lastSerial
    });

    closeSettingsModal();
    showToast('Definições GS1 guardadas.');
}

/**
 * Generates the next sequential SSCC for the configured GS1 Company Prefix.
 */
function generateNextSSCC() {
    const s = getGCPSettings();
    if (!s.prefix) {
        openSettingsModal();
        showToast('Configura primeiro o teu Prefixo GS1 da empresa.', 'warn');
        return;
    }

    const ext = s.extDigit || '0';
    const prefix = s.prefix;
    // Total body digits = 17 = 1 (ext) + prefix.length + serial.length
    const serialLen = 17 - 1 - prefix.length;
    if (serialLen <= 0) {
        alert('Prefixo da empresa demasiado longo.');
        return;
    }

    const nextSerialNum = (parseInt(s.lastSerial, 10) || 0) + 1;
    const serialStr = String(nextSerialNum).padStart(serialLen, '0');
    const body17 = `${ext}${prefix}${serialStr}`;
    const cd = getCD(body17);
    const fullSSCC = body17 + cd;

    // Atualiza o contador guardado
    s.lastSerial = nextSerialNum;
    saveGCPSettings(s);

    const input = document.getElementById('input');
    input.value = (input.value.trim() ? input.value.trim() + '\n' : '') + fullSSCC;
    process();

    if (typeof playBeep === 'function') playBeep();
    showToast(`Gerado: (00) ${fullSSCC}`);
}

// 3. Partilha Serverless por URL Hash
function shareBatch() {
    const raw = document.getElementById('input').value.trim();
    if (!raw) {
        showToast('Nada para partilhar.', 'warn');
        return;
    }

    try {
        const encoded = encodeURIComponent(btoa(unescape(encodeURIComponent(raw))));
        const shareUrl = `${window.location.origin}${window.location.pathname}#share=${encoded}`;
        navigator.clipboard.writeText(shareUrl).then(() => {
            showToast('🔗 Link de partilha copiado para o clipboard!');
        }).catch(() => {
            prompt('Copia o teu link de partilha:', shareUrl);
        });
    } catch (e) {
        alert('Erro ao gerar link de partilha.');
    }
}

function checkUrlShare() {
    // 1. Suporte a parâmetros de pesquisa do portal pormenores.net (?code=... ou ?sscc=...)
    try {
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code') || params.get('sscc');
        if (code) {
            document.getElementById('input').value = code;
            process();
            if (params.get('label') === '1' || window.location.hash === '#label') {
                setTimeout(() => openLabelModal(code), 250);
            }
            return;
        }
    } catch (e) {}

    // 2. Partilha serverless por hash (#share=...)
    if (window.location.hash.startsWith('#share=')) {
        try {
            const rawHash = window.location.hash.substring(7);
            const decoded = decodeURIComponent(escape(atob(decodeURIComponent(rawHash))));
            if (decoded) {
                document.getElementById('input').value = decoded;
                process();
                showToast('Lote partilhado carregado com sucesso!');
                history.replaceState(null, null, window.location.pathname);
            }
        } catch (e) {
            console.warn('Falha ao descodificar share URL:', e);
        }
    }
}

// 4. Hardware / Laser Barcode Scanner Listener (Wedge)
let scannerBuffer = '';
let lastKeyTime = 0;

function initHardwareScannerListener() {
    window.addEventListener('keydown', e => {
        // Se o utilizador estiver a digitar dentro de um input/textarea normal, não interferir
        const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
        if (activeTag === 'input' && document.activeElement.id !== 'file-input') return;

        const now = Date.now();
        const diff = now - lastKeyTime;
        lastKeyTime = now;

        // Scanners industriais disparam teclas com menos de 45ms entre si
        if (diff > 55) {
            scannerBuffer = '';
        }

        if (e.key === 'Enter') {
            const trimmed = scannerBuffer.trim();
            if (trimmed.length >= 17) {
                e.preventDefault();
                const input = document.getElementById('input');
                input.value = (input.value.trim() ? input.value.trim() + '\n' : '') + trimmed;
                if (typeof playBeep === 'function') playBeep();
                process();
                showToast(`Código lido por scanner: ${trimmed.slice(-8)}`);
            }
            scannerBuffer = '';
            return;
        }

        if (e.key.length === 1) {
            scannerBuffer += e.key;
        }
    });
}

// 5. Toast Notification System
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
