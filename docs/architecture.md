# Name Forge Architecture

Name Forge separates hard-coded generation mechanisms from soft-coded naming knowledge. The product target is a fictional naming engine, not a random string generator: randomness creates candidates, while silhouettes, scoring, provenance, and ensemble constraints decide what is usable.

See [`product-requirements.md`](product-requirements.md) for the full product specification. See [`product-architecture.md`](product-architecture.md) for the broader multi-mode product direction.

## Architectural principles

1. **Controlled stochasticity**: generation is seeded and random, then judged by explicit product criteria.
2. **Ensemble-first output**: the product output is a cast, not only an isolated name.
3. **Silhouette before spelling**: the system models the intended name shape before exact letters are generated.
4. **Provenance-bearing data**: generated names and variants report style pack, source, rules, seed, and scoring signals.
5. **Hard-code mechanisms, not linguistic knowledge**: algorithms and schemas live in the engine; inventories, anchors, phonotactics, variants, and style constraints live in packs or providers.
6. **Generated primary names**: style packs provide generation ingredients and spelling alternates; they do not provide whole names for the primary output path.
7. **Mode-aware presentation, shared engine primitives**: fiction cast controls may shape the UI, but role, rarity, scoring, identity, and export should remain reusable product primitives.

## Runtime pipeline

```text
Input Settings
  -> Resolve Style Pack
  -> Resolve role and rarity settings
  -> Construct Silhouettes
  -> Generate Candidate Pool
  -> Score Candidates
  -> Apply Ensemble Constraints
  -> Attach identity and role metadata
  -> Generate Variants
  -> Attach Provenance
  -> Return Ranked Results
```

Each step should remain testable as a TypeScript module. UI code should render controls and results, not own generation behavior.

## Module boundaries

```text
src/
  App.tsx                 UI shell and interaction state
  main.tsx                Vite/React entrypoint
  styles.css              Presentation only
  data/
    stylePacks.ts         Built-in soft-coded style packs
  engine/
    ensemble.ts           Cast-level selection, diversity penalties, and role attachment
    export.ts             JSON and Markdown cast serialization
    identity.ts           Given/surname/title/epithet identity composition
    generator.ts          Candidate materialization from silhouettes and style packs
    random.ts             Deterministic seeded randomness
    rarity.ts             Rarity distribution preset planning
    registry.ts           Provider/source descriptor lookup and style-pack registry
    roles.ts              Cast role labels, presets, parsing, and slot resolution
    scoring.ts            Candidate score and explanation signals
    silhouettes.ts        NameSilhouette construction and rarity/shape planning
    types.ts              Core domain types and contracts
    variants.ts           Spelling variant generation and provenance
  ui/
    AboutView.tsx         Product explanation copy
    ChangelogView.tsx     In-app changelog rendering
    GeneratorView.tsx     Generation controls, result grid, and export surface
    NameCard.tsx          Card density and expandable result details
    ScoreControl.tsx      Numeric and slider score control rendering
    presentation.ts       UI labels, score labels, rarity labels, and changelog entries
    score.ts              UI score formatting and visual class helpers
```

## Core domain model

The engine centers on these first-class types:

- `GenerationSettings`: adjustable axes such as cast size, seed, style pack, name format, role preset, rarity distribution, novelty, pronounceability, memorability, cultural anchoring, and orthographic weirdness.
- `NameSilhouette`: the pre-spelling shape of one full name.
- `GeneratedName`: rendered text plus identity parts, optional role metadata, score metadata, variants, provenance, warnings, and seed.
- `CandidateScore`: decomposed scoring signals, not just one opaque score.
- `CastRoleAssignment`: fiction-cast role metadata resolved from a preset or slot override.
- `NameVariant`: listed or generated spelling alternatives with relationship metadata.
- `ProvenanceEntry`: source and contribution metadata.
- `StylePack`: soft-coded aesthetic and phonotactic constraints.
- `DataSourceDescriptor`: registry pointer to built-in, file, HTTP, API, package, or custom pack sources.

## Style packs and provider registry

