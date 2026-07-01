# Model and Module Contracts

This document describes the current Name Forge models and modules as contracts. It is meant to answer three practical questions:

1. What models do we have?
2. Which module owns each behavior?
3. What does each module take as input and return as output?

It also calls out collection-order semantics explicitly, because `T[]` is always ordered in JavaScript/TypeScript even when the product does not intend that order to mean ranking.

## Reading rule

A module contract should be read as:

```text
input model(s) -> module behavior -> output model(s)
```

When a module returns an array, the array order must mean one of these things:

| Order kind | Meaning |
| --- | --- |
| `source-order` | Same order as an input source or user-facing list. |
| `generation-order` | Deterministic traversal order from the generator, not quality ranking. |
| `rank-order` | Best-to-worst or most-preferred-to-least-preferred order. |
| `display-order` | Chosen for UI readability, not necessarily model priority. |
| `unordered-set-encoded-as-array` | A set encoded as an array only because TypeScript has no built-in readonly set literal contract. Avoid this when order confusion matters. |

If ranking matters, prefer an explicit `rank` field or a collection wrapper that says the array is ranked.

## Current model inventory

### User/config models

| Model | Current owner | Plain meaning |
| --- | --- | --- |
| `GenerationSettings` | `types.ts` / app state | User-facing controls for one generation run. |
| `StyleInput` | `styleCompiler.ts` | Ergonomic style intent before compilation. |
| `StylePack` | `types.ts` / `data/stylePacks.ts` | Built-in style data and source metadata. |
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
| `RankedSpellingCandidate` | `spellingGenerator.ts` | A spelling candidate after scoring/ranking. |

### App-facing name models

| Model | Current owner | Plain meaning |
| --- | --- | --- |
| `GeneratedNameCandidate` | `generator.ts` | Pre-selection candidate with sound and ranked spelling pool. |
| `GeneratedName` | `types.ts` / `generator.ts` | Selected app-facing name with sound, selected spelling, scores, variants, and identity. |
| `NameIdentity` | `identity.ts` / `types.ts` | Display composition from generated/profile-licensed parts. |
| `GeneratedEnsemble` | `ensemble.ts` / `types.ts` | Cast-level result set and diagnostics. |

### Audition/projection models

| Model | Current owner | Plain meaning |
| --- | --- | --- |
| `AuditionPhonology` | `auditionPhonology.ts` | Renderer-neutral sound presentation structure derived from a segment sequence. |
| `BrowserAuditionCue` | `browserAuditionProjection.ts` | Browser/display projection for sound guide and voice draft. |
| `NameAuditionCue` | `audition.ts` | Current UI composition of audition phonology and browser cue. |

## Module contract map

### `styleCompiler.ts`

```text
StyleInput -> compileStyle -> SoundProfile
```

Owns:

- translating ergonomic user intent into engine-readable sound settings
- producing a serializable sound recipe

Does not own:

- generated names
- browser voice text
- spelling ranking

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

Primary output:

```ts
SoundCandidate
```

Collection semantics:

- `SegmentSequence.segments` is `source-order`: exact sound order.
- `SegmentSequence.syllables` is `source-order`: exact syllable order.

### `spellingGenerator.ts`

Current module contains two separable behaviors:

```text
SoundCandidate -> generateSpellings -> SpellingCandidate[]
SpellingCandidate[] + SoundProfile -> rankSpellings -> RankedSpellingCandidate[]
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

| Function | Output | Current order meaning |
| --- | --- | --- |
| `generateSpellings(sound)` | `readonly SpellingCandidate[]` | `generation-order`: deterministic traversal/deduplication order, not quality ranking. |
| `rankSpellings(spellings, profile)` | `readonly RankedSpellingCandidate[]` | `rank-order`: sorted by score descending, then text ascending; each item also has `rank`. |
| `generateRankedSpellings(sound, profile)` | `readonly RankedSpellingCandidate[]` | `rank-order`. |

Design note:

`SpellingCandidate[]` is not literally unordered; arrays are ordered. The potential incoherence is that a deterministic ordered array can be mistaken for ranked order. The model is safer once the collection semantics are encoded in a named wrapper.

Possible future wrappers:

```ts
interface SpellingCandidatePool {
  readonly contract: 'SpellingCandidatePool';
  readonly order: 'generation-order';
  readonly soundCandidateId: string;
  readonly candidates: readonly SpellingCandidate[];
}

