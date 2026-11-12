const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox'],
  });
  const page = await browser.newPage();
  await page.goto('http://localhost:8000/socio.html', { waitUntil: 'networkidle0' });

  const data = await page.evaluate(() => {
    const h3 = document.querySelector('.content h3');
    const cs = getComputedStyle(h3);
    return {
      tag: h3.tagName,
      fontSize: cs.fontSize,
      fontWeight: cs.fontWeight,
      fontFamily: cs.fontFamily.slice(0, 60),
      marginTop: cs.marginTop,
      marginBottom: cs.marginBottom,
      color: cs.color,
    };
  });
  console.log('BEFORE (h3):', JSON.stringify(data, null, 2));

  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
