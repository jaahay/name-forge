# Name Forge Architecture

Name Forge is a random-name workbench whose first serious mode is **Fiction cast**. The current implementation should be read as a fiction-cast product surface built on reusable generation, scoring, comparison, brief, diagnostics, export, and provenance primitives.

The architecture goal is not to build a generic abstraction before the product earns it. The goal is to keep fiction-specific UX behind a clear mode boundary while the engine remains useful for future naming modes.

Related docs:

- [`product-brief.md`](product-brief.md): product thesis, mode strategy, candidate modes, and recommended sequencing.
- [`current-product-scope.md`](current-product-scope.md): active scope lens, shipped baseline, and next feature requirements.
- [`product-requirements.md`](product-requirements.md): original requirements and historical build-order scaffold.
- [`product-architecture.md`](product-architecture.md): product-level mode strategy.
- [`phase-one-closeout.md`](phase-one-closeout.md): Phase One completion and replacement tracking model.

## Current architecture thesis

Name Forge works by combining controlled randomness with explicit product judgment:

1. Generate candidate names from seeded randomness and soft-coded style data.
2. Shape candidates through silhouettes, rarity planning, role metadata, optional role influence, and optional Naming Brief context.
3. Score candidates with decomposed fit signals, including brief and role fit where applicable.
4. Select an ensemble that avoids obvious sameness.
5. Attach deterministic readability diagnostics without claiming canonical pronunciation.
6. Preserve provenance so generated names, listed alternates, rule-created variants, brief effects, diagnostics, and future external-source results stay distinguishable.

The important split is:

- **Engine primitives** are shared and reusable.
- **Mode presentation** is user-facing and can be fiction-specific.

## Architectural principles

1. **Controlled stochasticity**: random generation is deterministic by seed and constrained by explicit settings.
2. **Silhouette before spelling**: shape the intended name before exact letters are chosen.
3. **Ensemble-aware selection**: the first serious output is a cast, so repeated initials, endings, cadence, readability friction, and rarity clusters matter.
4. **Mode-aware UX, shared primitives**: Fiction cast can have role mix, slot overrides, cast health, and cast export without making those concepts global product assumptions.
5. **Hard-code mechanisms, not linguistic knowledge**: code owns schemas, algorithms, scoring, normalization, diagnostics, and provenance contracts; packs/providers own language-feel data.
6. **Generated primary names**: style packs guide generation; they are not copied as the primary output path.
7. **Provenance-bearing output**: every result should explain source, seed, style, role/rarity shaping, brief influence, variant relationship, readability notes, and scoring signals.
8. **Small abstraction first**: introduce seams only as needed. The current mode boundary is a lightweight config, not a full plugin framework.
9. **Pronounceability before pronunciation**: scoring and deterministic readability diagnostics may ship before text pronunciation, IPA, or audio artifacts.

## Runtime pipeline

```text
Active mode config
  -> Default GenerationSettings
  -> User settings and Naming Brief
  -> Resolve style pack
  -> Resolve role, role influence, and rarity settings
  -> Construct silhouettes
  -> Generate candidate pool
  -> Score candidates, including brief and role signals
  -> Apply ensemble constraints
  -> Attach identity and role metadata
  -> Generate variants
  -> Diagnose readability
  -> Attach provenance
  -> Return ranked ensemble
```

Each step should remain testable as TypeScript. UI code renders controls and results; it should not own generation behavior.

## Module boundaries

