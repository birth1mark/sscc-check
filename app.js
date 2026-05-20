// State
let store = [];

// GS1 Prefix Country Flag (source: GS1 General Specifications 2025)
const GS1_FLAGS = [
    [[1,19],'🇺🇸'],[[30,39],'🇺🇸'],[[60,139],'🇺🇸'],
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
    [[605,605],'🇺🇬'],[[606,606],'🇦重'],[[607,607],'🇴🇲'],
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
    [[743,743],'🇳icarágua'],[[744,744],'🇨🇷'],[[745,745],'🇵🇦'],[[746,746],'🇩🇴'],
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
    const prefix = parseInt(sscc18.substring(1, 4));
    for (const [[lo, hi], flag] of GS1_FLAGS) {
        if (prefix >= lo && prefix <= hi) return flag;
    }
    return '';
}

function getCD(s17) {
    let sum = 0;
    const digits = s17.split('').reverse();
    for (let i = 0; i < digits.length; i++) {
        sum += parseInt(digits[i]) * (i % 2 === 0 ? 3 : 1);
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
        /^(\(?00\)?\s*)?(\d{17,20})\s*-\s*(\(?00\)?\s*)?(\d{17,20})$/
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
    if (end < start) return { error: 'Range end is before start.' };
    const count = end - start + 1n;
    if (count > BigInt(MAX_RANGE)) return { error: `Range too large: ${count} codes (max ${MAX_RANGE}).` };
    const results = [];
    for (let n = start; n <= end; n++) results.push(n.toString().padStart(17, '0'));
    return results;
}

function formatSSCC(body17, cd, provided = null) {
    const ext     = body17[0];
    const ref     = body17.substring(1);
    const isGen   = provided === null;
    const isValid = isGen || provided === cd;
    const cdDigit = isGen ? cd : provided;
    const cdClass = isValid ? 'cd-valid' : 'cd-invalid';

    return `<span class="sscc-ai">(00)</span>` +
           `<span class="sscc-ext">${ext}</span>` +
           `<span class="sscc-ref">${ref}</span>` +
           `<span class="sscc-cd ${cdClass}">${cdDigit}</span>`;
}

function plainSSCC(body17, cd) {
    return `00${body17}${cd}`;
}

// CORRECAO: Lógica de feedback com injeção de classes corrigida
function copyCode(plain, btn) {
    const checkIcon = '<i data-lucide="check" style="width:13px;height:13px;vertical-align:middle;"></i>';
    const copyIcon  = '<i data-lucide="copy"  style="width:13px;height:13px;vertical-align:middle;"></i>';

    const confirm = () => {
        btn.innerHTML = checkIcon;
        btn.classList.add('copied');
        if (window.lucide) lucide.createIcons();
        setTimeout(() => {
            btn.innerHTML = copyIcon;
            btn.classList.remove('copied');
            if (window.lucide) lucide.createIcons();
        }, 1200);
    };

    navigator.clipboard.writeText(plain).then(confirm).catch(() => {
        const ta = document.createElement('textarea');
        ta.value = plain;
        ta.style.cssText = 'position:fixed;opacity:0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        confirm();
    });
}

function exportCSV() {
    if (!store.length) return;

    const rows = ['SSCC,Status,Country'];
    store.forEach(item => {
        if (item.plain) {
            const country = item.flag || '';
            rows.push(`${item.plain},${item.label},${country}`);
        }
    });

    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `sscc_export_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}

function process() {
    const lines = document.getElementById('input').value.split('\n');
    store = [];

    lines.forEach(line => {
        const trimmed = line.trim();
        if (!trimmed) return;

        const rangeParts = parseRangeLine(trimmed);
        if (rangeParts) {
            const [bodyA, bodyB] = rangeParts;
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
            const provided = parseInt(val.length === 18 ? val[17] : val[19]);
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
            <div class="empty-state-hint">e.g. 356012345600000016</div>
        </div>`;
        return;
    }

    const valid   = store.filter(i => i.status === 'valid').length;
    const invalid = store.filter(i => i.status === 'invalid').length;
    const gen     = store.filter(i => i.status === 'gen').length;
    const total   = store.filter(i => i.plain).length;

    let summary = `<div class="results-summary">`;
    if (gen)     summary += `<span class="badge badge-gen">${gen} GEN</span>`;
    if (valid)   summary += `<span class="badge badge-pass">${valid} PASS</span>`;
    if (invalid) summary += `<span class="badge badge-fail">${invalid} FAIL</span>`;
    if (total > 1) summary += `<button class="btn-export" onclick="exportCSV()">⬇ CSV</button>`;
    summary += `</div>`;

    const rows = store.map((item, idx) => {
        const badgeClass = item.status === 'valid'   ? 'badge-pass'
                         : item.status === 'invalid' ? 'badge-fail'
                         :                            'badge-gen';
        const rowStyle = item.status === 'invalid' ? 'color:#f87171' : '';
        const copyBtn  = item.plain
            ? `<button class="btn-copy" onclick="copyCode('${item.plain}', this)" title="Copy SSCC"><i data-lucide="copy" style="width:13px;height:13px;vertical-align:middle;"></i></button>`
            : '';

        return `
        <div class="result-row" style="${rowStyle}">
            <span class="result-code">${item.code}</span>
            <span class="result-meta">
                <span class="flag">${item.flag || ''}</span>
                <span class="badge ${badgeClass}">${item.label}</span>
                ${copyBtn}
            </span>
        </div>`;
    }).join('');

    out.innerHTML = summary + rows;
    if (window.lucide) lucide.createIcons();
}

function clearAll() {
    document.getElementById('input').value = '';
    store = [];
    render();
}