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
- [`requirements/name-request-v1-checkpoint.md`](requirements/name-request-v1-checkpoint.md)
- [`requirements/name-grouping-design-boundary.md`](requirements/name-grouping-design-boundary.md)

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

## Implemented v1 request/criteria contracts

These are now implemented v1 contracts, not merely planning types. The contract is intentionally singular: it returns exactly one `NameArtifact` today while leaving future quantity and grouping as separate extensions.

### `NameRequest`

`NameRequest` is the durable naming operation input.

```ts
type NameRequest = {
  readonly version: 1;
  readonly criteria: NameCriteria;
  readonly mode?: string;
  readonly random?: RandomizationRequest;
};
```

Plain meaning:

- `criteria` declares what the generated name should satisfy.
- `mode` is optional UI/product metadata and must not drive v1 generation behavior.
- `random.seed` is optional; the response always emits the resolved seed.
- `quantity`, `grouping`, `NameGrouping`, and `NameSetCriteria` are not current API fields. They remain future concepts.

### `NameResponse`

`NameResponse` is the durable naming operation output.

```ts
type NameResponse = {
  readonly version: 1;
  readonly request: ResolvedNameRequest;
  readonly names: readonly NameArtifact[];
  readonly random: RandomizationResult;
  readonly diagnostics?: readonly NameDiagnostic[];
};
```

Plain meaning:

- `names` is always an array, but v1 currently returns exactly one artifact.
- There is no current public `group` field.
- `random.seed` is always present.
- `diagnostics` are honest notes about fallback, unsupported criteria, or partial implementation. They are not public fit scores and not a Criteria Match UI.

### `NameArtifact`

`NameArtifact` is the primary product artifact.

`NameArtifact` preserves the richness currently carried by selected `GeneratedName` results: display text, sound plan, selected spelling, retained spelling alternatives, identity data where applicable, diagnostics, and exportable metadata.

`GeneratedName` remains the current app-facing selected result inside the generator path. `NameArtifact` is the stable request/response artifact noun.

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

## Future quantity and grouping contracts

Runtime quantity, grouping, and slotted generation are deferred. Do not add these to the public v1 API until a dedicated grouping design slice accepts the contract. The current docs-only boundary is [`requirements/name-grouping-design-boundary.md`](requirements/name-grouping-design-boundary.md).

Future concept names include:

```ts
type NameQuantity = {
  readonly count: number;
};

type NameGrouping =
  | { readonly kind: "none" }
  | { readonly kind: "set"; readonly criteria?: NameSetCriteria }
  | { readonly kind: "ranked-list" }
  | { readonly kind: "slots"; readonly slots: readonly NameSlotRequest[] };
```

Meanings:

- `none`: the current singular behavior.
- `set`: independent names generated under shared criteria.
- `ranked-list`: multiple alternatives for one naming problem.
- `slots`: named roles such as given/family/place/team/member.

`NameSetCriteria` is future vocabulary for criteria that apply across a set or group. It is where cohesion, contrast, diversity, compatibility, and aggregate diagnostics questions can be designed without changing the current request shape.

Boundary rules:

- Do not add grouping fields to the current public v1 `NameRequest` until a contract slice is accepted.
- Do not make `mode` drive grouping behavior.
- Do not make Fiction Cast concepts global engine assumptions.
- Do not expose candidate scoring as public group fit scoring.
- Do not add public Criteria Match or fit percentage UI as part of grouping design.
- Do not implement runtime grouping in a docs-only slice.

## Current model inventory

### User/config/request models

| Model | Current owner | Plain meaning |
| --- | --- | --- |
| `NameRequest` | `nameRequest.ts` | Implemented v1 request contract for one naming operation. |
| `ResolvedNameRequest` | `nameRequest.ts` | Request with normalized criteria and resolved randomization. |
| `NameResponse` | `nameRequest.ts` | Implemented v1 response contract with exactly one `NameArtifact` today. |
| `NameCriteria` | `nameCriteria.ts` | Stable criteria input model. |
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
| `NameArtifact` | `nameArtifact.ts` | Stable product artifact mapped from one selected `GeneratedName`. |
| `NameIdentity` | `identity.ts` / `types.ts` | Display composition plus materialized phrase parts from generated/profile-licensed parts. |
| `GeneratedEnsemble` | `ensemble.ts` / `types.ts` | Current Cast-level result set and diagnostics. |

### Audition/projection models

| Model | Current owner | Plain meaning |
| --- | --- | --- |
| `AuditionPhonology` | `auditionPhonology.ts` | Renderer-neutral sound presentation structure derived from a segment sequence. |
| `BrowserAuditionCue` | `browserAuditionProjection.ts` | Browser/display projection for sound guide and voice draft. |
| `NameAuditionCue` | `audition.ts` | Current UI composition of audition phonology and browser cue. |
| `IdentityAuditionPhrase` | `identityAudition.ts` | Renderer-neutral phrase-level audition projection from materialized identity phrase parts. |

## Current and future module seams

### Criteria diagnostics and compiler

```text
NameCriteria -> diagnostics
NameCriteria + base request settings -> GenerationSettings
```

Owns:

- resolving supported criteria clauses into current generator settings
- producing deterministic compiler output
- diagnosing accepted-but-unimplemented criteria
- keeping v1 honest about partial implementation

Does not own:

- UI chips or drawer behavior
- random candidate generation
- public criteria-match explanation
- public fit percentages

Follow-up risk: supported-target knowledge is duplicated between `nameCriteriaCompiler.ts` and `nameCriteriaDiagnostics.ts`. Before expanding criteria targets, centralize supported-target metadata or add a shared helper such as `isCriteriaClauseCompiled(...)`.

### Name request adapter/service

```text
NameRequest -> NameResponse
```

Owns:

