# Name Forge Architecture

Name Forge is a multi-mode random-name workbench whose durable result unit is an inspectable `NameArtifact`. Durable artifacts are explicitly either a singular sound-backed `generated-name` artifact or a `composed-identity` artifact whose generated evidence remains attached to its generated parts. The current product has two active modes, Fiction Cast and Game NPC, over shared criteria-driven and sound-first generation machinery.

This document describes the **current technical architecture** and the accepted direction for the naming layer. Historical slice plans and checkpoints remain useful records, but current-state guidance should defer to this document, [`model-module-contracts.md`](model-module-contracts.md), [`current-product-scope.md`](current-product-scope.md), and accepted decision records.

Related current docs:

- [`model-module-contracts.md`](model-module-contracts.md): current model shapes, collection semantics, and module ownership.
- [`sound-model-behavior.md`](sound-model-behavior.md): sound mechanics, provenance, spelling, and audition behavior.
- [`identity-audition.md`](identity-audition.md): current identity phrase and browser playback boundary.
- [`requirements/sound-unit-audio-audition-boundary.md`](requirements/sound-unit-audio-audition-boundary.md): current browser audition versus genuinely future renderer/provider audio work.
- [`requirements/name-grouping-design-boundary.md`](requirements/name-grouping-design-boundary.md): implemented exact independent-set grouping and deferred richer grouping semantics.
- [`requirements/game-npc-mode-boundary.md`](requirements/game-npc-mode-boundary.md): active Game NPC product boundary.
- [`decisions/0005-sound-profile-product-boundary.md`](decisions/0005-sound-profile-product-boundary.md): accepted sound-profile, style-compilation, product-semantics, and containment-provenance boundary.
- [`decisions/0006-naming-capabilities-and-surface-composition.md`](decisions/0006-naming-capabilities-and-surface-composition.md): accepted singular `generateName` primitive, semantic `-Name` callbacks, finite lexical inventories/selectors, surface composition, and silhouette demotion.

## Current architecture thesis

The accepted dependency direction for generated lexical names is:

```text
product surface
  -> reusable semantic naming capability/capabilities
     generateGivenName(...)   [implemented]
     generateFamilyName(...)  [implemented]
     generatePlaceName(...)   [implemented]
  -> generic singular generateName(...)
  -> typed style compilation
  -> pure SoundProfile value
  -> sound generation
  -> spelling mechanics
  -> singular GeneratedName
  -> generated-name artifact when persisted directly
```

A product surface owns its UX, defaults, presets, surface state, and any genuinely surface-specific aggregate behavior. It converts those concerns into configuration for reusable semantic naming callbacks. Those callbacks carry domain meaning and delegate to the one generic singular naming primitive rather than becoming parallel sound generators.

Distinct mechanics are not required for first-class semantic status. Given, family, and place are stable sound-backed semantic roles already supported by the product, so all three are first-class semantic API categories. Family/place wrappers currently preserve the same lower generation behavior as `generateName(...)` while establishing typed semantic caller boundaries and future specialization points.

Surface-specific multi-name orchestration may sit above semantic callbacks when plurality itself carries product semantics. Fiction Cast therefore remains cast-specific while its generated given/family/place components use reusable naming capabilities.

A separate reusable path exists for finite lexical values that should not be synthesized through the sound model:

```text
typed NamingLexicon / LexicalInventory
  -> semantic selector
  -> deterministic selectFromOptions(...)
```

Semantic selectors own meanings such as particle, honorific, or generational suffix. The generic finite-choice mechanic owns only deterministic selection. The underlying typed inventory may retain provenance and language/region/dialect/period/register scope while a caller-facing `options` facade hides details that ordinary callers do not need to supply independently.

The important ownership split is:

