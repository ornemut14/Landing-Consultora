const sharp = require('sharp');
const tesseract = require('tesseract.js');

(async () => {
  for (const f of ['assets/empresa1.webp', 'assets/empresa2.webp', 'assets/empresa3.png', 'assets/empresa4.webp']) {
    const tmp = 'C:/Users/ornel/AppData/Local/Temp/opencode/bin-' + f.split('/').pop().replace('.webp', '') + '.png';
    for (const mode of ['normal', 'invert', 'sharp2']) {
      const out = 'C:/Users/ornel/AppData/Local/Temp/opencode/' + mode + '-' + f.split('/').pop().replace('.webp', '') + '.png';
      try {
        let p = sharp(f, { pages: 1 }).resize({ width: 1600 });
        const meta = await sharp(f, { pages: 1 }).metadata();
        const mean = await (await p.clone().greyscale().stats()).channels[0].mean;
        if (mode === 'invert') p = p.negate();
        if (mode === 'sharp2') p = p.sharpen({ sigma: 2 });
        await p.greyscale().normalize().threshold(Math.round(mean)).png().toFile(out);
        const { data } = await tesseract.recognize(out, 'spa+eng', { logger: () => {} });
        const text = (data.text || '').replace(/\s+/g, ' ').trim().slice(0, 80);
        if (text) console.log(f.replace('assets/', '').padEnd(20), mode.padEnd(8), '->', JSON.stringify(text));
      } catch (e) {
        console.log(f.replace('assets/', ''), mode, 'ERROR', String(e.message || e).slice(0, 40));
      }
    }
  }
})();
