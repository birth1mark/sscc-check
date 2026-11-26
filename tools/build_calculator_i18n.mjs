#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const CSS = fs.readFileSync(path.join(__dirname, 'calculator.css'), 'utf8');

const ROUTES = {
    en: { url: 'https://ssccapi.com/calculator', path: '/calculator', out: 'calculator.html', label: 'EN', name: 'English' },
    pt: { url: 'https://ssccapi.com/pt/calculadora', path: '/pt/calculadora', out: 'pt/calculadora.html', label: 'PT', name: 'Português' },
    es: { url: 'https://ssccapi.com/es/calculadora', path: '/es/calculadora', out: 'es/calculadora.html', label: 'ES', name: 'Español' },
    fr: { url: 'https://ssccapi.com/fr/calculateur', path: '/fr/calculateur', out: 'fr/calculateur.html', label: 'FR', name: 'Français' },
    de: { url: 'https://ssccapi.com/de/rechner', path: '/de/rechner', out: 'de/rechner.html', label: 'DE', name: 'Deutsch' },
    nl: { url: 'https://ssccapi.com/nl/calculator', path: '/nl/calculator', out: 'nl/calculator.html', label: 'NL', name: 'Nederlands' }
};

const LOCALES = {
    en: {
        lang: 'en',
        ogLocale: 'en_US',
        brandSub: 'calculator',
        nav: { studio: 'Studio', calc: 'Calculator', guide: 'Guide', api: 'API' },
        title: 'GS1 Check Digit Calculator (GTIN-14, EAN-13, UPC, GLN & SSCC) · SSCCAPI',
        description: 'Free GS1 check digit calculator & UPC-to-GTIN converter for GTIN-8, UPC-A (12), EAN-13, GTIN-14, GLN & SSCC-18 with visual Modulo 10 walkthrough and quiz.',
        keywords: 'GS1 check digit calculator, GTIN-14 check digit calculator, UPC check digit calculator, UPC to GTIN converter, GTIN to UPC, GLN calculator, EAN-13 check digit, SSCC-18 check digit, modulo 10 calculator, barcode check digit',
        ogTitle: 'GS1 Check Digit Calculator (GTIN-14, EAN-13, UPC, GLN & SSCC) · SSCCAPI',
        ogDesc: 'Free GS1 check digit calculator & UPC-to-GTIN converter with visual step-by-step Modulo 10 walkthrough, number-line gauge, typo simulator, and quiz.',
        twTitle: 'GS1 Check Digit Calculator (GTIN-14, EAN-13, UPC, GLN & SSCC)',
        twDesc: 'Calculate, convert (UPC ↔ EAN-13 ↔ GTIN-14), and visualize GS1 Modulo 10 check digits for GTIN, UPC, GLN, and SSCC.',
        schemaAppName: 'GS1 Check Digit Calculator & UPC-to-GTIN Converter',
        schemaAppDesc: 'Calculate, verify, convert (UPC-A, EAN-13, GTIN-14), and learn official GS1 Modulo 10 check digits visually for GTIN-8, GTIN-12, GTIN-13, GTIN-14, GLN-13, and SSCC-18.',
        schemaHowToName: 'How to Calculate a GS1 Check Digit',
        schemaHowToDesc: 'Visual step-by-step explanation of the GS1 Modulo 10 check digit calculation for GTIN, UPC, EAN, GLN, and SSCC.',
        howToSteps: [
            { name: 'Assign Alternating Weights Right-to-Left', text: 'Starting from the rightmost payload digit (immediately before the check digit), assign alternating weights of 3 and 1 moving from right to left.' },
            { name: 'Multiply and Sum Products', text: 'Multiply each digit by its weight (3 or 1) and add all products together — or sum all x3 digits first, multiply by 3, then add all x1 digits.' },
            { name: 'Jump to the Next Multiple of 10', text: 'Subtract the total sum from the nearest equal or higher multiple of 10: Check Digit = (10 - (Sum % 10)) % 10.' }
        ],
        h1Pre: 'GS1 ',
        h1Accent: 'CHECK DIGIT',
        h1Post: ' VISUAL LAB',
        tagline: 'Calculate, visualize & master the official GS1 Modulo 10 algorithm',
        modeAria: 'Calculator mode',
        tabLearn: 'Visual Tutor',
        tabQuiz: 'Practice Quiz',
        samples: { sscc: '35601234560000001', gtin13: '560123456789', gtin12: '01234567890', gtin14: '1560123456789', gtin8: '5601234', gln: '560123400001', prefix: '560' },
        types: {
            sscc: { tab: 'SSCC-18', label: 'SSCC-18 (Pallets)' },
            gtin13: { tab: 'GTIN-13 (EAN)', label: 'GTIN-13 / EAN-13' },
            gtin12: { tab: 'GTIN-12 (UPC)', label: 'GTIN-12 / UPC-A' },
            gtin14: { tab: 'GTIN-14', label: 'GTIN-14 (Cartons)' },
            gtin8: { tab: 'GTIN-8', label: 'GTIN-8 / EAN-8' },
            gln: { tab: 'GLN-13', label: 'GLN-13 (Locations)' }
        },
        inputExcl: 'excluding final check digit:',
        digitsUnit: 'digits',
        inputPlaceholder: 'Enter digits...',
        btnRandom: 'Random',
        btnRandomTitle: 'Generate random valid payload of current GS1 length',
        resLabelTop: 'VERIFIED FULL CODE:',
        resLabelQuiz: 'CHALLENGE PAYLOAD (FIND THE ?):',
        cdLabel: 'CHECK DIGIT:',
        btnStudio: 'Generate Barcode / Pallet Label',
        btnCopy: 'Copy Full Code',
        btnCopied: 'Copied!',
        quizTitle: '🧠 Practice Challenge — Compute the Check Digit yourself!',
        quizStreak: 'Streak',
        quizIntro: 'Use the <strong>×3</strong> (amber) and <strong>×1</strong> (cyan) tiles below, find the jump to the next multiple of 10, and tap your answer:',
        btnHint: 'Hint',
        btnNewCode: 'New Code',
        steps: ['All Steps', '1. Weights (←)', '2. ×3 / ×1 Buckets', '3. Mod-10 Jump', '4. Typo Proof'],
        btnPrev: 'Previous step',
        btnNext: 'Next step',
        btnPlay: 'Walkthrough',
        btnStop: 'Stop',
        rtlLeft: 'Click or hover any digit tile to inspect its exact contribution:',
        rtlRight: '← Weights ALWAYS start at ×3 from the right',
        b3Head: '● ×3 WEIGHT GROUP (ODD FROM RIGHT)',
        b1Head: '● ×1 WEIGHT GROUP (EVEN FROM RIGHT)',
        gaugeTitle: 'Visual Modulo-10 Jump to Next Multiple of 10',
        gaugeAria: 'Modulo 10 number line showing distance from weighted sum to next multiple of 10',
        typoTitle: '🧪 Why Check Digits Matter — Interactive Error-Detection Test',
        typoSingle: 'Simulate 1-Digit Typo',
        typoSwap: 'Simulate Adjacent Swap',
        typoReset: 'Reset',
        typoDefault: 'Test how scanners catch human mistakes: click a simulation button above to alter a digit or swap two neighbors and watch the Modulo-10 checksum break instantly.',
        classicSummary: 'Show classic tabular breakdown (P1..Pn)',
        ctaTitle: 'Generate GS1-128 & 2D QR Barcodes, Zebra ZPL or Full Pallet Labels',
        ctaDesc: 'Export standalone SSCC barcodes (<code>SVG</code>, <code>300 DPI PNG</code>, <code>ZPL-II</code>) or complete A5/4×6" GS1 logistics pallet labels in the Web Studio or via our Cloud REST API (25 free labels included · Pro packs from 5 €).',
        ctaBtn1: 'Open Label & Barcode Studio',
        ctaBtn2: 'REST API & Swagger Sandbox',
        seoCols: [
            {
                h2: '1. The 3-Step Mental Shortcut',
                html: '<ul><li><strong>Start from the Right:</strong> Label the rightmost payload digit <strong>×3</strong>, the next left <strong>×1</strong>, alternating <code>3, 1, 3, 1...</code></li><li><strong>Group &amp; Multiply:</strong> Sum all <strong>×3</strong> digits and multiply by 3 once; then add all <strong>×1</strong> digits.</li><li><strong>Round Up to 10:</strong> The gap (0–9) to the next multiple of 10 is your check digit.</li></ul>'
            },
            {
                h2: '2. Why Alternate 3 and 1?',
                html: '<p>A plain sum catches single-digit typos, but <em>cannot</em> catch swapped neighbors (<code>47</code> vs <code>74</code>). Alternating weights (<strong>3</strong> and <strong>1</strong>) catches <strong>100% of single-digit errors</strong> and <strong>~89% of adjacent transpositions</strong>.</p>'
            },
            {
                h2: '3. Universal GS1 Formula',
                html: '<p>Every GS1 key (<strong>GTIN-8, 12, 13, 14, GLN-13 &amp; SSCC-18</strong>) uses the exact same equation:</p><p><code>CD = (10 − (Sum mod 10)) mod 10</code></p>'
            }
        ],
        proTip: '<strong>Pro Tip:</strong> Because weights anchor from the <em>right</em>, an 18-digit SSCC (17 payload digits) starts with <strong>×3</strong> on position 1, whereas a 13-digit EAN/GLN (12 payload digits) starts with <strong>×1</strong> on position 1. Switch the GS1 tabs above to watch the colors flip!',
        convHeading: '4. UPC-A ↔ EAN-13 ↔ GTIN-14 Converter (Zero-Padding & Case Indicator)',
        convIntro: 'Enter any <strong>UPC-A (12)</strong>, <strong>EAN-13 (13)</strong>, or <strong>GTIN-14 (14)</strong> code (with or without check digit) to convert between retail and logistics GTIN formats with automatic Modulo 10 recalculation.',
        convPlaceholder: 'Paste UPC-A, EAN-13, or GTIN-14...',
        convIndLabel: 'GTIN-14 Indicator:',
        convIndOptions: [
            '0 — Base unit (same CD)',
            '1 — Case / Carton Level 1',
            '2 — Case / Carton Level 2',
            '3 — Case / Carton Level 3',
            '4 — Case / Carton Level 4',
            '5 — Case / Carton Level 5',
            '6 — Case / Carton Level 6',
            '7 — Case / Carton Level 7',
            '8 — Case / Carton Level 8'
        ],
        refAria: 'GS1 Key Lengths and Check Digit Reference',
        refHeaders: ['GS1 Key', 'Total Digits', 'Payload', 'Position 1 Weight', 'Primary Use'],
        refRows: [
            ['GTIN-8 (EAN-8)', '8', '7', '×3', 'Small retail items'],
            ['GTIN-12 (UPC-A)', '12', '11', '×3', 'North American retail POS'],
            ['GTIN-13 (EAN-13)', '13', '12', '×1', 'Global retail POS'],
            ['GLN-13', '13', '12', '×1', 'Warehouses, docks & EDI parties'],
            ['GTIN-14 (ITF-14)', '14', '13', '×3', 'Cases, cartons & trade units'],
            ['SSCC-18', '18', '17', '×3', 'Logistics pallets & GS1-128 labels']
        ],
        faqHeading: '5. GS1 Check Digit & GTIN Conversion FAQ',
        faqs: [
            {
                q: 'How do you calculate a GS1 check digit for GTIN, EAN, UPC, GLN, or SSCC?',
                aText: 'Start from the rightmost digit before the check digit and assign alternating weights of 3 and 1 moving right to left. Sum all weighted products and find the distance to the next multiple of 10 using the formula Check Digit = (10 - (Sum mod 10)) mod 10.',
                aHtml: 'Start from the rightmost digit before the check digit and assign alternating weights of <strong>3</strong> and <strong>1</strong> moving right to left. Sum all weighted products and find the distance to the next multiple of 10 using <code>Check Digit = (10 − (Sum mod 10)) mod 10</code>.'
            },
            {
                q: 'How do you convert a 12-digit UPC-A to EAN-13 or GTIN-14?',
                aText: 'Prepend one leading zero (0) to a 12-digit UPC-A to form an EAN-13 / GTIN-13, or prepend two leading zeros (00) to form a base-unit GTIN-14. For carton or case-level GTIN-14 codes using packaging indicators 1 through 8, replace the first digit with the indicator (1-8) and recalculate the final Modulo 10 check digit.',
                aHtml: 'Prepend one leading zero (<code>0</code>) to a 12-digit UPC-A to form an <strong>EAN-13 / GTIN-13</strong>, or prepend two leading zeros (<code>00</code>) to form a base-unit <strong>GTIN-14</strong>. For carton or case-level GTIN-14 codes using packaging indicators <code>1</code> through <code>8</code>, replace the first digit with the indicator and recalculate the final Modulo 10 check digit.'
            },
            {
                q: 'Does converting UPC-A to EAN-13 or GTIN-14 change the check digit?',
                aText: 'Adding leading zeros (indicator 0) never changes the check digit because zero multiplied by any weight is zero. However, if you assign a non-zero GTIN-14 packaging indicator (1 to 8) for a case or master carton, the check digit changes and must be recalculated.',
                aHtml: 'Adding leading zeros (indicator <code>0</code>) never changes the check digit because zero multiplied by any weight is zero. However, if you assign a non-zero GTIN-14 packaging indicator (<code>1</code> to <code>8</code>) for a case or master carton, the check digit changes and must be recalculated.'
            },
            {
                q: 'How do you calculate a GLN-13 check digit?',
                aText: 'A Global Location Number (GLN-13) uses the exact same 12-digit payload and Modulo 10 weighting as GTIN-13 / EAN-13. Take the first 12 digits, multiply alternating positions by 3 and 1 from right to left, sum the products, and subtract from the next multiple of 10.',
                aHtml: 'A Global Location Number (<strong>GLN-13</strong>) uses the exact same 12-digit payload and Modulo 10 weighting as GTIN-13 / EAN-13. Take the first 12 digits, multiply alternating positions by 3 and 1 from right to left, sum the products, and subtract from the next multiple of 10.'
            },
            {
                q: 'Can you convert a GTIN-14 or EAN-13 back to a 12-digit UPC-A?',
                aText: 'Yes, whenever an EAN-13 starts with 0 or a GTIN-14 starts with 00, stripping those leading zeros yields the exact 12-digit UPC-A with the same check digit. If a GTIN-14 starts with a packaging indicator 1 through 8 followed by 0, remove the first two digits and recalculate the check digit for the 11-digit UPC payload.',
                aHtml: 'Yes — whenever an EAN-13 starts with <code>0</code> or a GTIN-14 starts with <code>00</code>, stripping those leading zeros yields the exact 12-digit UPC-A with the same check digit. If a GTIN-14 starts with a packaging indicator <code>1</code>–<code>8</code> followed by <code>0</code>, remove the first two digits and recalculate the check digit for the 11-digit UPC payload.'
            }
        ],
        footerGuide: 'GS1 Guide',
        footerApi: 'REST API',
        js: {
            excl: 'excluding final check digit:',
            digits: 'digits',
            lenNote: 'Note: {len} digits entered (standard {type} payload is {exp}).',
            badge0: 'OVERVIEW',
            badge1: 'STEP 1 / 4',
            badge2: 'STEP 2 / 4',
            badge3: 'STEP 3 / 4',
            badge4: 'STEP 4 / 4',
            s0Quiz: '<strong>Quiz Active:</strong> Weights alternate <strong>×3</strong> (amber) and <strong>×1</strong> (cyan) from right to left. Sum the products and find how much is needed to reach the next multiple of 10!',
            s0Show: '<strong>Complete Visual Proof:</strong> Multiply each digit from right to left by alternating <strong>×3</strong> and <strong>×1</strong> weights → total sum is <strong>{sum}</strong> → distance to next multiple of 10 (<strong>{next10}</strong>) gives check digit <strong style="color:var(--success);">{cd}</strong>.',
            s1: '<strong>Assign Weights Right-to-Left (←):</strong> Start at the last payload digit <strong>P{n}</strong> with <strong style="color:var(--primary);">×3</strong>, then alternate <strong style="color:var(--cyan);">×1</strong>, <strong style="color:var(--primary);">×3</strong>... Notice why this works identically for 8, 12, 13, 14, and 18-digit GS1 keys!',
            s2: '<strong>Multiply &amp; Group Shortcut:</strong> Add all <strong style="color:var(--primary);">×3 digits</strong> ({sum3d}) × 3 = <strong>{sum3t}</strong>, then add all <strong style="color:var(--cyan);">×1 digits</strong> = <strong>{sum1t}</strong> → Total Weighted Sum = <strong>{sum}</strong>.',
            s3Quiz: '<strong>Modulo-10 Jump:</strong> Take the weighted sum and find the smallest number (0–9) that rounds it up to a multiple of 10.',
            s3Show: '<strong>Jump to Next Multiple of 10:</strong> From <strong>{sum}</strong>, the nearest equal or higher multiple of 10 is <strong>{next10}</strong>. Subtract: <code>{next10} − {sum} = </code><strong style="color:var(--success);">{cd}</strong>{exact}',
            s3Exact: ' (already a multiple of 10, so check digit is 0!)',
            s4: '<strong>Verify &amp; Catch Typos:</strong> With check digit <strong>{cd}</strong> appended (weight ×1), the full code sums to <strong>{next10}</strong> (<code>{next10} mod 10 = 0</code>). Try the purple <strong>Error-Detection Test</strong> below to break a digit or swap two neighbors!',
            tileTitle: 'Position P{p} (Right-to-Left #{rtl}): {d} × {w} = {prod}',
            cdTileTitle: 'Final GS1 Check Digit (weight ×1 when validating full code)',
            cdTileTop: 'CHECK',
            cdTileShort: 'CD',
            cdGuess: 'guess',
            inspTip: '<span><strong>Tip:</strong> Hover or tap any digit tile above to inspect its position, weight &amp; share of the total sum.</span><span style="color:var(--cyan);">Rightmost payload digit P{p} = <strong>{d} × 3 = {prod}</strong></span>',
            inspFocus: '<span>Inspecting <strong>Position P{p}</strong> (#{rtl} from right → {parity} slot): digit <strong>{d}</strong> × weight <strong style="color:{col};">{w}</strong> = <strong>{prod}</strong></span><span style="color:var(--text-dim);">{right}</span>',
            odd: 'odd',
            even: 'even',
            quizHintHidden: 'Hint hidden in Quiz mode',
            shareSum: '{share}% of weighted sum ({sum})',
            b3Hide: 'Digits: ({list}) — sum them, then multiply by <strong>3</strong>',
            b1Hide: 'Digits: ({list}) — add them directly (<strong>×1</strong>)',
            gaugeQuizEq: 'Solve the quiz above to reveal the Modulo-10 jump!',
            gaugeQuizSvg: 'Quiz Mode — Number-line answer hidden until you submit or reveal',
            gaugeEq: '{target} − {sum} = {cd}  (Check Digit)',
            gaugePlus: '+{cd} (Check Digit)',
            gaugeZero: 'Already multiple of 10 → CD = 0',
            gaugeSum: 'Sum={sum}',
            tblPos: 'Pos',
            tblDig: 'Digit',
            tblW: 'Weight (×)',
            tblProd: 'Product',
            play: 'Walkthrough',
            stop: 'Stop',
            typoChanged: 'Changed P{p} from <strong>{orig}</strong> → <strong style="color:var(--danger);">{mut}</strong>',
            typoSwapped: 'Swapped P{p1} &amp; P{p2}: <strong>{a}{b}</strong> → <strong style="color:var(--danger);">{b}{a}</strong>',
            typoCaught: '<span style="color:#fca5a5;font-weight:700;">✗ ERROR CAUGHT INSTANTLY!</span> {desc}.<br>New weighted sum ({newSum}) + original check digit ({cd}) = <strong>{tot}</strong> → <code>{tot} mod 10 = {rem} ≠ 0</code>. Scanner rejects the corrupted code!',
            typoBlind: '<span style="color:var(--primary);font-weight:700;">⚠ RARE BLIND SPOT FOUND!</span> {desc}. Because |a − b| = 5, <code>5 × (3 − 1) = 10</code>, leaving mod 10 unchanged — the classic mathematical edge case of Modulo 10!',
            typoDefault: 'Test how scanners catch human mistakes: click a simulation button above to alter a digit or swap two neighbors and watch the Modulo-10 checksum break instantly.',
            quizStreakLbl: 'Streak',
            quizWin: '<span style="color:var(--success);font-weight:700;">✓ Spot on!</span> Weighted sum = <strong>{sum}</strong> → next multiple of 10 is <strong>{next10}</strong> → <strong>{next10} − {sum} = {cd}</strong>.',
            quizLose: '<span style="color:#fca5a5;">✗ Not {guess}.</span> Tip: click <strong>Hint</strong> to reveal the ×3 and ×1 bucket totals, then find the gap to the next 10.',
            copyBtn: 'Copy Full Code',
            copied: 'Copied!',
            convEmpty: 'Enter 11–14 digits (UPC-A, EAN-13, or GTIN-14) to see instant zero-padded and carton-level conversions.',
            convNotUpc: 'Not a UPC-A range',
            convUpcMeta: '12 digits · North American POS',
            convNonUpcMeta: 'EAN prefix ≠ 0 (non-UPC country prefix)',
            convEanMeta: '13 digits · Global retail barcode',
            convG14Title: 'GTIN-14 (Indicator {ind})',
            convG14Same: 'Base unit · check digit unchanged',
            convG14Recalc: 'Case/carton · check digit recalculated',
            convCopy: 'Copy',
            convInspect: 'Inspect ↑'
        }
    },

    pt: {
        lang: 'pt',
        ogLocale: 'pt_PT',
        brandSub: 'calculadora',
        nav: { studio: 'Estúdio', calc: 'Calculadora', guide: 'Guia', api: 'API' },
        title: 'Calculadora de Dígito de Controlo GS1 (GTIN-14, EAN-13, UPC, GLN e SSCC) · SSCCAPI',
        description: 'Calculadora gratuita de dígito de controlo / dígito verificador GS1 (GTIN-8, UPC-A, EAN-13, GTIN-14, GLN e SSCC-18) com conversor UPC↔GTIN e simulador visual Módulo 10.',
        keywords: 'calculadora dígito de controlo GS1, dígito verificador EAN 13, calculadora GTIN 14, dígito de controlo SSCC 18, calcular GLN 13, conversor UPC para GTIN, algoritmo módulo 10 GS1, código de barras GS1-128',
        ogTitle: 'Calculadora de Dígito de Controlo GS1 (GTIN-14, EAN-13, UPC, GLN e SSCC) · SSCCAPI',
        ogDesc: 'Calcula, valida e aprende visualmente o algoritmo Módulo 10 GS1 para GTIN, EAN-13, UPC-A, GLN e SSCC-18, com conversor UPC↔GTIN-14 e teste de erros.',
        twTitle: 'Calculadora de Dígito de Controlo GS1 (GTIN, EAN, UPC, GLN e SSCC)',
        twDesc: 'Calcula dígitos de controlo GS1 Módulo 10 passo a passo e converte UPC-A ↔ EAN-13 ↔ GTIN-14 instantaneamente.',
        schemaAppName: 'Calculadora de Dígito de Controlo GS1 e Conversor UPC para GTIN',
        schemaAppDesc: 'Calcula, valida, converte (UPC-A, EAN-13, GTIN-14) e visualiza passo a passo o dígito de controlo oficial GS1 Módulo 10 para GTIN-8, GTIN-12, GTIN-13, GTIN-14, GLN-13 e SSCC-18.',
        schemaHowToName: 'Como calcular o dígito de controlo GS1 (Módulo 10)',
        schemaHowToDesc: 'Explicação visual passo a passo do algoritmo oficial GS1 Módulo 10 aplicável a GTIN, EAN-13, UPC-A, GLN-13 e SSCC-18.',
        howToSteps: [
            { name: 'Atribuir pesos alternados da direita para a esquerda', text: 'A partir do último dígito do corpo do código (imediatamente antes do dígito de controlo), atribua pesos alternados de 3 e 1 da direita para a esquerda.' },
            { name: 'Multiplicar e somar os produtos', text: 'Multiplique cada dígito pelo respetivo peso (3 ou 1) e some todos os produtos — ou some primeiro todos os dígitos com peso ×3, multiplique o total por 3 e adicione a soma dos dígitos ×1.' },
            { name: 'Calcular a diferença até ao múltiplo de 10 seguinte', text: 'Subtraia a soma ponderada ao múltiplo de 10 igual ou imediatamente superior: Dígito de Controlo = (10 - (Soma % 10)) % 10.' }
        ],
        h1Pre: 'LABORATÓRIO VISUAL · ',
        h1Accent: 'DÍGITO DE CONTROLO',
        h1Post: ' GS1',
        tagline: 'Calcule, visualize e domine o algoritmo oficial GS1 Módulo 10 (dígito verificador)',
        modeAria: 'Modo da calculadora',
        tabLearn: 'Tutor Visual',
        tabQuiz: 'Quiz Prático',
        samples: { sscc: '35601234560000001', gtin13: '560123456789', gtin12: '01234567890', gtin14: '1560123456789', gtin8: '5601234', gln: '560123400001', prefix: '560' },
        types: {
            sscc: { tab: 'SSCC-18', label: 'SSCC-18 (Paletes)' },
            gtin13: { tab: 'GTIN-13 (EAN)', label: 'GTIN-13 / EAN-13' },
            gtin12: { tab: 'GTIN-12 (UPC)', label: 'GTIN-12 / UPC-A' },
            gtin14: { tab: 'GTIN-14', label: 'GTIN-14 (Caixas)' },
            gtin8: { tab: 'GTIN-8', label: 'GTIN-8 / EAN-8' },
            gln: { tab: 'GLN-13', label: 'GLN-13 (Localizações)' }
        },
        inputExcl: 'sem o dígito de controlo final:',
        digitsUnit: 'dígitos',
        inputPlaceholder: 'Introduza os dígitos...',
        btnRandom: 'Aleatório',
        btnRandomTitle: 'Gerar código válido aleatório com o comprimento GS1 atual',
        resLabelTop: 'CÓDIGO COMPLETO VERIFICADO:',
        resLabelQuiz: 'DESAFIO (DESCUBRA O ?):',
        cdLabel: 'DÍGITO DE CONTROLO:',
        btnStudio: 'Gerar Código de Barras / Etiqueta',
        btnCopy: 'Copiar Código Completo',
        btnCopied: 'Copiado!',
        quizTitle: '🧠 Desafio Prático — Calcule o Dígito de Controlo!',
        quizStreak: 'Série',
        quizIntro: 'Use os blocos <strong>×3</strong> (âmbar) e <strong>×1</strong> (ciano) abaixo, encontre a distância até ao múltiplo de 10 seguinte e selecione a sua resposta:',
        btnHint: 'Dica',
        btnNewCode: 'Novo Código',
        steps: ['Todos os Passos', '1. Pesos (←)', '2. Grupos ×3 / ×1', '3. Salto Mód-10', '4. Prova de Erros'],
        btnPrev: 'Passo anterior',
        btnNext: 'Passo seguinte',
        btnPlay: 'Demonstração',
        btnStop: 'Parar',
        rtlLeft: 'Clique ou passe o cursor sobre qualquer dígito para inspecionar o seu peso:',
        rtlRight: '← Os pesos começam SEMPRE em ×3 a partir da direita',
        b3Head: '● GRUPO PESO ×3 (POSIÇÕES ÍMPARES DA DIREITA)',
        b1Head: '● GRUPO PESO ×1 (POSIÇÕES PARES DA DIREITA)',
        gaugeTitle: 'Salto Visual Módulo 10 até ao Múltiplo de 10 Seguinte',
        gaugeAria: 'Reta numérica Módulo 10 que mostra a distância da soma ponderada ao múltiplo de 10 seguinte',
        typoTitle: '🧪 Porque Existem Dígitos de Controlo — Simulador de Deteção de Erros',
        typoSingle: 'Simular Erro de 1 Dígito',
        typoSwap: 'Simular Troca Adjacente',
        typoReset: 'Repor',
        typoDefault: 'Veja como os leitores óticos detetam erros humanos: clique num botão acima para alterar um dígito ou trocar dois dígitos vizinhos e observe o algoritmo Módulo 10 invalidar o código de imediato.',
        classicSummary: 'Mostrar tabela clássica detalhada (P1..Pn)',
        ctaTitle: 'Gere Códigos de Barras GS1-128 e QR 2D, Zebra ZPL ou Etiquetas de Palete',
        ctaDesc: 'Exporte códigos de barras SSCC autónomos (<code>SVG</code>, <code>PNG 300 DPI</code>, <code>ZPL-II</code>) ou etiquetas logísticas GS1 completas (A5 / 4×6") no Estúdio Web ou via API REST Cloud (25 etiquetas grátis incluídas · packs Pro desde 5 €).',
        ctaBtn1: 'Abrir Estúdio de Etiquetas',
        ctaBtn2: 'API REST e Sandbox Swagger',
        seoCols: [
            {
                h2: '1. O Atalho Mental em 3 Passos',
                html: '<ul><li><strong>Comece pela Direita:</strong> Atribua <strong>×3</strong> ao dígito mais à direita do corpo, <strong>×1</strong> ao seguinte para a esquerda, alternando <code>3, 1, 3, 1...</code></li><li><strong>Agrupe e Multiplique:</strong> Some todos os dígitos <strong>×3</strong> e multiplique o subtotal por 3 de uma só vez; depois adicione os dígitos <strong>×1</strong>.</li><li><strong>Arredonde para 10:</strong> A diferença (0–9) até ao múltiplo de 10 seguinte é o dígito de controlo.</li></ul>'
            },
            {
                h2: '2. Porquê Alternar 3 e 1?',
                html: '<p>Uma soma simples deteta erros de um dígito, mas <em>não consegue</em> detetar trocas de dígitos vizinhos (<code>47</code> vs <code>74</code>). A ponderação alternada (<strong>3</strong> e <strong>1</strong>) deteta <strong>100% dos erros simples</strong> e <strong>~89% das transposições adjacentes</strong>.</p>'
            },
            {
                h2: '3. Fórmula Universal GS1',
                html: '<p>Todas as chaves GS1 (<strong>GTIN-8, 12, 13, 14, GLN-13 e SSCC-18</strong>) utilizam exatamente a mesma equação:</p><p><code>DC = (10 − (Soma mod 10)) mod 10</code></p>'
            }
        ],
        proTip: '<strong>Dica Técnica:</strong> Como os pesos são ancorados à <em>direita</em>, um SSCC-18 (17 dígitos de corpo) começa com <strong>×3</strong> na posição P1, enquanto um EAN-13 ou GLN-13 (12 dígitos de corpo) começa com <strong>×1</strong> em P1. Alterne entre os separadores acima para observar a inversão das cores!',
        convHeading: '4. Conversor UPC-A ↔ EAN-13 ↔ GTIN-14 (Zero-Padding e Indicador Logístico)',
        convIntro: 'Introduza qualquer código <strong>UPC-A (12)</strong>, <strong>EAN-13 (13)</strong> ou <strong>GTIN-14 (14)</strong> (com ou sem dígito de controlo) para converter entre formatos de retalho e logística com recálculo automático Módulo 10.',
        convPlaceholder: 'Cole um código UPC-A, EAN-13 ou GTIN-14...',
        convIndLabel: 'Indicador GTIN-14:',
        convIndOptions: [
            '0 — Unidade base (mesmo DC)',
            '1 — Caixa / Embalagem Nível 1',
            '2 — Caixa / Embalagem Nível 2',
            '3 — Caixa / Embalagem Nível 3',
            '4 — Caixa / Embalagem Nível 4',
            '5 — Caixa / Embalagem Nível 5',
            '6 — Caixa / Embalagem Nível 6',
            '7 — Caixa / Embalagem Nível 7',
            '8 — Caixa / Embalagem Nível 8'
        ],
        refAria: 'Tabela de referência de comprimentos e pesos das chaves GS1',
        refHeaders: ['Chave GS1', 'Total de Dígitos', 'Corpo (Payload)', 'Peso na Posição 1', 'Utilização Principal'],
        refRows: [
            ['GTIN-8 (EAN-8)', '8', '7', '×3', 'Artigos de retalho pequenos'],
            ['GTIN-12 (UPC-A)', '12', '11', '×3', 'Ponto de venda América do Norte'],
            ['GTIN-13 (EAN-13)', '13', '12', '×1', 'Retalho global (POS)'],
            ['GLN-13', '13', '12', '×1', 'Armazéns, cais e entidades EDI'],
            ['GTIN-14 (ITF-14)', '14', '13', '×3', 'Caixas, cartões e unidades comerciais'],
            ['SSCC-18', '18', '17', '×3', 'Paletes logísticas e etiquetas GS1-128']
        ],
        faqHeading: '5. Perguntas Frequentes — Dígito de Controlo GS1 e Conversão GTIN',
        faqs: [
            {
                q: 'Como se calcula o dígito de controlo (dígito verificador) GS1 para GTIN, EAN, UPC, GLN ou SSCC?',
                aText: 'A partir do dígito mais à direita antes do dígito de controlo, atribua pesos alternados de 3 e 1 avançando para a esquerda. Some todos os produtos ponderados e determine a distância até ao múltiplo de 10 seguinte através da fórmula DC = (10 - (Soma mod 10)) mod 10.',
                aHtml: 'A partir do dígito mais à direita antes do dígito de controlo, atribua pesos alternados de <strong>3</strong> e <strong>1</strong> avançando para a esquerda. Some todos os produtos ponderados e determine a distância até ao múltiplo de 10 seguinte através da fórmula <code>DC = (10 − (Soma mod 10)) mod 10</code>.'
            },
            {
                q: 'Como converter um UPC-A de 12 dígitos para EAN-13 ou GTIN-14?',
                aText: 'Adicione um zero à esquerda (0) a um UPC-A de 12 dígitos para obter o EAN-13 / GTIN-13, ou dois zeros à esquerda (00) para obter o GTIN-14 de unidade base. Para caixas ou agrupamentos logísticos com indicador de embalagem de 1 a 8, coloque o indicador na primeira posição e recalcule o dígito de controlo Módulo 10.',
                aHtml: 'Adicione um zero à esquerda (<code>0</code>) a um UPC-A de 12 dígitos para obter o <strong>EAN-13 / GTIN-13</strong>, ou dois zeros à esquerda (<code>00</code>) para obter o <strong>GTIN-14</strong> de unidade base. Para caixas ou agrupamentos logísticos com indicador de embalagem de <code>1</code> a <code>8</code>, coloque o indicador na primeira posição e recalcule o dígito de controlo Módulo 10.'
            },
            {
                q: 'Converter UPC-A para EAN-13 ou GTIN-14 altera o dígito de controlo?',
                aText: 'Acrescentar zeros à esquerda (indicador 0) nunca altera o dígito de controlo, porque zero multiplicado por qualquer peso continua a ser zero. Contudo, ao atribuir um indicador de embalagem GTIN-14 entre 1 e 8 para uma caixa logística, o dígito de controlo muda e tem de ser recalculado.',
                aHtml: 'Acrescentar zeros à esquerda (indicador <code>0</code>) nunca altera o dígito de controlo, porque zero multiplicado por qualquer peso continua a ser zero. Contudo, ao atribuir um indicador de embalagem GTIN-14 entre <code>1</code> e <code>8</code> para uma caixa logística, o dígito de controlo muda e tem de ser recalculado.'
            },
            {
                q: 'Como calcular o dígito de controlo de um código GLN-13?',
                aText: 'O Global Location Number (GLN-13) segue exatamente a mesma estrutura de 12 dígitos de corpo e ponderação Módulo 10 que o GTIN-13 / EAN-13. Multiplique os 12 dígitos alternadamente por 3 e 1 da direita para a esquerda, some os resultados e subtraia ao múltiplo de 10 imediatamente superior.',
                aHtml: 'O Global Location Number (<strong>GLN-13</strong>) segue exatamente a mesma estrutura de 12 dígitos de corpo e ponderação Módulo 10 que o GTIN-13 / EAN-13. Multiplique os 12 dígitos alternadamente por 3 e 1 da direita para a esquerda, some os resultados e subtraia ao múltiplo de 10 imediatamente superior.'
            },
            {
                q: 'É possível converter um GTIN-14 ou EAN-13 de volta para UPC-A (12 dígitos)?',
                aText: 'Sim — sempre que um EAN-13 começa por 0 ou um GTIN-14 começa por 00, basta remover os zeros iniciais para recuperar o UPC-A de 12 dígitos com o mesmo dígito de controlo. Se o GTIN-14 começar por um indicador de 1 a 8 seguido de 0, remova os dois primeiros dígitos e recalcule o dígito de controlo sobre o corpo UPC de 11 dígitos.',
                aHtml: 'Sim — sempre que um EAN-13 começa por <code>0</code> ou um GTIN-14 começa por <code>00</code>, basta remover os zeros iniciais para recuperar o UPC-A de 12 dígitos com o mesmo dígito de controlo. Se o GTIN-14 começar por um indicador de <code>1</code> a <code>8</code> seguido de <code>0</code>, remova os dois primeiros dígitos e recalcule o dígito de controlo sobre o corpo UPC de 11 dígitos.'
            }
        ],
        footerGuide: 'Guia GS1',
        footerApi: 'API REST',
        js: {
            excl: 'sem o dígito de controlo final:',
            digits: 'dígitos',
            lenNote: 'Nota: introduziu {len} dígitos (o corpo padrão de {type} tem {exp} dígitos).',
            badge0: 'VISÃO GERAL',
            badge1: 'PASSO 1 / 4',
            badge2: 'PASSO 2 / 4',
            badge3: 'PASSO 3 / 4',
            badge4: 'PASSO 4 / 4',
            s0Quiz: '<strong>Quiz Ativo:</strong> Os pesos alternam entre <strong>×3</strong> (âmbar) e <strong>×1</strong> (ciano) da direita para a esquerda. Some os produtos e encontre quanto falta até ao múltiplo de 10 seguinte!',
            s0Show: '<strong>Demonstração Completa:</strong> Multiplique cada dígito da direita para a esquerda por pesos alternados <strong>×3</strong> e <strong>×1</strong> → soma ponderada = <strong>{sum}</strong> → distância até ao múltiplo de 10 seguinte (<strong>{next10}</strong>) resulta no dígito de controlo <strong style="color:var(--success);">{cd}</strong>.',
            s1: '<strong>Atribuir Pesos da Direita para a Esquerda (←):</strong> Comece no último dígito do corpo <strong>P{n}</strong> com <strong style="color:var(--primary);">×3</strong>, alternando depois <strong style="color:var(--cyan);">×1</strong>, <strong style="color:var(--primary);">×3</strong>… É por isso que o mesmo algoritmo funciona em chaves GS1 de 8, 12, 13, 14 e 18 dígitos!',
            s2: '<strong>Atalho de Agrupamento:</strong> Soma dos dígitos <strong style="color:var(--primary);">×3</strong> ({sum3d}) × 3 = <strong>{sum3t}</strong>, mais a soma dos dígitos <strong style="color:var(--cyan);">×1</strong> = <strong>{sum1t}</strong> → Soma Ponderada Total = <strong>{sum}</strong>.',
            s3Quiz: '<strong>Salto Módulo 10:</strong> Calcule a soma ponderada e encontre o menor dígito (0–9) necessário para atingir um múltiplo de 10.',
            s3Show: '<strong>Salto para o Múltiplo de 10 Seguinte:</strong> A partir de <strong>{sum}</strong>, o múltiplo de 10 igual ou superior mais próximo é <strong>{next10}</strong>. Subtraia: <code>{next10} − {sum} = </code><strong style="color:var(--success);">{cd}</strong>{exact}',
            s3Exact: ' (já é múltiplo de 10, logo o dígito de controlo é 0!)',
            s4: '<strong>Validar e Detetar Erros:</strong> Com o dígito de controlo <strong>{cd}</strong> anexado (peso ×1), o código completo soma <strong>{next10}</strong> (<code>{next10} mod 10 = 0</code>). Experimente o <strong>Simulador de Erros</strong> a roxo abaixo para alterar um dígito ou trocar dois vizinhos!',
            tileTitle: 'Posição P{p} (#{rtl} da direita): {d} × {w} = {prod}',
            cdTileTitle: 'Dígito de Controlo GS1 final (peso ×1 na validação do código completo)',
            cdTileTop: 'CONTROLO',
            cdTileShort: 'DC',
            cdGuess: 'descubra',
            inspTip: '<span><strong>Dica:</strong> Passe o cursor ou toque em qualquer dígito acima para inspecionar a posição, o peso e a contribuição para a soma.</span><span style="color:var(--cyan);">Último dígito do corpo P{p} = <strong>{d} × 3 = {prod}</strong></span>',
            inspFocus: '<span>A inspecionar <strong>Posição P{p}</strong> (#{rtl} da direita → casa {parity}): dígito <strong>{d}</strong> × peso <strong style="color:{col};">{w}</strong> = <strong>{prod}</strong></span><span style="color:var(--text-dim);">{right}</span>',
            odd: 'ímpar',
            even: 'par',
            quizHintHidden: 'Dica oculta em modo Quiz',
            shareSum: '{share}% da soma ponderada ({sum})',
            b3Hide: 'Dígitos: ({list}) — some-os e multiplique por <strong>3</strong>',
            b1Hide: 'Dígitos: ({list}) — some-os diretamente (<strong>×1</strong>)',
            gaugeQuizEq: 'Resolva o quiz acima para revelar o salto Módulo 10!',
            gaugeQuizSvg: 'Modo Quiz — Reta numérica oculta até responder ou revelar',
            gaugeEq: '{target} − {sum} = {cd}  (Dígito de Controlo)',
            gaugePlus: '+{cd} (Controlo)',
            gaugeZero: 'Já é múltiplo de 10 → DC = 0',
            gaugeSum: 'Soma={sum}',
            tblPos: 'Pos',
            tblDig: 'Dígito',
            tblW: 'Peso (×)',
            tblProd: 'Produto',
            play: 'Demonstração',
            stop: 'Parar',
            typoChanged: 'Alterou P{p} de <strong>{orig}</strong> → <strong style="color:var(--danger);">{mut}</strong>',
            typoSwapped: 'Trocou P{p1} e P{p2}: <strong>{a}{b}</strong> → <strong style="color:var(--danger);">{b}{a}</strong>',
            typoCaught: '<span style="color:#fca5a5;font-weight:700;">✗ ERRO DETETADO DE IMEDIATO!</span> {desc}.<br>Nova soma ponderada ({newSum}) + dígito de controlo original ({cd}) = <strong>{tot}</strong> → <code>{tot} mod 10 = {rem} ≠ 0</code>. O leitor rejeita o código corrompido!',
            typoBlind: '<span style="color:var(--primary);font-weight:700;">⚠ CASO RARO DETETADO!</span> {desc}. Como |a − b| = 5, <code>5 × (3 − 1) = 10</code>, mantendo o resto mod 10 inalterado — o clássico caso limite matemático do Módulo 10!',
            typoDefault: 'Veja como os leitores óticos detetam erros humanos: clique num botão acima para alterar um dígito ou trocar dois dígitos vizinhos e observe o algoritmo Módulo 10 invalidar o código de imediato.',
            quizStreakLbl: 'Série',
            quizWin: '<span style="color:var(--success);font-weight:700;">✓ Exato!</span> Soma ponderada = <strong>{sum}</strong> → múltiplo de 10 seguinte é <strong>{next10}</strong> → <strong>{next10} − {sum} = {cd}</strong>.',
            quizLose: '<span style="color:#fca5a5;">✗ Não é {guess}.</span> Dica: clique em <strong>Dica</strong> para revelar os subtotais ×3 e ×1 e calcule o que falta até ao múltiplo de 10 seguinte.',
            copyBtn: 'Copiar Código Completo',
            copied: 'Copiado!',
            convEmpty: 'Introduza 11 a 14 dígitos (UPC-A, EAN-13 ou GTIN-14) para ver as conversões automáticas.',
            convNotUpc: 'Fora do intervalo UPC-A',
            convUpcMeta: '12 dígitos · Retalho América do Norte',
            convNonUpcMeta: 'Prefixo EAN ≠ 0 (prefixo fora do intervalo UPC)',
            convEanMeta: '13 dígitos · Código de retalho global',
            convG14Title: 'GTIN-14 (Indicador {ind})',
            convG14Same: 'Unidade base · dígito de controlo inalterado',
            convG14Recalc: 'Caixa logística · dígito de controlo recalculado',
            convCopy: 'Copiar',
            convInspect: 'Inspecionar ↑'
        }
    },

    es: {
        lang: 'es',
        ogLocale: 'es_ES',
        brandSub: 'calculadora',
        nav: { studio: 'Estudio', calc: 'Calculadora', guide: 'Guía', api: 'API' },
        title: 'Calculadora de Dígito de Control GS1 (GTIN-14, EAN-13, UPC, GLN y SSCC) · SSCCAPI',
        description: 'Calculadora gratuita de dígito de control / dígito verificador GS1 (GTIN-8, UPC-A, EAN-13, GTIN-14, GLN y SSCC-18) con conversor UPC↔GTIN y simulador visual Módulo 10.',
        keywords: 'calculadora dígito de control GS1, dígito verificador EAN 13, calculadora GTIN 14, dígito de control SSCC 18, calcular GLN 13, conversor UPC a GTIN, algoritmo módulo 10 GS1, código de barras GS1-128',
        ogTitle: 'Calculadora de Dígito de Control GS1 (GTIN-14, EAN-13, UPC, GLN y SSCC) · SSCCAPI',
        ogDesc: 'Calcula, valida y aprende visualmente el algoritmo Módulo 10 GS1 para GTIN, EAN-13, UPC-A, GLN y SSCC-18, con conversor UPC↔GTIN-14 y simulador de errores.',
        twTitle: 'Calculadora de Dígito de Control GS1 (GTIN, EAN, UPC, GLN y SSCC)',
        twDesc: 'Calcula dígitos de control GS1 Módulo 10 paso a paso y convierte UPC-A ↔ EAN-13 ↔ GTIN-14 al instante.',
        schemaAppName: 'Calculadora de Dígito de Control GS1 y Conversor UPC a GTIN',
        schemaAppDesc: 'Calcula, valida, convierte (UPC-A, EAN-13, GTIN-14) y visualiza paso a paso el dígito de control oficial GS1 Módulo 10 para GTIN-8, GTIN-12, GTIN-13, GTIN-14, GLN-13 y SSCC-18.',
        schemaHowToName: 'Cómo calcular el dígito de control GS1 (Módulo 10)',
        schemaHowToDesc: 'Explicación visual paso a paso del algoritmo oficial GS1 Módulo 10 para GTIN, EAN-13, UPC-A, GLN-13 y SSCC-18.',
        howToSteps: [
            { name: 'Asignar pesos alternos de derecha a izquierda', text: 'Comenzando por el último dígito del cuerpo (justo antes del dígito de control), asigne pesos alternos de 3 y 1 avanzando de derecha a izquierda.' },
            { name: 'Multiplicar y sumar los productos', text: 'Multiplique cada dígito por su peso (3 o 1) y sume todos los productos — o sume primero los dígitos con peso ×3, multiplique el subtotal por 3 y añada los dígitos ×1.' },
            { name: 'Calcular la distancia al siguiente múltiplo de 10', text: 'Reste la suma ponderada al múltiplo de 10 igual o inmediatamente superior: Dígito de Control = (10 - (Suma % 10)) % 10.' }
        ],
        h1Pre: 'LABORATORIO VISUAL · ',
        h1Accent: 'DÍGITO DE CONTROL',
        h1Post: ' GS1',
        tagline: 'Calcule, visualice y domine el algoritmo oficial GS1 Módulo 10 (dígito verificador)',
        modeAria: 'Modo de la calculadora',
        tabLearn: 'Tutor Visual',
        tabQuiz: 'Quiz Práctico',
        samples: { sscc: '38401234560000001', gtin13: '840123456789', gtin12: '01234567890', gtin14: '1840123456789', gtin8: '8401234', gln: '840123400001', prefix: '840' },
        types: {
            sscc: { tab: 'SSCC-18', label: 'SSCC-18 (Palés)' },
            gtin13: { tab: 'GTIN-13 (EAN)', label: 'GTIN-13 / EAN-13' },
            gtin12: { tab: 'GTIN-12 (UPC)', label: 'GTIN-12 / UPC-A' },
            gtin14: { tab: 'GTIN-14', label: 'GTIN-14 (Cajas)' },
            gtin8: { tab: 'GTIN-8', label: 'GTIN-8 / EAN-8' },
            gln: { tab: 'GLN-13', label: 'GLN-13 (Ubicaciones)' }
        },
        inputExcl: 'sin el dígito de control final:',
        digitsUnit: 'dígitos',
        inputPlaceholder: 'Introduzca los dígitos...',
        btnRandom: 'Aleatorio',
        btnRandomTitle: 'Generar un código válido aleatorio con la longitud GS1 actual',
        resLabelTop: 'CÓDIGO COMPLETO VERIFICADO:',
        resLabelQuiz: 'RETO (ENCUENTRE EL ?):',
        cdLabel: 'DÍGITO DE CONTROL:',
        btnStudio: 'Generar Código de Barras / Etiqueta',
        btnCopy: 'Copiar Código Completo',
        btnCopied: '¡Copiado!',
        quizTitle: '🧠 Reto Práctico — ¡Calcule el Dígito de Control!',
        quizStreak: 'Racha',
        quizIntro: 'Utilice los bloques <strong>×3</strong> (ámbar) y <strong>×1</strong> (cian) inferiores, halle la distancia al siguiente múltiplo de 10 y pulse su respuesta:',
        btnHint: 'Pista',
        btnNewCode: 'Nuevo Código',
        steps: ['Todos los Pasos', '1. Pesos (←)', '2. Grupos ×3 / ×1', '3. Salto Mód-10', '4. Prueba de Errores'],
        btnPrev: 'Paso anterior',
        btnNext: 'Paso siguiente',
        btnPlay: 'Recorrido',
        btnStop: 'Detener',
        rtlLeft: 'Haga clic o pase el cursor sobre cualquier dígito para inspeccionar su aporte:',
        rtlRight: '← Los pesos empiezan SIEMPRE en ×3 desde la derecha',
        b3Head: '● GRUPO PESO ×3 (POSICIONES IMPARES DESDE LA DERECHA)',
        b1Head: '● GRUPO PESO ×1 (POSICIONES PARES DESDE LA DERECHA)',
        gaugeTitle: 'Salto Visual Módulo 10 al Siguiente Múltiplo de 10',
        gaugeAria: 'Recta numérica Módulo 10 que muestra la distancia desde la suma ponderada al siguiente múltiplo de 10',
        typoTitle: '🧪 Por Qué Importa el Dígito de Control — Simulador de Detección de Errores',
        typoSingle: 'Simular Error de 1 Dígito',
        typoSwap: 'Simular Intercambio Adyacente',
        typoReset: 'Restablecer',
        typoDefault: 'Compruebe cómo los escáneres detectan fallos humanos: pulse un botón superior para alterar un dígito o intercambiar dos dígitos contiguos y observe cómo falla el control Módulo 10 al instante.',
        classicSummary: 'Mostrar tabla clásica desglosada (P1..Pn)',
        ctaTitle: 'Genere Códigos de Barras GS1-128 y QR 2D, Zebra ZPL o Etiquetas de Palé',
        ctaDesc: 'Exporte códigos de barras SSCC independientes (<code>SVG</code>, <code>PNG 300 DPI</code>, <code>ZPL-II</code>) o etiquetas logísticas GS1 completas (A5 / 4×6") en el Estudio Web o mediante nuestra API REST Cloud (25 etiquetas gratis incluidas · packs Pro desde 5 €).',
        ctaBtn1: 'Abrir Estudio de Etiquetas',
        ctaBtn2: 'API REST y Sandbox Swagger',
        seoCols: [
            {
                h2: '1. El Atajo Mental en 3 Pasos',
                html: '<ul><li><strong>Empiece por la Derecha:</strong> Asigne <strong>×3</strong> al último dígito del cuerpo, <strong>×1</strong> al siguiente hacia la izquierda, alternando <code>3, 1, 3, 1...</code></li><li><strong>Agrupe y Multiplique:</strong> Sume todos los dígitos <strong>×3</strong> y multiplique el subtotal por 3 una sola vez; luego sume todos los dígitos <strong>×1</strong>.</li><li><strong>Redondee a 10:</strong> La diferencia (0–9) hasta el siguiente múltiplo de 10 es su dígito de control.</li></ul>'
            },
            {
                h2: '2. ¿Por Qué Alternar 3 y 1?',
                html: '<p>Una suma simple detecta errores de un solo dígito, pero <em>no puede</em> detectar inversiones de dígitos vecinos (<code>47</code> vs <code>74</code>). Alternar los pesos <strong>3</strong> y <strong>1</strong> detecta el <strong>100% de los errores simples</strong> y cerca del <strong>89% de las transposiciones adyacentes</strong>.</p>'
            },
            {
                h2: '3. Fórmula Universal GS1',
                html: '<p>Todas las claves GS1 (<strong>GTIN-8, 12, 13, 14, GLN-13 y SSCC-18</strong>) aplican exactamente la misma ecuación:</p><p><code>DC = (10 − (Suma mod 10)) mod 10</code></p>'
            }
        ],
        proTip: '<strong>Consejo Técnico:</strong> Como los pesos se anclan desde la <em>derecha</em>, un SSCC-18 (17 dígitos de cuerpo) empieza por <strong>×3</strong> en la posición P1, mientras que un EAN-13 o GLN-13 (12 dígitos de cuerpo) empieza por <strong>×1</strong> en P1. ¡Cambie de pestaña arriba para ver cómo se invierten los colores!',
        convHeading: '4. Conversor UPC-A ↔ EAN-13 ↔ GTIN-14 (Ceros Iniciales e Indicador Logístico)',
        convIntro: 'Introduzca cualquier código <strong>UPC-A (12)</strong>, <strong>EAN-13 (13)</strong> o <strong>GTIN-14 (14)</strong> (con o sin dígito de control) para convertir entre formatos comerciales y logísticos con recálculo automático Módulo 10.',
        convPlaceholder: 'Pegue un código UPC-A, EAN-13 o GTIN-14...',
        convIndLabel: 'Indicador GTIN-14:',
        convIndOptions: [
            '0 — Unidad base (mismo DC)',
            '1 — Caja / Embalaje Nivel 1',
            '2 — Caja / Embalaje Nivel 2',
            '3 — Caja / Embalaje Nivel 3',
            '4 — Caja / Embalaje Nivel 4',
            '5 — Caja / Embalaje Nivel 5',
            '6 — Caja / Embalaje Nivel 6',
            '7 — Caja / Embalaje Nivel 7',
            '8 — Caja / Embalaje Nivel 8'
        ],
        refAria: 'Tabla de referencia de longitudes y pesos de las claves GS1',
        refHeaders: ['Clave GS1', 'Dígitos Totales', 'Cuerpo (Payload)', 'Peso en Posición 1', 'Uso Principal'],
        refRows: [
            ['GTIN-8 (EAN-8)', '8', '7', '×3', 'Artículos pequeños de venta minorista'],
            ['GTIN-12 (UPC-A)', '12', '11', '×3', 'Punto de venta en Norteamérica'],
            ['GTIN-13 (EAN-13)', '13', '12', '×1', 'Comercio minorista global (POS)'],
            ['GLN-13', '13', '12', '×1', 'Almacenes, muelles y socios EDI'],
            ['GTIN-14 (ITF-14)', '14', '13', '×3', 'Cajas, agrupaciones y unidades de expedición'],
            ['SSCC-18', '18', '17', '×3', 'Palés logísticos y etiquetas GS1-128']
        ],
        faqHeading: '5. Preguntas Frecuentes — Dígito de Control GS1 y Conversión GTIN',
        faqs: [
            {
                q: '¿Cómo se calcula el dígito de control (dígito verificador) GS1 para GTIN, EAN, UPC, GLN o SSCC?',
                aText: 'Comience por el último dígito situado justo antes del dígito de control y asigne pesos alternos de 3 y 1 de derecha a izquierda. Sume todos los productos ponderados y calcule la distancia al siguiente múltiplo de 10 mediante la fórmula DC = (10 - (Suma mod 10)) mod 10.',
                aHtml: 'Comience por el último dígito situado justo antes del dígito de control y asigne pesos alternos de <strong>3</strong> y <strong>1</strong> de derecha a izquierda. Sume todos los productos ponderados y calcule la distancia al siguiente múltiplo de 10 mediante la fórmula <code>DC = (10 − (Suma mod 10)) mod 10</code>.'
            },
            {
                q: '¿Cómo convertir un UPC-A de 12 dígitos a EAN-13 o GTIN-14?',
                aText: 'Anteponiendo un cero inicial (0) a un UPC-A de 12 dígitos se obtiene el EAN-13 / GTIN-13; anteponiendo dos ceros (00) se obtiene el GTIN-14 de unidad base. Para cajas o embalajes logísticos con indicador del 1 al 8, sustituya el primer dígito por el indicador y recalcule el dígito de control Módulo 10.',
                aHtml: 'Anteponiendo un cero inicial (<code>0</code>) a un UPC-A de 12 dígitos se obtiene el <strong>EAN-13 / GTIN-13</strong>; anteponiendo dos ceros (<code>00</code>) se obtiene el <strong>GTIN-14</strong> de unidad base. Para cajas o embalajes logísticos con indicador del <code>1</code> al <code>8</code>, sustituya el primer dígito por el indicador y recalcule el dígito de control Módulo 10.'
            },
            {
                q: '¿Cambiar de UPC-A a EAN-13 o GTIN-14 modifica el dígito de control?',
                aText: 'Añadir ceros a la izquierda (indicador 0) nunca altera el dígito de control, ya que cero multiplicado por cualquier peso es cero. En cambio, al asignar un indicador logístico GTIN-14 distinto de cero (del 1 al 8) para una caja o bulto, el dígito de control cambia y debe recalcularse.',
                aHtml: 'Añadir ceros a la izquierda (indicador <code>0</code>) nunca altera el dígito de control, ya que cero multiplicado por cualquier peso es cero. En cambio, al asignar un indicador logístico GTIN-14 distinto de cero (del <code>1</code> al <code>8</code>) para una caja o bulto, el dígito de control cambia y debe recalcularse.'
            },
            {
                q: '¿Cómo se calcula el dígito de control de un código GLN-13?',
                aText: 'El Global Location Number (GLN-13) utiliza exactamente el mismo cuerpo de 12 dígitos y la misma ponderación Módulo 10 que el GTIN-13 / EAN-13. Tome los 12 primeros dígitos, multiplique posiciones alternas por 3 y 1 de derecha a izquierda, sume los productos y reste al múltiplo de 10 superior.',
                aHtml: 'El Global Location Number (<strong>GLN-13</strong>) utiliza exactamente el mismo cuerpo de 12 dígitos y la misma ponderación Módulo 10 que el GTIN-13 / EAN-13. Tome los 12 primeros dígitos, multiplique posiciones alternas por 3 y 1 de derecha a izquierda, sume los productos y reste al múltiplo de 10 superior.'
            },
            {
                q: '¿Se puede convertir un GTIN-14 o EAN-13 de vuelta a UPC-A de 12 dígitos?',
                aText: 'Sí: cuando un EAN-13 comienza por 0 o un GTIN-14 comienza por 00, basta con eliminar los ceros iniciales para obtener el UPC-A exacto de 12 dígitos con el mismo dígito de control. Si el GTIN-14 comienza con un indicador del 1 al 8 seguido de 0, elimine los dos primeros dígitos y recalcule el dígito de control sobre los 11 dígitos del cuerpo UPC.',
                aHtml: 'Sí: cuando un EAN-13 comienza por <code>0</code> o un GTIN-14 comienza por <code>00</code>, basta con eliminar los ceros iniciales para obtener el UPC-A exacto de 12 dígitos con el mismo dígito de control. Si el GTIN-14 comienza con un indicador del <code>1</code> al <code>8</code> seguido de <code>0</code>, elimine los dos primeros dígitos y recalcule el dígito de control sobre los 11 dígitos del cuerpo UPC.'
            }
        ],
        footerGuide: 'Guía GS1',
        footerApi: 'API REST',
        js: {
            excl: 'sin el dígito de control final:',
            digits: 'dígitos',
            lenNote: 'Nota: ha introducido {len} dígitos (el cuerpo estándar de {type} es de {exp} dígitos).',
            badge0: 'RESUMEN',
            badge1: 'PASO 1 / 4',
            badge2: 'PASO 2 / 4',
            badge3: 'PASO 3 / 4',
            badge4: 'PASO 4 / 4',
            s0Quiz: '<strong>Quiz Activo:</strong> Los pesos alternan entre <strong>×3</strong> (ámbar) y <strong>×1</strong> (cian) de derecha a izquierda. ¡Sume los productos y halle cuánto falta hasta el siguiente múltiplo de 10!',
            s0Show: '<strong>Demostración Visual Completa:</strong> Multiplique cada dígito de derecha a izquierda por pesos alternos <strong>×3</strong> y <strong>×1</strong> → suma ponderada = <strong>{sum}</strong> → la distancia al siguiente múltiplo de 10 (<strong>{next10}</strong>) da el dígito de control <strong style="color:var(--success);">{cd}</strong>.',
            s1: '<strong>Asignar Pesos de Derecha a Izquierda (←):</strong> Empiece en el último dígito del cuerpo <strong>P{n}</strong> con <strong style="color:var(--primary);">×3</strong> y alterne <strong style="color:var(--cyan);">×1</strong>, <strong style="color:var(--primary);">×3</strong>… ¡Por eso el algoritmo es idéntico en claves GS1 de 8, 12, 13, 14 y 18 dígitos!',
            s2: '<strong>Atajo por Grupos:</strong> Suma de dígitos <strong style="color:var(--primary);">×3</strong> ({sum3d}) × 3 = <strong>{sum3t}</strong>, más la suma de dígitos <strong style="color:var(--cyan);">×1</strong> = <strong>{sum1t}</strong> → Suma Ponderada Total = <strong>{sum}</strong>.',
            s3Quiz: '<strong>Salto Módulo 10:</strong> Tome la suma ponderada y encuentre el menor dígito (0–9) que la redondea al siguiente múltiplo de 10.',
            s3Show: '<strong>Salto al Siguiente Múltiplo de 10:</strong> Desde <strong>{sum}</strong>, el múltiplo de 10 igual o superior más cercano es <strong>{next10}</strong>. Reste: <code>{next10} − {sum} = </code><strong style="color:var(--success);">{cd}</strong>{exact}',
            s3Exact: ' (ya es múltiplo de 10, ¡así que el dígito de control es 0!)',
            s4: '<strong>Verificar y Detectar Errores:</strong> Con el dígito de control <strong>{cd}</strong> añadido (peso ×1), el código completo suma <strong>{next10}</strong> (<code>{next10} mod 10 = 0</code>). ¡Pruebe el <strong>Simulador de Errores</strong> morado abajo para alterar un dígito o invertir dos contiguos!',
            tileTitle: 'Posición P{p} (#{rtl} desde la derecha): {d} × {w} = {prod}',
            cdTileTitle: 'Dígito de Control GS1 final (peso ×1 al validar el código completo)',
            cdTileTop: 'CONTROL',
            cdTileShort: 'DC',
            cdGuess: 'calcule',
            inspTip: '<span><strong>Consejo:</strong> Pase el cursor o pulse cualquier dígito superior para ver su posición, peso y porcentaje de la suma.</span><span style="color:var(--cyan);">Último dígito del cuerpo P{p} = <strong>{d} × 3 = {prod}</strong></span>',
            inspFocus: '<span>Inspeccionando <strong>Posición P{p}</strong> (#{rtl} desde la derecha → posición {parity}): dígito <strong>{d}</strong> × peso <strong style="color:{col};">{w}</strong> = <strong>{prod}</strong></span><span style="color:var(--text-dim);">{right}</span>',
            odd: 'impar',
            even: 'par',
            quizHintHidden: 'Pista oculta en modo Quiz',
            shareSum: '{share}% de la suma ponderada ({sum})',
            b3Hide: 'Dígitos: ({list}) — súmelos y multiplique por <strong>3</strong>',
            b1Hide: 'Dígitos: ({list}) — súmelos directamente (<strong>×1</strong>)',
            gaugeQuizEq: '¡Resuelva el quiz superior para revelar el salto Módulo 10!',
            gaugeQuizSvg: 'Modo Quiz — Recta numérica oculta hasta responder o revelar',
            gaugeEq: '{target} − {sum} = {cd}  (Dígito de Control)',
            gaugePlus: '+{cd} (Control)',
            gaugeZero: 'Ya es múltiplo de 10 → DC = 0',
            gaugeSum: 'Suma={sum}',
            tblPos: 'Pos',
            tblDig: 'Dígito',
            tblW: 'Peso (×)',
            tblProd: 'Producto',
            play: 'Recorrido',
            stop: 'Detener',
            typoChanged: 'Cambió P{p} de <strong>{orig}</strong> → <strong style="color:var(--danger);">{mut}</strong>',
            typoSwapped: 'Intercambió P{p1} y P{p2}: <strong>{a}{b}</strong> → <strong style="color:var(--danger);">{b}{a}</strong>',
            typoCaught: '<span style="color:#fca5a5;font-weight:700;">✗ ¡ERROR DETECTADO AL INSTANTE!</span> {desc}.<br>Nueva suma ponderada ({newSum}) + dígito de control original ({cd}) = <strong>{tot}</strong> → <code>{tot} mod 10 = {rem} ≠ 0</code>. ¡El escáner rechaza el código corrupto!',
            typoBlind: '<span style="color:var(--primary);font-weight:700;">⚠ ¡EXCEPCIÓN MATEMÁTICA ENCONTRADA!</span> {desc}. Como |a − b| = 5, <code>5 × (3 − 1) = 10</code>, dejando mod 10 sin cambios — ¡el clásico caso límite del algoritmo Módulo 10!',
            typoDefault: 'Compruebe cómo los escáneres detectan fallos humanos: pulse un botón superior para alterar un dígito o intercambiar dos dígitos contiguos y observe cómo falla el control Módulo 10 al instante.',
            quizStreakLbl: 'Racha',
            quizWin: '<span style="color:var(--success);font-weight:700;">✓ ¡Exacto!</span> Suma ponderada = <strong>{sum}</strong> → siguiente múltiplo de 10 es <strong>{next10}</strong> → <strong>{next10} − {sum} = {cd}</strong>.',
            quizLose: '<span style="color:#fca5a5;">✗ No es {guess}.</span> Consejo: pulse <strong>Pista</strong> para ver los subtotales ×3 y ×1 y halle la distancia al siguiente múltiplo de 10.',
            copyBtn: 'Copiar Código Completo',
            copied: '¡Copiado!',
            convEmpty: 'Introduzca entre 11 y 14 dígitos (UPC-A, EAN-13 o GTIN-14) para ver las conversiones instantáneas.',
            convNotUpc: 'Fuera del rango UPC-A',
            convUpcMeta: '12 dígitos · Punto de venta Norteamérica',
            convNonUpcMeta: 'Prefijo EAN ≠ 0 (fuera del rango UPC)',
            convEanMeta: '13 dígitos · Código de barras global',
            convG14Title: 'GTIN-14 (Indicador {ind})',
            convG14Same: 'Unidad base · dígito de control sin cambios',
            convG14Recalc: 'Caja logística · dígito de control recalculado',
            convCopy: 'Copiar',
            convInspect: 'Inspeccionar ↑'
        }
    },

    fr: {
        lang: 'fr',
        ogLocale: 'fr_FR',
        brandSub: 'calculateur',
        nav: { studio: 'Studio', calc: 'Calculateur', guide: 'Guide', api: 'API' },
        title: 'Calculateur de Clé de Contrôle GS1 (GTIN-14, EAN-13, UPC, GLN et SSCC) · SSCCAPI',
        description: 'Calculateur gratuit de clé de contrôle GS1 (GTIN-8, UPC-A, EAN-13, GTIN-14, GLN-13 et SSCC-18) avec convertisseur UPC↔GTIN et démonstration visuelle Modulo 10.',
        keywords: 'calcul clé de contrôle GS1, calculateur EAN 13, clé de contrôle GTIN 14, clé de contrôle SSCC 18, calculateur GLN 13, convertisseur UPC vers GTIN, algorithme modulo 10 GS1, code-barres GS1-128',
        ogTitle: 'Calculateur de Clé de Contrôle GS1 (GTIN-14, EAN-13, UPC, GLN et SSCC) · SSCCAPI',
        ogDesc: 'Calculez, vérifiez et maîtrisez visuellement l’algorithme Modulo 10 GS1 pour GTIN, EAN-13, UPC-A, GLN et SSCC-18, avec convertisseur UPC↔GTIN-14 et simulateur d’erreurs.',
        twTitle: 'Calculateur de Clé de Contrôle GS1 (GTIN, EAN, UPC, GLN et SSCC)',
        twDesc: 'Calculez pas à pas la clé de contrôle GS1 Modulo 10 et convertissez UPC-A ↔ EAN-13 ↔ GTIN-14 instantanément.',
        schemaAppName: 'Calculateur de Clé de Contrôle GS1 et Convertisseur UPC vers GTIN',
        schemaAppDesc: 'Calculez, vérifiez, convertissez (UPC-A, EAN-13, GTIN-14) et visualisez l’algorithme officiel GS1 Modulo 10 pour GTIN-8, GTIN-12, GTIN-13, GTIN-14, GLN-13 et SSCC-18.',
        schemaHowToName: 'Comment calculer une clé de contrôle GS1 (Modulo 10)',
        schemaHowToDesc: 'Explication visuelle étape par étape du calcul officiel de la clé de contrôle GS1 Modulo 10 pour GTIN, EAN-13, UPC-A, GLN-13 et SSCC-18.',
        howToSteps: [
            { name: 'Attribuer des poids alternés de droite à gauche', text: 'En partant du dernier chiffre utile (juste avant la clé de contrôle), attribuez des poids alternés de 3 et 1 en progressant de droite à gauche.' },
            { name: 'Multiplier et additionner les produits', text: 'Multipliez chaque chiffre par son poids (3 ou 1) puis additionnez tous les produits — ou additionnez d’abord tous les chiffres ×3, multipliez par 3, puis ajoutez les chiffres ×1.' },
            { name: 'Calculer l’écart jusqu’au multiple de 10 suivant', text: 'Soustrayez la somme pondérée au multiple de 10 égal ou immédiatement supérieur : Clé de contrôle = (10 - (Somme % 10)) % 10.' }
        ],
        h1Pre: 'LABORATOIRE VISUEL · ',
        h1Accent: 'CLÉ DE CONTRÔLE',
        h1Post: ' GS1',
        tagline: 'Calculez, visualisez et maîtrisez l’algorithme officiel GS1 Modulo 10',
        modeAria: 'Mode du calculateur',
        tabLearn: 'Tuteur Visuel',
        tabQuiz: 'Quiz Pratique',
        samples: { sscc: '33001234560000001', gtin13: '300123456789', gtin12: '01234567890', gtin14: '1300123456789', gtin8: '3001234', gln: '300123400001', prefix: '300' },
        types: {
            sscc: { tab: 'SSCC-18', label: 'SSCC-18 (Palettes)' },
            gtin13: { tab: 'GTIN-13 (EAN)', label: 'GTIN-13 / EAN-13' },
            gtin12: { tab: 'GTIN-12 (UPC)', label: 'GTIN-12 / UPC-A' },
            gtin14: { tab: 'GTIN-14', label: 'GTIN-14 (Colis)' },
            gtin8: { tab: 'GTIN-8', label: 'GTIN-8 / EAN-8' },
            gln: { tab: 'GLN-13', label: 'GLN-13 (Lieux)' }
        },
        inputExcl: 'sans la clé de contrôle finale :',
        digitsUnit: 'chiffres',
        inputPlaceholder: 'Saisissez les chiffres...',
        btnRandom: 'Aléatoire',
        btnRandomTitle: 'Générer une séquence aléatoire valide pour la longueur GS1 sélectionnée',
        resLabelTop: 'CODE COMPLET VÉRIFIÉ :',
        resLabelQuiz: 'DÉFI (TROUVEZ LE ?) :',
        cdLabel: 'CLÉ DE CONTRÔLE :',
        btnStudio: 'Générer Code-Barres / Étiquette',
        btnCopy: 'Copier le Code Complet',
        btnCopied: 'Copié !',
        quizTitle: '🧠 Défi Pratique — Calculez la Clé de Contrôle !',
        quizStreak: 'Série',
        quizIntro: 'Utilisez les tuiles <strong>×3</strong> (ambre) et <strong>×1</strong> (cyan) ci-dessous, trouvez l’écart jusqu’au multiple de 10 suivant et choisissez votre réponse :',
        btnHint: 'Indice',
        btnNewCode: 'Nouveau Code',
        steps: ['Toutes les Étapes', '1. Poids (←)', '2. Groupes ×3 / ×1', '3. Saut Mod-10', '4. Preuve d’Erreurs'],
        btnPrev: 'Étape précédente',
        btnNext: 'Étape suivante',
        btnPlay: 'Démonstration',
        btnStop: 'Arrêter',
        rtlLeft: 'Cliquez ou survolez un chiffre pour inspecter sa contribution exacte :',
        rtlRight: '← Les poids commencent TOUJOURS par ×3 depuis la droite',
        b3Head: '● GROUPE POIDS ×3 (RANGS IMPAIRS DEPUIS LA DROITE)',
        b1Head: '● GROUPE POIDS ×1 (RANGS PAIRS DEPUIS LA DROITE)',
        gaugeTitle: 'Saut Visuel Modulo 10 vers le Multiple de 10 Suivant',
        gaugeAria: 'Droite numérique Modulo 10 montrant la distance entre la somme pondérée et le multiple de 10 suivant',
        typoTitle: '🧪 Pourquoi une Clé de Contrôle ? — Test Interactif de Détection d’Erreurs',
        typoSingle: 'Simuler 1 Erreur de Saisie',
        typoSwap: 'Simuler une Inversion',
        typoReset: 'Réinitialiser',
        typoDefault: 'Voyez comment les lecteurs optiques interceptent les erreurs humaines : cliquez ci-dessus pour modifier un chiffre ou inverser deux chiffres voisins et observer la rupture immédiate du contrôle Modulo 10.',
        classicSummary: 'Afficher le tableau classique détaillé (P1..Pn)',
        ctaTitle: 'Générez des Codes-Barres GS1-128 & QR 2D, Zebra ZPL ou Étiquettes Palette',
        ctaDesc: 'Exportez des codes-barres SSCC autonomes (<code>SVG</code>, <code>PNG 300 DPI</code>, <code>ZPL-II</code>) ou des étiquettes logistiques GS1 complètes (A5 / 4×6") dans le Studio Web ou via notre API REST Cloud (25 étiquettes gratuites incluses · packs Pro dès 5 €).',
        ctaBtn1: 'Ouvrir le Studio d’Étiquettes',
        ctaBtn2: 'API REST et Sandbox Swagger',
        seoCols: [
            {
                h2: '1. L’Astuce Mentale en 3 Étapes',
                html: '<ul><li><strong>Partez de la Droite :</strong> Attribuez <strong>×3</strong> au dernier chiffre utile, <strong>×1</strong> au précédent vers la gauche, en alternant <code>3, 1, 3, 1...</code></li><li><strong>Regroupez et Multipliez :</strong> Additionnez tous les chiffres <strong>×3</strong> puis multipliez ce sous-total par 3 ; ajoutez ensuite les chiffres <strong>×1</strong>.</li><li><strong>Complétez à 10 :</strong> L’écart (0–9) jusqu’au multiple de 10 suivant constitue votre clé de contrôle.</li></ul>'
            },
            {
                h2: '2. Pourquoi Alterner 3 et 1 ?',
                html: '<p>Une somme simple détecte une faute sur un chiffre, mais <em>ne détecte pas</em> deux chiffres voisins inversés (<code>47</code> vs <code>74</code>). La pondération alternée (<strong>3</strong> et <strong>1</strong>) intercepte <strong>100 % des erreurs simples</strong> et environ <strong>89 % des inversions adjacentes</strong>.</p>'
            },
            {
                h2: '3. Formule Universelle GS1',
                html: '<p>Toutes les clés GS1 (<strong>GTIN-8, 12, 13, 14, GLN-13 et SSCC-18</strong>) reposent sur exactement la même équation :</p><p><code>Clé = (10 − (Somme mod 10)) mod 10</code></p>'
            }
        ],
        proTip: '<strong>Astuce Technique :</strong> Comme la pondération s’ancre depuis la <em>droite</em>, un SSCC-18 (17 chiffres utiles) commence par <strong>×3</strong> en position P1, tandis qu’un EAN-13 ou GLN-13 (12 chiffres utiles) commence par <strong>×1</strong> en P1. Changez d’onglet ci-dessus pour observer l’inversion des couleurs !',
        convHeading: '4. Convertisseur UPC-A ↔ EAN-13 ↔ GTIN-14 (Zéros en Tête et Indicateur Logistique)',
        convIntro: 'Saisissez n’importe quel code <strong>UPC-A (12)</strong>, <strong>EAN-13 (13)</strong> ou <strong>GTIN-14 (14)</strong> (avec ou sans clé de contrôle) pour convertir entre formats distribution et logistique avec recalcul automatique Modulo 10.',
        convPlaceholder: 'Collez un code UPC-A, EAN-13 ou GTIN-14...',
        convIndLabel: 'Indicateur GTIN-14 :',
        convIndOptions: [
            '0 — Unité de base (clé inchangée)',
            '1 — Colis / Carton Niveau 1',
            '2 — Colis / Carton Niveau 2',
            '3 — Colis / Carton Niveau 3',
            '4 — Colis / Carton Niveau 4',
            '5 — Colis / Carton Niveau 5',
            '6 — Colis / Carton Niveau 6',
            '7 — Colis / Carton Niveau 7',
            '8 — Colis / Carton Niveau 8'
        ],
        refAria: 'Tableau de référence des longueurs et poids des clés GS1',
        refHeaders: ['Clé GS1', 'Chiffres Totaux', 'Base Utile', 'Poids en Position 1', 'Usage Principal'],
        refRows: [
            ['GTIN-8 (EAN-8)', '8', '7', '×3', 'Petits produits de détail'],
            ['GTIN-12 (UPC-A)', '12', '11', '×3', 'Point de vente Amérique du Nord'],
            ['GTIN-13 (EAN-13)', '13', '12', '×1', 'Grande distribution mondiale (POS)'],
            ['GLN-13', '13', '12', '×1', 'Entrepôts, quais et partenaires EDI'],
            ['GTIN-14 (ITF-14)', '14', '13', '×3', 'Colis, cartons et unités commerciales'],
            ['SSCC-18', '18', '17', '×3', 'Palettes logistiques et étiquettes GS1-128']
        ],
        faqHeading: '5. Foire aux Questions — Clé de Contrôle GS1 et Conversion GTIN',
        faqs: [
            {
                q: 'Comment calculer une clé de contrôle GS1 pour un GTIN, EAN-13, UPC, GLN ou SSCC ?',
                aText: 'Partez du dernier chiffre situé juste avant la clé de contrôle et attribuez des poids alternés de 3 et 1 en allant de droite à gauche. Additionnez tous les produits pondérés puis calculez la distance au multiple de 10 suivant avec la formule Clé = (10 - (Somme mod 10)) mod 10.',
                aHtml: 'Partez du dernier chiffre situé juste avant la clé de contrôle et attribuez des poids alternés de <strong>3</strong> et <strong>1</strong> en allant de droite à gauche. Additionnez tous les produits pondérés puis calculez la distance au multiple de 10 suivant avec la formule <code>Clé = (10 − (Somme mod 10)) mod 10</code>.'
            },
            {
                q: 'Comment convertir un code UPC-A (12 chiffres) en EAN-13 ou GTIN-14 ?',
                aText: 'Ajoutez un zéro en tête (0) à un UPC-A de 12 chiffres pour obtenir son EAN-13 / GTIN-13, ou deux zéros en tête (00) pour former le GTIN-14 de l’unité de base. Pour un colis logistique utilisant un indicateur d’emballage de 1 à 8, placez cet indicateur en première position et recalculez la clé de contrôle Modulo 10.',
                aHtml: 'Ajoutez un zéro en tête (<code>0</code>) à un UPC-A de 12 chiffres pour obtenir son <strong>EAN-13 / GTIN-13</strong>, ou deux zéros en tête (<code>00</code>) pour former le <strong>GTIN-14</strong> de l’unité de base. Pour un colis logistique utilisant un indicateur d’emballage de <code>1</code> à <code>8</code>, placez cet indicateur en première position et recalculez la clé de contrôle Modulo 10.'
            },
            {
                q: 'La conversion d’un UPC-A en EAN-13 ou GTIN-14 modifie-t-elle la clé de contrôle ?',
                aText: 'L’ajout de zéros en tête (indicateur 0) ne modifie jamais la clé de contrôle, car zéro multiplié par n’importe quel poids vaut zéro. En revanche, l’attribution d’un indicateur logistique GTIN-14 compris entre 1 et 8 pour un carton modifie la somme pondérée et impose de recalculer la clé.',
                aHtml: 'L’ajout de zéros en tête (indicateur <code>0</code>) ne modifie jamais la clé de contrôle, car zéro multiplié par n’importe quel poids vaut zéro. En revanche, l’attribution d’un indicateur logistique GTIN-14 compris entre <code>1</code> et <code>8</code> pour un carton modifie la somme pondérée et impose de recalculer la clé.'
            },
            {
                q: 'Comment calculer la clé de contrôle d’un code GLN-13 ?',
                aText: 'Un Global Location Number (GLN-13) utilise exactement la même base utile de 12 chiffres et la même pondération Modulo 10 qu’un EAN-13 / GTIN-13. Multipliez alternativement les 12 chiffres par 3 et 1 de droite à gauche, additionnez les résultats et soustrayez au multiple de 10 immédiatement supérieur.',
                aHtml: 'Un Global Location Number (<strong>GLN-13</strong>) utilise exactement la même base utile de 12 chiffres et la même pondération Modulo 10 qu’un EAN-13 / GTIN-13. Multipliez alternativement les 12 chiffres par 3 et 1 de droite à gauche, additionnez les résultats et soustrayez au multiple de 10 immédiatement supérieur.'
            },
            {
                q: 'Peut-on convertir un GTIN-14 ou un EAN-13 vers un UPC-A à 12 chiffres ?',
                aText: 'Oui : dès qu’un EAN-13 commence par 0 ou qu’un GTIN-14 commence par 00, la suppression de ces zéros en tête restitue le code UPC-A exact à 12 chiffres avec la même clé de contrôle. Si le GTIN-14 débute par un indicateur de 1 à 8 suivi d’un 0, retirez les deux premiers chiffres et recalculez la clé sur les 11 chiffres utiles.',
                aHtml: 'Oui : dès qu’un EAN-13 commence par <code>0</code> ou qu’un GTIN-14 commence par <code>00</code>, la suppression de ces zéros en tête restitue le code UPC-A exact à 12 chiffres avec la même clé de contrôle. Si le GTIN-14 débute par un indicateur de <code>1</code> à <code>8</code> suivi d’un <code>0</code>, retirez les deux premiers chiffres et recalculez la clé sur les 11 chiffres utiles.'
            }
        ],
        footerGuide: 'Guide GS1',
        footerApi: 'API REST',
        js: {
            excl: 'sans la clé de contrôle finale :',
            digits: 'chiffres',
            lenNote: 'Remarque : {len} chiffres saisis (la base standard {type} comporte {exp} chiffres).',
            badge0: 'VUE D’ENSEMBLE',
            badge1: 'ÉTAPE 1 / 4',
            badge2: 'ÉTAPE 2 / 4',
            badge3: 'ÉTAPE 3 / 4',
            badge4: 'ÉTAPE 4 / 4',
            s0Quiz: '<strong>Quiz Actif :</strong> Les poids alternent entre <strong>×3</strong> (ambre) et <strong>×1</strong> (cyan) de droite à gauche. Additionnez les produits et trouvez l’écart jusqu’au multiple de 10 suivant !',
            s0Show: '<strong>Preuve Visuelle Complète :</strong> Multipliez chaque chiffre de droite à gauche par les poids alternés <strong>×3</strong> et <strong>×1</strong> → somme pondérée = <strong>{sum}</strong> → l’écart au multiple de 10 suivant (<strong>{next10}</strong>) donne la clé <strong style="color:var(--success);">{cd}</strong>.',
            s1: '<strong>Pondération de Droite à Gauche (←) :</strong> Commencez au dernier chiffre utile <strong>P{n}</strong> avec <strong style="color:var(--primary);">×3</strong>, puis alternez <strong style="color:var(--cyan);">×1</strong>, <strong style="color:var(--primary);">×3</strong>… C’est pourquoi l’algorithme fonctionne à l’identique pour les clés GS1 de 8, 12, 13, 14 et 18 chiffres !',
            s2: '<strong>Raccourci par Groupes :</strong> Somme des chiffres <strong style="color:var(--primary);">×3</strong> ({sum3d}) × 3 = <strong>{sum3t}</strong>, plus la somme des chiffres <strong style="color:var(--cyan);">×1</strong> = <strong>{sum1t}</strong> → Somme Pondérée Totale = <strong>{sum}</strong>.',
            s3Quiz: '<strong>Saut Modulo 10 :</strong> Prenez la somme pondérée et trouvez le plus petit chiffre (0–9) permettant d’atteindre le multiple de 10 suivant.',
            s3Show: '<strong>Saut vers le Multiple de 10 Suivant :</strong> Depuis <strong>{sum}</strong>, le multiple de 10 égal ou supérieur le plus proche est <strong>{next10}</strong>. Soustrayez : <code>{next10} − {sum} = </code><strong style="color:var(--success);">{cd}</strong>{exact}',
            s3Exact: ' (déjà multiple de 10, la clé de contrôle vaut donc 0 !)',
            s4: '<strong>Vérifier et Intercepter les Erreurs :</strong> Avec la clé <strong>{cd}</strong> ajoutée (poids ×1), le code complet totalise <strong>{next10}</strong> (<code>{next10} mod 10 = 0</code>). Testez le <strong>Simulateur d’Erreurs</strong> violet ci-dessous pour altérer un chiffre ou inverser deux voisins !',
            tileTitle: 'Position P{p} (#{rtl} depuis la droite) : {d} × {w} = {prod}',
            cdTileTitle: 'Clé de contrôle GS1 finale (poids ×1 lors de la vérification du code complet)',
            cdTileTop: 'CLÉ',
            cdTileShort: 'CLÉ',
            cdGuess: 'trouver',
            inspTip: '<span><strong>Astuce :</strong> Survolez ou touchez un chiffre ci-dessus pour inspecter sa position, son poids et sa part dans la somme.</span><span style="color:var(--cyan);">Dernier chiffre utile P{p} = <strong>{d} × 3 = {prod}</strong></span>',
            inspFocus: '<span>Inspection <strong>Position P{p}</strong> (#{rtl} depuis la droite → rang {parity}) : chiffre <strong>{d}</strong> × poids <strong style="color:{col};">{w}</strong> = <strong>{prod}</strong></span><span style="color:var(--text-dim);">{right}</span>',
            odd: 'impair',
            even: 'pair',
            quizHintHidden: 'Indice masqué en mode Quiz',
            shareSum: '{share} % de la somme pondérée ({sum})',
            b3Hide: 'Chiffres : ({list}) — additionnez-les puis multipliez par <strong>3</strong>',
            b1Hide: 'Chiffres : ({list}) — additionnez-les directement (<strong>×1</strong>)',
            gaugeQuizEq: 'Résolvez le quiz ci-dessus pour révéler le saut Modulo 10 !',
            gaugeQuizSvg: 'Mode Quiz — Droite numérique masquée jusqu’à votre réponse',
            gaugeEq: '{target} − {sum} = {cd}  (Clé de Contrôle)',
            gaugePlus: '+{cd} (Clé)',
            gaugeZero: 'Déjà multiple de 10 → Clé = 0',
            gaugeSum: 'Somme={sum}',
            tblPos: 'Pos',
            tblDig: 'Chiffre',
            tblW: 'Poids (×)',
            tblProd: 'Produit',
            play: 'Démonstration',
            stop: 'Arrêter',
            typoChanged: 'P{p} modifié de <strong>{orig}</strong> → <strong style="color:var(--danger);">{mut}</strong>',
            typoSwapped: 'P{p1} et P{p2} inversés : <strong>{a}{b}</strong> → <strong style="color:var(--danger);">{b}{a}</strong>',
            typoCaught: '<span style="color:#fca5a5;font-weight:700;">✗ ERREUR INTERCEPTÉE INSTANTANÉMENT !</span> {desc}.<br>Nouvelle somme pondérée ({newSum}) + clé d’origine ({cd}) = <strong>{tot}</strong> → <code>{tot} mod 10 = {rem} ≠ 0</code>. Le scanner rejette le code corrompu !',
            typoBlind: '<span style="color:var(--primary);font-weight:700;">⚠ CAS LIMITE MATHÉMATIQUE !</span> {desc}. Comme |a − b| = 5, <code>5 × (3 − 1) = 10</code>, ce qui laisse mod 10 inchangé — l’exception classique du Modulo 10 !',
            typoDefault: 'Voyez comment les lecteurs optiques interceptent les erreurs humaines : cliquez ci-dessus pour modifier un chiffre ou inverser deux chiffres voisins et observer la rupture immédiate du contrôle Modulo 10.',
            quizStreakLbl: 'Série',
            quizWin: '<span style="color:var(--success);font-weight:700;">✓ Parfait !</span> Somme pondérée = <strong>{sum}</strong> → multiple de 10 suivant : <strong>{next10}</strong> → <strong>{next10} − {sum} = {cd}</strong>.',
            quizLose: '<span style="color:#fca5a5;">✗ Ce n’est pas {guess}.</span> Astuce : cliquez sur <strong>Indice</strong> pour afficher les sous-totaux ×3 et ×1, puis calculez l’écart au multiple de 10 suivant.',
            copyBtn: 'Copier le Code Complet',
            copied: 'Copié !',
            convEmpty: 'Saisissez 11 à 14 chiffres (UPC-A, EAN-13 ou GTIN-14) pour obtenir les conversions instantanées.',
            convNotUpc: 'Hors plage UPC-A',
            convUpcMeta: '12 chiffres · Distribution Amérique du Nord',
            convNonUpcMeta: 'Préfixe EAN ≠ 0 (hors plage UPC)',
            convEanMeta: '13 chiffres · Code-barres distribution mondial',
            convG14Title: 'GTIN-14 (Indicateur {ind})',
            convG14Same: 'Unité de base · clé de contrôle inchangée',
            convG14Recalc: 'Colis logistique · clé de contrôle recalculée',
            convCopy: 'Copier',
            convInspect: 'Inspecter ↑'
        }
    },

    de: {
        lang: 'de',
        ogLocale: 'de_DE',
        brandSub: 'rechner',
        nav: { studio: 'Studio', calc: 'Rechner', guide: 'Leitfaden', api: 'API' },
        title: 'GS1 Prüfziffer-Rechner (GTIN-14, EAN-13, UPC, GLN & SSCC/NVE) · SSCCAPI',
        description: 'Kostenloser GS1 Prüfziffer-Rechner & UPC-zu-GTIN-Konverter für GTIN-8, UPC-A, EAN-13, GTIN-14, GLN-13 & SSCC-18 (NVE) mit visuellem Modulo-10-Trainer.',
        keywords: 'GS1 Prüfziffer Rechner, EAN 13 Prüfziffer berechnen, GTIN 14 Prüfziffer, NVE SSCC 18 Prüfziffer, GLN Prüfziffer berechnen, UPC zu GTIN Konverter, Modulo 10 Verfahren GS1, GS1-128 Barcode',
        ogTitle: 'GS1 Prüfziffer-Rechner (GTIN-14, EAN-13, UPC, GLN & SSCC/NVE) · SSCCAPI',
        ogDesc: 'Berechnen, prüfen und verstehen Sie das offizielle GS1 Modulo-10-Verfahren visuell für GTIN, EAN-13, UPC-A, GLN und SSCC-18 (NVE) inkl. UPC↔GTIN-14-Konverter.',
        twTitle: 'GS1 Prüfziffer-Rechner (GTIN, EAN, UPC, GLN & SSCC/NVE)',
        twDesc: 'GS1 Modulo-10-Prüfziffern Schritt für Schritt berechnen und UPC-A ↔ EAN-13 ↔ GTIN-14 sofort umrechnen.',
        schemaAppName: 'GS1 Prüfziffer-Rechner & UPC-zu-GTIN-Konverter',
        schemaAppDesc: 'Berechnen, validieren, konvertieren (UPC-A, EAN-13, GTIN-14) und visualisieren Sie offizielle GS1 Modulo-10-Prüfziffern für GTIN-8, GTIN-12, GTIN-13, GTIN-14, GLN-13 und SSCC-18 (NVE).',
        schemaHowToName: 'Wie berechnet man eine GS1 Prüfziffer (Modulo 10)?',
        schemaHowToDesc: 'Visuelle Schritt-für-Schritt-Anleitung für das offizielle GS1 Modulo-10-Prüfziffernverfahren für GTIN, EAN-13, UPC-A, GLN und SSCC/NVE.',
        howToSteps: [
            { name: 'Gewichtung abwechselnd von rechts nach links zuweisen', text: 'Beginnend mit der letzten Nutzziffer (unmittelbar vor der Prüfziffer) weisen Sie von rechts nach links abwechselnd die Gewichte 3 und 1 zu.' },
            { name: 'Produkte multiplizieren und addieren', text: 'Multiplizieren Sie jede Ziffer mit ihrem Gewicht (3 oder 1) und addieren Sie alle Produkte — oder summieren Sie zuerst alle ×3-Ziffern, multiplizieren die Summe mit 3 und addieren alle ×1-Ziffern.' },
            { name: 'Differenz zum nächsten Vielfachen von 10 bestimmen', text: 'Subtrahieren Sie die gewichtete Summe vom nächsthöheren oder gleichen Vielfachen von 10: Prüfziffer = (10 - (Summe % 10)) % 10.' }
        ],
        h1Pre: 'GS1 ',
        h1Accent: 'PRÜFZIFFER',
        h1Post: ' VISUELLES LABOR',
        tagline: 'Das offizielle GS1 Modulo-10-Verfahren berechnen, visualisieren und beherrschen',
        modeAria: 'Rechnermodus',
        tabLearn: 'Visueller Tutor',
        tabQuiz: 'Übungs-Quiz',
        samples: { sscc: '34001234560000001', gtin13: '400123456789', gtin12: '01234567890', gtin14: '1400123456789', gtin8: '4001234', gln: '400123400001', prefix: '400' },
        types: {
            sscc: { tab: 'SSCC-18 (NVE)', label: 'SSCC-18 / NVE (Paletten)' },
            gtin13: { tab: 'GTIN-13 (EAN)', label: 'GTIN-13 / EAN-13' },
            gtin12: { tab: 'GTIN-12 (UPC)', label: 'GTIN-12 / UPC-A' },
            gtin14: { tab: 'GTIN-14', label: 'GTIN-14 (Kartons)' },
            gtin8: { tab: 'GTIN-8', label: 'GTIN-8 / EAN-8' },
            gln: { tab: 'GLN-13', label: 'GLN-13 (Standorte)' }
        },
        inputExcl: 'ohne abschließende Prüfziffer:',
        digitsUnit: 'Ziffern',
        inputPlaceholder: 'Ziffern eingeben...',
        btnRandom: 'Zufällig',
        btnRandomTitle: 'Zufällige gültige Ziffernfolge für die aktuelle GS1-Länge erzeugen',
        resLabelTop: 'GEPRÜFTER VOLLSTÄNDIGER CODE:',
        resLabelQuiz: 'ÜBUNGSAUFGABE (FINDEN SIE DAS ?):',
        cdLabel: 'PRÜFZIFFER:',
        btnStudio: 'Barcode / Palettenetikett erstellen',
        btnCopy: 'Vollständigen Code kopieren',
        btnCopied: 'Kopiert!',
        quizTitle: '🧠 Praxis-Test — Berechnen Sie die Prüfziffer selbst!',
        quizStreak: 'Serie',
        quizIntro: 'Nutzen Sie die <strong>×3</strong>- (Bernstein) und <strong>×1</strong>-Kacheln (Cyan) unten, bestimmen Sie die Differenz zum nächsten Vielfachen von 10 und wählen Sie Ihre Antwort:',
        btnHint: 'Hinweis',
        btnNewCode: 'Neuer Code',
        steps: ['Alle Schritte', '1. Gewichte (←)', '2. ×3 / ×1 Gruppen', '3. Mod-10-Sprung', '4. Fehlerbeweis'],
        btnPrev: 'Vorheriger Schritt',
        btnNext: 'Nächster Schritt',
        btnPlay: 'Durchlauf',
        btnStop: 'Stopp',
        rtlLeft: 'Klicken oder fahren Sie über eine Ziffer, um ihren genauen Anteil zu prüfen:',
        rtlRight: '← Gewichtung startet IMMER rechts mit ×3',
        b3Head: '● ×3-GEWICHTSGRUPPE (UNGERADE VON RECHTS)',
        b1Head: '● ×1-GEWICHTSGRUPPE (GERADE VON RECHTS)',
        gaugeTitle: 'Visueller Modulo-10-Sprung zum nächsten Vielfachen von 10',
        gaugeAria: 'Modulo-10-Zahlenstrahl mit Abstand von der gewichteten Summe zum nächsten Vielfachen von 10',
        typoTitle: '🧪 Warum Prüfziffern entscheidend sind — Interaktiver Fehlererkennungstest',
        typoSingle: '1-Ziffer-Tippfehler simulieren',
        typoSwap: 'Zahlendreher simulieren',
        typoReset: 'Zurücksetzen',
        typoDefault: 'Testen Sie, wie Scanner Eingabefehler abfangen: Klicken Sie oben auf eine Simulation, um eine Ziffer zu ändern oder zwei Nachbarziffern zu vertauschen — die Modulo-10-Prüfsumme schlägt sofort an.',
        classicSummary: 'Klassische Rechentabelle anzeigen (P1..Pn)',
        ctaTitle: 'GS1-128 & 2D-QR-Barcodes, Zebra ZPL oder komplette Palettenetiketten erzeugen',
        ctaDesc: 'Exportieren Sie eigenständige SSCC/NVE-Barcodes (<code>SVG</code>, <code>300 DPI PNG</code>, <code>ZPL-II</code>) oder vollständige GS1-Palettenetiketten (A5 / 4×6") im Web-Studio oder über unsere Cloud-REST-API (25 kostenlose Etiketten inklusive · Pro-Pakete ab 5 €).',
        ctaBtn1: 'Etiketten- & Barcode-Studio öffnen',
        ctaBtn2: 'REST API & Swagger Sandbox',
        seoCols: [
            {
                h2: '1. Die 3-Schritt-Kurzanleitung',
                html: '<ul><li><strong>Von rechts starten:</strong> Versehen Sie die letzte Nutzziffer mit <strong>×3</strong>, die nächste links mit <strong>×1</strong>, abwechselnd <code>3, 1, 3, 1...</code></li><li><strong>Gruppieren &amp; Multiplizieren:</strong> Addieren Sie alle <strong>×3</strong>-Ziffern und multiplizieren die Summe einmalig mit 3; addieren Sie dann alle <strong>×1</strong>-Ziffern.</li><li><strong>Auf 10 aufrunden:</strong> Der Abstand (0–9) zum nächsten Vielfachen von 10 ist Ihre Prüfziffer.</li></ul>'
            },
            {
                h2: '2. Warum abwechselnd 3 und 1?',
                html: '<p>Eine einfache Quersumme erkennt einzelne Tippfehler, aber <em>keine</em> Zahlendreher (<code>47</code> vs. <code>74</code>). Die alternierende Gewichtung (<strong>3</strong> und <strong>1</strong>) erkennt <strong>100 % aller Einzelfehler</strong> und rund <strong>89 % aller benachbarten Ziffernvertauschungen</strong>.</p>'
            },
            {
                h2: '3. Universelle GS1-Formel',
                html: '<p>Jeder GS1-Schlüssel (<strong>GTIN-8, 12, 13, 14, GLN-13 &amp; SSCC-18/NVE</strong>) nutzt exakt dieselbe Gleichung:</p><p><code>PZ = (10 − (Summe mod 10)) mod 10</code></p>'
            }
        ],
        proTip: '<strong>Praxis-Tipp:</strong> Da die Gewichtung stets von <em>rechts</em> verankert wird, beginnt ein 18-stelliger SSCC/NVE (17 Nutzziffern) an Position P1 mit <strong>×3</strong>, während ein 13-stelliger EAN oder GLN (12 Nutzziffern) an P1 mit <strong>×1</strong> beginnt. Wechseln Sie oben die Tabs, um den Farbwechsel zu sehen!',
        convHeading: '4. UPC-A ↔ EAN-13 ↔ GTIN-14 Konverter (Führende Nullen & Verpackungsindikator)',
        convIntro: 'Geben Sie einen beliebigen <strong>UPC-A (12)</strong>, <strong>EAN-13 (13)</strong> oder <strong>GTIN-14 (14)</strong> Code (mit oder ohne Prüfziffer) ein, um Handels- und Logistikformate inkl. automatischer Modulo-10-Neuberechnung umzuwandeln.',
        convPlaceholder: 'UPC-A, EAN-13 oder GTIN-14 einfügen...',
        convIndLabel: 'GTIN-14 Indikator:',
        convIndOptions: [
            '0 — Basiseinheit (gleiche PZ)',
            '1 — Karton / Verpackungsebene 1',
            '2 — Karton / Verpackungsebene 2',
            '3 — Karton / Verpackungsebene 3',
            '4 — Karton / Verpackungsebene 4',
            '5 — Karton / Verpackungsebene 5',
            '6 — Karton / Verpackungsebene 6',
            '7 — Karton / Verpackungsebene 7',
            '8 — Karton / Verpackungsebene 8'
        ],
        refAria: 'Referenztabelle für GS1-Schlüssellängen und Gewichte',
        refHeaders: ['GS1-Schlüssel', 'Gesamtlänge', 'Nutzziffern', 'Gewicht Pos. 1', 'Haupteinsatz'],
        refRows: [
            ['GTIN-8 (EAN-8)', '8', '7', '×3', 'Kleine Einzelhandelsartikel'],
            ['GTIN-12 (UPC-A)', '12', '11', '×3', 'Einzelhandel Nordamerika (POS)'],
            ['GTIN-13 (EAN-13)', '13', '12', '×1', 'Globaler Einzelhandel (POS)'],
            ['GLN-13', '13', '12', '×1', 'Lager, Rampen & EDI-Partner'],
            ['GTIN-14 (ITF-14)', '14', '13', '×3', 'Kartons, Umverpackungen & Handelseinheiten'],
            ['SSCC-18 (NVE)', '18', '17', '×3', 'Logistikpaletten & GS1-128-Etiketten']
        ],
        faqHeading: '5. Häufige Fragen — GS1 Prüfziffer & GTIN-Konvertierung',
        faqs: [
            {
                q: 'Wie berechnet man eine GS1 Prüfziffer für GTIN, EAN-13, UPC, GLN oder SSCC/NVE?',
                aText: 'Beginnen Sie bei der letzten Ziffer vor der Prüfziffer und weisen Sie von rechts nach links abwechselnd die Gewichte 3 und 1 zu. Summieren Sie alle gewichteten Produkte und ermitteln Sie die Differenz zum nächsten Vielfachen von 10 mittels PZ = (10 - (Summe mod 10)) mod 10.',
                aHtml: 'Beginnen Sie bei der letzten Ziffer vor der Prüfziffer und weisen Sie von rechts nach links abwechselnd die Gewichte <strong>3</strong> und <strong>1</strong> zu. Summieren Sie alle gewichteten Produkte und ermitteln Sie die Differenz zum nächsten Vielfachen von 10 mittels <code>PZ = (10 − (Summe mod 10)) mod 10</code>.'
            },
            {
                q: 'Wie wandelt man einen 12-stelligen UPC-A in EAN-13 oder GTIN-14 um?',
                aText: 'Stellen Sie einem 12-stelligen UPC-A eine führende Null (0) voran, um eine EAN-13 / GTIN-13 zu erhalten, oder zwei führende Nullen (00) für eine Basiseinheit als GTIN-14. Für Umverpackungen mit Verpackungsindikator 1 bis 8 setzen Sie den Indikator an erste Stelle und berechnen die Modulo-10-Prüfziffer neu.',
                aHtml: 'Stellen Sie einem 12-stelligen UPC-A eine führende Null (<code>0</code>) voran, um eine <strong>EAN-13 / GTIN-13</strong> zu erhalten, oder zwei führende Nullen (<code>00</code>) für eine Basiseinheit als <strong>GTIN-14</strong>. Für Umverpackungen mit Verpackungsindikator <code>1</code> bis <code>8</code> setzen Sie den Indikator an erste Stelle und berechnen die Modulo-10-Prüfziffer neu.'
            },
            {
                q: 'Ändert sich die Prüfziffer beim Umwandeln von UPC-A in EAN-13 oder GTIN-14?',
                aText: 'Führende Nullen (Indikator 0) ändern die Prüfziffer niemals, da Null multipliziert mit jedem Gewicht Null ergibt. Sobald jedoch für Kartons ein GTIN-14-Verpackungsindikator von 1 bis 8 vergeben wird, ändert sich die Prüfsumme und die Prüfziffer muss neu berechnet werden.',
                aHtml: 'Führende Nullen (Indikator <code>0</code>) ändern die Prüfziffer niemals, da Null multipliziert mit jedem Gewicht Null ergibt. Sobald jedoch für Kartons ein GTIN-14-Verpackungsindikator von <code>1</code> bis <code>8</code> vergeben wird, ändert sich die Prüfsumme und die Prüfziffer muss neu berechnet werden.'
            },
            {
                q: 'Wie wird die Prüfziffer einer GLN-13 berechnet?',
                aText: 'Eine Global Location Number (GLN-13) nutzt exakt dieselbe 12-stellige Nutzdatenlänge und Modulo-10-Gewichtung wie eine EAN-13 / GTIN-13. Multiplizieren Sie die ersten 12 Ziffern von rechts nach links abwechselnd mit 3 und 1, addieren Sie die Ergebnisse und subtrahieren vom nächsten Zehner.',
                aHtml: 'Eine Global Location Number (<strong>GLN-13</strong>) nutzt exakt dieselbe 12-stellige Nutzdatenlänge und Modulo-10-Gewichtung wie eine EAN-13 / GTIN-13. Multiplizieren Sie die ersten 12 Ziffern von rechts nach links abwechselnd mit 3 und 1, addieren Sie die Ergebnisse und subtrahieren vom nächsten Zehner.'
            },
            {
                q: 'Kann man eine GTIN-14 oder EAN-13 wieder in einen 12-stelligen UPC-A umrechnen?',
                aText: 'Ja — beginnt eine EAN-13 mit 0 oder eine GTIN-14 mit 00, liefert das Entfernen der führenden Nullen den exakten 12-stelligen UPC-A mit identischer Prüfziffer. Beginnt eine GTIN-14 mit einem Indikator 1 bis 8 gefolgt von 0, entfernen Sie die ersten beiden Ziffern und berechnen die Prüfziffer für die 11 Nutzziffern neu.',
                aHtml: 'Ja — beginnt eine EAN-13 mit <code>0</code> oder eine GTIN-14 mit <code>00</code>, liefert das Entfernen der führenden Nullen den exakten 12-stelligen UPC-A mit identischer Prüfziffer. Beginnt eine GTIN-14 mit einem Indikator <code>1</code>–<code>8</code> gefolgt von <code>0</code>, entfernen Sie die ersten beiden Ziffern und berechnen die Prüfziffer für die 11 Nutzziffern neu.'
            }
        ],
        footerGuide: 'GS1-Leitfaden',
        footerApi: 'REST API',
        js: {
            excl: 'ohne abschließende Prüfziffer:',
            digits: 'Ziffern',
            lenNote: 'Hinweis: {len} Ziffern eingegeben (Standard-Nutzlänge für {type} ist {exp}).',
            badge0: 'ÜBERSICHT',
            badge1: 'SCHRITT 1 / 4',
            badge2: 'SCHRITT 2 / 4',
            badge3: 'SCHRITT 3 / 4',
            badge4: 'SCHRITT 4 / 4',
            s0Quiz: '<strong>Quiz aktiv:</strong> Die Gewichte wechseln von rechts nach links zwischen <strong>×3</strong> (Bernstein) und <strong>×1</strong> (Cyan). Summieren Sie die Produkte und bestimmen Sie den Abstand zum nächsten Vielfachen von 10!',
            s0Show: '<strong>Vollständiger Nachweis:</strong> Jede Ziffer von rechts nach links abwechselnd mit <strong>×3</strong> und <strong>×1</strong> multiplizieren → Summe = <strong>{sum}</strong> → Abstand zum nächsten Zehner (<strong>{next10}</strong>) ergibt Prüfziffer <strong style="color:var(--success);">{cd}</strong>.',
            s1: '<strong>Gewichte von rechts nach links (←):</strong> Starten Sie bei der letzten Nutzziffer <strong>P{n}</strong> mit <strong style="color:var(--primary);">×3</strong> und wechseln Sie <strong style="color:var(--cyan);">×1</strong>, <strong style="color:var(--primary);">×3</strong>… Deshalb funktioniert das Verfahren identisch für 8-, 12-, 13-, 14- und 18-stellige GS1-Schlüssel!',
            s2: '<strong>Gruppen-Abkürzung:</strong> Summe aller <strong style="color:var(--primary);">×3-Ziffern</strong> ({sum3d}) × 3 = <strong>{sum3t}</strong>, plus alle <strong style="color:var(--cyan);">×1-Ziffern</strong> = <strong>{sum1t}</strong> → Gewichtete Gesamtsumme = <strong>{sum}</strong>.',
            s3Quiz: '<strong>Modulo-10-Sprung:</strong> Bestimmen Sie die kleinste Ziffer (0–9), die Ihre gewichtete Summe auf ein Vielfaches von 10 ergänzt.',
            s3Show: '<strong>Sprung zum nächsten Vielfachen von 10:</strong> Ab <strong>{sum}</strong> ist das nächsthöhere oder gleiche Vielfache von 10 genau <strong>{next10}</strong>. Differenz: <code>{next10} − {sum} = </code><strong style="color:var(--success);">{cd}</strong>{exact}',
            s3Exact: ' (bereits ein Vielfaches von 10 — Prüfziffer ist 0!)',
            s4: '<strong>Prüfen &amp; Fehler abfangen:</strong> Mit angehängter Prüfziffer <strong>{cd}</strong> (Gewicht ×1) ergibt der volle Code <strong>{next10}</strong> (<code>{next10} mod 10 = 0</code>). Testen Sie unten den violetten <strong>Fehlererkennungstest</strong> für Tippfehler oder Zahlendreher!',
            tileTitle: 'Position P{p} (#{rtl} von rechts): {d} × {w} = {prod}',
            cdTileTitle: 'Abschließende GS1-Prüfziffer (Gewicht ×1 bei Vollprüfung)',
            cdTileTop: 'PRÜF',
            cdTileShort: 'PZ',
            cdGuess: 'raten',
            inspTip: '<span><strong>Tipp:</strong> Fahren oder tippen Sie auf eine Ziffernkachel oben, um Position, Gewicht &amp; Anteil an der Summe zu prüfen.</span><span style="color:var(--cyan);">Letzte Nutzziffer P{p} = <strong>{d} × 3 = {prod}</strong></span>',
            inspFocus: '<span>Analyse <strong>Position P{p}</strong> (#{rtl} von rechts → {parity} Stelle): Ziffer <strong>{d}</strong> × Gewicht <strong style="color:{col};">{w}</strong> = <strong>{prod}</strong></span><span style="color:var(--text-dim);">{right}</span>',
            odd: 'ungerade',
            even: 'gerade',
            quizHintHidden: 'Hinweis im Quiz-Modus ausgeblendet',
            shareSum: '{share} % der gewichteten Summe ({sum})',
            b3Hide: 'Ziffern: ({list}) — addieren, dann mit <strong>3</strong> multiplizieren',
            b1Hide: 'Ziffern: ({list}) — direkt addieren (<strong>×1</strong>)',
            gaugeQuizEq: 'Lösen Sie das Quiz oben, um den Modulo-10-Sprung anzuzeigen!',
            gaugeQuizSvg: 'Quiz-Modus — Zahlenstrahl bis zur Antwort ausgeblendet',
            gaugeEq: '{target} − {sum} = {cd}  (Prüfziffer)',
            gaugePlus: '+{cd} (Prüfziffer)',
            gaugeZero: 'Bereits Vielfaches von 10 → PZ = 0',
            gaugeSum: 'Summe={sum}',
            tblPos: 'Pos',
            tblDig: 'Ziffer',
            tblW: 'Gewicht (×)',
            tblProd: 'Produkt',
            play: 'Durchlauf',
            stop: 'Stopp',
            typoChanged: 'P{p} geändert von <strong>{orig}</strong> → <strong style="color:var(--danger);">{mut}</strong>',
            typoSwapped: 'P{p1} &amp; P{p2} vertauscht: <strong>{a}{b}</strong> → <strong style="color:var(--danger);">{b}{a}</strong>',
            typoCaught: '<span style="color:#fca5a5;font-weight:700;">✗ FEHLER SOFORT ERKANNT!</span> {desc}.<br>Neue gewichtete Summe ({newSum}) + ursprüngliche Prüfziffer ({cd}) = <strong>{tot}</strong> → <code>{tot} mod 10 = {rem} ≠ 0</code>. Scanner weist den fehlerhaften Code ab!',
            typoBlind: '<span style="color:var(--primary);font-weight:700;">⚠ SELTENER GRENZFALL ENTDECKT!</span> {desc}. Da |a − b| = 5 gilt <code>5 × (3 − 1) = 10</code>, sodass mod 10 unverändert bleibt — der klassische mathematische Sonderfall von Modulo 10!',
            typoDefault: 'Testen Sie, wie Scanner Eingabefehler abfangen: Klicken Sie oben auf eine Simulation, um eine Ziffer zu ändern oder zwei Nachbarziffern zu vertauschen — die Modulo-10-Prüfsumme schlägt sofort an.',
            quizStreakLbl: 'Serie',
            quizWin: '<span style="color:var(--success);font-weight:700;">✓ Volltreffer!</span> Gewichtete Summe = <strong>{sum}</strong> → nächstes Vielfaches von 10 ist <strong>{next10}</strong> → <strong>{next10} − {sum} = {cd}</strong>.',
            quizLose: '<span style="color:#fca5a5;">✗ Nicht {guess}.</span> Tipp: Klicken Sie auf <strong>Hinweis</strong> für die ×3- und ×1-Zwischensummen und bestimmen Sie den Abstand zum nächsten Zehner.',
            copyBtn: 'Vollständigen Code kopieren',
            copied: 'Kopiert!',
            convEmpty: 'Geben Sie 11–14 Ziffern ein (UPC-A, EAN-13 oder GTIN-14) für die sofortige Umrechnung.',
            convNotUpc: 'Kein UPC-A-Bereich',
            convUpcMeta: '12 Ziffern · Einzelhandel Nordamerika',
            convNonUpcMeta: 'EAN-Präfix ≠ 0 (kein UPC-Präfix)',
            convEanMeta: '13 Ziffern · Globaler Handels-Barcode',
            convG14Title: 'GTIN-14 (Indikator {ind})',
            convG14Same: 'Basiseinheit · Prüfziffer unverändert',
            convG14Recalc: 'Karton / Gebinde · Prüfziffer neu berechnet',
            convCopy: 'Kopieren',
            convInspect: 'Prüfen ↑'
        }
    },

    nl: {
        lang: 'nl',
        ogLocale: 'nl_NL',
        brandSub: 'calculator',
        nav: { studio: 'Studio', calc: 'Calculator', guide: 'Gids', api: 'API' },
        title: 'GS1 Controlecijfer Berekenen (GTIN-14, EAN-13, UPC, GLN & SSCC) · SSCCAPI',
        description: 'Gratis GS1 controlecijfer calculator & UPC-naar-GTIN converter voor GTIN-8, UPC-A, EAN-13, GTIN-14, GLN-13 & SSCC-18 met visuele Modulo 10 uitleg en quiz.',
        keywords: 'GS1 controlecijfer berekenen, EAN 13 controlecijfer calculator, GTIN 14 controlecijfer, SSCC 18 controlecijfer, GLN 13 berekenen, UPC naar GTIN converter, modulo 10 algoritme GS1, GS1-128 barcode',
        ogTitle: 'GS1 Controlecijfer Berekenen (GTIN-14, EAN-13, UPC, GLN & SSCC) · SSCCAPI',
        ogDesc: 'Bereken, controleer en leer het officiële GS1 Modulo 10-algoritme visueel voor GTIN, EAN-13, UPC-A, GLN en SSCC-18, inclusief UPC↔GTIN-14 converter.',
        twTitle: 'GS1 Controlecijfer Berekenen (GTIN, EAN, UPC, GLN & SSCC)',
        twDesc: 'Bereken GS1 Modulo 10 controlecijfers stap voor stap en converteer UPC-A ↔ EAN-13 ↔ GTIN-14 direct.',
        schemaAppName: 'GS1 Controlecijfer Calculator & UPC-naar-GTIN Converter',
        schemaAppDesc: 'Bereken, valideer, converteer (UPC-A, EAN-13, GTIN-14) en visualiseer officiële GS1 Modulo 10 controlecijfers voor GTIN-8, GTIN-12, GTIN-13, GTIN-14, GLN-13 en SSCC-18.',
        schemaHowToName: 'Hoe bereken je een GS1 controlecijfer (Modulo 10)?',
        schemaHowToDesc: 'Visuele stap-voor-stap uitleg van de officiële GS1 Modulo 10 controlecijferberekening voor GTIN, EAN-13, UPC-A, GLN en SSCC.',
        howToSteps: [
            { name: 'Wisselende weging van rechts naar links toekennen', text: 'Begin bij het meest rechtse basiscijfer (direct vóór het controlecijfer) en ken van rechts naar links afwisselend de weegfactoren 3 en 1 toe.' },
            { name: 'Vermenigvuldigen en optellen', text: 'Vermenigvuldig elk cijfer met zijn weegfactor (3 of 1) en tel alle uitkomsten op — of tel eerst alle ×3-cijfers op, vermenigvuldig dat subtotaal met 3 en tel de ×1-cijfers erbij op.' },
            { name: 'Verschil tot het volgende tienvoud bepalen', text: 'Trek de gewogen som af van het gelijke of eerstvolgende veelvoud van 10: Controlecijfer = (10 - (Som % 10)) % 10.' }
        ],
        h1Pre: 'GS1 ',
        h1Accent: 'CONTROLECIJFER',
        h1Post: ' VISUEEL LAB',
        tagline: 'Bereken, visualiseer en beheers het officiële GS1 Modulo 10-algoritme',
        modeAria: 'Calculatormodus',
        tabLearn: 'Visuele Uitleg',
        tabQuiz: 'Oefenquiz',
        samples: { sscc: '38711234560000001', gtin13: '871123456789', gtin12: '01234567890', gtin14: '1871123456789', gtin8: '8711234', gln: '871123400001', prefix: '871' },
        types: {
            sscc: { tab: 'SSCC-18', label: 'SSCC-18 (Pallets)' },
            gtin13: { tab: 'GTIN-13 (EAN)', label: 'GTIN-13 / EAN-13' },
            gtin12: { tab: 'GTIN-12 (UPC)', label: 'GTIN-12 / UPC-A' },
            gtin14: { tab: 'GTIN-14', label: 'GTIN-14 (Dozen)' },
            gtin8: { tab: 'GTIN-8', label: 'GTIN-8 / EAN-8' },
            gln: { tab: 'GLN-13', label: 'GLN-13 (Locaties)' }
        },
        inputExcl: 'zonder het laatste controlecijfer:',
        digitsUnit: 'cijfers',
        inputPlaceholder: 'Voer cijfers in...',
        btnRandom: 'Willekeurig',
        btnRandomTitle: 'Genereer een willekeurige geldige reeks met de huidige GS1-lengte',
        resLabelTop: 'GEVALIDEERDE VOLLEDIGE CODE:',
        resLabelQuiz: 'OEFENOPGAVE (VIND HET ?):',
        cdLabel: 'CONTROLECIJFER:',
        btnStudio: 'Barcode / Palletlabel maken',
        btnCopy: 'Volledige code kopiëren',
        btnCopied: 'Gekopieerd!',
        quizTitle: '🧠 Oefenuitdaging — Bereken zelf het controlecijfer!',
        quizStreak: 'Reeks',
        quizIntro: 'Gebruik de <strong>×3</strong>- (amber) en <strong>×1</strong>-tegels (cyaan) hieronder, bepaal de sprong naar het volgende tienvoud en klik op je antwoord:',
        btnHint: 'Hint',
        btnNewCode: 'Nieuwe code',
        steps: ['Alle stappen', '1. Weging (←)', '2. ×3 / ×1 Groepen', '3. Mod-10 Sprong', '4. Foutdetectie'],
        btnPrev: 'Vorige stap',
        btnNext: 'Volgende stap',
        btnPlay: 'Stappenplan',
        btnStop: 'Stop',
        rtlLeft: 'Klik of beweeg over een cijfertegel om de exacte bijdrage te bekijken:',
        rtlRight: '← Weging start ALTIJD rechts met ×3',
        b3Head: '● ×3-WEEGGROEP (ONEVEN VANAF RECHTS)',
        b1Head: '● ×1-WEEGGROEP (EVEN VANAF RECHTS)',
        gaugeTitle: 'Visuele Modulo 10-sprong naar het volgende veelvoud van 10',
        gaugeAria: 'Modulo 10 getallenlijn met afstand van de gewogen som tot het volgende tienvoud',
        typoTitle: '🧪 Waarom controlecijfers onmisbaar zijn — Interactieve foutdetectietest',
        typoSingle: 'Simuleer 1 typefout',
        typoSwap: 'Simuleer cijferwissel',
        typoReset: 'Herstellen',
        typoDefault: 'Zie hoe scanners menselijke fouten onderscheppen: klik hierboven om één cijfer te wijzigen of twee aangrenzende cijfers om te wisselen — de Modulo 10-controle slaat direct aan.',
        classicSummary: 'Klassieke rekentabel tonen (P1..Pn)',
        ctaTitle: 'Genereer GS1-128 & 2D QR-barcodes, Zebra ZPL of complete palletlabels',
        ctaDesc: 'Exporteer losse SSCC-barcodes (<code>SVG</code>, <code>300 DPI PNG</code>, <code>ZPL-II</code>) of volledige GS1-palletlabels (A5 / 4×6") in de Web Studio of via onze Cloud REST API (25 gratis labels inbegrepen · Pro-pakketten vanaf 5 €).',
        ctaBtn1: 'Label- & Barcode Studio openen',
        ctaBtn2: 'REST API & Swagger Sandbox',
        seoCols: [
            {
                h2: '1. De snelle 3-stappenmethode',
                html: '<ul><li><strong>Begin rechts:</strong> Geef het meest rechtse basiscijfer gewicht <strong>×3</strong>, het cijfer links daarvan <strong>×1</strong>, afwisselend <code>3, 1, 3, 1...</code></li><li><strong>Groeperen &amp; Vermenigvuldigen:</strong> Tel alle <strong>×3</strong>-cijfers op en vermenigvuldig dat subtotaal één keer met 3; tel daarna alle <strong>×1</strong>-cijfers op.</li><li><strong>Afronden op 10:</strong> Het verschil (0–9) tot het eerstvolgende tienvoud is je controlecijfer.</li></ul>'
            },
            {
                h2: '2. Waarom afwisselend 3 en 1?',
                html: '<p>Een gewone optelling vangt losse typefouten af, maar <em>geen</em> omgewisselde buurcijfers (<code>47</code> vs. <code>74</code>). Afwisselende weging (<strong>3</strong> en <strong>1</strong>) detecteert <strong>100% van alle enkele cijferfouten</strong> en circa <strong>89% van alle aangrenzende verwisselingen</strong>.</p>'
            },
            {
                h2: '3. Universele GS1-formule',
                html: '<p>Elke GS1-sleutel (<strong>GTIN-8, 12, 13, 14, GLN-13 &amp; SSCC-18</strong>) gebruikt exact dezelfde formule:</p><p><code>CC = (10 − (Som mod 10)) mod 10</code></p>'
            }
        ],
        proTip: '<strong>Praktijktip:</strong> Omdat de weging altijd vanaf <em>rechts</em> start, begint een 18-cijferige SSCC (17 basiscijfers) op positie P1 met <strong>×3</strong>, terwijl een 13-cijferige EAN of GLN (12 basiscijfers) op P1 met <strong>×1</strong> begint. Wissel hierboven van tab om de kleuren te zien omslaan!',
        convHeading: '4. UPC-A ↔ EAN-13 ↔ GTIN-14 Converter (Voorloopnullen & Verpakkingsindicator)',
        convIntro: 'Voer een willekeurige <strong>UPC-A (12)</strong>, <strong>EAN-13 (13)</strong> of <strong>GTIN-14 (14)</strong> code in (met of zonder controlecijfer) om direct tussen retail- en logistieke GTIN-formaten te converteren met automatische Modulo 10-herberekening.',
        convPlaceholder: 'Plak een UPC-A, EAN-13 of GTIN-14 code...',
        convIndLabel: 'GTIN-14 Indicator:',
        convIndOptions: [
            '0 — Basiseenheid (zelfde CC)',
            '1 — Doos / Verpakkingsniveau 1',
            '2 — Doos / Verpakkingsniveau 2',
            '3 — Doos / Verpakkingsniveau 3',
            '4 — Doos / Verpakkingsniveau 4',
            '5 — Doos / Verpakkingsniveau 5',
            '6 — Doos / Verpakkingsniveau 6',
            '7 — Doos / Verpakkingsniveau 7',
            '8 — Doos / Verpakkingsniveau 8'
        ],
        refAria: 'Referentietabel met lengtes en weging van GS1-sleutels',
        refHeaders: ['GS1-sleutel', 'Totaal cijfers', 'Basiscijfers', 'Weging Pos. 1', 'Hoofdgebruik'],
        refRows: [
            ['GTIN-8 (EAN-8)', '8', '7', '×3', 'Kleine retailartikelen'],
            ['GTIN-12 (UPC-A)', '12', '11', '×3', 'Noord-Amerikaanse retail (POS)'],
            ['GTIN-13 (EAN-13)', '13', '12', '×1', 'Wereldwijde retail (POS)'],
            ['GLN-13', '13', '12', '×1', 'Magazijnen, docks & EDI-partijen'],
            ['GTIN-14 (ITF-14)', '14', '13', '×3', 'Omdozen, kratten & handelseenheden'],
            ['SSCC-18', '18', '17', '×3', 'Logistieke pallets & GS1-128-labels']
        ],
        faqHeading: '5. Veelgestelde vragen — GS1 Controlecijfer & GTIN-conversie',
        faqs: [
            {
                q: 'Hoe bereken je een GS1 controlecijfer voor GTIN, EAN-13, UPC, GLN of SSCC?',
                aText: 'Begin bij het laatste cijfer direct vóór het controlecijfer en ken van rechts naar links afwisselend de weegfactoren 3 en 1 toe. Tel alle gewogen producten op en bereken het verschil tot het volgende tienvoud met CC = (10 - (Som mod 10)) mod 10.',
                aHtml: 'Begin bij het laatste cijfer direct vóór het controlecijfer en ken van rechts naar links afwisselend de weegfactoren <strong>3</strong> en <strong>1</strong> toe. Tel alle gewogen producten op en bereken het verschil tot het volgende tienvoud met <code>CC = (10 − (Som mod 10)) mod 10</code>.'
            },
            {
                q: 'Hoe zet je een 12-cijferige UPC-A om naar EAN-13 of GTIN-14?',
                aText: 'Plaats één voorloopnul (0) vóór een 12-cijferige UPC-A om een EAN-13 / GTIN-13 te vormen, of twee voorloopnullen (00) voor een basiseenheid als GTIN-14. Voor omdozen met verpakkingsindicator 1 tot en met 8 plaats je die indicator vooraan en herbereken je het Modulo 10 controlecijfer.',
                aHtml: 'Plaats één voorloopnul (<code>0</code>) vóór een 12-cijferige UPC-A om een <strong>EAN-13 / GTIN-13</strong> te vormen, of twee voorloopnullen (<code>00</code>) voor een basiseenheid als <strong>GTIN-14</strong>. Voor omdozen met verpakkingsindicator <code>1</code> t/m <code>8</code> plaats je die indicator vooraan en herbereken je het Modulo 10 controlecijfer.'
            },
            {
                q: 'Verandert het controlecijfer wanneer je UPC-A omzet naar EAN-13 of GTIN-14?',
                aText: 'Voorloopnullen toevoegen (indicator 0) verandert het controlecijfer nooit, omdat nul maal elke weegfactor nul blijft. Ken je echter een GTIN-14 verpakkingsindicator van 1 tot en met 8 toe voor een omdoos, dan verandert de som en moet het controlecijfer worden herberekend.',
                aHtml: 'Voorloopnullen toevoegen (indicator <code>0</code>) verandert het controlecijfer nooit, omdat nul maal elke weegfactor nul blijft. Ken je echter een GTIN-14 verpakkingsindicator van <code>1</code> t/m <code>8</code> toe voor een omdoos, dan verandert de som en moet het controlecijfer worden herberekend.'
            },
            {
                q: 'Hoe bereken je het controlecijfer van een GLN-13?',
                aText: 'Een Global Location Number (GLN-13) gebruikt exact dezelfde 12 basiscijfers en Modulo 10-weging als een EAN-13 / GTIN-13. Vermenigvuldig de eerste 12 cijfers van rechts naar links afwisselend met 3 en 1, tel alles op en trek af van het volgende veelvoud van 10.',
                aHtml: 'Een Global Location Number (<strong>GLN-13</strong>) gebruikt exact dezelfde 12 basiscijfers en Modulo 10-weging als een EAN-13 / GTIN-13. Vermenigvuldig de eerste 12 cijfers van rechts naar links afwisselend met 3 en 1, tel alles op en trek af van het volgende veelvoud van 10.'
            },
            {
                q: 'Kun je een GTIN-14 of EAN-13 terugrekenen naar een 12-cijferige UPC-A?',
                aText: 'Ja: zodra een EAN-13 begint met 0 of een GTIN-14 begint met 00, geeft het weglaten van die voorloopnullen de exacte 12-cijferige UPC-A met hetzelfde controlecijfer. Begint een GTIN-14 met een indicator 1 tot en met 8 gevolgd door 0, verwijder dan de eerste twee cijfers en herbereken het controlecijfer over de 11 UPC-basiscijfers.',
                aHtml: 'Ja: zodra een EAN-13 begint met <code>0</code> of een GTIN-14 begint met <code>00</code>, geeft het weglaten van die voorloopnullen de exacte 12-cijferige UPC-A met hetzelfde controlecijfer. Begint een GTIN-14 met een indicator <code>1</code>–<code>8</code> gevolgd door <code>0</code>, verwijder dan de eerste twee cijfers en herbereken het controlecijfer over de 11 UPC-basiscijfers.'
            }
        ],
        footerGuide: 'GS1 Gids',
        footerApi: 'REST API',
        js: {
            excl: 'zonder het laatste controlecijfer:',
            digits: 'cijfers',
            lenNote: 'Let op: {len} cijfers ingevoerd (standaard basislengte voor {type} is {exp}).',
            badge0: 'OVERZICHT',
            badge1: 'STAP 1 / 4',
            badge2: 'STAP 2 / 4',
            badge3: 'STAP 3 / 4',
            badge4: 'STAP 4 / 4',
            s0Quiz: '<strong>Quiz actief:</strong> De weging wisselt van rechts naar links tussen <strong>×3</strong> (amber) en <strong>×1</strong> (cyaan). Tel de producten op en bepaal hoeveel je nodig hebt tot het volgende tienvoud!',
            s0Show: '<strong>Volledig bewijs:</strong> Vermenigvuldig elk cijfer van rechts naar links afwisselend met <strong>×3</strong> en <strong>×1</strong> → som = <strong>{sum}</strong> → afstand tot het volgende tienvoud (<strong>{next10}</strong>) geeft controlecijfer <strong style="color:var(--success);">{cd}</strong>.',
            s1: '<strong>Weging van rechts naar links (←):</strong> Start bij het laatste basiscijfer <strong>P{n}</strong> met <strong style="color:var(--primary);">×3</strong> en wissel af met <strong style="color:var(--cyan);">×1</strong>, <strong style="color:var(--primary);">×3</strong>… Daarom werkt deze methode identiek voor GS1-codes van 8, 12, 13, 14 en 18 cijfers!',
            s2: '<strong>Snelle groepsmethode:</strong> Som van alle <strong style="color:var(--primary);">×3-cijfers</strong> ({sum3d}) × 3 = <strong>{sum3t}</strong>, plus alle <strong style="color:var(--cyan);">×1-cijfers</strong> = <strong>{sum1t}</strong> → Gewogen totaalsom = <strong>{sum}</strong>.',
            s3Quiz: '<strong>Modulo 10-sprong:</strong> Neem de gewogen som en bepaal het kleinste cijfer (0–9) waarmee je een veelvoud van 10 bereikt.',
            s3Show: '<strong>Sprong naar het volgende tienvoud:</strong> Vanaf <strong>{sum}</strong> is het dichtstbijzijnde hogere of gelijke tienvoud <strong>{next10}</strong>. Verschil: <code>{next10} − {sum} = </code><strong style="color:var(--success);">{cd}</strong>{exact}',
            s3Exact: ' (al een veelvoud van 10, dus het controlecijfer is 0!)',
            s4: '<strong>Valideren &amp; fouten vangen:</strong> Met controlecijfer <strong>{cd}</strong> (weging ×1) komt de volledige code uit op <strong>{next10}</strong> (<code>{next10} mod 10 = 0</code>). Test hieronder de paarse <strong>Foutdetectietest</strong> om een cijfer te wijzigen of twee buren te verwisselen!',
            tileTitle: 'Positie P{p} (#{rtl} vanaf rechts): {d} × {w} = {prod}',
            cdTileTitle: 'Definitief GS1 controlecijfer (weging ×1 bij volledige controle)',
            cdTileTop: 'CHECK',
            cdTileShort: 'CC',
            cdGuess: 'raad',
            inspTip: '<span><strong>Tip:</strong> Beweeg over of tik op een cijfertegel hierboven om positie, weging &amp; aandeel in de som te bekijken.</span><span style="color:var(--cyan);">Laatste basiscijfer P{p} = <strong>{d} × 3 = {prod}</strong></span>',
            inspFocus: '<span>Inspectie <strong>Positie P{p}</strong> (#{rtl} vanaf rechts → {parity} positie): cijfer <strong>{d}</strong> × gewicht <strong style="color:{col};">{w}</strong> = <strong>{prod}</strong></span><span style="color:var(--text-dim);">{right}</span>',
            odd: 'oneven',
            even: 'even',
            quizHintHidden: 'Hint verborgen in quizmodus',
            shareSum: '{share}% van de gewogen som ({sum})',
            b3Hide: 'Cijfers: ({list}) — tel ze op en vermenigvuldig met <strong>3</strong>',
            b1Hide: 'Cijfers: ({list}) — tel ze direct op (<strong>×1</strong>)',
            gaugeQuizEq: 'Los de quiz hierboven op om de Modulo 10-sprong te tonen!',
            gaugeQuizSvg: 'Quizmodus — Getallenlijn verborgen tot je een antwoord kiest',
            gaugeEq: '{target} − {sum} = {cd}  (Controlecijfer)',
            gaugePlus: '+{cd} (Controlecijfer)',
            gaugeZero: 'Al een tienvoud → CC = 0',
            gaugeSum: 'Som={sum}',
            tblPos: 'Pos',
            tblDig: 'Cijfer',
            tblW: 'Weging (×)',
            tblProd: 'Product',
            play: 'Stappenplan',
            stop: 'Stop',
            typoChanged: 'P{p} gewijzigd van <strong>{orig}</strong> → <strong style="color:var(--danger);">{mut}</strong>',
            typoSwapped: 'P{p1} &amp; P{p2} verwisseld: <strong>{a}{b}</strong> → <strong style="color:var(--danger);">{b}{a}</strong>',
            typoCaught: '<span style="color:#fca5a5;font-weight:700;">✗ FOUT DIRECT ONDERSCHEPT!</span> {desc}.<br>Nieuwe gewogen som ({newSum}) + oorspronkelijk controlecijfer ({cd}) = <strong>{tot}</strong> → <code>{tot} mod 10 = {rem} ≠ 0</code>. Scanner weigert de foutieve code!',
            typoBlind: '<span style="color:var(--primary);font-weight:700;">⚠ ZELDZAAM RANDGEVAL GEVONDEN!</span> {desc}. Omdat |a − b| = 5 geldt <code>5 × (3 − 1) = 10</code>, waardoor mod 10 gelijk blijft — de bekende wiskundige uitzondering van Modulo 10!',
            typoDefault: 'Zie hoe scanners menselijke fouten onderscheppen: klik hierboven om één cijfer te wijzigen of twee aangrenzende cijfers om te wisselen — de Modulo 10-controle slaat direct aan.',
            quizStreakLbl: 'Reeks',
            quizWin: '<span style="color:var(--success);font-weight:700;">✓ Precies goed!</span> Gewogen som = <strong>{sum}</strong> → volgend tienvoud is <strong>{next10}</strong> → <strong>{next10} − {sum} = {cd}</strong>.',
            quizLose: '<span style="color:#fca5a5;">✗ Niet {guess}.</span> Tip: klik op <strong>Hint</strong> om de ×3- en ×1-subtotalen te tonen en bepaal het verschil tot het volgende tienvoud.',
            copyBtn: 'Volledige code kopiëren',
            copied: 'Gekopieerd!',
            convEmpty: 'Voer 11–14 cijfers in (UPC-A, EAN-13 of GTIN-14) voor directe conversies.',
            convNotUpc: 'Geen UPC-A-bereik',
            convUpcMeta: '12 cijfers · Retail Noord-Amerika',
            convNonUpcMeta: 'EAN-prefix ≠ 0 (geen UPC-landprefix)',
            convEanMeta: '13 cijfers · Wereldwijde retailbarcode',
            convG14Title: 'GTIN-14 (Indicator {ind})',
            convG14Same: 'Basiseenheid · controlecijfer ongewijzigd',
            convG14Recalc: 'Omdoos / verpakking · controlecijfer herberekend',
            convCopy: 'Kopiëren',
            convInspect: 'Inspecteer ↑'
        }
    }
};