- **`src/engine`** owns reusable mechanics and durable shared request/artifact contracts, including the discriminated generated/composed artifact boundary.
- **`src/naming`** owns the singular `generateName(...)` orchestration above those mechanics plus the reusable `generateGivenName(...)`, `generateFamilyName(...)`, and `generatePlaceName(...)` semantic capabilities and their shared invocation boundary.
- **semantic naming capabilities** live above `generateName(...)`, carry stable domain meaning, and own typed semantic configuration while hiding style-pack resolution and seeded-RNG construction from callers.
- **finite lexical inventory/selection** is an accepted adjacent platform capability: typed lexical source data plus small deterministic selection mechanics under semantic selectors. The exact runtime module/type shape is not implemented yet and should be introduced in a bounded slice.
- **`src/styleCompilation`** owns typed style languages and compilation into `SoundProfile`.
- **`src/fictionCast`** owns Fiction Cast settings/result contracts, identity grammar, current lexical title/epithet material, surface-specific ensemble behavior, locks, roles, contextual scoring, rarity policy/metadata, cast composition, and translation of cast-role semantics into semantic naming preferences.
- **`src/ui`** owns presentation and interaction, including the shared inspector and mode-specific views.

Do not move product semantics into the sound engine merely because a generated identity eventually contains sound. Do not move surface-specific orchestration into a universal backend abstraction merely because more than one name is involved. Do not introduce a universal `NameSegment` abstraction or omnibus `generatePersonName(...)` API merely because one surface composes heterogeneous identity values.

## Architectural principles

1. **Controlled stochasticity**: generation and deterministic selection are reproducible from explicit seeds and resolved inputs.
2. **One generic singular lexical-name primitive**: reusable generated-name synthesis goes through `generateName(...)` rather than accumulating multiple implementation-shaped generators.
3. **First-class semantic `-Name` wrappers above the primitive**: supported generated-name roles such as given, family, and place have typed domain callbacks that all delegate to `generateName(...)`; distinct lower mechanics are not a prerequisite.
4. **Finite vocabulary selection is separate from name synthesis**: bounded lexical values use typed inventories and deterministic finite-choice mechanics rather than pretending `SoundProfile` generated them.
5. **Surface composition above reusable capabilities**: product surfaces own UX-derived configuration and compose generated names, selected lexical values, derived values, and literals; surface-specific aggregate callbacks are allowed when their cross-name semantics are genuinely product-specific.
6. **Criteria are shared intent, not the entire domain vocabulary**: `NameCriteria` is appropriate when intent crosses the generic request boundary; semantic callbacks may additionally own typed configuration specific to their domain.
7. **Typed facades may hide granular source details**: semantic `options` contracts may encapsulate language, region, dialect, inventory/source, or planning details while the underlying typed data preserves those facts.
8. **Sound structure before spelling**: `SoundProfile` drives sound mechanics; spelling is a projection and ranking layer over generated sound.
9. **Pure mechanics values**: `SoundProfile`, `SoundCandidate`, `SegmentSequence`, and spelling values do not need synthetic identity merely to reference one another.
10. **Containment provenance and result coherence**: one `GeneratedName` contains the exact evidence for its own selected spelling; a composed identity retains generation evidence per generated component rather than reusing one component as aggregate evidence for the whole display.
11. **Product semantics above mechanics**: roles such as given, family, place, title, epithet, and literal are semantic composition concepts, not generic sound-engine switches.
12. **Mode-aware UX, mode-neutral generic generation**: product modes may choose controls, labels, defaults, presentation, and which semantic callbacks they compose; `mode` metadata must not secretly switch `generateName(...)` behavior.
13. **Internal scoring is selection machinery**: deterministic scoring can choose candidates without becoming a public universal quality percentage.
14. **Explain facts, not invented human certainty**: readability observations, structure, spelling relationships, and modeled sound evidence may be shown; universal pronounceability, memorability, realism, beauty, or cultural authenticity require separate validation.
15. **Implementation helpers must earn architectural status**: `NameGenerationPlan` is internal planning/scoring evidence, not another generation API. The legacy `silhouette` result property does not restore `NameSilhouette` as a caller-facing abstraction.
16. **Inventory authority is bounded by provenance**: Name Forge owns its inventory contracts, validation, deterministic consumption, versioning, and bundled datasets, not universal linguistic or cultural truth for a locale or naming tradition.

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
  -> map each GeneratedName to generated-name NameArtifact
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

