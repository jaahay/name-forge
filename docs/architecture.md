# Name Forge architecture

Name Forge separates hard-coded generation mechanisms from soft-coded naming knowledge.

## Runtime model

The MVP has four layers:

1. **Source registry** (`src/engine/registry.ts`) exposes typed providers and style packs. The built-in provider is local, but the interface is intentionally compatible with future remote JSON-style packs.
2. **Silhouette generation** (`src/engine/silhouettes.ts`) creates a first-class `NameSilhouette` before exact letters exist. It models syllable count, stress, rhythm, rarity, texture, target novelty, and length.
3. **Name generation and scoring** (`src/engine/generator.ts`, `src/engine/scoring.ts`) materialize names from style-pack phonotactics and score pronounceability, memorability, novelty, cultural anchoring, and orthographic naturalness.
4. **Ensemble balancing** (`src/engine/ensemble.ts`) chooses a cast from multiple candidates per slot and penalizes repeated initials, repeated endings, duplicate names, and over-similar novelty.

## Soft-coded knowledge

The starter `british-literary-fantasy` pack is a small local TypeScript object in `src/data/stylePacks.ts`. It acts like a JSON pack and should remain data-shaped:

- weighted onsets, nuclei, codas, and preferred endings
- rare graphemes and forbidden fragments
- silhouette biases
- curated seed names and curated spelling variants
- generated spelling-variant rules
- provenance metadata

The core engine does not encode British literary fantasy as a permanent domain assumption. It only knows how to consume source packs.

## Provenance

Every generated name includes provenance notes from:

- the selected style pack
- the silhouette engine
- the phonotactic generator or curated seed list
- the scoring engine

Every spelling variant also carries its own provenance and is marked as either `curated` or `generated`.

## Future seams

The current abstractions are intended to support:

- remote style-pack loading and validation
- pronunciation and audio artifact providers
- multilingual source providers
- bias and cultural anchoring warnings
- richer ensemble roles, such as protagonist, antagonist, supporting cast, and place-linked names
