/**
 * Renders demo cards with the real built bundle and captures screenshots for
 * the README, so the images always reflect what the card actually produces.
 *
 * Usage: npm run build && node scripts/screenshot.mjs
 */
import { chromium } from 'playwright'
import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { extname, join, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' }

const server = createServer(async (req, res) => {
  if (req.url === '/favicon.ico') return res.writeHead(204).end()
  try {
    const path = normalize(decodeURIComponent(req.url.split('?')[0]))
    const body = await readFile(join(root, path))
    res.writeHead(200, { 'content-type': TYPES[extname(path)] ?? 'application/octet-stream' })
    res.end(body)
  } catch {
    res.writeHead(404).end('not found')
  }
})

await new Promise((r) => server.listen(0, r))
const base = `http://127.0.0.1:${server.address().port}`

const CARDS = [
  {
    name: 'Climate tile',
    config: {
      content: `<div class="rounded-3xl bg-white/70 p-6 ring-1 ring-black/5 backdrop-blur-xl">
  <div class="flex items-start justify-between">
    <div>
      <div class="text-xs font-medium uppercase tracking-widest text-zinc-400">Living room</div>
      <div class="mt-1 flex items-baseline gap-1">
        <span class="text-6xl font-semibold tracking-tight text-zinc-900">21</span>
        <span class="text-2xl font-medium text-zinc-400">&deg;C</span>
      </div>
    </div>
    <div class="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">Comfortable</div>
  </div>
  <div class="mt-6 flex gap-6 text-sm text-zinc-500">
    <div><span class="font-semibold text-zinc-800">46%</span> humidity</div>
    <div><span class="font-semibold text-zinc-800">612</span> ppm CO2</div>
  </div>
  <div class="mt-5 h-1.5 w-full overflow-hidden rounded-full bg-zinc-200">
    <div class="h-full w-2/3 rounded-full bg-linear-to-r from-emerald-400 to-emerald-600"></div>
  </div>
</div>`
    }
  },
  {
    name: 'Lights',
    config: {
      content: `<div class="rounded-3xl bg-zinc-900 p-6 text-white">
  <div class="flex items-center justify-between">
    <div class="text-sm font-medium text-zinc-400">Lights</div>
    <div class="rounded-full bg-amber-400/20 px-3 py-1 text-xs font-semibold text-amber-300">3 on</div>
  </div>
  <div class="mt-5 grid grid-cols-3 gap-3">
    <div class="rounded-2xl bg-amber-400/90 p-4 text-zinc-900">
      <div class="text-2xl">&#9788;</div>
      <div class="mt-2 text-xs font-semibold">Desk</div>
    </div>
    <div class="rounded-2xl bg-amber-400/90 p-4 text-zinc-900">
      <div class="text-2xl">&#9788;</div>
      <div class="mt-2 text-xs font-semibold">Shelf</div>
    </div>
    <div class="rounded-2xl bg-white/5 p-4 text-zinc-500 ring-1 ring-white/10">
      <div class="text-2xl">&#9789;</div>
      <div class="mt-2 text-xs font-semibold">Floor</div>
    </div>
  </div>
  <div class="mt-5 text-xs text-zinc-500">Hold a tile for more info</div>
</div>`
    }
  },
  {
    name: 'Energy',
    config: {
      content: `<div class="rounded-3xl bg-white/70 p-6 ring-1 ring-black/5 backdrop-blur-xl">
  <div class="text-xs font-medium uppercase tracking-widest text-zinc-400">Power now</div>
  <div class="mt-1 flex items-baseline gap-1">
    <span class="text-5xl font-semibold tracking-tight text-zinc-900">184</span>
    <span class="text-xl font-medium text-zinc-400">W</span>
  </div>
  <div class="mt-6 flex h-20 items-end gap-1.5">
    ${[35, 52, 41, 68, 47, 80, 62, 91, 55, 73, 44, 60]
      .map(
        (h) =>
          `<div class="flex-1 rounded-t bg-linear-to-t from-sky-200 to-sky-500" style="height:${h}%"></div>`
      )
      .join('')}
  </div>
  <div class="mt-3 flex justify-between text-xs text-zinc-400">
    <span>12h ago</span><span>now</span>
  </div>
</div>`
    }
  }
]

const browser = await chromium
  .launch({ channel: 'chrome' })
  .catch(() => chromium.launch())
const page = await browser.newPage({
  viewport: { width: 1200, height: 400 },
  deviceScaleFactor: 2
})

await page.goto(`${base}/test/fixture.html`)
await page.waitForFunction(
  () => window.__ready && customElements.get('tailwind-template-card')
)

await page.evaluate(async (cards) => {
  const host = document.getElementById('host')
  host.style.cssText =
    'display:grid;grid-template-columns:repeat(3,1fr);gap:24px;padding:40px;' +
    'background:linear-gradient(135deg,#eef1f5,#dfe4ec);' +
    'font-family:system-ui,-apple-system,"Segoe UI",sans-serif;align-items:start'
  document.body.style.margin = '0'

  for (const { config } of cards) {
    const card = document.createElement('tailwind-template-card')
    host.appendChild(card)
    card.hass = window.__makeHass()
    card.setConfig({ parse_jinja: true, ignore_line_breaks: true, ...config })
  }

  // Wait for every card to paint and compile its styles.
  for (let i = 0; i < 80; i++) {
    await new Promise((r) => setTimeout(r, 50))
    const ready = [...host.children].every((c) => c.shadowRoot?.querySelector('div'))
    if (ready) break
  }
  await new Promise((r) => setTimeout(r, 600))
}, CARDS)

// Capture the panel itself so the image has no dead space around it.
await page.locator('#host').screenshot({ path: 'images/cards.png' })
console.log('wrote images/cards.png')

await browser.close()
server.close()
