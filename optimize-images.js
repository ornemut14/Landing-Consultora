const sharp = require('sharp');

// Detecta la caja de contenido real (píxeles no-blancos) y la devuelve en
// coordenadas de resolución original, con un 2% de aire alrededor.
// Se usa para recortar imágenes cuyo lienzo tiene márgenes blancos enormes
// (caso socio-estrategico.jpg: el logo ocupa solo ~54% del ancho del archivo).
async function contentBBox(file, thr = 30) {
  const meta = await sharp(file).metadata();
  const { data, info } = await sharp(file)
    .resize({ width: 600, withoutEnlargement: true })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const ch = info.channels;
  const rowHas = new Array(info.height).fill(false);
  const colHas = new Array(info.width).fill(false);
  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      const i = (y * info.width + x) * ch;
      const isWhite = data[i] > 255 - thr && data[i + 1] > 255 - thr && data[i + 2] > 255 - thr;
      if (!isWhite) { rowHas[y] = true; colHas[x] = true; }
    }
  }
  const rows = rowHas.map((v, i) => (v ? i : -1)).filter((i) => i >= 0);
  const cols = colHas.map((v, i) => (v ? i : -1)).filter((i) => i >= 0);
  if (!rows.length || !cols.length) return null;
  const scale = meta.width / info.width;
  const padX = Math.round(meta.width * 0.02);
  const padY = Math.round(meta.height * 0.02);
  const left = Math.max(0, Math.round(cols[0] * scale) - padX);
  const top = Math.max(0, Math.round(rows[0] * scale) - padY);
  const width = Math.min(meta.width, Math.round((cols[cols.length - 1] + 1) * scale) + padX) - left;
  const height = Math.min(meta.height, Math.round((rows[rows.length - 1] + 1) * scale) + padY) - top;
  return { left, top, width, height };
}

// [archivo-entrada, archivo-salida, opciones]
const jobs = [
  // cropToContent: recorta los márgenes blancos del original antes de escalar
  ['assets/socio-estrategico.jpg', 'assets/socio-estrategico.webp', { width: 1150, quality: 82, cropToContent: true }],
  ['assets/equipo-consultora.jpg', 'assets/equipo-consultora.webp', { width: 1150, quality: 82 }],
  ['assets/mineria-servicio.jpg', 'assets/mineria-servicio.webp', { width: 760, quality: 80 }],
  ['assets/finanzas-servicio.jpg', 'assets/finanzas-servicio.webp', { width: 760, quality: 80 }],
  ['assets/legal-servicio.jpg', 'assets/legal-servicio.webp', { width: 760, quality: 80 }],
  ['assets/hero-mineria.jpg', 'assets/hero-mineria.webp', { width: 1023, quality: 78 }], // cubierto por overlay oscuro
  ['assets/hero-mineria.jpg', 'assets/hero-mineria-mobile.webp', { width: 768, quality: 75 }], // cubierto por overlay oscuro
  ['assets/mina1.jpg', 'assets/mina1.webp', { width: 440, quality: 78 }],
  ['assets/mina2.jpg', 'assets/mina2.webp', { width: 440, quality: 78 }],
  ['assets/mina3.jpg', 'assets/mina3.webp', { width: 440, quality: 78 }],
  ['assets/mina4.jpg', 'assets/mina4.webp', { width: 440, quality: 78 }],
  ['assets/mina5.jpg', 'assets/mina5.webp', { width: 440, quality: 78 }],
  ['assets/logo.png', 'assets/logo.webp', { width: 506, quality: 92 }],
  ['assets/empresa1.png', 'assets/empresa1.webp', { height: 160, quality: 80 }],
  ['assets/empresa2.png', 'assets/empresa2.webp', { width: 270, quality: 85 }],
  // empresa3.png se deja en PNG: el WebP sale MÁS grande que el original (9->15KB)
  ['assets/empresa4.gif', 'assets/empresa4.webp', { height: 160, quality: 80 }],
  ['assets/favicon.jpg', 'assets/favicon-96.jpg', { width: 96, height: 96, quality: 85 }],
  ['assets/montanas.jpg', 'assets/montanas.webp', { width: 640, quality: 80 }],
  ['assets/image.png', 'assets/image.webp', { width: 533, quality: 85 }],
  ['assets/bipsa.png', 'assets/bipsa.webp', { width: 247, quality: 85 }],
];

(async () => {
  const fs = require('fs');
  const report = [];
  for (const [input, output, opts] of jobs) {
    const inKB = fs.statSync(input).size / 1024;
    const meta = await sharp(input).metadata();
    const animated = meta.pages > 1;
    let pipeline = sharp(input, animated ? { animated: true } : {});
    if (opts.cropToContent) {
      const box = await contentBBox(input);
      if (box) pipeline = pipeline.extract(box);
    }
    const { width, height, quality } = opts;
    if (width || height) {
      pipeline = pipeline.resize({ width, height, withoutEnlargement: true, fit: 'inside' });
    }
    if (output.endsWith('.webp')) {
      pipeline = pipeline.webp({ quality, ...(animated ? { animated: true } : {}) });
    } else {
      pipeline = pipeline.jpeg({ quality });
    }
    const info = await pipeline.toFile(output);
    const outKB = fs.statSync(output).size / 1024;
    report.push({ input, inKB, output, outKB, w: info.width, h: info.height, animated, saved: Math.round((1 - outKB / inKB) * 100) });
  }
  let totalIn = 0, totalOut = 0;
  console.log('entrada'.padEnd(34) + 'salida'.padEnd(34) + 'antes->despues (KB)   dims          ahorro');
  for (const r of report) {
    totalIn += r.inKB; totalOut += r.outKB;
    console.log(
      r.input.replace('assets/', '').padEnd(34) +
      r.output.replace('assets/', '').padEnd(34) +
      (Math.round(r.inKB) + '->' + Math.round(r.outKB)).padEnd(18) +
      (r.w + 'x' + r.h + (r.animated ? ' (animado)' : '')).padEnd(14) +
      r.saved + '%'
    );
  }
  console.log('\nTOTAL: ' + Math.round(totalIn) + ' KB -> ' + Math.round(totalOut) + ' KB (' + Math.round((1 - totalOut / totalIn) * 100) + '% menos)');
})();
