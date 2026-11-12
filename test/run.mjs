/**
 * Runtime smoke tests for the card, driven against a real browser.
 *
 * These cover the things that cannot be checked by typechecking: that Tailwind
 * compiles in the browser, that the compiled CSS actually applies inside the
 * shadow root, and that template subscriptions are not leaked.
 */
import { chromium } from 'playwright'
import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { extname, join, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' }

const server = createServer(async (req, res) => {
  // Chrome requests this unprompted; answering it keeps the console clean so
  // any remaining error is genuinely the card's.
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

// Use the locally installed Chrome when present (no browser download needed);
// fall back to Playwright's bundled Chromium, which is what CI installs.
const browser = await chromium
  .launch({ channel: 'chrome' })
  .catch(() => chromium.launch())
const page = await browser.newPage()

const consoleErrors = []
page.on('console', (m) => m.type() === 'error' && consoleErrors.push(m.text()))
page.on('pageerror', (e) => consoleErrors.push(String(e)))
page.on('requestfailed', (r) => {
  if (!r.url().includes('favicon')) consoleErrors.push(`request failed: ${r.url()}`)
})

await page.goto(`${base}/test/fixture.html`)
await page.waitForFunction(() => window.__ready && customElements.get('tailwind-template-card'))

const results = []
const check = (name, pass, detail = '') => {
  results.push({ name, pass, detail })
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail && !pass ? ` — ${detail}` : ''}`)
}

// --- Tailwind utilities compile and apply inside the shadow root -----------
const styles = await page.evaluate(async () => {
  const card = document.createElement('tailwind-template-card')
  document.getElementById('host').appendChild(card)
  card.hass = window.__makeHass()
  card.setConfig({
    parse_jinja: true,
    ignore_line_breaks: true,
    content:
      '<div id="probe" class="flex rounded-3xl bg-white/60 p-5 text-4xl font-semibold backdrop-blur-xl">hi</div>' +
      '<div id="daisy" class="btn btn-primary">go</div>'
  })

  // Allow the async template push + style compilation to settle.
  for (let i = 0; i < 60; i++) {
    await new Promise((r) => setTimeout(r, 50))
    if (card.shadowRoot.querySelector('#probe')) break
  }
  await new Promise((r) => setTimeout(r, 300))

  const probe = card.shadowRoot.querySelector('#probe')
  const daisy = card.shadowRoot.querySelector('#daisy')
  if (!probe) return { error: 'probe element never rendered' }

  const cs = getComputedStyle(probe)
  return {
    display: cs.display,
    borderRadius: cs.borderTopLeftRadius,
    background: cs.backgroundColor,
    fontSize: cs.fontSize,
    padding: cs.paddingTop,
    backdrop: cs.backdropFilter,
    daisyDisplay: daisy ? getComputedStyle(daisy).display : null,
    daisyBg: daisy ? getComputedStyle(daisy).backgroundColor : null,
    sheetCount: card.shadowRoot.adoptedStyleSheets.length
  }
})

if (styles.error) {
  check('card renders content into shadow root', false, styles.error)
} else {
  check('card renders content into shadow root', true)
  check('utility `flex` applies', styles.display === 'flex', `display=${styles.display}`)
  check('utility `rounded-3xl` applies', styles.borderRadius === '24px', `radius=${styles.borderRadius}`)
  check('utility `text-4xl` applies', styles.fontSize === '36px', `size=${styles.fontSize}`)
  check('utility `p-5` applies', styles.padding === '20px', `padding=${styles.padding}`)
  check(
    'opacity modifier `bg-white/60` applies',
    styles.background !== 'rgba(0, 0, 0, 0)' && /0\.6\s*\)?$/.test(styles.background),
    `bg=${styles.background}`
  )
  check('`backdrop-blur-xl` applies', /blur/.test(styles.backdrop || ''), `backdrop=${styles.backdrop}`)
  check('daisyUI `btn` component applies', styles.daisyDisplay && styles.daisyDisplay !== 'block', `display=${styles.daisyDisplay}`)
  check('shadow root has adopted stylesheets', styles.sheetCount >= 2, `count=${styles.sheetCount}`)
}

// --- Subscriptions are not leaked on repeated state updates ---------------
const subs = await page.evaluate(async () => {
  window.__subscriptions = { opened: 0, closed: 0 }
  const card = document.createElement('tailwind-template-card')
  document.getElementById('host').appendChild(card)
  card.setConfig({ parse_jinja: true, ignore_line_breaks: true, content: '<div class="flex">x</div>' })

  for (let i = 0; i < 25; i++) {
    const hass = window.__makeHass()
    // Mutate a watched entity so the card sees a genuine change each time.
    hass.states['sensor.living_room_temperature'] = {
      entity_id: 'sensor.living_room_temperature',
      state: String(20 + i),
      attributes: {}
    }
    card.hass = hass
    await new Promise((r) => setTimeout(r, 10))
  }
  await new Promise((r) => setTimeout(r, 200))

  const before = { ...window.__subscriptions }
  card.remove()
  await new Promise((r) => setTimeout(r, 100))

  return { ...before, closedAfterRemove: window.__subscriptions.closed }
})

check(
  'one template subscription survives 25 state updates',
  subs.opened - subs.closed <= 1,
  `opened=${subs.opened} closed=${subs.closed}`
)
check(
  'subscription is closed when card is removed',
  subs.closedAfterRemove >= subs.opened,
  `opened=${subs.opened} closedAfterRemove=${subs.closedAfterRemove}`
)

// --- Actions: service calls, nested targets, hold and more-info ------------
const actions = await page.evaluate(async () => {
  const card = document.createElement('tailwind-template-card')
  document.getElementById('host').appendChild(card)

  const moreInfoEvents = []
  card.addEventListener('hass-more-info', (e) => moreInfoEvents.push(e.detail.entityId))

  card.hass = window.__makeHass()
  card.setConfig({
    parse_jinja: true,
    ignore_line_breaks: true,
    entity: 'light.living_room',
    content:
      '<div id="tile" class="flex"><span id="label">Living</span></div>' +
      '<div id="held" class="flex">hold me</div>',
    actions: [
      { selector: '#tile', type: 'click', call: "hass.callService('light','toggle',{entity_id:'light.living_room'})" },
      { selector: '#held', type: 'hold', call: "moreInfo('light.living_room')" }
    ]
  })

  for (let i = 0; i < 60; i++) {
    await new Promise((r) => setTimeout(r, 50))
    if (card.shadowRoot.querySelector('#label')) break
  }

  // Click the inner span: the action is bound to the outer tile.
  card.shadowRoot.querySelector('#label').click()
  await new Promise((r) => setTimeout(r, 50))
  const serviceCall = window.__lastServiceCall

  // Press and hold the second element.
  const held = card.shadowRoot.querySelector('#held')
  const rect = held.getBoundingClientRect()
  const opts = { bubbles: true, composed: true, clientX: rect.x + 2, clientY: rect.y + 2 }
  held.dispatchEvent(new PointerEvent('pointerdown', opts))
  await new Promise((r) => setTimeout(r, 700))
  held.dispatchEvent(new PointerEvent('pointerup', opts))
  await new Promise((r) => setTimeout(r, 50))

  return { serviceCall, moreInfoEvents }
})

check(
  'action fires when a nested child is clicked',
  actions.serviceCall?.domain === 'light' && actions.serviceCall?.service === 'toggle',
  JSON.stringify(actions.serviceCall)
)
check(
  'hold action fires after a long press',
  actions.moreInfoEvents.length === 1,
  `moreInfo events=${actions.moreInfoEvents.length}`
)
check(
  'moreInfo() emits hass-more-info for the right entity',
  actions.moreInfoEvents[0] === 'light.living_room',
  `entity=${actions.moreInfoEvents[0]}`
)

// --- Classes introduced by bindings must also get compiled ---------------
const bound = await page.evaluate(async () => {
  const card = document.createElement('tailwind-template-card')
  document.getElementById('host').appendChild(card)
  card.hass = window.__makeHass()
  card.setConfig({
    parse_jinja: true,
    ignore_line_breaks: true,
    entity: 'light.living_room',
    // `bg-orange-400` appears nowhere in the HTML — only a binding adds it.
    content: '<div id="dot" class="rounded-full"></div>',
    bindings: [{ selector: '#dot', type: 'class', bind: "return 'bg-orange-400'" }]
  })

  for (let i = 0; i < 60; i++) {
    await new Promise((r) => setTimeout(r, 50))
    if (card.shadowRoot.querySelector('#dot')) break
  }
  await new Promise((r) => setTimeout(r, 400))

  const dot = card.shadowRoot.querySelector('#dot')
  return {
    classes: dot?.className ?? '',
    background: dot ? getComputedStyle(dot).backgroundColor : null
  }
})

check(
  'binding actually adds the class',
  bound.classes.includes('bg-orange-400'),
  `classes=${bound.classes}`
)
check(
  'class added by a binding is compiled and styled',
  bound.background !== 'rgba(0, 0, 0, 0)' && bound.background !== null,
  `background=${bound.background}`
)

// --- Config editor: fallback, upgrade, and change propagation -------------
const editor = await page.evaluate(async () => {
  const el = document.createElement('tailwind-template-card-config')
  document.getElementById('host').appendChild(el)
  el.hass = window.__makeHass()
  el.setConfig({ content: '<div class="flex">x</div>' })
  await new Promise((r) => setTimeout(r, 600))

  // `ha-code-editor` is not defined yet, so a plain textarea stands in.
  const fallback = Boolean(el.shadowRoot.querySelector('textarea'))

  // Register a stand-in for Home Assistant's editor and let it upgrade.
  let lastAssignedValue = null
  class FakeHaCodeEditor extends HTMLElement {
    connectedCallback() {
      // ha-code-editor only sets `display: block` on its host and lets
      // CodeMirror size itself, so with real content it is very tall.
      this.style.display = 'block'
      this.innerHTML = '<div style="height:1200px"><input class="probe-input" /></div>'
    }
    set value(v) { lastAssignedValue = v; this._value = v }
    get value() { return this._value ?? '' }
  }
  customElements.define('ha-code-editor', FakeHaCodeEditor)
  window.__lastAssignedValue = () => lastAssignedValue

  for (let i = 0; i < 40; i++) {
    await new Promise((r) => setTimeout(r, 50))
    if (el.shadowRoot.querySelector('ha-code-editor')) break
  }

  const node = el.shadowRoot.querySelector('ha-code-editor')
  const upgraded = Boolean(node)
  const seeded = lastAssignedValue

  // A value-changed event from the editor should reach the card config.
  let changed = null
  el.addEventListener('config-changed', (e) => {
    changed = e.detail.config.content
  })
  if (node) {
    node._value = '<div class="grid">edited</div>'
    node.dispatchEvent(
      new CustomEvent('value-changed', {
        bubbles: true,
        composed: true,
        detail: { value: '<div class="grid">edited</div>' }
      })
    )
  }
  await new Promise((r) => setTimeout(r, 400))

  return { fallback, upgraded, seeded, changed, mode: node?.mode ?? null }
})

check('config editor falls back to a textarea when HA editor is absent', editor.fallback)
check('config editor upgrades once ha-code-editor is defined', editor.upgraded)
check('editor is seeded with the current content', typeof editor.seeded === 'string', `seeded=${JSON.stringify(editor.seeded)}`)
check('editor uses jinja2 mode', editor.mode === 'jinja2', `mode=${editor.mode}`)
check('value-changed propagates to the card config', editor.changed === '<div class="grid">edited</div>', `changed=${JSON.stringify(editor.changed)}`)

// --- Upstream card type keeps working ------------------------------------
const legacy = await page.evaluate(async () => {
  const defined = Boolean(customElements.get('tailwindcss-template-card'))
  if (!defined) return { defined, rendered: false, styled: null }

  const card = document.createElement('tailwindcss-template-card')
  document.getElementById('host').appendChild(card)
  card.hass = window.__makeHass()
  card.setConfig({
    parse_jinja: true,
    ignore_line_breaks: true,
    content: '<div id="legacy" class="flex rounded-3xl">old config</div>'
  })

  for (let i = 0; i < 60; i++) {
    await new Promise((r) => setTimeout(r, 50))
    if (card.shadowRoot.querySelector('#legacy')) break
  }
  await new Promise((r) => setTimeout(r, 300))

  const node = card.shadowRoot.querySelector('#legacy')
  return {
    defined,
    rendered: Boolean(node),
    styled: node ? getComputedStyle(node).display : null
  }
})

check('legacy card type is still registered', legacy.defined)
check('a config written for the upstream card still renders', legacy.rendered)
check('legacy card is styled by the new engine', legacy.styled === 'flex', `display=${legacy.styled}`)

// --- Utilities that depend on @property registration ----------------------
// Tailwind v4 implements gradients, transforms and shadows with registered
// custom properties. `@property` is ignored inside a shadow root, so these
// render as nothing unless the rules are hoisted to the document.
const registered = await page.evaluate(async () => {
  const card = document.createElement('tailwind-template-card')
  document.getElementById('host').appendChild(card)
  card.hass = window.__makeHass()
  card.setConfig({
    parse_jinja: true,
    ignore_line_breaks: true,
    content:
      '<div id="grad" class="h-10 bg-linear-to-r from-emerald-400 to-emerald-600"></div>' +
      '<div id="rot" class="rotate-45 scale-110 shadow-lg">x</div>'
  })

  for (let i = 0; i < 60; i++) {
    await new Promise((r) => setTimeout(r, 50))
    if (card.shadowRoot.querySelector('#grad')) break
  }
  await new Promise((r) => setTimeout(r, 400))

  const grad = card.shadowRoot.querySelector('#grad')
  const rot = card.shadowRoot.querySelector('#rot')
  const rotStyle = rot ? getComputedStyle(rot) : null
  return {
    background: grad ? getComputedStyle(grad).backgroundImage : null,
    // v4 emits the standalone `rotate`/`scale` properties, not `transform`.
    rotate: rotStyle?.rotate ?? null,
    // `scale-*` and `shadow-*` both resolve through registered properties.
    scale: rotStyle?.scale ?? null,
    boxShadow: rotStyle?.boxShadow ?? null
  }
})

check(
  'gradient utilities render (@property hoisted to document)',
  /gradient/.test(registered.background || ''),
  `background-image=${registered.background}`
)
check(
  'rotate utility renders',
  /45deg/.test(registered.rotate || ''),
  `rotate=${registered.rotate}`
)
check(
  'scale utility resolves its registered properties',
  registered.scale && registered.scale !== 'none',
  `scale=${registered.scale}`
)
check(
  'shadow utility resolves its registered properties',
  registered.boxShadow && registered.boxShadow !== 'none',
  `box-shadow=${registered.boxShadow}`
)

// --- HTML tag handling in the config editor --------------------------------
const tags = await page.evaluate(async () => {
  // The pure logic is bundled into the card; drive it through a stub editor
  // that mimics the slice of CodeMirror's API the handler uses.
  const el = document.createElement('tailwind-template-card-config')
  document.getElementById('host').appendChild(el)
  el.hass = window.__makeHass()
  el.setConfig({ content: '' })
  await new Promise((r) => setTimeout(r, 400))

  const makeView = (text, caret) => {
    let doc = text
    let head = caret
    return {
      applied: () => ({ doc, head }),
      state: {
        get doc() {
          return {
            get length() { return doc.length },
            sliceString: (a, b) => doc.slice(a, b),
            lineAt: (pos) => {
              const start = doc.lastIndexOf('\n', pos - 1) + 1
              const end = doc.indexOf('\n', pos)
              return { text: doc.slice(start, end === -1 ? undefined : end) }
            }
          }
        },
        selection: { main: { head, empty: true } }
      },
      dispatch: (spec) => {
        doc = doc.slice(0, spec.changes.from) + spec.changes.insert + doc.slice(spec.changes.to)
        head = spec.selection.anchor
      }
    }
  }

  // Register a stand-in editor so the wrapper mounts and attaches its handler.
  let attached = null
  class FakeCM extends HTMLElement {
    set value(v) { this._value = v }
    get value() { return this._value ?? '' }
  }
  if (!customElements.get('ha-code-editor')) customElements.define('ha-code-editor', FakeCM)

  for (let i = 0; i < 40; i++) {
    await new Promise((r) => setTimeout(r, 50))
    attached = el.shadowRoot.querySelector('ha-code-editor')
    if (attached) break
  }
  if (!attached) return { error: 'editor never mounted' }

  const press = (text, caret, key) => {
    const view = makeView(text, caret)
    attached.codemirror = view
    const ev = new KeyboardEvent('keydown', { key, bubbles: true, composed: true, cancelable: true })
    attached.dispatchEvent(ev)
    return { ...view.applied(), handled: ev.defaultPrevented }
  }

  return {
    closeDiv: press('<div', 4, '>'),
    beforeContent: press('<div<span>x</span>', 4, '>'),
    beforeContentIndented: press('  <div<span>x</span>', 6, '>'),
    beforeNewline: press('<div\n<span>x</span>', 4, '>'),
    voidTag: press('<img', 4, '>'),
    selfClosing: press('<br /', 5, '>'),
    insideAttr: press('<div class="a>b', 15, '>'),
    expand: press('<div></div>', 5, 'Enter'),
    indented: press('  <div></div>', 7, 'Enter'),
    plainEnter: press('hello', 5, 'Enter')
  }
})

if (tags.error) {
  check('config editor mounts for tag tests', false, tags.error)
} else {
  check('typing > closes the tag', tags.closeDiv.doc === '<div></div>' && tags.closeDiv.head === 5,
    `doc=${JSON.stringify(tags.closeDiv.doc)} caret=${tags.closeDiv.head}`)
  check('closing tag pushes following content onto its own line',
    tags.beforeContent.doc === '<div></div>\n<span>x</span>' && tags.beforeContent.head === 5,
    `doc=${JSON.stringify(tags.beforeContent.doc)} caret=${tags.beforeContent.head}`)
  check('pushed content keeps the current indent',
    tags.beforeContentIndented.doc === '  <div></div>\n  <span>x</span>',
    `doc=${JSON.stringify(tags.beforeContentIndented.doc)}`)
  check('no extra line break when one already follows',
    tags.beforeNewline.doc === '<div></div>\n<span>x</span>',
    `doc=${JSON.stringify(tags.beforeNewline.doc)}`)
  check('void elements are not closed', !tags.voidTag.handled, `doc=${JSON.stringify(tags.voidTag.doc)}`)
  check('self-closing tags are left alone', !tags.selfClosing.handled, `doc=${JSON.stringify(tags.selfClosing.doc)}`)
  check('> inside an attribute value is literal', !tags.insideAttr.handled, `doc=${JSON.stringify(tags.insideAttr.doc)}`)
  check('Enter between tags opens them out',
    tags.expand.doc === '<div>\n  \n</div>' && tags.expand.head === 8,
    `doc=${JSON.stringify(tags.expand.doc)} caret=${tags.expand.head}`)
  check('Enter keeps the existing indent',
    tags.indented.doc === '  <div>\n    \n  </div>',
    `doc=${JSON.stringify(tags.indented.doc)}`)
  check('Enter elsewhere is left to CodeMirror', !tags.plainEnter.handled)
}

// --- The editor must not overflow onto the panels below it ----------------
const layout = await page.evaluate(async () => {
  const el = document.createElement('tailwind-template-card-config')
  document.getElementById('host').appendChild(el)
  el.hass = window.__makeHass()
  el.setConfig({ content: '<div class="flex">x</div>' })

  let editor = null
  for (let i = 0; i < 40; i++) {
    await new Promise((r) => setTimeout(r, 50))
    editor = el.shadowRoot.querySelector('ha-code-editor')
    if (editor) break
  }
  if (!editor) return { error: 'editor never mounted' }
  await new Promise((r) => setTimeout(r, 300))

  const wrapper = editor.parentElement
  const wrapperBox = wrapper.getBoundingClientRect()
  const overflowY = getComputedStyle(wrapper).overflowY

  // The Bindings / Actions panels sit after the editor.
  const panels = [...el.shadowRoot.querySelectorAll('[data-panel]')]
  const panelTops = panels.map((p) => p.getBoundingClientRect().top)

  return {
    editorHeight: editor.getBoundingClientRect().height,
    wrapperHeight: wrapperBox.height,
    wrapperBottom: wrapperBox.bottom,
    scrolls: wrapper.scrollHeight > wrapper.clientHeight + 1,
    overflowY,
    panelCount: panels.length,
    firstPanelTop: panelTops.length ? Math.min(...panelTops) : null
  }
})

if (layout.error) {
  check('config editor lays out', false, layout.error)
} else {
  check(
    'tall editor is bounded rather than overflowing',
    layout.wrapperHeight < layout.editorHeight,
    `wrapper=${Math.round(layout.wrapperHeight)} editor=${Math.round(layout.editorHeight)}`
  )
  check('bounded editor scrolls its own content', layout.scrolls,
    `overflow-y=${layout.overflowY} scrollH>clientH=${layout.scrolls}`)
  check(
    'Bindings/Actions sit below the editor, not over it',
    layout.panelCount >= 2 && layout.firstPanelTop >= layout.wrapperBottom - 1,
    `panels=${layout.panelCount} firstTop=${Math.round(layout.firstPanelTop)} editorBottom=${Math.round(layout.wrapperBottom)}`
  )
}

// --- Typing must not be clobbered by the debounced config echo ------------
// Reproduces the reported glitch: characters typed while the debounced config
// update is in flight were lost, and the caret jumped back to the start.
const typing = await page.evaluate(async () => {
  const el = document.createElement('tailwind-template-card-config')
  document.getElementById('host').appendChild(el)
  el.hass = window.__makeHass()
  el.setConfig({ content: '<div class="', debounceChangePeriod: 100 })

  let editor = null
  for (let i = 0; i < 40; i++) {
    await new Promise((r) => setTimeout(r, 50))
    editor = el.shadowRoot.querySelector('ha-code-editor')
    if (editor) break
  }
  if (!editor) return { error: 'editor never mounted' }
  await new Promise((r) => setTimeout(r, 200))

  // The user is in the editor.
  editor.querySelector('.probe-input')?.focus()

  const type = (text) => {
    editor.value = text
    editor.dispatchEvent(new CustomEvent('value-changed', {
      bubbles: true, composed: true, detail: { value: text }
    }))
  }

  // Type "ro" — this is what the debounced update will eventually carry.
  type('<div class="ro')
  // Keep typing before the debounce fires, exactly as a person would.
  await new Promise((r) => setTimeout(r, 20))
  editor.value = '<div class="rounded-3xl'

  // Let the debounce land and the config echo back through props.
  await new Promise((r) => setTimeout(r, 500))

  const afterTyping = editor.value

  // With focus elsewhere, an external config change should still be adopted —
  // that is what this effect exists for.
  editor.querySelector('.probe-input')?.blur()
  el.setConfig({ content: '<p>loaded from elsewhere</p>', debounceChangePeriod: 100 })
  await new Promise((r) => setTimeout(r, 400))

  return { value: afterTyping, adopted: editor.value }
})

if (typing.error) {
  check('typing test mounts', false, typing.error)
} else {
  check(
    'keystrokes survive the debounced config round-trip',
    typing.value === '<div class="rounded-3xl',
    `editor value=${JSON.stringify(typing.value)}`
  )
  check(
    'external config changes are still adopted when not focused',
    typing.adopted === '<p>loaded from elsewhere</p>',
    `editor value=${JSON.stringify(typing.adopted)}`
  )
}

// --- `bare` strips Home Assistant's card chrome ---------------------------
const bare = await page.evaluate(async () => {
  const mount = async (config) => {
    const card = document.createElement('tailwind-template-card')
    document.getElementById('host').appendChild(card)
    card.hass = window.__makeHass()
    card.setConfig({ parse_jinja: true, ignore_line_breaks: true,
                     content: '<div class="flex">x</div>', ...config })
    for (let i = 0; i < 60; i++) {
      await new Promise((r) => setTimeout(r, 50))
      if (card.shadowRoot.querySelector('ha-card')) break
    }
    await new Promise((r) => setTimeout(r, 200))
    const haCard = card.shadowRoot.querySelector('ha-card')
    return haCard ? {
      background: haCard.style.getPropertyValue('--ha-card-background'),
      shadow: haCard.style.getPropertyValue('--ha-card-box-shadow'),
      borderWidth: haCard.style.getPropertyValue('--ha-card-border-width'),
      radius: haCard.style.getPropertyValue('--ha-card-border-radius')
    } : null
  }
  return { on: await mount({ bare: true }), off: await mount({ bare: false }) }
})

check('bare: true makes ha-card transparent',
  bare.on?.background === 'transparent' && bare.on?.shadow === 'none' &&
  bare.on?.borderWidth === '0px' && bare.on?.radius === '0px',
  JSON.stringify(bare.on))
check('bare: false leaves ha-card untouched',
  bare.off?.background === '' && bare.off?.shadow === '',
  JSON.stringify(bare.off))

// --- Config editor must not leak listeners or skip debouncing -------------
// Home Assistant closes the loop: it listens for `config-changed` from the
// config element and calls `setConfig` straight back. Without that round-trip
// wired up, the failure does not appear at all.
const leak = await page.evaluate(async () => {
  // Every listener the editor puts on the document, whatever it is for.
  const counts = { received: 0 }
  const realAdd = document.addEventListener.bind(document)
  document.addEventListener = (type, ...rest) => {
    counts.received++
    return realAdd(type, ...rest)
  }

  let changedEvents = 0
  const el = document.createElement('tailwind-template-card-config')
  document.getElementById('host').appendChild(el)

  // This is what Home Assistant does with the event the card emits.
  el.addEventListener('config-changed', (e) => {
    changedEvents++
    el.setConfig(e.detail.config)
  })

  el.hass = window.__makeHass()
  el.setConfig({ content: 'x', debounceChangePeriod: 100 })

  let editor = null
  for (let i = 0; i < 40; i++) {
    await new Promise((r) => setTimeout(r, 50))
    editor = el.shadowRoot.querySelector('ha-code-editor')
    if (editor) break
  }
  await new Promise((r) => setTimeout(r, 200))
  const afterMount = counts.received

  editor.querySelector('.probe-input')?.focus()
  for (let i = 0; i < 10; i++) {
    const text = 'x'.repeat(i + 2)
    editor.value = text
    editor.dispatchEvent(new CustomEvent('value-changed', {
      bubbles: true, composed: true, detail: { value: text }
    }))
    await new Promise((r) => setTimeout(r, 15))
  }
  await new Promise((r) => setTimeout(r, 800))

  document.addEventListener = realAdd
  return {
    afterMount,
    afterTyping: counts.received,
    changedEvents,
    channelListeners: el._channel.size
  }
})

console.log(`  [data] document listeners: ${leak.afterMount} at mount -> ${leak.afterTyping} after 10 keystrokes`)
console.log(`  [data] config-changed round-trips: ${leak.changedEvents}`)

check(
  'config listeners do not accumulate while typing',
  leak.afterTyping - leak.afterMount <= 1,
  `mount=${leak.afterMount} after=${leak.afterTyping}`
)
check('the editor tree holds one config subscription', leak.channelListeners === 1,
  `listeners=${leak.channelListeners}`)
check(
  'rapid keystrokes are debounced into few config updates',
  leak.changedEvents <= 3,
  `${leak.changedEvents} round-trips for 10 keystrokes`
)

// --- Opening the editor repeatedly must not accumulate listeners ----------
// The reported symptom was that the editor degraded "after using it for a
// while" and needed a page reload, which is what a per-session leak looks like.
const sessions = await page.evaluate(async () => {
  // Live document listeners, of any type, and the editors' channels.
  const counts = { live: 0, channels: 0 }
  const realAdd = document.addEventListener.bind(document)
  const realRemove = document.removeEventListener.bind(document)
  document.addEventListener = (type, ...rest) => {
    counts.live++
    return realAdd(type, ...rest)
  }
  document.removeEventListener = (type, ...rest) => {
    counts.live--
    return realRemove(type, ...rest)
  }

  const openClose = async () => {
    const el = document.createElement('tailwind-template-card-config')
    document.getElementById('host').appendChild(el)
    el.addEventListener('config-changed', (e) => el.setConfig(e.detail.config))
    el.hass = window.__makeHass()
    el.setConfig({ content: '<div>x</div>', debounceChangePeriod: 100 })
    for (let i = 0; i < 30; i++) {
      await new Promise((r) => setTimeout(r, 50))
      if (el.shadowRoot.querySelector('ha-code-editor')) break
    }
    await new Promise((r) => setTimeout(r, 150))
    el.remove()
    await new Promise((r) => setTimeout(r, 150))
    counts.channels += el._channel.size
  }

  await openClose()
  const afterOne = { ...counts }
  for (let i = 0; i < 5; i++) await openClose()
  const afterSix = { ...counts }

  document.addEventListener = realAdd
  document.removeEventListener = realRemove
  return { afterOne, afterSix }
})

console.log(`  [data] live document listeners after 1 session: ${sessions.afterOne.live}, after 6: ${sessions.afterSix.live}`)

check(
  'closing the editor releases its listeners',
  sessions.afterSix.live <= sessions.afterOne.live && sessions.afterSix.channels === 0,
  `1 session -> ${JSON.stringify(sessions.afterOne)}, 6 sessions -> ${JSON.stringify(sessions.afterSix)}`
)

// --- Bindings / Actions panels ---------------------------------------------
// The panels used to be a fixed-height, column-flowing grid: every row got an
// ~85px track while its own contents needed at least 136px, so rows painted
// over each other, and a fourth rule started a column reachable only by
// scrolling sideways.
const MARKUP = [
  '<div class="flex">',
  '  <button data-toggle="fan.cooling_fan" data-more="fan.cooling_fan">Fan</button>',
  '  <button data-media="media_play_pause" data-player="media_player.study">Play</button>',
  '  <span id="clock">12:00</span>',
  '</div>'
].join('\n')

const panels = await page.evaluate(async (content) => {
  const el = document.createElement('tailwind-template-card-config')
  el.style.display = 'block'
  el.style.width = '760px'
  document.getElementById('host').appendChild(el)
  el.hass = window.__makeHass()
  el.addEventListener('config-changed', (e) => el.setConfig(e.detail.config))
  el.setConfig({
    content,
    // A type the user never chose: the old uncontrolled select showed "click"
    // for this, so the action looked configured and was silently skipped.
    actions: [
      { selector: '[data-toggle]', type: '', call: 'moreInfo("fan.cooling_fan")' },
      { selector: '[data-more]', type: 'hold', call: 'moreInfo(this.dataset.more)' },
      { selector: '[data-media]', type: 'click', call: "hass.callService('media_player', this.dataset.media, { entity_id: this.dataset.player })" }
    ],
    bindings: [{ selector: '.temp', type: 'text', bind: 'return state' }]
  })

  for (let i = 0; i < 60; i++) {
    await new Promise((r) => setTimeout(r, 50))
    if (el.shadowRoot.querySelector('[data-rule]')) break
  }
  await new Promise((r) => setTimeout(r, 400))

  const actions = el.shadowRoot.querySelector('[data-panel="actions"]')
  if (!actions) return { error: 'actions panel never rendered' }

  const rows = [...actions.querySelectorAll('[data-rule]')]
  const measure = (node) => {
    const box = node.getBoundingClientRect()
    return {
      top: Math.round(box.top),
      bottom: Math.round(box.bottom),
      left: Math.round(box.left),
      right: Math.round(box.right),
      // The old row was a fixed grid track: 277px of content in a 157px box,
      // with `overflow: visible`, so it painted over the row below.
      spill: node.scrollHeight - node.clientHeight
    }
  }

  // Expand every row: the worst case for the old layout was an open row.
  rows.forEach((row) => row.querySelector('button[aria-expanded]').click())
  await new Promise((r) => setTimeout(r, 400))

  const boxes = [...actions.querySelectorAll('[data-rule]')].map(measure)
  let overlaps = 0
  for (let i = 0; i < boxes.length; i++) {
    for (let j = i + 1; j < boxes.length; j++) {
      const a = boxes[i]
      const b = boxes[j]
      if (a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom) overlaps++
    }
  }

  const first = actions.querySelector('[data-rule]')
  const select = first.querySelector('select')
  const chips = [...actions.querySelectorAll('.btn-xs')].map((b) =>
    b.textContent.trim()
  )
  const listId = first.querySelector('input[list]')?.getAttribute('list')
  const options = listId
    ? [...el.shadowRoot.querySelectorAll(`#${listId} option`)].map((o) => o.value)
    : []

  return {
    rowCount: boxes.length,
    overlaps,
    maxSpill: Math.max(...boxes.map((b) => b.spill)),
    hScroll: actions.scrollWidth > actions.clientWidth + 1,
    fullWidth: boxes.every((b) => b.right - b.left > 400),
    selectValue: select.value,
    incomplete: first.getAttribute('data-incomplete'),
    warns: /won/i.test(first.textContent),
    chips,
    options,
    // Collapsed rows must not mount an editor of their own.
    editorsWhenOpen: actions.querySelectorAll('ha-code-editor, textarea').length,
    el: (window.__panelEl = el) && true
  }
}, MARKUP)

if (panels.error) {
  check('bindings/actions panels render', false, panels.error)
} else {
  check('every rule row is visible at once', panels.rowCount === 3, `rows=${panels.rowCount}`)
  check('expanded rows do not overlap each other', panels.overlaps === 0, `overlaps=${panels.overlaps}`)
  check(
    'a row is as tall as its contents',
    panels.maxSpill <= 1,
    `content overflows row by ${panels.maxSpill}px`
  )
  check('panels never scroll sideways', !panels.hScroll)
  check('rows use the full panel width', panels.fullWidth)
  check(
    'an unset event reads as unset, not as "click"',
    panels.selectValue === '',
    `select=${JSON.stringify(panels.selectValue)}`
  )
  check(
    'an action that cannot run is flagged',
    panels.incomplete === 'true' && panels.warns,
    `data-incomplete=${panels.incomplete} warns=${panels.warns}`
  )
  check(
    'selector autocomplete is built from the markup',
    ['[data-toggle]', '[data-more]', '[data-media]', '#clock'].every((s) =>
      panels.options.includes(s)
    ),
    `options=${panels.options.join(' ')}`
  )
}

// --- Suggested actions ------------------------------------------------------
// Markup carrying a data attribute that no action answers is the failure this
// surfaces: the control renders, colours itself from state, and does nothing.
const suggested = await page.evaluate(async (content) => {
  const el = document.createElement('tailwind-template-card-config')
  document.getElementById('host').appendChild(el)
  el.hass = window.__makeHass()

  let latest = null
  el.addEventListener('config-changed', (e) => {
    latest = e.detail.config
    el.setConfig(e.detail.config)
  })
  el.setConfig({ content, actions: [], bindings: [] })

  for (let i = 0; i < 60; i++) {
    await new Promise((r) => setTimeout(r, 50))
    if (el.shadowRoot.querySelector('[data-panel="actions"] .btn-xs')) break
  }
  await new Promise((r) => setTimeout(r, 300))

  const actions = el.shadowRoot.querySelector('[data-panel="actions"]')
  const chips = [...actions.querySelectorAll('.btn-xs')]
  const labels = chips.map((c) => c.textContent.trim())

  const toggle = chips.find((c) => c.textContent.includes('data-toggle'))
  toggle?.click()
  await new Promise((r) => setTimeout(r, 300))

  return {
    labels,
    added: latest?.actions ?? [],
    // Adding it should retire its own chip.
    remaining: [...actions.querySelectorAll('.btn-xs')].map((c) =>
      c.textContent.trim()
    )
  }
}, MARKUP)

check(
  'unhandled data attributes are offered as actions',
  ['data-toggle', 'data-more', 'data-media'].every((a) =>
    suggested.labels.some((l) => l.includes(a))
  ),
  `chips=${suggested.labels.join(' | ')}`
)
check(
  'attributes an action reads are not offered as triggers',
  !suggested.labels.some((l) => l.includes('data-player')),
  `chips=${suggested.labels.join(' | ')}`
)
check(
  'accepting a suggestion writes a complete action',
  suggested.added.length === 1 &&
    suggested.added[0].selector === '[data-toggle]' &&
    suggested.added[0].type === 'click' &&
    suggested.added[0].call.includes('dataset.toggle'),
  JSON.stringify(suggested.added)
)
check(
  'an accepted suggestion stops being offered',
  !suggested.remaining.some((l) => l.includes('data-toggle')),
  `chips=${suggested.remaining.join(' | ')}`
)

// Errors a test provokes on purpose are removed from the console log, so the
// final "no console errors" check still catches everything else.
const dropExpectedErrors = (pattern) => {
  for (let i = consoleErrors.length - 1; i >= 0; i--) {
    if (pattern.test(consoleErrors[i])) consoleErrors.splice(i, 1)
  }
}

// --- Class bindings follow state instead of accumulating -------------------
// A binding-only update (no new template render) used to add the new class
// beside the old one, and never compiled it, so the card stayed on its first
// state.
const swap = await page.evaluate(async () => {
  const card = document.createElement('tailwind-template-card')
  document.getElementById('host').appendChild(card)
  const base = window.__makeHass()
  const withState = (state) => ({
    ...base,
    states: {
      ...base.states,
      'light.living_room': { entity_id: 'light.living_room', state, attributes: {} }
    }
  })
  card.hass = withState('on')
  card.setConfig({
    entity: 'light.living_room',
    content: '<div id="swap" class="h-4">x</div>',
    bindings: [{
      selector: '#swap',
      type: 'class',
      bind: "return state === 'on' ? 'bg-amber-400' : 'bg-sky-700'"
    }]
  })

  const on = await window.__waitFor(() => card.shadowRoot.querySelector('#swap.bg-amber-400'))
  await window.__waitFor(() => getComputedStyle(on).backgroundColor !== 'rgba(0, 0, 0, 0)')
  const onBg = getComputedStyle(on).backgroundColor

  card.hass = withState('off')
  const off = await window.__waitFor(() => card.shadowRoot.querySelector('#swap.bg-sky-700'))
  await window.__waitFor(() => getComputedStyle(off).backgroundColor !== onBg).catch(() => null)

  return { classes: off.className, onBg, offBg: getComputedStyle(off).backgroundColor }
})

check('a class binding replaces the class it added last time',
  swap.classes === 'h-4 bg-sky-700', `classes=${swap.classes}`)
check('a class first introduced by a state change is compiled',
  swap.offBg !== swap.onBg && swap.offBg !== 'rgba(0, 0, 0, 0)',
  `on=${swap.onBg} off=${swap.offBg}`)

// --- Bindings tolerate bad input ------------------------------------------
const tolerant = await page.evaluate(async () => {
  const card = document.createElement('tailwind-template-card')
  document.getElementById('host').appendChild(card)
  card.hass = window.__makeHass()
  card.setConfig({
    content: '<div id="multi">m</div><div id="later">-</div>',
    bindings: [
      // Half-typed in the editor: querySelectorAll throws on this.
      { selector: '[data-', type: 'text', bind: "return 'never'" },
      { selector: '#multi', type: 'class', bind: "return 'text-red-500 font-bold'" },
      { selector: '#later', type: 'text', bind: "return 'ran'" }
    ]
  })
  const later = await window.__waitFor(() => {
    const el = card.shadowRoot.querySelector('#later')
    return el?.textContent === 'ran' && el
  }).catch(() => card.shadowRoot.querySelector('#later'))
  return {
    multi: card.shadowRoot.querySelector('#multi')?.className,
    later: later?.textContent
  }
})

check('a class binding may return several classes',
  tolerant.multi === 'text-red-500 font-bold', `class=${JSON.stringify(tolerant.multi)}`)
check('an invalid selector does not stop the other bindings',
  tolerant.later === 'ran', `text=${JSON.stringify(tolerant.later)}`)

// --- One failing action does not stop the others --------------------------
const failing = await page.evaluate(async () => {
  window.__lastServiceCall = null
  const card = document.createElement('tailwind-template-card')
  document.getElementById('host').appendChild(card)
  card.hass = window.__makeHass()
  card.setConfig({
    content: '<div id="act">go</div>',
    actions: [
      { selector: '[data-', type: 'click', call: 'throw new Error("never")' },
      { selector: '#act', type: 'click', call: 'throw new Error("deliberate")' },
      { selector: '#act', type: 'click', call: "hass.callService('light', 'toggle', {})" }
    ]
  })
  const act = await window.__waitFor(() => card.shadowRoot.querySelector('#act'))
  act.click()
  return window.__lastServiceCall
})
dropExpectedErrors(/action on "#act" failed/)

check('a throwing action does not stop the actions after it',
  failing?.service === 'toggle', JSON.stringify(failing))

// --- Template errors are shown, and clear once fixed -----------------------
const templateError = await page.evaluate(async () => {
  const card = document.createElement('tailwind-template-card')
  document.getElementById('host').appendChild(card)
  card.hass = window.__makeHass()
  card.setConfig({ content: '<div id="good">good</div>' })
  await window.__waitFor(() => card.shadowRoot.querySelector('#good'))
  const sub = window.__templates.at(-1)

  sub.cb({ error: "UndefinedError: 'nope' is undefined", level: 'ERROR' })
  const alert = await window.__waitFor(() => card.shadowRoot.querySelector('ha-alert')).catch(() => null)
  const shown = {
    message: alert?.textContent ?? null,
    keptContent: Boolean(card.shadowRoot.querySelector('#good'))
  }

  sub.cb({ error: 'just a warning', level: 'WARNING' })
  await new Promise((r) => setTimeout(r, 100))
  const afterWarning = card.shadowRoot.querySelector('ha-alert')?.textContent ?? null

  sub.cb({ result: '<div id="fixed">fixed</div>' })
  await window.__waitFor(() => card.shadowRoot.querySelector('#fixed'))
  return { ...shown, afterWarning, cleared: !card.shadowRoot.querySelector('ha-alert') }
})
dropExpectedErrors(/template error/)

check('a template error is shown in the card',
  /nope/.test(templateError.message ?? ''), `alert=${JSON.stringify(templateError.message)}`)
check('the last good render stays up beside the error', templateError.keptContent)
check('a template warning does not replace the error banner with itself',
  !/warning/.test(templateError.afterWarning ?? ''), `alert=${JSON.stringify(templateError.afterWarning)}`)
check('the error clears once the template renders again', templateError.cleared)

// --- Partial plugin configs ------------------------------------------------
const partial = await page.evaluate(async () => {
  const card = document.createElement('tailwind-template-card')
  document.getElementById('host').appendChild(card)
  card.hass = window.__makeHass()
  card.setConfig({ content: '<div id="partial">p</div>', plugins: {} })
  return Boolean(await window.__waitFor(() => card.shadowRoot.querySelector('#partial')).catch(() => null))
})
check('`plugins: {}` still renders', partial)

// --- ignore_line_breaks: false never touches the template ------------------
const breaks = await page.evaluate(async () => {
  const card = document.createElement('tailwind-template-card')
  document.getElementById('host').appendChild(card)
  card.hass = window.__makeHass()
  const content = '{% if true and\n   true %}<b id="lb">a</b>\nb{% endif %}'
  card.setConfig({ content, ignore_line_breaks: false })
  await window.__waitFor(() => card.shadowRoot.querySelector('#lb'))
  const container = card.shadowRoot.querySelector('ha-card > div')
  return {
    sent: window.__templates.at(-1).msg.template,
    content,
    breaks: container.querySelectorAll('br').length
  }
})
check('line breaks are not injected into the Jinja template',
  breaks.sent === breaks.content, `template=${JSON.stringify(breaks.sent)}`)
check('line breaks become <br> in the rendered output', breaks.breaks === 2, `br count=${breaks.breaks}`)

// --- Config changes that leave the content alone still repaint ------------
const repaint = await page.evaluate(async () => {
  const card = document.createElement('tailwind-template-card')
  document.getElementById('host').appendChild(card)
  card.hass = window.__makeHass()
  card.setConfig({ content: '<div id="rp">x</div>' })
  const haCard = await window.__waitFor(() => card.shadowRoot.querySelector('#rp') && card.shadowRoot.querySelector('ha-card'))
  card.setConfig({ content: '<div id="rp">x</div>', bare: true })
  await window.__waitFor(() => haCard.style.getPropertyValue('--ha-card-background')).catch(() => null)
  return haCard.style.getPropertyValue('--ha-card-background')
})
check('toggling `bare` without editing content takes effect', repaint === 'transparent', `background=${JSON.stringify(repaint)}`)

// --- Updates morph the DOM in place --------------------------------------
const morph = await page.evaluate(async () => {
  const card = document.createElement('tailwind-template-card')
  document.getElementById('host').appendChild(card)
  card.hass = window.__makeHass()
  card.setConfig({ content: '<div><input id="field" /><span id="txt">one</span></div>' })
  const field = await window.__waitFor(() => card.shadowRoot.querySelector('#field'))
  const sub = window.__templates.at(-1)

  // Something else in the shadow root, as card-mod injects.
  const extra = document.createElement('style')
  extra.id = 'extra'
  card.shadowRoot.appendChild(extra)

  field.focus()
  field.value = 'typed'

  sub.cb({ result: '<div><input id="field" /><span id="txt">two</span></div>' })
  await window.__waitFor(() => card.shadowRoot.querySelector('#txt')?.textContent === 'two')

  return {
    sameNode: card.shadowRoot.querySelector('#field') === field,
    value: card.shadowRoot.querySelector('#field').value,
    focused: card.shadowRoot.activeElement === field,
    extraKept: Boolean(card.shadowRoot.querySelector('#extra'))
  }
})
check('an update keeps unchanged elements (morph, not replace)', morph.sameNode)
check('a focused input keeps what was typed across an update', morph.value === 'typed', `value=${JSON.stringify(morph.value)}`)
check('focus survives an update', morph.focused)
check('other nodes in the shadow root survive an update', morph.extraKept)

const transition = await page.evaluate(async () => {
  const card = document.createElement('tailwind-template-card')
  document.getElementById('host').appendChild(card)
  card.hass = window.__makeHass()
  const bar = (w) => `<div class="w-[400px]"><div id="bar" class="h-2 ${w} transition-all duration-1000 ease-linear"></div></div>`
  card.setConfig({ content: bar('w-1/4') })
  const el = await window.__waitFor(() => card.shadowRoot.querySelector('#bar'))
  await window.__waitFor(() => el.getBoundingClientRect().width === 100)
  // Compile the target class first so only the transition is being measured.
  await card.applyStyles(['w-3/4'])

  window.__templates.at(-1).cb({ result: bar('w-3/4') })
  await window.__waitFor(() => card.shadowRoot.querySelector('#bar').classList.contains('w-3/4'))
  await new Promise((r) => setTimeout(r, 300))
  return card.shadowRoot.querySelector('#bar').getBoundingClientRect().width
})
check('a state-driven width change animates instead of jumping',
  transition > 100 && transition < 300, `width 300ms in=${transition}`)

// --- The theme follows Home Assistant --------------------------------------
const theme = await page.evaluate(async () => {
  const withMode = (darkMode) => ({ ...window.__makeHass(), themes: { darkMode } })
  const mount = async (config, hass) => {
    const card = document.createElement('tailwind-template-card')
    document.getElementById('host').appendChild(card)
    card.hass = hass
    card.setConfig({ content: '<div class="themed">t</div>', ...config })
    await window.__waitFor(() => card.shadowRoot.querySelector('.themed'))
    return card
  }
  const themeOf = (card) => card.shadowRoot.querySelector('ha-card > div').getAttribute('data-theme')

  const follows = await mount({}, withMode(true))
  const darkAtFirst = themeOf(follows)
  follows.hass = withMode(false)
  await window.__waitFor(() => themeOf(follows) === 'light').catch(() => null)

  const pinned = await mount({ plugins: { daisyui: { theme: 'dark - dark' } } }, withMode(false))
  return { darkAtFirst, afterSwitch: themeOf(follows), pinned: themeOf(pinned) }
})
check('by default the theme follows Home Assistant dark mode', theme.darkAtFirst === 'dark', `theme=${theme.darkAtFirst}`)
check('switching Home Assistant to light mode repaints the card', theme.afterSwitch === 'light', `theme=${theme.afterSwitch}`)
check('an explicitly chosen theme is kept', theme.pinned === 'dark', `theme=${theme.pinned}`)

// --- Cards share their stylesheets -----------------------------------------
const shared = await page.evaluate(async () => {
  const cards = []
  for (let i = 0; i < 2; i++) {
    const card = document.createElement('tailwind-template-card')
    document.getElementById('host').appendChild(card)
    card.hass = window.__makeHass()
    card.setConfig({ content: `<div id="s${i}" class="flex">s</div>` })
    cards.push(card)
  }
  await window.__waitFor(() => cards.every((c) => c.shadowRoot.adoptedStyleSheets.length === 2))
  const [a, b] = cards.map((c) => c.shadowRoot.adoptedStyleSheets)
  return a[0] === b[0] && a[1] === b[1]
})
check('cards with the same plugins adopt the same stylesheets', shared)

// --- Keyboard activation ---------------------------------------------------
const keyboard = await page.evaluate(async () => {
  window.__lastServiceCall = null
  const card = document.createElement('tailwind-template-card')
  document.getElementById('host').appendChild(card)
  card.hass = window.__makeHass()
  card.setConfig({
    content: '<div id="kb" role="button" tabindex="0">k</div><div id="plain">p</div>',
    actions: [{ selector: '#kb, #plain', type: 'click', call: "hass.callService('light', 'toggle', { via: this.id })" }]
  })
  const kb = await window.__waitFor(() => card.shadowRoot.querySelector('#kb'))
  const press = (el, key) =>
    el.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, composed: true, cancelable: true }))

  press(card.shadowRoot.querySelector('#plain'), 'Enter')
  const plain = window.__lastServiceCall
  press(kb, 'Enter')
  const enter = window.__lastServiceCall?.data?.via
  window.__lastServiceCall = null
  press(kb, ' ')
  const space = window.__lastServiceCall?.data?.via
  return { plain, enter, space }
})
check('Enter on a role="button" element fires its click action', keyboard.enter === 'kb', JSON.stringify(keyboard))
check('Space does too', keyboard.space === 'kb', JSON.stringify(keyboard))
check('elements that did not opt in ignore the keyboard', keyboard.plain === null, JSON.stringify(keyboard))

