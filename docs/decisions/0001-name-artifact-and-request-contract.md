# 0001 - NameArtifact and NameRequest contract

## Status

Accepted for planning, refined by Decisions 0005 and 0006 and by the primitive/composed result correction in issue #203.

Decision 0006 clarifies that `NameRequest -> NameResponse` is the shared platform/request contract, not the complete semantic naming callback hierarchy. Its surface-composition and aggregate-orchestration rules supersede this decision's earlier implication that Cast/ensemble behavior should generally converge on grouping.

Issue #203 refines the durable artifact statement below: `NameArtifact` remains the shared durable product artifact for one singular sound-backed generated name. A composed product identity is a separate surface result and does not widen `NameArtifact` into a composition envelope.

## Context

Name Forge began as a random-name generator and currently has multiple product surfaces. The product direction needs room for additional naming jobs without making `Cast`, `Fantasy`, `StylePack`, `Role`, or any other surface-specific noun a foundational mechanics concept.

The durable shared product object is the singular name artifact. Casts, lists, ensembles, NPC workflows, product-name workflows, pen-name workflows, and later naming jobs can request, compose, inspect, persist, or present generated names without requiring separate low-level sound generators.

A singular sound-backed generated name and a composed displayed identity are not the same evidence shape. One singular `GeneratedName` can truthfully expose the sound, spelling, plan, variants, and diagnostics that produced its selected spelling. A composed identity may contain multiple generated components plus lexical or literal material and therefore cannot truthfully reuse one component's primitive evidence as aggregate evidence for the whole display.

The smallest durable shared contract is therefore the singular evidence record. Surface composition remains representable in the surface result that owns its grammar and provenance instead of requiring a second shared artifact variant.

## Decision

The primary durable shared artifact remains `NameArtifact`, and it represents exactly one sound-backed generated name.

Conceptually:

```ts
type NameArtifact = {
  readonly id: string;
  readonly displayText: string;
  readonly soundProfile: SoundProfile;
  readonly sound: SoundCandidate;
  readonly spelling: RankedSpellingCandidate;
  readonly spellingCandidates: readonly RankedSpellingCandidate[];
  readonly silhouette: NameGenerationPlan;
  readonly variants: readonly NameVariant[];
  readonly readabilityDiagnostics: readonly ReadabilityDiagnostic[];
};
```

`displayText` is the selected spelling described by the contained primitive evidence. `NameArtifact` has no composition discriminator, `NameIdentity`, identity audition, surface role, rarity, or contextual-score fields. Runtime validation rejects composition fields rather than treating them as optional extensions.

A product surface may compose one or more generated names with lexical, derived, initial, or literal material in a separate surface result. Each generated component retains its own exact generation evidence. A surface may project one singular component into `NameArtifact` when shared persistence, analysis, or inspection needs that primitive evidence; it must not claim that the projection describes the entire compound display.

The shared criteria-driven request/response platform contract is:

```text
NameRequest -> NameResponse
```

`NameRequest` may include optional client/product `mode` metadata, but generic generation must not branch on mode. Mode can be accepted, resolved, echoed, and preserved as metadata while shared request behavior remains driven by explicit inputs and seeded randomness.

The request keeps randomness explicit:

- `random.seed` is optional in the request;
- a resolved seed is always emitted in the response;
- the same normalized request, same seed, same algorithm version, and same engine data should be reproducible.

The response returns singular `NameArtifact` values. The implemented request adapter derives deterministic child seeds and passes each child seed directly to the singular `generateName(...)` primitive, which owns its internal random-stream partitioning.

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

The exact current quantity/grouping contract is an `independent-set` with deterministic child seeds and flat ordered singular artifacts.

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

`NameRequest -> NameResponse` remains valuable for shared criteria, deterministic replay, independent quantity, adapter/service boundaries, and singular artifact transport. It must not be interpreted as the only valid domain-level callback shape.

The reusable naming API, durable artifact boundary, and surface-composition boundary are intentionally different concerns. `generateName(...)` returns one singular `GeneratedName`; `toNameArtifact(...)` persists or transports that singular evidence; a surface may compose generated, selected, derived, or literal components in its own result without turning the compound identity into a `NameArtifact`.

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

The browser history envelope/key remains version 1, but the artifact payload is validated against the current singular `NameArtifact` contract.

Name Forge does not widen the artifact type or add a migration layer solely to reinterpret older composition-shaped records. A valid singular record remains loadable; malformed, unsupported, or composition-shaped records are dropped on read. This keeps persistence best-effort and preserves the semantic meaning of the current durable type.

Surface-owned composed results that require their own durable compatibility contract should define that contract at the surface boundary rather than weakening `NameArtifact`.

## Consequences

- The primary durable shared artifact remains singular `NameArtifact`.
- A singular artifact is coherent with its selected spelling and primitive evidence.
- A composed product identity remains a separate surface result; generated evidence stays attached to the generated component that owns it.
- Shared persistence and analysis may use a singular component projection without implying that it describes the entire compound display.
- The platform keeps one shared criteria-driven request/response contract rather than mode-specific transport families.
- Reusable semantic callback names are allowed and expected above the generic singular `generateName(...)` primitive.
- Modes remain frontend/product metadata unless an explicit backend invariant is separately modeled.
- Exact independent quantity remains shared infrastructure without dictating how surface-specific aggregate generation must be designed.
- Fiction Cast and other surfaces may keep surface-specific cross-name and composition semantics above reusable one-name capabilities.
- `NameCriteria` remains shared request intent rather than a hidden mode switch.
- Persistence validation should preserve type meaning rather than inventing compatibility abstractions without a demonstrated durable requirement.

## Explicit non-goals

- No universal multi-name abstraction is established here.
- No universal compound-identity artifact is established here.
- No universal compound-identity grammar is established here.
- No universal list of semantic name callbacks is established here.
- No backend-required `StylePack` or `BaseStyle` concept is introduced by this decision.
- No public fit percentage is required.
- No LLM parsing or prompt-first request model is introduced.
