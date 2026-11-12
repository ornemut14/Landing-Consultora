const sharp = require('sharp');
const tesseract = require('tesseract.js');

(async () => {
  const jobs = ['assets/empresa1.webp', 'assets/empresa2.webp', 'assets/empresa3.png', 'assets/empresa4.webp', 'assets/bipsa.webp', 'assets/socio-estrategico.webp'];
  for (const f of jobs) {
    const tmp = 'C:/Users/ornel/AppData/Local/Temp/opencode/ocr-' + f.split('/').pop().replace('.webp', '.png').replace('.png.png', '.png');
    try {
      // upscale x4, gris, sharpen para mejorar deteccion de texto en logos
      await sharp(f, { pages: 1 })
        .resize({ width: Math.min(3000, (await sharp(f, { pages: 1 }).metadata()).width * 4) })
        .greyscale()
        .normalize()
        .png()
        .toFile(tmp);
      const { data } = await tesseract.recognize(tmp, 'spa+eng', { logger: () => {} });
      const text = (data.text || '').replace(/\s+/g, ' ').trim().slice(0, 100);
      console.log(f.padEnd(30), '->', JSON.stringify(text));
    } catch (e) {
      console.log(f.padEnd(30), '-> ERROR:', String(e.message || e).slice(0, 50));
    }
  }
})();
