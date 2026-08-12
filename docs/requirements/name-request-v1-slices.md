# NameRequest v1 implementation slices

## Purpose

This document records the implementation sequence that established the criteria-driven request contract and the first shared quantity/grouping extension.

It is an implementation-history document, not the active naming-API roadmap. Decision 0006 distinguishes the request platform from the reusable semantic callback hierarchy and explicitly demotes silhouette-shaped generation from architectural API status. Issue #186 has since implemented the singular `generateName(...)` boundary beneath this request platform.

Read the active requirements and architecture first:

- [`name-request-v1.md`](name-request-v1.md)
- [`name-grouping-design-boundary.md`](name-grouping-design-boundary.md)
- [`../decisions/0006-naming-capabilities-and-surface-composition.md`](../decisions/0006-naming-capabilities-and-surface-composition.md)
- [`../current-product-scope.md`](../current-product-scope.md)

## Sequencing principle

The request contract was built from the outside inward:

```text
Types
  -> request resolution
  -> response mapping
  -> generator adapter
  -> criteria bridge
  -> criteria-driven selection
  -> UI criteria controls
  -> exact quantity and independent-set grouping
```

Slices 1-8 established the singular-compatible request foundation. Slice 9 records the first accepted plural platform extension. This historical sequence does **not** imply that richer generic grouping is the next architectural layer or the preferred implementation for nuanced surface-specific aggregates.

## Slice 1 - Contract model types

### Goal

Introduce the durable request, response, artifact, criteria, randomization, and diagnostic types without changing runtime behavior.

### Implemented scope

- `NameRequest`
- `ResolvedNameRequest`
- `NameResponse`
- `NameArtifact`
- `NameCriteria`
- `NameCriteriaClause`
- `RandomizationRequest`
- `RandomizationResult`
- `NameDiagnostic`

### Boundary

Types live in engine modules rather than UI modules. No mode-specific request family was introduced.

## Slice 2 - Request resolver and seed handling

### Goal

Resolve a raw request into a deterministic `ResolvedNameRequest`.

### Implemented scope

- resolve missing `random.seed`;
- preserve supplied seed;
- preserve optional `mode` metadata;
- normalize missing or empty criteria;
- attach `RandomizationResult` metadata.

### Contract

The same request and seed resolve identically. `mode` is retained as metadata but excluded from generation-driving behavior.

## Slice 3 - NameArtifact mapper

### Goal

Map selected generator output into the durable `NameArtifact` noun without flattening it to plain text.

### Implemented scope

- display text;
- sound and current silhouette metadata;
- selected spelling and retained ranked spellings;
- identity and variant metadata where available;
- current diagnostics and warnings.

Cast role and ensemble metadata are not intrinsic to every artifact.

The presence of silhouette metadata here records the implemented artifact shape at this stage. It does not make `NameSilhouette` a durable generation API. Issue #186 retained the property as compatibility/evidence while replacing the caller-facing silhouette abstraction with internal `NameGenerationPlan` materialization behind `generateName(...)`.

## Slice 4 - Singular NameRequest adapter

### Goal

Create the first `NameRequest -> NameResponse` runtime behavior over the current generator path.

### Implemented scope

- resolve request and seed;
- bridge criteria into current generation settings;
- generate and select one name;
- map it to `NameArtifact`;
- return `NameResponse` with one artifact.

This singular path remains the compatibility baseline used when quantity and grouping are omitted. The adapter is platform infrastructure; it is not the final reusable semantic naming API. It now delegates singular production through `generateName(...)`.

## Slice 5 - Criteria diagnostics bridge

### Goal

Make accepted-but-unimplemented criteria explicit without blocking ordinary generation.

### Implemented scope

- classify supported, partially implemented, and unsupported criteria;
- return deterministic diagnostics;
- keep generation best-effort.

Diagnostics do not substitute for functional support and do not expose public fit percentages.

## Slice 6 - Criteria-to-generator compiler

### Goal

Make a small high-value subset of `NameCriteria` affect generation.

### Implemented scope

Current supported targets compile into `GenerationSettings`, including selected sound, practical, spelling, and avoidance pressures where implemented.

Unsupported targets continue to produce diagnostics rather than pretending to work.

