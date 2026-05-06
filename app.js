// ─── State ────────────────────────────────────────────────────────────────────
let store = [];

// ─── GS1 Prefix → Country Flag ───────────────────────────────────────────────
const GS1_FLAGS = [
    [[300,379],'🇫🇷'],[[380,380],'🇧🇬'],[[383,383],'🇸🇮'],[[385,385],'🇭🇷'],
    [[387,387],'🇧🇦'],[[389,389],'🇲🇪'],[[400,440],'🇩🇪'],[[450,459],'🇯🇵'],
    [[460,469],'🇷🇺'],[[470,470],'🇰🇬'],[[471,471],'🇹🇼'],[[474,474],'🇪🇪'],
    [[475,475],'🇱🇻'],[[476,476],'🇦🇿'],[[477,477],'🇱🇹'],[[478,478],'🇺🇿'],
    [[479,479],'🇱🇰'],[[480,480],'🇵🇭'],[[481,481],'🇧🇾'],[[482,482],'🇺🇦'],
    [[483,483],'🇹🇲'],[[484,484],'🇲🇩'],[[485,485],'🇦🇲'],[[486,486],'🇬🇪'],
    [[487,487],'🇰🇿'],[[488,488],'🇹🇯'],[[489,489],'🇭🇰'],[[490,499],'🇯🇵'],
    [[500,509],'🇬🇧'],[[520,521],'🇬🇷'],[[528,528],'🇱🇧'],[[529,529],'🇨🇾'],
    [[530,530],'🇦🇱'],[[531,531],'🇲🇰'],[[535,535],'🇲🇹'],[[539,539],'🇮🇪'],
    [[540,549],'🇧🇪'],[[560,560],'🇵🇹'],[[569,569],'🇮🇸'],[[570,579],'🇩🇰'],
    [[590,590],'🇵🇱'],[[594,594],'🇷🇴'],[[599,599],'🇭🇺'],[[600,601],'🇿🇦'],
    [[603,603],'🇬🇭'],[[604,604],'🇸🇳'],[[608,608],'🇧🇭'],[[609,609],'🇲🇺'],
    [[611,611],'🇲🇦'],[[613,613],'🇩🇿'],[[615,615],'🇳🇬'],[[616,616],'🇰🇪'],
    [[618,618],'🇨🇮'],[[619,619],'🇹🇳'],[[620,620],'🇹🇿'],[[621,621],'🇸🇾'],
    [[622,622],'🇪🇬'],[[623,623],'🇧🇳'],[[624,624],'🇱🇾'],[[625,625],'🇯🇴'],
    [[626,626],'🇮🇷'],[[627,627],'🇰🇼'],[[628,628],'🇸🇦'],[[629,629],'🇦🇪'],
    [[630,630],'🇶🇦'],[[631,631],'🇲🇿'],[[640,649],'🇫🇮'],[[690,699],'🇨🇳'],
    [[700,709],'🇳🇴'],[[729,729],'🇮🇱'],[[730,739],'🇸🇪'],[[740,740],'🇬🇹'],
    [[741,741],'🇸🇻'],[[742,742],'🇭🇳'],[[743,743],'🇳🇮'],[[744,744],'🇨🇷'],
    [[745,745],'🇵🇦'],[[746,746],'🇩🇴'],[[750,750],'🇲🇽'],[[754,755],'🇨🇦'],
    [[759,759],'🇻🇪'],[[760,769],'🇨🇭'],[[770,771],'🇨🇴'],[[773,773],'🇺🇾'],
    [[775,775],'🇵🇪'],[[777,777],'🇧🇴'],[[778,779],'🇦🇷'],[[780,780],'🇨🇱'],
    [[784,784],'🇵🇾'],[[785,785],'🇪🇨'],[[786,786],'🇧🇷'],[[789,790],'🇧🇷'],
    [[800,839],'🇮🇹'],[[840,849],'🇪🇸'],[[850,850],'🇨🇺'],[[858,858],'🇸🇰'],
    [[859,859],'🇨🇿'],[[860,860],'🇷🇸'],[[865,865],'🇲🇳'],[[867,867],'🇰🇵'],
    [[868,869],'🇹🇷'],[[870,879],'🇳🇱'],[[880,880],'🇰🇷'],[[883,883],'🇲🇲'],
    [[884,884],'🇻🇳'],[[885,885],'🇹🇭'],[[888,888],'🇸🇬'],[[890,890],'🇮🇳'],
    [[893,893],'🇻🇳'],[[896,896],'🇵🇰'],[[899,899],'🇮🇩'],[[900,919],'🇦🇹'],
    [[930,939],'🇦🇺'],[[940,949],'🇳🇿'],[[950,950],'🌐'],[[951,951],'🌐'],
    [[955,955],'🇲🇾'],[[958,958],'🇲🇴'],[[960,969],'🌐'],[[977,977],'🌐'],
    [[978,979],'🌐'],[[980,980],'🌐'],[[981,984],'🌐'],[[990,999],'🌐'],
];

