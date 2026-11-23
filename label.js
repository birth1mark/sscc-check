/**
 * SSCC Pro Vision — GS1 Logistics Pallet Label, Dual 1D+2D QR & Quota Engine (v5.9.0)
 *
 * Implements:
 * 1. Dual-Symbology GS1 Logistics Labels:
 *    - 'dual':    1D GS1-128 (Code 128 Subset C/B + FNC1) + 2D QR Code (GS1 Digital Link URI)
 *    - 'gs1-128': Classic 1D GS1-128 linear barcode only
 *    - 'qr':      Modern 2D GS1 Digital Link QR Code only (GS1 Sunrise 2027)
 * 2. Pure vector ISO/IEC 18004 QR Code SVG generator + Code 128 SVG generator.
 * 3. Secondary upper GS1-128 barcode for AI (02) GTIN-14, AI (15) Expiry, AI (37) Count, AI (10) Batch/Lot.
 * 4. 100-Label Free Quota (tracked by GS1 Company Prefix GCP + Sender + Device + Cloudflare Labels API)
 *    and Pro API Key (sscc_pro_...) credit packs integration.
 */

// Configure your independent Cloudflare Worker URL here once deployed:
const LABELS_API_BASE_URL = 'https://sscc-labels.birth1mark.workers.dev';
const FREE_LABEL_LIMIT = 25;
const LOCAL_QUOTA_STORAGE_KEY = 'sscc_labels_quota_v1';
const PRO_API_KEY_STORAGE_KEY = 'sscc_pro_api_key_v1';
const DEVICE_ID_STORAGE_KEY   = 'sscc_device_fp_v1';

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
        format: 'a5',
        symbology: 'dual'
    };
}

function saveLabelDefaults(data) {
    try {
        localStorage.setItem(LABEL_DEFAULTS_KEY, JSON.stringify(data));
    } catch (e) {}
}

// ============================================================================
// 1. PURE-JS ISO/IEC 18004 QR CODE VECTOR ENGINE (GS1 DIGITAL LINK 2D)
// ============================================================================

const QR_VERSION_TABLE_M = [
    null,
    [26,  10, 1, 16, 0, 0,  []],
    [44,  16, 1, 28, 0, 0,  [6, 18]],
    [70,  26, 1, 44, 0, 0,  [6, 22]],
    [100, 18, 2, 32, 0, 0,  [6, 26]],
    [134, 24, 2, 43, 0, 0,  [6, 30]],
    [172, 16, 4, 27, 0, 0,  [6, 34]],
    [196, 18, 4, 31, 0, 0,  [6, 22, 38]],
    [242, 22, 2, 38, 2, 39, [6, 24, 42]],
    [292, 22, 3, 36, 2, 37, [6, 26, 46]],
    [346, 26, 4, 43, 1, 44, [6, 28, 50]]
];

const GF_EXP = new Uint8Array(512);
const GF_LOG = new Uint8Array(256);
(function initGaloisField() {
    let x = 1;
    for (let i = 0; i < 255; i++) {
        GF_EXP[i] = x;
        GF_LOG[x] = i;
        x <<= 1;
        if (x & 0x100) x ^= 0x11d;
    }
    for (let i = 255; i < 512; i++) {
        GF_EXP[i] = GF_EXP[i - 255];
    }
})();

function gfMul(a, b) {
    return (a === 0 || b === 0) ? 0 : GF_EXP[GF_LOG[a] + GF_LOG[b]];
}

function getGeneratorPoly(degree) {
    let poly = new Uint8Array([1]);
    for (let i = 0; i < degree; i++) {
        const next = new Uint8Array(poly.length + 1);
        const factor = GF_EXP[i];
        for (let j = 0; j < poly.length; j++) {
            next[j] ^= poly[j];
            next[j + 1] ^= gfMul(poly[j], factor);
        }
        poly = next;
    }
    return poly;
}

function computeReedSolomon(dataBytes, ecLen) {
    const gen = getGeneratorPoly(ecLen);
    const rem = new Uint8Array(ecLen);
    for (let i = 0; i < dataBytes.length; i++) {
        const factor = dataBytes[i] ^ rem[0];
        for (let j = 0; j < ecLen - 1; j++) {
            rem[j] = rem[j + 1] ^ gfMul(gen[j + 1], factor);
        }
        rem[ecLen - 1] = gfMul(gen[ecLen], factor);
    }
    return rem;
}

