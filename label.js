/**
 * SSCC Pro Vision — GS1 Logistics Label & Barcode Engine
 *
 * Implements:
 * 1. Pure vector GS1-128 (Code 128 Subset C with FNC1) SVG generator.
 * 2. GS1 Logistics Pallet Label layout (standard A5 / 4x6" thermal format).
 * 3. Industrial ZPL (Zebra Programming Language) label export.
 * 4. Responsive mobile-first modal and clean @media print stylesheet.
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

    const quietZone = 10;
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
 * Generates industrial Zebra ZPL code for 4x6" thermal pallet label.
 */
function generateGS1ZPL(sscc18, meta) {
    const clean = sscc18.replace(/\D/g, '');
    const s18 = (clean.length === 20 && clean.startsWith('00') ? clean.substring(2) : clean).padStart(18, '0');
    const hri = `(00) ${s18[0]} ${s18.substring(1, 8)} ${s18.substring(8, 17)} ${s18[17]}`;

    const sender = (meta.sender || 'EXPEDIDOR EXEMPLO LDA').toUpperCase().replace(/[\^~]/g, '');
    const recipient = (meta.recipient || 'CENTRO LOGISTICO DE DESTINO').toUpperCase().replace(/[\^~]/g, '');
    const contents = (meta.contents || 'EURO PALETE (CARGA MISTA)').toUpperCase().replace(/[\^~]/g, '');
    const weight = (meta.weight || '420 KG').toUpperCase().replace(/[\^~]/g, '');
    const orderNo = (meta.orderNo || 'ENC-2026-001').toUpperCase().replace(/[\^~]/g, '');

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
^FO60,358^A0N,22,22^FDPESO BRUTO: ${weight}   |   REF/DOC: ${orderNo}^FS
^FO60,390^A0N,20,20^FDDATA: ${new Date().toISOString().slice(0, 10)}^FS
^FO40,430^GB732,0,4^FS
^FO60,460^A0N,30,30^FDSSCC (SERIAL SHIPPING CONTAINER CODE):^FS
^FO60,505^A0N,38,38^FD${hri}^FS
^FO65,570^BY3,3,210^BCN,210,N,N,N,D^FD>8>500${s18}^FS
^XZ`;
}

// Current active modal state
let currentLabelSSCC = '';

/**
 * Opens the GS1 Label modal for a given SSCC.
 */
function openLabelModal(rawSSCC) {
    const clean = rawSSCC.replace(/\D/g, '');
    let s18 = clean;
    if (clean.length === 20 && clean.startsWith('00')) s18 = clean.substring(2);
    if (clean.length === 17) s18 = clean + getCD(clean);

    if (s18.length !== 18) {
        alert('SSCC inválido para geração de etiqueta (requer 18 dígitos).');
        return;
    }

    currentLabelSSCC = s18;
    ensureLabelModalExists();
    updateLabelPreview();

    const modal = document.getElementById('label-modal-backdrop');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // Evita scroll do body por trás em mobile
    }
}

/**
 * Closes the GS1 Label modal.
 */
function closeLabelModal() {
    const modal = document.getElementById('label-modal-backdrop');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
}

/**
 * Updates the live label preview with form values.
 */
function updateLabelPreview() {
    if (!currentLabelSSCC) return;

    const s18 = currentLabelSSCC;
    const sender = document.getElementById('lbl-sender')?.value || 'EMPRESA REMETENTE LDA';
    const recipient = document.getElementById('lbl-recipient')?.value || 'CENTRO DE DISTRIBUIÇÃO LOGÍSTICA';
    const contents = document.getElementById('lbl-contents')?.value || 'EURO PALETE (CARGA MISTA)';
    const weight = document.getElementById('lbl-weight')?.value || '450 KG';
    const orderNo = document.getElementById('lbl-order')?.value || 'ENC-2026/994';
    const today = new Date().toISOString().slice(0, 10);

    const ext = s18[0];
    const prefix = s18.substring(1, 8);
    const serial = s18.substring(8, 17);
    const cd = s18[17];
    const hriFormatted = `(00) ${ext} ${prefix} ${serial} ${cd}`;

    const barcodeSvg = generateGS1BarcodeSVG(s18, 70);

    const previewContainer = document.getElementById('lbl-preview-box');
    if (previewContainer) {
        previewContainer.innerHTML = `
            <div id="print-label-area" class="gs1-label-sheet">
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
                    <div class="lbl-col" style="width:65%;">
                        <span class="lbl-field-tag">CONTEÚDO / CONTENTS</span>
                        <div class="lbl-meta-value">${escapeHtml(contents)}</div>
                    </div>
                    <div class="lbl-col" style="width:35%; text-align:right;">
                        <span class="lbl-field-tag">PESO BRUTO</span>
                        <div class="lbl-meta-value">${escapeHtml(weight)}</div>
                    </div>
                </div>

                <div class="lbl-row lbl-sscc-section">
                    <span class="lbl-sscc-title">SSCC (SERIAL SHIPPING CONTAINER CODE)</span>
                    <div class="lbl-sscc-hri">${hriFormatted}</div>
                    <div class="lbl-barcode-wrap">
                        ${barcodeSvg}
                    </div>
                </div>
            </div>
        `;
    }
}

/**
 * Triggers native system printing.
 */
function printGS1Label() {
    window.print();
}

/**
 * Generates and downloads the ZPL file.
 */
function downloadGS1ZPL() {
    if (!currentLabelSSCC) return;
    const meta = {
        sender: document.getElementById('lbl-sender')?.value,
        recipient: document.getElementById('lbl-recipient')?.value,
        contents: document.getElementById('lbl-contents')?.value,
        weight: document.getElementById('lbl-weight')?.value,
        orderNo: document.getElementById('lbl-order')?.value,
    };
    const zpl = generateGS1ZPL(currentLabelSSCC, meta);
    const blob = new Blob([zpl], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `etiqueta_sscc_${currentLabelSSCC}.zpl`;
    a.click();
    URL.revokeObjectURL(url);
}

function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/**
 * Ensures the modal markup and styles are injected into DOM.
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
                <!-- Preview da Etiqueta -->
                <div id="lbl-preview-box"></div>

                <!-- Painel Recolhível de Personalização (Mobile-friendly) -->
                <details class="label-edit-details">
                    <summary>Personalizar Dados da Etiqueta</summary>
                    <div class="label-edit-grid">
                        <div class="lbl-input-group">
                            <label>Remetente / Expedidor</label>
                            <input type="text" id="lbl-sender" value="EMPRESA REMETENTE LDA" oninput="updateLabelPreview()">
                        </div>
                        <div class="lbl-input-group">
                            <label>Destinatário</label>
                            <input type="text" id="lbl-recipient" value="CENTRO DISTRIBUIÇÃO LOGÍSTICA" oninput="updateLabelPreview()">
                        </div>
                        <div class="lbl-input-group">
                            <label>Conteúdo / Volumes</label>
                            <input type="text" id="lbl-contents" value="EURO PALETE (40 VOLUMES)" oninput="updateLabelPreview()">
                        </div>
                        <div class="lbl-input-row-2">
                            <div class="lbl-input-group">
                                <label>Peso Bruto</label>
                                <input type="text" id="lbl-weight" value="420 KG" oninput="updateLabelPreview()">
                            </div>
                            <div class="lbl-input-group">
                                <label>Ordem / Ref</label>
                                <input type="text" id="lbl-order" value="ENC-2026/994" oninput="updateLabelPreview()">
                            </div>
                        </div>
                    </div>
                </details>
            </div>

            <div class="label-modal-footer">
                <button class="main-btn btn-live" onclick="printGS1Label()">
                    <i data-lucide="printer" style="width:14px;height:14px;margin-right:6px;vertical-align:middle;"></i>
                    <span>IMPRIMIR (A5 / 4x6")</span>
                </button>
                <button class="main-btn btn-audit" onclick="downloadGS1ZPL()" title="Descarregar ficheiro para impressora térmica Zebra">
                    <i data-lucide="download" style="width:14px;height:14px;margin-right:6px;vertical-align:middle;"></i>
                    <span>EXPORTAR ZPL</span>
                </button>
            </div>
        </div>
    </div>`;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    if (window.lucide) lucide.createIcons();
}
