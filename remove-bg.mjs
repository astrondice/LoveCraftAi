import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function removeBackground() {
  const logoPath = path.resolve('public/branding/logo.png');
  const tempPath = path.resolve('public/branding/logo-temp.png');

  try {
    const { data, info } = await sharp(logoPath)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    // Make near-black pixels transparent
    // We also want to anti-alias the edges slightly, but a hard threshold is a start.
    // Actually, better: calculate luminance, if it's very dark, map alpha proportional to brightness
    for (let i = 0; i < data.length; i += info.channels) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
      
      // If it's very dark (e.g., < 25), start fading alpha
      if (luminance < 25) {
        // Map luminance 0-25 to alpha 0-255
        const alpha = Math.max(0, (luminance / 25) * 255);
        data[i + 3] = Math.min(data[i + 3], alpha);
      }
    }

    await sharp(data, {
      raw: {
        width: info.width,
        height: info.height,
        channels: info.channels,
      },
    })
      .png()
      .toFile(tempPath);

    fs.renameSync(tempPath, logoPath);
    console.log('Background removed successfully.');
  } catch (error) {
    console.error('Error:', error);
  }
}

removeBackground();
