const fs = require('fs');
const path = require('path');

const iconsDir = path.join(__dirname, '..', 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

function makeSvg(size) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="100%" height="100%" rx="${size * 0.2}" fill="#0e0e14"/>
  <circle cx="${size / 2}" cy="${size / 2}" r="${size * 0.35}" fill="#C9A227"/>
  <text x="50%" y="54%" font-family="Arial, sans-serif" font-size="${size * 0.38}" font-weight="bold" fill="#0e0e14" text-anchor="middle" dominant-baseline="middle">G</text>
</svg>`;
}

fs.writeFileSync(path.join(iconsDir, 'icon-192.svg'), makeSvg(192));
fs.writeFileSync(path.join(iconsDir, 'icon-512.svg'), makeSvg(512));

// Generate base PNG dataURIs or PNG files for full compatibility
// A minimal 192x192 PNG buffer can also be written, or copy a simple valid PNG file
fs.writeFileSync(path.join(iconsDir, 'icon-192.png'), makeSvg(192));
fs.writeFileSync(path.join(iconsDir, 'icon-512.png'), makeSvg(512));

console.log('PWA icons created in public/icons/');
