# NameRequest v1 requirements

## Goal

Define the shared criteria-driven request/response platform operation:

```text
NameRequest -> NameResponse
```

V1 supports the existing singular default and an exact independent set without introducing Cast-specific backend semantics, prompt-first UX, or LLM parsing.

This contract is platform and transport infrastructure. It does **not** define the reusable semantic naming callback hierarchy. That hierarchy is defined by [`../decisions/0006-naming-capabilities-and-surface-composition.md`](../decisions/0006-naming-capabilities-and-surface-composition.md): reusable semantic `-Name` callbacks sit above one generic singular `generateName(...)` primitive, while surface-specific aggregate orchestration may sit above those callbacks.

The request contract was designed independently from the naming-layer refactor. Issue #186 implements `generateName(...)` underneath the request adapter without changing the v1 request/response semantics defined here. `generateGivenName(...)` is implemented as a separate reusable semantic capability above that primitive; `generateFamilyName(...)` and `generatePlaceName(...)` are accepted first-class wrappers pending #202. The generic request adapter still calls `generateName(...)` because this request does not currently assert a semantic name kind.

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

### Out of scope of this request-contract definition

- Defining the concrete `generateName(...)` naming-layer API. That boundary is implemented separately by issue #186.
- Defining the semantic callback contracts themselves. `generateGivenName(...)` is implemented separately; `generateFamilyName(...)` and `generatePlaceName(...)` are accepted separately and pending #202. Their first-class status does not alter this transport contract.
- Defining typed naming-lexicon / finite-choice contracts for bounded lexical values such as particles or generational suffixes.
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

Each result preserves display text and supported sound, spelling, identity, variant, and diagnostic metadata.

Cast role or ensemble data is not part of the shared request requirement. Issue #201 tracks remaining Cast role metadata on generic plan/result/artifact contracts rather than treating those optional fields as a durable request-platform requirement.

The current artifact may retain legacy `silhouette` compatibility evidence backed by `NameGenerationPlan`; that property is not a required request input or naming callback.

Issue #203 separately owns clarification of primitive generated-name versus composed-identity result semantics. This request contract does not require a universal heterogeneous `NameSegment` abstraction or omnibus `generatePersonName(...)` composer.

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

The implementation may retain indexed `silhouette-*` evidence IDs for compatibility, but silhouette identity is **not** a durable requirement of this request contract and does not constrain `generateName(...)` or semantic callback contracts.

This atomic independent-set requirement also does not prohibit a surface-specific aggregate operation from orchestrating semantic callbacks under a different product contract when the cross-name semantics belong to that surface.

### REQ-007 - Keep `mode` non-semantic

Two requests differing only by `mode` produce identical grouping metadata and generated artifacts. `mode` may be echoed or used for diagnostics, but it must not choose quantity, grouping, generic `generateName(...)` behavior, or semantic callback behavior implicitly.

A surface chooses its semantic callback explicitly and passes configuration derived from its UX.

### REQ-008 - Preserve structured criteria and diagnostics

Unsupported or partially implemented shared criteria remain safe and explicit. Diagnostics do not replace functional implementation for supported criteria and do not become public fit scores.

Semantic callbacks may additionally own typed configuration that does not belong in the universal `NameCriteria` vocabulary. Typed `options` facades may encapsulate more granular source or linguistic details without making them request-level fields.

### REQ-009 - Preserve singular compatibility

When quantity and grouping are omitted:

- exactly one artifact is returned;
- the resolved request records exact quantity 1 and independent-set grouping;
- the parent seed remains the child seed for index 0;
- the generated artifact remains compatible with the previous singular deterministic stream.

This compatibility requirement concerns the request platform. The underlying implementation delegates to the generic singular `generateName(...)` primitive while preserving the request seed partition and observable contract.

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

Tests must not enshrine `NameSilhouette` as a required request-platform concept. Direct planning tests may cover internal `NameGenerationPlan` mechanics separately from the request contract.

## Relationship to naming capabilities

The accepted ordered generated-name API direction is:

```text
surface-specific aggregate orchestration, when needed
        -> reusable semantic `-Name` callback(s)
        -> generic singular generateName(...)
        -> generic mechanics
```

`NameRequest -> NameResponse` remains useful alongside this hierarchy for shared criteria, replay, independent quantity, service/adapter boundaries, and artifact transport. The two concepts must not be conflated.

The request adapter consumes `generateName(...)` directly. `generateGivenName(...)` is implemented as a separate semantic layer and is selected only where the caller actually asserts given-name semantics. `generateFamilyName(...)` and `generatePlaceName(...)` are accepted first-class wrappers pending #202; they may initially be behavior-equivalent to the primitive but must still delegate to it rather than creating duplicate generators.

Finite lexical vocabulary selection is a separate adjacent capability and does not change this request contract.

## Validation

Code changes implementing or modifying this contract must pass the repository TypeScript/Vite build and Vitest suite against the exact pull-request head.
