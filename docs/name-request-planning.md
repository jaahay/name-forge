# NameRequest planning map

This document is a navigation map for the NameRequest and criteria-driven generation planning work.

It does not introduce new doctrine. It points to the canonical planning documents and gives future implementation work a stable read order.

## Current direction

Name Forge is moving toward one durable naming operation:

```text
NameRequest -> NameResponse
```

The primary output artifact is `NameArtifact`.

The stable input model is `NameCriteria`.

The planning pipeline is:

```text
Intent surfaces
  -> NameCriteria
  -> compiled criteria
  -> SoundProfile / spelling preferences / exclusions / selection inputs
  -> candidate generation and scoring
  -> NameArtifact
```

## Read order

1. [`decisions/0001-name-artifact-and-request-contract.md`](decisions/0001-name-artifact-and-request-contract.md)
   - Establishes `NameArtifact` and `NameRequest -> NameResponse`.
2. [`decisions/0002-criteria-driven-generation.md`](decisions/0002-criteria-driven-generation.md)
   - Establishes criteria-driven generation and internal candidate scoring.
3. [`decisions/0003-intent-criteria-compiler-pipeline.md`](decisions/0003-intent-criteria-compiler-pipeline.md)
   - Establishes intent surfaces as producers of `NameCriteria`.
4. [`decisions/0004-modes-presets-and-grouping.md`](decisions/0004-modes-presets-and-grouping.md)
   - Establishes mode, preset, skin, and grouping boundaries.
5. [`current-product-scope.md`](current-product-scope.md)
   - Active product-scope lens and next feature priorities.
6. [`product-architecture.md`](product-architecture.md)
   - Product vocabulary, workbench loop, criteria UI direction, and mode strategy.
7. [`architecture.md`](architecture.md)
   - Engine-level direction and pipeline boundaries.
8. [`model-module-contracts.md`](model-module-contracts.md)
   - Planned request/criteria model contracts and current module ownership.
9. [`requirements/name-request-v1.md`](requirements/name-request-v1.md)
   - Requirements for the first implementation slice.
10. [`requirements/name-request-v1-slices.md`](requirements/name-request-v1-slices.md)
    - Suggested future PR decomposition.

## Canonical implementation starting point

Start future implementation work from:

```text
docs/requirements/name-request-v1-slices.md
```

The first implementation issue should probably be:

> Add NameRequest v1 model contracts

Then proceed to request resolution, seed handling, `NameArtifact` mapping, and the singular `NameRequest -> NameResponse` adapter.

## Do not start with

The following are explicitly deferred from the first implementation slice:

- plural generation
- grouping behavior
- Cast extraction
- slot criteria
- public Criteria Match UI
- fit percentages
- prompt-first UX
- LLM parsing
- large chip-library UI
- new active modes
- baby-name mode

These can become real work later, but they should not block the singular request contract.

## Historical docs

Some older documents still describe the project in terms of Fiction cast, style packs, source descriptors, or style input. Keep those documents for historical context unless this planning direction explicitly updates them.

When there is a conflict, prefer the decision records and the current product-scope document for future implementation planning.
