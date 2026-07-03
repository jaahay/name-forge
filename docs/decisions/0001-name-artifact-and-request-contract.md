# 0001 - NameArtifact and NameRequest contract

## Status

Accepted for planning.

## Context

Name Forge began as a random-name generator and currently has a mature Fiction cast surface. The product direction now needs room for other naming jobs without making `Cast`, `Fantasy`, `StylePack`, `Role`, or any other mode-specific noun a foundational engine concept.

The durable product object is the generated name. Casts, lists, ensembles, NPC workflows, product-name workflows, pen-name workflows, and later naming jobs should be understood as ways to request, group, inspect, or present generated names.

## Decision

The primary product artifact is `NameArtifact`.

The generation contract should converge on one operation:

```text
NameRequest -> NameResponse
```

`NameRequest` is criteria-driven. It may include an optional client/product `mode` hint, but v1 generation should not branch on mode. Mode can be accepted, resolved, echoed, and preserved as metadata while the engine remains driven by criteria and seeded randomness.

The request should keep randomness explicit:

- `random.seed` is optional in the request.
- A resolved seed is always emitted in the response.
- The same request, same seed, and same algorithm version should be reproducible.

The response should return `NameArtifact` values. A singular v1 implementation may return exactly one artifact while the contract remains compatible with later multiplicity.

## Planning contract

```ts
type NameRequest = {
  readonly version: 1;
  readonly mode?: string;
  readonly criteria: NameCriteria;
  readonly quantity?: NameQuantity;
  readonly grouping?: NameGrouping;
  readonly random?: RandomizationRequest;
};

type NameResponse = {
  readonly version: 1;
  readonly request: ResolvedNameRequest;
  readonly names: readonly NameArtifact[];
  readonly group?: NameGroupArtifact;
  readonly random: RandomizationResult;
  readonly diagnostics?: readonly NameDiagnostic[];
};
```

V1 may implement only the default case:

```ts
quantity: { count: 1 }
grouping: { kind: "none" }
```

The public contract should still read as `NameRequest -> NameResponse`; separate API names such as `NamesRequest`, `CastRequest`, or `ProductNameRequest` should not be introduced merely because the UI offers different naming jobs.

## Future extension points

`quantity` can later allow multiple independently generated names.

`grouping` can later describe whether multiple names are independent or selected as a coordinated set. This is the likely backend abstraction for Cast and Ensemble behavior.

```ts
type NameGrouping =
  | { readonly kind: "none" }
  | { readonly kind: "independent" }
  | { readonly kind: "set"; readonly criteria?: NameSetCriteria }
  | {
      readonly kind: "slotted-set";
      readonly criteria?: NameSetCriteria;
      readonly slots: readonly NameSlotRequest[];
    };
```

This keeps Cast out of the core request while still giving the engine a place to own ensemble selection when the product earns that scope.

## Consequences

- The backend has one durable naming operation.
- The primary artifact is always `NameArtifact`.
- Cast becomes a collection or grouping context, not the root artifact.
- Modes can be frontend/client configurations unless and until a backend invariant is needed.
- Ensemble behavior should be modeled as grouping/set behavior, not as a core `Cast` primitive.
- API semantics remain criteria-driven rather than mode-driven.

## Explicit non-goals

- No plural or ensemble behavior is required for v1.
- No backend-required `StylePack` or `BaseStyle` concept is introduced here.
- No public fit percentage is required.
- No LLM parsing or prompt-first request model is introduced.
