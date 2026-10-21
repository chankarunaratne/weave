# Weave implementation plan

Build these steps in order. Each step is one session and one git commit. It is done only when it runs and the check at the bottom passes. Then stop. Do not start the next step in the same pass.

The five milestones match `AGENTS.md`. A milestone is done when its last step runs. Do not start the next milestone before that.

Nothing here is out of scope from `AGENTS.md`. Undo, comments, accounts, and the rest of Paper stay out.

## Milestone 1 — Shell and canvas

The window exists, you can move around the canvas, and sample frames sit on it. No selection yet. No MCP yet.

### 1. The app boots

Electron, Vite, React, and TypeScript. `npm install && npm start` opens a window.

The window is the Weave chrome only: a neutral canvas, an empty right-hand panel, and a zoom label reading 100%. Dark chrome. No pan, no frames, no buttons that pretend to work.

**Done when:** `npm start` opens that window on Linux, and the process quits cleanly when the window closes.

### 1.5 Sidebar chrome

The right panel is the dark properties inspector, before it does anything. Breadcrumb at the top. Sections for layout, text, fill, stroke, and effects, with sample values in the fields. Fixed, Hug, and Fill are visible. Padding and margin have a link control. Radius has one value plus the four corners.

Nothing in the panel changes the canvas. No pan, no frames, no selection.

**Done when:** `npm start` shows that sidebar beside the empty canvas.

### 2. Pan and zoom

The canvas pans with space+drag and with trackpad scroll. It zooms with pinch and with cmd+scroll (ctrl+scroll on Linux). The zoom label updates. The world is a div moved with CSS transforms. No canvas library.

Put the screen-to-world math in a plain function and test it at 50%, 100%, and 200%. Selection will reuse this later, so it has to be right before any overlay exists.

**Done when:** you can pan and zoom an empty canvas, the label matches the zoom, and the coordinate tests pass.

### 3. One sample frame

A hard-coded PricingCard (HTML plus the CSS it needs) renders in an iframe via `srcdoc`. The name sits above the frame. The component is flush to the frame corner: baseline `margin: 0` on the iframe document, component CSS after it, no other reset. The frame hugs the component.

This is the pixel-perfect check. The sample should look like the HTML, not like a webpage with an 8px body margin.

**Done when:** the sample frame is on the canvas at 100% and at another zoom, and its edges line up with the component box.

### 4. Drag frames

Drag a frame by its title bar. Add a second hard-coded frame so one drag cannot move both. Positions are in world coordinates, so a frame stays under the pointer at every zoom.

**Done when:** you can pan, zoom, and drag two frames independently, and a frame does not jump when the zoom is not 100%.

## Milestone 2 — Selection and panel

Click anything inside a frame and edit it live. This is the Figma feel. Split it so the hit testing is solid before the controls exist.

### 5. Click to select

Click selects the deepest element under the pointer. A blue outline is drawn outside the iframe, so the component's layout does not change. The outline stays glued to the element at 50%, 100%, and 200%, and after panning.

A breadcrumb from the frame down to the element selects a parent.

Test the overlay math (zoom, pan, iframe offset) at those three zooms.

**Done when:** clicking a heading, a button, and a parent through the breadcrumb each shows an outline that matches the element's box at all three zooms.

### 6. The panel reads the selection

The sidebar from step 1.5 fills from computed styles when something is selected, and hides when nothing is. Values are the real computed ones (px, hex). The fields stay read-only.

**Done when:** selecting the sample heading shows its real font size, weight, and color, and clicking the canvas background clears the panel.

### 7. Layout edits

The layout section writes inline styles live: display, direction, wrap, gap, align, justify, width and height as Fixed / Hug / Fill, padding per side, margin per side. Linked padding and linked margin edit every side together.

Fixed writes a px length. Hug writes `fit-content`. Fill writes `100%`.

**Done when:** changing gap, padding, and width mode on the sample updates the frame immediately, including while zoomed.

### 8. Type and fill

Font family, size, weight, line height, letter spacing, alignment, color, the text itself, and background color. Color is a swatch plus hex. Text edits change the live text.

This is the acceptance moment for the panel: heading size and color.

**Done when:** you can change the sample heading's font size, color, and words, and the frame updates live.

### 9. Stroke and effects

Border width, style, color, and per-corner radius with a link toggle for all four corners. Box shadow and opacity.

**Done when:** radius, a shadow, and opacity on the sample card update live, and unlinked corners can differ.

## Milestone 3 — Change list

Edits become a record Cursor can read later. The panel already changes pixels. This milestone remembers what changed.

### 10. The change model