function encodeQRMatrix(text) {
    const utf8 = typeof TextEncoder !== 'undefined'
        ? new TextEncoder().encode(text)
        : Uint8Array.from(unescape(encodeURIComponent(text)), c => c.charCodeAt(0));
    const byteLen = utf8.length;

    let version = 1;
    while (version <= 10) {
        const vInfo = QR_VERSION_TABLE_M[version];
        const totalDataCodewords = vInfo[2] * vInfo[3] + vInfo[4] * vInfo[5];
        const headerBits = version < 10 ? 12 : 20;
        if (byteLen * 8 + headerBits <= totalDataCodewords * 8) break;
        version++;
    }
    if (version > 10) version = 10;

    const [, ecPerBlock, g1Blocks, g1DataLen, g2Blocks, g2DataLen, alignCenters] = QR_VERSION_TABLE_M[version];
    const totalDataCodewords = g1Blocks * g1DataLen + g2Blocks * g2DataLen;

    const bits = [];
    const pushBits = (val, len) => {
        for (let i = len - 1; i >= 0; i--) bits.push((val >> i) & 1);
    };

    pushBits(0b0100, 4);
    pushBits(byteLen, version < 10 ? 8 : 16);
    for (let i = 0; i < byteLen; i++) pushBits(utf8[i], 8);

    const maxBits = totalDataCodewords * 8;
    const termLen = Math.min(4, maxBits - bits.length);
    pushBits(0, termLen);
    while (bits.length % 8 !== 0) bits.push(0);

    const dataCodewords = new Uint8Array(totalDataCodewords);
    for (let i = 0; i < bits.length / 8; i++) {
        let b = 0;
        for (let j = 0; j < 8; j++) b = (b << 1) | bits[i * 8 + j];
        dataCodewords[i] = b;
    }
    let padToggle = true;
    for (let i = bits.length / 8; i < totalDataCodewords; i++) {
        dataCodewords[i] = padToggle ? 0xEC : 0x11;
        padToggle = !padToggle;
    }

    const dataBlocks = [];
    const ecBlocks = [];
    let offset = 0;
    for (let b = 0; b < g1Blocks; b++) {
        const slice = dataCodewords.slice(offset, offset + g1DataLen);
        offset += g1DataLen;
        dataBlocks.push(slice);
        ecBlocks.push(computeReedSolomon(slice, ecPerBlock));
    }
    for (let b = 0; b < g2Blocks; b++) {
        const slice = dataCodewords.slice(offset, offset + g2DataLen);
        offset += g2DataLen;
        dataBlocks.push(slice);
        ecBlocks.push(computeReedSolomon(slice, ecPerBlock));
    }

    const finalBytes = [];
    const maxDataBlockLen = Math.max(g1DataLen, g2DataLen);
    for (let i = 0; i < maxDataBlockLen; i++) {
        for (const blk of dataBlocks) {
            if (i < blk.length) finalBytes.push(blk[i]);
        }
    }
    for (let i = 0; i < ecPerBlock; i++) {
        for (const blk of ecBlocks) {
            finalBytes.push(blk[i]);
        }
    }

    const size = version * 4 + 17;
    const modules = Array.from({ length: size }, () => new Uint8Array(size));
    const isFunction = Array.from({ length: size }, () => new Uint8Array(size));

    const setFunctionModule = (r, c, dark) => {
        if (r < 0 || r >= size || c < 0 || c >= size) return;
        modules[r][c] = dark ? 1 : 0;
        isFunction[r][c] = 1;
    };

    const drawFinder = (row, col) => {
        for (let dr = -1; dr <= 7; dr++) {
            for (let dc = -1; dc <= 7; dc++) {
                const r = row + dr, c = col + dc;
                if (r < 0 || r >= size || c < 0 || c >= size) continue;
                const inOuter = (dr >= 0 && dr <= 6 && (dc === 0 || dc === 6)) || (dc >= 0 && dc <= 6 && (dr === 0 || dr === 6));
                const inInner = (dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4);
                setFunctionModule(r, c, inOuter || inInner);
            }
        }
    };
    drawFinder(0, 0);
    drawFinder(0, size - 7);
    drawFinder(size - 7, 0);

    for (let i = 8; i < size - 8; i++) {
        setFunctionModule(6, i, i % 2 === 0);
        setFunctionModule(i, 6, i % 2 === 0);
    }

    for (const r of alignCenters) {
        for (const c of alignCenters) {
            if ((r === 6 && c === 6) || (r === 6 && c === size - 7) || (r === size - 7 && c === 6)) continue;
            for (let dr = -2; dr <= 2; dr++) {
                for (let dc = -2; dc <= 2; dc++) {
                    const dark = Math.max(Math.abs(dr), Math.abs(dc)) !== 1;
                    setFunctionModule(r + dr, c + dc, dark);
                }
            }
        }
    }

    setFunctionModule(size - 8, 8, true);
    for (let i = 0; i < 9; i++) {
        if (i !== 6) {
            isFunction[8][i] = 1;
            isFunction[i][8] = 1;
        }
    }
    for (let i = 0; i < 8; i++) {
        isFunction[8][size - 1 - i] = 1;
        isFunction[size - 1 - i][8] = 1;
    }

    let bitIdx = 0;
    const totalBits = finalBytes.length * 8;
    for (let right = size - 1; right >= 1; right -= 2) {
        if (right === 6) right = 5;
        const upward = ((size - 1 - right) & 2) === 0;
        for (let vert = 0; vert < size; vert++) {
            const r = upward ? (size - 1 - vert) : vert;
            for (let j = 0; j < 2; j++) {
                const c = right - j;
                if (!isFunction[r][c]) {
                    let dark = false;
                    if (bitIdx < totalBits) {
                        dark = ((finalBytes[bitIdx >> 3] >> (7 - (bitIdx & 7))) & 1) !== 0;
                        bitIdx++;
                    }
                    if ((r + c) % 2 === 0) dark = !dark;
                    modules[r][c] = dark ? 1 : 0;
                }
            }
        }
    }

    const formatBits = 0x5412;
    const fBit = (b) => ((formatBits >> b) & 1) !== 0;
    const tlCols = [0, 1, 2, 3, 4, 5, 7, 8];
    for (let k = 0; k < 8; k++) setFunctionModule(8, tlCols[k], fBit(14 - k));
    const tlRows = [7, 5, 4, 3, 2, 1, 0];
    for (let k = 0; k < 7; k++) setFunctionModule(tlRows[k], 8, fBit(6 - k));
    for (let k = 0; k < 7; k++) setFunctionModule(size - 1 - k, 8, fBit(14 - k));
    for (let k = 0; k < 8; k++) setFunctionModule(8, size - 8 + k, fBit(7 - k));

    return { size, modules };
}

