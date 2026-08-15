# NameGrouping implementation boundary

This note records the accepted runtime grouping contract for the shared `NameRequest -> NameResponse` platform operation.

It does **not** define a universal aggregate naming API. Decision 0006 distinguishes generic repeated independent generation from surface-specific multi-name orchestration that composes reusable semantic callbacks.

## Implemented invariant

NameRequest v1 supports either the existing singular default or an exact independent set:

```text
NameRequest
  -> resolve one parent seed
  -> derive one deterministic child seed per artifact index
  -> generate one atomic ordered independent set
  -> NameResponse with flat NameArtifact[] and grouping metadata
```

The public request extension is:

```ts
{
  version: 1;
  criteria: NameCriteria;
  mode?: string;
  quantity?: { kind: "exact"; value: number };
  grouping?: { kind: "independent-set" };
  random?: RandomizationRequest;
}
```

Omitting `quantity` and `grouping` resolves to `{ kind: "exact", value: 1 }` and `{ kind: "independent-set" }`, preserving the previous singular generation stream.

## Exact quantity

The implemented quantity is exact rather than advisory.

- Supported values are integers from 1 through `MAX_EXACT_NAME_QUANTITY`.
- The shared maximum is 100 artifacts per atomic request.
- Requests outside that range fail before generation.
- Partial-result recovery is not part of this contract.

## Independent-set grouping

`independent-set` means every artifact is generated under the same normalized shared criteria without cohesion, diversity, ranking, slot, role, or cross-artifact optimization.

The response keeps individual artifacts flat:

```ts
type NameResponse = {
  readonly names: readonly NameArtifact[];
  readonly grouping: {
    readonly kind: "independent-set";
    readonly quantity: number;
    readonly parentSeed: string;
    readonly childSeeds: readonly string[];
  };
};
```

`grouping.childSeeds[index]` is the seed used to generate `names[index]`.

This contract is useful when the requested plurality has **no semantic relationship requirement** beyond being generated together under common shared criteria.

## Relationship to surface orchestration

A surface-specific aggregate operation is a different concern.

For example, a Fiction Cast operation may need roles, locks, per-component semantic configuration, cross-name contrast, cast-specific selection pressure, and preservation of existing roster state. Such an operation may compose the implemented `generateGivenName(...)` capability and any future family/place or other semantic callbacks that are earned by distinct reusable contracts, all above the generic singular `generateName(...)` primitive.

It does not have to become a richer `NameGrouping` kind merely because multiple names are involved.

The boundary is:

```text
independent-set
  = generic repeated independent generation

surface aggregate
  = product-specific orchestration when cross-name semantics belong to that surface
```

If a genuinely reusable cross-surface aggregate pattern later emerges, it may earn a shared grouping contract then. Do not infer one from Fiction Cast or another single surface prematurely.

## Determinism

For the same normalized request, parent seed, algorithm version, and engine data:

- the artifact count is identical;
- child seeds remain associated with the same indexes;
- artifact ordering is identical;
- artifact identities remain distinct and index-stable;
- replay returns the same ordered artifacts;
- extending quantity preserves the existing result prefix;
- adding or changing `mode` metadata alone does not change outputs.

Current legacy `silhouette-*` evidence indexing may continue while the implementation uses internal `NameGenerationPlan` materialization. Silhouette identity is not a durable grouping invariant and must not constrain the naming-layer architecture.

Index 0 uses the parent seed directly so omitted quantity/grouping preserves the previous singular output stream. Later indexes use deterministic child-seed labels.

## Boundary rules

- `mode` must not drive quantity, grouping, generic name generation, or implicit semantic callback selection.
- `independent-set` does not carry cross-artifact semantic meaning.
- Fiction Cast roles, locks, cohesion, ensemble scoring, identity grammar, and cast reroll semantics are surface-specific unless separately proven reusable.
- Game NPC roster presentation or coordination is not implied by the existence of exact quantity.
- Candidate scoring must not become public group-fit scoring.
- Shared grouping does not imply slotted generation, ranked alternatives, or per-artifact reroll.
- `NameGrouping` is not the semantic callback hierarchy; reusable one-name semantics live above `generateName(...)` as defined by Decision 0006.

## Deferred reusable grouping kinds

The following remain possible future **shared** contract work only if cross-surface requirements justify them:

- cohesion- or diversity-optimized sets;
- ranked alternatives for one naming problem;
- generic slotted sets and slot-level criteria;
- aggregate or per-slot diagnostics;
- partial-result recovery;
- shared group persistence, Inspect navigation, and export presentation;
- generic per-artifact reroll and child replacement semantics.

These deferrals do not prevent a selected product surface from implementing its own aggregate orchestration above reusable semantic callbacks.
