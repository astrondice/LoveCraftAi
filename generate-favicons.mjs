import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const publicDir = path.resolve('public');
const logoPath = path.join(publicDir, 'branding', 'logo.png');

async function generateFavicons() {
  try {
    const img = sharp(logoPath);
    
    // Generate standard favicons
    await img.clone().resize(16, 16).toFile(path.join(publicDir, 'favicon-16x16.png'));
    await img.clone().resize(32, 32).toFile(path.join(publicDir, 'favicon-32x32.png'));
    
    // Generate Apple Touch Icon
    await img.clone().resize(180, 180).toFile(path.join(publicDir, 'apple-touch-icon.png'));
    
    // Generate Android/Chrome icons
    await img.clone().resize(192, 192).toFile(path.join(publicDir, 'android-chrome-192x192.png'));
    await img.clone().resize(512, 512).toFile(path.join(publicDir, 'android-chrome-512x512.png'));
    
    // For favicon.ico, we can just use the 32x32 png, browsers support it if we rename it, 
    // or we just use the png as the main favicon in HTML. Let's just create a 32x32 and rename it.
    await img.clone().resize(32, 32).toFile(path.join(publicDir, 'favicon.ico'));

    console.log('Favicons generated successfully.');

    // Generate site.webmanifest
    const manifest = {
      name: "LoveCraft AI",
      short_name: "LoveCraft",
      icons: [
        {
          src: "/android-chrome-192x192.png",
          sizes: "192x192",
          type: "image/png"
        },
        {
          src: "/android-chrome-512x512.png",
          sizes: "512x512",
          type: "image/png"
        }
      ],
      theme_color: "#0a0a0a",
      background_color: "#0a0a0a",
      display: "standalone"
    };
    
    fs.writeFileSync(path.join(publicDir, 'site.webmanifest'), JSON.stringify(manifest, null, 2));
    console.log('webmanifest generated.');
    
  } catch (error) {
    console.error('Error generating favicons:', error);
  }
}

generateFavicons();
