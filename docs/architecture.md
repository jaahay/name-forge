# Name Forge Architecture

Name Forge is a multi-mode random-name workbench whose durable result unit is an inspectable `NameArtifact`. The current product has two active modes, Fiction Cast and Game NPC, over shared criteria-driven and sound-first generation machinery.

This document describes the **current technical architecture** and the accepted direction for the naming layer. Historical slice plans and checkpoints remain useful records, but current-state guidance should defer to this document, [`model-module-contracts.md`](model-module-contracts.md), [`current-product-scope.md`](current-product-scope.md), and accepted decision records.

Related current docs:

- [`model-module-contracts.md`](model-module-contracts.md): current model shapes, collection semantics, and module ownership.
- [`sound-model-behavior.md`](sound-model-behavior.md): sound mechanics, provenance, spelling, and audition behavior.
- [`identity-audition.md`](identity-audition.md): current identity phrase and browser playback boundary.
- [`requirements/sound-unit-audio-audition-boundary.md`](requirements/sound-unit-audio-audition-boundary.md): current browser audition versus genuinely future renderer/provider audio work.
- [`requirements/name-grouping-design-boundary.md`](requirements/name-grouping-design-boundary.md): implemented exact independent-set grouping and deferred richer grouping semantics.
- [`requirements/game-npc-mode-boundary.md`](requirements/game-npc-mode-boundary.md): active Game NPC product boundary.
- [`decisions/0005-sound-profile-product-boundary.md`](decisions/0005-sound-profile-product-boundary.md): accepted sound-profile, style-compilation, product-semantics, and containment-provenance boundary.
- [`decisions/0006-naming-capabilities-and-surface-composition.md`](decisions/0006-naming-capabilities-and-surface-composition.md): accepted singular `generateName` primitive, reusable semantic callbacks, surface composition, and silhouette demotion.

## Current architecture thesis

The accepted dependency direction is:

```text
product surface
  -> reusable semantic naming capability/capabilities
     generateGivenName(...)
     generateFamilyName(...)
     generatePlaceName(...)
  -> generic singular generateName(...)
  -> typed style compilation
  -> pure SoundProfile value
  -> sound generation
  -> spelling mechanics
  -> generated result / NameArtifact
```

A product surface owns its UX, defaults, presets, surface state, and any genuinely surface-specific aggregate behavior. It converts those concerns into configuration for reusable semantic naming callbacks. Those callbacks carry domain meaning and delegate to the one generic singular naming primitive rather than becoming parallel sound generators.

Surface-specific multi-name orchestration may sit above semantic callbacks when plurality itself carries product semantics. Fiction Cast may therefore remain cast-specific even if its generated given/family/place components become reusable naming capabilities.

The important ownership split is:

- **`src/engine`** owns reusable mechanics and durable shared request/artifact contracts.
- **`src/naming`** owns the implemented singular `generateName(...)` orchestration above those mechanics plus reusable semantic one-name capabilities such as the implemented `generateGivenName(...)`.
- **semantic naming capabilities** live above `generateName(...)` and own reusable domain meaning plus typed configuration such as given-name or place-name generation when those contracts are implemented.
- **`src/styleCompilation`** owns typed style languages and compilation into `SoundProfile`.
- **`src/fictionCast`** owns Fiction Cast identity grammar, lexical title/epithet material, surface-specific ensemble behavior, locks, roles, contextual scoring, rarity policy/metadata, cast composition, and translation of cast-role semantics into generic planning preferences.
- **`src/ui`** owns presentation and interaction, including the shared inspector and mode-specific views.

Do not move product semantics into the sound engine merely because a generated identity eventually contains sound. Do not move surface-specific orchestration into a universal backend abstraction merely because more than one name is involved.

## Architectural principles

