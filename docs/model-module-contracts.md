# Model and Module Contracts

This document describes the current Name Forge models and modules as contracts. It answers three practical questions:

1. What models do we have?
2. Which module owns each behavior?
3. What does each module take as input and return as output?

It also calls out collection semantics explicitly, because `T[]` is always ordered in JavaScript/TypeScript. The important design question is what the order means at a module boundary.

Related decisions:

- [`decisions/0001-name-artifact-and-request-contract.md`](decisions/0001-name-artifact-and-request-contract.md)
- [`decisions/0002-criteria-driven-generation.md`](decisions/0002-criteria-driven-generation.md)
- [`decisions/0003-intent-criteria-compiler-pipeline.md`](decisions/0003-intent-criteria-compiler-pipeline.md)
- [`decisions/0004-modes-presets-and-grouping.md`](decisions/0004-modes-presets-and-grouping.md)

## Reading rule

A module contract should be read as:

```text
input model(s) -> module behavior -> output model(s)
```

When a module exposes a collection, the collection order must mean one of these things:

| Order kind | Meaning |
| --- | --- |
| `source-order` | Same order as an input source or user-facing list. |
| `generation-order` | Deterministic traversal order from the generator, not quality ranking. |
| `rank-order` | Best-to-worst or most-preferred-to-least-preferred order. |
| `display-order` | Chosen for UI readability, not necessarily model priority. |

If ranking matters, prefer a named model or explicit `rank` field over expecting callers to remember what a raw array means.

## Planned request/criteria contracts

These are planning contracts for the next architecture slice. They are not yet the current implemented API.

### `NameRequest`

`NameRequest` is the planned durable naming operation input.

```ts
type NameRequest = {
  readonly version: 1;
  readonly mode?: string;
  readonly criteria: NameCriteria;
  readonly quantity?: NameQuantity;
  readonly grouping?: NameGrouping;
  readonly random?: RandomizationRequest;
};
```

Plain meaning:

- `criteria` declares what the generated name should satisfy.
- `mode` is optional UI/product metadata and should not drive v1 generation.
- `random.seed` is optional; the response must emit the resolved seed.
- `quantity` and `grouping` are future extension points. V1 may resolve them to one name and no grouping.

### `NameResponse`

`NameResponse` is the planned durable naming operation output.

```ts
type NameResponse = {
  readonly version: 1;
  readonly request: ResolvedNameRequest;
  readonly names: readonly NameArtifact[];
  readonly group?: NameGroupArtifact;
  readonly random: RandomizationResult;
  readonly diagnostics?: readonly NameDiagnostic[];
};
```

Plain meaning:

- `names` is always an array, even when v1 returns exactly one artifact.
- `group` appears only when future grouping creates a meaningful group artifact.
- `random.seed` is always present.
- `diagnostics` are honest notes about fallback, unsupported criteria, or partial implementation; they are not the normal product failure mode.

### `NameArtifact`

`NameArtifact` is the primary product artifact.

A future `NameArtifact` should preserve the richness currently carried by `GeneratedName`: display text, sound plan, selected spelling, ranked spelling alternatives, identity data where applicable, diagnostics, and exportable metadata.

`GeneratedName` is the current implemented app-facing model. `NameArtifact` is the planned contract noun for future request/response work.

### `NameCriteria`

`NameCriteria` is the durable intermediate model between intent surfaces and engine behavior.

```ts
type NameCriteria = {
  readonly clauses: readonly NameCriteriaClause[];
};

type NameCriteriaClause = {
  readonly id: string;
  readonly family:
    | "sound"
    | "shape"
    | "register"
    | "spelling"
    | "semantic"
    | "avoid"
    | "practical";
  readonly polarity: "prefer" | "avoid" | "require";
  readonly target: string;
  readonly strength: number;
};
```

Criteria are produced by user-facing controls, presets, selected chips, structured drawers, saved preferences, or future assistive parsing. Criteria compile into lower-level generation and selection concerns. They should not be treated as free-form prose.

### `NameQuantity` and `NameGrouping`

`NameQuantity` and `NameGrouping` are future multiplicity extensions to the same `NameRequest` operation.

```ts
type NameQuantity = {
  readonly count: number;
};

type NameGrouping =
  | { readonly kind: "none" }
  | { readonly kind: "independent" }
  | { readonly kind: "set"; readonly criteria?: NameSetCriteria }
  | {
      readonly kind: "slotted-set";
      readonly criteria?: NameSetCriteria;
      readonly slots: readonly NameSlotRequest[];
    };
```

Meanings:

- `none`: one generated name.
- `independent`: multiple names without a relationship requirement.
- `set`: multiple names selected to work together.
- `slotted-set`: a set where each slot may add local criteria.

This is the planned abstraction for Cast and Ensemble behavior. Cast remains a mode/product surface; grouping is the backend-relevant invariant.

### `RandomizationRequest` and `RandomizationResult`

Randomness is intentional but reproducible.

```ts
type RandomizationRequest = {
  readonly seed?: string;
};

type RandomizationResult = {
  readonly seed: string;
  readonly algorithm: "name-forge-v1";
};
```

