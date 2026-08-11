# Name Forge Architecture

Name Forge is a multi-mode random-name workbench whose durable result unit is an inspectable `NameArtifact`. The current product has two active modes, Fiction Cast and Game NPC, over shared criteria-driven and sound-first generation machinery.

This document describes the **current technical architecture**. Historical slice plans and checkpoints remain useful records, but current-state guidance should defer to this document, [`model-module-contracts.md`](model-module-contracts.md), [`current-product-scope.md`](current-product-scope.md), and accepted decision records.

Related current docs:

- [`model-module-contracts.md`](model-module-contracts.md): current model shapes, collection semantics, and module ownership.
- [`sound-model-behavior.md`](sound-model-behavior.md): sound mechanics, provenance, spelling, and audition behavior.
- [`identity-audition.md`](identity-audition.md): current identity phrase and browser playback boundary.
- [`requirements/sound-unit-audio-audition-boundary.md`](requirements/sound-unit-audio-audition-boundary.md): current browser audition versus genuinely future renderer/provider audio work.
- [`requirements/name-grouping-design-boundary.md`](requirements/name-grouping-design-boundary.md): implemented exact independent-set grouping and deferred richer grouping semantics.
- [`requirements/game-npc-mode-boundary.md`](requirements/game-npc-mode-boundary.md): active Game NPC product boundary.
- [`decisions/0005-sound-profile-product-boundary.md`](decisions/0005-sound-profile-product-boundary.md): accepted sound-profile, style-compilation, product-semantics, and containment-provenance boundary.

## Current architecture thesis

The directional architecture is:

```text
product surface / request adapter
            |
            v
name orchestration
            |
            v
typed style compilation
            |
            v
pure SoundProfile value
            |
            v
sound generation
            |
            v
spelling mechanics
            |
            v
NameArtifact / product composition
```

The important ownership split is:

- **`src/engine`** owns reusable mechanics and durable shared contracts.
- **`src/naming`** owns current orchestration that turns existing settings/silhouette inputs into generated names.
- **`src/styleCompilation`** owns typed style languages and compilation into `SoundProfile`.
- **`src/fictionCast`** owns Fiction Cast semantics such as identity grammar, lexical title/epithet material, component context, and ensemble behavior.
- **`src/ui`** owns presentation and interaction, including the shared inspector and mode-specific views.

Do not move product semantics into the sound engine merely because a generated identity eventually contains sound.

## Architectural principles

1. **Controlled stochasticity**: generation is deterministic from explicit seeds and resolved inputs.
2. **Criteria before generation**: user intent should become structured `NameCriteria` before it affects shared request behavior.
3. **Sound structure before spelling**: `SoundProfile` drives sound mechanics; spelling is a projection and ranking layer over generated sound.
4. **Pure mechanics values**: `SoundProfile`, `SoundCandidate`, `SegmentSequence`, and spelling values do not need synthetic identity merely to reference one another.
5. **Containment provenance**: when exact generation evidence matters, retain the resolved values together in the containing result.
6. **Product semantics above mechanics**: roles such as given, family, place, title, epithet, and literal are semantic composition concepts, not generic sound-engine primitives.
7. **Mode-aware UX, mode-neutral shared generation**: product modes may choose controls, labels, defaults, and presentation; the shared request contract does not branch generation or grouping on `mode`.
8. **Internal scoring is selection machinery**: deterministic scoring can choose candidates without becoming a public universal quality percentage.
9. **Explain facts, not invented human certainty**: readability observations, structure, spelling relationships, and modeled sound evidence may be shown; universal pronounceability, memorability, realism, beauty, or cultural authenticity require separate validation.
10. **Small abstractions first**: promote reusable semantic APIs only when repeated product needs justify them.

## Shared request and grouping contract

The durable shared naming operation is:

```text
NameRequest -> NameResponse
```

The implemented v1 contract supports both the singular default and exact independent sets:

