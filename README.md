# Tailwind Template Card

A Home Assistant dashboard card that renders HTML styled with Tailwind CSS, with full access to your entities through Jinja templates.

![Example cards built with the Tailwind Template Card](images/cards.png)

```yaml
type: custom:tailwind-template-card
content: |
  <div class="rounded-3xl bg-white/60 p-5 ring-1 ring-black/5 backdrop-blur-xl">
    <div class="text-5xl font-semibold tracking-tight">
      {{ states('sensor.living_room_temperature') | round(0) }}<span class="text-2xl">°C</span>
    </div>
    <div class="text-sm text-zinc-500">Living room</div>
  </div>
```

## Credit where it's due

This is a fork of [**usernein/tailwindcss-template-card**](https://github.com/usernein/tailwindcss-template-card). The original design — rendering Jinja through Home Assistant's template engine, injecting Tailwind into a shadow root, the bindings and actions model — is [usernein](https://github.com/usernein)'s work, and this card would not exist without it. Upstream's last release was November 2023.

This fork modernises the internals and keeps it maintained. It also registers the original `custom:tailwindcss-template-card` type as an alias, so **configurations and community examples written for the original card work here unchanged**.

## Installation

### Via the Marketplace or HACS (recommended)

From Home Assistant 2026.11, HACS is built in as the **Marketplace**, and a separate HACS can no longer be installed. On earlier versions, use HACS.

1. Open the **Marketplace** (or **HACS** before 2026.11).
2. Add `https://github.com/chukwudibarrah/tailwind-template-card` as a **custom repository** with category **Dashboard**. The Marketplace asks you to sign in to GitHub the first time.
3. Find **Tailwind Template Card** in the list and click **Download**.
4. Reload your browser when Home Assistant prompts you.

### Manually

1. Download `tailwind-template-card.js` from the [latest release](https://github.com/chukwudibarrah/tailwind-template-card/releases).
2. Copy it into your Home Assistant `config/www/` folder.
3. Go to **Settings → Dashboards → ⋮ → Resources → Add resource**:
   - URL: `/local/tailwind-template-card.js`
   - Type: **JavaScript module**
4. Reload your browser.

<details>
<summary>YAML-mode dashboards</summary>

```yaml
lovelace:
  resources:
    - url: /local/tailwind-template-card.js
      type: module
```
</details>

## Your first card

Add a card to any dashboard, choose **Manual**, and paste:

```yaml
type: custom:tailwind-template-card
ignore_line_breaks: true
content: |
  <div class="flex items-center gap-4 rounded-2xl bg-zinc-800 p-4 text-white">
    <div class="text-4xl font-bold">{{ states('sun.sun') }}</div>
    <div class="text-sm opacity-60">That's your sun entity</div>
  </div>
```

Swap `sun.sun` for any entity you own and you're away.

> **Tip:** keep `ignore_line_breaks: true` (the default). Without it every newline in your HTML becomes a `<br>`, which will wreck your layout.

## Reading entities and sensors

This is the part people usually get stuck on. There are three ways to get Home Assistant data into a card, and they compose freely.

### 1. Jinja templates — the main one

The `content` is rendered by Home Assistant's own template engine before it reaches the card. Anything that works in **Developer Tools → Template** works here: `states`, `state_attr`, `is_state`, `expand`, filters, loops, conditionals.

```yaml
type: custom:tailwind-template-card
ignore_line_breaks: true
content: |
  <div class="rounded-3xl bg-white/60 p-5 backdrop-blur-xl">

    <!-- a sensor value -->
    <div class="text-5xl font-semibold">
      {{ states('sensor.living_room_temperature') | round(1) }}°C
    </div>

    <!-- an attribute -->
    <div class="text-sm text-zinc-500">
      Humidity {{ state_attr('climate.living_room', 'current_humidity') }}%
    </div>

    <!-- a conditional -->
    <div class="text-sm {{ 'text-green-600' if is_state('binary_sensor.office_presence', 'on') else 'text-zinc-400' }}">
      {{ 'Someone is in' if is_state('binary_sensor.office_presence', 'on') else 'Empty' }}
    </div>

    <!-- a loop over several entities -->
    <div class="mt-3 flex gap-2">
      {% for light in ['light.desk', 'light.shelf', 'light.floor'] %}
        <div class="h-3 w-3 rounded-full {{ 'bg-amber-400' if is_state(light, 'on') else 'bg-zinc-300' }}"></div>
      {% endfor %}
    </div>

    <!-- unavailable entities are worth handling explicitly -->
    <div class="text-xs text-zinc-400">
      {% set power = states('sensor.server_power') %}
      {{ power ~ ' W' if power not in ['unknown', 'unavailable'] else 'No reading' }}
    </div>

  </div>
```

Home Assistant tells the card exactly which entities the template depends on, so it re-renders automatically when any of them change. There is nothing to configure.

### 2. Bindings — update without re-rendering

A binding evaluates a JavaScript expression and applies the result to elements matching a CSS selector. It updates in place rather than re-rendering the whole card, which is useful for values that change rapidly.

The expression is a **function body**, so it needs an explicit `return`.

In scope: `hass`, `config`, `entity`, `state`, `attr`. The last three refer to the card's configured `entity`. `this` is the matched element.

```yaml
type: custom:tailwind-template-card
entity: climate.living_room
content: |
  <div class="flex items-center gap-3">
    <span id="dot" class="h-2 w-2 rounded-full"></span>
    <span id="temp" class="text-4xl font-semibold"></span>
  </div>
bindings:
  - selector: "#temp"
    type: text
    bind: "return hass.states['sensor.living_room_temperature'].state"
  - selector: "#dot"
    type: class
    bind: "return state === 'heat' ? 'bg-orange-400' : 'bg-zinc-300'"
```

`type` may be `text`, `html`, `class`, `checked`, `value`, or any attribute name (`src`, `title`, `style`, …).

A `class` binding may return several classes (`'bg-orange-400 ring-2'`) or nothing. When its value changes, the classes it added last time are removed, so the example above switches between orange and grey rather than collecting both. Classes already in your markup are never removed.

### 3. Actions — make it interactive

Actions run JavaScript when someone interacts with a matching element.

In scope: `hass`, `config`, `entity`, `moreInfo`, `event`. `this` is the element matching the selector.

```yaml
type: custom:tailwind-template-card
entity: light.living_room
content: |
  <div class="flex gap-2">
    <div id="power" class="cursor-pointer rounded-xl bg-zinc-200 px-4 py-2">Toggle</div>
    <div data-scene="scene.evening" class="cursor-pointer rounded-xl bg-zinc-200 px-4 py-2">Evening</div>
    <div id="details" class="cursor-pointer rounded-xl bg-zinc-200 px-4 py-2">Hold me</div>
  </div>
actions:
  - selector: "#power"
    type: click
    call: "entity.toggle()"

  - selector: "[data-scene]"
    type: click
    call: "hass.callService('scene', 'turn_on', { entity_id: this.dataset.scene })"

  - selector: "#details"
    type: hold
    call: "moreInfo('light.living_room')"
```

**Event types:** `click`, `dblclick`, `change`, `input`, `contextmenu`, and `hold` (a press of 500 ms or more — it suppresses the click that would otherwise follow).

**`entity` shorthand.** When the card has an `entity` configured, that entity's services are available as methods:

```yaml
call: "entity.toggle()"
call: "entity.turn_on({ brightness_pct: 40 })"
```

**`moreInfo(entityId?)`** opens Home Assistant's own entity dialog, exactly as built-in cards do. Called with no argument it uses the card's configured `entity`.

**Nested elements just work.** Selectors match with `closest()`, so an action bound to a tile still fires when someone taps an icon or label inside it.

**Keyboard.** Native `<button>`s are reachable and activated from the keyboard already. To make a `<div>` tile behave the same, give it `role="button"` and `tabindex="0"`: Enter and Space then fire its `click` actions.

```html
<div role="button" tabindex="0" data-toggle="light.desk" class="cursor-pointer rounded-xl p-4">Desk</div>
```

**Errors.** An action that throws logs which action failed (event and selector) to the browser console and doesn't stop the others from running. A selector that isn't valid CSS is skipped with a warning.

### When a template is wrong

If Home Assistant can't render the template, the card shows its error above the last version that did render, and clears it once the template works again. Warnings, such as an undefined variable, go to the browser console instead.

### When the card doesn't update

For Jinja content, dependency tracking is automatic.

Entities referenced **only** inside `bindings` or `actions` are found by scanning those expressions. If you build an entity id dynamically, list it explicitly:

```yaml
entities:
  - sensor.built_at_runtime
```

`always_update: true` re-renders on every state change in your whole system. It works, but it's a blunt instrument — prefer `entities`.

## Configuration reference

| Option | Default | Description |
|---|---|---|
| `content` | `''` | The HTML (and Jinja) to render. |
| `entity` | `''` | Primary entity; populates `entity` / `state` / `attr` in bindings and actions. |
| `entities` | `[]` | Extra entities to watch for changes. |
| `parse_jinja` | `true` | Render `content` through Home Assistant's template engine. |
| `ignore_line_breaks` | `true` | When `false`, newlines become `<br>`. |
| `always_update` | `false` | Re-render on every state change. |
| `bare` | `false` | Remove Home Assistant's card background, border, shadow and radius, so your markup provides the whole surface. |
| `bindings` | `[]` | See [Bindings](#2-bindings--update-without-re-rendering). |
| `actions` | `[]` | See [Actions](#3-actions--make-it-interactive). |
| `plugins.daisyui.enabled` | `true` | Compile [daisyUI](https://daisyui.com) components into the card. |
| `plugins.daisyui.themes` | `light --default, dark --prefersdark` | daisyUI theme list. |
| `plugins.daisyui.theme` | `auto` | Theme applied to this card. `auto` follows Home Assistant's light/dark mode; otherwise `<scheme> - <theme>`, e.g. `dark - dracula`. |
| `plugins.daisyui.overrideCardBackground` | `false` | Let daisyUI paint the card background. |

`plugins.daisyui.url` and `plugins.tailwindElements` are accepted but ignored — daisyUI is compiled in rather than fetched from a CDN, and Tailwind Elements was never implemented.

The visual editor writes back only the options you've changed from these defaults, so the card's YAML stays short.

### Light and dark

By default the card follows Home Assistant: daisyUI's `light` theme in light mode, `dark` in dark mode, switching live when Home Assistant does. Pick a specific theme (or use the sun/moon button in the editor) to pin one instead. A theme you set before this default existed — including the `dark - dark` older versions of the editor wrote into every card — is kept as it is; delete it from the YAML or choose "Follow Home Assistant" on the Plugins tab to switch.

If you've changed `plugins.daisyui.themes`, keep `light` and `dark` in the list for `auto` to have themes to switch between.

### Sections dashboards

In a sections view the card defaults to full width, can be resized down to a quarter, and takes its height from its content.

## The config editor

The visual editor uses Home Assistant's own `ha-code-editor`, so it inherits the
frontend's theme, keybindings and entity autocompletion — type `states('` and it
offers your entities. The entity field on the Tweaks tab is Home Assistant's own
entity picker too, once the frontend has loaded it.

That editor ships only `yaml` and `jinja2` CodeMirror languages, with no HTML
mode, so tag handling is added on top:

- Typing `>` after an opening tag closes it — `<div` becomes `<div></div>` with
  the caret in the middle. Void elements (`<br>`, `<img>`, …), self-closing tags
  and a `>` inside an attribute value are left alone. If content follows the
  caret it moves to its own line at the current indent, rather than being left
  butted against the closing tag.
- Pressing Enter between `>` and `</` opens the element out over three lines and
  indents the caret.

Everything else — brackets, quotes, undo — is CodeMirror's own behaviour.

### Bindings and Actions panels

Both panels are a plain vertical list: one row per rule, full width, each row
expanded independently. Rows are collapsed by default and mount no editor until
opened, so a card with a dozen actions costs a dozen headers rather than a dozen
CodeMirror instances.

A rule the card will skip — one missing a selector, a type or its code — is
marked **won't run** in the collapsed row, and the panel header counts how many
are incomplete. The card has always ignored those silently, which is how a
button ends up rendering, colouring itself from state, responding to taps and
doing nothing.

**Suggested actions.** The Actions panel reads the markup in `content` and
offers a one-click action for every `data-*` attribute nothing currently
handles. Known conventions are filled in completely:

| Attribute | Event | Call |
| --- | --- | --- |
| `data-toggle="light.x"` | `click` | `hass.callService('homeassistant', 'toggle', { entity_id: this.dataset.toggle })` |
| `data-more="light.x"` | `hold` | `moreInfo(this.dataset.more)` |
| `data-media="media_play_pause"` | `click` | `hass.callService('media_player', this.dataset.media, { entity_id: this.dataset.player })` |
| `data-climate="up"` | `click` | Steps the target temperature by 0.5° |

Anything else gets its selector and `click` filled in, and leaves the code to
you. Attributes that existing code already reads — `data-player` alongside
`data-media`, say — are arguments to an action rather than triggers for one, so
they are not offered.

The selector fields autocomplete from the same scan: every `data-*` attribute
and `id` in your markup, annotated with the entity it points at.

## Removing the Home Assistant card surface

Every card renders inside Home Assistant's `<ha-card>`, which paints its own
background, border, shadow and corner radius. When your content supplies its own
surface — a rounded, blurred panel, say — that shows through as a stray coloured
slab behind it.

Set `bare: true` to remove it:

```yaml
type: custom:tailwind-template-card
bare: true
content: |
  <div class="rounded-3xl bg-white/70 p-5 backdrop-blur-xl">…</div>
```

It works by setting the custom properties `ha-card` itself reads
(`--ha-card-background`, `--ha-card-box-shadow`, `--ha-card-border-width`,
`--ha-card-border-radius`), which is the supported way to restyle it.

`plugins.daisyui.overrideCardBackground` is a different, narrower thing: it only
unsets the background on the wrapper *inside* `ha-card`, and leaves Home
Assistant's card surface painted underneath.

> **card-mod.** Older versions cleared the card's shadow root on every render,
> which discarded the styles card-mod injects. Updates now change only the
> elements that changed, and anything else in the shadow root is left alone,
> but this hasn't been tested with card-mod itself. `bare` is the supported way
> to remove the card surface.

## Tailwind v4 notes

This card runs **real Tailwind CSS v4**, so v4 syntax works: `size-*`, `text-balance`, container queries (`@container`), and the v4 gradient utilities (`bg-linear-to-r`). Colours are emitted in `oklch`/`oklab`.

Classes are compiled from what the card is about to render, in two passes: the rendered HTML, then the live DOM once bindings have been applied. Every card with the same plugin settings shares one compiled stylesheet.

When a template re-renders, the card updates only the elements that changed, rather than rebuilding everything. Focus, a half-typed input, a slider being dragged and CSS transitions (`transition-all` on a width or colour driven by state) all survive an update.

Tailwind v4 implements gradients, transforms and shadows with registered custom
properties (`@property`). Browsers ignore `@property` when it arrives inside a
shadow root, so the card hoists those rules to the document — without that,
`bg-linear-*`, `scale-*` and `shadow-*` silently render as nothing.

Jinja is resolved by Home Assistant *before* the card sees the markup, so interpolated class names are already concrete and work fine:

```jinja
{% for colour in ["red", "cyan", "blue"] %}
  <div class="h-12 w-12 rounded-lg bg-{{ colour }}-300"></div>
{% endfor %}
```

Classes introduced by bindings (`type: class`, or markup injected via `type: html`) are picked up by the second pass.

The one case not covered is a class applied by your own JavaScript at some arbitrary later point — an inline `onclick` that toggles a class the card has never rendered. Mention such classes somewhere in the content (a `hidden` element is enough) so they get compiled.

## What changed from the original

| | Upstream (v3.1.1) | This fork |
|---|---|---|
| CSS engine | [Twind](https://twind.style), a Tailwind v3 reimplementation, last published Jan 2023 | Real **Tailwind CSS v4**, compiled in the browser |
| daisyUI | 3.2 MB fetched from a public CDN on every dashboard load | **daisyUI 5** compiled in and tree-shaken |
| Template subscriptions | A new websocket subscription per state change, never closed | One per template, closed on teardown |
| Entity tracking | Scanned every entity in the state machine, string-matched the content | Uses the dependency list Home Assistant reports |
| Shadow DOM | Copied every `<style>` from the document head into each card | Nothing copied; the shadow root stays isolated |
| Config editor | Bundled Ace (~600 kB) | Home Assistant's own editor, with entity autocomplete and HTML tag closing |
| Interaction | `click`, `dblclick`, `change`, `input` | Adds `hold`, `contextmenu` and `moreInfo()` |
| Rendering | Shadow root cleared and rebuilt on every update | Morphed in place: focus, input and transitions survive |
| Bundle | 976 kB (290 kB gzipped) | **845 kB (177 kB gzipped)** |
| Tests | none | 99 browser-driven assertions, 19 unit tests |

### Why the subscription fix matters

Upstream re-subscribed to `render_template` on every state update and never unsubscribed, so subscriptions accumulated for as long as a dashboard stayed open ([upstream #11](https://github.com/usernein/tailwindcss-template-card/issues/11)). This fork opens one subscription per template and closes it on teardown — covered by a test that drives 25 state updates and asserts a single surviving subscription.

## Changelog

See [CHANGELOG.md](CHANGELOG.md).

## Contributing

Contributions are welcome — bug reports, examples, and pull requests alike.

**Reporting a bug.** Open an [issue](https://github.com/chukwudibarrah/tailwind-template-card/issues) with your card YAML (redact entity ids if you'd rather), your Home Assistant version, and anything the browser console printed. A screenshot helps for visual problems.

**Sharing a card.** If you build something good, open an issue or discussion with the YAML. Nice examples are welcome in the README.

**Working on the code:**

```bash
git clone https://github.com/chukwudibarrah/tailwind-template-card.git
cd tailwind-template-card
npm install

npm run dev     # Vite dev server
npm run lint    # ESLint
npm test        # unit tests, then builds and runs the browser tests
npm run build   # production bundle into dist/
```

The unit tests in [`test/unit/`](test/unit/) cover the pure logic and run straight from TypeScript with `node --test`, which needs Node 22.18 or newer. `npm run test:browser` drives a real browser through Playwright. It uses your installed Chrome if there is one, otherwise Playwright's bundled Chromium (`npx playwright install chromium`).

Before opening a pull request, please make sure `npm run lint` and `npm test` both pass, and add a test for any behaviour you change — the browser suite in [`test/run.mjs`](test/run.mjs) is plain JavaScript and easy to extend.

**Regenerating the README screenshot.** `npm run build && node scripts/screenshot.mjs`
renders demo cards with the real bundle and writes `images/cards.png`, so the
image always reflects what the card actually produces.

**Testing against a real Home Assistant.** Run `npm run build`, copy `dist/tailwind-template-card.js` into `config/www/`, and register it as a dashboard resource (see [Manually](#manually)). A hard refresh picks up rebuilds.

## Credits

- [**usernein**](https://github.com/usernein) for [tailwindcss-template-card](https://github.com/usernein/tailwindcss-template-card), which this is built on.
- [Tailwind CSS](https://tailwindcss.com) and [Home Assistant](https://home-assistant.io).
- [daisyUI](https://daisyui.com) for the optional component layer.
- Upstream's own acknowledgements: [threedy-card](https://github.com/dangreco/threedy), [Home-Assistant-Lovelace-HTML-Jinja2-Template-card](https://github.com/PiotrMachowski/Home-Assistant-Lovelace-HTML-Jinja2-Template-card), and [Twind](https://twind.style), which made the original possible.

## License

[MIT](LICENSE.txt), as the original.
