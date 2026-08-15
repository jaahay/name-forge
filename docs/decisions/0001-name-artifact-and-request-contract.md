# 0001 - NameArtifact and NameRequest contract

## Status

Accepted for planning, refined by Decisions 0005 and 0006 and by the implemented artifact split in issue #203.

Decision 0006 clarifies that `NameRequest -> NameResponse` is the shared platform/request contract, not the complete semantic naming callback hierarchy. Its surface-composition and aggregate-orchestration rules supersede this decision's earlier implication that Cast/ensemble behavior should generally converge on grouping.

Issue #203 refines the durable artifact statement below: `NameArtifact` remains the shared durable product artifact, but it is explicitly a discriminated union between singular generated-name evidence and composed product identity evidence rather than one shape that may ambiguously mix both.

## Context

Name Forge began as a random-name generator and currently has multiple product surfaces. The product direction needs room for additional naming jobs without making `Cast`, `Fantasy`, `StylePack`, `Role`, or any other surface-specific noun a foundational mechanics concept.

The durable product object is the name artifact. Casts, lists, ensembles, NPC workflows, product-name workflows, pen-name workflows, and later naming jobs can request, compose, inspect, persist, or present names without requiring separate low-level sound generators.

A singular sound-backed generated name and a composed displayed identity are not the same evidence shape. One singular `GeneratedName` can truthfully expose the sound, spelling, plan, variants, and diagnostics that produced its selected spelling. A composed identity may contain multiple generated components plus lexical or literal material and therefore cannot truthfully reuse one component's primitive evidence as aggregate evidence for the whole display.

## Decision

The primary durable product artifact remains `NameArtifact`.

Its implemented boundary is:

```ts
type NameArtifact = GeneratedNameArtifact | ComposedNameArtifact;
```

A `GeneratedNameArtifact` has `kind: "generated-name"` and carries the primitive sound/spelling/planning/variant/readability evidence for one singular generated name. Its `displayText` is the selected spelling described by that evidence.

A `ComposedNameArtifact` has `kind: "composed-identity"` and carries the composed `NameIdentity`, optional identity audition, and readability evidence. It does not expose one aggregate primitive `soundProfile`, `sound`, `spelling`, `spellingCandidates`, `silhouette`, or `variants` bundle. Generated component provenance belongs on the generated identity part that actually owns it.

The shared criteria-driven request/response platform contract is:

```text
NameRequest -> NameResponse
```

`NameRequest` may include optional client/product `mode` metadata, but generic generation must not branch on mode. Mode can be accepted, resolved, echoed, and preserved as metadata while shared request behavior remains driven by explicit inputs and seeded randomness.

The request keeps randomness explicit:

- `random.seed` is optional in the request;
- a resolved seed is always emitted in the response;
- the same normalized request, same seed, same algorithm version, and same engine data should be reproducible.

The response returns `NameArtifact` values. The currently implemented generic request adapter emits generated-name artifacts because `NameRequest` currently asks for independent singular names rather than asserting a product composition grammar. Product surfaces may persist composed-identity artifacts when they own a composed result.

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

The reusable naming API and durable artifact boundary are intentionally different concerns. `generateName(...)` returns one singular `GeneratedName`; a surface may compose that result with other generated, selected, derived, or literal components and then persist the composed identity as a `ComposedNameArtifact`.

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

## Persistence compatibility

The browser history envelope/key remains version 1. On read, Name Forge normalizes legacy artifact records into the explicit artifact variants introduced by issue #203:

- a coherent legacy singular record becomes a `generated-name` artifact;
- a legacy record with a valid composed identity becomes a `composed-identity` artifact;
- ambiguous aggregate primitive evidence on a legacy composed record is discarded rather than misrepresented as evidence for the whole compound display;
- per-component generation provenance already retained inside the identity remains available.

This is an explicit compatibility migration at the persistence boundary, not a compatibility alias on `GeneratedName` or `FictionCastGeneratedName`.

## Consequences

- The primary durable artifact remains `NameArtifact`, with explicit generated-name and composed-identity variants.
- A singular generated artifact is coherent with its selected spelling and primitive evidence.
- A composed artifact does not claim one aggregate primitive sound/spelling/plan bundle; generated evidence remains attached to the generated component that owns it.
- The platform keeps one shared criteria-driven request/response contract rather than mode-specific transport families.
- Reusable semantic callback names are allowed and expected above the generic singular `generateName(...)` primitive.
- Modes remain frontend/product metadata unless an explicit backend invariant is separately modeled.
- Exact independent quantity remains shared infrastructure without dictating how surface-specific aggregate generation must be designed.
- Fiction Cast and other surfaces may keep surface-specific cross-name and composition semantics above reusable one-name capabilities.
- `NameCriteria` remains shared request intent rather than a hidden mode switch.
- Persistence migrations should be explicit at durable boundaries rather than weakening primitive/composed type coherence for compatibility.

## Explicit non-goals

- No universal multi-name abstraction is established here.
- No universal compound-identity grammar is established here.
- No universal list of semantic name callbacks is established here.
- No backend-required `StylePack` or `BaseStyle` concept is introduced by this decision.
- No public fit percentage is required.
- No LLM parsing or prompt-first request model is introduced.
