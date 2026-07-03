# NameRequest v1 requirements

## Goal

Introduce the first implementation slice for a criteria-driven naming contract without plural generation, grouping, Cast-specific backend semantics, prompt-first UX, or LLM parsing.

The target operation is:

```text
NameRequest -> NameResponse
```

V1 may return exactly one generated `NameArtifact` while preserving the future-compatible response shape.

## References

- [`../decisions/0001-name-artifact-and-request-contract.md`](../decisions/0001-name-artifact-and-request-contract.md)
- [`../decisions/0002-criteria-driven-generation.md`](../decisions/0002-criteria-driven-generation.md)
- [`../decisions/0003-intent-criteria-compiler-pipeline.md`](../decisions/0003-intent-criteria-compiler-pipeline.md)
- [`../decisions/0004-modes-presets-and-grouping.md`](../decisions/0004-modes-presets-and-grouping.md)
- [`../architecture.md`](../architecture.md)
- [`../model-module-contracts.md`](../model-module-contracts.md)
- [`../current-product-scope.md`](../current-product-scope.md)

## Scope

### In scope

- Planning/implementation types for:
  - `NameRequest`
  - `NameResponse`
  - `NameArtifact`
  - `NameCriteria`
  - `NameCriteriaClause`
  - `RandomizationRequest`
  - `RandomizationResult`
  - `NameDiagnostic`
- A resolver for omitted seed values.
- Deterministic same-request, same-seed behavior.
- Optional `mode` field accepted as metadata.
- One returned name artifact in v1.
- Documentation and tests that assert the current positive contract.

### Out of scope

- Plural generation.
- `quantity` implementation.
- `grouping` implementation.
- Cast/ensemble backend semantics.
- Slot criteria implementation.
- Public Criteria Match UI.
- Public fit percentages.
- Prompt-first UX.
- LLM parsing.
- Backend-required `BaseStyle` or `StylePack` request fields.
- Domain/trademark/external availability checks.

## Requirements

### REQ-001 - Define `NameRequest`

The implementation should define a v1 request model with:

- `version: 1`
- `criteria: NameCriteria`
- optional `mode?: string`
- optional `random?: RandomizationRequest`

`quantity` and `grouping` may be documented as future fields, but they should not be required for the v1 implementation.

Acceptance criteria:

- The type makes `criteria` explicit.
- The type does not require `mode`.
- The type does not require `StylePack`, `BaseStyle`, `Cast`, or `Role`.

### REQ-002 - Define `NameResponse`

The implementation should define a v1 response model with:

- `version: 1`
- `request: ResolvedNameRequest`
- `names: readonly NameArtifact[]`
- `random: RandomizationResult`
- optional `diagnostics?: readonly NameDiagnostic[]`

Acceptance criteria:

- The response returns names as an array, even when v1 returns exactly one name.
- The response always includes a resolved seed.
- The response does not require a group/set artifact.

### REQ-003 - Define `NameArtifact`

`NameArtifact` should be the durable artifact noun for the planned request/response contract.

In the first implementation slice, it may wrap or map from the current `GeneratedName` shape. It should preserve the current selected-name richness rather than flattening to text only.

Acceptance criteria:

- The artifact includes display text.
- The artifact preserves sound/spelling metadata where currently available.
- The artifact does not make Cast role or ensemble metadata intrinsic to every name.

### REQ-004 - Define `NameCriteria`

The implementation should define `NameCriteria` as a list of criteria clauses.

```ts
type NameCriteria = {
  readonly clauses: readonly NameCriteriaClause[];
};
```

Acceptance criteria:

- Criteria are structured, not free-form prose.
- Criteria are the explicit input to the naming contract.
- Current controls can be mapped or bridged into criteria over time.

### REQ-005 - Define `NameCriteriaClause`

A criteria clause should include:

- `id`
- `family`
- `polarity`
- `target`
- `strength`

The initial family set is:

- `sound`
- `shape`
- `register`
- `spelling`
- `semantic`
- `avoid`
- `practical`

Acceptance criteria:

- Positive, negative, and requirement-like criteria can be represented.
- Fine-tuning controls can be represented as criteria where practical.
- The model does not require an LLM or prompt parser.

### REQ-006 - Resolve random seed

If the request includes `random.seed`, the response should use and echo that seed.

If the request omits `random.seed`, the implementation should resolve a fresh seed and emit it in `random.seed`.

Acceptance criteria:

- Every response includes a seed.
- Same request plus same seed plus same algorithm version reproduces the same output.
- Omitted seed creates a reproducible run after the response is returned because the resolved seed is available.

### REQ-007 - Accept `mode` as metadata

The request may include `mode?: string`.

In v1, mode must not branch core generation behavior. It may be echoed, preserved in resolved request metadata, or used for diagnostics.

Acceptance criteria:

- Two requests differing only by `mode` produce the same generated name when criteria, seed, and algorithm are otherwise identical.
- Mode is not required to generate a name.
- Mode does not introduce Cast/Product/NPC-specific request types.

### REQ-008 - Return one generated name in v1

The first implementation slice should return one generated name artifact.

Acceptance criteria:

- `names.length === 1` for the v1 path.
- The implementation does not add plural or grouped generation behavior as part of this slice.
- Existing Fiction cast generation can continue to exist separately while the singular request contract is introduced.

### REQ-009 - Add diagnostics for unsupported criteria

The implementation may accept criteria before every target is fully operational.

Unsupported or partially implemented criteria should be handled safely and honestly.

Acceptance criteria:

- Unsupported criteria do not crash ordinary generation.
- Diagnostics can report unsupported or partially implemented criteria.
- Diagnostics do not replace functional implementation for criteria that are already supported.

### REQ-010 - Preserve current positive contracts in tests

Tests should assert current positive behavior rather than memorializing removed or deferred concepts.

Acceptance criteria:

- Tests assert deterministic output for fixed seed fixtures.
- Tests assert resolved seed behavior.
- Tests assert `mode` is non-semantic in v1.
- Tests assert one returned artifact for the v1 request path.
- Tests do not add negative legacy assertions merely to prove Cast/Product/NPC request types do not exist.

## Implementation notes

The first slice can be implemented as a thin request/response adapter over current generation code. It does not need to rewrite the generator all at once.

A likely internal flow:

```text
NameRequest
  -> resolve request and seed
  -> bridge criteria to current settings/profile path
  -> generate current candidate(s)
  -> select one current GeneratedName
  -> map to NameArtifact
  -> return NameResponse
```

The bridge may be intentionally small at first. The important contract is that criteria become the input shape and the response emits a reproducible `NameArtifact`.

## Validation

The implementation PR should run the repository's normal validation path. If working through connector-only GitHub access, PR CI/status checks should be used as the executable validation source.

Documentation-only planning changes do not require local validation, but code changes implementing this slice should include tests.
