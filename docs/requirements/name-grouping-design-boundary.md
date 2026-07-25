# NameGrouping implementation boundary

This note records the first accepted runtime grouping contract for the shared `NameRequest -> NameResponse` operation.

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

`independent-set` means every artifact is generated under the same normalized criteria without cohesion, diversity, ranking, slot, role, or cross-artifact optimization.

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

## Determinism

For the same normalized request, parent seed, algorithm version, and engine data:

- the artifact count is identical;
- child seeds remain associated with the same indexes;
- artifact ordering is identical;
- artifact and silhouette identities use their ordered indexes;
- replay returns the same ordered artifacts;
- extending quantity preserves the existing result prefix;
- adding or changing `mode` metadata alone does not change outputs.

Index 0 uses the parent seed directly so omitted quantity/grouping preserves the previous singular output stream. Later indexes use deterministic child-seed labels.

## Boundary rules

- `mode` must not drive quantity or grouping behavior.
- Fiction Cast roles, locks, cohesion, and ensemble scoring are not shared grouping semantics.
- Game NPC roster presentation is not part of the engine contract.
- Candidate scoring must not become public group-fit scoring.
- Grouping does not imply slotted generation, ranked alternatives, or per-artifact reroll.

## Deferred grouping kinds

The following remain future contract work:

- cohesion- or diversity-optimized sets;
- ranked alternatives for one naming problem;
- slotted sets and slot-level criteria;
- aggregate or per-slot diagnostics;
- partial-result recovery;
- group persistence, Inspect navigation, and export presentation;
- per-artifact reroll and child replacement semantics.