function generateGS1QRCodeSVG(text, pixelSize = 90) {
    const { size, modules } = encodeQRMatrix(text);
    const quiet = 2;
    const total = size + quiet * 2;
    let paths = '';
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            if (modules[r][c]) {
                paths += `M${c + quiet},${r + quiet}h1v1h-1z`;
            }
        }
    }
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${total} ${total}" width="${pixelSize}" height="${pixelSize}" shape-rendering="crispEdges" style="display:block;background:#ffffff;margin:0 auto;"><path d="${paths}" fill="#000000"/></svg>`;
}

function buildGS1DigitalLinkURI(s18, meta = {}) {
    const params = new URLSearchParams();
    params.set('sscc', s18);
    const gtin14 = normalizeToGTIN14(meta.gtin);
    const yymmdd = normalizeExpiryToYYMMDD(meta.expiryDate);
    const count  = String(meta.unitCount || '').replace(/\D/g, '').slice(0, 8);
    const batch  = String(meta.batchNo || '').trim().slice(0, 20);

    if (gtin14) params.set('02', gtin14);
    if (batch)  params.set('10', batch);
    if (yymmdd) params.set('15', yymmdd);
    if (count)  params.set('37', count);

    return `https://pormenores.net/sscc/?${params.toString()}`;
}

// ============================================================================
// 2. 1D GS1-128 BARCODE ENGINE
// ============================================================================

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

function generateGS1BarcodeSVG(sscc18, height = 75) {
    const clean = sscc18.replace(/\D/g, '');
    let s18 = clean;
    if (clean.length === 20 && clean.startsWith('00')) s18 = clean.substring(2);
    s18 = s18.padStart(18, '0');

    const fullDigits = '00' + s18;
    const values = [102]; // FNC1

    for (let i = 0; i < 20; i += 2) {
        values.push(parseInt(fullDigits.substring(i, i + 2), 10));
    }

    return renderCode128ValuesToSVG(105, values, height);
}

