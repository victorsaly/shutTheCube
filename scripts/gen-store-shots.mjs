/**
 * Makes the App Store screenshots: five 1206x2622 images (the 6.3-inch
 * iPhone size App Store Connect asks for; it scales them for other phones),
 * each a real screen of the running game under one line of caption.
 *
 * The screens are captured from the game itself, played through its own
 * interface, so a screenshot can never show something the app does not do.
 * The result screen is a game actually played to its end, not a staged one.
 *
 * Needs the game running and Chrome installed:
 *   npm run dev -- --port 5347
 *   node scripts/gen-store-shots.mjs [http://localhost:5347/play/]
 */
import { chromium } from 'playwright-core'
import { mkdir, writeFile, rm } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const outDir = path.join(root, 'docs/store/ios')
const fonts = path.join(root, 'public/static/fonts')
const URL = process.argv[2] ?? 'http://localhost:5347/play/'

const browser = await chromium.launch({
  channel: 'chrome',
  headless: true,
  args: ['--allow-file-access-from-files']
})
const phone = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true
})
const page = await phone.newPage()
const wait = (ms) => page.waitForTimeout(ms)
const playing = async () => (await page.locator('.tool').count()) > 0
const finished = async () => (await page.locator('.result').count()) > 0
const total = async () => Number(await page.locator('.total').textContent().catch(() => '0'))

const fresh = async (key) => {
  await page.goto(URL)
  await page.evaluate(() => localStorage.clear())
  await page.goto(URL)
  await wait(700)
  if (key) {
    await page.keyboard.press(key)
    await wait(500)
  }
}
const roll = async () => {
  await page.keyboard.press('Space')
  await wait(1200)
}
const pickHinted = async () => {
  await page.keyboard.press('h')
  await wait(120)
  const hinted = page.locator('.box.isHinted').first()
  if (!(await hinted.count())) return false
  await hinted.click({ force: true })
  await wait(260)
  return true
}
const playTurn = async () => {
  for (let i = 0; i < 12 && (await playing()); i += 1) if (!(await pickHinted())) break
  await wait(900)
}
/* Let a called-out moment and the hint's pulse finish before the picture. */
const settle = () => wait(3600)

const captures = {}
const grab = async (name) => (captures[name] = await page.screenshot())

// 1. Today
await fresh()
await grab('today')

// 2. A pick in progress on the nine-row board, on a roll worth looking at.
for (let attempt = 0; attempt < 12; attempt += 1) {
  await fresh('2')
  await roll()
  await playTurn()
  await roll()
  if ((await total()) < 8 || !(await pickHinted())) continue
  // One tile picked and more still to find: the sum half filled in.
  if ((await playing()) && (await page.locator('.to-go').count())) break
}
await settle()
await grab('pick')

// 3. Columns waiting to collapse: a board with several run badges showing.
for (let attempt = 0; attempt < 12; attempt += 1) {
  await fresh('2')
  await roll()
  if ((await page.locator('.run-badge:visible').count()) >= 5 && (await total()) >= 6) break
}
await wait(700)
await grab('columns')

// 4. Ninja, with the clock running.
for (let attempt = 0; attempt < 8; attempt += 1) {
  await fresh('3')
  await roll()
  if ((await total()) >= 6) break
}
await wait(7000)
await grab('ninja')

// 5. A real game of Beginner played to its end, as close to shut as it gets.
for (let attempt = 0; attempt < 40; attempt += 1) {
  await fresh('1')
  for (let turn = 0; turn < 40 && !(await finished()); turn += 1) {
    if (await playing()) await playTurn()
    else await roll()
  }
  const title = await page.locator('.result-title').textContent()
  if (/from shut|Box shut/.test(title)) break
}
await wait(1500)
await grab('result')
await phone.close()

const SHOTS = [
  ['01-today', 'today', 'One board a day.<br>The same for everyone.'],
  ['02-pick', 'pick', 'Roll. Pick the tiles<br>that add up.'],
  ['03-columns', 'columns', 'Match a column.<br>Take the lot.'],
  ['04-ninja', 'ninja', 'Or race the clock:<br>thirty seconds a turn.'],
  ['05-result', 'result', 'See how close you got.<br>Then share it.']
]

await mkdir(outDir, { recursive: true })
const canvas = await (await browser.newContext({ viewport: { width: 1206, height: 2622 } })).newPage()
for (const [file, key, caption] of SHOTS) {
  const raw = path.join(outDir, `${file}.raw.png`)
  const html = path.join(outDir, `${file}.html`)
  await writeFile(raw, captures[key])
  await writeFile(
    html,
    `<!doctype html><html><head><meta charset="utf-8"><style>
      @font-face { font-family: Display; font-weight: 200 800; src: url('file://${fonts}/bricolage-grotesque-latin-wght-normal.woff2') format('woff2-variations'); }
      * { margin: 0; box-sizing: border-box; }
      body { width: 1206px; height: 2622px; overflow: hidden; background: #f2f4f0; color: #15231c; font-family: Display, system-ui, sans-serif; }
      h1 { height: 458px; padding: 0 82px; display: flex; align-items: center; justify-content: center; text-align: center;
        font-weight: 700; font-size: 95px; line-height: 1.06; letter-spacing: -0.02em; }
      .screen { display: block; width: 1000px; margin: 0 auto; border-radius: 86px 86px 0 0; border: 13px solid #15231c; border-bottom: 0;
        box-shadow: 0 30px 80px rgba(21,35,28,.18); }
    </style></head><body><h1><span>${caption}</span></h1><img class="screen" src="file://${raw}"></body></html>`
  )
  await canvas.goto(`file://${html}`)
  await canvas.waitForTimeout(300)
  await canvas.screenshot({ path: path.join(outDir, `${file}.png`) })
  await rm(raw)
  await rm(html)
  console.log('wrote', `docs/store/ios/${file}.png`)
}
await browser.close()
