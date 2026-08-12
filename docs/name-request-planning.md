# NameRequest planning map

This document is the navigation map for the implemented `NameRequest -> NameResponse` platform contract. It does not define the reusable semantic naming callback hierarchy.

For the accepted naming-capability direction, see [`decisions/0006-naming-capabilities-and-surface-composition.md`](decisions/0006-naming-capabilities-and-surface-composition.md).

## Current direction

Name Forge has one durable shared request/response operation:

```text
NameRequest -> NameResponse
```

The primary output unit is `NameArtifact`. `NameCriteria` is the shared structured intent model for intent that crosses this generic request boundary.

The implemented v1 runtime pipeline is:

```text
NameRequest
  -> resolve criteria, optional mode metadata, exact quantity, grouping, and parent seed
  -> diagnostics
  -> compile NameCriteria into current GenerationSettings
  -> derive one deterministic child seed per artifact index
  -> invoke current transitional one-name orchestration per child seed
  -> map each GeneratedName to NameArtifact
  -> NameResponse with flat ordered artifacts and grouping metadata
```

Omitting quantity and grouping preserves the previous singular deterministic stream. Explicit exact quantity supports independent sets from 1 through 100 artifacts. `mode` remains metadata and must not choose generation or grouping behavior.

This request contract is platform and transport infrastructure. It must not be read as saying that every product surface should use only one untyped domain callback.

The accepted reusable naming hierarchy is ordered separately:

```text
product surface
  -> reusable semantic callback(s)
     generateGivenName(...)
     generateFamilyName(...)
     generatePlaceName(...)
  -> generic singular generateName(...)
  -> style / sound / spelling mechanics
```

Surface-specific aggregate operations may sit above semantic callbacks when cross-name behavior is meaningful to that surface.

## Implemented request sequence

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

The first generic repeated-generation slice is also implemented:

```text
exact quantity + independent-set grouping
  -> bounded request validation
  -> deterministic child seeds
  -> atomic ordered generation
  -> flat NameArtifact[]
  -> explicit grouping metadata
```

The canonical implemented grouping contract is:

```text
docs/requirements/name-grouping-design-boundary.md
```

Despite the historical filename, that document records the accepted exact independent-set implementation boundary. `independent-set` means generic repeated independent generation; it is not a universal model for nuanced surface-specific roster or set semantics.

## Read order

1. [`decisions/0006-naming-capabilities-and-surface-composition.md`](decisions/0006-naming-capabilities-and-surface-composition.md)
   - Authoritative `generateName` / reusable semantic callback / surface composition hierarchy.
2. [`current-product-scope.md`](current-product-scope.md)
   - Active product-scope lens and the selected next naming-layer sequence.
3. [`architecture.md`](architecture.md)
   - Current technical architecture and naming-layer direction.
4. [`requirements/name-request-v1.md`](requirements/name-request-v1.md)
   - Implemented shared request/response requirements.
5. [`requirements/name-grouping-design-boundary.md`](requirements/name-grouping-design-boundary.md)
   - Implemented exact independent-set boundary and deferred reusable grouping semantics.
6. [`requirements/name-request-v1-checkpoint.md`](requirements/name-request-v1-checkpoint.md)
   - Current checkpoint after the singular request foundation and first independent-set slice.
7. [`decisions/0001-name-artifact-and-request-contract.md`](decisions/0001-name-artifact-and-request-contract.md)
   - Establishes `NameArtifact` and `NameRequest -> NameResponse`, as refined by Decision 0006.
8. [`decisions/0002-criteria-driven-generation.md`](decisions/0002-criteria-driven-generation.md)
   - Establishes shared structured criteria and internal candidate scoring.
9. [`decisions/0003-intent-criteria-compiler-pipeline.md`](decisions/0003-intent-criteria-compiler-pipeline.md)
   - Establishes the shared request-facing criteria pipeline, as refined by Decision 0006 for semantic callback configuration.
10. [`decisions/0004-modes-presets-and-grouping.md`](decisions/0004-modes-presets-and-grouping.md)
    - Establishes mode/preset boundaries; its older universal grouping direction is refined by Decision 0006.
11. [`decisions/0005-sound-profile-product-boundary.md`](decisions/0005-sound-profile-product-boundary.md)
    - Establishes sound/profile/style ownership below the naming capability layer.
12. [`product-architecture.md`](product-architecture.md)
    - Product surfaces, mode strategy, semantic capability reuse, and surface composition.
13. [`model-module-contracts.md`](model-module-contracts.md)
    - Current executable models plus the accepted target naming seam.
14. [`requirements/name-request-v1-slices.md`](requirements/name-request-v1-slices.md)
    - Historical slice decomposition plus the implemented grouping extension.

## Current implementation boundary

Implemented platform behavior:

- exact quantity from 1 through 100;
- `independent-set` grouping;
- singular-compatible defaults;
- one parent seed and deterministic index-stable child seeds;
- atomic flat ordered artifact output;
- positional association between `grouping.childSeeds[index]` and `names[index]`;
- current indexed artifact and silhouette identities;
- deterministic replay and prefix stability;
- mode-neutral generation.

The silhouette identity above is a current implementation fact, not an architectural requirement. Decision 0006 explicitly removes `NameSilhouette` from the durable naming API boundary.

## Active next naming-layer sequence

The next implementation work is **not another grouping expansion**.

1. Establish the generic singular `generateName(...)` contract and move callers away from silhouette-shaped generation entry points.
2. Audit `NameSilhouette` field by field; retain only internal planning state that still has a clear owner and purpose.
3. Build reusable typed semantic callbacks such as given/family/place generation on top of `generateName(...)` from concrete product semantics.
4. Keep nuanced multi-name behavior surface-specific unless a cross-surface aggregate abstraction is demonstrated later.

## Deferred generic request/grouping work

Still deferred as shared platform contracts:

- cohesion or diversity optimization intended for reuse across surfaces;
- ranked alternatives for one naming problem;
- generic slotted generation and slot-level criteria;
- aggregate or per-slot diagnostics;
- partial-result recovery;
- generic per-artifact reroll or child replacement;
- LLM prompt-first UI;
- public Criteria Match or fit percentages;
- candidate scoring leakage into public response artifacts.

These deferrals do not prohibit a product surface from owning its own aggregate orchestration when the semantics belong specifically to that surface.

## Follow-up risk

Supported-criteria knowledge is duplicated between `nameCriteriaCompiler.ts` and `nameCriteriaDiagnostics.ts`.

Before materially expanding shared criteria targets, supported-target metadata should be centralized or a shared helper such as `isCriteriaClauseCompiled(...)` should be introduced. Keep that as a separately scoped runtime cleanup rather than coupling it to the `generateName(...)` boundary refactor unless required.

## Historical docs

Some older documents describe earlier Fiction Cast, style-pack, source-descriptor, singular-only, or universal-grouping planning states. Keep genuinely historical documents for context, but current-state guidance must defer to Decision 0006, current product scope, current architecture, the active request requirements, and the model/module contracts listed above.