// --- Config validation and stub ------------------------------------------
const validation = await page.evaluate(() => {
  const card = document.createElement('tailwind-template-card')
  const attempt = (config) => {
    try { card.setConfig(config); return null } catch (e) { return e.message }
  }
  return {
    bindings: attempt({ content: 'x', bindings: 'nope' }),
    content: attempt({ content: 42 }),
    rule: attempt({ content: 'x', actions: ['click'] }),
    valid: attempt({ content: 'x' }),
    stub: customElements.get('tailwind-template-card').getStubConfig()
  }
})
check('setConfig rejects a non-list `bindings`', /bindings/.test(validation.bindings ?? ''), validation.bindings)
check('setConfig rejects non-string `content`', /content/.test(validation.content ?? ''), validation.content)
check('setConfig rejects a rule that is not a mapping', /actions/.test(validation.rule ?? ''), validation.rule)
check('a valid config is accepted', validation.valid === null, validation.valid)
check('the stub config holds only the content',
  JSON.stringify(Object.keys(validation.stub)) === '["content"]', JSON.stringify(Object.keys(validation.stub)))

// --- The editor keeps a config that arrives before anything else ----------
const early = await page.evaluate(async () => {
  const el = document.createElement('tailwind-template-card-config')
  document.getElementById('host').appendChild(el)
  // No hass yet, and no frame between construction and setConfig.
  el.setConfig({ content: '<p>mine</p>', actions: [{ selector: '#a', type: 'click', call: 'x' }] })
  await window.__waitFor(() => el.shadowRoot.querySelector('[data-rule]')).catch(() => null)
  return {
    rules: el.shadowRoot.querySelectorAll('[data-rule]').length,
    content: el.shadowRoot.querySelector('textarea')?.value ?? el.shadowRoot.querySelector('ha-code-editor')?.value
  }
})
check('the editor keeps a config set before hass arrives',
  early.rules === 1 && early.content === '<p>mine</p>', JSON.stringify(early))

