# NameRequest v1 requirements

## Goal

Define the shared criteria-driven request/response platform operation:

```text
NameRequest -> NameResponse
```

V1 supports the existing singular default and an exact independent set without introducing Cast-specific backend semantics, prompt-first UX, or LLM parsing.

This contract is platform and transport infrastructure. It does **not** define the reusable semantic naming callback hierarchy. That hierarchy is defined by [`../decisions/0006-naming-capabilities-and-surface-composition.md`](../decisions/0006-naming-capabilities-and-surface-composition.md): reusable semantic callbacks sit above one generic singular `generateName(...)` primitive, while surface-specific aggregate orchestration may sit above those callbacks.

## References

- [`../decisions/0001-name-artifact-and-request-contract.md`](../decisions/0001-name-artifact-and-request-contract.md)
- [`../decisions/0002-criteria-driven-generation.md`](../decisions/0002-criteria-driven-generation.md)
- [`../decisions/0003-intent-criteria-compiler-pipeline.md`](../decisions/0003-intent-criteria-compiler-pipeline.md)
- [`../decisions/0004-modes-presets-and-grouping.md`](../decisions/0004-modes-presets-and-grouping.md)
- [`../decisions/0005-sound-profile-product-boundary.md`](../decisions/0005-sound-profile-product-boundary.md)
- [`../decisions/0006-naming-capabilities-and-surface-composition.md`](../decisions/0006-naming-capabilities-and-surface-composition.md)
- [`name-grouping-design-boundary.md`](name-grouping-design-boundary.md)
- [`../model-module-contracts.md`](../model-module-contracts.md)
- [`../current-product-scope.md`](../current-product-scope.md)

## Scope

### In scope

- `NameRequest`, `ResolvedNameRequest`, `NameResponse`, and `NameArtifact`.
- Structured shared `NameCriteria` and deterministic criteria diagnostics.
- Resolved parent seeds and replay metadata.
- Optional `mode` metadata that does not branch generic generation.
- Optional exact quantity and explicit independent-set grouping.
- One atomic ordered independent-generation operation.
- Flat ordered `NameArtifact[]` output plus grouping metadata.
- Singular compatibility when quantity/grouping are omitted.

### Out of scope

- The concrete `generateName(...)` semantic/naming-layer API refactor.
- Reusable `generateGivenName(...)`, `generateFamilyName(...)`, `generatePlaceName(...)`, or other semantic callback contracts.
- Surface-specific aggregate operations such as a future Fiction Cast generation callback.
- Cohesion or diversity optimization as a reusable shared grouping contract.
- Ranked-alternative grouping.
- Generic slotted sets or slot criteria.
- Cast roles, locks, or ensemble scoring as shared engine concepts.
- Partial-result recovery or generic per-artifact reroll.
- Public Criteria Match or fit percentages.
- Prompt-first UX, LLM parsing, or external availability checks.

## Requirements

### REQ-001 - Define `NameRequest`

The request model includes:

```ts
type NameRequest = {
  readonly version: 1;
  readonly criteria: NameCriteria;
  readonly mode?: string;
  readonly quantity?: { readonly kind: "exact"; readonly value: number };
  readonly grouping?: { readonly kind: "independent-set" };
  readonly random?: RandomizationRequest;
};
```

Acceptance criteria:

- `criteria` is explicit and structured shared request intent.
- `mode`, `quantity`, `grouping`, and `random` are optional.
- No mode-specific transport/request family is introduced merely because surfaces differ.
- Omitted quantity/grouping preserve singular behavior.
- This requirement does not prohibit typed semantic callback names above the generic singular naming primitive.

### REQ-002 - Resolve exact quantity and grouping

- Omitted quantity resolves to `{ kind: "exact", value: 1 }`.
- Omitted grouping resolves to `{ kind: "independent-set" }`.
- Exact quantity must be an integer from 1 through `MAX_EXACT_NAME_QUANTITY`.
- The current shared maximum is 100 artifacts.
- Invalid quantities fail before generation.

### REQ-003 - Define `NameResponse`

The response includes:

