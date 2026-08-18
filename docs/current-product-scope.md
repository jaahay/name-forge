# Current product scope

This document is the active scope lens for deciding what Name Forge should build next. The historical requirements remain in [`product-requirements.md`](product-requirements.md).

Related decisions and boundaries:

- [`decisions/0001-name-artifact-and-request-contract.md`](decisions/0001-name-artifact-and-request-contract.md)
- [`decisions/0002-criteria-driven-generation.md`](decisions/0002-criteria-driven-generation.md)
- [`decisions/0003-intent-criteria-compiler-pipeline.md`](decisions/0003-intent-criteria-compiler-pipeline.md)
- [`decisions/0004-modes-presets-and-grouping.md`](decisions/0004-modes-presets-and-grouping.md)
- [`decisions/0005-sound-profile-product-boundary.md`](decisions/0005-sound-profile-product-boundary.md)
- [`decisions/0006-naming-capabilities-and-surface-composition.md`](decisions/0006-naming-capabilities-and-surface-composition.md)
- [`requirements/game-npc-mode-boundary.md`](requirements/game-npc-mode-boundary.md)
- [`requirements/name-grouping-design-boundary.md`](requirements/name-grouping-design-boundary.md)
- [`implementation/sound-proximity-diagnostics.md`](implementation/sound-proximity-diagnostics.md)

## Active product contract

Name Forge is a multi-mode random-name workbench whose durable shared result is an inspectable singular `NameArtifact`. Product surfaces may compose generated names with other generated components, lexical values, derived values, initials, or literals, but those surface results do not become a broader shared artifact type.

The shared product contract is:

> Generate names that are novel, usable, explainable, reproducible, and tuned through explicit product controls without presenting internal heuristics as universal human truth.

The two active modes serve different jobs:

- **Fiction Cast:** help build a coherent but distinct ensemble of character names.
- **Game NPC:** provide one usable generated name quickly for prep or live play, with immediate inspection, copy, and reroll.

The product remains a generator and evaluation workbench. It is not a writing assistant that invents character hooks, biographies, or encounter content by default.

## Current platform and naming-capability contract

The implemented shared request boundary remains:

```text
NameRequest -> NameResponse
```

It supports singular-compatible generation and exact independent sets, deterministic replay, criteria diagnostics, ordered `NameArtifact[]` results, and grouping metadata. `mode` is optional metadata and must not drive generic generation or grouping behavior.

That request contract is **platform and transport infrastructure**, not the semantic callback hierarchy that surfaces compose.

The implemented naming-layer direction is:

```text
product surface
  -> reusable typed semantic callback(s)
     generateGivenName(...)   [implemented]
     generateFamilyName(...)  [implemented]
     generatePlaceName(...)   [implemented]
  -> generic singular generateName(...)
  -> typed style compilation
  -> SoundProfile / SegmentSequence
  -> complete supported spelling pool
  -> deterministic selection
  -> singular GeneratedName
  -> singular NameArtifact when persisted through the shared artifact boundary
```

A surface owns its UX, defaults, presets, and surface-specific state. It derives configuration for one or more reusable semantic callbacks. Those callbacks carry domain semantics and delegate to the single generic `generateName(...)` primitive.

First-class semantic treatment does not require every wrapper to have distinct mechanics. The currently supported generated name roles—given, family, and place—are all first-class semantic API categories. `generateFamilyName(...)` and `generatePlaceName(...)` are currently behavior-equivalent where no supported heuristic distinguishes them, while still delegating to `generateName(...)` through the same stable semantic invocation boundary.

A surface may also own a multi-name operation when the cross-name behavior itself is meaningful to that surface. Such orchestration sits **above** reusable semantic callbacks. Shared `independent-set` quantity remains useful infrastructure for repeated independent generation but is not the mandatory abstraction for every roster or set workflow.

The singular `generateName(...)` boundary is implemented in `src/naming`. It accepts one immutable deterministic seed and owns partitioning that seed into its internal planning/generation random streams. It constructs an internal `NameGenerationPlan` from generic planning inputs before style, sound, spelling, scoring, and variants. Product semantics such as Fiction Cast roles are resolved above that boundary into semantic planning pressure and surface-owned scoring evidence. The existing `silhouette` property remains compatibility and inspection evidence on singular generated names/artifacts; callers no longer construct a `NameSilhouette` or call a silhouette-shaped generator.

