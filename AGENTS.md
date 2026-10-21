# Weave

Local Mac app (Electron) for visually editing UI components. A designer puts real components on an infinite canvas, edits them in a Figma-style panel, and hands the edits to Cursor through a local MCP server. Weave never writes source code.

This is a stripped-down, free, local alternative to Paper (paper.design), limited to the features in this file. The product bar is Paper/Figma feel: pixel-perfect import, a properties panel that works like Figma, and exact values sent back through MCP.

The user is a designer. Backend choices are settled below. Do not reopen them.

## Status

No app code yet. `skills/` is reserved and empty. Do not add skills until asked. When building starts, follow [PLAN.md](PLAN.md) in order. One git commit per step. Do not start the next step until the current one runs.

## The loop

1. The user asks Cursor to import a component (for example, "import the PricingCard into Weave").
2. Cursor reads the code, works out props and mock data, renders the component to HTML, and calls `add_frame`.
3. The component appears as a frame on the canvas, styled the way it was sent.
4. The user clicks any element, edits it in the right panel, and the canvas updates live.
5. Every edit is recorded in a change list.
6. The user asks Cursor to apply the changes. Cursor calls `get_changes`, updates the real styles in the source files (CSS, utility classes, CSS-in-JS, whatever the project uses), then calls `clear_changes`.

## Agnostic by design

Weave only knows HTML, CSS, and the DOM. It has no knowledge of any framework, build tool, or styling library, and it must work with any web project. Mapping edited values back to source is the coding agent's job. Do not add framework-specific code, plugins, or assumptions.

## Pixel-perfect contract

What the designer sees must be the component Cursor sent, and what Cursor gets back must be the exact value the designer set.

- A frame's document is the `html` plus the `css` from `add_frame`, rendered in an isolated iframe via `srcdoc`.
- Put a baseline `html, body { margin: 0; padding: 0; }` before the component CSS so the iframe's default margin does not shift the component. Component CSS comes after and wins. Do not inject a CSS reset, a font, or any other style that changes the component.
- Fonts, images, and styles the component needs must arrive in `html` or `css`. If they are missing, the frame will look wrong. Say so in the `add_frame` tool description. Weave does not go and fetch the target project's build.
- The selection highlight sits outside the component document. It must not change layout, box size, or the screenshot.
- Colors are recorded as hex (include alpha when the color has alpha). Lengths are recorded in px. Text is recorded as the exact old string and the exact new string.
- `get_screenshot` returns a PNG of that frame's contents only: no selection chrome, no frame title, no panel.

`url` frames may be shown for a preview route. Selection, computed styles, and inline editing work on `html` frames. A cross-origin preview URL is not the editing path. The pixel-perfect path is self-contained HTML and CSS.

## Canvas

- Infinite canvas. Pan with space+drag or trackpad scroll. Zoom with pinch or cmd+scroll (ctrl+scroll on Linux).
- Show the zoom level.
- Frames are absolutely positioned boxes on a container moved with plain CSS transforms. No canvas library.
- Drag a frame by its title bar. Each frame has a name label above it.
- Dark tool chrome, neutral canvas, frames with a light elevation, Figma-blue selection. The component inside the frame keeps its own colors.
- If `width` is omitted, the frame hugs the component. Height hugs the content. An optional `width` from `add_frame` sets the frame width.
- Selection coordinates must stay correct at every zoom level. Handle the canvas transform and the iframe offset explicitly, and test it.
- Click selects the deepest element under the pointer.
- A breadcrumb of ancestors (frame down to the selected element) selects a parent. That is the parent-selection path.

Frames and the change list persist in the Electron userData directory and restore on launch. The designer does not lose the canvas by quitting.

## Properties panel

Right side, shown when an element inside a frame is selected. Reads computed styles, writes inline styles on the live DOM. Sections and controls should read as a Figma inspector: labeled rows, compact fields, swatches for color.

