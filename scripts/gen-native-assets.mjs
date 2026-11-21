/**
 * Draws the source images the native apps are dressed from, into assets/:
 * the 1024px app icon, Android's adaptive foreground and background, and the
 * splash screen. `npm run native:assets` then has @capacitor/assets cut every
 * size iOS and Android ask for.
 *
 * The mark is the one scripts/gen-icons.mjs draws: tiles on the game's deep
 * green for the icon, the white-framed mark on the light ground for the
 * splash, so the app opens on the same ground its first screen has.
 *
 * Needs Chrome installed (playwright-core drives it).
 */
import { chromium } from 'playwright-core'
import { mkdir, writeFile, rm } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const dir = path.join(root, 'assets')

const TILES = [
  { x: 11, y: 11, face: '#8fdda8', edge: '#62bd82' },
  { x: 38, y: 11, face: '#84c2f1', edge: '#569fd6' },
  { x: 11, y: 38, face: '#c8b4f5', edge: '#a48bdf' },
  { x: 38, y: 38, face: '#f7d55c', edge: '#d9b32e' }
]
const raised = `
<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="9 9 46 47">
  <rect x="24.5" y="24.5" width="15" height="15.5" rx="4.5" fill="#0c3a27"/>
  ${TILES.map(
    (t) =>
      `<rect x="${t.x}" y="${t.y}" width="15" height="16.5" rx="4.5" fill="${t.edge}"/>` +
      `<rect x="${t.x}" y="${t.y}" width="15" height="14" rx="4.5" fill="${t.face}"/>`
  ).join('')}
</svg>`
const framed = `
<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 64 64">
  <rect x="3" y="3" width="58" height="58" rx="15" fill="#ffffff" stroke="#15231c" stroke-width="3"/>
  ${TILES.map((t) => `<rect x="${t.x}" y="${t.y}" width="15" height="15" rx="4.5" fill="${t.face}"/>`).join('')}
  <rect x="24.5" y="24.5" width="15" height="15" rx="4.5" fill="#15231c"/>
</svg>`

/* `scale` is the mark's share of the canvas. */
const SHOTS = [
  { file: 'icon-only.png', size: 1024, bg: '#14573b', mark: raised, scale: 0.76 },
  /* Adaptive icons are cropped to the middle two thirds, so the mark stays inside. */
  { file: 'icon-foreground.png', size: 1024, bg: 'transparent', mark: raised, scale: 0.46 },
  { file: 'icon-background.png', size: 1024, bg: '#14573b', mark: '', scale: 0 },
  { file: 'splash.png', size: 2732, bg: '#f2f4f0', mark: framed, scale: 0.16 },
  { file: 'splash-dark.png', size: 2732, bg: '#f2f4f0', mark: framed, scale: 0.16 }
]

await mkdir(dir, { recursive: true })
const browser = await chromium.launch({ channel: 'chrome', headless: true })
for (const s of SHOTS) {
  const page = await (await browser.newContext({ viewport: { width: s.size, height: s.size } })).newPage()
  const side = Math.round(s.size * s.scale)
  const tmp = path.join(dir, `${s.file}.html`)
  await writeFile(
    tmp,
    `<!doctype html><html><head><meta charset="utf-8"><style>*{margin:0}body{width:${s.size}px;height:${s.size}px;display:grid;place-items:center;background:${s.bg}}.m{width:${side}px;height:${side}px}</style></head><body><div class="m">${s.mark}</div></body></html>`
  )
  await page.goto(`file://${tmp}`)
  await page.screenshot({ path: path.join(dir, s.file), omitBackground: s.bg === 'transparent' })
  await rm(tmp)
  await page.close()
  console.log('wrote', `assets/${s.file}`)
}
await browser.close()