1. **Controlled stochasticity**: generation is deterministic from explicit seeds and resolved inputs.
2. **One generic singular primitive**: reusable one-name generation goes through `generateName(...)` rather than accumulating multiple implementation-shaped entry points.
3. **Reusable domain semantics above the primitive**: semantic callbacks such as `generateGivenName(...)` or `generatePlaceName(...)` are typed domain capabilities built on `generateName(...)`, not parallel generators.
4. **Surface composition above semantic capabilities**: product surfaces own UX-derived configuration and compose one or more semantic callbacks; surface-specific aggregate callbacks are allowed when their cross-name semantics are genuinely product-specific.
5. **Criteria are shared intent, not the entire domain vocabulary**: `NameCriteria` is appropriate when intent crosses the generic request boundary; semantic callbacks may additionally own typed configuration specific to their domain.
6. **Sound structure before spelling**: `SoundProfile` drives sound mechanics; spelling is a projection and ranking layer over generated sound.
7. **Pure mechanics values**: `SoundProfile`, `SoundCandidate`, `SegmentSequence`, and spelling values do not need synthetic identity merely to reference one another.
8. **Containment provenance**: when exact generation evidence matters, retain the resolved values together in the containing result.
9. **Product semantics above mechanics**: roles such as given, family, place, title, epithet, and literal are semantic composition concepts, not generic sound-engine primitives.
10. **Mode-aware UX, mode-neutral generic generation**: product modes may choose controls, labels, defaults, presentation, and which semantic callbacks they compose; `mode` metadata must not secretly switch `generateName(...)` behavior.
11. **Internal scoring is selection machinery**: deterministic scoring can choose candidates without becoming a public universal quality percentage.
12. **Explain facts, not invented human certainty**: readability observations, structure, spelling relationships, and modeled sound evidence may be shown; universal pronounceability, memorability, realism, beauty, or cultural authenticity require separate validation.
13. **Implementation helpers must earn architectural status**: `NameGenerationPlan` is internal planning/scoring evidence, not another generation API. The legacy `silhouette` result property does not restore `NameSilhouette` as a caller-facing abstraction.

## Shared request and grouping contract

The durable shared request/response operation is:

```text
NameRequest -> NameResponse
```

This is shared platform and transport infrastructure. It is **not** the semantic naming callback hierarchy.

The implemented v1 contract supports both the singular default and exact independent sets:

```text
NameRequest
  -> resolve criteria, optional mode metadata, quantity, grouping, and parent seed
  -> criteria diagnostics
  -> compile criteria into current GenerationSettings
  -> derive deterministic child seed per artifact index
  -> generateName(...) per child seed
  -> map each GeneratedName to NameArtifact
  -> NameResponse with flat ordered artifacts and grouping metadata
```

Current quantity/grouping behavior:

- omitted quantity resolves to exact quantity 1;
- omitted grouping resolves to `independent-set`;
- explicit exact quantity supports 1 through 100 artifacts;
- index 0 uses the parent seed and later indexes use deterministic child seeds;
- `grouping.childSeeds[index]` corresponds to `names[index]`;
- artifact order is deterministic generation order, not rank order;
- increasing quantity preserves the existing result prefix;
- `mode` remains metadata and does not select grouping or generator behavior.

`independent-set` provides generic repeated independent generation only. It does **not** imply that every surface-specific roster or set workflow should eventually be rewritten as generic grouping.

It also does not provide cohesion optimization, diversity optimization, slots, per-slot criteria, ranked alternatives, partial results, or group-level reroll semantics. Any reusable future grouping contract must be justified independently from surface-specific aggregate orchestration.

## Criteria and request adaptation

`NameCriteria` is the shared structured intent model for intent that crosses the generic request boundary. Current UI controls and presets may still use lower-level settings, and shared request behavior compiles supported criteria into current `GenerationSettings` through the existing compiler bridge.

A semantic callback may also expose strongly typed configuration meaningful only for its domain. A surface can derive shared criteria, semantic configuration, or both from its UX. Do not force every given-name, place-name, faction-name, or future style distinction into one universal criteria schema solely to preserve one input shape.

The current request adapter lives in `src/engine/nameResponse.ts`. It resolves the request once, runs criteria diagnostics once, compiles criteria once, derives child seeds, invokes `generateName(...)` for each artifact with separate deterministic planning/generation random streams, and maps generated results into `NameArtifact` values.

Unsupported or partially supported criteria are reported through diagnostics rather than silently presented as exact user-intent fulfillment.

The known follow-up risk remains duplicated supported-target knowledge between the criteria compiler and diagnostics. Centralize that knowledge before materially expanding supported criteria targets.

## Naming orchestration

Current name orchestration lives in `src/naming/generator.ts`, above the low-level sound engine.

The implemented path is:

```text
GenerateNameOptions
  -> internal NameGenerationPlan
  -> StyleInput
  -> compileStyle(...)
  -> SoundProfile
  -> generateSound(...)
  -> complete spelling candidate pool
  -> deterministic spelling ranking and selection
  -> score / variants / readability diagnostics
  -> GeneratedName
```

`GenerateNameOptions` accepts generic generation settings, style pack, deterministic planning/generation random streams, artifact index, and optional generic planning settings/preferences. It does **not** accept product mode, Fiction Cast role, rarity category, or semantic name-kind labels.

The current implementation therefore matches the accepted naming-layer dependency:

```text
semantic callback configuration
  -> generateName(...)
  -> typed style resolution/compilation
  -> SoundProfile
  -> sound + spelling mechanics
  -> generated result
```

The first reusable semantic callback, `generateGivenName(...)`, is implemented above this primitive. Family/place callbacks remain evidence-driven candidates rather than required symmetric APIs. Surface-specific aggregate operations, if needed, sit above semantic callbacks.