// --- The editor writes back only what changed ------------------------------
const written = await page.evaluate(async () => {
  const el = document.createElement('tailwind-template-card-config')
  document.getElementById('host').appendChild(el)
  let latest = null
  el.addEventListener('config-changed', (e) => {
    latest = e.detail.config
    el.setConfig(e.detail.config)
  })
  el.hass = window.__makeHass()
  el.setConfig({ type: 'custom:tailwind-template-card', content: '<p>a</p>', debounceChangePeriod: 50 })

  const editor = await window.__waitFor(() => el.shadowRoot.querySelector('ha-code-editor'))
  editor.value = '<p>b</p>'
  editor.dispatchEvent(new CustomEvent('value-changed', {
    bubbles: true, composed: true, detail: { value: '<p>b</p>' }
  }))
  await window.__waitFor(() => latest?.content === '<p>b</p>')
  return latest
})
check('the editor writes back only non-default options',
  JSON.stringify(Object.keys(written).sort()) === '["content","debounceChangePeriod","type"]',
  JSON.stringify(written))

// --- The editor's entity picker is Home Assistant's, with live hass --------
const picker = await page.evaluate(async () => {
  if (!customElements.get('ha-entity-picker')) {
    customElements.define('ha-entity-picker', class extends HTMLElement {})
  }
  const el = document.createElement('tailwind-template-card-config')
  document.getElementById('host').appendChild(el)
  let latest = null
  el.addEventListener('config-changed', (e) => {
    latest = e.detail.config
    el.setConfig(e.detail.config)
  })
  const first = window.__makeHass()
  el.hass = first
  el.setConfig({ content: 'x' })

  const tab = await window.__waitFor(() =>
    [...el.shadowRoot.querySelectorAll('[role="tab"]')].find((t) => t.textContent === 'Tweaks'))
  tab.click()
  const node = await window.__waitFor(() => el.shadowRoot.querySelector('ha-entity-picker'))
  const sawFirst = node.hass === first

  const second = window.__makeHass()
  el.hass = second
  await window.__waitFor(() => node.hass === second).catch(() => null)
  const sawSecond = node.hass === second

  node.dispatchEvent(new CustomEvent('value-changed', { detail: { value: 'light.living_room' } }))
  await window.__waitFor(() => latest?.entity === 'light.living_room').catch(() => null)
  return { sawFirst, sawSecond, entity: latest?.entity ?? null, tabIsButton: tab.tagName === 'BUTTON' }
})
check('editor tabs are buttons', picker.tabIsButton)
check('the entity picker is Home Assistant\'s ha-entity-picker', picker.sawFirst)
check('the entity picker receives each new hass', picker.sawSecond)
check('picking an entity updates the config', picker.entity === 'light.living_room', `entity=${picker.entity}`)

