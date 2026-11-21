/**
 * Renders the social images: one 1200x630 card per mode plus the default
 * og-image, so a shared challenge link previews the mode it dares you into
 * rather than a generic banner.
 *
 * Each card is drawn from the game's own parts, in its own look: the light
 * ground, the mark, and real tiles in the board's colours with their raised
 * edges. Beginner shows the one row, Medium a column about to collapse,
 * Ninja the clock, and the default card the roll written as a sum.
 *
 * Needs Chrome installed (playwright-core drives it; no browser download).
 * Run: npm run social
 */
import { chromium } from 'playwright-core'
import { mkdir, writeFile, rm } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const outDir = path.join(root, 'public/static/social')
const fonts = path.join(root, 'public/static/fonts')

const MODES = {
  beginner: { label: 'Beginner', line: 'One row. The classic pub game.' },
  medium: { label: 'Medium', line: 'Nine rows. Matching columns collapse for a bonus.' },
  ninja: { label: 'Ninja', line: 'Nine rows against the clock. 30 seconds a turn.' }
}

/* The nine faces and their edges, as in src/styles/main.css. */
const FACE = {
  1: ['#8fdda8', '#62bd82'],
  2: ['#c8b4f5', '#a48bdf'],
  3: ['#84c2f1', '#569fd6'],
  4: ['#7dd3c8', '#4fb3a6'],
  5: ['#f7d55c', '#d9b32e'],
  6: ['#c3dc6a', '#9dbb3f'],
  7: ['#f4907c', '#d96a55'],
  8: ['#f6abcb', '#de82ab'],
  9: ['#f6b56b', '#db9340']
}

/* BrandMark.vue, flattened. */
const brandMark = (size) => `
<svg width="${size}" height="${size}" viewBox="0 0 64 64">
  <rect x="3" y="3" width="58" height="58" rx="15" fill="#ffffff" stroke="#15231c" stroke-width="3"/>
  <rect x="11" y="11" width="15" height="15" rx="4.5" fill="#8fdda8"/>
  <rect x="38" y="11" width="15" height="15" rx="4.5" fill="#84c2f1"/>
  <rect x="11" y="38" width="15" height="15" rx="4.5" fill="#c8b4f5"/>
  <rect x="38" y="38" width="15" height="15" rx="4.5" fill="#f7d55c"/>
  <rect x="24.5" y="24.5" width="15" height="15" rx="4.5" fill="#15231c"/>
</svg>`

/**
 * A board from rows of digits. `shut` and `picked` are sets of "row-col".
 * `badge` puts a run badge on one tile.
 */
const board = (rows, { shut = [], picked = [], badge = null, tall = false } = {}) =>
  `<div class="board${tall ? ' tall' : ''}">${rows
    .map((row, r) =>
      row
        .split('')
        .map((ch, c) => {
          const id = `${r}-${c}`
          if (shut.includes(id)) return '<span class="tile shut"></span>'
          const [face, edge] = FACE[ch]
          const ring = picked.includes(id) ? ' picked' : ''
          const mark = badge && badge.at === id ? `<i>${badge.n}</i>` : ''
          return `<span class="tile${ring}" style="background:${face};--edge:${edge}">${ch}${mark}</span>`
        })
        .join('')
    )
    .join('')}</div>`

const die = (pips) =>
  `<svg width="64" height="64" viewBox="0 0 100 100"><rect x="4" y="4" width="92" height="92" rx="18" fill="#fff" stroke="#15231c" stroke-width="5"/>${pips
    .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="9" fill="#15231c"/>`)
    .join('')}</svg>`
const SIX = [[28, 26], [72, 26], [28, 50], [72, 50], [28, 74], [72, 74]]
const FIVE = [[28, 28], [72, 28], [50, 50], [28, 72], [72, 72]]

const GRID = ['827534961', '754132689', '279564831', '482357961', '834679152']

const ART = {
  beginner: () =>
    board(['123456789'], { shut: ['0-1', '0-5'], picked: ['0-2'], tall: true }) +
    `<div class="sum">${die([[28, 28], [72, 28], [28, 72], [72, 72]])}<b>+</b>${die([[28, 28], [50, 50], [72, 72]])}<b>=</b><strong>7</strong></div>`,
  medium: () =>
    board(['827534961', '754136289', '279546831', '482356971', '834679152'], {
      picked: ['1-5', '2-5', '3-5'],
      badge: { at: '1-5', n: 3 }
    }),
  ninja: () =>
    `<div class="clock"><svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#a83a1b" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2M9 2h6"/></svg><span><span></span></span><strong>18s</strong></div>` +
    board(GRID.slice(0, 4), { shut: ['0-7', '0-8', '1-8'] }),
  home: () =>
    board(GRID.slice(0, 4), { shut: ['0-6', '0-7', '0-8', '1-8'], picked: ['0-3'] }) +
    `<div class="sum">${die(SIX)}<b>+</b>${die(FIVE)}<b>=</b><strong>11</strong><span class="go">5 picked, 6 to go</span></div>`
}

