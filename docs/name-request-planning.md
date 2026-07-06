# NameRequest planning map

This document is a navigation map for the NameRequest and criteria-driven generation planning work.

It points to the canonical planning documents, marks the current Slice 1-8 checkpoint, and gives future implementation work a stable read order.

## Current direction

Name Forge now has one durable naming operation:

```text
NameRequest -> NameResponse
```

The primary output artifact is `NameArtifact`.

The stable input model is `NameCriteria`.

The implemented v1 runtime pipeline is:

```text
NameRequest
  -> resolve seed / criteria / optional mode metadata
  -> diagnostics
  -> compile NameCriteria into current GenerationSettings
  -> generate sound/silhouette/spelling candidates
  -> internally select spelling candidate when compiled criteria request selection pressure
  -> map GeneratedName to NameArtifact
  -> NameResponse containing exactly one artifact
```

## Slice 1-8 checkpoint

Slices 1-8 of the NameRequest v1 sequence have landed in `main`:

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

This checkpoint means future work should treat the singular v1 request/response path as implemented, not planned. It also means the next implementation step should be a docs-only checkpoint PR that makes Slice 9 safe to start as a design-only grouping spike.

Slice 9 should remain design-only until the grouping model is explicitly accepted. Do not implement runtime grouping merely because the design vocabulary exists.

## Read order

1. [`requirements/name-request-v1-checkpoint.md`](requirements/name-request-v1-checkpoint.md)
   - Checkpoint after Slices 1-8 and explicit boundary before Slice 9.
2. [`decisions/0001-name-artifact-and-request-contract.md`](decisions/0001-name-artifact-and-request-contract.md)
   - Establishes `NameArtifact` and `NameRequest -> NameResponse`.
3. [`decisions/0002-criteria-driven-generation.md`](decisions/0002-criteria-driven-generation.md)
   - Establishes criteria-driven generation and internal candidate scoring.
4. [`decisions/0003-intent-criteria-compiler-pipeline.md`](decisions/0003-intent-criteria-compiler-pipeline.md)
   - Establishes intent surfaces as producers of `NameCriteria`.
5. [`decisions/0004-modes-presets-and-grouping.md`](decisions/0004-modes-presets-and-grouping.md)
   - Establishes mode, preset, skin, and grouping boundaries.
6. [`current-product-scope.md`](current-product-scope.md)
   - Active product-scope lens and next feature priorities.
7. [`product-architecture.md`](product-architecture.md)
   - Product vocabulary, workbench loop, criteria UI direction, and mode strategy.
8. [`architecture.md`](architecture.md)
   - Engine-level direction and pipeline boundaries.
9. [`model-module-contracts.md`](model-module-contracts.md)
   - Implemented v1 request/criteria model contracts, future grouping boundary, and current module ownership.
10. [`requirements/name-request-v1.md`](requirements/name-request-v1.md)
    - Requirements for the first implementation sequence.
11. [`requirements/name-request-v1-slices.md`](requirements/name-request-v1-slices.md)
    - Slice decomposition and next grouping-design context.

## Canonical implementation starting point

Start the next planning pass from:

```text
docs/requirements/name-request-v1-checkpoint.md
```

Then read:

```text
docs/requirements/name-request-v1-slices.md
```

The next work should make Slice 9 safe as a design-only grouping spike. It should clarify future grouping and quantity contracts before any runtime behavior is added.

## Explicit non-goals before Slice 9 implementation

The following remain explicitly deferred:

- no runtime grouping
- no plural quantity behavior
- no slotted generation
- no new active modes
- no LLM prompt-first UI
- no public Criteria Match UI
- no public fit percentage UI
- no candidate scoring leakage into public response artifacts

These can become real work later, but they should not alter the implemented singular v1 request contract.

## Follow-up risk

Supported-criteria knowledge is duplicated between `nameCriteriaCompiler.ts` and `nameCriteriaDiagnostics.ts`.

Before expanding criteria targets, supported-target metadata should be centralized or a shared helper such as `isCriteriaClauseCompiled(...)` should be introduced. Keep that as a docs-tracked follow-up until a runtime cleanup PR is explicitly scoped.

## Historical docs

Some older documents still describe the project in terms of Fiction cast, style packs, source descriptors, or style input. Keep those documents for historical context unless this planning direction explicitly updates them.

When there is a conflict, prefer the decision records, the checkpoint doc, and the current product-scope document for future implementation planning.