Style packs define the statistical neighborhood for generation. They guide candidate creation and distance calculations; they should not be copied blindly into output.

The provider registry stores pointers and contracts, not large data payloads. Built-in providers are enough for MVP, but the registry shape should support future file packs, remote packs, pronunciation dictionaries, frequency data, script inventories, and audio backends.

### Hard-coded engine responsibilities

- schemas and TypeScript interfaces
- registry and loader interfaces
- deterministic RNG
- candidate generation algorithms
- scoring algorithms
- ensemble balancing algorithms
- role and rarity preset resolution
- normalization pipeline
- fallback inventories and minimal fixtures
- provenance structure

### Soft-coded data responsibilities

- style packs
- pronunciation dictionaries
- spelling variant rules
- cultural naming packs
- frequency data
- phoneme and grapheme inventories
- remote APIs and user-uploaded packs

## Scoring model

Candidate scoring should expose a decomposed score object with signals for pronounceability, memorability, novelty, cultural anchoring, orthographic naturalness, style fit, silhouette fit, and ensemble fit.

The UI may show compact traits by default and reserve diagnostic scores for detailed inspection, but the engine should retain structured reasons so exports, debugging, and explanations can use the same metadata.

## Ensemble balancing

Ensemble generation should produce more candidates than needed, then choose a cast that avoids obvious repetition. The balancing layer should penalize repeated initials, repeated endings, duplicate cadence, too many names in the same rarity band, and excessive orthographic weirdness across the cast.

This layer now supports role metadata and explicit rarity distribution controls, while keeping future role-specific phonotactic and scoring influence as a separate opt-in feature.

## Spelling variants

Variants must be labeled by relationship type. MVP listed variants should be clearly marked as listed alternates, and rule-created variants should be clearly marked as generated spellings. Future external-source variants can use the same contract with stronger confidence and source provenance.

Supported relationship types include `same_pronunciation`, `near_pronunciation`, `orthographic_variant`, `regional_variant`, `historical_variant`, `transliteration`, `cognate`, `diminutive`, `nickname`, `creative_respelling`, and `alias`.

## Provenance

Every output should answer:

- Which generator produced this?
- Which style pack and rules contributed?
- Which role or rarity controls shaped the cast slot, if any?
- Was an alternate spelling listed or generated?
- What seed reproduced it?
- Which scoring reasons explain its rank?

The provenance contract is product-critical because it keeps generated primary names, listed alternates, and future externally sourced results distinct.

## UI contract

The MVP UI should expose one single-page fiction-cast generation flow with progressive sections for Basics, Fiction, and Rarity & scoring.

The core controls are cast size, seed, style preset, name format, cast role mix, slot role overrides, rarity distribution, novelty, pronounceability, memorability, cultural anchoring, and orthographic weirdness.

Each output card should display the generated name, role or format traits, syllable count, rarity band, and expandable details. Card density controls how much is shown in the summary: Basic for scanning, Brief for everyday browsing, and Detail for diagnostic scores.

The export surface should stay late in the flow and support JSON and Markdown without making raw export text dominate the generated cast.

## Testing strategy

Unit tests should prioritize deterministic engine contracts:

- same seed and controls produce the same output
- different seeds produce different candidates
- generator respects basic silhouette constraints
- ensemble balancing reduces repeated initials/endings where possible
- scoring returns stable decomposed metadata
- role presets and slot overrides resolve deterministically
- rarity distribution presets resolve deterministically
- variants are generated and labeled correctly
- registry resolves built-in style packs and source descriptors

UI smoke tests should verify shell-level contracts such as visible controls, grouped sections, card density labels, compact export affordances, and the absence of obsolete public copy.

## MVP readiness checklist

The MVP is architecturally representative when Vite + TypeScript + React runs locally, generation logic is separate from UI code, casts are generated deterministically, silhouettes are first-class objects, generated names include score/provenance metadata, role and rarity controls are represented as settings, at least one style pack exists, variants are labeled, exports are available, and the provider registry abstraction exists even when only built-in providers are active.
