const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();

  // Desktop
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0', timeout: 30000 });
  await page.screenshot({ path: 'scripts/screenshot-desktop.png', fullPage: true });
  console.log('Desktop screenshot saved.');

  // Mobile 390
  await page.setViewport({ width: 390, height: 844 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0', timeout: 30000 });
  await page.screenshot({ path: 'scripts/screenshot-mobile.png', fullPage: true });
  console.log('Mobile 390 screenshot saved.');

  // Mobile 450 (match user device)
  await page.setViewport({ width: 450, height: 900 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0', timeout: 30000 });
  await page.screenshot({ path: 'scripts/screenshot-mobile-450.png', fullPage: true });
  console.log('Mobile 450 screenshot saved.');

  await browser.close();
  console.log('Done.');
})();