/**
 * Returns the country flag emoji for a given 18-digit SSCC.
 * GS1 prefix = digits 1–3 of the SSCC (after the 1-digit extension).
 */
function getFlag(sscc18) {
    const prefix = parseInt(sscc18.substring(1, 4));
    for (const [[lo, hi], flag] of GS1_FLAGS) {
        if (prefix >= lo && prefix <= hi) return flag;
    }
    return '';
}

/**
 * Calculates the GS1 check digit for a 17-digit body string.
 */
function getCD(s17) {
    let sum = 0;
    const digits = s17.split('').reverse();
    for (let i = 0; i < digits.length; i++) {
        sum += parseInt(digits[i]) * (i % 2 === 0 ? 3 : 1);
    }
    return (10 - (sum % 10)) % 10;
}

/**
 * Normalises any SSCC-like input to a 17-digit body string, or null if invalid.
 * Accepts:
 *   - 17 digits  → body as-is
 *   - 18 digits  → strip check digit
 *   - 19 digits  → strip leading '0' padding + check digit (rare)
 *   - 20 digits starting with '00' → AI (00) prefix, take digits 2-18 (17-digit body)
 */
function toBody(raw) {
    const d = raw.replace(/\D/g, '');
    if (d.length === 17) return d;
    if (d.length === 18) return d.substring(0, 17);
    if (d.length === 20 && d.startsWith('00')) return d.substring(2, 19); // AI(00) + 17 body
    return null;
}

// ─── Range expansion ──────────────────────────────────────────────────────────

const MAX_RANGE = 500;

/**
 * Detects if a line is a range expression and returns [bodyA, bodyB] or null.
 *
 * Supports all realistic input formats:
 *   17 digits:  34001234500000001-34001234500000050
 *   18 digits:  340012345000000018-340012345000000050
 *   20 digits:  00340012345000000018-00340012345000000050
 *   With AI:    (00)340012345000000018-(00)340012345000000050
 *   With spaces: 34001234500000001 - 34001234500000050
 *
 * Strategy: split on the '-' that separates two SSCC-like tokens.
 * An SSCC token is an optional "(00)" prefix followed by 17–18 digits.
 */
function parseRangeLine(line) {
    // Match: optional (00) + 17-20 digits, separator '-', optional (00) + 17-20 digits
    const m = line.trim().match(
        /^(\(?00\)?\s*)?(\d{17,20})\s*-\s*(\(?00\)?\s*)?(\d{17,20})$/
    );
    if (!m) return null;

    const bodyA = toBody(m[2]);
    const bodyB = toBody(m[4]);

    if (!bodyA || !bodyB) return null;
    return [bodyA, bodyB];
}

/**
 * Expands a range into an array of 17-digit body strings.
 * Returns array of strings, or { error: string } on failure.
 */
