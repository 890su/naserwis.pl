// Derive intermediate sizes from the approved artwork; never replace originals.
import sharp from 'sharp';
const folder = 'public/assets/redesign/';
for (const name of ['no-internet-pl', 'no-internet-ru', 'no-internet-uk', 'no-internet-en', 'rj45-installation']) {
  const base = folder + name + '-20261018-';
  await sharp(base + '1200.webp').resize(800).avif({ quality: 50 }).toFile(base + '800.avif');
  await sharp(base + '1200.webp').resize(800).webp({ quality: 82 }).toFile(base + '800.webp');
}
const frame = folder + 'no-internet-led-off-20261018-';
for (const width of [640, 800, 1200]) {
  await sharp(frame + '1200.webp').resize(width).avif({ quality: 50 }).toFile(frame + width + '.avif');
}
await sharp(frame + '1200.webp').resize(800).webp({ quality: 82 }).toFile(frame + '800.webp');
console.log('Homepage intermediate images and AVIF LED layer prepared.');