The #201 correction keeps Fiction Cast settings and role metadata above the generic boundary. `GenerationSettings` contains generic one-name controls plus shared `stylePackId` / `seed`; generic `NameGenerationPlan`, `GeneratedName`, and `NameArtifact` do not carry Cast role or role-influence metadata. Fiction Cast owns the richer settings/result contracts and projects role, rarity, contextual scoring, and ensemble evidence only at its surface boundary.

The #202 correction established one reusable semantic invocation pattern for given, family, and place names. Semantic callers provide `GenerationSettings`, a source registry, one deterministic seed/result address, and typed semantic preferences. The semantic layer owns style-pack resolution and preference translation; `generateName(...)` owns internal RNG construction/partitioning and generic planning representation. Fiction Cast primary given and supporting family/place generation all enter through their corresponding semantic wrappers.

Generic one-name scoring is intrinsic. `NameScores` and `ScoreKey` contain only one-name evidence plus intrinsic `overallFit`; Fiction Cast owns `roleFit`, `ensembleFit`, and the contextual overall used for cast candidate selection in `FictionCastContextualScores`. Cast export lives under `src/fictionCast` and preserves its existing flattened JSON/Markdown score shape at the surface boundary rather than teaching generic engine contracts about cast context.

Rarity is also surface-owned rather than a semantic or mechanical property of generic name generation. `FictionCastRarityBand`, rarity-distribution policy, rarity diagnostics, and each generated cast identity's `rarityBand` live under `src/fictionCast`. Generic `NameGenerationPlan`, semantic preferences, and style-pack silhouette mechanics do not carry rarity. Fiction Cast may still expose rarity as a useful user control and export it as cast metadata; that projection does not make rarity causal input to `generateName(...)`.

The #203 correction separates primitive generated-name evidence from composed product identities. `GeneratedName.name` is exactly the selected spelling described by that result's sound/spelling/planning evidence and no longer carries optional compound identity composition. `FictionCastGeneratedName` is a composed surface result with its own `displayName`, identity/audition, Cast metadata, and a contained unchanged `primaryName`. Generated supporting-component evidence remains on the corresponding identity part rather than being flattened into aggregate top-level primitive fields.

`NameArtifact` deliberately stays singular rather than becoming a composition envelope. Shared history persists singular artifacts and performs strict validation on read; older composition-shaped records are dropped rather than migrated into a wider shared type. Fiction Cast history records the generated `primaryName`, while the full composed display/provenance remains represented by the live Fiction Cast result and its surface-owned export contract. A narrow primary-name projection may retain a Cast result ID for inspector/relationship navigation without adding composition fields to `NameArtifact`.

## Lexical inventory and finite-choice direction

Not every identity component belongs on the generated-name path. Bounded lexical material such as particles, honorifics, titles, or generational suffixes should use a separate reusable finite-choice path rather than pretending that a `SoundProfile` generated those values.

The accepted mechanical direction is a small deterministic generic selector such as `selectFromOptions(...)`, wrapped by semantic selectors such as `selectParticle(...)`, `selectGenerationalSuffix(...)`, or `selectHonorific(...)` where a domain-level API is useful.

The underlying option lists should be persisted as typed naming lexicon / lexical inventory data alongside the existing sound and grapheme inventories rather than scattered as accidental hard-coded policy. Those inventory sources should be able to retain provenance and linguistic/regional scope—language, region, dialect, period, register, or comparable qualifiers—without forcing every caller to pass each detail separately.

Caller-facing semantic APIs may expose a typed `options` facade that resolves or encapsulates those granular inventory/source details. Name Forge owns the inventory contract, validation, deterministic selection behavior, versioning, and the bundled datasets it ships; it does not claim that a bundled dataset is the definitive linguistic truth for a locale or naming tradition.

This direction does not create a universal `NameSegment` abstraction or an omnibus `generatePersonName(...)` function. Composition of generated names, selected lexical values, derived values, and literals remains with the surface/domain whose grammar is actually known.

The exact lexical inventory types and migration of existing surface-owned lists should be a separate bounded implementation slice unless an active foundation correction requires them directly.

## Current shipped baseline

Shared platform capabilities now include:

