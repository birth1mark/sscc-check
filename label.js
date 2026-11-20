/**
 * SSCC Pro Vision — GS1 Logistics Label & Barcode Engine (v5.6.0)
 *
 * Implements:
 * 1. Pure vector GS1-128 (Code 128 Subset C with FNC1) SVG generator.
 * 2. GS1 Logistics Pallet Label layouts (A5, A6 compact, and 4x6" industrial thermal).
 * 3. Single and Batch ZPL (Zebra Programming Language) export for industrial printers.
 * 4. Multi-page native print support (one label per sheet/thermal roll).
 * 5. Local storage persistence for company metadata and preferences.
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
        sender: 'EMPRESA REMETENTE LDA',
        recipient: 'CENTRO DE DISTRIBUIÇÃO LOGÍSTICA',
        contents: 'EURO PALETE (CARGA MISTA)',
        weight: '420 KG',
        orderNo: 'ENC-2026/994',
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
 * Generates an optimized, standard GS1-128 SVG barcode for an SSCC.
 * Encodes AI (00) followed by 18 SSCC digits using Code 128 Subset C + FNC1.
 */
function generateGS1BarcodeSVG(sscc18, height = 75) {
    const clean = sscc18.replace(/\D/g, '');
    let s18 = clean;
    if (clean.length === 20 && clean.startsWith('00')) s18 = clean.substring(2);
    s18 = s18.padStart(18, '0');

    // GS1-128 format: (00) + 18 digits = 20 numeric characters total
    const fullDigits = '00' + s18;
    const values = [102]; // FNC1 designates GS1 standard

    for (let i = 0; i < 20; i += 2) {
        values.push(parseInt(fullDigits.substring(i, i + 2), 10));
    }

    // Checksum: Start C (105) + sum(value * position)
    let checksum = 105;
    for (let idx = 0; idx < values.length; idx++) {
        checksum += values[idx] * (idx + 1);
    }
    checksum = checksum % 103;

    const allCodes = [105, ...values, checksum, 106];

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
 * Generates industrial Zebra ZPL code for a single 4x6" thermal pallet label.
 */
function generateGS1ZPL(sscc18, meta) {
    const clean = sscc18.replace(/\D/g, '');
    const s18 = (clean.length === 20 && clean.startsWith('00') ? clean.substring(2) : clean).padStart(18, '0');
    const hri = `(00) ${s18[0]} ${s18.substring(1, 8)} ${s18.substring(8, 17)} ${s18[17]}`;

    const sender = (meta.sender || 'EXPEDIDOR').toUpperCase().replace(/[\^~]/g, '');
    const recipient = (meta.recipient || 'DESTINATARIO').toUpperCase().replace(/[\^~]/g, '');
    const contents = (meta.contents || 'EURO PALETE').toUpperCase().replace(/[\^~]/g, '');
    const weight = (meta.weight || '').toUpperCase().replace(/[\^~]/g, '');
    const orderNo = (meta.orderNo || '').toUpperCase().replace(/[\^~]/g, '');
    const batchNo = (meta.batchNo || '').toUpperCase().replace(/[\^~]/g, '');
    const expiry = (meta.expiryDate || '').toUpperCase().replace(/[\^~]/g, '');
    const today = new Date().toISOString().slice(0, 10);

    let extraInfo = '';
    if (batchNo) extraInfo += `LOTE: ${batchNo}  `;
    if (expiry) extraInfo += `VAL: ${expiry}  `;
    if (weight) extraInfo += `PESO: ${weight}`;

    return `^XA
^PW812
^LL1218
^FO40,40^GB732,1138,4^FS
^FO60,65^A0N,24,24^FDEXPEDIDOR / FROM:^FS
^FO60,98^A0N,28,28^FD${sender}^FS
^FO40,175^GB732,0,2^FS
^FO60,195^A0N,24,24^FDDESTINATARIO / TO:^FS
^FO60,228^A0N,28,28^FD${recipient}^FS
^FO40,305^GB732,0,2^FS
^FO60,325^A0N,22,22^FDCONTEUDO: ${contents}^FS
^FO60,358^A0N,22,22^FD${extraInfo || `REF/DOC: ${orderNo}`}^FS
^FO60,390^A0N,20,20^FDDATA: ${today}   |   DOC: ${orderNo}^FS
^FO40,430^GB732,0,4^FS
^FO60,460^A0N,30,30^FDSSCC (SERIAL SHIPPING CONTAINER CODE):^FS
^FO60,505^A0N,38,38^FD${hri}^FS
^FO65,570^BY3,3,210^BCN,210,N,N,N,D^FD>8>500${s18}^FS
^XZ`;
}

// State
let currentLabelSSCC = '';
let currentBatchSSCCs = [];
let currentBatchIndex = 0;

/**
 * Opens modal for a single SSCC.
 */
function openLabelModal(rawSSCC) {
    const clean = rawSSCC.replace(/\D/g, '');
    let s18 = clean;
    if (clean.length === 20 && clean.startsWith('00')) s18 = clean.substring(2);
    if (clean.length === 17 && typeof getCD === 'function') s18 = clean + getCD(clean);

    if (s18.length !== 18) {
        alert('SSCC inválido para geração de etiqueta (requer 18 dígitos).');
        return;
    }

    currentLabelSSCC = s18;
    currentBatchSSCCs = [s18];
    currentBatchIndex = 0;

    ensureLabelModalExists();
    loadStoredFormDefaults();
    updateLabelPreview();

    const modal = document.getElementById('label-modal-backdrop');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

/**
 * Opens modal for all valid/generated SSCCs in the active store (batch mode).
 */
function openBatchLabelsModal() {
    if (!window.store || !window.store.length) {
        alert('Nenhum código para gerar etiquetas.');
        return;
    }

    const valids = window.store
        .filter(item => (item.status === 'valid' || item.status === 'gen') && item.plain)
        .map(item => item.plain);

    if (!valids.length) {
        alert('Não existem SSCCs válidos no lote atual.');
        return;
    }

    currentBatchSSCCs = valids;
    currentBatchIndex = 0;
    currentLabelSSCC = valids[0];

    ensureLabelModalExists();
    loadStoredFormDefaults();
    updateLabelPreview();

    const modal = document.getElementById('label-modal-backdrop');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
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

function closeLabelModal() {
    const modal = document.getElementById('label-modal-backdrop');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
}

function loadStoredFormDefaults() {
    const d = getLabelDefaults();
    if (document.getElementById('lbl-sender')) document.getElementById('lbl-sender').value = d.sender || '';
    if (document.getElementById('lbl-recipient')) document.getElementById('lbl-recipient').value = d.recipient || '';
    if (document.getElementById('lbl-contents')) document.getElementById('lbl-contents').value = d.contents || '';
    if (document.getElementById('lbl-weight')) document.getElementById('lbl-weight').value = d.weight || '';
    if (document.getElementById('lbl-order')) document.getElementById('lbl-order').value = d.orderNo || '';
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
        batchNo: document.getElementById('lbl-batch')?.value || '',
        expiryDate: document.getElementById('lbl-expiry')?.value || '',
        format: document.getElementById('lbl-format')?.value || 'a5'
    };
    saveLabelDefaults(data);
    return data;
}

/**
 * Builds HTML markup for a single label sheet.
 */
function buildLabelSheetHTML(s18, meta, indexInfo = '') {
    const sender = meta.sender || 'EMPRESA REMETENTE LDA';
    const recipient = meta.recipient || 'CENTRO DE DISTRIBUIÇÃO LOGÍSTICA';
    const contents = meta.contents || 'EURO PALETE (CARGA MISTA)';
    const weight = meta.weight || '420 KG';
    const orderNo = meta.orderNo || 'ENC-2026/994';
    const batchNo = meta.batchNo || '';
    const expiry = meta.expiryDate || '';
    const today = new Date().toISOString().slice(0, 10);

    const ext = s18[0];
    const prefix = s18.substring(1, 8);
    const serial = s18.substring(8, 17);
    const cd = s18[17];
    const hriFormatted = `(00) ${ext} ${prefix} ${serial} ${cd}`;

    const barcodeSvg = generateGS1BarcodeSVG(s18, 70);

    return `
    <div class="gs1-label-sheet format-${meta.format || 'a5'}">
        <div class="lbl-row lbl-header-row">
            <div class="lbl-col lbl-sender-col">
                <span class="lbl-field-tag">EXPEDIDOR / FROM</span>
                <div class="lbl-company">${escapeHtml(sender)}</div>
                <div class="lbl-subtext">Logistics Dispatch Center</div>
            </div>
            <div class="lbl-col lbl-carrier-col">
                <span class="lbl-field-tag">DATA / DATE</span>
                <div class="lbl-meta-value">${today}</div>
                <span class="lbl-field-tag" style="margin-top:4px;">ORDEM / DOC</span>
                <div class="lbl-meta-value">${escapeHtml(orderNo)}</div>
            </div>
        </div>

        <div class="lbl-row lbl-dest-row">
            <div class="lbl-col" style="width:100%;">
                <span class="lbl-field-tag">DESTINATÁRIO / TO</span>
                <div class="lbl-company">${escapeHtml(recipient)}</div>
                <div class="lbl-subtext">Plataforma Logística Central</div>
            </div>
        </div>

        <div class="lbl-row lbl-cargo-row">
            <div class="lbl-col" style="width:55%;">
                <span class="lbl-field-tag">CONTEÚDO / CONTENTS</span>
                <div class="lbl-meta-value">${escapeHtml(contents)}</div>
            </div>
            <div class="lbl-col" style="width:45%; text-align:right;">
                <span class="lbl-field-tag">PESO / LOTE</span>
                <div class="lbl-meta-value">${escapeHtml(weight)}${batchNo ? ' | Lote: ' + escapeHtml(batchNo) : ''}</div>
                ${expiry ? `<div class="lbl-subtext" style="font-weight:700;color:#000;">Val: ${escapeHtml(expiry)}</div>` : ''}
            </div>
        </div>

        <div class="lbl-row lbl-sscc-section">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
                <span class="lbl-sscc-title">SSCC (SERIAL SHIPPING CONTAINER CODE)</span>
                ${indexInfo ? `<span style="font-size:9px;font-weight:700;color:#666;">${indexInfo}</span>` : ''}
            </div>
            <div class="lbl-sscc-hri">${hriFormatted}</div>
            <div class="lbl-barcode-wrap">
                ${barcodeSvg}
            </div>
        </div>
    </div>`;
}

/**
 * Updates live label preview in modal.
 */
function updateLabelPreview() {
    if (!currentLabelSSCC) return;

    const meta = persistCurrentFormValues();
    const isBatch = currentBatchSSCCs.length > 1;
    const indexInfo = isBatch ? `Palete ${currentBatchIndex + 1} de ${currentBatchSSCCs.length}` : '';

    const previewContainer = document.getElementById('lbl-preview-box');
    if (previewContainer) {
        previewContainer.innerHTML = buildLabelSheetHTML(currentLabelSSCC, meta, indexInfo);
    }

    const batchNav = document.getElementById('lbl-batch-nav');
    if (batchNav) {
        if (isBatch) {
            batchNav.style.display = 'flex';
            const counter = document.getElementById('lbl-batch-counter');
            if (counter) counter.textContent = `Palete ${currentBatchIndex + 1} de ${currentBatchSSCCs.length}`;
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
        printBtnText.textContent = isBatch ? `IMPRIMIR LOTE (${currentBatchSSCCs.length} PALETES)` : `IMPRIMIR (A5 / 4x6")`;
    }

    const zplBtnText = document.getElementById('lbl-zpl-btn-text');
    if (zplBtnText) {
        zplBtnText.textContent = isBatch ? `EXPORTAR ZPL (${currentBatchSSCCs.length})` : `EXPORTAR ZPL`;
    }
}

/**
 * Prepares print area with all batch sheets and triggers window.print().
 */
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
        const info = isBatch ? `${idx + 1} / ${targets.length}` : '';
        allHtml += buildLabelSheetHTML(sscc, meta, info);
    });

    printArea.innerHTML = allHtml;
    window.print();
}

