# Changelog

All notable changes to Name Forge are documented here. The format is intentionally human-readable rather than exhaustive commit history: entries should explain what changed, why it matters to someone using or reviewing the app, and any caveats that affect interpretation.

## Unreleased

### Added

- Added optional role influence controls so fiction-cast roles can remain metadata-only or lightly/strongly nudge silhouettes, phonotactics, and role-fit scoring.
- Added fiction-cast role controls, including role presets and per-slot role overrides.
- Added rarity distribution controls so a generated cast can follow grounded, balanced, rare-forward, or mythic rarity plans.
- Added Basic, Brief, and Detail card density modes for scanning, browsing, or inspecting generated names.
- Added a compact export panel with JSON, Markdown, copy actions, and a collapsed Markdown preview.
- Added a whimsical SVG favicon: an ember-dark forge tile with a small anvil, sparks, and an `N` monogram. The asset is designed to remain legible at browser-tab size while still matching the warm, forged-metal visual language of the interface.
- Added richer frontend metadata for crawlers and link previews, including author, Open Graph, Twitter card, canonical URL, and author-link metadata.
- Added an exposed in-app changelog section so release context is visible from the frontend rather than living only in repository files.
- Added a footer with copyright, a canonical author link, source link, in-page changelog link, and errata link so the app has clear ownership and maintenance paths.
- Added an inconspicuous footer version label tied to the package version, useful for lightweight support conversations without making versioning part of the main product surface.

### Changed

- Reworked the generator layout into Basics, Fiction, and Rarity & scoring sections so the fiction-cast workflow has clearer information architecture.
- Moved Export below the generated cards so it behaves like a late-stage action instead of competing with generation controls.
- Collapsed slot role overrides until a role mix is selected, then placed the overrides behind a `Customize slots` disclosure.
- Changed cast size from a bare number field to a compact minus / editable number / plus control.
- Updated the About copy, README, and architecture documentation to match the role, rarity, card-density, and export surfaces.
- Updated the author cross-link to use `https://jameshay.org/` as the canonical personal site.
- Expanded the render smoke test to cover the in-app changelog and footer affordances that are now part of the public shell contract.

### Notes

- Role influence is opt-in. The default `off` setting keeps role assignments as labels only so role mix metadata does not alter generation or scoring.
- The version label is intentionally quiet. Name Forge is not currently presenting a formal release train to end users; the label is mostly useful for support, screenshots, and quick confirmation of which deployed shell someone is looking at.
- Generated names remain drafting material. Cultural, legal, and project-fit review should happen before names are published.

## 0.1.0 - 2026-06-16

### Added

- Built the first React/Vite app shell for Name Forge.
- Added deterministic seed-based generation controls for cast size, style preset, novelty, pronounceability, memorability, cultural anchoring, and orthographic weirdness.
