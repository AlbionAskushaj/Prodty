const { chromium } = require('playwright');
const out = process.argv[2];
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(String(e)));
  const say = async (t) => { await page.fill('textarea', t); await page.keyboard.press('Enter'); };
  const settle = async (ms = 900) => { await page.waitForTimeout(ms); await page.locator('.dialogue').click(); await page.waitForTimeout(350); };

  // 1. Fresh start, plant a tree, finish a task by tapping its leaf: the ember should fly, then the count rise.
  await page.goto('http://localhost:4173/#reset'); await page.waitForTimeout(900);
  await page.click('.lantern'); await settle(2200);
  await say('Bill'); await settle();
  await say('call grandma, book dentist, water the plants'); await settle(1100);
  await page.click('.choices .pill.solid'); await settle(1500);
  await page.click('button.tree >> nth=0'); await page.waitForTimeout(700);
  await page.click('.leaf-tag >> nth=0'); await page.waitForTimeout(300);
  await page.click('.sheet .pill.solid'); await page.waitForTimeout(450);
  const mid = await page.evaluate(() => ({ flying: document.querySelectorAll('.flying-ember').length, count: document.querySelector('.ember-count').textContent.trim() }));
  await page.screenshot({ path: `${out}/1-ember-in-flight.png` });
  await page.waitForTimeout(1500);
  const after = await page.evaluate(() => ({ flying: document.querySelectorAll('.flying-ember').length, count: document.querySelector('.ember-count').textContent.trim() }));
  console.log('tap in tree view  | mid-flight:', JSON.stringify(mid), '| landed:', JSON.stringify(after));

  // 2. Back at camp, finish one by telling him: the ember flies from the tree to his lantern.
  await page.click('.tree-header .icon-button'); await settle();
  await say('done book dentist'); await page.waitForTimeout(820);
  const mid2 = await page.evaluate(() => ({ flying: document.querySelectorAll('.flying-ember').length, count: document.querySelector('.ember-count').textContent.trim() }));
  await page.screenshot({ path: `${out}/2-ember-at-camp.png` });
  await page.waitForTimeout(1700);
  const after2 = await page.evaluate(() => document.querySelector('.ember-count').textContent.trim());
  console.log('told him at camp  | mid-flight:', JSON.stringify(mid2), '| landed count:', after2);

  // 3. Poses: speaking while his text types, sipping on his own timer.
  await say('hello'); await page.waitForTimeout(700);
  const speaking = await page.evaluate(() => document.querySelector('.taper.sitting').className);
  console.log('while he speaks   |', speaking.match(/pose-\w+/)[0]);
  await settle(); await page.screenshot({ path: `${out}/3-resting.png` });

  // 4. Months later: many embers and many lit days. Travellers, constellations, a big light.
  await page.evaluate(() => {
    const s = JSON.parse(localStorage.getItem('prodty.state.v1')); s.embers = 900; localStorage.setItem('prodty.state.v1', JSON.stringify(s));
    const log = JSON.parse(localStorage.getItem('prodty.log.v1'));
    for (let d = 1; d <= 16; d++) log.unshift({ at: new Date(Date.now() - d * 86400000).toISOString(), type: 'task_done' });
    localStorage.setItem('prodty.log.v1', JSON.stringify(log));
  });
  await page.reload(); await settle(1800);
  const later = await page.evaluate(() => ({
    settlers: document.querySelectorAll('.settler').length, lines: document.querySelectorAll('.constellations line').length,
    brightStars: document.querySelectorAll('.constellations path').length, toCome: document.querySelectorAll('.constellations circle').length,
    smallStars: document.querySelectorAll('.stars i').length, beacon: document.querySelectorAll('.beacon').length,
  }));
  console.log('months later      |', JSON.stringify(later));
  await page.screenshot({ path: `${out}/4-months-later.png` });
  const sounds = await page.evaluate(() => performance.getEntriesByType('resource').filter((r) => r.name.includes('/audio/')).map((r) => r.name.split('/').pop()));
  console.log('sound files loaded:', sounds.join(', '));
  console.log('errors:', errors.length ? errors : 'none');
  await browser.close();
})();
