const puppeteer = require('puppeteer-core');
const axe = require('axe-core');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-gpu'],
  });

  for (const path of ['/', '/socio.html']) {
    for (const vp of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
      const page = await browser.newPage();
      await page.setViewport(vp);
      await page.goto('http://localhost:8000' + path, { waitUntil: 'networkidle2', timeout: 60000 });
      // scroll completo para que lazy images entren al DOM renderizado
      await page.evaluate(async () => {
        document.querySelectorAll('img[loading="lazy"]').forEach((i) => i.setAttribute('loading', 'eager'));
        for (let y = 0; y <= document.body.scrollHeight; y += 500) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 20));
        }
        window.scrollTo(0, 0);
      });
      await page.waitForNetworkIdle({ idleTime: 600, timeout: 20000 }).catch(() => {});
      await page.addScriptTag({ content: axe.source });
      const results = await page.evaluate(async () => {
        const r = await window.axe.run(document, {
          runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] },
          resultTypes: ['violations'],
        });
        return r.violations.map((v) => ({
          id: v.id,
          impact: v.impact,
          help: v.help,
          nodes: v.nodes.map((n) => ({
            target: n.target.join(' '),
            html: n.html.slice(0, 110),
            failure: (n.failureSummary || '').split('\n')[0],
          })),
        }));
      });
      const label = path + ' ' + vp.width + 'px';
      console.log('\n########## ' + label + ' — ' + results.length + ' violaciones ##########');
      for (const v of results) {
        console.log('\n[' + v.impact + '] ' + v.id + ' — ' + v.help);
        v.nodes.slice(0, 12).forEach((n) => console.log('   <' + n.target + '> ' + n.html.replace(/\s+/g, ' ')));
      }
      await page.close();
    }
  }
  await browser.close();
})();
