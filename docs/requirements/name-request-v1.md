# NameRequest v1 requirements

## Goal

Define the shared criteria-driven naming operation:

```text
NameRequest -> NameResponse
```

V1 supports the existing singular default and an exact independent set without introducing Cast-specific backend semantics, prompt-first UX, or LLM parsing.

## References

- [`../decisions/0001-name-artifact-and-request-contract.md`](../decisions/0001-name-artifact-and-request-contract.md)
- [`../decisions/0002-criteria-driven-generation.md`](../decisions/0002-criteria-driven-generation.md)
- [`../decisions/0003-intent-criteria-compiler-pipeline.md`](../decisions/0003-intent-criteria-compiler-pipeline.md)
- [`../decisions/0004-modes-presets-and-grouping.md`](../decisions/0004-modes-presets-and-grouping.md)
- [`name-grouping-design-boundary.md`](name-grouping-design-boundary.md)
- [`../model-module-contracts.md`](../model-module-contracts.md)
- [`../current-product-scope.md`](../current-product-scope.md)

## Scope

### In scope

- `NameRequest`, `ResolvedNameRequest`, `NameResponse`, and `NameArtifact`.
- Structured `NameCriteria` and deterministic criteria diagnostics.
- Resolved parent seeds and replay metadata.
- Optional `mode` metadata that does not branch generation.
- Optional exact quantity and explicit independent-set grouping.
- One atomic ordered generation operation.
- Flat ordered `NameArtifact[]` output plus grouping metadata.
- Singular compatibility when quantity/grouping are omitted.

### Out of scope

- Cohesion or diversity optimization.
- Ranked-alternative grouping.
- Slotted sets or slot criteria.
- Cast roles, locks, or ensemble scoring as shared engine concepts.
- Partial-result recovery or per-artifact reroll.
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

- `criteria` is explicit and structured.
- `mode`, `quantity`, `grouping`, and `random` are optional.
- No mode-specific request family is introduced.
- Omitted quantity/grouping preserve singular behavior.

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

### REQ-006 - Generate atomically

Plural output is produced inside the shared engine operation. Clients and UI modes must not implement this contract by aggregating repeated singular requests.

Each child generation receives:

- its deterministic child seed;
- its ordered artifact index;
- the same normalized criteria and grouping semantics.

Artifact and silhouette identities must reflect their ordered indexes so equal display values do not create duplicate durable IDs.

### REQ-007 - Keep `mode` non-semantic

Two requests differing only by `mode` produce identical grouping metadata and generated artifacts. `mode` may be echoed or used for diagnostics, but it must not choose quantity, grouping, or generation behavior.

### REQ-008 - Preserve structured criteria and diagnostics

Unsupported or partially implemented criteria remain safe and explicit. Diagnostics do not replace functional implementation for supported criteria and do not become public fit scores.

### REQ-009 - Preserve singular compatibility

When quantity and grouping are omitted:

- exactly one artifact is returned;
- the resolved request records exact quantity 1 and independent-set grouping;
- the parent seed remains the child seed for index 0;
- the generated artifact remains compatible with the previous singular deterministic stream.

### REQ-010 - Validate the contract

Tests cover:

- omitted quantity/grouping;
- exact count and supported bounds;
- deterministic child-seed derivation;
- child-seed-to-artifact positional association;
- ordered replay and prefix stability;
- indexed artifact and silhouette identity;
- duplicate display values retaining distinct artifact IDs;
- mode neutrality;
- invalid quantity rejection;
- existing typed response fixtures.

## Validation

Code changes implementing this contract must pass the repository TypeScript/Vite build and Vitest suite against the exact pull-request head.
