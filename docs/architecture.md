# Name Forge Architecture

Name Forge separates hard-coded generation mechanisms from soft-coded naming knowledge. The product target is a fictional naming engine, not a random string generator: randomness creates candidates, while silhouettes, scoring, provenance, and ensemble constraints decide what is usable.

See [`product-requirements.md`](product-requirements.md) for the full product specification.

## Architectural principles

1. **Controlled stochasticity**: generation is seeded and random, then judged by explicit product criteria.
2. **Ensemble-first output**: the product output is a cast, not only an isolated name.
3. **Silhouette before spelling**: the system models the intended name shape before exact letters are generated.
4. **Provenance-bearing data**: generated names and variants report style pack, source, rules, seed, and scoring signals.
5. **Hard-code mechanisms, not linguistic knowledge**: algorithms and schemas live in the engine; inventories, anchors, phonotactics, variants, and style constraints live in packs or providers.

## Runtime pipeline

```text
Input Settings
  -> Resolve Style Pack
  -> Construct Silhouettes
  -> Generate Candidate Pool
  -> Score Candidates
  -> Apply Ensemble Constraints
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
    ensemble.ts           Cast-level selection and diversity penalties
    generator.ts          Candidate materialization from silhouettes and style packs
    random.ts             Deterministic seeded randomness
    registry.ts           Provider/source descriptor lookup and style-pack registry
    scoring.ts            Candidate score and explanation signals
    silhouettes.ts        NameSilhouette construction and rarity/shape planning
    types.ts              Core domain types and contracts
    variants.ts           Spelling variant generation and provenance
```

## Core domain model

The engine centers on these first-class types:

- `NameGenerationControls`: adjustable axes such as novelty, pronounceability, memorability, cultural anchoring, and orthographic weirdness.
- `NameSilhouette`: the pre-spelling shape of one full name.
- `GeneratedName`: rendered text plus parts, score metadata, variants, provenance, warnings, and seed.
- `CandidateScore`: decomposed scoring signals, not just one opaque score.
- `NameVariant`: generated or curated spelling alternatives with relationship types.
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
- normalization pipeline
- fallback inventories and minimal fixtures
- provenance structure

### Soft-coded data responsibilities

- style packs
- name corpora
- pronunciation dictionaries
- spelling variant rules
- cultural naming packs
- frequency data
- phoneme and grapheme inventories
- remote APIs and user-uploaded packs

## Scoring model

Candidate scoring should expose a decomposed score object with signals for pronounceability, memorability, novelty, cultural anchoring, orthographic naturalness, style fit, silhouette fit, and ensemble fit.

The UI may show a compact score, but the engine should retain structured reasons so exports, debugging, and explanations can use the same metadata.

## Ensemble balancing

Ensemble generation should produce more candidates than needed, then choose a cast that avoids obvious repetition. The balancing layer should penalize repeated initials, repeated endings, duplicate cadence, too many names in the same rarity band, and excessive orthographic weirdness across the cast.

This layer should stay independent enough to evolve into role-aware and faction-aware generation later.

## Spelling variants

Variants must be labeled by relationship type. MVP generated variants should be clearly marked as generated, not curated. Future curated or external-source variants can use the same contract with stronger confidence and source provenance.

Supported relationship types include `same_pronunciation`, `near_pronunciation`, `orthographic_variant`, `regional_variant`, `historical_variant`, `transliteration`, `cognate`, `diminutive`, `nickname`, `creative_respelling`, and `alias`.

## Provenance

Every output should answer:

- Which source or generator produced this?
- Which style pack and rules contributed?
- Was it found, curated, or invented?
- What seed reproduced it?
- Which scoring reasons explain its rank?

The provenance contract is product-critical because it keeps generated, curated, and future externally sourced results distinct.

## UI contract

The MVP UI should expose one single-page generation flow with controls for cast size, seed, style preset, novelty, pronounceability, memorability, cultural anchoring, and orthographic weirdness.

Each output card should display the generated name, score, silhouette summary, rarity band, variants, provenance labels, and concise explanation metadata.

## Testing strategy

Unit tests should prioritize deterministic engine contracts:

- same seed and controls produce the same output
- different seeds produce different candidates
- generator respects basic silhouette constraints
- ensemble balancing reduces repeated initials/endings where possible
- scoring returns stable decomposed metadata
- variants are generated and labeled correctly
- registry resolves built-in style packs and source descriptors

## MVP readiness checklist

The MVP is architecturally representative when Vite + TypeScript + React runs locally, generation logic is separate from UI code, casts are generated deterministically, silhouettes are first-class objects, generated names include score/provenance metadata, at least one style pack exists, variants are labeled, and the provider registry abstraction exists even when only built-in providers are active.