function normalizeExpiryToYYMMDD(rawExpiry) {
    const clean = String(rawExpiry || '').trim();
    if (!clean) return '';
    const iso = clean.match(/^(\d{4})[-/](\d{2})[-/](\d{2})$/);
    if (iso) return iso[1].slice(2) + iso[2] + iso[3];
    const digits = clean.replace(/\D/g, '');
    if (digits.length === 8) return digits.slice(2);
    if (digits.length === 6) return digits;
    return '';
}

function normalizeToGTIN14(rawGtin) {
    const digits = String(rawGtin || '').replace(/\D/g, '');
    if (!digits) return '';
    if (digits.length === 14) return digits;
    if (digits.length === 13 || digits.length === 12 || digits.length === 8) {
        return digits.padStart(14, '0');
    }
    return '';
}

function buildSecondaryGS1Barcode(meta, height = 52) {
    const gtin14     = normalizeToGTIN14(meta.gtin);
    const yymmdd     = normalizeExpiryToYYMMDD(meta.expiryDate);
    const countStr   = String(meta.unitCount || '').replace(/\D/g, '').slice(0, 8);
    const batchClean = String(meta.batchNo || '').trim().toUpperCase().replace(/[^\x21-\x5F]/g, '').slice(0, 20);

    if (!gtin14 && !yymmdd && !countStr && !batchClean) {
        return null;
    }

    const hriParts = [];
    let fixedNumericPrefix = '';

    if (gtin14) {
        fixedNumericPrefix += '02' + gtin14;
        hriParts.push(`(02) ${gtin14}`);
    }
    if (yymmdd) {
        fixedNumericPrefix += '15' + yymmdd;
        hriParts.push(`(15) ${yymmdd}`);
    }

    const values = [102];
    let currentSubset = 'C';

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
                values.push(100);
                currentSubset = 'B';
            }
            for (const ch of ai37Full) values.push(ch.charCodeAt(0) - 32);
        }
        zplData += ai37Full;
        if (batchClean) {
            values.push(102);
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
                values.push(100);
                currentSubset = 'B';
            }
            for (const ch of ai10Full) values.push(ch.charCodeAt(0) - 32);
        }
        zplData += (currentSubset === 'B' ? '>6' : '') + ai10Full;
    }

    return {
        hri: hriParts.join('  '),
        svg: renderCode128ValuesToSVG(105, values, height),
        zplData
    };
}

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
 * Generates industrial Zebra ZPL-II code for a single 4x6" thermal pallet label (supports Dual 1D+QR, 1D only, or QR only).
 */
