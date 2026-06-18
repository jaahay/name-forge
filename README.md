# Name Forge

Name Forge is a Vite + TypeScript + React MVP for generating plausible fictional character names with deterministic randomness, ensemble balancing, name silhouettes, role-aware cast metadata, rarity distribution controls, spelling variants, scoring, export, and provenance.

## Product docs

- [`docs/product-requirements.md`](docs/product-requirements.md) contains the canonical product requirements converted from the original PRD.
- [`docs/architecture.md`](docs/architecture.md) describes the engine boundaries, registry model, scoring layer, silhouette model, role and rarity planning, export layer, and ensemble design.
- [`docs/product-architecture.md`](docs/product-architecture.md) describes the multi-mode product direction and positions fiction cast generation as the first serious mode.

## MVP capabilities

- Single-page React UI organized around cast setup, fiction controls, rarity and scoring controls, result browsing, and export.
- Controls for cast size, seed, style preset, name format, cast role mix, slot role overrides, rarity distribution, novelty, pronounceability, memorability, cultural anchoring, and orthographic weirdness.
- Compact result cards for scanning generated names, with nested Details and Diagnostics sections for deeper metadata.
- Deterministic seeded randomness for repeatable casts.
- First-class `NameSilhouette` generation before exact letters exist.
- Simple phonotactic generation from data-shaped style packs.
- Cast-level balancing to reduce repeated initials, repeated endings, repeated cadence, and rarity-band clustering.
- Explicit role metadata for fiction cast slots while keeping role influence separate from baseline name generation.
- Plausibility scoring across pronounceability, memorability, novelty, cultural anchoring, orthographic naturalness, style fit, silhouette fit, and ensemble fit.
- Spelling variants marked as listed alternates or generated spellings.
- JSON and Markdown cast export with role, rarity, score, identity, silhouette, variant, and provenance metadata.
- Source/provider registry abstraction with provenance-bearing outputs.

## Getting started

```bash
npm ci
npm run dev
```

## Validation

```bash
npm ci
npm run build
npm test
```

## Project layout

```text
src/
  App.tsx
  App.test.tsx
  main.tsx
  styles.css
  data/
    stylePacks.ts
  engine/
    ensemble.ts
    export.ts
    identity.ts
    generator.ts
    random.ts
    rarity.ts
    registry.ts
    roles.ts
    scoring.ts
    silhouettes.ts
    types.ts
    variants.ts
  ui/
    AboutView.tsx
    ChangelogView.tsx
    GeneratorView.tsx
    NameCard.tsx
    ScoreControl.tsx
    presentation.ts
    score.ts
```
