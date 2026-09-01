import { chromium } from 'playwright-core'
const b = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' })
const p = await (await b.newContext({ viewport: { width: 900, height: 1000 } })).newPage()
p.on('pageerror', e => console.log('PAGE ERROR:', e.message))
await p.goto('http://localhost:4173/', { waitUntil: 'networkidle' })
await p.getByRole('button', { name: /^Daily/ }).click()
await p.getByRole('button', { name: /Beginner/ }).first().click()
await p.waitForSelector('.action-button', { timeout: 8000 })

for (let turn = 0; turn < 80; turn++) {
  if (await p.$('.result')) break
  const act = await p.$('.action-button')
  if (act) { await act.click().catch(()=>{}); await p.waitForTimeout(140) }
  for (let pick = 0; pick < 9; pick++) {
    if (await p.$('.result')) break
    const tile = await p.$('[role="gridcell"] button:not([disabled])')
    if (!tile) break
    await tile.click().catch(() => {})
    await p.waitForTimeout(90)
  }
}
const has = await p.$('.result')
console.log('reached result card:', Boolean(has))
if (has) {
  console.log('post CTA visible:', await p.locator('.post-cta').isVisible().catch(() => false))
  console.log('CTA text:', (await p.locator('.post-cta').innerText().catch(() => '')).replace(/\s+/g,' ').trim())
  await p.screenshot({ path: '/tmp/result.png' })
}
await b.close()