function generateGS1ZPL(sscc18, meta, indexInfo = '') {
    const clean = sscc18.replace(/\D/g, '');
    const s18 = (clean.length === 20 && clean.startsWith('00') ? clean.substring(2) : clean).padStart(18, '0');
    const hri = formatDynamicSSCCHRI(s18);
    const symbology = (meta.symbology || 'dual').toLowerCase();
    const digitalLink = buildGS1DigitalLinkURI(s18, meta);

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

    const palletTagZPL = indexInfo ? `^FO520,62^A0N,22,22^FD${indexInfo.toUpperCase()}^FS` : '';
    const secondary = buildSecondaryGS1Barcode(meta, 50);

    if (symbology === 'qr') {
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
^FO40,380^GB732,0,4^FS
^FO60,415^A0N,28,28^FDGS1 DIGITAL LINK (2D SSCC):^FS
^FO60,455^A0N,36,36^FD${hri}^FS
^FO260,520^BQN,2,8^FDQA,${digitalLink}^FS
^FO60,920^A0N,18,18^FD${digitalLink}^FS
^XZ`;
    }

    const qrBlockZPL = (symbology === 'dual')
        ? `^FO575,168^BQN,2,4^FDQA,${digitalLink}^FS\n^FO570,350^A0N,16,16^FDGS1 2D DIGITAL LINK^FS`
        : '';

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
${qrBlockZPL}
^FO40,265^GB510,0,2^FS
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
^FO40,165^GB732,0,2^FS
^FO60,185^A0N,24,24^FDCONSIGNEE / TO:^FS
^FO60,218^A0N,28,28^FD${recipient}^FS
${qrBlockZPL}
^FO40,295^GB510,0,2^FS
^FO60,315^A0N,22,22^FDCONTENTS: ${contents}^FS
^FO60,348^A0N,22,22^FD${extraInfo || `DOC REF: ${orderNo}`}^FS
^FO60,380^A0N,20,20^FDDATE: ${today}   |   DOC: ${orderNo}^FS
^FO40,425^GB732,0,4^FS
^FO60,455^A0N,30,30^FDSSCC (SERIAL SHIPPING CONTAINER CODE):^FS
^FO60,500^A0N,38,38^FD${hri}^FS
^FO65,565^BY3,3,210^BCN,210,N,N,N,D^FD>8>500${s18}^FS
^XZ`;
}

// ============================================================================
// 3. QUOTA (100 FREE LABELS) & PRO API KEY CLIENT ENGINE
// ============================================================================

function getDeviceId() {
    try {
        let id = localStorage.getItem(DEVICE_ID_STORAGE_KEY);
        if (!id) {
            id = 'dev_' + Math.random().toString(36).slice(2, 12) + Date.now().toString(36);
            localStorage.setItem(DEVICE_ID_STORAGE_KEY, id);
        }
        return id;
    } catch (_) {
        return 'dev_default';
    }
}

function getStoredProApiKey() {
    try {
        return (localStorage.getItem(PRO_API_KEY_STORAGE_KEY) || '').trim();
    } catch (_) {
        return '';
    }
}

function setStoredProApiKey(key) {
    try {
        if (key) localStorage.setItem(PRO_API_KEY_STORAGE_KEY, key.trim());
        else localStorage.removeItem(PRO_API_KEY_STORAGE_KEY);
    } catch (_) {}
}

function getLocalQuotaStore() {
    try {
        const raw = localStorage.getItem(LOCAL_QUOTA_STORAGE_KEY);
        if (raw) return JSON.parse(raw);
    } catch (_) {}
    return { deviceUsed: 0, byGcp: {}, bySender: {}, proRemaining: null, proLimit: null };
}

function saveLocalQuotaStore(q) {
    try {
        localStorage.setItem(LOCAL_QUOTA_STORAGE_KEY, JSON.stringify(q));
    } catch (_) {}
}

function getEffectiveLocalUsed(gcp, sender) {
    const q = getLocalQuotaStore();
    const gcpKey = String(gcp || '').replace(/\D/g, '').slice(0, 7);
    const senderKey = String(sender || '').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 24);
    let maxUsed = q.deviceUsed || 0;
    if (gcpKey && q.byGcp[gcpKey] > maxUsed) maxUsed = q.byGcp[gcpKey];
    if (senderKey && senderKey !== 'logisticsdispatchservicesltd' && q.bySender[senderKey] > maxUsed) {
        maxUsed = q.bySender[senderKey];
    }
    return maxUsed;
}

function recordLocalUsage(count, gcp, sender) {
    const q = getLocalQuotaStore();
    const gcpKey = String(gcp || '').replace(/\D/g, '').slice(0, 7);
    const senderKey = String(sender || '').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 24);
    const current = getEffectiveLocalUsed(gcp, sender);
    const nextVal = current + count;
    q.deviceUsed = Math.max(q.deviceUsed || 0, nextVal);
    if (gcpKey) q.byGcp[gcpKey] = Math.max(q.byGcp[gcpKey] || 0, nextVal);
    if (senderKey && senderKey !== 'logisticsdispatchservicesltd') {
        q.bySender[senderKey] = Math.max(q.bySender[senderKey] || 0, nextVal);
    }
    saveLocalQuotaStore(q);
    updateQuotaUI();
}

function updateQuotaUI(remoteQuota = null) {
    const badgeEl = document.getElementById('quota-status-pill');
    if (!badgeEl) return;

    const proKey = getStoredProApiKey();
    const gcp = document.getElementById('batch-gcp')?.value || (currentLabelSSCC ? currentLabelSSCC.substring(1, 8) : '5601234');
    const sender = document.getElementById('lbl-sender')?.value || '';

    if (remoteQuota && remoteQuota.tier && remoteQuota.tier !== 'free') {
        badgeEl.className = 'quota-pill quota-pro';
        badgeEl.innerHTML = `⚡ Pro Active: <strong>${remoteQuota.remaining.toLocaleString()}</strong> / ${remoteQuota.limit.toLocaleString()} credits`;
        return;
    }

    if (proKey) {
        const q = getLocalQuotaStore();
        const remText = q.proRemaining !== null ? `${q.proRemaining.toLocaleString()} credits left` : `Key ${proKey.slice(0, 13)}…`;
        badgeEl.className = 'quota-pill quota-pro';
        badgeEl.innerHTML = `⚡ Pro Key Active (${remText})`;
        return;
    }

    const used = remoteQuota ? remoteQuota.used : getEffectiveLocalUsed(gcp, sender);
    const rem = Math.max(0, FREE_LABEL_LIMIT - used);

    if (rem === 0) {
        badgeEl.className = 'quota-pill quota-exhausted';
        badgeEl.innerHTML = `🔒 Free Quota: <strong>0 / ${FREE_LABEL_LIMIT}</strong> labels left — <u>Unlock Pro</u>`;
    } else if (rem <= 10) {
        badgeEl.className = 'quota-pill quota-warn';
        badgeEl.innerHTML = `⚠️ Free Quota: <strong>${rem} / ${FREE_LABEL_LIMIT}</strong> labels remaining`;
    } else {
        badgeEl.className = 'quota-pill quota-ok';
        badgeEl.innerHTML = `🟢 Free Quota: <strong>${rem} / ${FREE_LABEL_LIMIT}</strong> labels remaining`;
    }
}