// --- A card given hass while detached still goes live once attached --------
// Home Assistant sets `hass` on cards it has not attached yet: a conditional
// card holds its child detached while the condition is false, and keeps
// passing it state. The fixture's stub pushes a result before the subscribe
// promise settles; real Home Assistant settles first and pushes after, and
// stops pushing once unsubscribed. This stub does the same.
const detached = await page.evaluate(async () => {
  const live = new Set()
  const realisticHass = (temperature) => {
    const hass = window.__makeHass()
    hass.states = {
      ...hass.states,
      'sensor.living_room_temperature': {
        entity_id: 'sensor.living_room_temperature',
        state: String(temperature),
        attributes: {}
      }
    }
    hass.connection = {
      subscribeMessage: (cb, msg) =>
        new Promise((resolve) => setTimeout(() => {
          const sub = { cb, msg }
          live.add(sub)
          resolve(() => live.delete(sub))
          setTimeout(() => live.has(sub) && cb({
            result: msg.template.replace('TEMP', temperature),
            listeners: { all: false, domains: [], entities: ['sensor.living_room_temperature'], time: false }
          }), 5)
        }, 5))
    }
    return hass
  }
  const content = '<p id="t">TEMP</p><!-- sensor.living_room_temperature -->'
  const text = (card) => card.shadowRoot.querySelector('#t')?.textContent ?? null

  // Created, configured and given hass before it is ever attached.
  const card = document.createElement('tailwind-template-card')
  card.setConfig({ content })
  card.hass = realisticHass(20)
  await new Promise((r) => setTimeout(r, 60))
  document.getElementById('host').appendChild(card)
  await window.__waitFor(() => text(card) === '20').catch(() => null)
  const firstAttach = { text: text(card), live: live.size }

  // Hidden, state changes while hidden, shown again.
  card.remove()
  card.hass = realisticHass(21)
  await new Promise((r) => setTimeout(r, 60))
  document.getElementById('host').appendChild(card)
  await window.__waitFor(() => text(card) === '21').catch(() => null)
  const reattach = { text: text(card), live: live.size }

  card.remove()
  await new Promise((r) => setTimeout(r, 30))
  return { firstAttach, reattach, afterRemove: live.size }
})
check('a card given hass before it is attached subscribes once attached',
  detached.firstAttach.text === '20' && detached.firstAttach.live === 1,
  JSON.stringify(detached.firstAttach))
