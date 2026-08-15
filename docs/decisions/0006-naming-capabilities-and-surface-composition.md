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
- Fiction Cast primary given-name candidate generation now calls `generateGivenName(...)` while preserving its role, novelty, seed-partitioning, role-scoring, ensemble-scoring, identity-composition, and surface metadata responsibilities above the callback;
- family/place supporting generation currently remains on `generateName(...)` pending the broader semantic-callback interface cleanup.

Issue #194 separates intrinsic generic scoring from Fiction Cast contextual evaluation:

- generic `ScoreKey` / `NameScores` contain only intrinsic one-name score components plus intrinsic `overallFit`;
- generic scoring no longer invents neutral `roleFit` or `ensembleFit` values or weights a cast context that does not exist;
- Fiction Cast owns `FictionCastContextualScores` for role fit, ensemble fit, and the contextual overall used for cast candidate selection;
- Fiction Cast score detail continues to present intrinsic and contextual evidence together without moving contextual fields back into generic score contracts;
- Cast JSON/Markdown export preserves its existing flattened score shape at the surface boundary and moves from `src/engine` into `src/fictionCast` ownership.

Issue #196 makes the earlier rarity ownership direction concrete:

- rarity bands and distribution presets are Fiction Cast surface vocabulary owned by `src/fictionCast/rarity.ts`;
- `NameGenerationPlan`, `NameGenerationPlanPreferences`, `GivenNamePreferences`, generic `GenerationSettings`, and generic style-pack silhouette bias no longer carry rarity;
- Fiction Cast resolves rarity separately from one-name generation and attaches it to `FictionCastGeneratedName` for surface diagnostics, presentation, and export;
- changing a Fiction Cast rarity distribution changes rarity labels without changing the generated names for the same other inputs;
- Cast export may preserve its historical `silhouette.rarityBand` field only as a compatibility projection from surface-owned rarity metadata;
- the historical planning RNG draw position is retained so removing the non-causal rarity selection does not perturb downstream fixed-seed name mechanics.

The #198 foundation checkpoint subsequently refined two parts of the semantic-capability direction:

- the value of a semantic `-Name` callback does **not** depend on already having distinct sound-generation behavior; a stable semantic name category may receive a first-class callback that initially delegates behavior-equivalently to `generateName(...)`;
- the sound-backed name categories already supported by Fiction Cast—given, family, and place—should all receive first-class semantic generator callbacks as part of the foundation work, with one shared singular `generateName(...)` implementation beneath them;
- finite lexical material such as particles, titles, honorifics, or generational suffixes belongs to a different reusable path: typed lexical inventories plus deterministic finite-choice selection rather than synthetic sound generation;
- surface/domain composition should consume those concrete generated or selected values without introducing a universal `NameSegment` abstraction or omnibus `generatePersonName(...)` API merely to make heterogeneous identity parts look uniform.

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

This decision intentionally did not prescribe its concrete request and result types. The architectural invariant is that this is the singular primitive for producing one generated lexical name through the shared naming mechanics.

The primitive owns generic one-name orchestration. It must not require a product surface, Fiction Cast role, Game NPC mode, rarity category, or semantic component label merely to generate one name.

### 2. Reusable typed `-Name` callbacks carry domain semantics

Semantic name kinds are reusable domain capabilities built on the singular primitive. The sound-backed semantic kinds already supported by the product are:

```ts
generateGivenName(...)
generateFamilyName(...)
generatePlaceName(...)
```

Each `-Name` callback is first-class at the semantic API layer and **must delegate lexical-name generation to `generateName(...)`**. These callbacks are not parallel generator implementations and are not low-level sound-engine branches.

Distinct phonological or morphological behavior is **not** a prerequisite for first-class semantic treatment. A callback may initially be a behavior-equivalent pass-through that establishes a stable semantic noun, typed caller contract, configuration vocabulary, and future specialization point. If a domain later earns distinct configuration, defaults, typed style behavior, or compilation rules, those differences remain above `generateName(...)` unless the generic primitive itself genuinely needs to change.

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