A plain module, no UI. Appending an edit, collapsing the same frame + selector + property into one entry (first `oldValue`, latest `newValue`), and dropping the entry when the value returns to the original. `textContent` on an entry is the original visible text. A text edit uses `property: "textContent"` and does not overwrite that hint.

Vitest covers collapse, the dropped no-op, and a text edit next to a style edit on the same element.

**Done when:** those tests pass and no window is required.

### 11. The panel records edits

Every live edit from steps 7–9 appends through the change model. Selectors follow `AGENTS.md`: id when present, otherwise a short structural path, plus the text hint.

**Done when:** changing the heading size twice leaves one entry, from the original size to the latest, and changing it back removes the entry.

### 12. Changes survive quit

`changes.json` in the Electron userData directory. Relaunch reloads it.

**Done when:** quit, start again, and the same entries are still there.

### 13. The change log

A quiet collapsible strip. Not a second inspector. Each row shows the component, the property, and the new value. Clicking a row reselects that element and shows the outline.

**Done when:** the strip lists the entries from step 11, and clicking one selects that element again.

### 14. Frames survive quit

Save each frame's name, html, css, position, size, and source file. Relaunch restores the canvas, still draggable, still selectable.

**Done when:** quit with two frames on the canvas, start again, and both are back where you left them.

## Milestone 4 — MCP

Cursor connects to the running app. The main process holds the frames and the change list. The renderer is the view and owns the live iframe DOM. They talk over IPC. One state, not two copies.

### 15. Move state into the main process

Frames and changes move from the renderer into the main process. The window still pans, edits, and restores, now through IPC. No MCP socket yet.

Do this step alone. It is the one most likely to desync the canvas.

**Done when:** step 14 still works, and an edit made in the panel is the entry the main process has stored.

### 16. Frame tools

Streamable HTTP on `127.0.0.1:29881`, no auth token, using `@modelcontextprotocol/sdk`. Tools: `add_frame`, `list_frames`, `remove_frame`. Descriptions tell the agent to send all CSS in `css` and to pass `sourceFile` when known.

**Done when:** a client can add a frame, see it appear on the open canvas, list it, and remove it. Tests cover the three tools against the shared state.

### 17. Selection and change tools

`get_selection`, `get_changes`, `clear_changes`. Empty selection returns an explicit empty result. `clear_changes` accepts a frame id or a list of ids.

**Done when:** with a heading selected and a font-size edit recorded, a client reads both, then clears that entry and the log updates. Tests cover this.

### 18. Screenshot

`get_screenshot` returns a PNG of the frame contents. No selection outline, no title, no panel.

**Done when:** a client receives a PNG of the sample frame, and the blue outline is not part of the image.

## Milestone 5 — Docs

### 19. README

Install, `npm start`, and the exact Cursor MCP config for `127.0.0.1:29881` and Streamable HTTP. State that Weave has to be running before Cursor calls it.

**Done when:** someone can follow the README from a fresh checkout to a running app and a pasted MCP config.

### 20. NOTES.md

What is done, what is broken, what was skipped, and what was not verified. Only claim what was actually run.

**Done when:** `NOTES.md` matches the last run, including anything from steps 1–19 that could not be verified.

## Who checks what

This repo is built and checked on Linux, with a display. Automated tests, `npm start`, clicking through the window, and reading a screenshot of that Linux window all happen here.

These need a pass on your Mac. A bot on that machine can do them. This environment cannot.

- **The Cursor loop.** The MCP server binds to `127.0.0.1` inside the machine where Weave is running. Cursor on your Mac has to talk to Weave on that same Mac. Ask it to import a real component, then to apply the changes.
- **A real component, pixel for pixel.** The sample card can be checked here. Your app’s fonts, images, and CSS render on your machine. Linux will not match Mac type rendering.
- **Trackpad feel.** Pinch zoom, two-finger pan, and cmd+scroll. Wheel events can be simulated here. A trackpad cannot.
- **A retina screen.** The selection outline and `get_screenshot` at a device pixel ratio of 2. Zoom math is tested here at 50%, 100%, and 200%. A real retina display is not.
- **Whether it feels like Figma.** The controls have to work here. Spacing, type, and whether the panel feels right are a designer’s call on your screen.

Screenshots of the Linux build are available from here. A screenshot of Weave on your Mac is not.

## Acceptance, after step 18

With the app running:

1. Import a component through `add_frame` with its HTML and CSS. It appears as a frame, styled correctly.
2. Click a heading, change its font size and color. The canvas updates.
3. `get_changes` returns those edits. `clear_changes` removes them after they are applied.
