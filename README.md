# Name Forge

Name Forge is a Vite + TypeScript + React MVP for generating plausible fictional character names with deterministic randomness, ensemble balancing, name silhouettes, role-aware cast metadata, optional role influence, rarity distribution controls, spelling variants, scoring, export, and provenance.

The current app is explicitly the first **Fiction cast** mode of a broader random-name workbench. Future modes should share generation, scoring, comparison, export, and provenance primitives while providing their own controls and result presentation.

## Product docs

- [`docs/product-brief.md`](docs/product-brief.md) summarizes the product thesis, mode strategy, candidate future modes, and recommended next slices.
- [`docs/current-product-scope.md`](docs/current-product-scope.md) records the current scope lens, including the next major feature decision.
- [`docs/product-requirements.md`](docs/product-requirements.md) contains the canonical product requirements converted from the original PRD.
- [`docs/architecture.md`](docs/architecture.md) describes the engine boundaries, registry model, scoring layer, silhouette model, role and rarity planning, export layer, ensemble design, and current UI decomposition.
- [`docs/product-architecture.md`](docs/product-architecture.md) describes the multi-mode product direction and positions Fiction cast generation as the first serious mode.

## MVP capabilities

- Single-page React UI organized around a visible Fiction cast mode boundary, cast setup, fiction controls, rarity and scoring controls, result browsing, inspection, and export.
- Controls for cast size, seed, style preset, name format, cast role mix, slot role overrides, role influence, rarity distribution, novelty, pronounceability, memorability, cultural anchoring, and orthographic weirdness.
- Compact result cards for scanning generated names, with lock/select affordances and length-aware rendering.
- Persistent Inspect panel for selected-name detail: rarity cue, construction cues, score readout, name parts, alternate spellings, and role influence cue.
- Cast Health panel for deterministic roster checks such as spotlight balance, repeated initials/endings, cadence overlap, and lock status.
- Deterministic seeded randomness for repeatable casts.
- First-class `NameSilhouette` generation before exact letters exist.
- Simple phonotactic generation from data-shaped style packs.
- Cast-level balancing to reduce repeated initials, repeated endings, repeated cadence, and rarity-band clustering.
- Explicit role metadata for fiction cast slots while keeping role influence opt-in so baseline generation stays role-neutral.
- Plausibility scoring across pronounceability, memorability, novelty, cultural anchoring, orthographic naturalness, style fit, silhouette fit, ensemble fit, and role fit.
- Spelling variants marked as listed alternates or generated spellings.
- JSON and Markdown cast export with role, rarity, score, identity, silhouette, variant, role influence, and provenance metadata.
- Source/provider registry abstraction with provenance-bearing outputs.

## Current next major feature

The next major feature should be **briefed generation with pronounceability diagnostics**.

That means adding a reusable Naming Brief primitive and deterministic readability/pronounceability diagnostics before pursuing baby-name generation, IPA output, audio, or pronunciation dictionaries.

See [`docs/current-product-scope.md`](docs/current-product-scope.md) for the rationale and implementation-ticket breakdown.

## CI and validation

CI is reserved for merge-readiness. The workflow does not run on every branch push or ordinary PR update; it runs when a PR is marked ready for review, when a PR with a `merge-ready` label receives a label event, or by manual dispatch.

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
  card-locks.css
  cast-mode.css
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
    CastHealth.tsx
    ChangelogView.tsx
    GeneratorView.tsx
    modes.ts
    NameCard.tsx
    NameInspector.tsx
    namePresentation.ts
    presentation.ts
    ScoreControl.tsx
    score.ts
```