Future name-bearing semantic kinds such as clan or house names may follow the same pattern when the product actually supports those nouns. Adding such a wrapper does not imply a second sound generator.

The implemented `generateGivenName(...)` callback demonstrates the key constraint: a semantic capability does not need invented domain heuristics merely to justify its existence. The remaining interface work should therefore improve the shared semantic invocation contract rather than withholding first-class wrappers until their mechanics diverge.

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

Semantic APIs should prefer typed `options` objects that can facade lower-resolution details rather than forcing every caller to pass a growing list of language, region, dialect, source, or planning parameters independently. The underlying data and implementation may retain those details with stronger types even when the caller-facing semantic options intentionally hide them.

`mode` metadata must not become a hidden switch inside `generateName(...)`. A surface chooses and configures capabilities explicitly.

Surface-specific contextual evaluation follows the same direction. Generic one-name scores describe one generated name without assuming a cast, role, roster, or other product context. A surface may compose those intrinsic scores with its own contextual evidence for selection or presentation without extending the generic score schema for every future product concern.

Surface controls and classifications also stay at the surface when they do not causally configure semantic or generic generation. Fiction Cast rarity is the current example: it is useful UX and roster metadata, but it does not become a `NameGenerationPlan` or semantic `-Name` preference merely because the user can tune it.

### 4. Multi-name and heterogeneous identity composition may be intentionally surface-specific

A multi-name callback is justified when the plurality itself carries meaningful product semantics.

For example, a Fiction Cast surface may eventually own an operation conceptually like:

```ts
generateFantasyCastNames(...)
```

Such an operation may coordinate slots, roles, locks, cross-name contrast, shared or per-slot configuration, deterministic seed partitioning, and cast-specific selection pressure. It may compose `generateGivenName(...)`, `generateFamilyName(...)`, `generatePlaceName(...)`, or other reusable semantic callbacks internally.

There is no requirement that a surface-specific aggregate callback be reusable by other surfaces. Horizontal scalability comes from reuse of the lower semantic capabilities and mechanics, not from forcing every product workflow into one universal plural abstraction.

The same restraint applies to heterogeneous personal or identity composition. A given name, family name, title, particle, house affiliation, generational suffix, literal, and other part do not need to implement one universal `NameSegment` abstraction merely because one surface may display them together. Likewise, this decision does not establish an omnibus `generatePersonName(...)` function that tries to own every possible personal-name or affiliation component. Composition should remain with the domain or surface whose grammar is actually known.

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

The implementation now retains `NameGenerationPlan` as that internal planning/scoring evidence. Its fields should still be judged by ownership when later work has a concrete reason to change them:

- generic one-name mechanics;
- a semantic naming capability;
- surface/product orchestration;
- derived inspection/scoring evidence;
- or removal if the field no longer has a clear purpose.

Issue #196 applies that rule to rarity: because the rarity label did not cause generic sound, spelling, or intrinsic scoring behavior, it was removed from the internal plan and moved to the Fiction Cast result that actually owns and consumes it.

The legacy `silhouette` result/artifact property is compatibility evidence and must not become a fourth public generation callback category alongside generic singular generation, semantic singular generation, and surface-specific aggregate generation.

### 8. Finite lexical vocabularies use typed inventories and deterministic selection

Not every identity component should be synthesized by the sound/name generator. Some semantics are naturally expressed as a choice from a bounded lexical vocabulary, while others are derived from existing names or relationships.

The reusable finite-choice mechanic should remain intentionally small, conceptually:

```ts
selectFromOptions<T>(options, random): T
```

It owns deterministic selection and nothing about the meaning of the options. Semantic selectors may wrap that primitive, for example:

```ts
selectGenerationalSuffix(...)
selectParticle(...)
selectHonorific(...)
```

Those semantic selectors own what the options mean. The concrete lexical options come from typed caller data or a persisted lexical inventory rather than being embedded in the generic selector.