`NameCriteria` is the shared structured intent model for intent that crosses the generic request boundary. Shared request behavior compiles supported criteria into current `GenerationSettings`, which contains generic one-name controls plus shared `stylePackId` / `seed` orchestration fields. The compiler does not manufacture Fiction Cast defaults; surface-specific settings remain above the shared request boundary.

A semantic callback may also expose strongly typed configuration meaningful only for its domain. A surface can derive shared criteria, semantic configuration, or both from its UX. Typed semantic `options` may facade more granular source/inventory details without expanding `NameCriteria` into a universal schema. Do not force every given-name, place-name, faction-name, lexical-vocabulary, or future style distinction into one universal criteria contract solely to preserve one input shape.

The current request adapter lives in `src/engine/nameResponse.ts`. It resolves the request once, runs criteria diagnostics once, compiles criteria once, derives child seeds, invokes `generateName(...)` for each artifact with separate deterministic planning/generation random streams, and maps generated results into generated-name `NameArtifact` values.

The request adapter continues to call `generateName(...)` directly because `NameRequest` does not currently assert a semantic name kind. First-class given/family/place wrappers do not change that transport boundary.

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
  -> singular GeneratedName
```

`GenerateNameOptions` accepts generic generation settings, style pack, deterministic planning/generation random streams, artifact index, and optional generic planning settings/preferences. It does **not** accept product mode, Fiction Cast role, rarity category, or semantic name-kind labels.

The implemented naming-layer dependency is:

```text
semantic `-Name` callback configuration
  -> shared semantic invocation boundary
  -> generateName(...)
  -> typed style resolution/compilation
  -> SoundProfile
  -> sound + spelling mechanics
  -> singular GeneratedName
```

`generateGivenName(...)`, `generateFamilyName(...)`, and `generatePlaceName(...)` are implemented above this primitive. All three use the same semantic invocation pattern and delegate one-name synthesis to `generateName(...)`; family/place intentionally remain behavior-equivalent where no supported semantic heuristic distinguishes them. Future name-bearing roles such as clan or house may follow this pattern when the product actually supports those nouns.

Semantic callers provide shared settings/registry context, deterministic seed material and result addressability, plus typed semantic preferences. The naming layer owns style-pack resolution, construction of planning/generation RNG streams, and translation into generic planning representation. Surface-specific aggregate operations sit above semantic callbacks.

### Generation-plan and legacy silhouette boundary

`NameSilhouette`, `createNameSilhouette(...)`, and `generateNameFromSilhouette(...)` are no longer caller-facing generation abstractions.

`generateName(...)` materializes a `NameGenerationPlan` internally. The plan retains syllable count, stress/rhythm, shape, texture, target novelty, and target length as generic generation/scoring and inspection evidence. It contains no Fiction Cast role, role-influence, or rarity metadata.

The existing `GeneratedName.silhouette` and generated-name `NameArtifact.silhouette` property name plus `silhouette-*` evidence IDs remain for compatibility. They do not require callers to build the plan and do not define a fourth generation callback category. Composed-identity artifacts do not carry one aggregate `silhouette` field.

Product/domain-specific influences must be resolved above `generateName(...)`. Fiction Cast, for example, converts role preferences into semantic naming preferences; it attaches role metadata and role-fit scoring in the Fiction Cast layer after singular generation. Its rarity policy is resolved separately and attached as surface result metadata without entering `generateName(...)`.

Further plan reduction or compatibility-field renaming should be justified by a concrete consumer/persistence migration rather than bundled into semantic-callback work.

## Finite lexical inventory and selection

Some identity values are selected from bounded vocabularies rather than synthesized from sound mechanics.

The accepted reusable shape is conceptually:

```text
NamingLexicon / LexicalInventory
  -> semantic selector such as selectParticle(...)
  -> selectFromOptions(...)
