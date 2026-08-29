# LowCortisolPlayer

LowCortisolPlayer is a Chrome extension that makes YouTube and Twitch feel calmer without replacing their native video players or controls.

## V0.1

- One live on/off switch with clean teardown and no secondary preferences
- A focused, quieter in-page cinema experience whenever the extension is active
- Centered, viewport-wide cinema stage on YouTube and Twitch
- Automatic Solarized light/dark palette following the system preference
- YouTube navigation and search removed completely whenever the extension is active
- Centered now-playing title with the native metadata and action strip removed
- Native YouTube comments moved into an accessible, scrollable bottom sheet
- Soft player with a consistent 16 px corner radius
- Low-frequency ambient color sampling from the current video
- YouTube cleanup for recommendations, comments, and identifiable Shorts surfaces
- Twitch cleanup with the left sidebar removed and native chat preserved in a soft right column
- Compact popup with one clear decision: active or disabled
- No backend, analytics, telemetry, accounts, or remote API calls

## Product direction

LowCortisolPlayer treats attention as something worth protecting. When active, it keeps the native video and playback controls, then removes everything that encourages browsing or engagement: top navigation, search, recommendations, metadata actions, Shorts prompts, end cards, and inline comments.

The remaining experience should feel like a cozy, quiet room rather than a redesigned media dashboard. [Solarized](https://ethanschoonover.com/solarized/) provides one coherent identity that follows the system light or dark preference. Rounded typography, breathing room, restrained motion, and a single on-demand comments bubble provide the rest. “Taiga” is used as a shorthand for Nordic calm and natural quiet, not as a UI dependency.

The extension deliberately has no tuning panel. It is either active, with the complete Low Cortisol experience, or disabled, with the original sites restored.

Durable product and implementation guidance lives in [`AGENTS.md`](./AGENTS.md). Product changes should update that guide and this README together.

## Requirements

- Node.js 22 or newer
- pnpm 10 or newer
- Chrome 120 or newer

## Install and build

```bash
pnpm install
pnpm check
pnpm build
```

The generated unpacked Chrome extension is exactly:

```text
.output/chrome-mv3/
```

During development, the same unpacked extension is also available through the visible shortcut:

```text
chrome-extension-dev/
```

Load it manually:

1. Open `chrome://extensions`.
2. Enable **Developer mode**.
3. Choose **Load unpacked**.
4. Select this repository's `.output/chrome-mv3/` directory.

Pin LowCortisolPlayer from Chrome's extensions menu to access the popup quickly.

## Commands

```bash
pnpm dev       # Start WXT development mode
pnpm build     # Build the Chrome Manifest V3 extension
pnpm zip       # Create the distributable Chrome ZIP
pnpm check     # Run Biome, TypeScript, and Vitest
pnpm test      # Run logic tests only
```

## Architecture

```text
entrypoints/
  content.ts             YouTube/Twitch lifecycle
  popup/                 Single-switch React control
src/
  core/                  Idempotent lifecycle and teardown
  features/              Appearance and ambient sampling
  platforms/
    youtube/             YouTube adapter, selectors, and styles
    twitch/              Twitch adapter, selectors, and styles
  settings/              Typed model, validation, and WXT storage
  ui/                    Shared extension-owned React UI
```

The content script listens to WXT's SPA location-change event and observes only the nearest useful player container after discovery. Ambient sampling uses a `12 × 7` canvas every 900 ms while the video is playing, stops when the tab is hidden or the feature is disabled, and keeps a neutral fallback if cross-origin canvas reads are unavailable.

## Manual verification

After loading the unpacked build, verify against live pages:

- YouTube: direct watch URL, SPA navigation between videos, fullscreen, resize, comments sheet, disable/re-enable.
- Twitch: channel navigation, fullscreen, resize, right chat column, native chat scrolling, disable/re-enable.
- Both: verify Solarized in system light and dark modes, confirm the cinema stage stays centered, and check that native controls and keyboard shortcuts remain intact with no duplicated ambient layer.

YouTube and Twitch change their DOM over time. Platform selectors are intentionally centralized in `src/platforms/youtube/` and `src/platforms/twitch/` so any live-site adjustment stays isolated.
