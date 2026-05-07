/**
 * Regenerate Android notification icons from the source asset.
 *
 * Android notification icons must be monochrome (white + alpha).
 * This script resizes the source `assets/notification-icon.png`
 * into all required drawable density buckets.
 */

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const SOURCE = path.resolve(__dirname, '..', 'assets', 'notification-icon.png');
const RES_DIR = path.resolve(__dirname, '..', 'android', 'app', 'src', 'main', 'res');

// Android density → notification icon size (dp × scale)
const DENSITIES = {
  'drawable-mdpi': 24,
  'drawable-hdpi': 36,
  'drawable-xhdpi': 48,
  'drawable-xxhdpi': 72,
  'drawable-xxxhdpi': 96,
};

async function generate() {
  if (!fs.existsSync(SOURCE)) {
    console.error('Source icon not found:', SOURCE);
    process.exit(1);
  }

  console.log('Source:', SOURCE);

  for (const [folder, size] of Object.entries(DENSITIES)) {
    const outDir = path.join(RES_DIR, folder);
    const outFile = path.join(outDir, 'notification_icon.png');

    // Ensure directory exists
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }

    await sharp(SOURCE)
      .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(outFile);

    const stats = fs.statSync(outFile);
    console.log(`  ✓ ${folder}/notification_icon.png  (${size}×${size}, ${stats.size} bytes)`);
  }

  console.log('\nDone! Rebuild the Android app to see the new icon.');
}

generate().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