Reusable lexical datasets should be modeled as a `NamingLexicon`, `LexicalInventory`, or equivalent typed data contract alongside the existing sound and grapheme inventories. The exact TypeScript shape remains implementation work, but the data model must be capable of retaining declared provenance and linguistic/regional scope where known, including language, region, dialect, historical period, register, or other source qualifiers when relevant.

Caller-facing semantic APIs do not need to expose every one of those dimensions as separate parameters. A typed `options` facade may resolve or encapsulate the more granular source/inventory details while preserving them in the underlying typed data.

Name Forge is authoritative about its inventory contracts, validation, deterministic consumption, versioning, and the built-in datasets it ships. It is **not** the universal authority on the linguistic or cultural truth of the vocabulary itself. A bundled inventory is a declared dataset whose authority is bounded by its provenance and scope. Built-in, curated, imported, third-party, setting-specific, and user-defined inventories may coexist under the same contract when such sources are introduced.

Derived forms such as patronymics may require dedicated derivation rules rather than either `generateName(...)` or `selectFromOptions(...)`. First-class semantic treatment does not require forcing every identity part through the same underlying mechanic.

## Resulting dependency model

Generated lexical names follow one path:

```text
PRODUCT SURFACE
  owns UX, defaults, presets, surface state,
  contextual evaluation,
  surface classifications such as Fiction Cast rarity,
  and any surface-specific aggregate behavior
            |
            | composes/configures
            v
REUSABLE SEMANTIC `-Name` CAPABILITIES
  generateGivenName(...)   [implemented]
  generateFamilyName(...)  [accepted; implementation pending]
  generatePlaceName(...)   [accepted; implementation pending]
  ...future supported name-bearing semantic kinds
            |
            v
GENERIC SINGULAR NAMING PRIMITIVE
  generateName(...)
            |
            v
STYLE COMPILATION / GENERIC MECHANICS
  typed style -> SoundProfile -> sound -> spelling
```

Finite lexical values follow a separate reusable path:

```text
NAMING LEXICON / CALLER-SUPPLIED TYPED OPTIONS
            |
            v
SEMANTIC SELECTOR
  selectParticle / selectGenerationalSuffix / ...
            |
            v
GENERIC DETERMINISTIC FINITE CHOICE
  selectFromOptions(...)
```

A product/domain composition layer may combine concrete generated names, selected lexical values, derived values, and literals without requiring a universal heterogeneous segment API.

An optional surface-specific aggregate layer sits above semantic callbacks, not beside or below `generateName(...)`:

```text
Fantasy Cast surface
  -> surface-specific cast orchestration + contextual scoring + rarity metadata
  -> given/family/place semantic callbacks
  -> generateName
  -> generic mechanics
```

## Relationship to earlier decisions

- **Decision 0001** remains authoritative for `NameArtifact` and the shared `NameRequest -> NameResponse` platform contract. Its suggestion that grouping is the likely abstraction for Cast/ensemble behavior is narrowed: generic independent grouping and surface-specific semantic orchestration are separate concerns.
- **Decision 0002** remains authoritative for shared structured criteria and honest diagnostics. Criteria do not replace domain-specific typed configuration where a semantic capability owns it.
- **Decision 0003** is refined: intent surfaces do not all have to terminate exclusively in `NameCriteria`; a surface may configure reusable semantic callbacks directly while using `NameCriteria` for intent that crosses the shared generic request boundary.
- **Decision 0004** remains authoritative that modes are product/UI concepts and `mode` metadata must not branch generic generation. Its proposed universal grouping direction for Cast/ensemble behavior is superseded by this decision.
- **Decision 0005** remains authoritative for sound/profile/style ownership and containment provenance. Its previously deferred reusable semantic-generator direction is now accepted as an architectural invariant, while concrete callback types and semantic style schemas remain implementation work.

## Consequences

