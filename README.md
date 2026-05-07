# 📦 SSCC Pro Vision

**Free, open-source SSCC validator and check digit calculator — runs entirely in the browser, installs as a PWA on Android and iOS.**

🔗 **[Try it live →](https://birth1mark.github.io/sscc-check/)**

![Version](https://img.shields.io/badge/version-5.5.3-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![PWA](https://img.shields.io/badge/PWA-ready-purple)
![No dependencies](https://img.shields.io/badge/dependencies-none-brightgreen)

---

## 📸 What it does

| Feature | |
|---|---|
| 📷 Scan GS1-128 barcodes via camera | Automatic rear camera selection, vibration + beep on read |
| ✅ Validate 18-digit SSCCs | Each part colour-coded: AI, extension, body, check digit |
| 🔢 Generate check digits | Paste a 17-digit body, get the full SSCC |
| 🔁 Expand ranges | `SSCC-A - SSCC-B` generates every code in between (max 500) |
| 📂 File upload | Drop any EDIFACT, IDoc SAP, XML, CSV or TXT — SSCCs extracted automatically |
| 🌍 Country detection | Flag emoji from GS1 company prefix |
| ⎘ Copy & Export | Copy single SSCCs or export all results as CSV |
| 📱 Install as app | PWA — no Play Store needed, works on Android and iOS |
| 🔒 100% client-side | No data ever leaves your device |

---

## 🚀 Quick Start

No installation needed. Open the link and use it:

```
https://birth1mark.github.io/sscc-check/
```

**Install on Android**: open in Chrome → tap ⋮ → *Add to Home screen*

**Install on iOS**: open in Safari → tap Share ⎋ → *Add to Home Screen*

---

## 📖 Technical Guide

New to SSCC validation? Read the complete guide:

🔗 **[How to Validate SSCC Codes — Format, Algorithm & Tools](https://birth1mark.github.io/sscc-check/guide.html)**

Covers the SSCC structure, check digit algorithm with a worked example, JavaScript implementation, and how to extract SSCCs from EDIFACT files.

---

## 🗂 Project Structure

```
sscc-check/
├── index.html          # App shell — HTML + CSS, zero inline JS
├── app.js              # SSCC logic: validation, generation, range expansion, UX
├── scanner.js          # Camera: ZXing engine, device selection, debounce, beep
├── parser.js           # File parser: EDIFACT, IDoc SAP, XML, CSV, generic
├── manifest.json       # PWA manifest
├── service-worker.js   # Offline cache
├── og-image.png        # Social share preview (1200×630)
├── icon-192.png        # PWA icon
├── icon-512.png        # PWA splash icon
├── guide.html          # Technical article: How to validate SSCC codes
├── robots.txt          # Crawler directives
└── sitemap.xml         # Sitemap for Google/Bing (app + guide)
```

---

## 📐 Supported Input Formats

| Input | Action |
|---|---|
| `35601234560000001` | 17 digits — generate check digit |
| `356012345600000016` | 18 digits — validate |
| `(00)356012345600000016` | With AI prefix — validate |
| `356012345600000016-356012345600000050` | Range — generate all SSCCs |
| EDIFACT / IDoc / XML / CSV / TXT file | Upload — extract and validate all SSCCs |

Multiple codes accepted — **one per line**.

---

## 📂 File Upload

Drop or browse any file to extract all SSCCs automatically:

| Format | Detection | Key segments/fields |
|---|---|---|
| **EDIFACT** | `UNA`/`UNB` header | `GIN+BJ`, `RFF+SI`, `RFF+AAK`, `PAC` |
| **IDoc SAP** | `<IDOC>`, `<EDI_DC>` tags | `EXIDV`, `EXIDV2`, `VHILM_KU` |
| **XML** | `<?xml` header | Known logistics tags + regex fallback |
| **CSV / TXT / JSON** | Generic fallback | Regex scan for 17/18/20-digit patterns |

Everything runs **100% client-side** — no file is ever uploaded to a server.

---

## 📖 Documentation

Full documentation in the **[Wiki](../../wiki)**:

- SSCC structure explained
- Check digit algorithm with worked example
- Range expansion formats
- File upload — supported formats and EDIFACT segment reference
- Country detection (GS1 prefix table)
- PWA installation guide (Android + iOS)
- Full function reference for `app.js`, `scanner.js` and `parser.js`

---

## 🛠 Tech Stack

- **Vanilla JS** — no frameworks, no build step
- **[ZXing](https://github.com/zxing-js/library)** — Code 128 / GS1-128 barcode scanning
- **[Lucide Icons](https://lucide.dev)** — lightweight SVG icon set
- **Web Audio API** — scan beep, no external audio files
- **PWA** — manifest + service worker for offline support and home screen install
- **GS1 General Specifications** — check digit algorithm and prefix table

---

## 📝 Changelog

| Version | Highlights |
|---|---|
| **v5.5.3** | Technical guide, GS1 2025 prefix table, fixed-width file support, binary file rejection |
| **v5.5.2** | Smarter SSCC detection in files — GS1 prefix validation and trivial sequence rejection |
| **v5.5** | File upload — EDIFACT, IDoc, XML, CSV, TXT with smart format detection |
| **v5.4** | Copy per row, CSV export, beep on scan, Lucide icons |
| **v5.3** | Range expansion — generate all SSCCs between two codes |
| **v5.2** | JS split into `app.js` / `scanner.js` / `parser.js`, PWA support |
| **v5.1** | Fix GS1-128 AI `(00)` prefix extraction, debounce |
| **v5.0** | Replaced QuaggaJS with ZXing for reliable scanning |
| **v2.0** | `BigInt` arithmetic for 18-digit precision |

---

## 📄 License

MIT — free to use, modify and distribute.
