# NameRequest platform map

This document is the current navigation map for the shared `NameRequest -> NameResponse` platform contract. It is not an implementation history and it does not define Fiction Cast composition semantics.

For the accepted naming-capability hierarchy, see [`decisions/0006-naming-capabilities-and-surface-composition.md`](decisions/0006-naming-capabilities-and-surface-composition.md). For active product scope, see [`current-product-scope.md`](current-product-scope.md).

## Current contract

Name Forge has one durable shared request/response operation:

```text
NameRequest -> NameResponse
```

The primary output unit is the singular `NameArtifact`. `NameCriteria` is the shared structured intent model for criteria that cross this generic request boundary.

The runtime path is:

```text
NameRequest
  -> resolve criteria, optional mode metadata, exact quantity, grouping, and parent seed
  -> diagnostics
  -> compile supported NameCriteria into generation settings
  -> derive one deterministic child seed per artifact index
  -> invoke singular generateName(...) per child seed
  -> map each GeneratedName to singular NameArtifact evidence
  -> NameResponse with flat ordered artifacts and grouping metadata
```

`generateName(...)` owns singular lexical-name orchestration and materializes `NameGenerationPlan` as generation evidence. The request adapter does not own product-surface composition.

## Quantity and grouping boundary

The shared request platform supports:

- omitted quantity/grouping resolving to exact quantity 1 and `independent-set`;
- explicit exact quantity from 1 through 100;
- deterministic parent and child seeds;
- atomic flat ordered `NameArtifact[]` output;
- positional association between `grouping.childSeeds[index]` and `names[index]`;
- deterministic replay and prefix stability.

`independent-set` means repeated independent generation. It is not a universal model for Fiction Cast ensembles, NPC rosters, taxonomies, or other nuanced multi-name product semantics.

`mode` remains optional metadata at this boundary. It must not silently select generation, grouping, or semantic callback behavior.

## Relationship to semantic naming capabilities

The reusable naming hierarchy is separate and ordered:

```text
product surface
  -> reusable semantic callback(s)
     generateGivenName(...)
     generateFamilyName(...)
     generatePlaceName(...)
  -> generic singular generateName(...)
  -> style / sound / spelling mechanics
```

The semantic wrappers delegate lexical-name generation to the same singular primitive. Product surfaces own the workflow and any composition or cross-name behavior that is meaningful only to that surface.

Finite lexical values such as particles or generational suffixes are a separate capability family. They do not need to enter `generateName(...)` or the `SoundProfile` model merely because they can appear inside a composed identity.

## Evidence boundary

`NameArtifact` remains singular. Generated sound, spelling, spelling candidates, generation-plan evidence, variants, and readability diagnostics may be inspected without turning the artifact into a generic composed identity.

Product surfaces may build richer identities around singular generated components. Fiction Cast owns its composed display identity and contextual evidence; the shared request platform does not generalize those surface semantics.

## Read order

1. [`decisions/0006-naming-capabilities-and-surface-composition.md`](decisions/0006-naming-capabilities-and-surface-composition.md)
   - Authoritative naming-capability and surface-composition direction.
2. [`current-product-scope.md`](current-product-scope.md)
   - Active product scope and current modes.
3. [`architecture.md`](architecture.md)
   - Current technical architecture and ownership boundaries.
4. [`requirements/name-request-v1.md`](requirements/name-request-v1.md)
   - Shared request/response requirements.
5. [`requirements/name-grouping-design-boundary.md`](requirements/name-grouping-design-boundary.md)
   - Exact independent-set boundary and deferred reusable grouping semantics.
6. [`decisions/0001-name-artifact-and-request-contract.md`](decisions/0001-name-artifact-and-request-contract.md)
   - Durable artifact and request/response contract, as refined by later decisions.
7. [`decisions/0002-criteria-driven-generation.md`](decisions/0002-criteria-driven-generation.md)
   - Shared structured criteria and internal candidate scoring.
8. [`decisions/0003-intent-criteria-compiler-pipeline.md`](decisions/0003-intent-criteria-compiler-pipeline.md)
   - Request-facing criteria pipeline.
9. [`decisions/0004-modes-presets-and-grouping.md`](decisions/0004-modes-presets-and-grouping.md)
   - Mode/preset boundaries, as refined by Decision 0006.
10. [`decisions/0005-sound-profile-product-boundary.md`](decisions/0005-sound-profile-product-boundary.md)
    - Sound/profile/style ownership below the naming capability layer.
11. [`product-architecture.md`](product-architecture.md)
    - Product surfaces, mode strategy, semantic capability reuse, and surface composition.
12. [`model-module-contracts.md`](model-module-contracts.md)
    - Current executable model/module contracts.

## Active direction

The request/grouping platform is a settled shared foundation, not the current product-design target. New surface behavior should remain surface-owned unless a cross-surface abstraction is demonstrated.

The active Fiction Cast design work is the UI/UX requirements boundary tracked by issue #212. That work may change navigation, inspection, controls, history, Help, export presentation, and other surface behavior without requiring the generic request contract to absorb Fiction Cast semantics.
