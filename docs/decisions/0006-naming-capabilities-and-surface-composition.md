# Decision 0006: Naming capabilities and surface composition boundary

## Status

Accepted.

This decision refines the API and composition direction left open by Decisions 0001, 0003, 0004, and 0005.

### Implementation status

Issue #186 implements the generic singular boundary required by this decision:

- `src/naming/generator.ts` exposes one generic singular `generateName(...)` orchestration callback;
- callers no longer construct `NameSilhouette` or enter through silhouette-shaped generator callbacks;
- internal pre-generation planning is represented by `NameGenerationPlan` and materialized behind `generateName(...)`;
- `GenerateNameOptions` contains no product mode, Fiction Cast role, or semantic name-kind label;
- the legacy `silhouette` result/artifact property and `silhouette-*` evidence IDs remain for compatibility and inspection/scoring evidence.

Issue #190 finishes the immediate ownership cleanup exposed by that boundary:

- Fiction Cast role vocabulary, rarity policy, and contextual role/ensemble scoring live above generic one-name mechanics;
- `generateName(...)` consumes the narrower `NameGenerationSettings` contract rather than the broader surface-oriented `GenerationSettings` aggregate;
- Fiction Cast still resolves its own role and rarity semantics before invoking lower naming capabilities.

Issue #192 implements the first reusable typed semantic callback:

- `src/naming/givenName.ts` exposes `generateGivenName(...)` above `generateName(...)`;
- the callback owns `GenerateGivenNameOptions` and `GivenNamePreferences` rather than exposing `GenerateNameOptions` or `NameGenerationPlanPreferences` to semantic callers;
- `GivenNamePreferences` are translated into generic planning pressure inside the semantic capability;
- default given-name generation remains behavior-equivalent to the generic primitive rather than inventing unsupported given-name heuristics;
- Fiction Cast primary given-name candidate generation now calls `generateGivenName(...)` while preserving its role, rarity, novelty, seed-partitioning, role-scoring, ensemble-scoring, and identity-composition responsibilities above the callback;
- family/place supporting generation remains on `generateName(...)` until those semantic capabilities are justified by concrete behavior and configuration needs.

Issue #194 separates intrinsic generic scoring from Fiction Cast contextual evaluation:

- generic `ScoreKey` / `NameScores` contain only intrinsic one-name score components plus intrinsic `overallFit`;
- generic scoring no longer invents neutral `roleFit` or `ensembleFit` values or weights a cast context that does not exist;
- Fiction Cast owns `FictionCastContextualScores` for role fit, ensemble fit, and the contextual overall used for cast candidate selection;
- Fiction Cast score detail continues to present intrinsic and contextual evidence together without moving contextual fields back into generic score contracts;
- Cast JSON/Markdown export preserves its existing flattened score shape at the surface boundary and moves from `src/engine` into `src/fictionCast` ownership.

The decision below remains the architectural rule; references to the pre-#186 silhouette-shaped implementation describe the context in which the decision was made rather than the current runtime boundary.

## Context

Name Forge is intended to scale horizontally across product surfaces, styles, flavours, and semantic kinds of names without turning each surface into a separate low-level generator.

At the time this decision was accepted, the code contained several useful but historically accumulated boundaries:

- `NameRequest -> NameResponse` was already the durable shared request/artifact contract with singular-compatible exact independent sets;
- `src/naming/generator.ts` still exposed silhouette-shaped orchestration above the sound engine;
- Fiction Cast owned product-specific identity and ensemble behavior;
- `SoundProfile` was already a pure mechanics value below product semantics.

Those facts did not by themselves define the intended reusable naming API. In particular, treating `GenerationSettings + NameSilhouette` as the durable naming boundary, treating `NameRequest` as the only domain callback, or treating grouping as the inevitable abstraction for every multi-name surface would make new product surfaces harder to compose and would leak historical implementation structure into the product architecture.

## Decision

### 1. One singular generic name-generation primitive

The reusable naming layer has one generic singular operation conceptually named:

```ts
generateName(...)
```

This decision intentionally did not prescribe its concrete request and result types. The architectural invariant is that this is the singular primitive for producing one generated name through the shared naming mechanics.

The primitive owns generic one-name orchestration. It must not require a product surface, Fiction Cast role, Game NPC mode, or semantic component label merely to generate one name.

### 2. Reusable typed callbacks carry domain semantics

Semantic name kinds are reusable domain capabilities built on the singular primitive. Examples include:

```ts
generateGivenName(...)
generateFamilyName(...)
generatePlaceName(...)
```

These callbacks are not parallel generator implementations and are not low-level sound-engine branches. They provide typed domain semantics and may own the configuration vocabulary, defaults, typed style language, or compilation behavior appropriate to that kind of name before delegating to `generateName(...)`.

