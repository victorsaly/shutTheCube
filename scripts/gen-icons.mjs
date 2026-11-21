/**
 * Renders every icon the site ships from the one drawn mark: a die face of
 * five built out of the board's own tiles, the centre one already shut.
 *
 * Two dressings of the same mark. Favicons sit on transparency, so they keep
 * the white frame and ink outline that BrandMark.vue draws in the page. App
 * icons are full-bleed squares the launcher crops, so the launcher's own
 * shape is the frame: the tiles sit straight on the game's deep green, each
 * with the darker edge it has on the board. The maskable icon keeps the mark
 * inside the safe zone Android crops to. favicon.ico is PNG-in-ICO.
 *
 * Same filenames the HTML already references.
 * Needs Chrome installed (playwright-core drives it). Run: npm run icons
 */
import { chromium } from 'playwright-core'
import { writeFile, rm } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const out = (f) => path.join(root, 'public/static', f)

/* Faces 1, 3, 2 and 5 of the board, with the edge shade each one wears. */
const TILES = [
  { x: 11, y: 11, face: '#8fdda8', edge: '#62bd82' },
  { x: 38, y: 11, face: '#84c2f1', edge: '#569fd6' },
  { x: 11, y: 38, face: '#c8b4f5', edge: '#a48bdf' },
  { x: 38, y: 38, face: '#f7d55c', edge: '#d9b32e' }
]

/* BrandMark.vue, flattened: for small sizes on any background. */
const framedMark = `
<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 64 64">
  <rect x="3" y="3" width="58" height="58" rx="15" fill="#ffffff" stroke="#15231c" stroke-width="3"/>
  ${TILES.map((t) => `<rect x="${t.x}" y="${t.y}" width="15" height="15" rx="4.5" fill="${t.face}"/>`).join('')}
  <rect x="24.5" y="24.5" width="15" height="15" rx="4.5" fill="#15231c"/>
</svg>`

/* The same five, cropped to the tiles and raised, for the green app icon. */
const raisedMark = `
<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="9 9 46 47">
  <rect x="24.5" y="24.5" width="15" height="15.5" rx="4.5" fill="#0c3a27"/>
  ${TILES.map(
    (t) =>
      `<rect x="${t.x}" y="${t.y}" width="15" height="16.5" rx="4.5" fill="${t.edge}"/>` +
      `<rect x="${t.x}" y="${t.y}" width="15" height="14" rx="4.5" fill="${t.face}"/>`
  ).join('')}
</svg>`

/* `pad` is the fraction of each edge left clear around the mark. */
const pageFor = (size, { solid, pad }) => `<!doctype html>
<html><head><meta charset="utf-8"><style>
  * { margin: 0; }
  body { width: ${size}px; height: ${size}px; display: grid; place-items: center;
    background: ${solid ? '#14573b' : 'transparent'}; }
  .m { width: ${Math.round(size * (1 - pad * 2))}px; height: ${Math.round(size * (1 - pad * 2))}px; }
</style></head><body><div class="m">${solid ? raisedMark : framedMark}</div></body></html>`

const ICONS = [
  { file: 'favicon-16x16.png', size: 16, solid: false, pad: 0 },
  { file: 'favicon-32x32.png', size: 32, solid: false, pad: 0 },
  { file: 'favicon-194x194.png', size: 194, solid: false, pad: 0 },
  { file: 'android-chrome-192x192.png', size: 192, solid: true, pad: 0.12 },
  { file: 'android-chrome-256x256.png', size: 256, solid: true, pad: 0.12 },
  { file: 'android-chrome-512x512.png', size: 512, solid: true, pad: 0.12 },
  /* Maskable: launchers crop to a circle inside about 80%, so the mark stays there. */
  { file: 'maskable-512x512.png', size: 512, solid: true, pad: 0.21 },
  { file: 'apple-touch-icon.png', size: 180, solid: true, pad: 0.12 },
  { file: 'apple-touch-icon-precomposed.png', size: 180, solid: true, pad: 0.12 },
  { file: 'mstile-150x150.png', size: 150, solid: true, pad: 0.14 }
]

const browser = await chromium.launch({ channel: 'chrome', headless: true })
for (const icon of ICONS) {
  const page = await (await browser.newContext({
    viewport: { width: icon.size, height: icon.size }
  })).newPage()
  const tmp = out(`${icon.file}.html`)
  await writeFile(tmp, pageFor(icon.size, icon))
  await page.goto(`file://${tmp}`)
  await page.screenshot({ path: out(icon.file), omitBackground: !icon.solid })
  await rm(tmp)
  await page.close()
  console.log('wrote', icon.file)
}
await browser.close()

/* favicon.ico: the 16 and 32 PNGs wrapped in an ICO directory (valid since
   Vista — every current browser reads PNG-compressed entries). */
const { readFile } = await import('node:fs/promises')
const pngs = await Promise.all([
  readFile(out('favicon-16x16.png')),
  readFile(out('favicon-32x32.png'))
])
const sizes = [16, 32]
const header = Buffer.alloc(6)
header.writeUInt16LE(1, 2) // type: icon
header.writeUInt16LE(pngs.length, 4)
const entries = []
let offset = 6 + 16 * pngs.length
pngs.forEach((png, i) => {
  const e = Buffer.alloc(16)
  e.writeUInt8(sizes[i] % 256, 0)
  e.writeUInt8(sizes[i] % 256, 1)
  e.writeUInt16LE(1, 4) // planes
  e.writeUInt16LE(32, 6) // bpp
  e.writeUInt32LE(png.length, 8)
  e.writeUInt32LE(offset, 12)
  offset += png.length
  entries.push(e)
})
await writeFile(out('favicon.ico'), Buffer.concat([header, ...entries, ...pngs]))
console.log('wrote favicon.ico')
