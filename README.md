📦 SSCC Pro Vision
Free, open-source SSCC barcode scanner and validator — runs entirely in the browser, installs as a PWA on Android.
🔗 Try it live → https://birth1mark.github.io/sscc-check/


📸 What it does
Feature📷 Scan GS1-128 barcodes via cameraAutomatic rear camera selection, closes on read✅ Validate 18-digit SSCCsHighlights wrong check digit in red🔢 Generate check digitsPaste a 17-digit body, get the full SSCC🔁 Expand rangesSSCC-A - SSCC-B generates every code in between🌍 Country detectionFlag emoji from GS1 company prefix📱 Install as Android appNo Play Store needed — PWA🔒 100% client-sideNo data leaves your device

🚀 Quick Start
No installation needed. Open the link and use it:
https://birth1mark.github.io/sscc-check/
To install on Android: open in Chrome → tap ⋮ → Add to Home screen.

🗂 Project Structure
sscc-check/
├── index.html          # App shell — HTML + CSS, zero inline JS
├── app.js              # SSCC logic: validation, generation, range expansion
├── scanner.js          # Camera: ZXing engine, device selection, debounce
├── manifest.json       # PWA manifest
├── service-worker.js   # Offline cache
├── icon-192.png        # PWA icon
└── icon-512.png        # PWA splash icon

📐 Supported Input Formats
InputAction3400123450000000117 digits — generate check digit34001234500000001818 digits — validate(00)340012345000000018With AI prefix — validate34001234500000001-34001234500000050Range — generate all SSCCs
Multiple codes accepted — one per line.

📖 Documentation
Full documentation available in the Wiki, including:

SSCC structure explained
Check digit algorithm
Range expansion formats
Country detection (GS1 prefix table)
PWA installation guide
File structure and API reference


🛠 Tech Stack

Vanilla JS — no frameworks, no build step
ZXing — Code 128 / GS1-128 barcode scanning
PWA — manifest + service worker for offline support and home screen install
GS1 General Specifications — check digit algorithm and prefix table


📝 Changelog
VersionHighlightsv5.3Range expansion — generate all SSCCs between two codesv5.2JS split into app.js / scanner.js, PWA supportv5.1Fix GS1-128 AI (00) prefix extraction, debouncev5.0Replaced QuaggaJS with ZXing for reliable scanningv2.0BigInt arithmetic for 18-digit precision

📄 License
MIT — free to use, modify and distribute.