check('a card shown again after a hidden state change resubscribes',
  detached.reattach.text === '21' && detached.reattach.live === 1,
  JSON.stringify(detached.reattach))
check('a removed card holds no subscription', detached.afterRemove === 0,
  `live=${detached.afterRemove}`)

// --- An open editor only listens to its own card ---------------------------
// A stack's preview renders every child card, and each one is configured
// while the editor for just one of them is open.
const crosstalk = await page.evaluate(async () => {
  const el = document.createElement('tailwind-template-card-config')
  document.getElementById('host').appendChild(el)
  const written = []
  el.addEventListener('config-changed', (e) => {
    written.push(e.detail.config.content)
    el.setConfig(e.detail.config)
  })
  el.hass = window.__makeHass()
  el.setConfig({ content: '<p>mine</p>' })
  const editor = await window.__waitFor(() => el.shadowRoot.querySelector('ha-code-editor'))

  const sibling = document.createElement('tailwind-template-card')
  document.getElementById('host').appendChild(sibling)
  sibling.hass = window.__makeHass()
  sibling.setConfig({ content: '<p>someone else</p>' })
  await new Promise((r) => setTimeout(r, 200))
  const shown = editor.value

  // An unrelated option changed in the editor writes back the whole config.
  const toggle = el.shadowRoot.querySelector('[role="tab"]:nth-child(2)')
  toggle?.click()
  const checkbox = await window.__waitFor(() => el.shadowRoot.querySelector('input[type="checkbox"]'))
  checkbox.click()
  await window.__waitFor(() => written.length > 0).catch(() => null)

  sibling.remove()
  el.remove()
  return { shown, written: written.at(-1) ?? null }
})
check('another card being configured does not replace the editor\'s content',
  crosstalk.shown === '<p>mine</p>', `editor shows ${JSON.stringify(crosstalk.shown)}`)
