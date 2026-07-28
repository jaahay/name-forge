# Model and Module Contracts

This document describes the current Name Forge models and modules as executable contracts.

It answers:

1. What durable models exist?
2. Which module owns each behavior?
3. What does each module accept and return?
4. What does collection order mean at each boundary?

Related decisions and requirements:

- [`decisions/0001-name-artifact-and-request-contract.md`](decisions/0001-name-artifact-and-request-contract.md)
- [`decisions/0002-criteria-driven-generation.md`](decisions/0002-criteria-driven-generation.md)
- [`decisions/0003-intent-criteria-compiler-pipeline.md`](decisions/0003-intent-criteria-compiler-pipeline.md)
- [`decisions/0004-modes-presets-and-grouping.md`](decisions/0004-modes-presets-and-grouping.md)
- [`requirements/name-request-v1.md`](requirements/name-request-v1.md)
- [`requirements/name-grouping-design-boundary.md`](requirements/name-grouping-design-boundary.md)

## Reading rule

A module contract is written as:

```text
input model(s) -> module behavior -> output model(s)
```

Collection order must have explicit meaning:

| Order kind | Meaning |
| --- | --- |
| `source-order` | Same order as an input source or user-facing list. |
| `generation-order` | Deterministic traversal order, not quality ranking. |
| `rank-order` | Best-to-worst or most-preferred-to-least-preferred. |
| `display-order` | Chosen for UI readability, not necessarily model priority. |

When ranking matters, prefer a named model or explicit `rank` field instead of relying on an undocumented array convention.

## Implemented v1 request contract

### `NameRequest`

`NameRequest` is the durable naming-operation input.

```ts
type NameRequest = {
  readonly version: 1;
  readonly criteria: NameCriteria;
  readonly mode?: string;
  readonly quantity?: {
    readonly kind: "exact";
    readonly value: number;
  };
  readonly grouping?: {
    readonly kind: "independent-set";
  };
  readonly random?: RandomizationRequest;
};
```

Meaning:

- `criteria` declares what each generated name should satisfy;
- `mode` is optional product/UI metadata and must not drive generation or grouping;
- omitted quantity resolves to exact quantity 1;
- omitted grouping resolves to `independent-set`;
- exact quantity is currently supported from 1 through 100;
- `random.seed` is optional and becomes the resolved parent seed.

### `ResolvedNameRequest`

`ResolvedNameRequest` contains normalized criteria, explicit quantity/grouping, and resolved randomization metadata.

```ts
type ResolvedNameRequest = {
  readonly version: 1;
  readonly criteria: NameCriteria;
  readonly mode?: string;
  readonly quantity: {
    readonly kind: "exact";
    readonly value: number;
  };
  readonly grouping: {
    readonly kind: "independent-set";
  };
  readonly random: RandomizationResult;
};
```

### `NameResponse`

`NameResponse` is the durable naming-operation output.

```ts
type NameResponse = {
  readonly version: 1;
  readonly request: ResolvedNameRequest;
  readonly names: readonly NameArtifact[];
  readonly grouping: {
    readonly kind: "independent-set";
    readonly quantity: number;
    readonly parentSeed: string;
    readonly childSeeds: readonly string[];
  };
  readonly random: RandomizationResult;
  readonly diagnostics?: readonly NameDiagnostic[];
};
```

Contract:

- `names` is a flat ordered artifact array;
- `names.length` equals resolved exact quantity;
- `grouping.childSeeds.length` equals `names.length`;
- `grouping.childSeeds[index]` generated `names[index]`;
- order is deterministic generation order, not rank order;
- `random.seed` is the parent seed and is always present;
- diagnostics report fallback or criteria support honestly; they are not public fit scores.

### `NameGroupMetadata`

The first grouping model is deliberately narrow.

```ts
type NameGroupMetadata = {
  readonly kind: "independent-set";
  readonly quantity: number;
  readonly parentSeed: string;
  readonly childSeeds: readonly string[];
};
```

`independent-set` means that each artifact uses the same normalized criteria but does not participate in cohesion, contrast, diversity, slot, role, or cross-artifact optimization.