The dependency is ordered:

```text
generateGivenName / generateFamilyName / generatePlaceName / ...
                         |
                         v
                    generateName
                         |
                         v
             style + sound + spelling mechanics
```

A semantic callback is valuable precisely because multiple unrelated product surfaces may reuse it.

The implemented `generateGivenName(...)` callback demonstrates one important constraint: a semantic capability does not need invented domain heuristics merely to justify its existence. It may initially provide a typed ownership boundary, hide lower planning representation, and preserve behavior while real semantic differences are learned from additional surfaces or product needs.

### 3. Product surfaces compose semantic callbacks and inject configuration

A product surface owns its UX and converts that UX into configuration for the semantic naming capabilities it composes.

For example, different surfaces may all call `generatePlaceName(...)` while exposing different controls, defaults, presets, contextual inputs, or style/flavour choices. The surface decides how users express intent; the semantic callback decides what that configuration means for that kind of name; the generic primitive and mechanics remain reusable below both.

The intended direction is:

```text
surface UX / surface state
       |
       | derives configuration
       v
reusable semantic naming callback(s)
       |
       v
    generateName
       |
       v
generic mechanics
```

`mode` metadata must not become a hidden switch inside `generateName(...)`. A surface chooses and configures capabilities explicitly.

Surface-specific contextual evaluation follows the same direction. Generic one-name scores describe one generated name without assuming a cast, role, roster, or other product context. A surface may compose those intrinsic scores with its own contextual evidence for selection or presentation without extending the generic score schema for every future product concern.

### 4. Multi-name orchestration may be intentionally surface-specific

A multi-name callback is justified when the plurality itself carries meaningful product semantics.

For example, a Fiction Cast surface may eventually own an operation conceptually like:

```ts
generateFantasyCastNames(...)
```

Such an operation may coordinate slots, roles, locks, cross-name contrast, shared or per-slot configuration, deterministic seed partitioning, and cast-specific selection pressure. It may compose `generateGivenName(...)`, `generateFamilyName(...)`, `generatePlaceName(...)`, or other reusable semantic callbacks internally.

There is no requirement that a surface-specific aggregate callback be reusable by other surfaces. Horizontal scalability comes from reuse of the lower semantic capabilities and mechanics, not from forcing every product workflow into one universal plural abstraction.

### 5. `NameRequest -> NameResponse` is shared platform infrastructure, not the semantic API hierarchy

The implemented request contract remains useful and durable for criteria-driven generation, deterministic replay, exact independent-set quantity, flat ordered artifacts, and transport/service boundaries.

It must not be interpreted as saying that:

- every product surface should call only one untyped domain operation;
- semantic callbacks such as `generatePlaceName(...)` are forbidden because they are different API names;
- Fiction Cast or other nuanced surface orchestration must eventually be expressed as generic grouping;
- `mode` should select semantic behavior inside the shared generator.

The current `independent-set` quantity/grouping contract remains a generic platform capability for repeated independent generation. It is distinct from surface-specific multi-name orchestration with real cross-name semantics.

The generic request adapter continues to call `generateName(...)` directly unless and until its request semantics assert a specific domain such as given, family, or place. A semantic callback must not be selected merely from transport metadata.

### 6. Criteria are shared intent, not the only possible semantic configuration vocabulary

`NameCriteria` remains the shared structured intent model where intent is intended to cross the generic request boundary.

A reusable semantic callback may additionally expose strongly typed configuration that is meaningful only for that semantic domain. Surfaces may derive both shared criteria and semantic configuration from their UX.

Do not force every semantic style or domain distinction into one ever-growing universal criteria schema merely to preserve one input shape.

### 7. `NameSilhouette` is not a durable API boundary

`NameSilhouette`, `createNameSilhouette(...)`, and silhouette-shaped naming orchestration were historical implementation structure, not an accepted flavour of the reusable naming API.

Callers must not be required to manufacture a silhouette in order to generate a name. Issue #186 collapses that caller-facing boundary behind the singular `generateName(...)` API.

This decision did not require every silhouette-derived field to disappear. A smaller internal planning value may remain useful for deterministic sound planning, candidate selection evidence, or inspection. Each field must justify itself in the layer that owns the decision rather than being retained because the previous façade grouped it there.

The implementation now retains `NameGenerationPlan` as that internal planning/scoring evidence. Its current fields should still be judged by ownership when later work has a concrete reason to change them:

- generic one-name mechanics;
- a semantic naming capability;
- surface/product orchestration;
- derived inspection/scoring evidence;
- or removal if the field no longer has a clear purpose.

