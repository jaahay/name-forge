# Name Forge

Name Forge is a Vite + TypeScript + React MVP for generating plausible fictional character names with deterministic randomness, ensemble balancing, name silhouettes, spelling variants, scoring, and provenance.

## MVP capabilities

- Single-page React UI with controls for cast size, seed, style preset, novelty, pronounceability, memorability, cultural anchoring, and orthographic weirdness.
- Deterministic seeded randomness for repeatable casts.
- First-class `NameSilhouette` generation before exact letters exist.
- Simple phonotactic generation from a data-shaped style pack.
- Cast-level balancing to reduce repeated initials and repeated endings while varying rarity, novelty, and syllable count.
- Plausibility scoring across pronounceability, memorability, novelty, cultural anchoring, and orthographic naturalness.
- Spelling variants marked as curated or generated.
- Source/provider registry abstraction with provenance-bearing outputs.

## Getting started

```bash
npm install
npm run dev
```

## Validation

```bash
npm run build
npm test
```

## Project layout

```text
src/
  App.tsx
  main.tsx
  styles.css
  data/
    stylePacks.ts
  engine/
    ensemble.ts
    generator.ts
    random.ts
    registry.ts
    scoring.ts
    silhouettes.ts
    types.ts
    variants.ts
```

See [`docs/architecture.md`](docs/architecture.md) for the engine boundaries and extension seams.
