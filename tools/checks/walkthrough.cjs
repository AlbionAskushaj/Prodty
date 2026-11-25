const { chromium } = require('playwright');
const out = process.argv[2];
async function run(tag, viewport, fakeClaude) {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport, deviceScaleFactor: 2 });
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(String(e)));
  if (fakeClaude) {
    await page.addInitScript(() => {
      let n = 0;
      const json = async (turns) => {
        window.__lastPrompt = turns[turns.length - 1].content; window.__turns = turns.length;
        n += 1;
        await new Promise((r) => setTimeout(r, 400));
        if (n === 1) return { speech: 'That sounds like a full plate. One thing I can hold for you: the menu. Shall I plant a tree for Work?', add: [{ title: 'Make menu for Toscana Italian Grill', tree: 'Work' }], ask_plant: ['Work'] };
        if (n === 2) return { speech: 'Three more, each on its branch.', add: [{ title: 'Email supplier about produce order', tree: 'Work' }, { title: 'Print table cards', tree: 'Work' }, { title: 'Finish stats problem set (due Fri)', tree: 'School' }], plant: ['School'] };
        return { speech: 'Done a different way is still done. Well played.', complete: ['t1'] };
      };
      const sample = Object.assign(async () => ({ text: '' }), { json });
      window.claude = { use: async (name) => (name === 'sample' ? sample : null) };
    });
  }
  const shot = (n) => page.screenshot({ path: `${out}/${tag}-${n}.png` });
  const say = async (t) => { await page.fill('textarea', t); await page.keyboard.press('Enter'); };
  const settle = async (ms = 900) => { await page.waitForTimeout(ms); await page.locator('.dialogue').click(); await page.waitForTimeout(350); };

  await page.goto('http://localhost:4173/#reset');
  await page.waitForTimeout(1300); await shot('1-asleep');
  await page.click('.lantern'); await settle(); await shot('2-woken');
  await say('Bill'); await settle();
  await say('RIght now i have to make a menu for toscana italian grill i have so much work to do');
  await settle(1100); await shot('3-proposal');
  await page.click('.choices .pill.solid'); await settle(1300); await shot('4-forest');
  if (fakeClaude) { await say('also email the supplier about the produce order, print table cards, and my stats pset is due friday'); await settle(1500); await shot('5-forest-more'); }
  await page.click('button.tree >> nth=0'); await page.waitForTimeout(700); await shot('6-tree');
  await page.click('.leaf-tag >> nth=0'); await page.waitForTimeout(350); await shot('7-sheet');
  await page.click('.sheet .pill.solid'); await page.waitForTimeout(800); await shot('8-bloom');
  const overflowX = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
  const font = await page.evaluate(() => getComputedStyle(document.querySelector('.dialogue p')).fontFamily + ' | loaded=' + document.fonts.check('500 20px "EB Garamond"'));
  console.log(tag, 'errors:', errors.length ? errors : 'none', '| sideways scroll:', overflowX, '| font:', font, fakeClaude ? '| turns sent: ' + (await page.evaluate(() => window.__turns)) : '');
  if (fakeClaude) console.log('last prompt tail:', (await page.evaluate(() => window.__lastPrompt)).slice(0, 260));
  await browser.close();
}
(async () => {
  await run('phone', { width: 390, height: 844 }, false);
  await run('desk', { width: 648, height: 740 }, true);
})();