function expandRange(bodyA, bodyB) {
    const start = BigInt(bodyA);
    const end   = BigInt(bodyB);

    if (end < start) return { error: `Range end is before start.` };

    const count = end - start + 1n;
    if (count > BigInt(MAX_RANGE)) {
        return { error: `Range too large: ${count} codes (max ${MAX_RANGE}).` };
    }

    const results = [];
    for (let n = start; n <= end; n++) {
        results.push(n.toString().padStart(17, '0'));
    }
    return results;
}

// ─── SSCC Formatter ──────────────────────────────────────────────────────────

/**
 * Returns an HTML string with each SSCC part in its own colour:
 *   (00)  — muted
 *   E     — extension digit (blue/primary)
 *   XXXX… — 16-digit body, GCP + reference (normal)
 *   C     — check digit (green if valid, red if invalid)
 *
 * @param {string} body17    17-digit SSCC body (no check digit)
 * @param {number} cd        expected check digit
 * @param {number|null} provided  provided check digit (null for GEN)
 */
function formatSSCC(body17, cd, provided = null) {
    const ext      = body17[0];           // extension digit (1)
    const ref      = body17.substring(1); // GCP + reference (16 digits)
    const isGen    = provided === null;
    const isValid  = isGen || provided === cd;
    const cdDigit  = isGen ? cd : provided;

    const cdClass  = isValid
        ? 'cd-valid'
        : 'cd-invalid';

    return `<span class="sscc-ai">(00)</span>` +
           `<span class="sscc-ext">${ext}</span>` +
           `<span class="sscc-ref">${ref}</span>` +
           `<span class="sscc-cd ${cdClass}">${cdDigit}</span>`;
}

// ─── UI Actions ───────────────────────────────────────────────────────────────

/**
 * Processes all lines in the textarea.
 * - "SSCC - SSCC" range → expand and generate CDs for all
 * - 18 digits → validate check digit
 * - 17 digits → generate check digit
 */
function process() {
    const lines = document.getElementById('input').value.split('\n');
    store = [];

    lines.forEach(line => {
        const trimmed = line.trim();
        if (!trimmed) return;

        // ── Range? ───────────────────────────────────────────────────────────
        const rangeParts = parseRangeLine(trimmed);
        if (rangeParts) {
            const [bodyA, bodyB] = rangeParts;
            const expanded = expandRange(bodyA, bodyB);

            if (expanded.error) {
                store.push({ code: expanded.error, label: 'ERR', status: 'invalid', flag: '' });
                return;
            }

            expanded.forEach(body => {
                const cd   = getCD(body);
                const full = body + cd;
                store.push({ code: formatSSCC(body, cd, null), label: 'GEN', status: 'gen', flag: getFlag(full) });
            });
            return;
        }

        // ── Single code ──────────────────────────────────────────────────────
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
            });

        } else if (val.length === 17) {
            const cd   = getCD(val);
            const flag = getFlag(val + cd);
            store.push({ code: formatSSCC(val, cd, null), label: 'GEN', status: 'gen', flag });
        }
    });

    render();
}

/** Renders the result rows into #output. */
function render() {
    const out = document.getElementById('output');

    if (!store.length) {
        out.innerHTML = '<span class="ready-msg">Ready.</span>';
        return;
    }

    out.innerHTML = store.map(item => {
        const badgeClass = item.status === 'valid'   ? 'badge-pass'
                         : item.status === 'invalid' ? 'badge-fail'
                         :                            'badge-gen';
        const rowStyle = item.status === 'invalid' ? 'color:#f87171' : '';

        return `
        <div class="result-row" style="${rowStyle}">
            <span class="result-code">${item.code}</span>
            <span class="result-meta">
                <span class="flag">${item.flag || ''}</span>
                <span class="badge ${badgeClass}">${item.label}</span>
            </span>
        </div>`;
    }).join('');
}

/** Clears the textarea and results. */
function clearAll() {
    document.getElementById('input').value = '';
    store = [];
    render();
}