check('the editor never writes another card\'s content back',
  crosstalk.written === '<p>mine</p>', `wrote ${JSON.stringify(crosstalk.written)}`)

// --- A cancelled hold does not swallow the next click ----------------------
// A long touch the browser takes over (a scroll, its own context menu) ends in
// `pointercancel`, and no click follows it.
const hold = await page.evaluate(async () => {
  const card = document.createElement('tailwind-template-card')
  document.getElementById('host').appendChild(card)
  const fired = []
  card.hass = window.__makeHass()
  card.setConfig({
    content: '<div id="h" role="button" tabindex="0">h</div>',
    actions: [
      { selector: '#h', type: 'hold', call: "this.dataset.log = (this.dataset.log ?? '') + 'H'" },
      { selector: '#h', type: 'click', call: "this.dataset.log = (this.dataset.log ?? '') + 'C'" }
    ]
  })
  const target = await window.__waitFor(() => card.shadowRoot.querySelector('#h'))
  const rect = target.getBoundingClientRect()
  const opts = { bubbles: true, composed: true, clientX: rect.x + 2, clientY: rect.y + 2 }

  // Hold, released normally: the click that follows belongs to the hold.
  target.dispatchEvent(new PointerEvent('pointerdown', opts))
  await new Promise((r) => setTimeout(r, 600))
  target.dispatchEvent(new PointerEvent('pointerup', opts))
  target.dispatchEvent(new MouseEvent('click', { ...opts, detail: 1 }))
  fired.push(target.dataset.log)

  // Hold, then the browser cancels the pointer: no click follows.
  target.dispatchEvent(new PointerEvent('pointerdown', opts))
  await new Promise((r) => setTimeout(r, 600))
  target.dispatchEvent(new PointerEvent('pointercancel', opts))

  // Later, the keyboard activates it.
  target.focus()
  target.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, composed: true }))
  fired.push(target.dataset.log)

  card.remove()
  return fired
})
check('a completed hold suppresses its own click', hold[0] === 'H', `log=${hold[0]}`)
check('a cancelled hold does not swallow the next keyboard click',
  hold[1] === 'HHC', `log=${hold[1]}`)

check('no console errors', consoleErrors.length === 0, consoleErrors.slice(0, 3).join(' | '))

// --- First card on the dashboard -------------------------------------------
// Home Assistant does not create `window.customCards`; pushing onto it when
// no card had yet threw at load, so the card never reached the card picker.
const firstCard = await browser.newPage()
const firstCardErrors = []
firstCard.on('pageerror', (e) => firstCardErrors.push(String(e)))
await firstCard.goto(`${base}/test/fixture.html?no-registry`)
await firstCard.waitForFunction(() => window.__ready && customElements.get('tailwind-template-card'))
const pickerTypes = await firstCard.evaluate(() =>
  (window.customCards ?? []).map((c) => c.type))
await firstCard.close()

check('loads cleanly when it is the first custom card',
  firstCardErrors.length === 0, firstCardErrors.join(' | '))
check('it then appears in the card picker',
  pickerTypes.includes('tailwind-template-card'), JSON.stringify(pickerTypes))


await browser.close()
server.close()

const failed = results.filter((r) => !r.pass)
console.log(`\n${results.length - failed.length}/${results.length} passed`)
process.exit(failed.length ? 1 : 0)