`NameCriteria` remains shared request intent. Reusable semantic callbacks may additionally own typed configuration specific to their domain rather than expanding criteria into a universal schema.

## Slice 7 - Internal candidate scoring boundary

### Goal

Define where criteria-driven selection pressure belongs.

### Implemented scope

- evaluate candidates against compiled settings;
- use deterministic score components for internal selection;
- preserve ranked spelling behavior;
- keep scores internal or debug-facing.

Candidate scores are not public Criteria Match percentages.

## Slice 8 - Configure criteria surface

### Goal

Align bounded UI controls with criteria language without introducing prompt-first or LLM behavior.

### Implemented boundary

- current Fiction Cast workflow remains intact;
- controls remain bounded and understandable;
- UI language does not claim unsupported criteria behavior;
- no public fit percentage or large universal chip taxonomy was added.

## Slice 9 - Exact independent-set grouping

### Goal

Add the first shared quantity and grouping behavior without importing Fiction Cast semantics into the universal engine contract.

### Implemented request fields

```ts
quantity?: { readonly kind: "exact"; readonly value: number };
grouping?: { readonly kind: "independent-set" };
```

Omitted values resolve to exact quantity 1 and `independent-set`, preserving singular compatibility.

### Implemented runtime behavior

- validate exact quantity from 1 through 100;
- resolve one parent seed per request;
- derive one deterministic child seed per artifact index;
- generate all requested artifacts inside one atomic engine operation;
- return flat ordered `NameArtifact[]` output;
- return grouping metadata with quantity, parent seed, and child seeds;
- preserve `grouping.childSeeds[index] -> names[index]` association;
- use artifact indexes for current artifact and silhouette evidence identity;
- preserve deterministic replay and quantity-prefix stability;
- keep `mode` metadata non-semantic.

The indexed silhouette evidence above is an implementation fact of this slice, not a future naming-layer requirement.

### Acceptance contract

- `names.length` equals resolved exact quantity;
- child-seed count equals artifact count;
- omitted quantity/grouping returns the previous singular deterministic output;
- equal display values retain distinct durable IDs;
- requests differing only by `mode` return identical artifacts and grouping metadata;
- out-of-range quantities fail before generation.

### Explicit non-goals

- cohesion or diversity optimization;
- ranked alternatives for one naming problem;
- slotted sets and slot-level criteria;
- aggregate or per-slot diagnostics;
- partial-result recovery;
- per-artifact reroll or child replacement;
- Fiction Cast roles, locks, or ensemble scoring as shared engine behavior;
- Game NPC roster UI.

## Deferred beyond the implemented slices

These remain possible **generic request/platform** extensions, not the current naming-layer sequence and not prerequisites for surface-specific aggregate orchestration:

- optimized set relationships such as cohesion, contrast, or diversity;
- ranked-list grouping;
- slotted generation;
- group-level persistence, Inspect, and export behavior;
- LLM-assisted criteria filling;
- public Criteria Match UI or fit percentages;
- domain, trademark, or availability checks;
- baby-name mode.

New surfaces and surface-owned aggregate behavior are governed by current product scope and Decision 0006 rather than by this historical slice sequence.

## Validation discipline

Each behavior slice must preserve deterministic positive contracts through exact tests. The exact independent-set slice covers:

- default singular resolution;
- exact count;
- supported quantity bounds;
- deterministic child-seed sequence;
- child-seed positional association;
- replay;
- prefix stability;
- current indexed artifact and silhouette evidence identity;
- duplicate display-value identity safety;
- mode neutrality;
- typed request/response fixtures.

Repository CI must run TypeScript/Vite build and Vitest against the exact pull-request head.

## Follow-up risk

Supported-target knowledge remains duplicated between `nameCriteriaCompiler.ts` and `nameCriteriaDiagnostics.ts`. Centralizing that knowledge should be a separate coherent cleanup before substantially expanding criteria targets.

The active naming-layer sequence is tracked in [`../current-product-scope.md`](../current-product-scope.md). With issue #186 complete, the next architecture slice is to build reusable typed semantic callbacks from real domain semantics on top of `generateName(...)`, while keeping nuanced aggregate behavior surface-owned unless reuse is demonstrated.