```

`selectFromOptions(...)` owns generic deterministic finite choice and should remain intentionally small. The semantic selector owns what the values mean. The inventory owns the typed lexical data and source metadata.

The exact runtime `NamingLexicon`/`LexicalInventory` type and module do not yet exist as shared platform contracts. When introduced, the data should live alongside other source-controlled model inventories rather than inside UI components or the generic selector. It should be capable of preserving declared provenance and relevant language/region/dialect/period/register scope without requiring every semantic caller to surface those fields individually.

Name Forge may ship and validate built-in inventories, but their authority is bounded by their declared provenance and scope. The platform contract must allow future curated, imported, third-party, setting-specific, or user-defined sources without pretending one bundled list is definitive.

Derived values such as patronymics may require dedicated derivation mechanics. They should not be forced through either `generateName(...)` or finite-option selection merely for API symmetry.

## Sound mechanics

`SoundProfile` is a pure resolved mechanics value. It contains the sound targets and phonotactic preferences required by generic sound and spelling generation.

A `SoundProfile` has no product role, Fiction Cast job tag, title/epithet lexicon, naming lexicon, composition grammar, compiler provenance identifier, synthetic profile ID, UI state, callbacks, cache, or runtime handle.

`src/engine/soundGenerator.ts` consumes a `SoundProfile` and seeded randomness to produce a `SoundCandidate` containing a `SegmentSequence` and syllable metadata.

`SegmentSequence` is one pre-spelling sound plan. Its flat segment order and syllable spans are durable mechanics data, not a canonical language pronunciation claim.

## Spelling mechanics

`src/engine/spellingGenerator.ts` projects a generated sound into the complete spelling pool supported by the current grapheme inventory and deterministically ranks that pool.

The selected spelling and retained alternatives remain tied to the exact generated sound and profile through containment in the singular generated name or generated-name artifact. Internal rank scores are useful selection evidence; they are not public beauty or fit percentages.

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

A singular `GeneratedName` is internally coherent: its `name` is exactly the selected spelling described by its top-level sound/spelling/planning evidence. It does not carry an optional compound `NameIdentity`.

A composed displayed identity does not imply one aggregate `SoundProfile`, spelling, generation plan, or variant set. If a displayed identity contains multiple independently generated sound-backed components, each generated `NameIdentity.parts[].generation` retains its own exact `SoundProfile`, `SoundCandidate`, and selected spelling. Selected lexical values, derived values, initials, titles, epithets, and literals remain explicit without fabricated sound-generation provenance.

Durable artifacts make the same distinction explicit:

```text
NameArtifact
  = GeneratedNameArtifact { kind: "generated-name", primitive evidence... }
  | ComposedNameArtifact  { kind: "composed-identity", identity/audition... }
