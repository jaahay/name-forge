# NameRequest planning map

This document is the navigation map for the implemented `NameRequest -> NameResponse` contract and its next extensions.

## Current direction

Name Forge has one durable naming operation:

```text
NameRequest -> NameResponse
```

The primary output unit is `NameArtifact`. The stable intent model is `NameCriteria`.

The implemented v1 runtime pipeline is:

```text
NameRequest
  -> resolve criteria, optional mode metadata, exact quantity, grouping, and parent seed
  -> diagnostics
  -> compile NameCriteria into current GenerationSettings
  -> derive one deterministic child seed per artifact index
  -> generate and select one name per child seed
  -> map each GeneratedName to NameArtifact
  -> NameResponse with flat ordered artifacts and grouping metadata
```

Omitting quantity and grouping preserves the previous singular deterministic stream. Explicit exact quantity supports independent sets from 1 through 100 artifacts. `mode` remains metadata and must not choose generation or grouping behavior.

## Implemented sequence

Slices 1-8 established the singular criteria-driven request path:

```text
NameRequest / NameCriteria contract
  -> request resolver and seed handling
  -> NameArtifact mapper
  -> singular NameRequest adapter
  -> criteria diagnostics bridge
  -> small criteria-to-current-generator compiler
  -> internal candidate selection scoring
  -> bounded Configure criteria surface
```

The first grouping slice is also implemented:

```text
exact quantity + independent-set grouping
  -> bounded request validation
  -> deterministic child seeds
  -> atomic ordered generation
  -> flat NameArtifact[]
  -> explicit grouping metadata
```

The canonical grouping contract is:

```text
docs/requirements/name-grouping-design-boundary.md
```

Despite the historical filename, that document now records the accepted implementation boundary rather than a docs-only design proposal.

## Read order

1. [`requirements/name-request-v1.md`](requirements/name-request-v1.md)
   - Active request/response requirements.
2. [`requirements/name-grouping-design-boundary.md`](requirements/name-grouping-design-boundary.md)
   - Implemented exact independent-set boundary and deferred grouping semantics.
3. [`requirements/name-request-v1-checkpoint.md`](requirements/name-request-v1-checkpoint.md)
   - Current checkpoint after the singular foundation and first grouping slice.
4. [`decisions/0001-name-artifact-and-request-contract.md`](decisions/0001-name-artifact-and-request-contract.md)
   - Establishes `NameArtifact` and `NameRequest -> NameResponse`.
5. [`decisions/0002-criteria-driven-generation.md`](decisions/0002-criteria-driven-generation.md)
   - Establishes criteria-driven generation and internal candidate scoring.
6. [`decisions/0003-intent-criteria-compiler-pipeline.md`](decisions/0003-intent-criteria-compiler-pipeline.md)
   - Establishes intent surfaces as producers of `NameCriteria`.
7. [`decisions/0004-modes-presets-and-grouping.md`](decisions/0004-modes-presets-and-grouping.md)
   - Establishes mode, preset, skin, and grouping boundaries.
8. [`current-product-scope.md`](current-product-scope.md)
   - Active product-scope lens and next feature priorities.
9. [`product-architecture.md`](product-architecture.md)
   - Product vocabulary, workbench loop, criteria UI direction, and mode strategy.
10. [`architecture.md`](architecture.md)
    - Engine-level direction and pipeline boundaries.
11. [`model-module-contracts.md`](model-module-contracts.md)
    - Current model shapes, collection semantics, and module ownership.
12. [`requirements/name-request-v1-slices.md`](requirements/name-request-v1-slices.md)
    - Historical slice decomposition plus the implemented grouping extension.

## Current implementation boundary

Implemented:

- exact quantity from 1 through 100;
- `independent-set` grouping;
- singular-compatible defaults;
- one parent seed and deterministic index-stable child seeds;
- atomic flat ordered artifact output;
- positional association between `grouping.childSeeds[index]` and `names[index]`;
- indexed artifact and silhouette identity;
- deterministic replay and prefix stability;
- mode-neutral generation.

Still deferred:

- cohesion or diversity optimization;
- ranked alternatives for one naming problem;
- slotted generation and slot-level criteria;
- aggregate or per-slot diagnostics;
- partial-result recovery;
- per-artifact reroll or child replacement;
- new active modes;
- LLM prompt-first UI;
- public Criteria Match or fit percentages;
- candidate scoring leakage into public response artifacts.

## Follow-up risk

Supported-criteria knowledge is duplicated between `nameCriteriaCompiler.ts` and `nameCriteriaDiagnostics.ts`.

Before expanding criteria targets, supported-target metadata should be centralized or a shared helper such as `isCriteriaClauseCompiled(...)` should be introduced. Keep that as a separately scoped runtime cleanup.

## Historical docs

Some older documents describe earlier Fiction Cast, style-pack, source-descriptor, or singular-only planning states. Keep genuinely historical documents for context, but current-state guidance must defer to the active requirements, grouping boundary, checkpoint, model/module contracts, and current product scope listed above.