/**
 * Verifies & deducts `count` labels against the Cloudflare Labels API (with instant local 4-layer fallback).
 */
async function authorizeLabelDispatch(ssccs, meta) {
    const count = ssccs.length;
    const gcp = ssccs[0] ? ssccs[0].substring(1, 8) : '5601234';
    const proKey = getStoredProApiKey();

    // 1. Try remote Cloudflare Labels Worker API first
    try {
        const headers = {
            'Content-Type': 'application/json',
            'X-Device-ID': getDeviceId()
        };
        if (proKey) headers['X-API-Key'] = proKey;

        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), 3500);
        const res = await fetch(`${LABELS_API_BASE_URL}/v1/labels`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                ssccs,
                sender: meta.sender,
                recipient: meta.recipient,
                contents: meta.contents,
                weight: meta.weight,
                orderNo: meta.orderNo,
                gtin: meta.gtin,
                unitCount: meta.unitCount,
                batchNo: meta.batchNo,
                expiryDate: meta.expiryDate,
                symbology: meta.symbology,
                paperSize: meta.format,
                format: 'json'
            }),
            signal: ctrl.signal
        });
        clearTimeout(timer);

        const data = await res.json();
        if (res.status === 402 || res.status === 401 || res.status === 403) {
            updateQuotaUI(data.quota);
            openProUpgradeModal(data.error, data.quota);
            return false;
        }
        if (res.ok && data.quota) {
            if (!proKey) recordLocalUsage(count, gcp, meta.sender);
            else {
                const q = getLocalQuotaStore();
                q.proRemaining = data.quota.remaining;
                q.proLimit = data.quota.limit;
                saveLocalQuotaStore(q);
            }
            updateQuotaUI(data.quota);
            return true;
        }
    } catch (_) {
        // Worker not reachable or offline mode: enforce local 4-Layer quota
    }

    // 2. Local 4-Layer Quota Enforcement (GCP + Sender + Device)
    if (proKey && proKey.startsWith('sscc_pro_') && proKey.length >= 20) {
        updateQuotaUI();
        return true;
    }

    const used = getEffectiveLocalUsed(gcp, meta.sender);
    if (used + count > FREE_LABEL_LIMIT) {
        const rem = Math.max(0, FREE_LABEL_LIMIT - used);
        const msg = rem === 0
            ? `Free limit of ${FREE_LABEL_LIMIT} GS1 pallet labels reached for GS1 Company Prefix (${gcp}). Unlock a Pro Key to print unlimited labels.`
            : `This batch requires ${count} labels, but only ${rem} of your ${FREE_LABEL_LIMIT} free labels remain for GS1 Prefix (${gcp}).`;
        openProUpgradeModal(msg, { used, limit: FREE_LABEL_LIMIT, remaining: rem });
        return false;
    }

    recordLocalUsage(count, gcp, meta.sender);
    return true;
}

function openProUpgradeModal(reasonMsg = '', quotaInfo = null) {
    const modal = document.getElementById('pro-upgrade-modal-backdrop');
    if (!modal) return;

    const alertBox = document.getElementById('pro-modal-reason');
    if (alertBox) {
        if (reasonMsg) {
            alertBox.style.display = 'block';
            alertBox.textContent = reasonMsg;
        } else {
            alertBox.style.display = 'none';
        }
    }

    const keyInput = document.getElementById('pro-api-key-input');
    if (keyInput) keyInput.value = getStoredProApiKey();

    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    if (window.lucide) lucide.createIcons();
}

function closeProUpgradeModal() {
    const modal = document.getElementById('pro-upgrade-modal-backdrop');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
}

