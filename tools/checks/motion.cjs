const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  await page.goto('http://localhost:4173/#reset'); await page.waitForTimeout(900);
  await page.click('.lantern'); await page.waitForTimeout(2600);
  await page.fill('textarea', 'Bill'); await page.keyboard.press('Enter'); await page.waitForTimeout(600);
  await page.locator('.dialogue').click(); await page.waitForTimeout(400);
  const info = await page.evaluate(() => ({
    running: document.getAnimations().filter((a) => a.playState === 'running').length,
    names: [...new Set(document.getAnimations().map((a) => a.animationName).filter(Boolean))].sort().join(', '),
    stars: document.querySelectorAll('.stars i').length, fireflies: document.querySelectorAll('.fireflies i').length,
    sparks: document.querySelectorAll('.sparks i').length, flames: document.querySelectorAll('.flame').length,
    light: getComputedStyle(document.querySelector('.app')).getPropertyValue('--lrx'),
  }));
  console.log(JSON.stringify(info));
  const shots = [];
  for (let i = 0; i < 4; i++) { shots.push(await page.screenshot({ clip: { x: 40, y: 380, width: 320, height: 300 } })); await page.waitForTimeout(260); }
  const differ = shots.slice(1).map((s, i) => !s.equals(shots[i]));
  console.log('consecutive frames differ:', differ.join(', '));
  await page.screenshot({ path: process.argv[2] + '/camp-final.png' });
  await browser.close();
})();
