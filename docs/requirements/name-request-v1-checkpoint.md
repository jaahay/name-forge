# NameRequest v1 checkpoint after Slices 1-8

This checkpoint records the implemented NameRequest v1 state after Slices 1-8 and preserves the boundary before Slice 9 grouping design.

## Implemented arc

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

## Current v1 architecture

The implemented core operation is:

```text
NameRequest -> NameResponse
```

The stable input model is `NameCriteria`.

The primary output artifact is `NameArtifact`.

The current runtime path is:

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

`mode` is optional metadata. It may preserve product/UI context, but it must not drive v1 generation behavior.

`random.seed` is optional in the request and always emitted in the response. If omitted, the request resolver creates a fresh seed and records the `name-forge-v1` algorithm.

## Singular response boundary

V1 returns exactly one name artifact.

The response keeps `names` as an array because the durable contract can later extend to quantity and grouping, but current runtime behavior is singular. Do not treat `names.length > 1` as supported behavior yet.

## Current criteria support boundary

The criteria compiler supports a small implemented subset of `NameCriteria` by translating criteria into current `GenerationSettings`.

Diagnostics report unsupported and partially implemented criteria honestly. Unsupported criteria should not fail normal v1 generation by default; the adapter continues with neutral best-effort settings and returns one artifact.

Follow-up risk: supported-criteria knowledge is duplicated between `nameCriteriaCompiler.ts` and `nameCriteriaDiagnostics.ts`. Before expanding supported criteria targets, centralize supported-target metadata or introduce a shared helper such as `isCriteriaClauseCompiled(...)`.

## Internal candidate scoring boundary

Candidate selection scoring is internal machinery only.

It can influence which generated result or spelling candidate is selected. It must not leak into public response artifacts as a fit percentage, Criteria Match percentage, or polished public scoring UI.

## Active app surface boundary

Fiction Cast remains the active app surface. It can keep Cast-facing concepts such as role mix, slot controls, cast health, and export language in the product UI.

Those Cast concepts are not global engine assumptions. The shared v1 request contract remains criteria-driven and singular.

## Deferred before Slice 9 implementation

The following remain explicit non-goals until a design-only grouping spike has been accepted:

- no runtime grouping
- no plural quantity behavior
- no slotted generation
- no public API grouping support
- no new active modes
- no LLM prompt-first UI
- no public Criteria Match UI
- no public fit percentage UI

## Slice 9 handoff

Slice 9 should start as a design-only grouping spike. It should clarify future quantity and grouping concepts before runtime implementation begins.

A safe design spike may discuss future concepts such as `NameQuantity`, `NameGrouping`, `NameSetCriteria`, and slotted sets. It should not add those fields to the current public v1 `NameRequest` API or change runtime generation behavior.
