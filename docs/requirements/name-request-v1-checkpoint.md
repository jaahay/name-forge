# NameRequest v1 checkpoint

This checkpoint records the implemented `NameRequest -> NameResponse` platform state after the singular criteria-driven foundation, the first shared exact independent-set slice, and the singular `generateName(...)` boundary established in issue #186. The first reusable semantic callback, `generateGivenName(...)`, has since been implemented above that primitive; this document remains a checkpoint for the request/response platform rather than the semantic naming API.

See [`../decisions/0006-naming-capabilities-and-surface-composition.md`](../decisions/0006-naming-capabilities-and-surface-composition.md) for the accepted naming-layer direction.

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
  -> compile NameCriteria into the current GenerationSettings bridge
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

The request adapter consumes `generateName(...)` directly because the request does not currently assert a semantic name kind. `generateGivenName(...)` exists separately above that primitive and is used where a caller actually owns given-name semantics. Callers do not construct `NameSilhouette`; the retained `NameGenerationPlan` is internal planning/scoring evidence. The legacy `silhouette` artifact property is compatibility evidence rather than a request or naming-API concept.

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

The criteria compiler supports a small implemented subset of `NameCriteria` by translating shared criteria into the current `GenerationSettings` bridge.

That bridge still contains broader application/Fiction-Cast-shaped fields that generic request generation does not semantically need. Issue #201 tracks separating those settings and role metadata from generic naming/request contracts; this checkpoint records the current bridge without declaring it a stable architecture boundary.

Diagnostics report unsupported and partially implemented criteria honestly. Unsupported criteria should not fail ordinary generation by default; the adapter continues with neutral best-effort settings for every requested artifact.

Semantic callbacks may additionally own typed configuration meaningful only for their domain. `NameCriteria` should not expand into a universal schema merely to encode every semantic name kind.

Follow-up risk: supported-criteria knowledge is duplicated between `nameCriteriaCompiler.ts` and `nameCriteriaDiagnostics.ts`. Before materially expanding shared criteria targets, centralize supported-target metadata or introduce a shared helper such as `isCriteriaClauseCompiled(...)`.

## Internal candidate scoring boundary

Candidate selection scoring is internal machinery only.

It can influence which generated result or spelling candidate is selected. It must not leak into public response artifacts as a fit percentage, Criteria Match percentage, or polished public scoring UI.

## Active app surface boundary

Fiction Cast keeps cast-facing concepts such as role mix, slot controls, locks, cross-name selection pressure, review, and export language in its surface behavior. Its primary given-name generation now enters through `generateGivenName(...)`; family/place supporting generation remains on `generateName(...)` because #199 found no current evidence that distinct reusable family/place callbacks have been earned. Cast role, contextual scoring, rarity, identity composition, and aggregate behavior stay above those one-name mechanics.

Those concepts are not global grouping assumptions.

Game NPC continues using the singular request default and generic request adapter because its current request does not assert a semantic name kind. A future Game NPC requirements slice may explicitly choose and configure a reusable semantic capability; `mode` must not select one implicitly.

## Active foundation handoff

The request/grouping platform is implemented and is not the active expansion target. Parent checkpoint #198 is the current gate before new surface-specific requirements work.

- #199 completed the engine/naming-interface review and concluded **not yet settled**.
- #201 tracks separation of Fiction Cast/application settings and role metadata from generic naming contracts.
- #202 tracks narrowing semantic callback inputs so orchestration plumbing does not become the reusable semantic API pattern.
- #203 tracks separation of one primitive sound-backed generated-name result from composed product identities.
- #200 aligns stale documentation with that current state.
- Family/place callbacks remain unearned until distinct reusable semantics or configuration are demonstrated.

Do not begin the comprehensive Fiction Cast UI/UX requirements boundary until #198 reaches an explicit foundation-signoff decision.

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

For active architecture sequencing, begin from:

```text
issue #198
docs/current-product-scope.md
docs/architecture.md
docs/decisions/0006-naming-capabilities-and-surface-composition.md
```

For maintenance of the already-implemented request and independent-set contracts, use:

```text
docs/requirements/name-request-v1.md
docs/requirements/name-grouping-design-boundary.md
```