interface RankedSpellingCandidateList {
  readonly contract: 'RankedSpellingCandidateList';
  readonly order: 'rank-order';
  readonly ranking: 'score-desc-text-asc';
  readonly candidates: readonly RankedSpellingCandidate[];
}
```

This would let callers depend on a collection contract instead of interpreting a raw array.

### `generator.ts`

```text
GenerationSettings + NameSourceProvider -> GeneratedName[] / GeneratedNameCandidate[]
```

Owns:

- materializing name candidates from settings, profiles, sound, spellings, scoring, diagnostics, and variants
- selecting a ranked spelling as the display name
- producing app-facing generated-name models

Does not own:

- low-level sound segment selection
- low-level spelling rules
- browser voice projection

Important model boundary:

`GeneratedName.spellingCandidates` is currently `readonly RankedSpellingCandidate[]`. That means the retained spelling alternatives are ranked alternatives, not raw unranked spelling candidates.

### `identity.ts`

```text
GeneratedName + optional supporting GeneratedName + NameFormatKind -> NameIdentity
```

Owns:

- arranging already licensed parts into display identity forms
- choosing title/epithet lexemes from the compiled profile lexicon
- using generated supporting names for family/place components

Does not own:

- inventing arbitrary suffixes or epithets by string surgery
- phrase-level audio/prosody
- browser projection

Current output:

```ts
NameIdentity
```

Known limitation:

`NameIdentity.parts` preserves text and source-name references, but it does not yet preserve the source sound sequence per part. Phrase-level audition should address that.

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

Current output:

```ts
AuditionPhonology
```

Collection semantics:

- `AuditionPhonology.syllables` is `source-order`: exact syllable order from the source segment sequence.

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

- `syllableText` is `source-order`: browser speech text per syllable.
- `guideSyllables` is `source-order`: human guide text per syllable.

### `audition.ts`

```text
SegmentSequence -> NameAuditionCue
```

Owns:

- current UI convenience composition
- re-exporting audition and projection functions/types

Does not own:

- renderer logic
- core phonology
- browser APIs

This file should remain boring.

### `ensemble.ts`

```text
GenerationSettings + registry -> GeneratedEnsemble
```

Owns:

- selecting a cast-level set
- applying diversity penalties
- preserving locked slots
- attaching ensemble diagnostics

Does not own:

- low-level sound generation
- browser projection
- profile compilation internals

Collection semantics:

- `GeneratedEnsemble.names` is `display-order`: the order presented in the cast. It may encode slot order and ensemble selection, not simply raw score order.

### `NameInspector.tsx`

```text
GeneratedName + UI callbacks -> React UI
```

Owns:

- selected-name presentation
- user-facing labels
- buttons and disabled states
- rendering guide/playback facts from audition output

Does not own:

- generation behavior
- ranking behavior
- sound validity

## Data-model concern: raw arrays leaking semantics

The current model is not incoherent, but it is under-specified in one important way: several APIs expose raw arrays whose order has different meanings.

The most important case is spelling:

```text
SpellingCandidate[]          generation-order
RankedSpellingCandidate[]    rank-order
```

Both are arrays, but the order means different things. This is easy for humans and LLMs to misread.

### Current safety factors

The current code has two mitigating facts:

1. `RankedSpellingCandidate` includes explicit `rank` and `score`.
2. `GeneratedName.spellingCandidates` already exposes ranked candidates, not raw unranked `SpellingCandidate[]`.

So the app-facing model is less confused than the low-level projection function.

### Remaining smell

The raw return type of `generateSpellings(sound)` is still easy to misuse. A caller can accidentally treat the first spelling as preferred even though it only reflects generation traversal/deduplication order.

### Recommended later refactor

When spelling code is next touched for model cleanup, consider splitting the concepts:

```text
spellingProjection.ts
  SoundCandidate -> SpellingCandidatePool

spellingRanking.ts
  SpellingCandidatePool + SoundProfile -> RankedSpellingCandidateList
```

This does not need to happen in the current UX/projection PR. It is a data-model cleanup candidate.

## Desired module rule

Prefer this:

```text
module returns named model or named collection contract
```

over this:

```text
module returns raw array and expects callers to remember what order means
```

Raw arrays are still fine inside modules and for tiny internal helpers. They become risky at module boundaries.

## Near-term cleanup candidates

1. Rename or wrap spelling collections so generation order and ranking order are explicit.
2. Add explicit syllable metadata with `unspecified` values instead of optional pseudo-science fields.
3. Add phrase-level audition models that preserve per-part provenance.
4. Gradually turn `architecture.md` into an index and keep detailed contracts in focused docs like this one.
