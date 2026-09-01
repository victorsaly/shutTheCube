/**
 * Renders the social images: one 1200x630 card per mode plus the default
 * og-image, so a shared challenge link previews the mode it dares you into
 * rather than a generic banner.
 *
 * The drawings mirror BrandMark.vue and ModeMark.vue — the mark on the card
 * someone receives in a chat is the mark on the menu card they land on.
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
const font600 = path.join(root, 'node_modules/@fontsource/fredoka/files/fredoka-latin-600-normal.woff2')
const font700 = path.join(root, 'node_modules/@fontsource/fredoka/files/fredoka-latin-700-normal.woff2')

const MODES = {
  beginner: { label: 'Beginner', accent: '#4dd0c0', line: 'One row, the classic pub game.' },
  medium: { label: 'Medium', accent: '#6cb2eb', line: 'Nine rows — matching columns collapse for a bonus.' },
  ninja: { label: 'Ninja', accent: '#ff8f6b', line: 'Nine rows against the clock. 30 seconds a turn.' }
}

/* BrandMark.vue, flattened. */
const brandMark = (size) => `
<svg width="${size}" height="${size}" viewBox="0 0 64 64">
  <rect x="3" y="3" width="58" height="58" rx="15" fill="rgba(9,29,22,.45)" stroke="#eaf3ee" stroke-width="3"/>
  <rect x="11" y="11" width="15" height="15" rx="4.5" fill="#a2f5bf"/>
  <rect x="38" y="11" width="15" height="15" rx="4.5" fill="#6cb2eb"/>
  <rect x="11" y="38" width="15" height="15" rx="4.5" fill="#d6bbfc"/>
  <rect x="38" y="38" width="15" height="15" rx="4.5" fill="#fff382"/>
  <rect x="24.5" y="24.5" width="15" height="15" rx="4.5" fill="#0a1f17" stroke="rgba(234,243,238,.35)" stroke-width="1.5"/>
</svg>`

/* ModeMark.vue, flattened per mode. */
const modeArt = (mode, accent) => {
  const tile = 'fill="rgba(234,243,238,.8)"'
  const hole = 'fill="#0a1f17" stroke="rgba(234,243,238,.3)" stroke-width="1.5"'
  let inner = ''
  if (mode === 'beginner') {
    for (let i = 0; i < 9; i += 1) {
      const cls = i === 2 || i === 6 ? hole : i === 4 ? `fill="${accent}"` : tile
      inner += `<rect x="${4 + i * 22}" y="21" width="18" height="30" rx="5" ${cls}/>`
    }
  } else if (mode === 'medium') {
    for (let r = 0; r < 3; r += 1) {
      for (let i = 0; i < 9; i += 1) {
        if (i === 5) continue
        inner += `<rect x="${4 + i * 22}" y="${6 + r * 22}" width="18" height="18" rx="4" ${tile} opacity="${0.55 - r * 0.12}"/>`
      }
    }
    for (let r = 0; r < 3; r += 1) {
      inner += `<rect x="114" y="${3 + r * 22}" width="18" height="18" rx="4" fill="${accent}"/>`
    }
    inner += `<circle cx="132" cy="6" r="7" fill="${accent}" stroke="rgba(9,29,22,.7)" stroke-width="1.5"/>`
    inner += `<text x="132" y="9" font-family="system-ui" font-size="9" font-weight="700" fill="#10291d" text-anchor="middle">3</text>`
  } else {
    for (let r = 0; r < 3; r += 1) {
      for (let i = 0; i < 6; i += 1) {
        inner += `<rect x="${4 + i * 22}" y="${6 + r * 22}" width="18" height="18" rx="4" ${tile} opacity="${0.5 - r * 0.12}"/>`
      }
    }
    inner += `<circle cx="166" cy="36" r="26" fill="rgba(9,29,22,.55)" stroke="rgba(234,243,238,.3)" stroke-width="2"/>`
    inner += `<path d="M166 10 A26 26 0 1 1 143.5 23" fill="none" stroke="${accent}" stroke-width="4" stroke-linecap="round"/>`
    inner += `<path d="M166 36 L166 16" stroke="#eaf3ee" stroke-width="2.5" stroke-linecap="round"/>`
    inner += `<circle cx="166" cy="36" r="3.5" fill="#eaf3ee"/>`
  }
  return `<svg viewBox="0 0 200 72" width="620" height="223">${inner}</svg>`
}

const pageFor = ({ accent, heading, line, art }) => `<!doctype html>
<html><head><meta charset="utf-8"><style>
  @font-face { font-family: Fredoka; font-weight: 600; src: url('file://${font600}') format('woff2'); }
  @font-face { font-family: Fredoka; font-weight: 700; src: url('file://${font700}') format('woff2'); }
  * { margin: 0; box-sizing: border-box; }
  body {
    width: 1200px; height: 630px; overflow: hidden; color: #eaf3ee;
    font-family: Fredoka, system-ui, sans-serif;
    background:
      radial-gradient(70% 90% at 88% 0%, ${accent}2e, transparent 62%),
      radial-gradient(55% 70% at -5% 110%, rgba(127,240,174,.14), transparent 65%),
      linear-gradient(170deg, #14402e 0%, #0d2a1f 55%, #091d16 100%);
  }
  .wrap { height: 100%; padding: 64px 72px 56px; display: flex; flex-direction: column; justify-content: space-between; }
  .lockup { display: flex; align-items: center; gap: 26px; }
  .word { font-weight: 700; font-size: 78px; letter-spacing: .02em; text-transform: uppercase;
    text-shadow: 0 0 46px ${accent}59; }
  .mode { font-weight: 600; font-size: 40px; letter-spacing: .06em; text-transform: uppercase; color: ${accent}; }
  .line { margin-top: 10px; font-family: Avenir, system-ui, sans-serif; font-size: 30px; color: #9fb4a8; max-width: 30ch; }
  .art { align-self: flex-end; margin-top: -40px; }
</style></head><body><div class="wrap">
  <div class="lockup">${brandMark(128)}<div class="word">Shut The Cube</div></div>
  <div><div class="mode">${heading}</div><div class="line">${line}</div></div>
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
    html: pageFor({ accent: m.accent, heading: `${m.label} challenge`, line: m.line, art: modeArt(key, m.accent) })
  })),
  {
    file: path.join(root, 'public/static/og-image.png'),
    html: pageFor({
      accent: '#51d88a',
      heading: 'Free · no ads · works offline',
      line: 'Roll the dice, shut the tiles that match. Clear the board and the box is yours.',
      art: modeArt('beginner', '#51d88a')
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