```text
src/
  App.tsx                 UI shell, active mode selection, interaction state, and locked-slot state
  App.test.tsx            SSR smoke coverage for shell-level UI contracts
  main.tsx                Vite/React entrypoint
  styles.css              Global presentation
  card-locks.css          Lock-control presentation
  cast-mode.css           Fiction Cast feature styling
  data/
    stylePacks.ts         Built-in soft-coded style packs
  engine/
    brief.ts              Naming Brief normalization, summary, fit, and influence metadata
    diagnostics.ts        Deterministic readability diagnostics and cast summaries
    ensemble.ts           Cast-level selection, diversity penalties, locked-slot preservation, and role attachment
    export.ts             JSON and Markdown cast serialization
    identity.ts           Given/surname/title/epithet identity composition
    generator.ts          Candidate materialization from silhouettes, style packs, brief anchors, and settings
    random.ts             Deterministic seeded randomness
    rarity.ts             Rarity distribution preset planning
    registry.ts           Provider/source lookup and style-pack registry
    roles.ts              Cast role labels, presets, parsing, slot resolution, and role influence profiles
    scoring.ts            Candidate score and explanation signals
    silhouettes.ts        NameSilhouette construction and rarity/shape planning
    types.ts              Core domain types and contracts
    variants.ts           Spelling variant generation and provenance
  ui/
    AboutView.tsx         Product explanation copy
    CastHealth.tsx        Deterministic roster-level checks and display
    ChangelogView.tsx     In-app changelog rendering
    GeneratorView.tsx     Mode-aware controls, brief controls, roster/inspector layout, selection state, and export surface
    modes.ts              Current mode config, defaults, labels, and presentation copy
    NameCard.tsx          Compact selectable/lockable generated-name tile
    NameInspector.tsx     Selected-name detail surface
    namePresentation.ts   Shared name display, length, rarity, and construction-cue helpers
    ScoreControl.tsx      Numeric and slider score control rendering
    presentation.ts       UI labels, score labels, rarity labels, and changelog entries
    score.ts              UI score formatting and visual class helpers
```

## Mode system

Name Forge should be treated as a mode-based product, not a collection of unrelated generators. A mode defines the naming job being performed. Shared primitives provide the reusable generation, scoring, comparison, brief, diagnostics, export, and provenance machinery beneath that job.

The app currently exposes one mode: **Fiction cast**.

### Current mode config

`src/ui/modes.ts` owns the current mode config:

- mode id and labels
- hero copy
- result and export headings
- generate button copy
- default `GenerationSettings`
- user-facing description for the first `What are you naming?` selector

This boundary keeps fiction-cast defaults and presentation out of `App.tsx` without pretending future modes are fully designed. The next mode should extend this seam only after its workflow is concrete.

### What belongs in a mode

Mode-level code may own:

- product vocabulary
- default settings
- control grouping and labels
- mode-specific result headings
- export headings and export vocabulary
- scoring emphasis and fit explanation copy
- user-facing result-card and inspector presentation choices

### What does not belong in a mode

Mode-level code should not fork core mechanics unnecessarily. The following should remain shared until a real second mode proves otherwise:

- seeded random generation
- style-pack lookup and provider registry contracts
- Naming Brief normalization and metadata
- deterministic readability diagnostics
- silhouette construction
- candidate generation
- decomposed scoring primitives
- set/list comparison pressure
- spelling variant relationships
- warning and collision metadata
- provenance structure
- JSON/Markdown serialization mechanics where the shape is not mode-specific

### Adding a future mode

A future mode should be added only when it has a clear user job, output contract, and validation target. Do not add placeholder modes just to populate the selector.

Before adding a second active mode, answer:

1. What user job does this mode perform?
2. What controls are required on day one?
3. What result-card shape is useful for scanning output?
4. Which shared primitives does it reuse?
5. Which assumptions from Fiction cast must not leak into it?
6. What fixture or smoke test proves the mode boundary works?

The first second mode should likely be close to Fiction cast, such as Game NPC, because it can stress the mode boundary without requiring a wholly different engine. It should follow variant/source/warning hardening rather than precede it.

## Shared engine primitives

These should remain reusable across future modes:

- `GenerationSettings`
- `NamingBrief`
- seeded random utility
- style pack and provider registry
- `NameSilhouette`
- candidate generation
- decomposed scoring
- deterministic readability diagnostics
- ensemble/list comparison pressure
- identity composition
- spelling variants and relationship metadata
- warning/collision metadata
- provenance entries
- JSON/Markdown export mechanics

