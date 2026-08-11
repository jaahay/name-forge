# Name Forge

Name Forge is a Vite + TypeScript + React random-name workbench for producing inspectable, reproducible `NameArtifact` results from deterministic generation.

The current app has two active product modes:

- **Fiction Cast** builds a coherent-but-distinct roster with cast-specific controls, locks, diagnostics, reroll, inspection, and export.
- **Game NPC** generates one immediately usable name for prep or live play with shared inspection, copy, and reroll behavior.

Both modes reuse the same lower-level naming platform rather than owning separate generators.

## Current platform

The durable shared request boundary is:

```text
NameRequest -> NameResponse
```

The implemented request contract supports:

- the singular default;
- exact independent-set quantities from 1 through 100;
- deterministic parent and child seeds;
- flat ordered `NameArtifact[]` results with grouping metadata;
- criteria diagnostics and compilation into the current generation settings bridge;
- sound-first generation through a pure `SoundProfile` value and `SegmentSequence`;
- complete supported spelling generation and deterministic ranking;
- shared artifact analysis, inspection, readability evidence, and browser audition projection;
- bounded browser persistence for explicitly generated artifacts and Recent names.

`mode` is product metadata. Core generation and grouping do not branch on mode.

## Architecture boundary

The current directional split is:

```text
product surfaces / request adapters
  -> naming orchestration
  -> typed style compilation
  -> pure SoundProfile value
  -> sound generation
  -> spelling mechanics
```

`src/engine` owns reusable mechanics and durable request/artifact contracts. `src/naming` owns current name orchestration above those mechanics. `src/styleCompilation` owns typed style-to-profile compilation. `src/fictionCast` owns Fiction Cast semantics such as identity grammar, lexical titles/epithets, and ensemble behavior.

Generated sound, sequence, and spelling values use containment for provenance rather than synthetic relational IDs. Product and artifact objects may still have IDs where callers need independent addressability.

## Product docs

Start here:

- [`docs/current-product-scope.md`](docs/current-product-scope.md) — active shipped baseline, claim boundaries, deferred work, and the current rule for choosing the next slice.
- [`docs/architecture.md`](docs/architecture.md) — current technical architecture and ownership boundaries.
- [`docs/model-module-contracts.md`](docs/model-module-contracts.md) — executable model shapes, collection semantics, and module seams.
- [`docs/product-architecture.md`](docs/product-architecture.md) — multi-mode product architecture and active mode boundaries.
- [`docs/product-brief.md`](docs/product-brief.md) — durable product thesis and sequencing principles.
- [`docs/name-request-planning.md`](docs/name-request-planning.md) — navigation map for the implemented request/grouping contract.

Historical planning and requirements remain useful context, but they are not the active roadmap. In particular, [`docs/product-requirements.md`](docs/product-requirements.md) records the original PRD-derived requirements, while [`docs/current-product-scope.md`](docs/current-product-scope.md) is authoritative for current scope.

## Current product capabilities

Shared capabilities include deterministic seeded replay, exact independent-set generation, sound-first candidate generation, exhaustive supported spelling derivation, ranked spelling retention, deterministic readability observations, browser voice-draft audition, pure artifact analysis, shared inspection, source descriptors, and recent-artifact persistence.

Fiction Cast additionally owns roster generation and balancing, cast-specific roles and formats, locks and targeted reroll, composed identities, provenance-preserving phrase audition, same-roster sound relationships, cast review, and JSON/Markdown export.

Game NPC additionally owns a deliberately minimal one-name workflow with style-source selection and fresh-seed reroll. A future NPC roster must reuse the already-implemented shared quantity/grouping contract rather than introduce an NPC-specific request family.

## Claims boundary

Name Forge may present deterministic facts about generated structure, spelling alternatives, readability observations, and modeled relationships. Internal heuristics must not be relabeled as validated human-facing measures such as universal pronounceability, familiarity, memorability, realism, beauty, or cultural authenticity without an explicit evidence and validation contract.

Browser speech is an approximation surface, not canonical pronunciation. Provider-specific audio, IPA, dictionaries, and validated human-facing pronunciation metrics remain separate future work.

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
  App.tsx                 product shell and navigation
  data/                   built-in style/source data
  engine/                 reusable generation mechanics, request/artifact contracts, analysis, export
  naming/                 current name orchestration above the low-level engine
  styleCompilation/       typed style languages and SoundProfile compilation
  fictionCast/            Fiction Cast identity grammar, lexicon, and ensemble semantics
  ui/                     shared and mode-specific React presentation
```

See [`docs/architecture.md`](docs/architecture.md) for the detailed ownership map.