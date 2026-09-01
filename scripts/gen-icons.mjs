/**
 * Renders every icon the site ships from the one drawn mark (BrandMark.vue,
 * flattened here) — favicons on transparency, app icons on the forest ground,
 * a maskable icon with the safe-zone padding Android crops to, and a
 * PNG-in-ICO favicon.ico. Same filenames the HTML already references.
 *
 * Needs Chrome installed (playwright-core drives it). Run: npm run icons
 */
import { chromium } from 'playwright-core'
import { writeFile, rm } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const out = (f) => path.join(root, 'public/static', f)

const mark = `
<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 64 64">
  <rect x="3" y="3" width="58" height="58" rx="15" fill="rgba(9,29,22,.45)" stroke="#eaf3ee" stroke-width="3"/>
  <rect x="11" y="11" width="15" height="15" rx="4.5" fill="#a2f5bf"/>
  <rect x="38" y="11" width="15" height="15" rx="4.5" fill="#6cb2eb"/>
  <rect x="11" y="38" width="15" height="15" rx="4.5" fill="#d6bbfc"/>
  <rect x="38" y="38" width="15" height="15" rx="4.5" fill="#fff382"/>
  <rect x="24.5" y="24.5" width="15" height="15" rx="4.5" fill="#0a1f17" stroke="rgba(234,243,238,.35)" stroke-width="1.5"/>
</svg>`

/* Solid icons put the frame's own dark fill behind the mark so the tile
   colours read at launcher size; `pad` is the fraction of edge left clear. */
const pageFor = (size, { solid, pad }) => `<!doctype html>
<html><head><meta charset="utf-8"><style>
  * { margin: 0; }
  body { width: ${size}px; height: ${size}px; display: grid; place-items: center;
    ${solid ? 'background: linear-gradient(170deg, #14402e 0%, #0d2a1f 60%, #091d16 100%);' : 'background: transparent;'} }
  .m { width: ${Math.round(size * (1 - pad * 2))}px; height: ${Math.round(size * (1 - pad * 2))}px; }
</style></head><body><div class="m">${mark}</div></body></html>`

const ICONS = [
  { file: 'favicon-16x16.png', size: 16, solid: false, pad: 0 },
  { file: 'favicon-32x32.png', size: 32, solid: false, pad: 0 },
  { file: 'favicon-194x194.png', size: 194, solid: false, pad: 0 },
  { file: 'android-chrome-192x192.png', size: 192, solid: true, pad: 0.1 },
  { file: 'android-chrome-256x256.png', size: 256, solid: true, pad: 0.1 },
  { file: 'android-chrome-512x512.png', size: 512, solid: true, pad: 0.1 },
  /* Maskable: launchers crop to a circle inside ~80% — keep the mark there. */
  { file: 'maskable-512x512.png', size: 512, solid: true, pad: 0.17 },
  { file: 'apple-touch-icon.png', size: 180, solid: true, pad: 0.1 },
  { file: 'apple-touch-icon-precomposed.png', size: 180, solid: true, pad: 0.1 },
  { file: 'mstile-150x150.png', size: 150, solid: true, pad: 0.12 }
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