### Generation-plan and legacy silhouette boundary

`NameSilhouette`, `createNameSilhouette(...)`, and `generateNameFromSilhouette(...)` are no longer caller-facing generation abstractions.

`generateName(...)` materializes a `NameGenerationPlan` internally. The plan retains syllable count, stress/rhythm, shape, texture, target novelty, target length, and optional surface-attached role-influence evidence because those values still serve generic generation/scoring or retained compatibility evidence. It does **not** contain Fiction Cast rarity. Rarity is a surface classification attached to `FictionCastGeneratedName`, not a causal generic planning field.

The existing `GeneratedName.silhouette` / `NameArtifact.silhouette` property name and `silhouette-*` evidence IDs remain for compatibility. They do not require callers to build the plan and do not define a fourth generation callback category.

Product/domain-specific influences must be resolved above `generateName(...)`. Fiction Cast, for example, converts role preferences into generic `NameGenerationPlanPreferences`; it attaches role metadata and role-fit scoring in the Fiction Cast layer after singular generation. Its rarity policy is resolved separately and attached as surface result metadata without entering `generateName(...)`.

Further plan reduction or compatibility-field renaming should be justified by a concrete consumer/persistence migration rather than bundled into semantic-callback work.

## Sound mechanics

`SoundProfile` is a pure resolved mechanics value. It contains the sound targets and phonotactic preferences required by generic sound and spelling generation.

A `SoundProfile` has no product role, Fiction Cast job tag, title/epithet lexicon, composition grammar, compiler provenance identifier, synthetic profile ID, UI state, callbacks, cache, or runtime handle.

`src/engine/soundGenerator.ts` consumes a `SoundProfile` and seeded randomness to produce a `SoundCandidate` containing a `SegmentSequence` and syllable metadata.

`SegmentSequence` is one pre-spelling sound plan. Its flat segment order and syllable spans are durable mechanics data, not a canonical language pronunciation claim.

## Spelling mechanics

`src/engine/spellingGenerator.ts` projects a generated sound into the complete spelling pool supported by the current grapheme inventory and deterministically ranks that pool.

The selected spelling and retained alternatives remain tied to the exact generated sound and profile through containment in the generated name/artifact. Internal rank scores are useful selection evidence; they are not public beauty or fit percentages.

Bounded spelling presentation happens **after** full-pool generation and ranking, preserving prefix invariance.

## Provenance and identity

Generation provenance uses containment rather than relational identity:

```text
contained generation evidence
  = SoundProfile
  + SoundCandidate
  + selected spelling
```

`SoundProfile`, `SoundCandidate`, `SegmentSequence`, and spelling candidates do not acquire IDs solely so adjacent values can point back to them.

Product-level things may still have IDs when independent addressability matters, including generated names, artifacts, cast slots, persisted records, locks, and identity parts.

A composed displayed identity does not imply one aggregate `SoundProfile`. If a displayed identity contains multiple independently generated sound-backed components, each component retains its own exact generation evidence.

## Fiction Cast semantics and orchestration

Fiction Cast-specific semantics live under `src/fictionCast` rather than the low-level engine.

The current identity grammar includes forms such as:

```text
given-only      := given
given-family    := given family
initials-family := initials family
title-name      := title given
epithet-place   := given epithet "of" place
```

Generated given, family, and place parts may retain exact generation evidence. Titles and epithets currently come from Fiction Cast-owned lexical material. Literals such as `of` remain explicit phrase literals.

This is product grammar, not phonology. The identity layer may compose parts and literals, but it must not pretend lexical material was generated by a `SoundProfile` when it was not.

Fiction Cast currently resolves role-specific generation semantics above `generateName(...)`: role-influenced settings stay in its component-generation context, role-specific syllable/texture preferences become generic planning preferences, and role metadata/role-fit scoring are attached by ensemble orchestration. The singular naming primitive never accepts a cast role.

Rarity follows a different path because it does not alter the generated name. Fiction Cast owns the rarity band/distribution vocabulary and deterministic rarity policy, resolves a band at the surface layer, attaches it to `FictionCastGeneratedName`, and uses it for cast diagnostics/presentation/export. Generic planning, semantic given-name configuration, style-pack mechanics, and `NameArtifact` do not acquire a rarity field merely because Fiction Cast exposes that user knob.

Given, family, and place are useful examples of semantic name kinds that may become reusable callbacks because multiple surfaces could plausibly need them. `generateGivenName(...)` is implemented. If family/place callbacks are later justified, Fiction Cast should consume those reusable capabilities and inject its own configuration rather than owning duplicate one-name generators.