function saveProApiKeyFromModal() {
    const input = document.getElementById('pro-api-key-input');
    const val = (input ? input.value : '').trim();
    if (!val) {
        setStoredProApiKey('');
        updateQuotaUI();
        closeProUpgradeModal();
        if (typeof showToast === 'function') showToast('Pro API Key removed. Using Free Tier quota.');
        return;
    }
    if (!val.startsWith('sscc_pro_') || val.length < 16) {
        alert('Invalid Pro Key format. Keys start with "sscc_pro_".');
        return;
    }
    setStoredProApiKey(val);
    updateQuotaUI();
    closeProUpgradeModal();
    if (typeof showToast === 'function') {
        showToast('⚡ Pro API Key activated! Unlimited batch labels unlocked.', 'success');
    }
}

/**
 * Automatically claims & activates a newly purchased Pro API Key when returning from Stripe Checkout
 * (?session_id=cs_live_... or ?stripe_session=...).
 */
async function checkStripeCheckoutClaim() {
    try {
        const params = new URLSearchParams(window.location.search);
        const sessionId = params.get('session_id') || params.get('stripe_session');
        if (!sessionId) return;

        if (typeof switchWorkspaceTab === 'function') switchWorkspaceTab('labels');
        if (typeof showToast === 'function') showToast('Verifying Stripe payment & provisioning Pro Key…');

        // Poll up to 3 times in case webhook takes 1-2 seconds
        for (let attempt = 0; attempt < 3; attempt++) {
            const res = await fetch(`${LABELS_API_BASE_URL}/v1/claim?session_id=${encodeURIComponent(sessionId)}`);
            if (res.ok) {
                const data = await res.json();
                if (data.apiKey) {
                    setStoredProApiKey(data.apiKey);
                    const q = getLocalQuotaStore();
                    q.proRemaining = data.creditsRemaining;
                    q.proLimit = data.creditsLimit;
                    saveLocalQuotaStore(q);
                    updateQuotaUI({ tier: data.plan || 'pro', limit: data.creditsLimit, remaining: data.creditsRemaining });

                    openProUpgradeModal();
                    const reasonBox = document.getElementById('pro-modal-reason');
                    if (reasonBox) {
                        reasonBox.style.display = 'block';
                        reasonBox.style.background = 'rgba(16,185,129,0.14)';
                        reasonBox.style.borderColor = 'var(--success)';
                        reasonBox.style.color = 'var(--success)';
                        reasonBox.innerHTML = `🎉 <strong>Payment Confirmed!</strong> Your Pro API Key (<strong>${data.creditsLimit.toLocaleString()} credits</strong>) has been activated automatically. Copy and save your key below:`;
                    }
                    history.replaceState(null, null, window.location.pathname + '#labels');
                    return;
                }
            }
            await new Promise(r => setTimeout(r, 1400));
        }
    } catch (_) {}
}

// ============================================================================
// 4. STUDIO STATE & UI CONTROLLERS
// ============================================================================

let labelStudioInitialized = false;
let labelSourceMode = 'sequential';
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
        updateQuotaUI();
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
    updateQuotaUI();
}

function setLabelSymbology(sym) {
    const select = document.getElementById('lbl-symbology');
    if (select) select.value = sym;
    document.querySelectorAll('.sym-pill').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-sym') === sym);
    });
    updateLabelPreview();
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
    updateQuotaUI();
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
    if (document.getElementById('lbl-symbology')) document.getElementById('lbl-symbology').value = d.symbology || 'dual';
    document.querySelectorAll('.sym-pill').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-sym') === (d.symbology || 'dual'));
    });
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
        format: document.getElementById('lbl-format')?.value || 'a5',
        symbology: document.getElementById('lbl-symbology')?.value || 'dual'
    };
    saveLabelDefaults(data);
    return data;
}

/**
 * Builds HTML markup for a single GS1 physical pallet label sheet (supports Dual 1D+2D QR, 1D Only, and 2D QR Only).
 */
