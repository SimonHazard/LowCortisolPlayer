# LowCortisolPlayer agent guide

## Product north star

LowCortisolPlayer is an attention-preserving viewing layer for YouTube and Twitch. The video is the focal object. Every other element must justify the attention it asks from the viewer.

- Subtract before adding.
- Keep the native video player and its playback controls intact.
- Remove navigation, search, recommendations, action rows, autoplay prompts, end cards, and other discovery loops in focus mode.
- Keep comments absent until the viewer explicitly opens them from the small bottom control.
- Present the current title quietly, centered, and separate from engagement metadata.
- Use the canonical Solarized palette as one automatic light/dark identity that follows the system preference.
- Aim for a cozy, safe-place, slow-living mood without decorative clutter.

“Taiga” is interpreted here as Nordic calm: natural quiet, breathing room, soft surfaces, and support for sustained focus. It is a design influence, not a request to add the Angular Taiga UI library.

## Interaction principles

- The default focused screen should contain the video, its native controls, the quiet title, and at most one discreet comments control.
- Expose one product decision only: LowCortisolPlayer is active or disabled. Do not add granular user settings.
- Hidden content must not reappear merely because the pointer crosses an invisible hotspot.
- Motion should explain a spatial change, never decorate an idle screen.
- Prefer short, smooth, interruptible transitions. The comments sheet uses a restrained 280 ms movement and a faster opacity change.
- Preserve keyboard navigation, visible focus states, Escape-to-close behavior, and reduced-motion support.
- Do not replace native playback shortcuts or recreate controls already owned by the platform player.

## Visual direction

- Prefer generous negative space and low-contrast hierarchy.
- Use rounded typography and soft radii selectively, not on every surface.
- Avoid gradients, glass-heavy decoration, excessive shadows, dashboard patterns, and attention-seeking animation.
- Keep the video horizontally centered and let it use nearly the full viewport width.
- Keep Solarized light and dark equally intentional while presenting them as one automatic theme.
- Keep Twitch chat in a soft right-hand column. Preserve native chat behavior, scrolling, and accessibility.

## Engineering guardrails

- Keep platform selectors isolated under `src/platforms/youtube/` and `src/platforms/twitch/`.
- Keep DOM changes idempotent and fully reversible when the extension is disabled.
- Prefer strict TypeScript, semantic HTML, narrow permissions, and local-only behavior.
- Avoid telemetry, accounts, remote APIs, and broad host permissions unless the product brief explicitly changes.
- Run `pnpm check` and `pnpm build` after product changes.

## Project memory

Whenever product behavior or design direction changes, update both `README.md` and this file in the same pass. Record durable principles here and user-facing behavior in the README. Do not turn temporary experiments into permanent doctrine.

For frontend work, use the locally available `design-taste-frontend`, `frontend-design`, `emil-design-eng`, `apple-design`, and `animate` skills when relevant. Evaluate any marketplace skill by source reputation, adoption, and project fit before recommending installation.
