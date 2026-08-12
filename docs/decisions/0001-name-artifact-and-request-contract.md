# 0001 - NameArtifact and NameRequest contract

## Status

Accepted for planning, refined by Decision 0006.

Decision 0006 clarifies that `NameRequest -> NameResponse` is the shared platform/request contract, not the complete semantic naming callback hierarchy. Its surface-composition and aggregate-orchestration rules supersede this decision's earlier implication that Cast/ensemble behavior should generally converge on grouping.

## Context

Name Forge began as a random-name generator and currently has multiple product surfaces. The product direction needs room for additional naming jobs without making `Cast`, `Fantasy`, `StylePack`, `Role`, or any other surface-specific noun a foundational mechanics concept.

The durable product object is the generated name artifact. Casts, lists, ensembles, NPC workflows, product-name workflows, pen-name workflows, and later naming jobs can request, compose, inspect, persist, or present generated names without requiring separate low-level sound generators.

## Decision

The primary durable product artifact is `NameArtifact`.

The shared criteria-driven request/response platform contract is:

```text
NameRequest -> NameResponse
```

`NameRequest` may include optional client/product `mode` metadata, but generic generation must not branch on mode. Mode can be accepted, resolved, echoed, and preserved as metadata while shared request behavior remains driven by explicit inputs and seeded randomness.

The request keeps randomness explicit:

- `random.seed` is optional in the request;
- a resolved seed is always emitted in the response;
- the same normalized request, same seed, same algorithm version, and same engine data should be reproducible.

The response returns `NameArtifact` values. The currently implemented contract supports the singular-compatible default plus exact independent sets.

## Current request contract

The implemented v1 shape is maintained in [`../requirements/name-request-v1.md`](../requirements/name-request-v1.md). Conceptually:

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
  readonly random: RandomizationResult;
  readonly diagnostics?: readonly NameDiagnostic[];
};
```

The exact current quantity/grouping contract is an `independent-set` with deterministic child seeds and flat ordered artifacts.

Do not introduce transport families such as `CastRequest`, `ProductNameRequest`, or `NpcRequest` merely because product surfaces differ. This does **not** prohibit reusable typed domain callbacks such as `generateGivenName(...)` or `generatePlaceName(...)`. Those are semantic capabilities above the generic singular naming primitive, not competing transport schemas.

## Relationship to the reusable naming API

Decision 0006 establishes the ordered naming-layer dependency:

```text
product surface
  -> reusable semantic callback(s)
  -> generic singular generateName(...)
  -> style / sound / spelling mechanics
```

A surface may additionally own a surface-specific aggregate callback when cross-name semantics belong to that surface.

`NameRequest -> NameResponse` remains valuable for shared criteria, deterministic replay, independent quantity, adapter/service boundaries, and artifact transport. It must not be interpreted as the only valid domain-level callback shape.

## Quantity and grouping

Shared quantity/grouping currently covers exact independent generation:

```text
one parent request
  -> deterministic child seeds
  -> independent generated artifacts
  -> flat ordered NameArtifact[]
```

This is reusable platform infrastructure for cases where the generated names have no required cross-name semantic relationship.

The earlier planning idea that richer `NameGrouping` should become the likely backend abstraction for Cast and Ensemble behavior is superseded by Decision 0006. A nuanced surface such as Fiction Cast may instead own aggregate orchestration that composes reusable semantic callbacks. If a genuinely reusable cross-surface grouping pattern later emerges, it may earn a shared grouping contract at that time.

## Consequences

- The primary durable artifact remains `NameArtifact`.
- The platform keeps one shared criteria-driven request/response contract rather than mode-specific transport families.
- Reusable semantic callback names are allowed and expected above the generic singular `generateName(...)` primitive.
- Modes remain frontend/product metadata unless an explicit backend invariant is separately modeled.
- Exact independent quantity remains shared infrastructure without dictating how surface-specific aggregate generation must be designed.
- Fiction Cast and other surfaces may keep surface-specific cross-name semantics above reusable one-name capabilities.
- `NameCriteria` remains shared request intent rather than a hidden mode switch.

## Explicit non-goals

- No universal multi-name abstraction is established here.
- No universal list of semantic name callbacks is established here.
- No backend-required `StylePack` or `BaseStyle` concept is introduced by this decision.
- No public fit percentage is required.
- No LLM parsing or prompt-first request model is introduced.
