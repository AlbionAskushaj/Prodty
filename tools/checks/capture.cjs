const { chromium } = require('playwright');
const out = process.argv[2];
async function run(tag, fake) {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  if (fake) await page.addInitScript(() => {
    const json = async (turns) => { window.__prompt = turns[0].content; await new Promise((r) => setTimeout(r, 300));
      return { speech: 'A full plate, that. The menu is on the Work tree, with everything you told me about it. Shall I plant it?', ask_plant: ['Work'],
        add: [{ title: 'Make menu for Toscana Italian Grill', tree: 'Work', due: 'Friday', note: 'New spring menu. Owner wants two pasta specials and prices under $24.\nNeeds printing on the cream card stock.\nFeeling behind on this one.' }] }; };
    window.claude = { use: async (n) => (n === 'sample' ? Object.assign(async () => ({ text: '' }), { json }) : null) };
  });
  const say = async (t) => { await page.fill('textarea', t); await page.keyboard.press('Enter'); };
  const settle = async (ms = 900) => { await page.waitForTimeout(ms); await page.locator('.dialogue').click(); await page.waitForTimeout(350); };
  await page.goto('http://localhost:4173/#reset'); await page.waitForTimeout(900);
  await page.click('.lantern'); await settle(2200);
  await say('Bill'); await settle();
  await say('RIght now i have to make a menu for toscana italian grill by friday, the owner wants two pasta specials and prices under $24, needs printing on the cream card stock, i have so much work to do'); await settle(1200);
  await page.screenshot({ path: `${out}/${tag}-1-asks.png` });
  await page.click('.choices .pill.solid'); await settle(1500);
  await page.screenshot({ path: `${out}/${tag}-2-camp.png` });
  await page.click('button.tree >> nth=0'); await page.waitForTimeout(700);
  await page.click('.leaf-tag >> nth=0'); await page.waitForTimeout(350);
  await page.screenshot({ path: `${out}/${tag}-3-details.png` });
  const info = await page.evaluate(() => ({
    task: JSON.parse(localStorage.getItem('prodty.state.v1')).tasks.map((t) => ({ title: t.title, due: t.due, note: (t.note || '').slice(0, 40), said: !!t.said })),
    replies: JSON.parse(localStorage.getItem('prodty.log.v1')).filter((e) => e.type === 'reply').map((e) => `${e.via}${e.fault ? ' (' + e.fault + ')' : ''}`),
    fault: document.querySelector('.fault')?.textContent ?? null, bibleHasNote: (window.__prompt || '').includes('Keep the detail'),
  }));
  console.log(tag, JSON.stringify(info), 'errors:', errors.length ? errors : 'none');
  await browser.close();
}
(async () => { await run('claude', true); await run('standin', false); })();