```text
NameRequest
  -> resolve criteria, optional mode metadata, quantity, grouping, and parent seed
  -> criteria diagnostics
  -> compile criteria into current GenerationSettings
  -> derive deterministic child seed per artifact index
  -> create silhouette and generate one name per child seed
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

`independent-set` does **not** provide cohesion optimization, diversity optimization, slots, per-slot criteria, ranked alternatives, partial results, or group-level reroll semantics. Those remain separate future contract work.

## Criteria and request adaptation

`NameCriteria` is the shared structured intent model. Current UI controls and presets may still use lower-level settings, but shared request behavior compiles supported criteria into current `GenerationSettings` through the existing compiler bridge.

The current request adapter lives in `src/engine/nameResponse.ts`. It resolves the request once, runs criteria diagnostics once, compiles criteria once, derives child seeds, invokes the current naming orchestration for each artifact, and maps generated results into `NameArtifact` values.

Unsupported or partially supported criteria are reported through diagnostics rather than silently presented as exact user-intent fulfillment.

The known follow-up risk remains duplicated supported-target knowledge between the criteria compiler and diagnostics. Centralize that knowledge before materially expanding supported criteria targets.

## Naming orchestration

Current name orchestration lives in `src/naming/generator.ts`, above the low-level sound engine.

It currently owns the transitional path:

```text
GenerationSettings + NameSilhouette
  -> StyleInput
  -> compileStyle(...)
  -> SoundProfile
  -> generateSound(...)
  -> complete spelling candidate pool
  -> deterministic spelling ranking and selection
  -> score / variants / readability diagnostics
  -> GeneratedName
```

This location is intentional. Translating current settings and silhouettes into style intent is naming orchestration, not sound mechanics.

The current API is a migration seam, not a declaration that `GenerationSettings + NameSilhouette` is the final reusable semantic naming API. Future reusable capabilities such as given-name or place-name generation should be introduced only when concrete product requirements justify them.

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

## Fiction Cast semantics

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

Fiction Cast also owns its ensemble behavior, roles, locks, cast review, same-roster relationship presentation, targeted reroll, and cast export semantics. These concepts do not become assumptions of the shared `NameRequest` contract.

## Game NPC boundary

Game NPC is a thin product mode over the shared platform. It intentionally generates one artifact at a time for fast prep/live-play use, even though the shared request contract now supports exact independent sets.

The mode owns navigation, product copy, style-source selection, copy, and fresh-seed reroll. It does not own a second generator, request family, artifact type, or inspector.

A future NPC roster should use the already-implemented shared quantity/grouping contract and receive a separate product decision about roster UX. Shared multiplicity existing in the platform does not automatically authorize plural Game NPC presentation.

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
    nameResponse.ts        shared request adapter/service
    nameArtifact.ts        durable artifact mapping
    nameCriteria*.ts       criteria model, diagnostics, and current compiler bridge
    candidateSelection.ts  internal spelling/candidate selection
    soundProfile.ts        pure SoundProfile mechanics value
    soundGenerator.ts      SoundProfile -> SoundCandidate / SegmentSequence
    spellingGenerator.ts   sound -> complete spelling pool -> ranking
    audition*.ts           renderer-neutral and browser audition projection
    identityAudition.ts    identity phrase audition projection
    analysis*.ts           pure artifact/set evidence where applicable
    registry.ts            source/style-pack lookup
    export.ts              shared/cast export support

  naming/
    generator.ts           current settings/silhouette -> generated-name orchestration

  styleCompilation/
    styleCompiler.ts       typed StyleInput -> SoundProfile compiler

  fictionCast/
    ensemble.ts            Fiction Cast ensemble behavior
    identity.ts            Fiction Cast identity grammar/materialization
    identityLexicon.ts     Fiction Cast lexical title/epithet material
    componentGenerationContext.ts
                            semantic component-generation context seam

  ui/                      shared and mode-specific React presentation
    modes.ts               active mode presentation metadata
    GameNpcView.tsx        Game NPC product view
    NameArtifactInspector.tsx
                            shared artifact inspection and browser playback
```

The exact file list can continue to evolve. The durable rule is ownership: mechanics stay below product semantics, orchestration stays above low-level sound generation, and shared contracts do not absorb Fiction Cast or Game NPC assumptions merely for convenience.