Index 0 uses the parent seed directly to preserve the previous singular deterministic stream. Later indexes use deterministic child-seed labels. Increasing quantity therefore preserves the existing artifact prefix.

### `NameArtifact`

`NameArtifact` is the primary durable result unit.

It preserves selected generator richness such as:

- display text;
- sound and silhouette data;
- selected spelling;
- retained ranked spellings;
- identity data where available;
- variants, provenance, diagnostics, and exportable metadata.

A group does not replace individual artifacts with a set wrapper. Equal display values must still have distinct durable IDs through indexed identity.

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

Criteria are structured data produced by controls, presets, saved preferences, or future assistive parsing. They are not free-form prompt text.

### Randomization models

```ts
type RandomizationRequest = {
  readonly seed?: string;
};

type RandomizationResult = {
  readonly seed: string;
  readonly algorithm: "name-forge-v1";
};
```

The same normalized request, parent seed, algorithm version, and engine data must reproduce the same ordered response.

## Deferred grouping contracts

The following are not implemented by `independent-set`:

- cohesion- or diversity-optimized sets;
- ranked alternatives for one naming problem;
- slotted sets and slot-level criteria;
- aggregate or per-slot diagnostics;
- partial-result recovery;
- per-artifact reroll or child replacement;
- group persistence, Inspect navigation, or export presentation.

Fiction Cast concepts such as roles, locks, and ensemble scoring remain product-specific unless a later shared contract explicitly accepts them.

## Current model inventory

### User/config/request models

| Model | Current owner | Plain meaning |
| --- | --- | --- |
| `NameRequest` | `nameRequest.ts` | Durable naming-operation input with optional exact quantity/grouping. |
| `ResolvedNameRequest` | `nameRequest.ts` | Normalized criteria, explicit quantity/grouping, and resolved parent seed. |
| `NameResponse` | `nameRequest.ts` | Flat ordered artifacts plus grouping and randomization metadata. |
| `NameGroupMetadata` | `nameRequest.ts` | Positional parent/child seed contract for an independent set. |
| `NameCriteria` | `nameCriteria.ts` | Stable structured intent model. |
| `GenerationSettings` | `types.ts` / app state | Current lower-level generator settings. |
| `StyleInput` | `styleCompiler.ts` | Current ergonomic style bridge before compilation. |
| `StylePack` | `types.ts` / `data/stylePacks.ts` | Built-in style/source data. |
| `SoundProfile` | `soundProfile.ts` | Compiled internal sound recipe. |

### Sound models

| Model | Current owner | Plain meaning |
| --- | --- | --- |
| `SoundSegmentId` | `starterSoundInventory.ts` | Stable ID for an engine-known sound segment. |
| `SegmentSyllable` | `soundGenerator.ts` | Syllable span and onset/nucleus/coda indexes. |
| `SegmentSequence` | `soundGenerator.ts` | One pre-spelling sound plan. |
| `SoundCandidate` | `soundGenerator.ts` | Generated sound plan plus cadence and debug display. |

### Spelling models

| Model | Current owner | Plain meaning |
| --- | --- | --- |
| `SpellingSegmentMapping` | `spellingGenerator.ts` | Link from a sound segment to generated letters. |
| `SpellingCandidate` | `spellingGenerator.ts` | One possible written form. |
| `SpellingCandidatePool` | `spellingGenerator.ts` | Complete generated spelling pool for one sound candidate. |
| `RankedSpellingCandidate` | `spellingGenerator.ts` | Spelling candidate after scoring and ranking. |
| `RankedSpellingCandidateList` | `spellingGenerator.ts` | Rank-ordered spelling alternatives. |

### App-facing name models

| Model | Current owner | Plain meaning |
| --- | --- | --- |
| `NameGenerationCandidate` | `generator.ts` | Pre-selection candidate with sound and ranked spellings. |
| `GeneratedName` | `types.ts` / `generator.ts` | Selected app-facing name with current generator metadata. |
| `NameArtifact` | `nameArtifact.ts` | Stable durable result mapped from one selected `GeneratedName`. |
| `NameIdentity` | `identity.ts` / `types.ts` | Display composition and materialized phrase parts. |
| `GeneratedEnsemble` | `ensemble.ts` / `types.ts` | Existing Fiction Cast result and diagnostics, separate from shared grouping. |

