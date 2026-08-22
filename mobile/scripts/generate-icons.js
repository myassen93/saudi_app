// One-off script: rasterizes the saudi_app_react logo.svg into the PNG assets
// Expo needs for the app icon / adaptive icon / splash / favicon.
// Run with: node scripts/generate-icons.js
const path = require('path');
const sharp = require('sharp');

// Same SVG as saudi_app_react/src/assets/logo.svg, padded so the badge isn't
// cropped by Android's adaptive-icon mask, and inlined (no external file dep).
const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="لوحة تحكم السعودية">
  <rect x="2" y="2" width="60" height="60" rx="16" fill="#006C35"/>
  <rect x="2" y="2" width="60" height="60" rx="16" fill="none" stroke="#ffffff" stroke-opacity="0.12" stroke-width="1.5"/>
  <g fill="#ffffff">
    <rect x="15" y="34" width="8" height="16" rx="2"/>
    <rect x="28" y="24" width="8" height="26" rx="2"/>
    <rect x="41" y="16" width="8" height="34" rx="2"/>
  </g>
  <circle cx="45" cy="14" r="4" fill="#f2c94c"/>
</svg>
`;

// Adaptive icon foreground needs generous transparent padding (mask crops ~33%).
const svgPadded = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <g transform="translate(10 10) scale(0.6875)">
    ${svg.replace(/<\?xml.*?\?>/, '').replace(/<svg[^>]*>/, '').replace('</svg>', '')}
  </g>
</svg>
`;

const assets = path.join(__dirname, '..', 'assets');

async function run() {
  await sharp(Buffer.from(svg)).resize(1024, 1024).png().toFile(path.join(assets, 'icon.png'));
  await sharp(Buffer.from(svgPadded)).resize(1024, 1024).png().toFile(path.join(assets, 'adaptive-icon.png'));
  await sharp(Buffer.from(svg)).resize(512, 512).png().toFile(path.join(assets, 'splash-icon.png'));
  await sharp(Buffer.from(svg)).resize(48, 48).png().toFile(path.join(assets, 'favicon.png'));
  console.log('Generated icon.png, adaptive-icon.png, splash-icon.png, favicon.png');
}

run().catch((e) => { console.error(e); process.exit(1); });
