# Model and Module Contracts

This document describes the current Name Forge models and modules as contracts. It answers three practical questions:

1. What models do we have?
2. Which module owns each behavior?
3. What does each module take as input and return as output?

It also calls out collection semantics explicitly, because `T[]` is always ordered in JavaScript/TypeScript. The important design question is what the order means at a module boundary.

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
| `SpellingCandidatePool` | `spellingGenerator.ts` | Projection result containing every generated spelling candidate for one sound candidate. |
| `RankedSpellingCandidate` | `spellingGenerator.ts` | A spelling candidate after scoring/ranking. |
| `RankedSpellingCandidateList` | `spellingGenerator.ts` | Ranked spelling alternatives for one sound candidate. |

### App-facing name models

| Model | Current owner | Plain meaning |
| --- | --- | --- |
| `NameGenerationCandidate` | `generator.ts` | Pre-selection candidate with sound and ranked spelling list. |
| `GeneratedName` | `types.ts` / `generator.ts` | Selected app-facing name with sound, selected spelling, scores, variants, and identity. |
| `NameIdentity` | `identity.ts` / `types.ts` | Display composition plus materialized phrase parts from generated/profile-licensed parts. |
| `GeneratedEnsemble` | `ensemble.ts` / `types.ts` | Cast-level result set and diagnostics. |

### Audition/projection models

| Model | Current owner | Plain meaning |
| --- | --- | --- |
| `AuditionPhonology` | `auditionPhonology.ts` | Renderer-neutral sound presentation structure derived from a segment sequence. |
| `BrowserAuditionCue` | `browserAuditionProjection.ts` | Browser/display projection for sound guide and voice draft. |
| `NameAuditionCue` | `audition.ts` | Current UI composition of audition phonology and browser cue. |
| `IdentityAuditionPhrase` | `identityAudition.ts` | Renderer-neutral phrase-level audition projection from materialized identity phrase parts. |

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

- materializing name candidates from settings, profiles, sound, spellings, scoring, diagnostics, and variants
- selecting a ranked spelling as the display name
- producing app-facing generated-name models

Does not own:

- low-level sound segment selection
- low-level spelling rules
- browser voice projection

Important model boundary:

`NameGenerationCandidate.rankedSpellings` is a `RankedSpellingCandidateList`. `GeneratedName.spellingCandidates` remains the app-facing ranked candidate array for UI/export convenience; it does not expose raw unranked spelling projections.

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
- provider-specific speech payloads

Collection semantics:

- `IdentityAuditionPhrase.parts` is source-order: exact order from `NameIdentity.phraseParts` after dropping unresolved stale references.

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

- `GeneratedEnsemble.names` is display-order: the order presented in the cast. It may encode slot order and ensemble selection, not simply raw score order.

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

## Data-model concern resolved for spelling

The previous low-level spelling API exposed two raw arrays with different order semantics:

```text
SpellingCandidate[]          generation-order
RankedSpellingCandidate[]    rank-order
```

That was not catastrophic, but it was easy for humans and LLMs to misread. The current boundary is explicit:

```text
SpellingCandidatePool.candidates          generation-order
RankedSpellingCandidateList.candidates    rank-order
```

`GeneratedName.spellingCandidates` remains a ranked app-facing list for UI/export convenience. Raw unranked spelling candidates should stay inside the spelling projection boundary.

## Desired module rule

Prefer this:

```text
module returns named model or named collection boundary
```

over this:

```text
module returns raw array and expects callers to remember what order means
```

Raw arrays are still fine inside modules and for tiny internal helpers. They become risky at module boundaries when multiple arrays of the same family have different semantics.

## Near-term cleanup candidates

1. Use phrase-level audition output in the inspector UI while keeping browser/provider details out of the model.
2. Make generated stress assignment cadence/weight-driven only when the generator owns a real rule.
3. Gradually turn `architecture.md` into an index and keep detailed contracts in focused docs like this one.
