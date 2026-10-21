# Weave implementation plan

Six chunks. Each one runs before the next starts. Shell, pan, zoom, and the static sidebar are already in.

## 1. Shell, canvas, frames, drag

Electron window, infinite canvas, pan and zoom, dot grid, zoom label. Frames live in the Electron main process. The renderer is the view and talks to main over IPC. A frame is the real HTML plus CSS path: `srcdoc`, baseline margin reset first, component CSS after it. The sample PricingCard and a second badge are loaded that way. Drag a frame by its name. The drag stays in world coordinates, so the frame does not jump when the zoom is not 100%.

## 2. Selection and hit testing

Click selects the deepest element inside a frame. A blue outline sits outside the iframe and stays on the element at 50%, 100%, and 200%, and after panning. The breadcrumb selects a parent. Coordinate tests cover the overlay math at those zooms. Screenshots check the outline on the running app.

The property fields stay as they are until chunk 3. Only the breadcrumb follows the selection.

## 3. The whole properties panel

The sidebar reads computed styles for the selection and writes them live: layout (including Fixed, Hug, and Fill), text, fill, stroke with per-corner radius, and effects.

## 4. Change list

Record edits, collapse repeats, drop an edit that returns to the original, keep the original text as the locator hint, persist to JSON, and show the quiet log. Clicking a row reselects the element.

## 5. MCP server

All tools against the shared canvas state: `add_frame`, `list_frames`, `remove_frame`, `get_selection`, `get_changes`, `clear_changes`, `get_screenshot`. Streamable HTTP on `127.0.0.1:29881`. A real client drives the round trip.

## 6. README and NOTES.md

Install, `npm start`, and the Cursor MCP config. Notes for what ran, what broke, and what was not verified.

## Still out of scope

Comments, multiple pages, shaders, image generation, multiplayer, accounts, cloud sync, export, vector tools, undo, and the rest of Paper.

## Checks that need a Mac

The Cursor loop, a real component, trackpad pinch, a retina screen, and whether the panel feels like Figma. Linux runs the app, the tests, and screenshots of this build.