The legacy `silhouette` result/artifact property is compatibility evidence and must not become a fourth public generation callback category alongside generic singular generation, semantic singular generation, and surface-specific aggregate generation.

## Resulting dependency model

```text
PRODUCT SURFACE
  owns UX, defaults, presets, surface state,
  contextual evaluation,
  and any surface-specific aggregate behavior
            |
            | composes/configures
            v
REUSABLE SEMANTIC NAMING CAPABILITIES
  generateGivenName(...)   [implemented]
  generateFamilyName(...)  [candidate]
  generatePlaceName(...)   [candidate]
  ...only when a reusable domain meaning is earned
            |
            v
GENERIC SINGULAR NAMING PRIMITIVE
  generateName(...)
            |
            v
STYLE COMPILATION / GENERIC MECHANICS
  typed style -> SoundProfile -> sound -> spelling
```

An optional surface-specific aggregate layer sits above semantic callbacks, not beside or below `generateName(...)`:

```text
Fantasy Cast surface
  -> surface-specific cast orchestration + contextual scoring
  -> given/family/place semantic callbacks where implemented
  -> generateName
  -> generic mechanics
```

## Relationship to earlier decisions

- **Decision 0001** remains authoritative for `NameArtifact` and the shared `NameRequest -> NameResponse` platform contract. Its suggestion that grouping is the likely abstraction for Cast/ensemble behavior is narrowed: generic independent grouping and surface-specific semantic orchestration are separate concerns.
- **Decision 0002** remains authoritative for shared structured criteria and honest diagnostics. Criteria do not replace domain-specific typed configuration where a semantic capability earns it.
- **Decision 0003** is refined: intent surfaces do not all have to terminate exclusively in `NameCriteria`; a surface may configure reusable semantic callbacks directly while using `NameCriteria` for intent that crosses the shared generic request boundary.
- **Decision 0004** remains authoritative that modes are product/UI concepts and `mode` metadata must not branch generic generation. Its proposed universal grouping direction for Cast/ensemble behavior is superseded by this decision.
- **Decision 0005** remains authoritative for sound/profile/style ownership and containment provenance. Its previously deferred reusable semantic-generator direction is now accepted as an architectural invariant, while concrete callback types and semantic style schemas remain implementation work.

## Consequences

- New surfaces can be added by composing existing semantic callbacks and introducing only the new domain capability or surface orchestration they actually need.
- New semantic name kinds can be reused across unrelated surfaces without teaching `generateName(...)` or `SoundProfile` about every product job.
- New styles and flavours can evolve in typed semantic configuration/compiler layers without forking the sound engine.
- Surface-specific plural behavior can remain specific when its cross-name semantics are not reusable.
- Shared independent-set quantity remains useful infrastructure without becoming the mandatory model for every roster or set workflow.
- Generic `NameScores` remain intrinsic to one generated name; contextual product evaluation is composed above them instead of expanding the generic score schema.
- `src/naming` owns the singular `generateName(...)` primitive plus reusable semantic capabilities above it.
- Fiction Cast now consumes `generateGivenName(...)` for its primary component while retaining cast-specific orchestration and contextual scoring above it; family/place supporting components remain evidence for possible future semantic callbacks rather than a requirement for symmetric APIs.

## Next implementation question

With `generateName(...)`, the immediate Fiction Cast ownership cleanup, `generateGivenName(...)`, and contextual score separation implemented, the remaining naming-layer question is which concrete semantic or type-ownership pressure should drive the next bounded slice.

The current evidence should be inspected before choosing among:

- `generateFamilyName(...)` if family-name configuration or behavior can be stated honestly beyond merely renaming the generic options;
- `generatePlaceName(...)` if place-name configuration or behavior can be stated honestly;
- cleanup of remaining cast-specific role/configuration/result type ownership below the semantic boundary now that contextual score ownership is separate.

Do not clone the given-name callback merely for API symmetry. The next callback or cleanup should remove a concrete coupling or represent a real semantic contract.

Surface-specific aggregate callbacks should still be revisited only when a surface has real cross-name semantics to own; they are not a prerequisite for further semantic callback extraction.

## Non-goals

This decision itself does not specify:

- the exact TypeScript signature of `generateName(...)`; issue #186 provides the current implementation contract without retroactively making that signature part of this ADR;
- the exact input or output types of future `generateFamilyName(...)` or `generatePlaceName(...)` callbacks;
- a universal list of semantic name kinds;
- a universal semantic-style schema;
- a universal multi-name callback;
- a reusable compound-name grammar API;
- a first-class Policy abstraction;
- removal or renaming of every legacy silhouette-related result/property solely for conceptual cleanliness;
- new user-facing controls merely because semantic configuration becomes possible.
