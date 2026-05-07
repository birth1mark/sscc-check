# 📦 SSCC Pro Vision — Wiki

> Free, open-source SSCC validator, check digit calculator and REST API. Works in any modern browser, installs as a PWA on Android and iOS — no app store required.

🔗 **Live app**: [birth1mark.github.io/sscc-check](https://birth1mark.github.io/sscc-check/)
🔗 **Technical guide**: [birth1mark.github.io/sscc-check/sscc-api-guide.html](https://birth1mark.github.io/sscc-check/sscc-api-guide.html)
🔗 **API documentation**: [birth1mark.github.io/sscc-check/sscc-api-guide.html](https://birth1mark.github.io/sscc-check/sscc-api-guide.html)
🔗 **REST API**: [sscc.birth1mark.workers.dev](https://sscc.birth1mark.workers.dev)

---

## 📋 Table of Contents

- [What is an SSCC?](#-what-is-an-sscc)
- [Features](#-features)
- [How to Use](#-how-to-use)
- [Input Formats](#-input-formats)
- [Range Expansion](#-range-expansion)
- [File Upload](#-file-upload)
- [REST API](#-rest-api)
- [Check Digit Algorithm](#-check-digit-algorithm)
- [Country Detection](#-country-detection)
- [Install as App (PWA)](#-install-as-app-pwa)
- [Technical Guide](#-technical-guide)
- [File Structure](#-file-structure)
- [Changelog](#-changelog)

---

## 📦 What is an SSCC?

The **Serial Shipping Container Code (SSCC)** is an 18-digit GS1 identifier used in logistics to uniquely identify a physical shipping unit (pallet, box, roll cage, etc.).

```
(00) E XXXXXXXXXXXXXXXXX C
      │ │               │ └─ Check digit (1 digit)
      │ │               └─── Item reference (variable)
      │ └─────────────────── GS1 Company Prefix (7–10 digits)
      └───────────────────── Extension digit (1 digit)
```

SSCCs are encoded in **GS1-128** barcodes and transmitted in EDI messages such as **DESADV** and **IFTMIN**.

---

## ✨ Features

| Feature | Description |
|---|---|
| 📷 **Camera scanner** | Reads GS1-128 / Code 128 barcodes directly from the device camera |
| ✅ **Validation** | Validates 18-digit SSCCs — each part colour-coded: AI, extension, body, check digit |
| 🔢 **Check digit generation** | Calculates the check digit for a 17-digit SSCC body |
| 📋 **Batch processing** | Validate or generate multiple SSCCs at once (one per line) |
| 🔁 **Range expansion** | Generate all SSCCs between two codes, with check digits (max 500) |
| 📂 **File upload** | Extract and validate all SSCCs from EDIFACT, IDoc SAP, XML, CSV or TXT files |
| 🌍 **Country detection** | Detects the GS1 member country from the company prefix (GS1 2025 spec) |
| ⎘ **Copy & Export** | Copy individual SSCCs or export all results as CSV |
| 🔔 **Scan feedback** | Vibration + beep on successful camera scan |
| 🔌 **REST API** | Free public API — validate, generate, range, extract |
| 📱 **PWA** | Installable on Android and iOS, works offline |
| 🔒 **No backend** | Everything runs client-side — no data leaves your device |

---

## 🚀 How to Use

### 📷 Scan a barcode
1. Tap **START SCANNER** and point the camera at the GS1-128 barcode
2. The scanner closes automatically — device vibrates and beeps to confirm
3. The SSCC is validated and displayed immediately

### ✏️ Manual input
- Type or paste codes into the text area — one per line
- **17 digits**: check digit generated automatically
- **18 digits**: code validated, wrong check digit highlighted in red
- Press **AUDIT** to process

### 🔁 Range
- Enter `SSCC-A - SSCC-B` to generate all codes between two SSCCs
- Supports 17, 18 and 20-digit formats, with or without `(00)` prefix

### 📂 File upload
- Click the upload area or drag and drop any EDIFACT, IDoc, XML, CSV or TXT file
- All SSCCs extracted and validated automatically — format detected without configuration

### ⎘ Copy & Export
- **⎘** button on each row — copy a single SSCC
- **CSV** button in the summary bar — download all results

### 🔌 API
- Use the REST API for programmatic access from any system
- Full docs at [sscc-api-guide.html](https://birth1mark.github.io/sscc-check/sscc-api-guide.html)

---

## 📐 Input Formats

| Input | Length | Action |
|---|---|---|
| `35601234560000001` | 17 digits | Generate check digit |
| `356012345600000016` | 18 digits | Validate check digit |
| `00356012345600000016` | 20 digits (with `00` prefix) | Validate check digit |
| `(00)356012345600000016` | 18 digits + AI | Validate check digit |
| `356012345600000016-356012345600000050` | Range | Expand and generate all |
| Any file | EDIFACT / XML / CSV / TXT | Extract and validate all SSCCs |

---

## 🔁 Range Expansion

Enter two SSCCs separated by `-` to generate every code in between, each with its check digit.

**Supported formats on each side:**

| Format | Example |
|---|---|
| 17 digits (body only) | `35601234560000001-35601234560000050` |
| 18 digits (with check digit) | `356012345600000016-356012345600000050` |
| 20 digits (AI prefix) | `00356012345600000016-00356012345600000050` |
| With `(00)` notation | `(00)356012345600000016-(00)356012345600000050` |

> ⚠️ **Maximum range size: 500 codes.**

---

## 📂 File Upload

### Supported formats

| Format | Detection | Key segments / fields |
|---|---|---|
| **EDIFACT** | `UNA` / `UNB+` header | `GIN+BJ`, `RFF+SI`, `RFF+AAK`, `PAC`, `BGM` |
| **IDoc SAP** | `<IDOC>`, `<EDI_DC>` tags | `EXIDV`, `EXIDV2`, `VHILM_KU` |
| **Generic XML** | `<?xml` header | Known logistics tags + regex fallback |
| **CSV / TXT / JSON** | Generic fallback | Regex scan for 17/18/20-digit patterns |

### SSCC quality filters
1. **GS1 prefix validation** — prefix must match a known GS1 member range (GS1 General Specifications 2025)
2. **Trivial sequence rejection** — strings with 10+ identical consecutive digits are discarded

### Binary file rejection
Files with binary extensions (images, video, archives, PDFs, executables, etc.) are rejected before reading.

### Regex strategy
Permissive extraction — cast wide, validate rigorously:
1. `(00)SSCC` — explicit AI notation
2. `00` + 18 digits — handles scanners and fixed-width ERP files where SSCC is immediately followed by other digits
3. Standalone 18-digit — for files without AI prefix

### Privacy
Everything runs **100% client-side**. No file ever leaves the device.

---

## 🔌 REST API

A free public REST API is available at `https://sscc.birth1mark.workers.dev`.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/validate?sscc=<18 digits>` | Validate an SSCC |
| `GET` | `/generate?body=<17 digits>` | Generate check digit |
| `GET` | `/range?from=<SSCC>&to=<SSCC>` | Expand a range (max 500) |
| `GET` | `/prefix?sscc=<18 digits>` | GS1 country lookup |
| `POST` | `/extract` | Extract SSCCs from file content |
| `GET` | `/health` | API status |

**Properties:**
- No authentication required
- CORS open (`*`) — safe to call from any browser
- Rate limit: 500 requests/hour per IP (Cloudflare KV)
- Built on Cloudflare Workers — edge network, no cold starts
- No data stored or logged

Full documentation with live playground: **[sscc-api-guide.html](https://birth1mark.github.io/sscc-check/sscc-api-guide.html)**

API source code: **[github.com/birth1mark/sscc-api](https://github.com/birth1mark/sscc-api)**

---

## 🧮 Check Digit Algorithm

SSCC uses the standard **GS1 Modulo-10** check digit algorithm:

1. Take the 17-digit body
2. Starting from the **rightmost** digit, multiply alternating digits by **3** and **1**
3. Sum all products
4. Check digit = `(10 − (sum mod 10)) mod 10`

```javascript
function getCD(s17) {
    let sum = 0;
    const digits = s17.split('').reverse();
    for (let i = 0; i < digits.length; i++) {
        sum += parseInt(digits[i]) * (i % 2 === 0 ? 3 : 1);
    }
    return (10 - (sum % 10)) % 10;
}
```

---

## 🌍 Country Detection

The app detects the **GS1 member country** from the company prefix and displays the corresponding flag emoji 🇵🇹 🇩🇪 🇪🇸 next to each result.

```
SSCC:  3 560 123456 0000001 6
       │ └┬┘
       │  └─ GS1 prefix → 560 = 🇵🇹 Portugal
       └─ Extension digit
```

> ℹ️ The prefix identifies the **GS1 member organisation** that issued the company prefix — not the country of manufacture or shipment.

Prefix table based on **GS1 General Specifications 2025**.

---

## 📱 Install as App (PWA)

### Android (Chrome)
1. Open the app in **Chrome**
2. Tap **⋮** → *Add to Home screen* or *Install app*

### iOS (Safari)
1. Open the app in **Safari**
2. Tap **Share** ⎋ → *Add to Home Screen*

| Capability | Android | iOS |
|---|---|---|
| Fullscreen | ✅ | ✅ |
| Works offline | ✅ | ✅ |
| Camera access | ✅ | ✅ |
| Vibration on scan | ✅ | ❌ |
| Install banner | ✅ Automatic | ⚠️ Manual |

---

## 📖 Technical Guide

A standalone technical article covers:
- SSCC structure with annotated diagram
- Check digit algorithm with worked example
- Common validation mistakes
- Complete JavaScript implementation
- EDIFACT segment reference and parsing code

🔗 **[birth1mark.github.io/sscc-check/sscc-api-guide.html](https://birth1mark.github.io/sscc-check/sscc-api-guide.html)**

---

## 🗂 File Structure

```
sscc-check/
├── index.html            # App shell — HTML + CSS, zero inline JS
├── app.js                # SSCC logic: validation, generation, range, copy, export, UX
├── scanner.js            # Camera: ZXing, device selection, debounce, beep
├── parser.js             # File parser: EDIFACT, IDoc SAP, XML, CSV, generic fallback
├── manifest.json         # PWA manifest
├── service-worker.js     # Offline cache (cache-first strategy)
├── sscc-api-guide.html            # Technical article: SSCC structure, algorithm, EDIFACT
├── sscc-api-guide.html   # API documentation with live playground
├── og-image.png          # Social share preview (1200×630px)
├── icon-192.png          # PWA icon (home screen)
├── icon-512.png          # PWA icon (splash screen)
├── robots.txt            # Crawler directives
└── sitemap.xml           # Sitemap for Google / Bing
```

### `app.js` — key functions

| Function | Description |
|---|---|
| `getCD(s17)` | GS1 check digit for a 17-digit body |
| `getFlag(sscc18)` | Country flag emoji from GS1 prefix |
| `toBody(raw)` | Normalises any SSCC input to a 17-digit body |
| `formatSSCC(body, cd, provided)` | Colour-coded HTML for a result row |
| `parseRangeLine(line)` | Detects and parses a range expression |
| `expandRange(bodyA, bodyB)` | Expands a range into an array of bodies |
| `process()` | Processes all lines in the textarea |
| `render()` | Renders result rows into `#output` |
| `exportCSV()` | Downloads all results as CSV |
| `copyCode(plain, btn)` | Copies a single SSCC to clipboard |
| `updateLineCounter()` | Updates the line count badge on the textarea |

### `scanner.js` — key functions

| Function | Description |
|---|---|
| `extractSSCC(raw)` | Extracts 18-digit SSCC from ZXing raw output |
| `beep()` | Scan confirmation tone via Web Audio API |
| `startScanner()` | Initialises ZXing, selects rear camera |
| `stopScanner()` | Stops ZXing and hides the viewport |

### `parser.js` — key functions

| Function | Description |
|---|---|
| `detectFormat(text)` | Detects file format: `edifact`, `xml`, or `generic` |
| `isValidGS1Prefix(body18)` | Self-contained GS1 2025 prefix validation |
| `isTrivialSequence(digits)` | Rejects sequences with 10+ identical consecutive digits |
| `parseEDIFACT(text)` | Extracts SSCCs from EDIFACT segments with custom UNA support |
| `parseXML(text)` | Extracts SSCCs from known XML/IDoc tags |
| `extractGeneric(text, source, found)` | Regex pipeline — handles all text formats including fixed-width ERP files |
| `handleFile(file)` | Reads uploaded file, rejects binary extensions, triggers parsing |

---

## 📝 Changelog

### v5.5.3
- 🔌 **REST API**: free public API on Cloudflare Workers — `/validate`, `/generate`, `/range`, `/prefix`, `/extract`
- 📄 **API documentation**: `sscc-api-guide.html` with live playground (Try it tab on each endpoint)
- 🔒 **Rate limiting**: 500 requests/hour per IP via Cloudflare KV (optimised for free tier)

### v5.5.2
- 🌍 **GS1 2025 prefix table**: complete update — `isValidGS1Prefix` in `parser.js` is self-contained
- 🔧 **Fixed-width file support**: regex now correctly extracts SSCCs embedded in ERP files where SSCC is followed by other digits
- 🚫 **Binary file rejection**: images, video, archives, PDFs rejected before reading

### v5.5.1
- 🛡 **Drag guard**: dropping a file outside the upload zone no longer navigates the browser away

### v5.5
- 📂 **File upload**: EDIFACT, IDoc SAP, XML, CSV, TXT — format detected automatically, 100% client-side

### v5.4
- ⎘ **Copy per row** and ⬇ **CSV export**
- 🔔 **Beep on scan** via Web Audio API
- 🎨 **Lucide icons** throughout

### v5.3
- 🔁 **Range expansion**: max 500 codes, supports 17/18/20-digit formats

### v5.2
- 🗂 **Code split**: `app.js`, `scanner.js`, `parser.js`
- 📱 **PWA**: installable on Android and iOS

### v5.1
- 🐛 **GS1-128 AI fix**: correct SSCC extraction from barcodes with `(00)` prefix
- ⏱ **Debounce**: prevents duplicate reads

### v5.0
- 🔍 **ZXing engine**: replaced QuaggaJS

### v2.0
- 🔢 **BigInt arithmetic**: prevents overflow with 18-digit identifiers

---

*Built with ❤️ for logistics and EDI professionals.*