- deterministic parent-seed resolution and replay through `NameRequest -> NameResponse`;
- exact independent-set quantities from 1 through 100;
- deterministic index-stable child seeds, ordered artifacts, and grouping metadata;
- singular-compatible defaults when quantity and grouping are omitted;
- criteria diagnostics and a compiler bridge into generic generation settings without fabricating Fiction Cast defaults;
- one generic singular `generateName(...)` orchestration boundary that accepts one seed and owns internal RNG partitioning above style/sound/spelling mechanics;
- first-class `generateGivenName(...)`, `generateFamilyName(...)`, and `generatePlaceName(...)` semantic callbacks using one stable semantic invocation boundary and delegating one-name synthesis to `generateName(...)`;
- intrinsic generic one-name scoring that does not fabricate Fiction Cast role or ensemble values;
- internal `NameGenerationPlan` materialization hidden behind `generateName(...)` rather than required from callers; its generic constructor produces one-name planning evidence and carries no Fiction Cast role, role-influence, or rarity metadata;
- sound-first generation through `SoundProfile` and `SegmentSequence`;
- exhaustive spelling derivation from the current grapheme inventory;
- deterministic rule-weighted spelling ranking with ordinal tie-breaking;
- complete ranked spelling retention on singular generated names and `NameArtifact` values;
- exact bounded-result prefix invariance after full-pool ranking;
- one singular `NameArtifact` contract containing the exact sound/spelling/plan/variant/readability evidence for its own display spelling, with composition fields rejected by runtime validation;
- a shared `NameArtifactInspector` that remains primitive-only while product surfaces may supply their own display/voice presentation and secondary UI;
- deterministic readability observations and browser audition projection;
- provenance-preserving identity audition phrases for composed names, retaining generated sound evidence for sound-backed given, family, and place parts while leaving lexical text and literals explicit (issue #174);
- sound-backed identity parts retain their own generation provenance bundle, including the exact compiled `SoundProfile`, `SoundCandidate`, and selected spelling used for that component rather than treating a compound identity as if one top-level profile described every part (issue #178);
- semantic phrase-chunk browser audition for composed identities, allowing short inter-part pacing without changing or claiming a canonical pronunciation (issue #178);
- semantic component-generation contexts for given, family, and place sound-backed parts, with current defaults preserving existing generation behavior while establishing an internal semantic seam (issue #176);
- pure single-artifact and artifact-set analysis APIs;
- deterministic same-roster sound-relationship evidence with typed details, exact pair identity, and fixed precedence and ordering;
- source descriptors and built-in style-pack validation;
- richer variant relationship, confidence, source, and locale metadata where available;
- versioned, bounded browser persistence for singular user-generated `NameArtifact` snapshots, with strict validation and no read-time reinterpretation of composition-shaped records;
- a Recent names surface that restores saved singular artifacts into the shared inspector without regeneration;
- explicit clear-history behavior and safe handling of malformed, unsupported, or unavailable browser storage.

Fiction Cast additionally includes:

- deterministic ensemble generation;
- cast size, format, role mix, slot override, role influence, rarity, and tuning controls;
- cast-role semantics resolved above `generateGivenName(...)` into typed given-name preferences for the primary component, with role evidence and role-fit scoring retained in Fiction Cast orchestration;
- supporting family/place generation through first-class `generateFamilyName(...)` / `generatePlaceName(...)` semantic wrappers while retaining Cast orchestration above them;
- surface-owned rarity distribution, rarity labels, rarity diagnostics, and cast-result metadata that do not enter semantic name generation or generic `NameGenerationPlan` construction;
- surface-owned contextual `roleFit`, `ensembleFit`, and cast overall scoring, with `primaryName.scores` remaining intrinsic;
- composed `FictionCastGeneratedName` results with a product-level `displayName`/identity and contained singular `primaryName`, rather than inheriting `GeneratedName` and overwriting its text;
- singular `primaryName` history persistence plus a narrow primary-name artifact projection that retains Cast result IDs for relationship and inspector navigation without creating a composed shared artifact;
- a compact post-generation summary bar that keeps Tune and Regenerate available without leaving the full criteria summary in the primary reading path (issue #176);
- lock and selection iteration;
- selected-name single-slot reroll with non-target preservation, lock semantics, selection continuity, and targeted Recent names recording of the rerolled primary generated name (issue #167);
- full-card collapsed-name selection with a separately actionable bottom-right lock control (issues #172 and #178);
- an integrated Names + Inspect workbench whose desktop regions share a stable vertical frame; roster overflow and expanded secondary details stay within their own panes so either side does not repeatedly become much longer than the other (issues #176 and #178);
- a decision-oriented inspector whose primary shared sound/spelling evidence belongs to `primaryName` while composed display, composition, Cast context, scoring, and component sound drafts remain Fiction Cast-owned presentation (issues #174, #176, #178, and #203);
- per-component browser audition actions for generated sound-backed given, family, and place parts in the Cast-owned detail surface, alongside whole-identity playback (issue #178);
- full phrase-level browser voice drafts for composed identities while retaining modeled primary-name sound projection through the shared inspector (issue #174);
- cast-level balancing and collision diagnostics without repeated-initials presentation chrome;
- a collapsed Cast review surface that exposes actionable cast notes and same-roster sound relationships without permanently presenting healthy diagnostic prose (issue #176);
- pair-grouped same-roster sound relationships with plain-language labels and typed technical evidence;
- direct Cast-ID navigation from either primary-sound relationship name into the existing selected-name Inspect, Lock, and reroll workflow (issue #170 and #203);
- JSON and Markdown cast export owned by the Fiction Cast layer while preserving the existing `name-forge.cast.v2` shape, with display identity at `name` and primitive sound/silhouette/variant/intrinsic-score fields projected from `primaryName`.

Game NPC additionally includes:

- a minimal singular generation workflow;
- style-source selection;
- fast reroll with a fresh seed;
- shared artifact inspection, copy, and browser voice-draft actions.

## Human-facing claims boundary

Name Forge may expose deterministic facts about generated structure, spelling alternatives, and observed read friction. It must not relabel internal weighted heuristics as validated human-facing metrics.

| Concept | Current status | Product boundary |
| --- | --- | --- |
| Readability diagnostics | Shipped deterministic evidence | Reports concrete letter-pattern and structure observations; not a measured ease score. |
| Browser audition draft | Shipped projection | Approximate browser speech derived from modeled sound and provenance-preserving composed-name phrase projection; not canonical pronunciation. |
| Same-roster sound relationships | Shipped deterministic evidence and Fiction Cast presentation | Reports exact modeled relationships between artifacts from one explicit roster snapshot; not measured human similarity or confusion. |
| Pronounceability | Research only as a human-facing metric | Requires a declared listener population, language assumptions, methodology, and validation. |
| Familiarity | Research only | Requires a declared corpus or audience. |
| Memorability | Research only | Requires evidence that the model predicts recall or recognition. |
| Beauty, realism, cultural authenticity | Unsupported as universal scores | Must not be inferred from internal weights or presented without declared evidence and governance. |
| IPA or provider audio | Deferred | Requires a separate locale, confidence, and provider strategy. |

The active rule is:

> Explain modeled structure and deterministic evidence. Do not claim validated human perception without validated human evidence.

## Active foundation checkpoint

Parent checkpoint #198 is the active gate before new surface-specific requirements work. The dependency direction is accepted, and the blocking #201/#202/#203 corrections have now been implemented; #198 still needs to record the explicit foundation sign-off conclusion after #203 merges.

### Completed review — issue #199

The engine and naming-interface review concluded **foundation not yet settled**.

That review correctly observed that current family/place supporting components did not yet have distinct one-name generation mechanics or configuration. The subsequent checkpoint decision refined the conclusion: distinct mechanics are not required for first-class semantic API treatment. Given, family, and place are stable generated-name categories already present in the product and now each have a first-class wrapper over `generateName(...)`.

### Completed correction — issue #201

Fiction Cast/application settings and role metadata are separated from generic naming contracts. The shared criteria/request path no longer manufactures Cast-only defaults; generic planning and generated-name contracts contain no Cast role metadata; and Fiction Cast owns its settings, composed results, ensemble diagnostics, contextual scoring, rarity, and Cast-only UI boundaries.

### Completed correction — issue #202

The semantic-callback invocation contract accepts shared settings/source context plus one deterministic seed, result addressability, and semantic preferences while hiding lower style-pack/planning plumbing. `generateGivenName(...)`, `generateFamilyName(...)`, and `generatePlaceName(...)` all delegate lexical-name generation to the seed-driven `generateName(...)`, which owns its internal RNG streams; family/place remain behavior-equivalent where no supported semantic heuristic distinguishes them.

### Completed correction — issue #203

The primitive sound-backed `GeneratedName` is separate from composed product identities. One generated component remains semantically coherent with its own sound/spelling/planning evidence; Fiction Cast contains that primitive as `primaryName` instead of redefining its text; generated supporting-part evidence stays per component; and the shared durable `NameArtifact` remains singular rather than pretending one aggregate primitive evidence bundle describes a composed identity.

### Documentation alignment — issue #200

Current documentation was audited against the post-#197/#199 state and subsequent checkpoint decisions, stale live guidance was corrected, and historical bodies remain historical records rather than current architecture authority.

### Accepted lexical vocabulary direction

Finite lexical vocabularies should use typed persisted inventories plus deterministic selection rather than generic sound generation. Semantic selectors may facade granular inventory/source details behind typed `options` contracts. The exact implementation should be separately scoped unless it becomes necessary to complete a future foundation or surface requirement.

### Foundation gate

After #203 merges, #198 must record an explicit **foundation settled for surface requirements work** or **foundation not yet settled** conclusion.

Only after foundation sign-off should a new comprehensive Fiction Cast UI/UX requirements boundary be written. That later requirements work is free to question current rarity, role, preset, tuning, format, Configure/Inspect, and presentation choices rather than treating the existing surface as product doctrine.

## Research-only backlog

### Human-facing name metrics — issue #152

Issue #152 is the governance boundary for claims such as pronounceability, familiarity, memorability, beauty, realism, or cultural authenticity. It is not part of the active implementation sequence.

A metric may move into a separate bounded implementation issue only after it has:

- a declared audience, listener population, language, locale, genre, or corpus;
- an exact construct and methodology;
- validation data or expert evidence;
- confidence, limitations, and known failure cases;
- a concrete user decision it improves;
- accurate UX copy explaining what is and is not being estimated.

## Deferred product and grouping work

The following remain possible later slices but are not authorized by this document:

- cohesion or diversity optimization as a reusable cross-surface contract;
- ranked-alternative grouping semantics;
- generic slot-level criteria or slotted sets;
- explicit per-component given/family/place tuning controls in the UI;
- partial-result recovery;
- Fiction Cast assumptions as shared engine behavior;
- Game NPC roster UX;
- dedicated Help/FAQ presentation;
- broader shell or visual-system redesign.

Surface-specific aggregate orchestration is not automatically deferred merely because it is plural; it should be designed when a selected surface requires it and should compose reusable semantic callbacks where available.

## Explicit non-goals for current foundation work

- No Fiction Cast UI/UX requirements boundary, control redesign, or layout redesign before #198 foundation sign-off.
- No baby-name mode.
- No prompt-first UX or LLM-driven criteria compilation.
- No public criteria-fit percentage.
- No mode-specific sound generator or `mode` branch inside `generateName(...)`.
- No duplicate family/place sound-generation implementation; their semantic wrappers delegate to `generateName(...)`.
- No universal multi-name callback.
- No universal `NameSegment` abstraction merely to unify heterogeneous identity parts.
- No omnibus `generatePersonName(...)` API that owns given/family/clan/house/title/affiliation composition.
- No universal lexical-inventory taxonomy or claim that Name Forge is the definitive authority for a locale or naming tradition.
- No universal semantic-style schema before concrete semantic callbacks need one.
- No reintroduction of Fiction Cast rarity categories into generic planning or semantic callback contracts merely because the UI exposes a rarity knob.
- No Fiction Cast aggregate redesign as part of the foundation corrections.
- No IPA, paid TTS integration, or pronunciation dictionaries.
- No external demographic inference.
- No remote provider integration without an accepted source and validation contract.
- No broad plugin framework.
- No character biography or encounter generation.
- No per-component tuning UI without a separately authorized user-facing contract.

## Issue hygiene baseline

Use one canonical issue per coherent slice. Completed issues remain closed through their merged implementation PRs. Exploration that is not required for the active slice belongs in a separate issue rather than expanding the current PR.
