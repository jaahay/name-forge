# Name Forge

Name Forge is a Vite + TypeScript + React random-name workbench for producing inspectable, reproducible `NameArtifact` results from deterministic generation.

The current app has two active product modes:

- **Fiction Cast** builds a coherent-but-distinct roster with cast-specific controls, locks, conditional collision notes, reroll, inspection, and export.
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
- singular name orchestration through `generateName(...)`;
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
     generateGivenName(...)   [implemented]
     generateFamilyName(...)  [accepted; implementation pending]
     generatePlaceName(...)   [accepted; implementation pending]
  -> generic singular generateName(...)
  -> typed style compilation
  -> pure SoundProfile value
  -> sound generation
  -> spelling mechanics
```

A product surface owns its UX, defaults, presets, and surface state. It injects configuration into one or more reusable semantic naming callbacks. A semantic callback carries domain meaning and delegates to the single generic `generateName(...)` primitive rather than becoming a parallel generator implementation.

Distinct mechanics are not required for first-class semantic treatment. The currently supported sound-backed name roles—given, family, and place—are first-class API categories even when a wrapper initially delegates behavior-equivalently to `generateName(...)`. Future name-bearing categories such as clan or house names can follow the same pattern when the product actually supports them.

Surface-specific multi-name orchestration may sit above those callbacks when plurality itself has meaningful product semantics. Fiction Cast, for example, may coordinate given/family/place generation, roles, locks, and cross-name pressure without requiring that cast orchestration become a universal grouping API.

`src/naming` exposes the singular `generateName(...)` orchestration boundary and the first implemented semantic callback, `generateGivenName(...)`. The generic primitive materializes an internal `NameGenerationPlan` before style, sound, spelling, scoring, and variants. Product/domain semantics such as Fiction Cast roles are resolved above this boundary into generic planning preferences rather than being accepted by `generateName(...)` itself.

Not every identity value belongs on that synthesis path. Finite lexical material such as particles, honorifics, titles, or generational suffixes should use typed lexical inventories plus a small deterministic `selectFromOptions(...)` mechanic under semantic selectors. Caller-facing typed `options` objects may hide granular language/region/dialect/source details while the underlying inventory preserves them with provenance. Name Forge owns the inventory contract and bundled datasets it ships, not universal linguistic truth for a locale or naming tradition.

The existing `silhouette` property on generated names and artifacts remains compatibility and inspection/scoring evidence. It is backed by `NameGenerationPlan`; callers no longer construct a `NameSilhouette`, and silhouette-shaped generator callbacks are no longer part of the naming API.

The active architecture sequence is tracked by parent checkpoint #198. Review #199 concluded that the engine/interface foundation is **not yet settled** and opened bounded blockers #201, #202, and #203. The checkpoint subsequently refined #202: it should establish the stable semantic invocation contract and add the accepted family/place wrappers while keeping `generateName(...)` as the one lexical-name implementation. Surface-specific requirements work remains gated on resolving or explicitly accepting the foundation blockers.

See [`docs/decisions/0006-naming-capabilities-and-surface-composition.md`](docs/decisions/0006-naming-capabilities-and-surface-composition.md) for the authoritative capability, finite-vocabulary, and surface-composition rules.

## Architecture ownership

`src/engine` owns reusable mechanics and durable shared request/artifact contracts plus shared analysis. `src/naming` owns the generic singular `generateName(...)` orchestration and reusable semantic `-Name` capabilities above those mechanics. `src/styleCompilation` owns typed style-to-profile compilation. `src/fictionCast` owns Fiction Cast semantics such as identity grammar, lexical titles/epithets, role-derived planning preferences, ensemble behavior, contextual scoring, rarity policy/metadata, and Cast export.

Generated sound, sequence, and spelling values use containment for provenance rather than synthetic relational IDs. Product and artifact objects may still have IDs where callers need independent addressability. Heterogeneous identity composition does not by itself create a universal `NameSegment` or `generatePersonName(...)` API.

## Product docs

Start here:

- [`docs/current-product-scope.md`](docs/current-product-scope.md) — active shipped baseline, claim boundaries, deferred work, and the current foundation-checkpoint sequence.
- [`docs/architecture.md`](docs/architecture.md) — current technical architecture and ownership boundaries.
- [`docs/decisions/0006-naming-capabilities-and-surface-composition.md`](docs/decisions/0006-naming-capabilities-and-surface-composition.md) — accepted `generateName` / semantic-callback / lexical-inventory / surface-composition hierarchy.
- [`docs/model-module-contracts.md`](docs/model-module-contracts.md) — executable model shapes, collection semantics, and module seams.
- [`docs/product-architecture.md`](docs/product-architecture.md) — multi-mode product architecture and active mode boundaries.
- [`docs/product-brief.md`](docs/product-brief.md) — durable product thesis and sequencing principles.
- [`docs/name-request-planning.md`](docs/name-request-planning.md) — navigation map for the implemented request/grouping contract and its relationship to the naming capability layer.

Historical planning and requirements remain useful context, but they are not the active roadmap. In particular, [`docs/product-requirements.md`](docs/product-requirements.md) records the original PRD-derived requirements, while [`docs/current-product-scope.md`](docs/current-product-scope.md) is authoritative for current scope.

## Current product capabilities

Shared capabilities include deterministic seeded replay, exact independent-set generation, singular `generateName(...)` orchestration, reusable `generateGivenName(...)`, sound-first candidate generation, exhaustive supported spelling derivation, ranked spelling retention, deterministic readability observations, browser voice-draft audition, pure artifact analysis, shared inspection, source descriptors, and recent-artifact persistence.

Fiction Cast additionally owns roster generation and balancing, cast-specific roles and formats, locks and targeted reroll, composed identities, provenance-preserving phrase audition, conditional composed-identity collision notes, and JSON/Markdown export.

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
  engine/                 reusable generation mechanics, request/artifact contracts, analysis
  naming/                 generic generateName(...) plus reusable semantic one-name capabilities
  styleCompilation/       typed style languages and SoundProfile compilation
  fictionCast/            Fiction Cast identity, roles, rarity, ensemble semantics, contextual scoring, export
  ui/                     shared and mode-specific React presentation
```

See [`docs/architecture.md`](docs/architecture.md) for the detailed ownership map.