const pageFor = ({ eyebrow, heading, line, art, size = 80 }) => `<!doctype html>
<html><head><meta charset="utf-8"><style>
  @font-face { font-family: Display; font-weight: 200 800; src: url('file://${fonts}/bricolage-grotesque-latin-wght-normal.woff2') format('woff2-variations'); }
  @font-face { font-family: Body; font-weight: 100 900; src: url('file://${fonts}/inter-latin-wght-normal.woff2') format('woff2-variations'); }
  * { margin: 0; box-sizing: border-box; }
  body { width: 1200px; height: 630px; overflow: hidden; background: #f2f4f0; color: #15231c; font-family: Body, system-ui, sans-serif; }
  .wrap { height: 100%; padding: 60px 64px; display: grid; grid-template-columns: 1fr 548px; gap: 48px; align-items: center; }
  .copy { height: 100%; display: flex; flex-direction: column; justify-content: space-between; }
  .lockup { display: flex; align-items: center; gap: 18px; font-family: Display; font-weight: 700; font-size: 38px; }
  .eyebrow { font-size: 22px; font-weight: 600; letter-spacing: .1em; text-transform: uppercase; color: #14573b; }
  h1 { margin-top: 12px; font-family: Display; font-weight: 700; font-size: ${size}px; line-height: 1.02; letter-spacing: -0.02em; }
  .line { margin-top: 20px; font-size: 30px; line-height: 1.35; color: #536259; max-width: 17em; text-wrap: balance; }
  .site { font-size: 24px; font-weight: 600; color: #536259; }

  .art { display: flex; flex-direction: column; gap: 16px; }
  .board { padding: 12px; display: grid; grid-template-columns: repeat(9, 1fr); gap: 6px; background: #fff; border: 2px solid #dce2dc; border-radius: 28px; }
  .tile { position: relative; height: 62px; padding-bottom: 6px; display: grid; place-items: center; border-radius: 13px;
    box-shadow: inset 0 -6px 0 var(--edge), inset 0 2px 0 rgba(255,255,255,.55);
    font-family: Display; font-weight: 700; font-size: 30px; }
  .tall .tile { height: 150px; font-size: 38px; border-radius: 15px; }
  .tile.shut { background: #e9ede8; box-shadow: inset 0 3px 5px rgba(21,35,28,.12); }
  .tile.picked { box-shadow: inset 0 0 0 5px #15231c; padding-bottom: 0; }
  .tile i { position: absolute; top: -12px; right: -10px; width: 30px; height: 30px; display: grid; place-items: center;
    border-radius: 50%; background: #14573b; color: #fff; border: 3px solid #fff; font: 700 17px Body, sans-serif; }
  .sum { padding: 16px 24px; display: flex; align-items: center; gap: 16px; background: #fff; border: 2px solid #dce2dc; border-radius: 28px; }
  .sum b { font-family: Display; font-weight: 600; font-size: 34px; color: #536259; }
  .sum strong { font-family: Display; font-weight: 700; font-size: 64px; line-height: 64px; }
  .sum .go { margin-left: auto; font-size: 22px; font-weight: 600; color: #536259; }
  .clock { height: 76px; padding: 0 24px; display: flex; align-items: center; gap: 18px; background: #fff; border: 2px solid #dce2dc; border-radius: 24px; }
  .clock > span { flex: 1; height: 16px; border-radius: 8px; background: #e9ede8; overflow: hidden; }
  .clock > span > span { display: block; width: 60%; height: 100%; border-radius: 8px; background: #e8663d; }
  .clock strong { font-family: Display; font-weight: 700; font-size: 38px; color: #a83a1b; }
</style></head><body><div class="wrap">
  <div class="copy">
    <div class="lockup">${brandMark(72)}Shut The Cube</div>
    <div><div class="eyebrow">${eyebrow}</div><h1>${heading}</h1><div class="line">${line}</div></div>
    <div class="site">shutthecube.com</div>
  </div>
  <div class="art">${art}</div>
</div></body></html>`

await mkdir(outDir, { recursive: true })
const browser = await chromium.launch({
  channel: 'chrome',
  headless: true,
  args: ['--allow-file-access-from-files']
})
const page = await (await browser.newContext({ viewport: { width: 1200, height: 630 } })).newPage()

const shots = [
  ...Object.entries(MODES).map(([key, m]) => ({
    file: path.join(outDir, `${key}.png`),
    html: pageFor({ eyebrow: 'A challenge', heading: m.label, line: m.line, art: ART[key]() })
  })),
  {
    file: path.join(root, 'public/static/og-image.png'),
    html: pageFor({
      eyebrow: 'Free · no ads · plays offline',
      heading: 'Roll the dice. Shut the cube.',
      line: 'The pub dice game, nine rows deep, with one shared board a day.',
      size: 60,
      art: ART.home()
    })
  }
]

for (const { file, html } of shots) {
  const tmp = `${file}.html`
  await writeFile(tmp, html)
  await page.goto(`file://${tmp}`)
  await page.waitForTimeout(250) // let the fonts settle
  await page.screenshot({ path: file })
  await rm(tmp)
  console.log('wrote', path.relative(root, file))
}
await browser.close()
