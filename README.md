# 📦 SSCCAPI.com (SSCC Pro Vision) — GS1-128 & 2D QR Barcode Generator, ZPL Pallet Label Studio & REST API

**Enterprise-grade SSCC-18 validator, standalone GS1-128 & 2D QR Digital Link barcode generator (`SVG`, `300 DPI PNG`, `Zebra ZPL-II`), A5/4×6" pallet label studio, EDIFACT/SAP IDoc extractor, and Cloudflare Edge REST API.**

🔗 **[Launch Web Studio (ssccapi.com) →](https://ssccapi.com/)** *(Mirror: [pormenores.net/sscc](https://pormenores.net/sscc/))*
🔗 **[Interactive Swagger API Sandbox →](https://ssccapi.com/sscc-api-guide.html)**
🔗 **[Universal GS1 Check Digit Calculator →](https://ssccapi.com/calculator.html)**
🔗 **[Technical Guide (GS1-128, Sunrise 2027, SAP IDoc, EDIFACT) →](https://ssccapi.com/guide.html)**

![Version](https://img.shields.io/badge/version-5.9.0-amber)
![GS1 Sunrise 2027](https://img.shields.io/badge/GS1_Sunrise_2027-1D_GS1--128_%2B_2D_QR-10b981)
![Zebra ZPL-II](https://img.shields.io/badge/Zebra_Thermal-ZPL--II_%2F_SVG_%2F_300_DPI_PNG-38bdf8)
![License](https://img.shields.io/badge/license-MIT-green)
![PWA](https://img.shields.io/badge/PWA-offline_ready-purple)
[![Public APIs PR #9237](https://img.shields.io/badge/Public_APIs-PR_#9237-blue?logo=github)](https://github.com/public-apis/public-apis/pull/9237)
[![Buy me a coffee](https://img.shields.io/badge/☕_Buy_me_a_coffee-amber?style=flat-square)](https://donate.stripe.com/14AfZh8sC6bagMa0dte3e00)

---

## ✨ Key Capabilities

| Capability | Details |
|---|---|
| 🏷️ **Full Pallet Labels OR Barcode Only** | Generate complete **A5 / A6 / 4×6" GS1 Logistics Pallet Labels** (`layout: "full"`) or **Standalone SSCC Barcode Strips** (`layout: "barcode-only"`) for custom ERP/InDesign/Bartender templates |
| 📲 **GS1 Sunrise 2027 Dual-Symbology** | Choose **`gs1-128`** (Classic 1D Linear Barcode), **`qr`** (2D GS1 Digital Link QR Code), or **`both` / `dual`** (1D + 2D QR together or separated) |
| 🖼️ **4 Industrial Output Formats** | Export as **Print / Vector PDF**, **Zebra ZPL-II (`.zpl`)** (`^BCN` + `^BQN`), **Pure Vector (`.svg`)**, or **High-Resolution 300 DPI (`.png`)** |
| 📦 **Multi-AI Trade Item Barcodes** | Optional secondary GS1-128 barcode & Digital Link enrichment for **Content GTIN (`AI 02`)**, **Best Before (`AI 15`)**, **Count (`AI 37`)**, and **Batch/Lot (`AI 10`)** |
| ✅ **Instant SSCC-18 Validation & Auto-Fix** | Real-time Modulo 10 validation, **Duplicate SSCC detection (`DUP ×N`)**, and **1-click invalid check digit auto-fixer (`🔧 Fix → X`)** |
| 📂 **EDIFACT & SAP IDoc Extraction** | Drag-and-drop any **UN/EDIFACT** (`GIN+BJ`, `RFF+SI`), **SAP IDoc** (`E1EDL44` / `EXIDV`), **XML**, or **CSV** file — 100% client-side |
| 📷 **Continuous Batch Camera & Laser Wedge** | Scan pallet after pallet continuously via smartphone camera (ZXing) or USB/Bluetooth HID hardware laser scanners |
| 🔌 **Dual Cloudflare Edge REST APIs** | **Server 1 (`sscc.birth1mark.workers.dev`)** for free validation/extraction + **Server 2 (`sscc-labels.birth1mark.workers.dev`)** for high-volume ZPL, SVG & 2D QR generation |

---

## 🔌 Cloud REST APIs & Interactive Swagger Sandbox

Explore and test all endpoints live in the **[Interactive OpenAPI 3.1 Swagger Sandbox](https://pormenores.net/sscc/sscc-api-guide.html)**.

### Server 1: Free Validation & EDI Extraction API (`https://sscc.birth1mark.workers.dev`)
*100% free · No API key required · 500 req/hr*

| Endpoint | Description |
|---|---|
| `GET /validate?sscc=356012345600000016` | Validate an 18-digit (or 20-digit AI `00`) SSCC & identify GS1 country prefix |
| `GET /generate?body=35601234560000001` | Calculate the 18th GS1 Modulo 10 check digit for a 17-digit payload |
| `GET /range?from=35601234560000001&to=35601234560000050` | Expand a sequential range of SSCCs (up to 500 units) |
| `GET /prefix?sscc=356012345600000016` | Lookup GS1 Member Organization country & flag |
| `POST /extract` | Extract and validate all SSCCs from raw EDIFACT, SAP IDoc, XML, or CSV payloads |

### Server 2: GS1 Pallet Labels, ZPL-II & Standalone Barcode API (`https://sscc-labels.birth1mark.workers.dev`)
*Includes **25 free labels** per GS1 Company Prefix (`GCP`) · Pro `X-API-Key` unlocks high-volume ERP production*

| Endpoint | Description |
|---|---|
| `GET /v1/barcode?sscc=356012345600000016&type=both` | **Standalone Barcode Generator**: `type=gs1-128` (1D only), `type=qr` (2D QR only), or `type=both` (1D + 2D QR). Supports `format=svg` (`image/svg+xml`), `format=zpl` (`text/plain`), or `format=json` (returns separate `svg1d`, `svgQr`, `zpl1d`, `zplQr`) |
| `POST /v1/labels` | **Single or Batch Pallet Labels (1–500 units)**: Supports `layout: "full" \| "barcode-only"`, `symbology: "dual" \| "gs1-128" \| "qr"`, and `format: "json" \| "zpl" \| "html" \| "svg"` |
| `GET /v1/quota?gcp=5601234` | Check remaining free allowance or active `X-API-Key` credit balance |
| `GET /v1/claim?email=your@email.com` | Self-service recovery of your Pro `X-API-Key` using your purchase email |

#### Example 1: Generate Standalone 1D Barcode, 2D QR Code, or Both (`GET /v1/barcode`)
```bash
# 1) Only 1D GS1-128 Linear Barcode (Vector SVG)
curl "https://sscc-labels.birth1mark.workers.dev/v1/barcode?sscc=356012345600000016&type=gs1-128"

# 2) Only 2D QR Code GS1 Digital Link (Vector SVG)
curl "https://sscc-labels.birth1mark.workers.dev/v1/barcode?sscc=356012345600000016&type=qr&batch=LOT-26A"

# 3) BOTH (1D GS1-128 + 2D QR Code) as separate SVG & ZPL properties in JSON
curl "https://sscc-labels.birth1mark.workers.dev/v1/barcode?sscc=356012345600000016&type=both&format=json"
```

#### Example 2: Pipe Batch GS1 Pallet Labels Directly to a Zebra Thermal Printer (`TCP Port 9100`)
```bash
curl -s -X POST "https://sscc-labels.birth1mark.workers.dev/v1/labels" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: sscc_pro_YOUR_KEY" \
  -d '{"gcp":"5601234","startSerial":1001,"quantity":33,"symbology":"dual","layout":"full","format":"zpl"}' \
  | nc -w 2 192.168.1.200 9100
```

### 💳 Pro Credit Packs & Unlimited API Access
| Plan | Credits / Quota | Price | Activation Link |
|---|---|---|---|
| **Free Evaluation** | **25 Pallet Labels** | **0 €** | Active automatically (no key required) |
| **Emergency Pack** | **250 Label Credits** *(never expire)* | **5 €** *(one-time)* | **[Buy 250 Credits →](https://buy.stripe.com/cNieVd4cm1UU7bAgcre3e01)** |
| **Business Pack** | **1,000 Label Credits** *(never expire)* | **15 €** *(one-time)* | **[Buy 1,000 Credits →](https://buy.stripe.com/bJe9AT9wGarq67wf8ne3e02)** |
| **⭐ Pro Unlimited** | **100,000 Labels / Year** *(Full ERP API)* | **29 € / year** | **[Unlock Pro Unlimited →](https://buy.stripe.com/28EeVdeR0eHG53s3pFe3e03)** |

> 💬 **Need Custom Features, Retailer Label Templates (Sonae, Jerónimo Martins, Mercadona, Amazon) or SAP / Odoo / WMS Integration?**
> Use the **"Request Custom Features / Contact"** button on [pormenores.net/sscc/](https://pormenores.net/sscc/) or [pormenores.net](https://pormenores.net/) to request bespoke engineering.

---

## 📖 Technical Guide

Complete guide to SSCC validation — structure, check digit algorithm, JavaScript implementation and EDIFACT parsing:

🔗 **[birth1mark.github.io/sscc-check/guide.html](https://pormenores.net/sscc/guide.html)**

---

## 🗂 Project Structure

```
sscc-check/
├── index.html            # App shell — HTML + CSS, zero inline JS
├── app.js                # SSCC logic: validation, generation, range expansion, UX
├── scanner.js            # Camera: ZXing engine, device selection, debounce, beep
├── parser.js             # File parser: EDIFACT, IDoc SAP, XML, CSV, generic
├── init.js               # Initialization & SW registration
├── manifest.json         # PWA manifest
├── service-worker.js     # Offline cache
├── guide.html            # Technical article: SSCC structure, algorithm, EDIFACT
├── sscc-api-guide.html   # API documentation with live playground
├── og-image.png          # Social share preview (1200×630)
├── icon-192.png          # PWA icon
├── icon-512.png          # PWA splash icon
├── robots.txt            # Crawler directives
└── sitemap.xml           # Sitemap for Google/Bing (app + guide + API docs)
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

---

## 📂 File Upload

Drop or browse any file to extract all SSCCs automatically:

| Format | Detection | Key segments/fields |
|---|---|---|
| **EDIFACT** | `UNA`/`UNB` header | `GIN+BJ`, `RFF+SI`, `RFF+AAK`, `PAC` |
| **IDoc SAP** | `<IDOC>`, `<EDI_DC>` tags | `EXIDV`, `EXIDV2`, `VHILM_KU` |
| **XML** | `<?xml` header | Known logistics tags + regex fallback |
| **CSV / TXT** | Generic fallback | Regex scan for 17/18/20-digit patterns |

Everything runs **100% client-side** — no file is ever uploaded to a server.

---

## 🛠 Tech Stack

- **GS1-128 Vector Engine** — Native client-side SVG Code 128 Subset C with FNC1 start pattern + Zebra ZPL-II generator
- **Vanilla JS** — no frameworks, no build step
- **[ZXing](https://github.com/zxing-js/library)** — Code 128 / GS1-128 barcode scanning
- **[Lucide Icons](https://lucide.dev)** — lightweight SVG icon set
- **Web Audio API** — scan beep, no external audio files
- **PWA** — manifest + service worker for offline support and home screen install
- **Cloudflare Workers** — REST API runtime
- **GS1 General Specifications 2025** — check digit algorithm and prefix table

---

## 📝 Changelog

| Version | Highlights |
|---|---|
| **v5.8.0** | Duplicate SSCC detection across batches & EDI files, 1-click invalid check digit auto-fixer, continuous batch camera scanner, secondary GS1-128 barcode for GTIN/Batch/Expiry (AI 02/10/15/37), unified suite header & `llms.txt` for AI agents |
| **v5.7.0** | Unified 2-tab workspace (Validate & Extract vs. Pallet Labels & ZPL Studio), real-time zero-click validation, interactive sample presets, GS1 anatomy legend & EDI file extraction feedback banner |
| **v5.6.0** | Batch GS1 Pallet Label printing & multi-label ZPL export (A5, A6, 4x6" thermal), Universal GS1 Check Digit Calculator, Offline Session History, Laser Scanner Wedge listener & Serverless URL sharing |
| **v5.5.5** | UI refinement, professional copy feedback, and GS1 label generator baseline |
| **v5.5.3** | Free REST API on Cloudflare Workers — validate, generate, range, extract |
| **v5.5.2** | GS1 2025 prefix table, fixed-width ERP file support, binary file rejection |
| **v5.5** | File upload — EDIFACT, IDoc, XML, CSV, TXT with smart format detection |
| **v5.4** | Copy per row, CSV export, beep on scan, Lucide icons |
| **v5.3** | Range expansion — generate all SSCCs between two codes |
| **v5.2** | JS split into `app.js` / `scanner.js` / `parser.js`, PWA support |
| **v5.1** | Fix GS1-128 AI `(00)` prefix extraction, debounce |
| **v5.0** | Replaced QuaggaJS with ZXing for reliable scanning |
| **v2.0** | `BigInt` arithmetic for 18-digit precision |

---

## ☕ Support

If SSCC Pro Vision saves you time or helps your logistics workflow, consider [buying me a coffee](https://donate.stripe.com/14AfZh8sC6bagMa0dte3e00). Contributions help maintain the project open-source, fast and ad-free!

---

## 📄 License (Open-Core)

- **Core Validator, Check Digit Calculator & EDI Extractor**: Open-source under the **MIT License**.
- **GS1 Pallet Label, ZPL-II & 2D QR Digital Link Cloud Engine (`sscc-labels.birth1mark.workers.dev` & Hosted Studio at `pormenores.net/sscc/`)**: Commercial service (includes 25 free evaluation labels; Pro credit packs and unlimited annual API keys available at [pormenores.net/sscc/sscc-api-guide.html](https://pormenores.net/sscc/sscc-api-guide.html)).