- resolving missing seed
- preserving optional mode metadata without using it as a generation branch
- invoking criteria diagnostics
- compiling criteria into current generator settings
- invoking candidate generation and selection
- mapping the selected `GeneratedName` to one `NameArtifact`
- returning exactly one artifact in v1

Does not own:

- runtime grouping
- plural quantity behavior
- slotted generation
- grouped response shape
- new active modes

### Candidate scoring

```text
candidate + compiled criteria/settings -> internal candidate score -> selected result
```

Owns:

- functional selection scoring
- spelling candidate selection pressure when criteria request it
- decomposed score components when useful for debugging or future Inspect surfaces

Does not own:

- public fit percentages
- polished Criteria Match UI
- treating taste criteria as hard failure by default

Candidate scoring is internal selection machinery only. It must not leak into public response artifacts as a fit percentage or public match score.

## Module contract map

### `styleCompiler.ts`

```text
StyleInput -> compileStyle -> SoundProfile
```

Owns current translation from ergonomic style intent into an engine-readable sound recipe. It does not own all future intent surfaces, generated names, browser voice text, or spelling ranking.

Design note: `StyleInput` is now best understood as the current implementation bridge. Future criteria work should not expand `StyleInput` into a universal user-intent model; richer surfaces should produce `NameCriteria`.

### `nameRequest.ts`

```text
NameRequestInput -> resolveNameRequest -> ResolvedNameRequest + RandomizationResult
```

Owns request normalization, seed resolution, algorithm tagging, and the exported v1 request/response contracts.

### `nameCriteriaCompiler.ts`

```text
NameCriteria + NameCriteriaCompilerBaseSettings -> compileNameCriteriaToGenerationSettings -> GenerationSettings
```

Owns the small current bridge from supported criteria targets to current generator settings. It does not own public criteria scoring or the full future criteria taxonomy.

### `nameCriteriaDiagnostics.ts`

```text
NameCriteria -> diagnosticsForNameCriteria -> NameDiagnostic[]
```

Owns support classification and fallback/partial-implementation diagnostics. It does not own compiler behavior, public fit percentages, or UI wording beyond diagnostic messages.

### `nameArtifact.ts`

```text
GeneratedName + ResolvedNameRequest -> NameArtifact
```

Owns mapping selected app-facing names into the stable product artifact shape. It should not invent generation facts that were not present on the selected result.

### `soundProfile.ts`

```text
compiled profile data -> SoundProfile helpers/types
```

Owns the internal sound recipe contract, phonotactic preference fields, cadence and texture targets, and profile-licensed title/epithet lexemes. It does not own random generation behavior, generated segment sequences, or UI copy.

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

Owns choosing sound segments, creating syllable spans, assigning onset/nucleus/coda indexes, producing `SegmentSequence`, and producing `SoundCandidate`.

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

Owns projecting sound segments into written letters, preserving segment-to-letter mappings, scoring spellings against profile preferences, and adding explicit rank after scoring.

Collection semantics:

| Function | Output | Collection meaning |
| --- | --- | --- |
| `generateSpellingCandidatePool(sound)` | `SpellingCandidatePool` | `.candidates` is deterministic generation order, not quality ranking. |
| `rankSpellingCandidatePool(pool, profile)` | `RankedSpellingCandidateList` | `.candidates` is rank order; each item also has `rank` and `score`. |
| `generateRankedSpellingCandidates(sound, profile)` | `RankedSpellingCandidateList` | `.candidates` is rank order. |

### `generator.ts`

```text
GenerationSettings + NameSourceProvider -> GeneratedName[] / NameGenerationCandidate[]
```

Owns materializing current name candidates from settings, profiles, sound, spellings, scoring, diagnostics, and variants. It may select a ranked spelling as the display name, including criteria-compiled selection pressure, but that selection remains an internal implementation detail.

Important model boundary: `NameGenerationCandidate.rankedSpellings` is a `RankedSpellingCandidateList`. `GeneratedName.spellingCandidates` remains the app-facing ranked candidate array for UI/export convenience; it does not expose raw unranked spelling projections.

### `identity.ts`

```text
GeneratedName + optional supporting GeneratedName + NameFormatKind -> NameIdentity
```

Owns arranging already licensed parts into display identity forms, choosing title/epithet lexemes from the compiled profile lexicon, using generated supporting names for family/place components, and materializing phrase structure as `NameIdentity.phraseParts`.

It does not own inventing arbitrary suffixes or epithets by string surgery, phrase-level audio/prosody, or browser projection.

### `auditionPhonology.ts`

```text
SegmentSequence -> AuditionPhonology
```

Owns renderer-neutral sound presentation structure, segment slices per syllable, onset/nucleus/coda segment ids, and current fallback stress hints.

Collection semantics:

- `AuditionPhonology.syllables` is source-order: exact syllable order from the source segment sequence.

### `browserAuditionProjection.ts`

```text
AuditionPhonology -> BrowserAuditionCue
```

Owns browser-speech-friendly `speechText`, human-readable guide syllables, display guide text, and browser/display compromises. It does not own generated sound truth, stress truth, phonotactic validity, or canonical pronunciation.

Collection semantics:

- `syllableText` is source-order: browser speech text per syllable.
- `guideSyllables` is source-order: human guide text per syllable.

### `audition.ts`

```text
SegmentSequence -> NameAuditionCue
NameIdentity + source generated names -> IdentityAuditionPhrase
```

Owns current UI convenience composition and re-exporting audition and projection functions/types. This file should remain boring.

### `identityAudition.ts`

```text
NameIdentity + source generated names -> IdentityAuditionPhrase
```

Owns projecting materialized identity phrase parts into sound, text, or literal audition parts, preserving per-part speech/display provenance, and reusing generated source-name sound for sound-backed identity parts.