```

A composed artifact cannot also expose aggregate primitive sound/spelling/plan fields. Legacy history-v1 records are normalized on read: legacy composed records retain their identity and component provenance while ambiguous aggregate top-level primitive evidence is discarded; coherent legacy singular records become explicit generated-name artifacts.

This separation does not require all heterogeneous parts to implement one generic `NameSegment` abstraction.

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

Generated given, family, and place parts retain exact generation evidence. Titles and epithets currently come from Fiction Cast-owned lexical material. Literals such as `of` remain explicit phrase literals.

This is product grammar, not phonology. The identity layer may compose parts and literals, but it must not pretend lexical material was generated by a `SoundProfile` when it was not. The accepted lexical-inventory direction gives finite shared vocabularies a future typed home without moving Fiction Cast composition grammar into the generic naming engine.

Fiction Cast resolves role-specific generation semantics above `generateName(...)`: role-influenced settings stay in its component-generation context, role-specific syllable/texture preferences become semantic preferences, and role metadata/role-fit scoring are attached by ensemble orchestration. The singular naming primitive never accepts a cast role.

Rarity follows a different path because it does not alter the generated name. Fiction Cast owns the rarity band/distribution vocabulary and deterministic rarity policy, resolves a band at the surface layer, attaches it to `FictionCastGeneratedName`, and uses it for cast diagnostics/presentation/export. Generic planning, semantic name configuration, style-pack mechanics, and `NameArtifact` do not acquire a rarity field merely because Fiction Cast exposes that user knob.

Given, family, and place are first-class semantic generated-name kinds. Fiction Cast routes primary given and supporting family/place generation through the corresponding semantic wrappers while retaining Cast role, rarity, selection, and composition behavior above them.

`FictionCastGeneratedName` is a composed surface result rather than a subtype of `GeneratedName`. It owns the composed `id`, `displayName`, `identity`, identity audition, Cast readability/context/rarity metadata, and contains an unchanged singular `primaryName`. Intrinsic sound, spelling, planning, variants, and intrinsic scores are reached through `primaryName`; generated supporting-component evidence is reached through the corresponding identity part.

Persistence and analysis choose an explicit projection. `toFictionCastNameArtifact(...)` produces a composed-identity artifact for history/inspection. `toFictionCastPrimaryNameArtifact(...)` projects the primary singular name for sound-relationship analysis while retaining the Cast result ID for roster navigation. Cast export remains `name-forge.cast.v2`: its exported display `name` is the composed display identity while existing sound/silhouette/variant/intrinsic-score fields are explicit compatibility projections from `primaryName`.

Fiction Cast itself still owns ensemble behavior, roles, rarity, contextual scores, locks, cast review, same-roster relationship presentation, targeted reroll, and cast export semantics. These cross-name semantics do not become assumptions of `generateName(...)` or the shared `NameRequest` contract merely because they involve multiple names.

## Game NPC boundary

Game NPC is a thin product mode over the shared platform. It intentionally generates one artifact at a time for fast prep/live-play use, even though the shared request contract now supports exact independent sets.

The mode owns navigation, product copy, style-source selection, copy, and fresh-seed reroll. It does not own a second sound generator, artifact type, or inspector.

As semantic callbacks become available, Game NPC should call the reusable semantic capability appropriate to the name it is asking for and inject configuration derived from its own UX. `mode: "game-npc"` remains metadata rather than a semantic switch.

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
    nameArtifact.ts        discriminated generated-name/composed-identity durable artifact contract and legacy normalization
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
    semanticName.ts        shared semantic invocation boundary; owns source resolution and RNG construction
    givenName.ts           semantic generateGivenName(...) wrapper
    familyName.ts          semantic generateFamilyName(...) wrapper
    placeName.ts           semantic generatePlaceName(...) wrapper

  styleCompilation/
    styleCompiler.ts       typed StyleInput -> SoundProfile compiler

  fictionCast/
    ensemble.ts            Fiction Cast surface-specific ensemble behavior over semantic naming callbacks
    types.ts               Fiction Cast composed result/settings and contextual metadata
    nameArtifact.ts        explicit composed persistence/inspection and primary sound-analysis projections
    rarity.ts              Fiction Cast rarity vocabulary, distribution policy, and deterministic resolution
    export.ts              Fiction Cast JSON/Markdown export and compatibility projections
    identity.ts            Fiction Cast identity grammar/materialization
    identityLexicon.ts     current Fiction Cast lexical title/epithet material
    componentGenerationContext.ts
                            surface-owned per-component semantic settings context

  ui/                      shared and mode-specific React presentation
    modes.ts               active mode presentation metadata
    GameNpcView.tsx        Game NPC product view
    NameArtifactInspector.tsx
                            shared generated/composed artifact inspection and browser playback
```

The module map above describes the current runtime. Future shared lexical-inventory modules should be introduced only by a bounded implementation slice.

The durable rule is ownership and dependency direction: surfaces compose semantic capabilities; semantic `-Name` capabilities delegate to one singular `generateName(...)` primitive; singular generated-name results remain coherent with their own evidence; composed product identities retain generated evidence per component and persist without fabricated aggregate generation evidence; finite lexical values use typed inventories and deterministic selection rather than sound synthesis; mechanics stay below naming semantics; and neither legacy `silhouette` evidence, generic grouping, rarity presentation, nor `mode` metadata becomes a shortcut around that structure.