- New surfaces can be added by composing existing semantic callbacks and introducing only the new domain capability or surface orchestration they actually need.
- The currently supported generated name categories—given, family, and place—have first-class semantic API status even if some wrappers initially preserve exactly the same lower-generation behavior.
- Every semantic `-Name` callback delegates to the one `generateName(...)` primitive; semantic growth does not multiply low-level generators.
- New semantic name kinds can be reused across unrelated surfaces without teaching `generateName(...)` or `SoundProfile` about every product job.
- New styles and flavours can evolve in typed semantic configuration/compiler layers without forking the sound engine.
- Finite lexical vocabularies can be persisted, sourced, validated, and selected deterministically without pretending they were generated through `SoundProfile`.
- Typed semantic `options` objects may hide granular inventory/source details from ordinary callers while preserving those details in the underlying data model.
- Surface-specific plural behavior can remain specific when its cross-name semantics are not reusable.
- Surface-specific classifications that do not causally change generic generation, such as current Fiction Cast rarity, remain surface-owned instead of expanding generic plan/style contracts.
- Shared independent-set quantity remains useful infrastructure without becoming the mandatory model for every roster or set workflow.
- Generic `NameScores` remain intrinsic to one generated name; contextual product evaluation is composed above them instead of expanding the generic score schema.
- `src/naming` owns the singular `generateName(...)` primitive plus reusable semantic `-Name` capabilities above it.
- Fiction Cast currently consumes `generateGivenName(...)` for its primary component while retaining cast-specific orchestration, contextual scoring, rarity metadata, and identity grammar above it; family/place supporting components should migrate to their first-class wrappers when the shared semantic callback contract is corrected.

## Next implementation question

The #198 foundation checkpoint has made the semantic-callback direction more specific.

Issue #202 should now establish the smallest stable semantic invocation contract and apply it across the currently supported sound-backed semantic name kinds:

- retain `generateGivenName(...)` as a first-class wrapper while narrowing orchestration plumbing that does not belong in its semantic API;
- add first-class `generateFamilyName(...)` and `generatePlaceName(...)` wrappers even if their initial behavior is a direct delegation to `generateName(...)`;
- preserve one generic singular implementation and deterministic equivalence where semantic inputs are equivalent;
- keep semantic `options` typed and capable of facading lower planning or source-resolution details rather than exposing implementation plumbing directly.

Issue #201 remains responsible for removing Fiction Cast/application settings and role metadata from generic naming contracts. Issue #203 remains responsible for separating one coherent sound-backed generated-name result from composed product identities.

The lexical inventory / finite-choice direction is accepted here, but its exact data types and migration of existing lexical lists should be a separate bounded implementation slice unless #201-#203 directly require it. Do not turn #202 into a general vocabulary framework rewrite.

Surface-specific aggregate callbacks should still be revisited only when a surface has real cross-name semantics to own; they are not a prerequisite for the semantic wrapper family.

## Non-goals

This decision itself does not specify:

- the exact TypeScript signature of `generateName(...)`; issue #186 provides the current implementation contract without retroactively making that signature part of this ADR;
- the exact final TypeScript signatures of `generateGivenName(...)`, `generateFamilyName(...)`, or `generatePlaceName(...)`; #202 owns that bounded interface work;
- a universal list of semantic name kinds beyond the currently supported generated categories;
- distinct generation mechanics for every semantic `-Name` wrapper;
- a universal semantic-style schema;
- a universal multi-name callback;
- a universal `NameSegment` abstraction merely because heterogeneous identity values can be composed;
- an omnibus `generatePersonName(...)` API that owns every possible personal-name, clan, house, title, or affiliation component;
- a universal lexical-inventory taxonomy or a claim that Name Forge is the definitive linguistic authority for a locale or naming tradition;
- a universal rarity taxonomy or requirement that rarity exist outside surfaces that deliberately own such a classification;
- a reusable compound-name grammar API;
- a first-class Policy abstraction;
- removal or renaming of every legacy silhouette-related result/property solely for conceptual cleanliness;
- new user-facing controls merely because semantic configuration becomes possible.