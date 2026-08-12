# NameRequest v1 checkpoint

This checkpoint records the implemented `NameRequest -> NameResponse` platform state after the singular criteria-driven foundation, the first shared exact independent-set slice, and the singular `generateName(...)` boundary established in issue #186.

It is a checkpoint for the request/response platform, not the reusable semantic naming callback hierarchy. See [`../decisions/0006-naming-capabilities-and-surface-composition.md`](../decisions/0006-naming-capabilities-and-surface-composition.md) for the accepted naming-layer direction.

## Implemented arc

```text
NameRequest / NameCriteria contract
  -> request resolver and parent-seed handling
  -> NameArtifact mapper
  -> singular-compatible request adapter
  -> criteria diagnostics bridge
  -> criteria-to-current-generator compiler
  -> internal candidate selection scoring
  -> bounded Configure criteria surface
  -> exact quantity and independent-set grouping
  -> deterministic child seeds and ordered artifacts
  -> generic singular generateName(...) orchestration
```

## Current v1 platform architecture

The implemented shared operation is:

```text
NameRequest -> NameResponse
```

`NameCriteria` is the shared structured input model for intent crossing this request boundary. The primary output unit is `NameArtifact`.

The current runtime path is:

```text
NameRequest
  -> resolve criteria, optional mode metadata, exact quantity, grouping, and parent seed
  -> diagnostics
  -> compile NameCriteria into current GenerationSettings
  -> derive one deterministic child seed per artifact index
  -> invoke generic singular generateName(...) for each child
  -> materialize internal NameGenerationPlan behind the naming API
  -> style / sound / spelling / selection
  -> map each GeneratedName to NameArtifact
  -> NameResponse with flat ordered artifacts and grouping metadata
```

`mode` is optional metadata. It may preserve product/UI context, but it must not drive generic generation, quantity, grouping, or semantic callback selection.

`random.seed` is optional in the request and always emitted in the response. If omitted, the resolver creates a fresh parent seed and records the `name-forge-v1` algorithm.

## Relationship to the naming API

Decision 0006 establishes a separate ordered dependency:

```text
surface-specific aggregate orchestration, when needed
  -> reusable semantic callbacks
  -> generic singular generateName(...)
  -> style / sound / spelling mechanics
```

`NameRequest -> NameResponse` remains useful for shared criteria, independent quantity, deterministic replay, service/adapter boundaries, and artifact transport without becoming the only domain-level callback surface.

The request adapter now consumes `generateName(...)` directly. Callers do not construct `NameSilhouette`; the retained `NameGenerationPlan` is internal planning/scoring evidence. The legacy `silhouette` artifact property is compatibility evidence rather than a request or naming-API concept.

## Quantity and grouping boundary

V1 supports:

- omitted quantity/grouping, resolving to exact quantity 1 and `independent-set`;
- explicit exact quantity from 1 through 100;
- one atomic independent-set platform operation;
- flat ordered `NameArtifact[]` output;
- explicit grouping metadata containing quantity, parent seed, and ordered child seeds.

`grouping.childSeeds[index]` is the seed used to generate `names[index]`.

Index 0 uses the parent seed directly, preserving the previous singular deterministic stream. Later indexes use deterministic child-seed labels, so increasing quantity preserves the existing result prefix.

Artifact identities remain distinct for ordered outputs even when display values collide. Current legacy `silhouette-*` evidence indexing is implementation detail only and is not part of the durable request contract.

`independent-set` means generic repeated independent generation. It does not mean Fiction Cast, NPC rosters, taxonomies, or every future multi-name surface must be represented by progressively richer generic grouping.

## Current criteria support boundary

The criteria compiler supports a small implemented subset of `NameCriteria` by translating shared criteria into current `GenerationSettings`.

Diagnostics report unsupported and partially implemented criteria honestly. Unsupported criteria should not fail ordinary generation by default; the adapter continues with neutral best-effort settings for every requested artifact.

A future semantic callback may additionally own typed configuration meaningful only for its domain. `NameCriteria` should not expand into a universal schema merely to encode every semantic name kind.

Follow-up risk: supported-criteria knowledge is duplicated between `nameCriteriaCompiler.ts` and `nameCriteriaDiagnostics.ts`. Before materially expanding shared criteria targets, centralize supported-target metadata or introduce a shared helper such as `isCriteriaClauseCompiled(...)`.

## Internal candidate scoring boundary

Candidate selection scoring is internal machinery only.

It can influence which generated result or spelling candidate is selected. It must not leak into public response artifacts as a fit percentage, Criteria Match percentage, or polished public scoring UI.

## Active app surface boundary

Fiction Cast keeps cast-facing concepts such as role mix, slot controls, locks, cross-name selection pressure, review, and export language in its surface behavior. It resolves cast-role generation pressure above `generateName(...)` into generic planning preferences and retains role evidence/scoring in the Fiction Cast layer.

Those concepts are not global grouping assumptions. As reusable semantic callbacks emerge, Fiction Cast should compose and configure those capabilities while retaining its own aggregate orchestration where the cross-name semantics are cast-specific.

Game NPC continues using the singular request default. As the semantic layer is implemented, the surface should choose the appropriate reusable semantic callback explicitly rather than relying on `mode` to branch generic generation.

## Active next work

The singular naming boundary and caller-facing silhouette collapse are implemented in issue #186. The next implementation work is the first reusable semantic naming capability, not another generic grouping expansion:

1. select a concrete existing semantic domain such as given, family, or place names;
2. define the minimum typed semantic configuration that domain honestly owns;
3. delegate generic one-name mechanics through `generateName(...)`;
4. migrate applicable surface callers to the reusable semantic callback without leaking surface identity into the primitive;
5. keep nuanced aggregate behavior surface-owned until cross-surface reuse is demonstrated.

## Deferred shared platform work

The following remain explicit non-goals for the current request platform:

- cohesion or diversity optimization as a generic cross-surface contract;
- ranked alternatives for one naming problem;
- generic slotted generation and slot-level criteria;
- aggregate or per-slot diagnostics;
- partial-result recovery;
- generic per-artifact reroll or child replacement;
- public group-fit scoring;
- LLM prompt-first UI;
- public Criteria Match UI or fit percentages.

These deferrals do not prohibit a surface from implementing a product-specific aggregate callback when the semantics genuinely belong to that surface.

## Current handoff

For the next implementation sequence, begin from:

```text
docs/decisions/0006-naming-capabilities-and-surface-composition.md
docs/current-product-scope.md
docs/architecture.md
```

For maintenance of the already-implemented request and independent-set contracts, use:

```text
docs/requirements/name-request-v1.md
docs/requirements/name-grouping-design-boundary.md
```