### Audition/projection models

| Model | Current owner | Plain meaning |
| --- | --- | --- |
| `AuditionPhonology` | `auditionPhonology.ts` | Renderer-neutral sound presentation. |
| `BrowserAuditionCue` | `browserAuditionProjection.ts` | Browser/display projection for speech and guide text. |
| `NameAuditionCue` | `audition.ts` | Current UI audition composition. |
| `IdentityAuditionPhrase` | `identityAudition.ts` | Phrase-level audition projection. |

## Current module seams

### Request resolver

```text
NameRequestInput -> resolveNameRequest -> ResolvedNameRequest + RandomizationResult
```

Owns:

- criteria normalization;
- parent-seed resolution;
- algorithm tagging;
- exact quantity validation;
- grouping default/validation;
- preserving optional mode metadata.

Does not own:

- candidate generation;
- cohesion or slot semantics;
- product-specific mode behavior.

### Name response adapter/service

```text
NameRequest -> generateNameResponse -> NameResponse
```

Owns:

- resolving the request;
- invoking criteria diagnostics once;
- compiling criteria once;
- deriving ordered child seeds;
- creating child-local settings;
- generating each artifact with its ordered index;
- mapping selected names to `NameArtifact`;
- returning flat artifacts and positional grouping metadata.

Does not own:

- cohesion optimization;
- ranked-list or slot grouping;
- partial results;
- per-artifact reroll;
- new active modes.

### Criteria diagnostics and compiler

```text
NameCriteria -> diagnostics
NameCriteria + base settings -> GenerationSettings
```

Owns:

- support classification;
- deterministic compiler output;
- honest fallback/partial diagnostics;
- current criteria-to-settings mappings.

Does not own UI chips, random generation, public match percentages, or universal taste claims.

Follow-up risk: supported-target knowledge is duplicated between `nameCriteriaCompiler.ts` and `nameCriteriaDiagnostics.ts` and should be centralized before major target expansion.

### Candidate scoring

```text
candidate + compiled settings -> internal score -> selected result
```

Owns deterministic internal selection pressure and debug-useful components. It does not own public fit percentages or hard failure for ordinary taste conflicts.

### Name artifact mapper

```text
GeneratedName -> toNameArtifact -> NameArtifact
```

Owns faithful mapping from selected generator output into the durable artifact shape. It must not invent facts absent from the generated result.

### Sound generator

```text
SoundProfile + SeededRandom -> SoundCandidate
```

Owns syllable count, cadence, shapes, segment sequence, and sound candidate construction.

Collection semantics:

- `SegmentSequence.segments` is source-order;
- `SegmentSequence.syllables` is source-order.

### Spelling generator

```text
SoundCandidate -> SpellingCandidatePool
SpellingCandidatePool + SoundProfile -> RankedSpellingCandidateList
```

Owns sound-to-letter projection, segment mappings, scoring, and rank assignment.

Collection semantics:

- raw pool candidates are deterministic generation-order;
- ranked candidates are rank-order with explicit rank.

### Generator

```text
GenerationSettings + source provider -> GeneratedName / NameGenerationCandidate
```

Owns current name materialization, candidate selection, scores, variants, identity, and indexed durable identity inputs.

For grouped generation, each child receives a child-local seed and its ordered artifact index.

### Identity and audition modules

- `identity.ts` arranges licensed generated/profile parts into display identities.
- `auditionPhonology.ts` derives renderer-neutral sound presentation.
- `browserAuditionProjection.ts` creates browser-speech-friendly projection.
- `audition.ts` composes UI-facing audition conveniences.
- `identityAudition.ts` projects materialized identity phrase parts while preserving provenance.

These modules do not own request quantity, grouping semantics, or group-level optimization.