function escAttr(s) {
    return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function buildPage(code) {
    const t = LOCALES[code];
    const r = ROUTES[code];

    const hreflangLinks = Object.entries(ROUTES)
        .map(([k, v]) => `    <link rel="alternate" hreflang="${k}" href="${v.url}">`)
        .join('\n') + `\n    <link rel="alternate" hreflang="x-default" href="${ROUTES.en.url}">`;

    const langSwitcher = Object.entries(ROUTES)
        .map(([k, v]) => `                <a href="${v.path}" class="lang-pill${k === code ? ' active' : ''}" hreflang="${k}" title="${v.name}"${k === code ? ' aria-current="page"' : ''}>${v.label}</a>`)
        .join('\n');

    const jsonLd = {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'WebApplication',
                name: t.schemaAppName,
                url: r.url,
                inLanguage: t.lang,
                description: t.schemaAppDesc,
                applicationCategory: 'BusinessApplication',
                operatingSystem: 'Any',
                offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' }
            },
            {
                '@type': 'HowTo',
                name: t.schemaHowToName,
                inLanguage: t.lang,
                description: t.schemaHowToDesc,
                step: t.howToSteps.map(s => ({ '@type': 'HowToStep', name: s.name, text: s.text }))
            },
            {
                '@type': 'FAQPage',
                inLanguage: t.lang,
                mainEntity: t.faqs.map(f => ({
                    '@type': 'Question',
                    name: f.q,
                    acceptedAnswer: { '@type': 'Answer', text: f.aText }
                }))
            }
        ]
    };

    const typeButtons = [
        ['sscc', 17, t.types.sscc.label, t.samples.sscc, t.types.sscc.tab, true],
        ['gtin13', 12, t.types.gtin13.label, t.samples.gtin13, t.types.gtin13.tab, false],
        ['gtin12', 11, t.types.gtin12.label, t.samples.gtin12, t.types.gtin12.tab, false],
        ['gtin14', 13, t.types.gtin14.label, t.samples.gtin14, t.types.gtin14.tab, false],
        ['gtin8', 7, t.types.gtin8.label, t.samples.gtin8, t.types.gtin8.tab, false],
        ['gln', 12, t.types.gln.label, t.samples.gln, t.types.gln.tab, false]
    ].map(([id, len, lbl, sample, tab, active]) =>
        `                <button type="button" class="type-btn${active ? ' active' : ''}" onclick="setType(this, '${id}', ${len}, '${lbl.replace(/'/g, "\\'")}', '${sample}')">${tab}</button>`
    ).join('\n');

    const stepPills = t.steps
        .map((s, i) => `                        <button type="button" class="step-pill${i === 0 ? ' active' : ''}" data-step="${i}" onclick="setStep(${i})">${s}</button>`)
        .join('\n');

    const seoColsHtml = t.seoCols
        .map(c => `                <div>\n                    <h2>${c.h2}</h2>\n                    ${c.html}\n                </div>`)
        .join('\n');

    const convOptions = t.convIndOptions
        .map((opt, idx) => `                        <option value="${idx}"${idx === 0 ? ' selected' : ''}>${opt}</option>`)
        .join('\n');

    const refTh = t.refHeaders.map(h => `<th>${h}</th>`).join('');
    const refTrs = t.refRows
        .map(row => `                            <tr>${row.map(c => `<td>${c}</td>`).join('')}</tr>`)
        .join('\n');

    const faqHtml = t.faqs
        .map((f, idx) => `                <details class="faq-item"${idx === 0 ? ' open' : ''}>\n                    <summary>${f.q}</summary>\n                    <p>${f.aHtml}</p>\n                </details>`)
        .join('\n');

    const jsI18n = {
        ...t.js,
        resLabelTop: t.resLabelTop,
        resLabelQuiz: t.resLabelQuiz,
        prefix: t.samples.prefix,
        typeLabels: {
            gtin12: t.types.gtin12.label,
            gtin13: t.types.gtin13.label,
            gtin14: t.types.gtin14.label
        }
    };

    return `<!DOCTYPE html>
<html lang="${t.lang}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>${escAttr(t.title)}</title>
    <meta name="description" content="${escAttr(t.description)}">
    <meta name="keywords" content="${escAttr(t.keywords)}">
    <meta name="author" content="SSCCAPI">
    <meta name="robots" content="index, follow">
    <link rel="canonical" href="${r.url}">
${hreflangLinks}
    <link rel="alternate" type="text/plain" href="https://ssccapi.com/llms.txt" title="LLMs.txt AI Agent Documentation">

    <meta property="og:type" content="website">
    <meta property="og:locale" content="${t.ogLocale}">
    <meta property="og:site_name" content="SSCCAPI">
    <meta property="og:title" content="${escAttr(t.ogTitle)}">
    <meta property="og:description" content="${escAttr(t.ogDesc)}">
    <meta property="og:url" content="${r.url}">
    <meta property="og:image" content="https://ssccapi.com/og-image.png">

    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:url" content="${r.url}">
    <meta name="twitter:title" content="${escAttr(t.twTitle)}">
    <meta name="twitter:description" content="${escAttr(t.twDesc)}">
    <meta name="twitter:image" content="https://ssccapi.com/og-image.png">

    <!-- Schema.org WebApplication, HowTo & FAQPage -->
    <script type="application/ld+json">
${JSON.stringify(jsonLd, null, 4)}
    </script>

    <link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png">
    <link rel="apple-touch-icon" href="/icon-192.png">
    <link rel="manifest" href="/manifest.json">
    <meta name="theme-color" content="#0b0e14">

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">

    <style>${CSS}    </style>
    <script>
    (function() {
        var map = {
            'index.html': '',
            'calculator.html': 'calculator',
            'pt/calculadora.html': 'pt/calculadora',
            'es/calculadora.html': 'es/calculadora',
            'fr/calculateur.html': 'fr/calculateur',
            'de/rechner.html': 'de/rechner',
            'nl/calculator.html': 'nl/calculator',
            'guide.html': 'guide',
            'sscc-api-guide.html': 'docs'
        };
        var clean = window.location.pathname.replace(/^\\/(sscc-check|sscc)\\//, '').replace(/^\\//, '');
        var nice = (clean in map) ? map[clean] : clean;
        if (window.location.hostname.includes('github.io') || window.location.hostname.includes('pormenores.net')) {
            window.location.replace('https://ssccapi.com/' + nice + window.location.search + window.location.hash);
        } else if (clean in map && window.history && window.history.replaceState) {
            window.history.replaceState(null, '', '/' + nice + window.location.search + window.location.hash);
        }
    })();
    </script>
</head>
<body>

<header class="site-header">
    <div class="header-inner">
        <div class="brand">
            <a href="/" style="color:inherit;text-decoration:none;display:inline-flex;align-items:center;gap:0.45rem;" title="SSCCAPI Home">
                <span class="brand-dot"></span>
                <span>ssccapi.com</span>
            </a>
            <span class="brand-sep">/</span>
            <span class="brand-sub">${t.brandSub}</span>
        </div>
        <div class="header-right">
            <div class="lang-switch" role="navigation" aria-label="Language">
${langSwitcher}
            </div>
            <nav class="header-nav">
                <a href="/" class="nav-pill">${t.nav.studio}</a>
                <a href="${r.path}" class="nav-pill active">${t.nav.calc}</a>
                <a href="/guide" class="nav-pill">${t.nav.guide}</a>
                <a href="/docs" class="nav-pill">${t.nav.api}</a>
            </nav>
        </div>
    </div>
</header>

<div class="container">
    <div class="calc-grid">
        <main class="card" style="margin-bottom:0;">
            <div class="card-header">
                <div>
                    <h1>${t.h1Pre}<span>${t.h1Accent}</span>${t.h1Post}</h1>
                    <p class="tagline">${t.tagline}</p>
                </div>
                <div class="mode-switch" role="group" aria-label="${escAttr(t.modeAria)}">
                    <button type="button" class="mode-tab active" id="tab-learn" onclick="setMode('learn')">
                        <i data-lucide="sparkles" style="width:13px;height:13px;"></i>
                        <span>${t.tabLearn}</span>
                    </button>
                    <button type="button" class="mode-tab" id="tab-quiz" onclick="setMode('quiz')">
                        <i data-lucide="graduation-cap" style="width:13px;height:13px;"></i>
                        <span>${t.tabQuiz}</span>
                    </button>
                </div>
            </div>

            <div class="type-tabs">
${typeButtons}
            </div>

            <div class="calc-input-box">
                <label>
                    <span id="type-label">${t.types.sscc.label} — ${t.inputExcl}</span>
                    <span id="len-label" style="color:var(--primary);">17 ${t.digitsUnit}</span>
                </label>
                <div class="input-row">
                    <input type="text" id="calc-input" class="calc-input" inputmode="numeric" placeholder="${escAttr(t.inputPlaceholder)}" value="${t.samples.sscc}" oninput="onUserInput()">
                    <button type="button" class="btn-dice" onclick="generateRandomSample()" title="${escAttr(t.btnRandomTitle)}">
                        <i data-lucide="shuffle" style="width:14px;height:14px;"></i>
                        <span>${t.btnRandom}</span>
                    </button>
                </div>
            </div>

            <div id="result-panel" class="result-panel show">
                <!-- Result Banner -->
                <div class="result-highlight">
                    <div>
                        <div style="font-size:10.5px;color:var(--text-muted);margin-bottom:3px;font-family:var(--font-mono);" id="res-label-top">${t.resLabelTop}</div>
                        <div id="res-full-code" class="result-code-large">${t.samples.sscc}</div>
                    </div>
                    <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
                        <div style="text-align:right;">
                            <div style="font-size:10px;color:var(--text-muted);margin-bottom:2px;font-family:var(--font-mono);">${t.cdLabel}</div>
                            <span id="res-cd-val" class="cd-pill">0</span>
                        </div>
                    </div>
                </div>

                <!-- Action Buttons -->
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;flex-wrap:wrap;gap:8px;">
                    <div style="display:flex;gap:6px;flex-wrap:wrap;">
                        <button type="button" class="btn-copy-full" onclick="openCalculatedInLabelStudio()" style="border-color:rgba(245,158,11,0.45);color:var(--primary);">
                            <i data-lucide="barcode" style="width:13px;height:13px;"></i>
                            <span>${t.btnStudio}</span>
                        </button>
                        <button type="button" class="btn-copy-full" id="btn-copy" onclick="copyFullResult()">
                            <i data-lucide="copy" style="width:13px;height:13px;"></i>
                            <span id="copy-label">${t.btnCopy}</span>
                        </button>
                    </div>
                    <span id="len-warning" style="font-family:var(--font-mono);font-size:11px;color:var(--primary);display:none;"></span>
                </div>

                <!-- Practice Quiz Panel -->
                <div id="quiz-box" class="quiz-box">
                    <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
                        <span style="font-family:var(--font-mono);font-size:12px;font-weight:700;color:var(--success);">${t.quizTitle}</span>
                        <span id="quiz-streak" style="font-family:var(--font-mono);font-size:11px;color:var(--primary);font-weight:700;">${t.quizStreak}: 0</span>
                    </div>
                    <p style="font-size:12px;color:var(--text-muted);margin-top:4px;">${t.quizIntro}</p>
                    <div class="quiz-row">
                        <div class="quiz-digits" id="quiz-digits"></div>
                        <button type="button" class="walk-btn" onclick="toggleQuizHint()">
                            <i data-lucide="lightbulb" style="width:13px;height:13px;"></i>
                            <span>${t.btnHint}</span>
                        </button>
                        <button type="button" class="walk-btn" onclick="nextQuizRound()">
                            <i data-lucide="arrow-right" style="width:13px;height:13px;"></i>
                            <span>${t.btnNewCode}</span>
                        </button>
                    </div>
                    <div id="quiz-feedback" class="quiz-feedback"></div>
                </div>

                <!-- Walkthrough Step Controls -->
                <div class="walkthrough-bar">
                    <div class="step-pills">
${stepPills}
                    </div>
                    <div class="walk-controls">
                        <button type="button" class="walk-btn" onclick="prevStep()" title="${escAttr(t.btnPrev)}">◀</button>
                        <button type="button" class="walk-btn" id="btn-play" onclick="togglePlay()">
                            <i data-lucide="play" style="width:12px;height:12px;"></i>
                            <span id="play-label">${t.btnPlay}</span>
                        </button>
                        <button type="button" class="walk-btn" onclick="nextStep()" title="${escAttr(t.btnNext)}">▶</button>
                    </div>
                </div>

                <!-- Dynamic Step Narrative -->
                <div class="step-explain" id="step-explain"></div>

                <!-- Interactive Digit Tiles -->
                <div class="rtl-banner">
                    <span>${t.rtlLeft}</span>
                    <span class="rtl-arrow">${t.rtlRight}</span>
                </div>
                <div class="tiles-scroll">
                    <div class="digit-tiles" id="digit-tiles"></div>
                </div>

                <!-- Live Digit Inspector -->
                <div class="digit-inspector" id="digit-inspector"></div>

                <!-- Step 2: ×3 vs ×1 Visual Buckets -->
                <div class="buckets-grid" id="buckets-grid">
                    <div class="bucket-card b3">
                        <div class="bucket-head">
                            <span>${t.b3Head}</span>
                            <span id="b3-total">= 0</span>
                        </div>
                        <div class="bucket-eq" id="b3-eq"></div>
                    </div>
                    <div class="bucket-card b1">
                        <div class="bucket-head">
                            <span>${t.b1Head}</span>
                            <span id="b1-total">= 0</span>
                        </div>
                        <div class="bucket-eq" id="b1-eq"></div>
                    </div>
                </div>

                <!-- Step 3: SVG Modulo-10 Number-Line Gauge -->
                <div class="gauge-card" id="gauge-card">
                    <div class="gauge-head">
                        <span style="color:var(--text-main);font-weight:700;">${t.gaugeTitle}</span>
                        <span id="gauge-equation" style="color:var(--success);font-weight:700;"></span>
                    </div>
                    <svg id="mod10-svg" class="gauge-svg" viewBox="0 0 680 112" role="img" aria-label="${escAttr(t.gaugeAria)}"></svg>
                </div>

                <!-- Step 4: Interactive Error-Detection / Typo Simulator -->
                <div class="typo-box" id="typo-box">
                    <div class="typo-head">
                        <span class="typo-title">${t.typoTitle}</span>
                        <div class="typo-actions">
                            <button type="button" class="typo-btn" onclick="simulateTypo('single')">${t.typoSingle}</button>
                            <button type="button" class="typo-btn" onclick="simulateTypo('swap')">${t.typoSwap}</button>
                            <button type="button" class="typo-btn" onclick="clearTypo()" style="border-color:var(--border);color:var(--text-muted);">${t.typoReset}</button>
                        </div>
                    </div>
                    <div class="typo-result" id="typo-result">${t.typoDefault}</div>
                </div>

                <!-- Classic Compact Math Table -->
                <details class="classic-details">
                    <summary>${t.classicSummary}</summary>
                    <div class="math-table-wrap">
                        <table class="math-table">
                            <thead><tr id="math-header"></tr></thead>
                            <tbody>
                                <tr id="math-digits"></tr>
                                <tr id="math-weights"></tr>
                                <tr id="math-products"></tr>
                            </tbody>
                        </table>
                    </div>
                </details>
            </div>

            <div class="cta-box">
                <h3>${t.ctaTitle}</h3>
                <p>${t.ctaDesc}</p>
                <div style="display:flex;justify-content:center;gap:10px;flex-wrap:wrap;">
                    <a href="/#labels" class="cta-btn">
                        <i data-lucide="printer" style="width:14px;height:14px;"></i>
                        <span>${t.ctaBtn1}</span>
                    </a>
                    <a href="/docs" class="cta-btn" style="background:rgba(245,158,11,0.14);color:var(--primary);border:1px solid rgba(245,158,11,0.45);">
                        <i data-lucide="terminal" style="width:14px;height:14px;"></i>
                        <span>${t.ctaBtn2}</span>
                    </a>
                </div>
            </div>
        </main>

        <article class="seo-article">
            <div class="seo-cols">
${seoColsHtml}
            </div>
            <div class="tip-callout">${t.proTip}</div>

            <section class="converter-box" id="upc-gtin-converter" aria-labelledby="conv-heading">
                <h2 id="conv-heading">${t.convHeading}</h2>
                <p>${t.convIntro}</p>
                <div class="converter-controls">
                    <input type="text" id="conv-input" class="conv-input" inputmode="numeric" value="012345678905" placeholder="${escAttr(t.convPlaceholder)}" oninput="updateGtinConverter()">
                    <label for="conv-ind" style="font-family:var(--font-mono);font-size:11.5px;color:var(--text-muted);">${t.convIndLabel}</label>
                    <select id="conv-ind" class="conv-select" onchange="updateGtinConverter()">
${convOptions}
                    </select>
                </div>
                <div class="conv-grid" id="conv-results"></div>

                <div class="ref-table-wrap">
                    <table class="ref-table" aria-label="${escAttr(t.refAria)}">
                        <thead>
                            <tr>${refTh}</tr>
                        </thead>
                        <tbody>
${refTrs}
                        </tbody>
                    </table>
                </div>
            </section>

            <section class="faq-list" aria-labelledby="faq-heading">
                <h2 id="faq-heading" style="margin-bottom:4px;">${t.faqHeading}</h2>
${faqHtml}
            </section>
        </article>
    </div>

    <footer class="site-footer">
        <a href="https://ssccapi.com/">ssccapi.com</a>
        <span aria-hidden="true">•</span>
        <a href="/guide">${t.footerGuide}</a>
        <span aria-hidden="true">•</span>
        <a href="/docs">${t.footerApi}</a>
        <span aria-hidden="true">•</span>
        <a href="https://github.com/birth1mark/sscc-check" target="_blank" rel="noopener noreferrer">GitHub</a>
        <span aria-hidden="true">•</span>
        <a href="/llms.txt">/llms.txt</a>
        <span aria-hidden="true">•</span>
        <a href="https://pormenores.net/" target="_blank" rel="noopener noreferrer">pormenores.net</a>
    </footer>
</div>

<script src="https://unpkg.com/lucide@0.453.0/dist/umd/lucide.min.js"></script>
<script>
const I18N = ${JSON.stringify(jsI18n)};
function fmt(tpl, vars) {
    return String(tpl).replace(/\\{(\\w+)\\}/g, (_, k) => (k in vars ? vars[k] : ''));
}

let currentExpectedLen = 17;
let currentTypeName = ${JSON.stringify(t.types.sscc.label)};
let currentMode = 'learn';
let activeStep = 0;
let focusedIndex = null;
let playTimer = null;
let quizStreak = 0;
let quizRevealed = false;
let quizHintShown = false;
let activeTypo = null;
let lastCalc = null;

function setMode(mode) {
    currentMode = mode;
    stopPlay();
    clearTypo(true);
    document.getElementById('tab-learn').classList.toggle('active', mode === 'learn');
    document.getElementById('tab-quiz').classList.toggle('active', mode === 'quiz');
    document.getElementById('quiz-box').classList.toggle('show', mode === 'quiz');
    if (mode === 'quiz') {
        quizRevealed = false;
        quizHintShown = false;
        buildQuizButtons();
        if (!lastCalc) calculate();
        renderAll();
    } else {
        quizRevealed = true;
        renderAll();
    }
}

function setType(btnEl, type, reqLen, typeName, sampleVal) {
    currentExpectedLen = reqLen;
    currentTypeName = typeName;
    stopPlay();
    clearTypo(true);
    document.querySelectorAll('.type-btn').forEach(btn => btn.classList.remove('active'));
    if (btnEl) btnEl.classList.add('active');

    document.getElementById('type-label').textContent = typeName + ' — ' + I18N.excl;
    document.getElementById('len-label').textContent = reqLen + ' ' + I18N.digits;
    document.getElementById('calc-input').value = sampleVal;
    focusedIndex = null;
    if (currentMode === 'quiz') {
        quizRevealed = false;
        quizHintShown = false;
        buildQuizButtons();
    }
    calculate();
}

function generateRandomSample() {
    stopPlay();
    clearTypo(true);
    let prefix = currentExpectedLen === 17 ? ('3' + I18N.prefix) : (currentExpectedLen === 13 ? ('1' + I18N.prefix) : I18N.prefix);
    let out = prefix.slice(0, Math.min(prefix.length, currentExpectedLen));
    while (out.length < currentExpectedLen) {
        out += Math.floor(Math.random() * 10);
    }
    document.getElementById('calc-input').value = out;
    focusedIndex = null;
    if (currentMode === 'quiz') {
        quizRevealed = false;
        quizHintShown = false;
        buildQuizButtons();
    }
    calculate();
}

function onUserInput() {
    stopPlay();
    clearTypo(true);
    focusedIndex = null;
    if (currentMode === 'quiz') {
        quizRevealed = false;
        quizHintShown = false;
        buildQuizButtons();
    }
    calculate();
}

function calculate() {
    const raw = document.getElementById('calc-input').value.replace(/\\D/g, '');
    const panel = document.getElementById('result-panel');
    if (!raw) {
        panel.classList.remove('show');
        lastCalc = null;
        return;
    }
    panel.classList.add('show');

    const digits = raw.split('').map(c => parseInt(c, 10));
    const n = digits.length;
    const weights = [];
    const products = [];
    let sum = 0;
    const w3Digits = [];
    const w1Digits = [];

    for (let i = 0; i < n; i++) {
        const rtlIdx = n - 1 - i;
        const w = (rtlIdx % 2 === 0) ? 3 : 1;
        const p = digits[i] * w;
        weights.push(w);
        products.push(p);
        sum += p;
        if (w === 3) w3Digits.push({ idx: i, d: digits[i], p });
        else w1Digits.push({ idx: i, d: digits[i], p });
    }

    const sum3Digits = w3Digits.reduce((a, b) => a + b.d, 0);
    const sum3Total = sum3Digits * 3;
    const sum1Total = w1Digits.reduce((a, b) => a + b.d, 0);
    const cd = (10 - (sum % 10)) % 10;
    const next10 = Math.ceil(sum / 10) * 10;
    const maxProd = Math.max(1, ...products);

    lastCalc = { raw, digits, weights, products, sum, w3Digits, w1Digits, sum3Digits, sum3Total, sum1Total, cd, next10, maxProd };
    renderAll();
}

function renderAll() {
    if (!lastCalc) return;
    const c = lastCalc;
    const hideAnswer = (currentMode === 'quiz' && !quizRevealed);

    document.getElementById('res-label-top').textContent = hideAnswer ? I18N.resLabelQuiz : I18N.resLabelTop;
    document.getElementById('res-full-code').innerHTML = hideAnswer
        ? c.raw + '<span style="color:var(--primary);font-weight:800;">?</span>'
        : c.raw + '<span style="color:var(--success);font-weight:800;">' + c.cd + '</span>';
    document.getElementById('res-cd-val').textContent = hideAnswer ? '?' : c.cd;
    document.getElementById('res-cd-val').style.color = hideAnswer ? 'var(--primary)' : 'var(--success)';

    const warnEl = document.getElementById('len-warning');
    if (c.raw.length !== currentExpectedLen) {
        warnEl.style.display = 'inline';
        warnEl.textContent = fmt(I18N.lenNote, { len: c.raw.length, type: currentTypeName, exp: currentExpectedLen });
    } else {
        warnEl.style.display = 'none';
    }

    renderStepBanner(c, hideAnswer);
    renderDigitTiles(c, hideAnswer);
    renderDigitInspector(c);
    renderBuckets(c, hideAnswer);
    renderGauge(c, hideAnswer);
    renderClassicTable(c);

    document.getElementById('buckets-grid').style.opacity = (activeStep === 0 || activeStep === 2) ? '1' : '0.45';
    document.getElementById('gauge-card').style.opacity = (activeStep === 0 || activeStep === 3) ? '1' : '0.45';
    document.getElementById('typo-box').style.opacity = (activeStep === 0 || activeStep === 4) ? '1' : '0.5';

    if (window.lucide) lucide.createIcons();
}

function renderStepBanner(c, hideAnswer) {
    const el = document.getElementById('step-explain');
    const stepTexts = {
        0: {
            badge: I18N.badge0,
            html: hideAnswer ? I18N.s0Quiz : fmt(I18N.s0Show, { sum: c.sum, next10: c.next10, cd: c.cd })
        },
        1: {
            badge: I18N.badge1,
            html: fmt(I18N.s1, { n: c.digits.length })
        },
        2: {
            badge: I18N.badge2,
            html: fmt(I18N.s2, { sum3d: c.sum3Digits, sum3t: c.sum3Total, sum1t: c.sum1Total, sum: c.sum })
        },
        3: {
            badge: I18N.badge3,
            html: hideAnswer ? I18N.s3Quiz : fmt(I18N.s3Show, { sum: c.sum, next10: c.next10, cd: c.cd, exact: c.cd === 0 ? I18N.s3Exact : '.' })
        },
        4: {
            badge: I18N.badge4,
            html: fmt(I18N.s4, { cd: hideAnswer ? '?' : c.cd, next10: c.next10 })
        }
    };
    const s = stepTexts[activeStep] || stepTexts[0];
    el.innerHTML = '<span class="step-badge">' + s.badge + '</span><div>' + s.html + '</div>';
}

function renderDigitTiles(c, hideAnswer) {
    const wrap = document.getElementById('digit-tiles');
    const totalTiles = c.digits.length + 1;
    const colsLg = Math.min(totalTiles, 18);
    const colsMd = totalTiles <= 9 ? totalTiles : Math.ceil(totalTiles / 2);
    const colsSm = totalTiles <= 6 ? totalTiles : (totalTiles <= 12 ? Math.ceil(totalTiles / 2) : 6);
    wrap.style.setProperty('--tile-cols', colsLg);
    wrap.style.setProperty('--tile-cols-md', colsMd);
    wrap.style.setProperty('--tile-cols-sm', colsSm);

    const typoIndices = activeTypo ? activeTypo.indices : [];
    const shownDigits = activeTypo ? activeTypo.mutatedDigits : c.digits;
    let html = '';

    for (let i = 0; i < shownDigits.length; i++) {
        const d = shownDigits[i];
        const w = c.weights[i];
        const p = d * w;
        const barPct = Math.round((p / 27) * 100);
        const isFocused = (focusedIndex === i);
        const isTypo = typoIndices.includes(i);
        const cls = 'd-tile ' + (w === 3 ? 'w3' : 'w1') + (isFocused ? ' focused' : '') + (isTypo ? ' typo-hit' : '');
        const rtlPos = c.digits.length - i;
        const title = fmt(I18N.tileTitle, { p: i + 1, rtl: rtlPos, d, w, prod: p });

        html += '<div class="' + cls + '" onclick="focusDigit(' + i + ')" onmouseenter="focusDigit(' + i + ')" title="' + title + '">' +
            '<div class="d-pos">P' + (i + 1) + '</div>' +
            '<div class="d-num">' + d + '</div>' +
            '<div class="d-weight">×' + w + '</div>' +
            '<div class="d-prod">' + (hideAnswer && !quizHintShown ? '·' : '=' + p) + '</div>' +
            '<div class="d-bar-wrap"><div class="d-bar" style="width:' + (hideAnswer && !quizHintShown ? 0 : barPct) + '%;"></div></div>' +
            '</div>';
    }

    html += '<div class="d-tile cd-tile" title="' + I18N.cdTileTitle + '">' +
        '<div class="d-pos" style="color:var(--success);">' + I18N.cdTileTop + '</div>' +
        '<div class="d-num" style="color:' + (hideAnswer ? 'var(--primary)' : 'var(--success)') + ';">' + (hideAnswer ? '?' : c.cd) + '</div>' +
        '<div class="d-weight">' + I18N.cdTileShort + '</div>' +
        '<div class="d-prod">' + (hideAnswer ? I18N.cdGuess : 'mod 10') + '</div>' +
        '<div class="d-bar-wrap"><div class="d-bar" style="width:100%;background:var(--success);"></div></div>' +
        '</div>';

    wrap.innerHTML = html;
}

function focusDigit(idx) {
    focusedIndex = idx;
    if (!lastCalc) return;
    document.querySelectorAll('.d-tile').forEach((el, i) => {
        el.classList.toggle('focused', i === idx);
    });
    renderDigitInspector(lastCalc);
}

function renderDigitInspector(c) {
    const el = document.getElementById('digit-inspector');
    const hideAnswer = (currentMode === 'quiz' && !quizRevealed && !quizHintShown);
    if (focusedIndex === null || focusedIndex >= c.digits.length) {
        const lastIdx = c.digits.length - 1;
        el.innerHTML = fmt(I18N.inspTip, { p: lastIdx + 1, d: c.digits[lastIdx], prod: hideAnswer ? '?' : c.products[lastIdx] });
        return;
    }
    const i = focusedIndex;
    const d = activeTypo ? activeTypo.mutatedDigits[i] : c.digits[i];
    const w = c.weights[i];
    const p = d * w;
    const rtl = c.digits.length - i;
    const share = c.sum > 0 ? ((p / c.sum) * 100).toFixed(1) : '0.0';
    el.innerHTML = fmt(I18N.inspFocus, {
        p: i + 1,
        rtl,
        parity: rtl % 2 === 1 ? I18N.odd : I18N.even,
        d,
        col: w === 3 ? 'var(--primary)' : 'var(--cyan)',
        w,
        prod: hideAnswer ? '?' : p,
        right: hideAnswer ? I18N.quizHintHidden : fmt(I18N.shareSum, { share, sum: c.sum })
    });
}

function renderBuckets(c, hideAnswer) {
    const showMath = !hideAnswer || quizHintShown;
    document.getElementById('b3-total').textContent = showMath ? '= ' + c.sum3Total : '= ?';
    document.getElementById('b1-total').textContent = showMath ? '= ' + c.sum1Total : '= ?';

    const d3List = c.w3Digits.map(x => x.d).join(' + ');
    const d1List = c.w1Digits.map(x => x.d).join(' + ');

    document.getElementById('b3-eq').innerHTML = showMath
        ? '(' + d3List + ') = <strong>' + c.sum3Digits + '</strong> → <strong>' + c.sum3Digits + ' × 3 = ' + c.sum3Total + '</strong>'
        : fmt(I18N.b3Hide, { list: d3List });

    document.getElementById('b1-eq').innerHTML = showMath
        ? '(' + (d1List || '0') + ') × 1 = <strong>' + c.sum1Total + '</strong>'
        : fmt(I18N.b1Hide, { list: d1List || '0' });
}

function renderGauge(c, hideAnswer) {
    const svg = document.getElementById('mod10-svg');
    const eq = document.getElementById('gauge-equation');

    if (hideAnswer) {
        eq.textContent = I18N.gaugeQuizEq;
        svg.innerHTML = '<rect x="10" y="20" width="660" height="72" rx="10" fill="#0f141f" stroke="#222c3d" stroke-dasharray="5 5"/>' +
            '<text x="340" y="61" text-anchor="middle" fill="#94a3b8" font-family="JetBrains Mono, monospace" font-size="13">' + I18N.gaugeQuizSvg + '</text>';
        return;
    }

    const base10 = Math.floor(c.sum / 10) * 10;
    const top10 = base10 + 10;
    const isExact = (c.sum % 10 === 0);
    const target = isExact ? c.sum : top10;
    eq.textContent = fmt(I18N.gaugeEq, { target, sum: c.sum, cd: c.cd });

    const padL = 44, padR = 44, lineY = 74;
    const span = 680 - padL - padR;
    const xOf = offset => padL + (offset / 10) * span;
    const sumOffset = c.sum - base10;
    const sumX = xOf(sumOffset);
    const targetX = xOf(isExact ? 0 : 10);

    let ticks = '';
    for (let k = 0; k <= 10; k++) {
        const val = base10 + k;
        const x = xOf(k);
        const isTen = (k === 0 || k === 10);
        const isSum = (k === sumOffset);
        ticks += '<line x1="' + x + '" y1="' + (lineY - (isTen ? 11 : 6)) + '" x2="' + x + '" y2="' + (lineY + (isTen ? 11 : 6)) + '" stroke="' + (isTen ? '#10b981' : '#334155') + '" stroke-width="' + (isTen ? 2.5 : 1.5) + '"/>' +
            '<text x="' + x + '" y="' + (lineY + 27) + '" text-anchor="middle" fill="' + (isSum ? '#38bdf8' : (isTen ? '#10b981' : '#64748b')) + '" font-family="JetBrains Mono, monospace" font-size="' + (isTen || isSum ? 12 : 10.5) + '" font-weight="' + (isTen || isSum ? 700 : 500) + '">' + val + '</text>';
    }

    let arc = '';
    if (!isExact) {
        const midX = (sumX + targetX) / 2;
        arc = '<path d="M ' + sumX + ' ' + (lineY - 10) + ' Q ' + midX + ' 12 ' + targetX + ' ' + (lineY - 12) + '" fill="none" stroke="#10b981" stroke-width="3" stroke-dasharray="6 4"/>' +
            '<polygon points="' + targetX + ',' + (lineY - 8) + ' ' + (targetX - 8) + ',' + (lineY - 18) + ' ' + (targetX + 3) + ',' + (lineY - 18) + '" fill="#10b981"/>' +
            '<rect x="' + (midX - 64) + '" y="8" width="128" height="24" rx="6" fill="rgba(16,185,129,0.18)" stroke="#10b981"/>' +
            '<text x="' + midX + '" y="24" text-anchor="middle" fill="#6ee7b7" font-family="JetBrains Mono, monospace" font-size="11.5" font-weight="800">' + fmt(I18N.gaugePlus, { cd: c.cd }) + '</text>';
    } else {
        arc = '<rect x="' + (sumX - 10) + '" y="10" width="235" height="26" rx="6" fill="rgba(16,185,129,0.18)" stroke="#10b981"/>' +
            '<text x="' + (sumX + 107) + '" y="27" text-anchor="middle" fill="#6ee7b7" font-family="JetBrains Mono, monospace" font-size="11.5" font-weight="800">' + I18N.gaugeZero + '</text>';
    }

    svg.innerHTML = '<line x1="' + padL + '" y1="' + lineY + '" x2="' + (680 - padR) + '" y2="' + lineY + '" stroke="#222c3d" stroke-width="3" stroke-linecap="round"/>' +
        (!isExact ? '<line x1="' + sumX + '" y1="' + lineY + '" x2="' + targetX + '" y2="' + lineY + '" stroke="#10b981" stroke-width="4"/>' : '') +
        ticks + arc +
        '<circle cx="' + sumX + '" cy="' + lineY + '" r="7" fill="#38bdf8" stroke="#0b0e14" stroke-width="2.5"/>' +
        '<text x="' + sumX + '" y="' + (lineY - 18) + '" text-anchor="middle" fill="#38bdf8" font-family="JetBrains Mono, monospace" font-size="11" font-weight="700">' + fmt(I18N.gaugeSum, { sum: c.sum }) + '</text>' +
        '<circle cx="' + targetX + '" cy="' + lineY + '" r="' + (isExact ? 4 : 7) + '" fill="#10b981" stroke="#0b0e14" stroke-width="2"/>';
}

function renderClassicTable(c) {
    let th = '<th>' + I18N.tblPos + '</th>';
    let tdD = '<td>' + I18N.tblDig + '</td>';
    let tdW = '<td class="row-weight">' + I18N.tblW + '</td>';
    let tdP = '<td class="row-prod">' + I18N.tblProd + '</td>';

    c.digits.forEach((d, idx) => {
        th += '<th>P' + (idx + 1) + '</th>';
        tdD += '<td><strong>' + d + '</strong></td>';
        tdW += '<td class="row-weight">' + c.weights[idx] + '</td>';
        tdP += '<td class="row-prod">' + c.products[idx] + '</td>';
    });

    document.getElementById('math-header').innerHTML = th;
    document.getElementById('math-digits').innerHTML = tdD;
    document.getElementById('math-weights').innerHTML = tdW;
    document.getElementById('math-products').innerHTML = tdP;
}

function setStep(step) {
    activeStep = step;
    document.querySelectorAll('.step-pill').forEach(p => {
        p.classList.toggle('active', parseInt(p.dataset.step, 10) === step);
    });
    if (step === 1 && lastCalc) focusedIndex = lastCalc.digits.length - 1;
    renderAll();
}

function nextStep() { setStep(activeStep >= 4 ? 0 : activeStep + 1); }
function prevStep() { setStep(activeStep <= 0 ? 4 : activeStep - 1); }

function togglePlay() {
    if (playTimer) { stopPlay(); return; }
    const btn = document.getElementById('btn-play');
    btn.classList.add('playing');
    document.getElementById('play-label').textContent = I18N.stop;
    setStep(1);
    let step = 1;
    playTimer = setInterval(() => {
        step++;
        if (step > 4) { stopPlay(); setStep(0); return; }
        setStep(step);
    }, 2800);
}

function stopPlay() {
    if (playTimer) { clearInterval(playTimer); playTimer = null; }
    const btn = document.getElementById('btn-play');
    if (btn) btn.classList.remove('playing');
    const lbl = document.getElementById('play-label');
    if (lbl) lbl.textContent = I18N.play;
}

function simulateTypo(kind) {
    if (!lastCalc || lastCalc.digits.length < 2) return;
    const c = lastCalc;
    const mutated = [...c.digits];
    let indices = [];
    let desc = '';

    if (kind === 'single') {
        const idx = Math.floor(c.digits.length / 2);
        const orig = mutated[idx];
        mutated[idx] = (orig + 1) % 10;
        indices = [idx];
        desc = fmt(I18N.typoChanged, { p: idx + 1, orig, mut: mutated[idx] });
    } else {
        let idx = -1;
        for (let i = 0; i < c.digits.length - 1; i++) {
            const diff = Math.abs(c.digits[i] - c.digits[i + 1]);
            if (diff !== 0 && diff !== 5) { idx = i; break; }
        }
        if (idx === -1) idx = 0;
        const a = mutated[idx], b = mutated[idx + 1];
        mutated[idx] = b;
        mutated[idx + 1] = a;
        indices = [idx, idx + 1];
        desc = fmt(I18N.typoSwapped, { p1: idx + 1, p2: idx + 2, a, b });
    }

    let newSum = 0;
    for (let i = 0; i < mutated.length; i++) newSum += mutated[i] * c.weights[i];
    const totalWithOriginalCD = newSum + c.cd;
    const rem = totalWithOriginalCD % 10;

    activeTypo = { kind, indices, mutatedDigits: mutated };
    setStep(4);

    const resEl = document.getElementById('typo-result');
    resEl.innerHTML = rem !== 0
        ? fmt(I18N.typoCaught, { desc, newSum, cd: c.cd, tot: totalWithOriginalCD, rem })
        : fmt(I18N.typoBlind, { desc });
    renderDigitTiles(c, currentMode === 'quiz' && !quizRevealed);
}

function clearTypo(silent) {
    activeTypo = null;
    if (!silent) {
        const resEl = document.getElementById('typo-result');
        if (resEl) resEl.textContent = I18N.typoDefault;
        if (lastCalc) renderAll();
    }
}

function buildQuizButtons() {
    const wrap = document.getElementById('quiz-digits');
    wrap.innerHTML = '';
    for (let n = 0; n <= 9; n++) {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'quiz-num-btn';
        b.textContent = n;
        b.onclick = () => submitQuizGuess(n, b);
        wrap.appendChild(b);
    }
    document.getElementById('quiz-feedback').innerHTML = '';
}

function submitQuizGuess(guess, btnEl) {
    if (!lastCalc) return;
    const fb = document.getElementById('quiz-feedback');
    if (guess === lastCalc.cd) {
        btnEl.classList.add('correct');
        if (!quizRevealed) {
            quizStreak++;
            document.getElementById('quiz-streak').textContent = '🔥 ' + I18N.quizStreakLbl + ': ' + quizStreak;
        }
        quizRevealed = true;
        fb.innerHTML = fmt(I18N.quizWin, { sum: lastCalc.sum, next10: lastCalc.next10, cd: lastCalc.cd });
        renderAll();
    } else {
        btnEl.classList.add('wrong');
        quizStreak = 0;
        document.getElementById('quiz-streak').textContent = I18N.quizStreakLbl + ': 0';
        fb.innerHTML = fmt(I18N.quizLose, { guess });
    }
}

function toggleQuizHint() { quizHintShown = !quizHintShown; renderAll(); }
function nextQuizRound() { generateRandomSample(); }

function copyFullResult() {
    if (!lastCalc) return;
    const full = lastCalc.raw + lastCalc.cd;
    navigator.clipboard.writeText(full).then(() => {
        const lbl = document.getElementById('copy-label');
        const btn = document.getElementById('btn-copy');
        lbl.textContent = I18N.copied;
        btn.style.borderColor = 'var(--success)';
        btn.style.color = 'var(--success)';
        setTimeout(() => {
            lbl.textContent = I18N.copyBtn;
            btn.style.borderColor = '';
            btn.style.color = '';
        }, 1600);
    });
}

function openCalculatedInLabelStudio() {
    if (!lastCalc) return;
    const full = lastCalc.raw + lastCalc.cd;
    window.location.href = full.length === 18
        ? '/?sscc=' + encodeURIComponent(full) + '&label=1'
        : '/?sscc=' + encodeURIComponent(full);
}

function calcGs1CheckDigit(payload) {
    let sum = 0;
    const rev = payload.split('').reverse();
    for (let i = 0; i < rev.length; i++) {
        sum += parseInt(rev[i], 10) * (i % 2 === 0 ? 3 : 1);
    }
    return (10 - (sum % 10)) % 10;
}

function loadIntoVisualLab(type, payload) {
    const btns = Array.from(document.querySelectorAll('.type-btn'));
    const idxMap = { sscc: 0, gtin13: 1, gtin12: 2, gtin14: 3, gtin8: 4, gln: 5 };
    const lenMap = { gtin12: 11, gtin13: 12, gtin14: 13 };
    if (!lenMap[type]) return;
    setType(btns[idxMap[type]], type, lenMap[type], I18N.typeLabels[type], payload);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function copyConvCode(code, btn) {
    navigator.clipboard.writeText(code).then(() => {
        const orig = btn.textContent;
        btn.textContent = I18N.copied;
        setTimeout(() => { btn.textContent = orig; }, 1200);
    });
}

function updateGtinConverter() {
    const inp = document.getElementById('conv-input');
    const indEl = document.getElementById('conv-ind');
    const out = document.getElementById('conv-results');
    if (!inp || !indEl || !out) return;

    const digits = inp.value.replace(/\\D/g, '');
    const ind = indEl.value || '0';

    let ean12 = null;
    if (digits.length === 11) {
        ean12 = '0' + digits;
    } else if (digits.length === 12) {
        const upcCd = calcGs1CheckDigit(digits.slice(0, 11));
        ean12 = (parseInt(digits[11], 10) === upcCd) ? ('0' + digits.slice(0, 11)) : digits;
    } else if (digits.length === 13) {
        const eanCd = calcGs1CheckDigit(digits.slice(0, 12));
        ean12 = (parseInt(digits[12], 10) === eanCd) ? digits.slice(0, 12) : digits.slice(1, 13);
    } else if (digits.length === 14) {
        ean12 = digits.slice(1, 13);
    }

    if (!ean12) {
        out.innerHTML = '<div class="conv-card" style="grid-column:1/-1;"><div class="conv-card-meta">' + I18N.convEmpty + '</div></div>';
        return;
    }

    const eanCd = calcGs1CheckDigit(ean12);
    const gtin14Payload = ind + ean12;
    const gtin14Cd = calcGs1CheckDigit(gtin14Payload);
    const canBeUpc = ean12.startsWith('0');
    const upcPayload = canBeUpc ? ean12.slice(1) : null;
    const upcCd = canBeUpc ? calcGs1CheckDigit(upcPayload) : null;

    const card = (title, payload, cd, meta, labType) => {
        if (!payload) {
            return '<div class="conv-card"><div class="conv-card-label">' + title + '</div><div class="conv-card-val" style="color:var(--text-dim);">' + I18N.convNotUpc + '</div><div class="conv-card-meta">' + meta + '</div></div>';
        }
        const full = payload + cd;
        return '<div class="conv-card">' +
            '<div class="conv-card-label">' + title + '</div>' +
            '<div class="conv-card-val">' + payload + '<span class="cd-hl">' + cd + '</span></div>' +
            '<div class="conv-card-meta">' + meta + '</div>' +
            '<div class="conv-card-actions">' +
            '<button type="button" class="conv-mini-btn" onclick="copyConvCode(\\'' + full + '\\', this)">' + I18N.convCopy + '</button>' +
            '<button type="button" class="conv-mini-btn" onclick="loadIntoVisualLab(\\'' + labType + '\\', \\'' + payload + '\\')">' + I18N.convInspect + '</button>' +
            '</div></div>';
    };

    out.innerHTML = [
        card('UPC-A / GTIN-12', upcPayload, upcCd, canBeUpc ? I18N.convUpcMeta : I18N.convNonUpcMeta, 'gtin12'),
        card('EAN-13 / GTIN-13', ean12, eanCd, I18N.convEanMeta, 'gtin13'),
        card(fmt(I18N.convG14Title, { ind }), gtin14Payload, gtin14Cd, ind === '0' ? I18N.convG14Same : I18N.convG14Recalc, 'gtin14')
    ].join('');
}

document.addEventListener('DOMContentLoaded', () => {
    calculate();
    updateGtinConverter();
    if (window.lucide) lucide.createIcons();
});
</script>

</body>
</html>
`;
}

for (const code of Object.keys(ROUTES)) {
    const outPath = path.join(ROOT, ROUTES[code].out);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    const html = buildPage(code);
    fs.writeFileSync(outPath, html, 'utf8');
    console.log(`Generated ${ROUTES[code].out} (${html.length} bytes, lang=${code})`);
}