- **Layout:** display, flex direction, wrap, gap, align, justify. Width and height as Fixed, Hug, or Fill. Padding per side. Margin per side. A link toggle on padding and on margin so linked sides edit together.
- **Text:** font family, size, weight, line height, letter spacing, alignment, color, and the text content.
- **Fill:** background color.
- **Stroke:** width, style, color, radius. Per-corner radius, with one control that sets all four corners together (Figma's linked radius).
- **Effects:** box shadow, opacity.

Width and height modes write this CSS:

- Fixed: an explicit px length
- Hug: `fit-content`
- Fill: `100%`

Number fields are plain inputs styled like Figma fields. Drag-to-scrub can wait. Color is a swatch plus a hex field.

## Change list

Each edit is appended as an entry:

```json
{
  "id": "chg_001",
  "frameId": "frame_pricing_card",
  "component": "PricingCard",
  "sourceFile": "path/to/PricingCard",
  "selector": "div.card > h2",
  "textContent": "Pro plan",
  "property": "font-size",
  "oldValue": "24px",
  "newValue": "32px",
  "timestamp": "2026-10-21T10:00:00Z"
}
```

- `component` is the frame's `name`. `sourceFile` is whatever `add_frame` was given.
- `textContent` is a locator hint: the element's visible text when the first edit for that entry was made. Keep that original hint even if the text later changes.
- A text edit uses `property: "textContent"`, with `oldValue` and `newValue` as the exact strings. The hint stays the original text so the source can still be found.
- The selector must be stable and specific enough for an agent to locate the element. Prefer an id when the element has one. Otherwise build a short structural path from tags, meaningful classes, and `:nth-of-type` when siblings need it. Do not use a hashed class name as the only identifier. The text hint travels with every entry.
- Multiple edits to the same element and property collapse into one entry. Match on `frameId` + `selector` + `property`. Keep the first `oldValue` and the latest `newValue`. Leave the entry in its original position.
- When a collapsed entry's `newValue` equals its `oldValue`, drop the entry.
- Persist to `changes.json` in the app data directory.
- Show a quiet change log in the UI (a collapsible strip, not a second inspector). Clicking a row reselects that element. The canvas and the right panel stay the primary UI.

## MCP

Official `@modelcontextprotocol/sdk`, Streamable HTTP on `127.0.0.1:29881`, no auth token. The server runs inside the Electron main process so Cursor connects to the running app.

One canvas state. The main process holds frames and the change list. The renderer owns the live iframe DOM and reports selection, computed styles, and edits over IPC. MCP reads and writes that shared state, never a second copy.

| Tool | Input | Output |
|---|---|---|
| `add_frame` | `name`, one of `html` or `url`, optional `css`, optional `sourceFile`, optional `width` | frame id |
| `get_selection` | none | selected frame, selector, tag, text, computed styles. Empty selection is an explicit empty result |
| `get_changes` | optional `frameId` | the change list |
| `clear_changes` | optional `frameId` or `ids` | confirmation |
| `get_screenshot` | `frameId` | PNG of that frame's contents |
| `list_frames` | none | frames with ids, names, and source files |
| `remove_frame` | `frameId` | confirmation |

Tool descriptions must tell the agent: when sending `html`, include all the CSS the component needs in `css` (a compiled stylesheet or inlined styles), otherwise the component renders unstyled. Always pass `sourceFile` when known.

## Tech

- Electron (main process + renderer). `contextIsolation` on, `nodeIntegration` off in the renderer.
- React + Vite + TypeScript for the renderer.
- Plain CSS for Weave's own UI. It must not depend on the target project's stack.
- Plain CSS transforms for pan and zoom.
- JSON files for persistence. No database.
- Vitest for tests.
- Everything free and open source. No paid services. No AI API calls at runtime.
- Dependencies stay minimal: Electron, React, Vite, TypeScript, `@modelcontextprotocol/sdk`, Vitest. Ask before adding anything large.
- `npm install && npm start` must launch the app.
- The intended machine is a Mac. The app is cross-platform Electron so it can be verified on Linux. A packaged Mac build is not part of v1.

## Milestones

The build is split into steps in [PLAN.md](PLAN.md). One git commit per step. A milestone is done when its last step runs. Do not start the next milestone until then.

1. **Shell and canvas.** Steps 1–4, including the static sidebar in step 1.5.
2. **Selection and panel.** Steps 5–9.
3. **Change list.** Steps 10–14.
4. **MCP server.** Steps 15–18.
5. **Docs.** Steps 19–20.

## Tests

- Change-list logic: collapsing, dropping an edit that returns to the original value, persistence.
- MCP tools against the shared state.
- Selection coordinates at several zoom levels.

Do not claim something works unless it was run or tested. If it could not be verified, say so.

## Out of scope

Comments, multiple pages, shaders, image generation, multiplayer or accounts, cloud sync, export formats, vector drawing tools, undo/redo, the full Paper tool set.

## Acceptance

With Weave running and connected to Cursor:

1. Ask Cursor to import a component. It appears as a frame, styled correctly.
2. Click a heading, change its font size and color in the panel. The canvas updates.
3. Ask Cursor to apply the changes. `get_changes` returns the edits, and Cursor can update the styles in the source file.
