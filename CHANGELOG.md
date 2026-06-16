# Changelog

All notable changes to Name Forge are documented here. The format is intentionally human-readable rather than exhaustive commit history: entries should explain what changed, why it matters to someone using or reviewing the app, and any caveats that affect interpretation.

## Unreleased

### Added

- Added a whimsical SVG favicon: an ember-dark forge tile with a small anvil, sparks, and an `N` monogram. The asset is designed to remain legible at browser-tab size while still matching the warm, forged-metal visual language of the interface.
- Added richer frontend metadata for crawlers and link previews, including author, Open Graph, Twitter card, canonical URL, and author-link metadata.
- Added a footer with copyright, a canonical author link, source link, changelog link, and errata link so the app has clear ownership and maintenance paths.
- Added an inconspicuous footer version label tied to the package version, useful for lightweight support conversations without making versioning part of the main product surface.

### Changed

- Updated the author cross-link to use `https://jameshay.org/` as the canonical personal site.
- Expanded the render smoke test to cover the footer affordances that are now part of the public shell contract.

### Notes

- The version label is intentionally quiet. Name Forge is not currently presenting a formal release train to end users; the label is mostly useful for support, screenshots, and quick confirmation of which deployed shell someone is looking at.
- Generated names remain drafting material. The interface now says this explicitly because cultural, legal, and project-fit review should happen before names are published.

## 0.1.0 - 2026-06-16

### Added

- Built the first React/Vite app shell for Name Forge.
- Added deterministic seed-based generation controls for cast size, style preset, novelty, pronounceability, memorability, cultural anchoring, and orthographic weirdness.
- Rendered cast-aware generated names with fit scores, silhouette metadata, rarity presentation, spelling variants, and provenance.
- Added collapsible result cards so the generated cast can be scanned quickly while keeping detailed scoring and provenance available.
- Added texture-aware card styling that reflects each name silhouette's soft, balanced, hard, or liquid feel.
- Added a Vitest server-render smoke test for the core generation shell.