function buildLabelSheetHTML(s18, meta, indexInfo = '') {
    const symbology = (meta.symbology || 'dual').toLowerCase();
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
    const digitalLink  = buildGS1DigitalLinkURI(s18, meta);
    const barcode1dSvg = (symbology === 'dual' || symbology === 'gs1-128') ? generateGS1BarcodeSVG(s18, 70) : '';
    const qr2dSvg      = (symbology === 'dual' || symbology === 'qr') ? generateGS1QRCodeSVG(digitalLink, symbology === 'qr' ? 136 : 84) : '';
    const secondary    = (symbology !== 'qr') ? buildSecondaryGS1Barcode(meta, 52) : null;

    const secondarySectionHtml = secondary ? `
        <div class="lbl-row lbl-sscc-section" style="border-bottom:2px solid #000000;padding:8px 0 6px;">
            <span class="lbl-field-tag" style="text-align:left;margin-bottom:2px;">GS1-128 TRADE ITEM &amp; BATCH IDENTIFIERS</span>
            <div class="lbl-sscc-hri" style="font-size:12px;margin-bottom:5px;">${escapeHtml(secondary.hri)}</div>
            <div class="lbl-barcode-wrap">
                ${secondary.svg}
            </div>
        </div>` : '';

    const destAndQrRowHtml = (symbology === 'dual') ? `
        <div class="lbl-row lbl-dest-row" style="align-items:center;">
            <div class="lbl-col" style="flex:1;min-width:0;">
                <span class="lbl-field-tag">CONSIGNEE / TO</span>
                <div class="lbl-company">${escapeHtml(recipient)}</div>
                <div class="lbl-subtext">Central Distribution Hub</div>
            </div>
            <div class="lbl-col" style="flex-shrink:0;text-align:center;border-left:1.5px solid #000000;padding-left:10px;">
                ${qr2dSvg}
                <span style="display:block;font-size:7.5px;font-weight:800;letter-spacing:0.04em;margin-top:2px;color:#000000;">GS1 2D DIGITAL LINK</span>
            </div>
        </div>` : `
        <div class="lbl-row lbl-dest-row">
            <div class="lbl-col" style="width:100%;">
                <span class="lbl-field-tag">CONSIGNEE / TO</span>
                <div class="lbl-company">${escapeHtml(recipient)}</div>
                <div class="lbl-subtext">Central Distribution Hub</div>
            </div>
        </div>`;

    const bottomSectionHtml = (symbology === 'qr') ? `
        <div class="lbl-row lbl-sscc-section">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
                <span class="lbl-sscc-title">SSCC — GS1 2D DIGITAL LINK (SUNRISE 2027)</span>
                ${indexInfo ? `<span class="lbl-pallet-tag">${indexInfo.toUpperCase()}</span>` : ''}
            </div>
            <div class="lbl-sscc-hri">${hriFormatted}</div>
            <div class="lbl-barcode-wrap" style="flex-direction:column;align-items:center;gap:4px;">
                ${qr2dSvg}
                <span style="font-size:9px;font-family:monospace;color:#333333;word-break:break-all;">${escapeHtml(digitalLink)}</span>
            </div>
        </div>` : `
        <div class="lbl-row lbl-sscc-section">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
                <span class="lbl-sscc-title">SSCC (SERIAL SHIPPING CONTAINER CODE)</span>
                ${indexInfo ? `<span class="lbl-pallet-tag">${indexInfo.toUpperCase()}</span>` : ''}
            </div>
            <div class="lbl-sscc-hri">${hriFormatted}</div>
            <div class="lbl-barcode-wrap">
                ${barcode1dSvg}
            </div>
        </div>`;

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

        ${destAndQrRowHtml}

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
        ${bottomSectionHtml}
    </div>`;
}

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

async function printGS1Label() {
    const meta = persistCurrentFormValues();
    const isBatch = currentBatchSSCCs.length > 1;
    const targets = isBatch ? currentBatchSSCCs : [currentLabelSSCC];

    const authorized = await authorizeLabelDispatch(targets, meta);
    if (!authorized) return;

    let printArea = document.getElementById('print-batch-container');
    if (!printArea) {
        printArea = document.createElement('div');
        printArea.id = 'print-batch-container';
        printArea.className = 'print-only-container';
        document.body.appendChild(printArea);
    }

    let allHtml = '';
    targets.forEach((sscc, idx) => {
        const info = isBatch ? `Pallet ${idx + 1} of ${targets.length}` : '';
        allHtml += buildLabelSheetHTML(sscc, meta, info);
    });

    printArea.innerHTML = allHtml;
    updateStoredLastSerialOnDispatch();
    window.print();
}

async function downloadGS1ZPL() {
    if (!currentBatchSSCCs.length) return;
    const meta = persistCurrentFormValues();
    const isBatch = currentBatchSSCCs.length > 1;

    const authorized = await authorizeLabelDispatch(currentBatchSSCCs, meta);
    if (!authorized) return;

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