If the request omits a seed, the engine resolves a fresh one and emits it. The same request, same resolved seed, and same algorithm version should reproduce the same name artifact.

## Current model inventory

### User/config models

| Model | Current owner | Plain meaning |
| --- | --- | --- |
| `GenerationSettings` | `types.ts` / app state | Current user-facing controls for one Fiction cast generation run. |
| `StyleInput` | `styleCompiler.ts` | Current ergonomic style bridge before compilation. |
| `StylePack` | `types.ts` / `data/stylePacks.ts` | Built-in style data and source metadata; future preset-like data should not be required by the backend request. |
| `SoundProfile` | `soundProfile.ts` | Compiled internal sound recipe. |

### Sound models

| Model | Current owner | Plain meaning |
| --- | --- | --- |
| `SoundSegmentId` | `starterSoundInventory.ts` | Stable id for one engine-known sound segment. |
| `SegmentSyllable` | `soundGenerator.ts` | Syllable span and onset/nucleus/coda indexes over a flat segment list. |
| `SegmentSequence` | `soundGenerator.ts` | One pre-spelling sound plan. |
| `SoundCandidate` | `soundGenerator.ts` | Generated sound plan plus cadence and transcription/debug display. |

### Spelling models

| Model | Current owner | Plain meaning |
| --- | --- | --- |
| `SpellingSegmentMapping` | `spellingGenerator.ts` | Link from one segment to its generated letters. |
| `SpellingCandidate` | `spellingGenerator.ts` | One possible written form for a sound candidate. |
| `SpellingCandidatePool` | `spellingGenerator.ts` | Projection result containing every generated spelling candidate for one sound candidate. |
| `RankedSpellingCandidate` | `spellingGenerator.ts` | A spelling candidate after scoring/ranking. |
| `RankedSpellingCandidateList` | `spellingGenerator.ts` | Ranked spelling alternatives for one sound candidate. |

### App-facing name models

| Model | Current owner | Plain meaning |
| --- | --- | --- |
| `NameGenerationCandidate` | `generator.ts` | Pre-selection candidate with sound and ranked spelling list. |
| `GeneratedName` | `types.ts` / `generator.ts` | Current selected app-facing name with sound, selected spelling, scores, variants, and identity. |
| `NameIdentity` | `identity.ts` / `types.ts` | Display composition plus materialized phrase parts from generated/profile-licensed parts. |
| `GeneratedEnsemble` | `ensemble.ts` / `types.ts` | Current Cast-level result set and diagnostics. |

### Audition/projection models

| Model | Current owner | Plain meaning |
| --- | --- | --- |
| `AuditionPhonology` | `auditionPhonology.ts` | Renderer-neutral sound presentation structure derived from a segment sequence. |
| `BrowserAuditionCue` | `browserAuditionProjection.ts` | Browser/display projection for sound guide and voice draft. |
| `NameAuditionCue` | `audition.ts` | Current UI composition of audition phonology and browser cue. |
| `IdentityAuditionPhrase` | `identityAudition.ts` | Renderer-neutral phrase-level audition projection from materialized identity phrase parts. |

## Future module seams

These seams should be introduced when implementation starts, not merely because the planning types exist.

### Criteria resolver / compiler

```text
NameCriteria -> compiled criteria -> SoundProfile / spelling preferences / exclusions / selection inputs
```

Owns:

- resolving criteria clauses into lower-level generation concerns
- producing deterministic compiler output
- diagnosing accepted-but-unimplemented criteria

Does not own:

- UI chips or drawer behavior
- random candidate generation
- public criteria-match explanation

### Name request service

```text
NameRequest -> NameResponse
```

Owns:

- resolving missing seed
- preserving or echoing optional mode metadata
- invoking criteria compilation
- invoking candidate generation and selection
- returning one or more `NameArtifact`s

V1 may only support one returned name. Quantity and grouping can be accepted in planning docs without being implemented until the engine earns them.

### Candidate scoring

```text
candidate + compiled criteria -> candidate score
```

Owns:

- functional selection scoring
- decomposed score components when useful for debugging or future Inspect surfaces

Does not own:

- public fit percentages
- polished Criteria Match UI
- treating taste criteria as hard failure by default

## Module contract map

### `styleCompiler.ts`

```text
StyleInput -> compileStyle -> SoundProfile
```

Owns:

- current translation from ergonomic user intent into engine-readable sound settings
- producing a serializable sound recipe

Does not own:

- all future intent surfaces
- generated names
- browser voice text
- spelling ranking

Design note:

`StyleInput` is now best understood as the current implementation bridge. Future criteria work should not expand `StyleInput` into a universal user-intent model; richer surfaces should produce `NameCriteria`.

### `soundProfile.ts`

```text
compiled profile data -> SoundProfile helpers/types
```

Owns:

- the internal sound recipe contract
- phonotactic preference fields
- cadence and texture targets
- profile-licensed title/epithet lexemes

Does not own:

- random generation behavior
- generated segment sequences
- UI copy

### `soundGenerator.ts`

```text
SoundProfile + SeededRandom -> SoundCandidate
```

Internally:

```text
SoundProfile + SeededRandom
  -> syllable count
  -> cadence
  -> syllable shapes
  -> SegmentSequence
  -> SoundCandidate
```

Owns:

- choosing sound segments
- creating syllable spans
- assigning onset/nucleus/coda indexes
- producing `SegmentSequence`
- producing `SoundCandidate`

Does not own:

- written spelling
- spelling quality ranking
- browser speech text
- identity phrases

Collection semantics:

- `SegmentSequence.segments` is source-order: exact sound order.
- `SegmentSequence.syllables` is source-order: exact syllable order.

### `spellingGenerator.ts`

Current module contains two separable public behaviors:

```text
SoundCandidate -> generateSpellingCandidatePool -> SpellingCandidatePool
SpellingCandidatePool + SoundProfile -> rankSpellingCandidatePool -> RankedSpellingCandidateList
SoundCandidate + SoundProfile -> generateRankedSpellingCandidates -> RankedSpellingCandidateList
```

Owns:

- projecting sound segments into written letters
- preserving segment-to-letter mappings
- scoring spellings against profile preferences
- adding explicit rank after scoring

Does not own:

- sound validity
- syllable generation
- identity composition
- browser voice text

Collection semantics:

| Function | Output | Collection meaning |
| --- | --- | --- |
| `generateSpellingCandidatePool(sound)` | `SpellingCandidatePool` | `.candidates` is deterministic generation order, not quality ranking. |
| `rankSpellingCandidatePool(pool, profile)` | `RankedSpellingCandidateList` | `.candidates` is rank order; each item also has `rank` and `score`. |
| `generateRankedSpellingCandidates(sound, profile)` | `RankedSpellingCandidateList` | `.candidates` is rank order. |

Design note:

The collection wrappers deliberately do not carry ceremonial runtime fields like `contract` or `order`. Their names and TypeScript contracts are enough for this internal boundary. If the collection ever becomes serialized data crossing a storage, API, or plugin boundary, explicit runtime metadata may become worthwhile. It is not needed now.

### `generator.ts`

```text
GenerationSettings + NameSourceProvider -> GeneratedName[] / NameGenerationCandidate[]
```

Owns:

- materializing current name candidates from settings, profiles, sound, spellings, scoring, diagnostics, and variants
- selecting a ranked spelling as the display name
- producing current app-facing generated-name models

Does not own:

- low-level sound segment selection
- low-level spelling rules
- browser voice projection

Important model boundary:

`NameGenerationCandidate.rankedSpellings` is a `RankedSpellingCandidateList`. `GeneratedName.spellingCandidates` remains the app-facing ranked candidate array for UI/export convenience; it does not expose raw unranked spelling projections.

Future `NameArtifact` work should preserve the selected-name richness currently attached to `GeneratedName` while making the request boundary criteria-driven instead of Cast/settings-driven.

### `identity.ts`

```text
GeneratedName + optional supporting GeneratedName + NameFormatKind -> NameIdentity
```

Owns:

- arranging already licensed parts into display identity forms
- choosing title/epithet lexemes from the compiled profile lexicon
- using generated supporting names for family/place components
- materializing phrase structure as `NameIdentity.phraseParts`

Does not own:

- inventing arbitrary suffixes or epithets by string surgery
- phrase-level audio/prosody
- browser projection

Important model boundary:

`NameIdentity.parts` preserves text and source-name references. `NameIdentity.phraseParts` is the only structural phrase representation; it preserves final phrase order with explicit part references and literals.

### `auditionPhonology.ts`

```text
SegmentSequence -> AuditionPhonology
```

Owns:

- renderer-neutral sound presentation structure
- segment slices per syllable
- onset/nucleus/coda segment ids
- current fallback stress hints

Does not own:

- phonotactic validity
- spelling rules
- browser-specific token hacks
- identity phrase composition

Collection semantics:

- `AuditionPhonology.syllables` is source-order: exact syllable order from the source segment sequence.

### `browserAuditionProjection.ts`

```text
AuditionPhonology -> BrowserAuditionCue
```

Owns:

- browser-speech-friendly `speechText`
- human-readable guide syllables
- display guide text
- browser/display compromises

Does not own:

- generated sound truth
- stress truth
- phonotactic validity
- canonical pronunciation

Collection semantics:

- `syllableText` is source-order: browser speech text per syllable.
- `guideSyllables` is source-order: human guide text per syllable.

### `audition.ts`

```text
SegmentSequence -> NameAuditionCue
NameIdentity + source generated names -> IdentityAuditionPhrase
```

Owns:

- current UI convenience composition
- re-exporting audition and projection functions/types

Does not own:

- renderer logic
- core phonology
- browser APIs
- identity phrase materialization

This file should remain boring.

### `identityAudition.ts`

```text
NameIdentity + source generated names -> IdentityAuditionPhrase
```

Owns:

- projecting materialized identity phrase parts into sound, text, or literal audition parts
- preserving per-part speech/display provenance
- reusing generated source-name sound for sound-backed identity parts

Does not own:

- identity phrase materialization
- format-template parsing
- automatic pronunciation for arbitrary lexical text