Fiction-specific concepts can use these primitives, but should not silently redefine them globally.

## Core domain model

The engine centers on these first-class types:

- `GenerationSettings`: adjustable axes such as cast size, seed, style pack, name format, role preset, role influence, rarity distribution, novelty, pronounceability, memorability, cultural anchoring, orthographic weirdness, and optional brief.
- `NamingBrief`: mode-agnostic user intent capture for use context, tone words, desired associations, avoid list, hard constraints, anchor examples, and notes.
- `BriefInfluenceMetadata`: deterministic explanation of whether a name reflects, carries, or conflicts with part of the brief.
- `ReadabilityDiagnostic`: non-canonical readability/speakability notes for names and casts.
- `NameSilhouette`: the pre-spelling shape of one full name.
- `GeneratedName`: rendered text plus identity parts, optional role metadata, optional role influence metadata, optional brief influence, score metadata, variants, readability diagnostics, provenance, warnings, and seed.
- `NameScores`: decomposed scoring signals, not just one opaque score.
- `CastRoleAssignment`: fiction-cast role metadata resolved from a preset or slot override.
- `NameVariant`: listed or generated spelling alternatives. The next contract should add relationship, confidence, source, generated/listed status, and optional locale metadata.
- `ProvenanceEntry`: source and contribution metadata.
- `StylePack`: soft-coded aesthetic and sound-pattern constraints.
- `DataSourceDescriptor`: future registry pointer to built-in, file, HTTP, API, package, and custom/user pack sources.

## Style packs and provider registry

Style packs define the statistical neighborhood for generation. They guide candidate creation and distance calculations; they should not be copied blindly into output.

The provider registry stores pointers and contracts, not large data payloads. Built-in providers are enough for the MVP, but the next registry step should define descriptor contracts and validation before user-loaded packs, remote providers, pronunciation dictionaries, frequency data, script inventories, or audio backends appear.

### Hard-coded engine responsibilities

- TypeScript schemas and interfaces
- registry and loader interfaces
- deterministic RNG
- candidate generation algorithms
- scoring algorithms
- readability diagnostic algorithms
- ensemble balancing algorithms
- role and rarity preset resolution
- role influence profiles and scoring hooks
- brief normalization and scoring hooks
- normalization pipeline
- fallback inventories and minimal fixtures
- provenance structure

### Soft-coded data responsibilities

- style packs
- source descriptors
- pronunciation dictionaries
- spelling variant rules
- cultural naming packs
- frequency data
- phoneme and grapheme inventories
- external pack integrations

## Scoring model

Candidate scoring exposes decomposed signals for pronounceability, memorability, novelty, cultural anchoring, orthographic naturalness, style fit, silhouette fit, ensemble fit, and role fit. Brief content may influence style fit and generation without replacing the core sliders.

The UI should expose scores as **Fit** rather than as diagnostics. Diagnostics is an implementation/debugging posture; Fit is the product concept users are evaluating.

## Pronounceability and pronunciation boundary

Pronounceability is currently a scoring/control axis. It means the product can judge and explain whether a name appears speakable, readable, and usable in context.

Readability diagnostics are now the shipped non-canonical explanation layer. They can flag likely friction such as long reads, dense clusters, repeated letters, or possible visual misreads.

Pronunciation is a stronger artifact. Text pronunciation hints, IPA, audio, and dictionary-backed pronunciation should remain deferred until the product has:

- explicit locale assumptions
- phoneme inventory strategy
- confidence labels
- provider/source provenance
- clear non-canonical wording for invented names

The next near-term architecture step is not IPA. It is variant/source/warning hardening around the existing deterministic workbench.

## Ensemble balancing

Ensemble generation should produce more candidates than needed, then choose a cast that avoids obvious repetition. The balancing layer penalizes repeated initials, repeated endings, duplicate cadence, too many names in the same rarity band, and excessive orthographic weirdness across the cast.

