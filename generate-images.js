const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const outputDir = path.join(__dirname, 'public');
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

// Brand colors
const colors = {
  primary: '#0D4A3C',      // Deep emerald
  secondary: '#10B981',    // Bright green
  accent: '#FBBF24',       // Gold
  light: '#D1FAE5',        // Light green
  white: '#FFFFFF',
};

// Icon SVG (200x200)
const iconSvg = `
<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0D4A3C"/>
      <stop offset="100%" style="stop-color:#065F46"/>
    </linearGradient>
  </defs>
  <rect width="200" height="200" rx="40" fill="url(#bg)"/>
  <text x="100" y="120" font-size="80" text-anchor="middle" fill="${colors.accent}">💸</text>
</svg>`;

// Icon Large SVG (1024x1024)
const iconLargeSvg = `
<svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0D4A3C"/>
      <stop offset="100%" style="stop-color:#065F46"/>
    </linearGradient>
  </defs>
  <rect width="1024" height="1024" rx="200" fill="url(#bg)"/>
  <text x="512" y="620" font-size="400" text-anchor="middle" fill="${colors.accent}">💸</text>
</svg>`;

// Splash SVG (200x200)
const splashSvg = `
<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
  <rect width="200" height="200" fill="${colors.primary}"/>
  <text x="100" y="110" font-size="60" text-anchor="middle" fill="${colors.accent}">💸</text>
  <text x="100" y="150" font-size="16" font-family="Arial, sans-serif" font-weight="bold" text-anchor="middle" fill="${colors.white}">CeloRemit</text>
</svg>`;

// OG Image SVG (1200x630)
const ogImageSvg = `
<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0D4A3C"/>
      <stop offset="100%" style="stop-color:#065F46"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  
  <!-- Logo -->
  <rect x="50" y="50" width="100" height="100" rx="20" fill="${colors.secondary}"/>
  <text x="100" y="115" font-size="50" text-anchor="middle">💸</text>
  
  <!-- Title -->
  <text x="180" y="100" font-size="48" font-family="Arial, sans-serif" font-weight="bold" fill="${colors.white}">CeloRemit</text>
  <text x="180" y="135" font-size="20" font-family="Arial, sans-serif" fill="${colors.light}">AI-Powered Remittances</text>
  
  <!-- Main Message -->
  <text x="600" y="280" font-size="42" font-family="Arial, sans-serif" font-weight="bold" text-anchor="middle" fill="${colors.white}">Send Money with Natural Language</text>
  <text x="600" y="340" font-size="24" font-family="Arial, sans-serif" text-anchor="middle" fill="${colors.light}">"Send $50 to my mom in Philippines"</text>
  
  <!-- Features -->
  <rect x="100" y="400" width="280" height="100" rx="15" fill="rgba(255,255,255,0.1)"/>
  <text x="240" y="445" font-size="28" text-anchor="middle">🤖</text>
  <text x="240" y="480" font-size="16" font-family="Arial, sans-serif" text-anchor="middle" fill="${colors.white}">AI Intent Parsing</text>
  
  <rect x="460" y="400" width="280" height="100" rx="15" fill="rgba(255,255,255,0.1)"/>
  <text x="600" y="445" font-size="28" text-anchor="middle">🌍</text>
  <text x="600" y="480" font-size="16" font-family="Arial, sans-serif" text-anchor="middle" fill="${colors.white}">15 Mento Stablecoins</text>
  
  <rect x="820" y="400" width="280" height="100" rx="15" fill="rgba(255,255,255,0.1)"/>
  <text x="960" y="445" font-size="28" text-anchor="middle">🔐</text>
  <text x="960" y="480" font-size="16" font-family="Arial, sans-serif" text-anchor="middle" fill="${colors.white}">Self Protocol Verified</text>
  
  <!-- Currencies -->
  <text x="600" y="570" font-size="32" text-anchor="middle">🇺🇸 🇪🇺 🇧🇷 🇰🇪 🇵🇭 🇨🇴 🌍</text>
  
  <!-- Celo Badge -->
  <rect x="1050" y="50" width="100" height="40" rx="20" fill="${colors.accent}"/>
  <text x="1100" y="78" font-size="14" font-family="Arial, sans-serif" font-weight="bold" text-anchor="middle" fill="${colors.primary}">Celo L2</text>
</svg>`;

async function generateImages() {
  console.log('Generating CeloRemit images...');
  
  // Icon 200x200
  await sharp(Buffer.from(iconSvg)).png().toFile(path.join(outputDir, 'icon.png'));
  console.log('✓ icon.png (200x200)');
  
  // Icon Large 1024x1024
  await sharp(Buffer.from(iconLargeSvg)).png().toFile(path.join(outputDir, 'icon-large.png'));
  console.log('✓ icon-large.png (1024x1024)');
  
  // Splash 200x200
  await sharp(Buffer.from(splashSvg)).png().toFile(path.join(outputDir, 'splash.png'));
  console.log('✓ splash.png (200x200)');
  
  // OG Image 1200x630
  await sharp(Buffer.from(ogImageSvg)).png().toFile(path.join(outputDir, 'og-image.png'));
  console.log('✓ og-image.png (1200x630)');
  
  // Favicon
  await sharp(Buffer.from(iconSvg)).resize(32, 32).png().toFile(path.join(outputDir, 'favicon.png'));
  console.log('✓ favicon.png (32x32)');
  
  console.log('\\nAll images generated in', outputDir);
}

generateImages().catch(console.error);