/**
 * Downloads a single or batch ZPL file.
 */
function downloadGS1ZPL() {
    if (!currentBatchSSCCs.length) return;
    const meta = persistCurrentFormValues();
    const isBatch = currentBatchSSCCs.length > 1;

    let zplOutput = '';
    currentBatchSSCCs.forEach(sscc => {
        zplOutput += generateGS1ZPL(sscc, meta) + '\n';
    });

    const blob = new Blob([zplOutput], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = isBatch 
        ? `etiquetas_lote_gs1_${currentBatchSSCCs.length}paletes.zpl`
        : `etiqueta_sscc_${currentLabelSSCC}.zpl`;
    a.click();
    URL.revokeObjectURL(url);
}

function escapeHtml(str) {
    return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/**
 * Injects modal HTML into DOM.
 */
function ensureLabelModalExists() {
    if (document.getElementById('label-modal-backdrop')) return;

    const modalHtml = `
    <div id="label-modal-backdrop" class="label-modal-backdrop" style="display:none;" onclick="if(event.target===this)closeLabelModal()">
        <div class="label-modal">
            <div class="label-modal-header">
                <div class="label-modal-title">
                    <i data-lucide="tag" style="width:16px;height:16px;color:var(--primary);"></i>
                    <span>Etiqueta Logística GS1</span>
                </div>
                <button class="label-modal-close" onclick="closeLabelModal()" title="Fechar">✕</button>
            </div>

            <div class="label-modal-body">
                <!-- Navegação de Lote (se houver múltiplos SSCCs) -->
                <div id="lbl-batch-nav" class="lbl-batch-nav" style="display:none;">
                    <button id="lbl-btn-prev" class="btn-batch-nav" onclick="prevBatchLabel()">◀ Anterior</button>
                    <span id="lbl-batch-counter" class="lbl-batch-counter">Palete 1 de 1</span>
                    <button id="lbl-btn-next" class="btn-batch-nav" onclick="nextBatchLabel()">Seguinte ▶</button>
                </div>

                <!-- Preview da Etiqueta -->
                <div id="lbl-preview-box"></div>

                <!-- Painel de Personalização -->
                <details class="label-edit-details" open>
                    <summary>Personalizar Dados da Etiqueta &amp; Formato</summary>
                    <div class="label-edit-grid">
                        <div class="lbl-input-row-2">
                            <div class="lbl-input-group">
                                <label>Formato / Papel</label>
                                <select id="lbl-format" onchange="updateLabelPreview()">
                                    <option value="a5">A5 Palete Standard (148×210 mm)</option>
                                    <option value="a6">A6 Palete Compacta (105×148 mm)</option>
                                    <option value="thermal">Térmica 4×6" / Zebra (100×150 mm)</option>
                                </select>
                            </div>
                            <div class="lbl-input-group">
                                <label>Ordem / Ref / Doc</label>
                                <input type="text" id="lbl-order" value="ENC-2026/994" oninput="updateLabelPreview()">
                            </div>
                        </div>

                        <div class="lbl-input-group">
                            <label>Remetente / Expedidor</label>
                            <input type="text" id="lbl-sender" value="EMPRESA REMETENTE LDA" oninput="updateLabelPreview()">
                        </div>
                        <div class="lbl-input-group">
                            <label>Destinatário</label>
                            <input type="text" id="lbl-recipient" value="CENTRO DE DISTRIBUIÇÃO LOGÍSTICA" oninput="updateLabelPreview()">
                        </div>
                        <div class="lbl-input-group">
                            <label>Conteúdo / Volumes</label>
                            <input type="text" id="lbl-contents" value="EURO PALETE (CARGA MISTA)" oninput="updateLabelPreview()">
                        </div>

                        <div class="lbl-input-row-3">
                            <div class="lbl-input-group">
                                <label>Peso Bruto</label>
                                <input type="text" id="lbl-weight" value="420 KG" oninput="updateLabelPreview()">
                            </div>
                            <div class="lbl-input-group">
                                <label>Lote (AI 10)</label>
                                <input type="text" id="lbl-batch" placeholder="Ex: L-948" oninput="updateLabelPreview()">
                            </div>
                            <div class="lbl-input-group">
                                <label>Validade (AI 15)</label>
                                <input type="text" id="lbl-expiry" placeholder="Ex: 2026-12-31" oninput="updateLabelPreview()">
                            </div>
                        </div>
                    </div>
                </details>
            </div>

            <div class="label-modal-footer">
                <button class="main-btn btn-live" onclick="printGS1Label()">
                    <i data-lucide="printer" style="width:14px;height:14px;margin-right:6px;vertical-align:middle;"></i>
                    <span id="lbl-print-btn-text">IMPRIMIR (A5 / 4x6")</span>
                </button>
                <button class="main-btn btn-audit" onclick="downloadGS1ZPL()" title="Descarregar ficheiro ZPL para impressora industrial Zebra">
                    <i data-lucide="download" style="width:14px;height:14px;margin-right:6px;vertical-align:middle;"></i>
                    <span id="lbl-zpl-btn-text">EXPORTAR ZPL</span>
                </button>
            </div>
        </div>
    </div>`;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    if (window.lucide) lucide.createIcons();
}
