# Name Forge

Name Forge is a Vite + TypeScript + React random-name workbench for producing inspectable, reproducible `NameArtifact` results from deterministic generation.

The current app has two active product modes:

- **Fiction Cast** builds a coherent-but-distinct roster with cast-specific controls, locks, diagnostics, reroll, inspection, and export.
- **Game NPC** generates one immediately usable name for prep or live play with shared inspection, copy, and reroll behavior.

Both modes reuse lower-level naming capabilities rather than owning separate sound generators.

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

`NameRequest -> NameResponse` is shared platform and transport infrastructure. It is **not** the intended semantic callback hierarchy for the reusable naming library.

## Naming capability direction

The accepted dependency direction is:

```text
product surface
  -> reusable typed semantic callback(s)
     generateGivenName(...)
     generateFamilyName(...)
     generatePlaceName(...)
  -> generic singular generateName(...)
  -> typed style compilation
  -> pure SoundProfile value
  -> sound generation
  -> spelling mechanics
```

A product surface owns its UX, defaults, presets, and surface state. It injects configuration into one or more reusable semantic naming callbacks. A semantic callback carries domain meaning and delegates to the single generic `generateName(...)` primitive rather than becoming a parallel generator implementation.

Surface-specific multi-name orchestration may sit above those callbacks when plurality itself has meaningful product semantics. Fiction Cast, for example, may coordinate given/family/place generation, roles, locks, and cross-name pressure without requiring that cast orchestration become a universal grouping API.

The current `src/naming` implementation is still a migration seam: it accepts `GenerationSettings + NameSilhouette` and exposes silhouette-shaped generation functions. `NameSilhouette` is not an accepted public naming API boundary. The next naming-layer refactor should establish `generateName(...)` first, then reusable semantic callbacks, while auditing whether any smaller internal silhouette/planning value still earns its place.

See [`docs/decisions/0006-naming-capabilities-and-surface-composition.md`](docs/decisions/0006-naming-capabilities-and-surface-composition.md) for the authoritative capability and surface-composition rule.

## Architecture ownership

`src/engine` owns reusable mechanics and durable request/artifact contracts. `src/naming` owns current name orchestration above those mechanics and should converge on the generic singular naming primitive. `src/styleCompilation` owns typed style-to-profile compilation. `src/fictionCast` owns Fiction Cast semantics such as identity grammar, lexical titles/epithets, and ensemble behavior.

Generated sound, sequence, and spelling values use containment for provenance rather than synthetic relational IDs. Product and artifact objects may still have IDs where callers need independent addressability.

## Product docs

Start here:

- [`docs/current-product-scope.md`](docs/current-product-scope.md) — active shipped baseline, claim boundaries, deferred work, and the current rule for choosing the next slice.
- [`docs/architecture.md`](docs/architecture.md) — current technical architecture and ownership boundaries.
- [`docs/decisions/0006-naming-capabilities-and-surface-composition.md`](docs/decisions/0006-naming-capabilities-and-surface-composition.md) — accepted `generateName` / semantic-callback / surface-composition hierarchy.
- [`docs/model-module-contracts.md`](docs/model-module-contracts.md) — executable model shapes, collection semantics, and module seams.
- [`docs/product-architecture.md`](docs/product-architecture.md) — multi-mode product architecture and active mode boundaries.
- [`docs/product-brief.md`](docs/product-brief.md) — durable product thesis and sequencing principles.
- [`docs/name-request-planning.md`](docs/name-request-planning.md) — navigation map for the implemented request/grouping contract and its relationship to the naming capability layer.

Historical planning and requirements remain useful context, but they are not the active roadmap. In particular, [`docs/product-requirements.md`](docs/product-requirements.md) records the original PRD-derived requirements, while [`docs/current-product-scope.md`](docs/current-product-scope.md) is authoritative for current scope.

## Current product capabilities

Shared capabilities include deterministic seeded replay, exact independent-set generation, sound-first candidate generation, exhaustive supported spelling derivation, ranked spelling retention, deterministic readability observations, browser voice-draft audition, pure artifact analysis, shared inspection, source descriptors, and recent-artifact persistence.

Fiction Cast additionally owns roster generation and balancing, cast-specific roles and formats, locks and targeted reroll, composed identities, provenance-preserving phrase audition, same-roster sound relationships, cast review, and JSON/Markdown export.

Game NPC additionally owns a deliberately minimal one-name workflow with style-source selection and fresh-seed reroll. A future NPC roster must deliberately choose its product semantics: plain independent quantity can reuse the existing shared request capability, while meaningful roster-specific coordination should remain surface orchestration composed from reusable semantic callbacks rather than a mode-driven branch in `generateName(...)`.

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
  naming/                 current transitional orchestration; target home of generic singular generateName(...)
  styleCompilation/       typed style languages and SoundProfile compilation
  fictionCast/            Fiction Cast identity grammar, lexicon, and surface-specific ensemble semantics
  ui/                     shared and mode-specific React presentation
```

See [`docs/architecture.md`](docs/architecture.md) for the detailed ownership map.