```ts
type NameResponse = {
  readonly version: 1;
  readonly request: ResolvedNameRequest;
  readonly names: readonly NameArtifact[];
  readonly grouping: {
    readonly kind: "independent-set";
    readonly quantity: number;
    readonly parentSeed: string;
    readonly childSeeds: readonly string[];
  };
  readonly random: RandomizationResult;
  readonly diagnostics?: readonly NameDiagnostic[];
};
```

Acceptance criteria:

- `names.length` equals the resolved exact quantity.
- `grouping.childSeeds.length` equals `names.length`.
- `grouping.childSeeds[index]` generated `names[index]`.
- Individual results remain durable `NameArtifact` values rather than group wrappers.

### REQ-004 - Preserve `NameArtifact`

Each result preserves display text and supported sound, spelling, identity, variant, and diagnostic metadata. Cast role or ensemble data is not required for every artifact.

### REQ-005 - Resolve randomness deterministically

- One parent seed is resolved per request.
- Index 0 uses the parent seed directly to preserve the previous singular stream.
- Later indexes use deterministic child seeds derived from the parent seed and index.
- The same normalized request, parent seed, algorithm version, and engine data reproduce the same ordered artifacts.
- Increasing quantity preserves the existing result prefix.

### REQ-006 - Generate an independent set atomically

The `independent-set` contract is produced inside the shared platform operation. Clients must not claim conformance to this exact atomic contract by aggregating unrelated singular calls after the fact.

Each child generation receives:

- its deterministic child seed;
- its ordered artifact index;
- the same normalized shared criteria and independent grouping semantics.

Artifact identities must remain distinct and addressable even when display values collide.

Current silhouette indexing may continue as an implementation detail while `NameSilhouette` exists, but silhouette identity is **not** a durable requirement of this request contract and must not constrain the `generateName(...)` refactor from Decision 0006.

This atomic independent-set requirement also does not prohibit a surface-specific aggregate operation from orchestrating semantic callbacks under a different product contract when the cross-name semantics belong to that surface.

### REQ-007 - Keep `mode` non-semantic

Two requests differing only by `mode` produce identical grouping metadata and generated artifacts. `mode` may be echoed or used for diagnostics, but it must not choose quantity, grouping, generic `generateName(...)` behavior, or semantic callback behavior implicitly.

A surface chooses its semantic callback explicitly and passes configuration derived from its UX.

### REQ-008 - Preserve structured criteria and diagnostics

Unsupported or partially implemented shared criteria remain safe and explicit. Diagnostics do not replace functional implementation for supported criteria and do not become public fit scores.

Semantic callbacks may later own additional typed configuration that does not belong in the universal `NameCriteria` vocabulary.

### REQ-009 - Preserve singular compatibility

When quantity and grouping are omitted:

- exactly one artifact is returned;
- the resolved request records exact quantity 1 and independent-set grouping;
- the parent seed remains the child seed for index 0;
- the generated artifact remains compatible with the previous singular deterministic stream.

This compatibility requirement concerns the request platform. The underlying implementation may be migrated to the generic singular `generateName(...)` primitive as long as behavior remains compatible.

### REQ-010 - Validate the contract

Tests cover:

- omitted quantity/grouping;
- exact count and supported bounds;
- deterministic child-seed derivation;
- child-seed-to-artifact positional association;
- ordered replay and prefix stability;
- distinct artifact identity for ordered outputs, including duplicate display values;
- mode neutrality;
- invalid quantity rejection;
- existing typed response fixtures.

Tests should not enshrine `NameSilhouette` as a required request-platform concept merely because the current runtime still uses it internally.

## Relationship to naming capabilities

The accepted ordered naming API direction is:

```text
surface-specific aggregate orchestration, when needed
        -> reusable semantic callback(s)
        -> generic singular generateName(...)
        -> generic mechanics
```

`NameRequest -> NameResponse` remains useful alongside this hierarchy for shared criteria, replay, independent quantity, service/adapter boundaries, and artifact transport. The two concepts must not be conflated.

## Validation

Code changes implementing or modifying this contract must pass the repository TypeScript/Vite build and Vitest suite against the exact pull-request head.