Fiction Cast itself still owns ensemble behavior, roles, rarity, contextual scores, locks, cast review, same-roster relationship presentation, targeted reroll, and cast export semantics. A future surface-specific cast aggregate may compose reusable semantic callbacks internally. These cross-name semantics do not become assumptions of `generateName(...)` or the shared `NameRequest` contract merely because they involve multiple names.

## Game NPC boundary

Game NPC is a thin product mode over the shared platform. It intentionally generates one artifact at a time for fast prep/live-play use, even though the shared request contract now supports exact independent sets.

The mode owns navigation, product copy, style-source selection, copy, and fresh-seed reroll. It does not own a second sound generator, artifact type, or inspector.

As semantic callbacks emerge, Game NPC should call the reusable semantic capability appropriate to the name it is asking for and inject configuration derived from its own UX. `mode: "game-npc"` remains metadata rather than a semantic switch.

A future NPC roster needs a separate product decision. Plain repeated independent names can use existing independent-set infrastructure; meaningful NPC-roster coordination should be modeled as surface-specific orchestration composed from semantic callbacks unless and until a genuinely reusable cross-surface grouping contract is demonstrated.

## Audition architecture

Current audition is implemented, but it remains an approximation boundary.

For one sound-backed generated component:

```text
SegmentSequence
  -> AuditionPhonology
  -> BrowserAuditionCue
  -> NameAuditionCue
```

For composed identities:

```text
NameIdentity
  -> IdentityAuditionPhrase
  -> browser semantic chunks
  -> Web Speech API utterances
```

Sound-backed identity parts reuse the exact contained generation evidence for that part. Lexical and literal phrase parts remain explicit text. The browser adapter may insert short presentation pauses between semantic chunks.

Those pauses and speech chunks are adapter policy, not durable phonology. Browser speech is not IPA, provider phoneme markup, canonical pronunciation, or a persisted audio contract.

See [`identity-audition.md`](identity-audition.md) and [`requirements/sound-unit-audio-audition-boundary.md`](requirements/sound-unit-audio-audition-boundary.md) for the current/future boundary.

## Analysis and human-facing claims

Pure artifact analysis may derive deterministic structure, spelling, readability, collision, and same-roster relationship evidence without mutating the durable artifact.

The product may explain such evidence directly. It must not relabel internal weights as validated human-facing metrics.

Research claims such as pronounceability, familiarity, memorability, realism, beauty, or cultural authenticity require an explicit population/corpus, methodology, validation evidence, confidence/limitations, and a concrete product decision they improve.

## Current module map

```text
src/
  App.tsx                  product shell and mode navigation
  data/                    built-in style/source data

  engine/                  shared mechanics and durable contracts
    nameRequest.ts         request resolution, quantity/grouping, seed contract
    nameResponse.ts        shared request adapter/service; delegates one-name generation to generateName(...)
    nameArtifact.ts        durable artifact mapping
    nameCriteria*.ts       shared criteria model, diagnostics, and current compiler bridge
    candidateSelection.ts  internal spelling/candidate selection
    silhouettes.ts         internal NameGenerationPlan materialization; legacy filename, not a public naming API
    soundProfile.ts        pure SoundProfile mechanics value
    soundGenerator.ts      SoundProfile -> SoundCandidate / SegmentSequence
    spellingGenerator.ts   sound -> complete spelling pool -> ranking
    audition*.ts           renderer-neutral and browser audition projection
    identityAudition.ts    identity phrase audition projection
    analysis*.ts           pure artifact/set evidence where applicable
    registry.ts            source/style-pack lookup

  naming/
    generator.ts           generic singular generateName(...) orchestration above mechanics
    givenName.ts           reusable semantic generateGivenName(...) capability above generateName(...)

  styleCompilation/
    styleCompiler.ts       typed StyleInput -> SoundProfile compiler

  fictionCast/
    ensemble.ts            Fiction Cast surface-specific ensemble behavior and role-derived planning preferences
    types.ts               Fiction Cast result/settings specialization and contextual result metadata
    rarity.ts              Fiction Cast rarity vocabulary, distribution policy, and deterministic resolution
    export.ts              Fiction Cast JSON/Markdown export and compatibility projections
    identity.ts            Fiction Cast identity grammar/materialization
    identityLexicon.ts     Fiction Cast lexical title/epithet material
    componentGenerationContext.ts
                            current semantic component-generation context seam

  ui/                      shared and mode-specific React presentation
    modes.ts               active mode presentation metadata
    GameNpcView.tsx        Game NPC product view
    NameArtifactInspector.tsx
                            shared artifact inspection and browser playback
```

The exact file list can continue to evolve. The durable rule is ownership and dependency direction: surfaces compose semantic capabilities; semantic capabilities delegate to one singular naming primitive; mechanics stay below naming semantics; and neither legacy `silhouette` evidence, generic grouping, rarity presentation, nor `mode` metadata becomes a shortcut around that structure.