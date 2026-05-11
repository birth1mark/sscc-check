/**
 * SSCC Pro Vision — REST API
 * Cloudflare Worker — v1.2.1
 *
 * Fusão da versão 1.2.0 com os patches de segurança 1.0.1.
 *
 * Endpoints:
 *   GET  /validate?sscc=356012345600000016
 *   GET  /generate?body=35601234560000001
 *   GET  /range?from=35601234560000001&to=35601234560000050
 *   GET  /prefix?sscc=356012345600000016
 *   POST /extract           (body: EDIFACT, IDoc, XML, CSV or TXT content)
 *   GET  /health
 *
 * ─── Mudanças nesta versão ───────────────────────────────────────────────────
 *   • Flag da Geórgia corrigida (🇰🇪 → 🇬🇪).
 *   • VALID_GS1_RANGES derivado de GS1_COUNTRIES + ranges não-país explícitos.
 *   • parseXML restaurado com tags SAP IDoc (EXIDV, EXIDV2, VHILM_KU, etc.).
 *   • parseEDIFACT com leitura de UNA e qualifiers específicos (BJ, SI, AAK).
 *   • try/catch global no router.
 *   • handlePrefix valida length.
 *   • /extract com deteção de binários e validação dupla de tamanho.
 *   • tryAddSSCC devolve JSON completo (formatted, checkDigit, gs1).
 *   • GET /extract devolve 405.
 *   • Dedup via Set (O(N) em vez de O(N²)).
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ─── Limites ─────────────────────────────────────────────────────────────────

const MAX_BODY_BYTES    = 1024 * 1024;  // 1 MB para /extract
const RATE_LIMIT_MAX    = 500;          // pedidos por janela
const RATE_LIMIT_WINDOW = 3600;         // 1 h em segundos

// ─── GS1 Check Digit ─────────────────────────────────────────────────────────

function getCD(s17) {
    let sum = 0;
    const digits = s17.split('').reverse();
    for (let i = 0; i < digits.length; i++) {
        sum += parseInt(digits[i]) * (i % 2 === 0 ? 3 : 1);
    }
    return (10 - (sum % 10)) % 10;
}

// ─── Input normalisation ─────────────────────────────────────────────────────

function toBody17(raw) {
    if (!raw) return null;
    const d = raw.replace(/\D/g, '');
    if (d.length === 17) return d;
    if (d.length === 18) return d.substring(0, 17);
    if (d.length === 20 && d.startsWith('00')) return d.substring(2, 19);
    return null;
}

// ─── GS1 Prefix → Country ────────────────────────────────────────────────────

const GS1_COUNTRIES = [
    [[1,19],'US','🇺🇸','United States'],
    [[30,39],'US','🇺🇸','United States'],
    [[60,139],'US','🇺🇸','United States'],
    [[300,379],'FR','🇫🇷','France'],
    [[380,380],'BG','🇧🇬','Bulgaria'],
    [[383,383],'SI','🇸🇮','Slovenia'],
    [[385,385],'HR','🇭🇷','Croatia'],
    [[387,387],'BA','🇧🇦','Bosnia and Herzegovina'],
    [[389,389],'XK','🇽🇰','Kosovo'],
    [[390,390],'ME','🇲🇪','Montenegro'],
    [[400,440],'DE','🇩🇪','Germany'],
    [[450,459],'JP','🇯🇵','Japan'],
    [[460,469],'RU','🇷🇺','Russia'],
    [[470,470],'KG','🇰🇬','Kyrgyzstan'],
    [[471,471],'TW','🇹🇼','Taiwan'],
    [[474,474],'EE','🇪🇪','Estonia'],
    [[475,475],'LV','🇱🇻','Latvia'],
    [[476,476],'AZ','🇦🇿','Azerbaijan'],
    [[477,477],'LT','🇱🇹','Lithuania'],
    [[478,478],'UZ','🇺🇿','Uzbekistan'],
    [[479,479],'LK','🇱🇰','Sri Lanka'],
    [[480,480],'PH','🇵🇭','Philippines'],
    [[481,481],'BY','🇧🇾','Belarus'],
    [[482,482],'UA','🇺🇦','Ukraine'],
    [[483,483],'TM','🇹🇲','Turkmenistan'],
    [[484,484],'MD','🇲🇩','Moldova'],
    [[485,485],'AM','🇦🇲','Armenia'],
    [[486,486],'GE','🇬🇪','Georgia'],
    [[487,487],'KZ','🇰🇿','Kazakhstan'],
    [[488,488],'TJ','🇹🇯','Tajikistan'],
    [[489,489],'HK','🇭🇰','Hong Kong'],
    [[490,499],'JP','🇯🇵','Japan'],
    [[500,509],'GB','🇬🇧','United Kingdom'],
    [[520,521],'GR','🇬🇷','Greece'],
    [[528,528],'LB','🇱🇧','Lebanon'],
    [[529,529],'CY','🇨🇾','Cyprus'],
    [[530,530],'AL','🇦🇱','Albania'],
    [[531,531],'MK','🇲🇰','North Macedonia'],
    [[535,535],'MT','🇲🇹','Malta'],
    [[539,539],'IE','🇮🇪','Ireland'],
    [[540,549],'BE','🇧🇪','Belgium'],
    [[560,560],'PT','🇵🇹','Portugal'],
    [[569,569],'IS','🇮🇸','Iceland'],
    [[570,579],'DK','🇩🇰','Denmark'],
    [[590,590],'PL','🇵🇱','Poland'],
    [[594,594],'RO','🇷🇴','Romania'],
    [[599,599],'HU','🇭🇺','Hungary'],
    [[600,601],'ZA','🇿🇦','South Africa'],
    [[603,603],'GH','🇬🇭','Ghana'],
    [[604,604],'SN','🇸🇳','Senegal'],
    [[605,605],'UG','🇺🇬','Uganda'],
    [[606,606],'AO','🇦🇴','Angola'],
    [[607,607],'OM','🇴🇲','Oman'],
    [[608,608],'BH','🇧🇭','Bahrain'],
    [[609,609],'MU','🇲🇺','Mauritius'],
    [[611,611],'MA','🇲🇦','Morocco'],
    [[613,613],'DZ','🇩🇿','Algeria'],
    [[615,615],'NG','🇳🇬','Nigeria'],
    [[616,616],'KE','🇰🇪','Kenya'],
    [[617,617],'CM','🇨🇲','Cameroon'],
    [[618,618],'CI','🇨🇮','Ivory Coast'],
    [[619,619],'TN','🇹🇳','Tunisia'],
    [[620,620],'TZ','🇹🇿','Tanzania'],
    [[621,621],'SY','🇸🇾','Syria'],
    [[622,622],'EG','🇪🇬','Egypt'],
    [[624,624],'LY','🇱🇾','Libya'],
    [[625,625],'JO','🇯🇴','Jordan'],
    [[626,626],'IR','🇮🇷','Iran'],
    [[627,627],'KW','🇰🇼','Kuwait'],
    [[628,628],'SA','🇸🇦','Saudi Arabia'],
    [[629,629],'AE','🇦🇪','United Arab Emirates'],
    [[630,630],'QA','🇶🇦','Qatar'],
    [[631,631],'NA','🇳🇦','Namibia'],
    [[632,632],'RW','🇷🇼','Rwanda'],
    [[640,649],'FI','🇫🇮','Finland'],
    [[680,681],'CN','🇨🇳','China'],
    [[690,699],'CN','🇨🇳','China'],
    [[700,709],'NO','🇳🇴','Norway'],
    [[729,729],'IL','🇮🇱','Israel'],
    [[730,739],'SE','🇸🇪','Sweden'],
    [[740,740],'GT','🇬🇹','Guatemala'],
    [[741,741],'SV','🇸🇻','El Salvador'],
    [[742,742],'HN','🇭🇳','Honduras'],
    [[743,743],'NI','🇳🇮','Nicaragua'],
    [[744,744],'CR','🇨🇷','Costa Rica'],
    [[745,745],'PA','🇵🇦','Panama'],
    [[746,746],'DO','🇩🇴','Dominican Republic'],
    [[750,750],'MX','🇲🇽','Mexico'],
    [[754,755],'CA','🇨🇦','Canada'],
    [[759,759],'VE','🇻🇪','Venezuela'],
    [[760,769],'CH','🇨🇭','Switzerland'],
    [[770,771],'CO','🇨🇴','Colombia'],
    [[773,773],'UY','🇺🇾','Uruguay'],
    [[775,775],'PE','🇵🇪','Peru'],
    [[777,777],'BO','🇧🇴','Bolivia'],
    [[778,779],'AR','🇦🇷','Argentina'],
    [[780,780],'CL','🇨🇱','Chile'],
    [[784,784],'PY','🇵🇾','Paraguay'],
    [[786,786],'EC','🇪🇨','Ecuador'],
    [[789,790],'BR','🇧🇷','Brazil'],
    [[800,839],'IT','🇮🇹','Italy'],
    [[840,849],'ES','🇪🇸','Spain'],
    [[850,850],'CU','🇨🇺','Cuba'],
    [[858,858],'SK','🇸🇰','Slovakia'],
    [[859,859],'CZ','🇨🇿','Czech Republic'],
    [[860,860],'RS','🇷🇸','Serbia'],
    [[865,865],'MN','🇲🇳','Mongolia'],
    [[867,867],'KP','🇰🇵','North Korea'],
    [[868,869],'TR','🇹🇷','Turkey'],
    [[870,879],'NL','🇳🇱','Netherlands'],
    [[880,881],'KR','🇰🇷','South Korea'],
    [[883,883],'MM','🇲🇲','Myanmar'],
    [[884,884],'KH','🇰🇭','Cambodia'],
    [[885,885],'TH','🇹🇭','Thailand'],
    [[888,888],'SG','🇸🇬','Singapore'],
    [[890,890],'IN','🇮🇳','India'],
    [[893,893],'VN','🇻🇳','Vietnam'],
    [[894,894],'BD','🇧🇩','Bangladesh'],
    [[896,896],'PK','🇵🇰','Pakistan'],
    [[899,899],'ID','🇮🇩','Indonesia'],
    [[900,919],'AT','🇦🇹','Austria'],
    [[930,939],'AU','🇦🇺','Australia'],
    [[940,949],'NZ','🇳🇿','New Zealand'],
    [[950,952],null,'🌐','GS1 Global Office'],
    [[955,955],'MY','🇲🇾','Malaysia'],
    [[958,958],'MO','🇲🇴','Macau'],
    [[977,984],null,'🌐','GS1 Global (serials/ISBN/coupons)'],
    [[990,999],null,'🌐','GS1 Global (coupons)'],
];

function getPrefix(sscc18) {
    const prefix = parseInt(sscc18.substring(1, 4));
    for (const [[lo, hi], code, flag, name] of GS1_COUNTRIES) {
        if (prefix >= lo && prefix <= hi) return { prefix, code, flag, name };
    }
    return { prefix, code: null, flag: '❓', name: 'Unknown' };
}

// ─── CORS ────────────────────────────────────────────────────────────────────

const CORS = {
    'Access-Control-Allow-Origin':  '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

function json(data, status = 200) {
    return new Response(JSON.stringify(data, null, 2), {
        status,
        headers: { 'Content-Type': 'application/json', ...CORS },
    });
}

function error(message, status = 400) {
    return json({ error: message }, status);
}

// ─── Rate Limiter ────────────────────────────────────────────────────────────

async function checkRateLimit(request, env) {
    if (!env.RATE_LIMIT) return null;

    const ip      = request.headers.get('CF-Connecting-IP') || 'unknown';
    const window  = Math.floor(Date.now() / (RATE_LIMIT_WINDOW * 1000));
    const key     = `rl:${ip}:${window}`;

    const raw     = await env.RATE_LIMIT.get(key);
    const current = raw ? parseInt(raw) : 0;

    if (current >= RATE_LIMIT_MAX) {
        return new Response(JSON.stringify({
            error: `Rate limit exceeded: max ${RATE_LIMIT_MAX} requests per hour per IP. Try again later.`
        }), {
            status: 429,
            headers: {
                'Content-Type':          'application/json',
                'Retry-After':           String(RATE_LIMIT_WINDOW),
                'X-RateLimit-Limit':     String(RATE_LIMIT_MAX),
                'X-RateLimit-Remaining': '0',
                ...CORS,
            },
        });
    }

    await env.RATE_LIMIT.put(key, String(current + 1), { expirationTtl: RATE_LIMIT_WINDOW });
    return null;
}

// ─── Endpoints (GET) ─────────────────────────────────────────────────────────

function handleValidate(url) {
    const raw = url.searchParams.get('sscc');
    if (!raw) return error('Missing parameter: sscc');

    const digits = raw.replace(/\D/g, '');

    let sscc18;
    if (digits.length === 18) sscc18 = digits;
    else if (digits.length === 20 && digits.startsWith('00')) sscc18 = digits.substring(2);
    else return error(`Invalid length: expected 18 digits (or 20 with AI prefix), got ${digits.length}`);

    const body     = sscc18.substring(0, 17);
    const provided = parseInt(sscc18[17]);
    const expected = getCD(body);
    const valid    = provided === expected;
    const prefix   = getPrefix(sscc18);

    return json({
        input:      raw,
        sscc:       sscc18,
        formatted:  `(00)${sscc18}`,
        valid,
        checkDigit: { provided, expected },
        gs1: {
            extensionDigit: parseInt(sscc18[0]),
            prefix:         prefix.prefix,
            country:        prefix.name,
            countryCode:    prefix.code,
            flag:           prefix.flag,
        },
    });
}

function handleGenerate(url) {
    const raw = url.searchParams.get('body');
    if (!raw) return error('Missing parameter: body');

    const digits = raw.replace(/\D/g, '');
    if (digits.length !== 17) return error(`Invalid length: expected 17 digits, got ${digits.length}`);

    const cd      = getCD(digits);
    const sscc18  = digits + cd;
    const prefix  = getPrefix(sscc18);

    return json({
        input:      raw,
        body:       digits,
        checkDigit: cd,
        sscc:       sscc18,
        formatted:  `(00)${sscc18}`,
        gs1: {
            extensionDigit: parseInt(sscc18[0]),
            prefix:         prefix.prefix,
            country:        prefix.name,
            countryCode:    prefix.code,
            flag:           prefix.flag,
        },
    });
}

function handleRange(url) {
    const MAX = 500;
    const fromRaw = url.searchParams.get('from');
    const toRaw   = url.searchParams.get('to');
    if (!fromRaw || !toRaw) return error('Missing parameters: from, to');

    const bodyA = toBody17(fromRaw);
    const bodyB = toBody17(toRaw);
    if (!bodyA) return error(`Invalid "from" value: ${fromRaw}`);
    if (!bodyB) return error(`Invalid "to" value: ${toRaw}`);

    const start = BigInt(bodyA);
    const end   = BigInt(bodyB);
    if (end < start) return error('"to" must be greater than or equal to "from"');

    const count = end - start + 1n;
    if (count > BigInt(MAX)) return error(`Range too large: ${count} codes requested, max ${MAX}`);

    const items = [];
    for (let n = start; n <= end; n++) {
        const body  = n.toString().padStart(17, '0');
        const cd    = getCD(body);
        const sscc  = body + cd;
        items.push({ sscc, formatted: `(00)${sscc}`, checkDigit: cd });
    }

    return json({ from: bodyA, to: bodyB, count: Number(count), items });
}

function handlePrefix(url) {
    const raw = url.searchParams.get('sscc');
    if (!raw) return error('Missing parameter: sscc');

    const digits = raw.replace(/\D/g, '');
    let sscc18;
    if (digits.length === 18) sscc18 = digits;
    else if (digits.length === 20 && digits.startsWith('00')) sscc18 = digits.substring(2);
    else return error(`Invalid length: expected 18 digits (or 20 with AI prefix), got ${digits.length}`);

    const p = getPrefix(sscc18);
    return json({
        sscc:        sscc18,
        prefix:      p.prefix,
        country:     p.name,
        countryCode: p.code,
        flag:        p.flag,
    });
}

function handleHealth() {
    return json({
        status:  'ok',
        version: '1.2.1',
        endpoints: [
            'GET  /validate?sscc=<18-digit SSCC>',
            'GET  /generate?body=<17-digit body>',
            'GET  /range?from=<SSCC>&to=<SSCC>',
            'GET  /prefix?sscc=<18-digit SSCC>',
            'POST /extract  (body: EDIFACT/IDoc/XML/CSV/TXT)',
            'GET  /health',
        ],
    });
}

// ─── SSCC Quality Filters ────────────────────────────────────────────────────

// Ranges válidos = todos os ranges com país + ranges reservados sem país atribuído
// (uso interno empresarial / coupons / outros).
const NON_COUNTRY_RANGES = [
    [200, 299],   // uso interno empresarial
    [758, 759],   // reservado
];

const VALID_GS1_RANGES = [...GS1_COUNTRIES.map(c => c[0]), ...NON_COUNTRY_RANGES];

function isValidGS1Prefix(sscc18) {
    const prefix = parseInt(sscc18.substring(1, 4));
    for (const [lo, hi] of VALID_GS1_RANGES) {
        if (prefix >= lo && prefix <= hi) return true;
    }
    return false;
}

function isTrivialSequence(digits) {
    if (/(\d)\1{9,}/.test(digits)) return true;   // mesmo dígito 10+ vezes seguidas
    if (/^(\d)\1+$/.test(digits))  return true;   // string toda com o mesmo dígito
    return false;
}

// ─── File Parser ─────────────────────────────────────────────────────────────

function detectFormat(text) {
    const t = text.trimStart();
    if (/^UNA|^UNB\+/.test(t) || /^[A-Z]{3}\+/.test(t)) return 'edifact';
    if (/<\?xml|<ORDERS|<DESADV|<IDOC|<EDI_DC/i.test(t))  return 'xml';
    return 'generic';
}

function tryAddSSCC(raw, found, seen) {
    if (!raw) return;
    const digits = raw.replace(/\D/g, '');

    let sscc18, providedCD = null;

    if (digits.length === 20 && digits.startsWith('00')) {
        sscc18 = digits.substring(2);
        providedCD = parseInt(sscc18[17]);
    } else if (digits.length === 18) {
        sscc18 = digits;
        providedCD = parseInt(sscc18[17]);
    } else if (digits.length === 17) {
        if (isTrivialSequence(digits)) return;
        const cd = getCD(digits);
        sscc18 = digits + cd;
        if (!isValidGS1Prefix(sscc18)) return;
        if (seen.has(sscc18)) return;
        seen.add(sscc18);
        const p = getPrefix(sscc18);
        found.push({
            sscc:       sscc18,
            formatted:  `(00)${sscc18}`,
            valid:      true,
            generated:  true,
            checkDigit: cd,
            gs1: { prefix: p.prefix, country: p.name, countryCode: p.code, flag: p.flag },
        });
        return;
    } else {
        return;
    }

    if (isTrivialSequence(sscc18))   return;
    if (!isValidGS1Prefix(sscc18))   return;
    if (seen.has(sscc18))            return;
    seen.add(sscc18);

    const expected = getCD(sscc18.substring(0, 17));
    const ok       = providedCD === expected;
    const p        = getPrefix(sscc18);

    found.push({
        sscc:       sscc18,
        formatted:  `(00)${sscc18}`,
        valid:      ok,
        generated:  false,
        checkDigit: { provided: providedCD, expected },
        gs1: { prefix: p.prefix, country: p.name, countryCode: p.code, flag: p.flag },
    });
}

function parseEDIFACT(text, found, seen) {
    let compSep = ':', elemSep = '+', segTerm = "'";
    const una = text.match(/^UNA(.{6})/);
    if (una) { compSep = una[1][0]; elemSep = una[1][1]; segTerm = una[1][5]; }
    const segments = text.replace(/\r?\n/g, '').split(segTerm).map(s => s.trim()).filter(Boolean);
    segments.forEach(seg => {
        const elements = seg.split(elemSep);
        const tag = elements[0];
        if (tag === 'GIN') {
            elements.slice(1).forEach(el => {
                const parts = el.split(compSep);
                if (parts[0] === 'BJ' && parts[1]) tryAddSSCC(parts[1], found, seen);
                else if (parts.length === 1)        tryAddSSCC(parts[0], found, seen);
            });
        }
        if (tag === 'RFF') {
            elements.slice(1).forEach(el => {
                const parts = el.split(compSep);
                if ((parts[0] === 'SI' || parts[0] === 'AAK') && parts[1]) tryAddSSCC(parts[1], found, seen);
            });
        }
        if (tag === 'PAC') {
            elements.slice(1).forEach(el => el.split(compSep).forEach(p => tryAddSSCC(p, found, seen)));
        }
    });
}

function parseXML(text, found, seen) {
    const knownTags = [
        'EXIDV', 'EXIDV2', 'VHILM_KU',                          // SAP IDoc
        'SSCC', 'NVE', 'GIN',                                   // GS1 / EDIFACT XML
        'ShipmentContainerId', 'ContainerId',
        'PackageId', 'PalletId', 'HandlingUnitId',              // logística genérica
    ];
    knownTags.forEach(tag => {
        const re = new RegExp(`<${tag}[^>]*>([^<]+)</${tag}>`, 'gi');
        let m;
        while ((m = re.exec(text)) !== null) tryAddSSCC(m[1].trim(), found, seen);
    });
    extractGeneric(text.replace(/<[^>]+>/g, ' '), found, seen);
}

function extractGeneric(text, found, seen) {
    let m;
    const reAI = /\(00\)(\d{18})/g;
    while ((m = reAI.exec(text)) !== null) tryAddSSCC(m[1], found, seen);
    const re20 = /(?<!\d)(00\d{18})/g;
    while ((m = re20.exec(text)) !== null) tryAddSSCC(m[1], found, seen);
    const re18 = /(?<!\d)(\d{18})(?!\d)/g;
    while ((m = re18.exec(text)) !== null) tryAddSSCC(m[1], found, seen);
}

function parseText(text) {
    const fmt   = detectFormat(text);
    const found = [];
    const seen  = new Set();

    switch (fmt) {
        case 'edifact': parseEDIFACT(text, found, seen); break;
        case 'xml':     parseXML(text, found, seen);     break;
        default:        extractGeneric(text, found, seen); break;
    }

    if (found.length === 0 && fmt !== 'generic') {
        extractGeneric(text, found, seen);
    }

    return { format: fmt, results: found };
}

function looksBinary(text) {
    const sample = text.slice(0, 1024);
    return sample.includes('\x00');
}

async function handleExtract(request) {
    // Validação preliminar via Content-Length (falsificável, mas filtra abuso óbvio).
    const declaredLen = parseInt(request.headers.get('content-length') || '0', 10);
    if (declaredLen > MAX_BODY_BYTES) {
        return error(`Payload too large: max ${MAX_BODY_BYTES} bytes`, 413);
    }

    let text;
    try {
        text = await request.text();
    } catch (_) {
        return error('Could not read request body');
    }

    // Revalidação após leitura — Content-Length pode mentir.
    if (text.length > MAX_BODY_BYTES) {
        return error(`Payload too large: max ${MAX_BODY_BYTES} bytes`, 413);
    }

    if (!text || !text.trim()) {
        return error('Empty body — send the file content as plain text in the request body');
    }

    if (looksBinary(text)) {
        return error('Binary content detected — send EDIFACT/XML/CSV/TXT as plain text', 415);
    }

    const { format, results } = parseText(text);
    const valid     = results.filter(r => r.valid && !r.generated).length;
    const invalid   = results.filter(r => !r.valid).length;
    const generated = results.filter(r => r.generated).length;

    return json({
        format,
        count:   results.length,
        summary: { valid, invalid, generated },
        items:   results,
    });
}

// ─── Router ──────────────────────────────────────────────────────────────────

export default {
    async fetch(request, env) {
        try {
            const url = new URL(request.url);

            if (request.method === 'OPTIONS') {
                return new Response(null, { status: 204, headers: CORS });
            }

            const rateLimited = await checkRateLimit(request, env);
            if (rateLimited) return rateLimited;

            // POST /extract — único endpoint POST.
            if (request.method === 'POST') {
                if (url.pathname === '/extract') return handleExtract(request);
                return error('Method not allowed. Use GET (or POST for /extract).', 405);
            }

            if (request.method !== 'GET') {
                return error('Method not allowed. Use GET (or POST for /extract).', 405);
            }

            switch (url.pathname) {
                case '/validate': return handleValidate(url);
                case '/generate': return handleGenerate(url);
                case '/range':    return handleRange(url);
                case '/prefix':   return handlePrefix(url);
                case '/health':   return handleHealth();
                case '/extract':  return error('Use POST /extract with file content in the request body', 405);
                default:
                    return json({
                        name:    'SSCC Pro Vision API',
                        version: '1.2.1',
                        docs:    'https://birth1mark.github.io/sscc-check/sscc-api-guide.html',
                        endpoints: {
                            validate: '/validate?sscc=356012345600000016',
                            generate: '/generate?body=35601234560000001',
                            range:    '/range?from=35601234560000001&to=35601234560000050',
                            prefix:   '/prefix?sscc=356012345600000016',
                            extract:  'POST /extract (body: EDIFACT, IDoc, XML, CSV or TXT content)',
                            health:   '/health',
                        },
                    });
            }
        } catch (err) {
            // Catch global — qualquer exceção devolve JSON com CORS em vez de página 500 da CF.
            return error('Internal server error', 500);
        }
    },
};
