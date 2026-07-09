# Future NameGrouping design boundary

This design note defines the boundary for future grouping work after the implemented singular NameRequest v1 path.

## Current invariant

NameRequest v1 is singular today.

```text
NameRequest -> NameResponse containing exactly one NameArtifact
```

The current public request shape remains:

```ts
{
  version: 1;
  criteria: NameCriteria;
  mode?: string;
  random?: RandomizationRequest;
}
```

`quantity`, `grouping`, `NameGrouping`, and `NameSetCriteria` are not current API fields.

## Why grouping is future work

Grouping is a product and contract decision, not just a loop around generation.

Grouped output may need to represent set intent, slot intent, per-slot criteria, aggregate diagnostics, export behavior, inspect behavior, and persistence behavior. Adding those concepts directly to runtime before the contract is designed would blur the current singular v1 guarantee.

## Future concepts

These names are design vocabulary only until an implementation slice accepts them.

### NameQuantity

Represents requested output count or range.

Open questions:

- Is quantity exact or advisory?
- Does quantity apply to artifacts, groups, slots, or candidate pools?
- How are partial results represented?

### NameGrouping

Represents how multiple names relate to one another.

Potential grouping kinds:

- `none`: current singular behavior.
- `set`: independent names generated under shared criteria.
- `ranked-list`: multiple alternatives for one naming problem.
- `slots`: named roles such as given/family/place/team/member.
- `cast`: product-specific grouped identity surface, not a global engine assumption.

### NameSetCriteria

Represents criteria that apply to a set or group.

Open questions:

- Which criteria are global?
- Which criteria are per-slot?
- Which criteria describe contrast, cohesion, diversity, or compatibility across names?
- How do diagnostics distinguish unsupported global criteria from unsupported slot criteria?

## Boundary rules

- Do not add grouping fields to the current public v1 `NameRequest` until a contract slice is accepted.
- Do not make `mode` drive grouping behavior.
- Do not make Fiction Cast concepts global engine assumptions.
- Do not expose candidate scoring as public group fit scoring.
- Do not add public Criteria Match or fit percentage UI as part of grouping design.
- Do not implement runtime grouping in this docs-only slice.

## Runtime non-goals

- No runtime grouping.
- No plural quantity behavior.
- No slotted generation.
- No grouped response shape.
- No new active modes.
- No UI changes.
- No persistence changes.
- No export changes.
- No LLM prompt-first UI.

## Future design questions

- Should grouping be versioned as a v2 request contract or an additive v1 extension?
- Should grouped responses keep `names` flat or introduce explicit group/set objects?
- How should diagnostics attach to groups, slots, and individual artifacts?
- How should random seeds behave across a group?
- How should exports represent grouped outputs?
- How should Inspect navigate group-level versus artifact-level facts?
- Which product surface needs grouping first: richer criteria, persistence, Inspect/export hardening, or a next mode exploration?

## Safe next step after this boundary

A future implementation slice may introduce type-only contract sketches or experimental docs for grouping. Runtime behavior should remain singular until the request/response shape, diagnostics model, and product consumer are explicit.
