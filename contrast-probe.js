const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox'],
  });

  const lum = (r, g, b) => {
    const f = (c) => {
      c /= 255;
      return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const parse = (s) => {
    const m = s.match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)/);
    return m ? { r: +m[1], g: +m[2], b: +m[3], a: m[4] === undefined ? 1 : +m[4] } : null;
  };
  const ratio = (c1, c2) => {
    const l1 = lum(c1.r, c1.g, c1.b);
    const l2 = lum(c2.r, c2.g, c2.b);
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  };

  for (const path of ['/', '/socio.html']) {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto('http://localhost:8000' + path, { waitUntil: 'networkidle2' });
    await page.evaluate(async () => {
      for (let y = 0; y <= document.body.scrollHeight; y += 500) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 20));
      }
    });
    const rows = await page.evaluate(() => {
      const sels = [
        '.service-card h3',
        '#contactForm button',
        '.hero h1', '.hero p',
        '.nav-links a',
        'footer, footer *',
        'footer p', 'footer a', 'footer h3', 'footer h4',
        '.value-item h3', '.value-item p',
        '.card-cultura h3', '.card-cultura p',
        '.titulo-cultura',
        '.empresas h2', '.galeria-minera h2', '.socio h2', '.about h2', '.contact h2',
        '.about p', '.socio p', '.contact p',
        '.btn', '.btn-gold', '.btn-outline', '.btn-socio',
        '.carousel-btn',
        '.circle', '.card h3', '.card p', '.card-button',
        '.modal h2', '.modal p',
        '.menu-toggle',
      ];
      const out = [];
      for (const sel of sels) {
        document.querySelectorAll(sel).forEach((el, i) => {
          if (i > 1) return;
          const cs = getComputedStyle(el);
          out.push({ sel, fg: cs.color, bg: cs.backgroundColor, fs: cs.fontSize, fw: cs.fontWeight, text: (el.textContent || '').trim().slice(0, 30) });
        });
      }
      return out;
    });

    // resolver fondos con alpha componiendo contra blanco/negro iterando ancestros
    const resolve = await page.evaluate(() => {
      const sels = ['.service-card h3', '#contactForm button', '.circle.c1', '.card-button.btn-1', '.card-button.btn-2', '.card-button.btn-3', '.card:nth-child(1) > .content > h3', '.card:nth-child(1) > .content > p'];
      const res = [];
      for (const sel of sels) {
        const el = document.querySelector(sel);
        if (!el) continue;
        const chain = [];
        let n = el;
        while (n && n !== document.documentElement) {
          const cs = getComputedStyle(n);
          chain.push(cs.backgroundColor + ' | ' + cs.backgroundImage.slice(0, 40));
          n = n.parentElement;
        }
        res.push({ sel, chain });
      }
      return res;
    });

    console.log('\n===== ' + path + ' =====');
    console.log('-- estilos computados --');
    rows.forEach((r) => console.log((r.sel + ' (' + r.text + ')').padEnd(46), 'color:' + r.fg.padEnd(20), 'bg:' + String(r.bg).padEnd(20), r.fs, 'fw' + r.fw));
    console.log('\n-- cadena de fondos (para los que fallan) --');
    resolve.forEach((r) => {
      console.log(r.sel);
      r.chain.forEach((c, i) => console.log('   ancestor' + i + ':', c));
    });
    await page.close();
  }

  // calculos de contraste de los pares clave con colores hex del CSS
  console.log('\n===== CALCULOS DE CONTRASTE (pares clave) =====');
  const pairs = [
    ['service-card h3: #bfa14a sobre blanco', { r: 0xbf, g: 0xa1, b: 0x4a }, { r: 255, g: 255, b: 255 }],
    ['submit button: blanco sobre #caa85c', { r: 255, g: 255, b: 255 }, { r: 0xca, g: 0xa8, b: 0x5c }],
    ['navy #1e3558 sobre blanco', { r: 0x1e, g: 0x35, b: 0x58 }, { r: 255, g: 255, b: 255 }],
    ['navy #1e3558 sobre dorado #caa85c', { r: 0x1e, g: 0x35, b: 0x58 }, { r: 0xca, g: 0xa8, b: 0x5c }],
    ['blanco sobre navy #1e3558', { r: 255, g: 255, b: 255 }, { r: 0x1e, g: 0x35, b: 0x58 }],
    ['dorado oscuro #8a6d1f sobre blanco', { r: 0x8a, g: 0x6d, b: 0x1f }, { r: 255, g: 255, b: 255 }],
    ['dorado oscuro #7a6023 sobre blanco', { r: 0x7a, g: 0x60, b: 0x23 }, { r: 255, g: 255, b: 255 }],
    ['dorado oscuro #6e561f sobre blanco', { r: 0x6e, g: 0x56, b: 0x1f }, { r: 255, g: 255, b: 255 }],
    ['blanco sobre dorado oscuro #8a6d1f', { r: 255, g: 255, b: 255 }, { r: 0x8a, g: 0x6d, b: 0x1f }],
    ['dorado acento #caa85c sobre navy #1c2b4a', { r: 0xca, g: 0xa8, b: 0x5c }, { r: 0x1c, g: 0x2b, b: 0x4a }],
  ];
  for (const [label, fg, bg] of pairs) {
    console.log(label.padEnd(46), ratio(fg, bg).toFixed(2) + ':1');
  }

  await browser.close();
})();