Role labels are metadata by default. Role influence is opt-in and can nudge silhouette, sound patterns, role-fit scoring, seed segmentation, and export metadata when enabled.

Locked slots are preserved in place, and diagnostics are recomputed after locked and newly generated names are assembled.

## Spelling variants

Variants must be labeled by relationship type. MVP listed variants are clearly marked as listed alternates, and rule-created variants are clearly marked as generated spellings. Future external-source variants can use the same contract with stronger confidence and source provenance.

Supported relationship types include `same_pronunciation`, `near_pronunciation`, `orthographic_variant`, `regional_variant`, `historical_variant`, `transliteration`, `cognate`, `diminutive`, `nickname`, `creative_respelling`, and `alias`.

The next variant slice should make this full contract real in TypeScript, Inspect, JSON export, and Markdown export.

## Warnings and collision scaffolding

Warnings should be cautious screening metadata, not claims about identity, culture, or demographic meaning.

Near-term warning work should stay local and deterministic:

- common-word collision notes
- known-name or anchor-distance notes
- unusually dense similarity within a cast
- export and Inspect surfacing only when warnings exist

Do not add demographic inference, external search, or cultural certainty in the warning slice.

## Provenance

Every output should answer:

- Which generator produced this?
- Which style pack and rules contributed?
- Which brief signals influenced or failed to influence the result?
- Which role or rarity controls shaped the cast slot, if any?
- Was role influence active?
- Was an alternate spelling listed, generated, or externally sourced?
- What seed reproduced it?
- Which scoring reasons explain its rank?
- Which readability or warning notes were attached?

The provenance contract is product-critical because it keeps generated primary names, listed alternates, brief effects, diagnostics, and future externally sourced results distinct.

## UI contract

The MVP UI exposes one single-page Fiction cast generation mode with progressive controls for Cast setup, Story roles, Naming brief, Name feel, and Run options.

The core controls are mode, cast size, seed, style preset, name format, cast role mix, role influence, slot role overrides, naming brief, rarity distribution, novelty, pronounceability, memorability, cultural anchoring, and orthographic weirdness.

The current result model is:

- **NameCard**: compact scan/select/lock tile for the generated name, rarity, and syllable count.
- **NameInspector**: persistent selected-name detail surface for rarity cue, construction cues, score readout, name parts, spellings, brief influence, readability notes, and role influence cue.
- **CastHealth**: roster-level comparison surface for spotlight budget, repeated initials/endings, cadence overlap, readability notes, and lock status.
- **Export**: late-flow JSON and Markdown handoff without making raw export text dominate the generated cast.

Do not return to nested Details/Fit sections inside every card unless the interaction model changes again. The current design keeps cards readable and moves detail into Inspect.

## CI and merge-readiness

CI is intentionally not attached to every push or ordinary PR update. The workflow is reserved for merge-readiness signals:

- manual workflow dispatch
- marking a draft PR ready for review
- adding a `merge-ready` label

This keeps exploratory branch work cheap while preserving a clear validation gate before merge.

## Testing strategy

Unit tests should prioritize deterministic engine contracts:

- same seed and controls produce the same output
- same seed, controls, and brief produce the same output
- different seeds produce different candidates
- generator respects basic silhouette constraints
- ensemble balancing reduces repeated initials/endings where possible
- locked slots are preserved and diagnostics are recomputed
- scoring returns stable decomposed metadata
- role presets and slot overrides resolve deterministically
- role influence is metadata-only when off and deterministic when enabled
- rarity distribution presets resolve deterministically
- brief normalization, influence, avoid-list penalties, and export metadata stay deterministic
- readability diagnostics are deterministic and provider-free
- variants are generated and labeled correctly
- future variant relationship/confidence metadata is deterministic
- registry resolves built-in style packs and source descriptors
- future pack validation rejects malformed built-in or user pack shapes

UI smoke tests should verify shell-level contracts such as mode boundary copy, visible controls, grouped sections, compact name cards, persistent Inspect, Cast Health, Naming Brief controls, readability notes, lock controls, and export affordances.
