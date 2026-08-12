# Model and Module Contracts

This document describes the current Name Forge models and module seams as executable contracts, including the implemented singular naming API and the accepted semantic-callback layer that sits above it.

For active product scope see [`current-product-scope.md`](current-product-scope.md). For architectural ownership see [`architecture.md`](architecture.md), [`decisions/0005-sound-profile-product-boundary.md`](decisions/0005-sound-profile-product-boundary.md), and [`decisions/0006-naming-capabilities-and-surface-composition.md`](decisions/0006-naming-capabilities-and-surface-composition.md).

## Reading rule

A module contract is written as:

```text
input model(s) -> module behavior -> output model(s)
```

Collection order must have explicit meaning:

| Order kind | Meaning |
| --- | --- |
| `source-order` | Same order as an input source or structural sequence. |
| `generation-order` | Deterministic traversal order, not quality ranking. |
| `rank-order` | Best-to-worst or most-preferred-to-least-preferred. |
| `display-order` | Chosen for presentation, not necessarily model priority. |

When ranking matters, prefer an explicit rank-bearing model rather than relying on an undocumented array convention.

## Naming API versus request platform

Two related boundaries must not be conflated.

The implemented shared request/transport operation is:

```text
NameRequest -> NameResponse
```

The reusable naming API hierarchy is:

```text
surface-specific aggregate orchestration, when needed
  -> reusable typed semantic callback(s)
     generateGivenName(...)
     generateFamilyName(...)
     generatePlaceName(...)
  -> generic singular generateName(...)
  -> typed style / sound / spelling mechanics
```

`NameRequest` provides shared criteria, deterministic replay, exact independent quantity, and artifact transport. Semantic callbacks provide reusable domain meaning. A surface composes semantic callbacks and injects configuration derived from its UX. Surface-specific multi-name orchestration may remain surface-owned when its cross-name semantics are not reusable.

The generic singular `generateName(...)` contract is implemented. The semantic callback contracts are not implemented yet. `NameSilhouette` and silhouette-shaped generator entry points are no longer part of the naming API.

## Implemented shared request contract

### `NameRequest`

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

Contract:

- `criteria` is shared structured request intent, not the only possible semantic configuration vocabulary;
- `mode` is optional product/UI metadata and must not drive generic generation, grouping, or semantic callback selection;
- omitted quantity resolves to exact quantity 1;
- omitted grouping resolves to `independent-set`;
- exact quantity currently supports 1 through 100;
- `random.seed` is optional and resolves to the parent seed.

### `ResolvedNameRequest`

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

Resolution makes the current shared quantity, grouping, and randomization contract explicit before generation.

### `NameResponse`

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

- `names` is a flat artifact array in deterministic generation order;
- `names.length` equals resolved exact quantity;
- `grouping.childSeeds.length` equals `names.length`;
- `grouping.childSeeds[index]` generated `names[index]`;
- index 0 uses the parent seed, preserving the previous singular stream;
- later indexes use deterministic child seeds;
- increasing quantity preserves the existing result prefix;
- diagnostics report support/fallback truthfully and are not public fit scores.

### `NameArtifact`

`NameArtifact` is the durable result unit shared by product surfaces.

It retains the selected generated result and enough structure for inspection, analysis, replay-oriented provenance, spelling alternatives, readability evidence, variants, and identity/audition projection where available.

An independent-set response remains a collection of individually addressable artifacts. Grouping does not replace artifacts with one aggregate name-set entity.

The current artifact still exposes a property named `silhouette` for compatibility. Its value is `NameGenerationPlan` evidence; the property name does not imply that callers construct a silhouette or that `NameSilhouette` remains an API contract.

### `NameCriteria`

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

Criteria are structured shared request intent, not free-form generation prompts. A reusable semantic callback may additionally own typed configuration specific to its domain rather than expanding `NameCriteria` into a universal schema.

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

Identical resolved request inputs, parent seed, algorithm version, and engine data must reproduce the same ordered response.

## Current grouping boundary

`independent-set` means each artifact uses the same normalized shared request criteria while generating independently from its deterministic child seed.

It does not currently model:

- cohesion-optimized or diversity-optimized sets as a reusable cross-surface contract;
- ranked alternatives for one naming problem;
- generic semantic slots or slot-level criteria;
- aggregate or per-slot diagnostics;
- partial-result recovery;
- generic per-artifact reroll/child replacement semantics;
- shared group-level persistence, Inspect navigation, or export presentation.

Fiction Cast ensemble behavior is surface-specific and does not imply those capabilities should exist in shared grouping. A future Fiction Cast aggregate may compose reusable semantic callbacks directly while remaining distinct from `independent-set`.

## Current model inventory

### Shared request and configuration models

| Model | Owner | Meaning |
| --- | --- | --- |
| `NameRequest` | `src/engine/nameRequest.ts` | Shared request/transport input with optional exact quantity/grouping; not the semantic callback hierarchy. |
| `ResolvedNameRequest` | `src/engine/nameRequest.ts` | Normalized request with explicit quantity/grouping and parent seed. |
| `NameResponse` | `src/engine/nameRequest.ts` | Flat ordered artifacts plus grouping/randomization metadata. |
| `NameGroupMetadata` | `src/engine/nameRequest.ts` | Parent/child seed metadata for the current independent set. |
| `NameCriteria` | `src/engine/nameCriteria.ts` | Shared structured request-intent model. |
| `GenerationSettings` | `src/engine/types.ts` / app state | Current lower-level generation settings consumed by `generateName(...)`; not the future semantic callback vocabulary. |
| `NameGenerationPlanPreferences` | `src/engine/types.ts` | Generic resolved planning pressure that callers may supply without leaking product semantics such as cast roles into `generateName(...)`. |
| `NameGenerationPlan` | `src/engine/types.ts` | Internal pre-generation planning/scoring evidence materialized behind `generateName(...)`. |
| `StyleInput` | `src/styleCompilation/styleCompiler.ts` | Current typed style language compiled into `SoundProfile`. |
| `StylePack` | `src/engine/types.ts` / `src/data/stylePacks.ts` | Built-in style/source data used by current product flows. |

### Sound and spelling mechanics values

| Model | Owner | Meaning |
| --- | --- | --- |
| `SoundProfile` | `src/engine/soundProfile.ts` | Pure resolved sound-mechanics value. |
| `SoundSegmentId` | `src/engine/starterSoundInventory.ts` | Stable identifier for an engine-known sound segment. |
| `SegmentSyllable` | `src/engine/soundGenerator.ts` | Syllable span and onset/nucleus/coda indexes. |
| `SegmentSequence` | `src/engine/soundGenerator.ts` | One pre-spelling ordered sound plan. |
| `SoundCandidate` | `src/engine/soundGenerator.ts` | Generated sound result containing sequence/cadence/debug rendering. |
| `SpellingCandidate` | `src/engine/spellingGenerator.ts` | One supported written projection of generated sound. |
| `SpellingCandidatePool` | `src/engine/spellingGenerator.ts` | Complete generated spelling pool for one sound candidate. |
| `RankedSpellingCandidate` | `src/engine/spellingGenerator.ts` | Spelling candidate after deterministic preference ranking. |
| `RankedSpellingCandidateList` | `src/engine/spellingGenerator.ts` | Rank-ordered spelling alternatives. |

`SoundProfile`, `SoundCandidate`, `SegmentSequence`, and spelling candidates are values. They do not need synthetic IDs or cross-link fields merely to establish their relationship inside one generation result.

### Name orchestration and durable results

| Model | Owner | Meaning |
| --- | --- | --- |
| `GenerateNameOptions` | `src/naming/generator.ts` | Generic singular orchestration input: settings, pack, planning/generation randomness, index, and optional generic planning settings/preferences. |
| `NameGenerationCandidate` | `src/naming/generator.ts` | Private pre-materialization result containing exact profile, sound, ranked spellings, and selected spelling. |
| `GeneratedName` | `src/engine/types.ts` + `src/naming/generator.ts` | Current selected app-facing generated-name value; legacy `silhouette` property contains `NameGenerationPlan` evidence. |
| `NameArtifact` | `src/engine/nameArtifact.ts` | Durable result mapped from one selected `GeneratedName`. |

Implemented contract direction:

- `src/naming` exposes one generic singular `generateName(...)` primitive;
- `generateName(...)` internally materializes `NameGenerationPlan` rather than accepting one from the caller;
- `GenerateNameOptions` contains no product mode, Fiction Cast role, or semantic name-kind label;
- reusable semantic callbacks sit above the primitive and own domain meaning/configuration;
- current `NameGenerationCandidate` remains private implementation structure.

### Fiction Cast semantic models

| Model | Owner | Meaning |
| --- | --- | --- |
| `NameIdentity` | `src/fictionCast/identity.ts` + `src/engine/types.ts` | Materialized Fiction Cast display identity and phrase-part structure. |
| `GeneratedNamePart` | `src/fictionCast/identity.ts` + `src/engine/types.ts` | Product-semantic identity part; sound-backed parts may contain exact generation evidence. |
| `GeneratedEnsemble` | `src/fictionCast/ensemble.ts` + `src/engine/types.ts` | Fiction Cast roster result, separate from shared independent-set grouping. |
| component generation context | `src/fictionCast/componentGenerationContext.ts` | Current given/family/place context seam; likely precursor to reusable semantic callback configuration, not generic sound mechanics. |

Titles, epithets, given/family/place roles, and Fiction Cast grammar are naming/product semantics. They are not fields of `SoundProfile` and do not enter `GenerateNameOptions` as semantic labels.

Fiction Cast currently converts role-specific profile preferences into `NameGenerationPlanPreferences` before singular generation. It then attaches role metadata and role-fit scoring in its own ensemble layer. This preserves current cast behavior without teaching `generateName(...)` what a cast role means.

Given/family/place are plausible first reusable semantic callbacks because multiple surfaces may need those meanings. Fiction Cast still owns the way it composes and coordinates them as a cast.

### Audition/projection models

| Model | Owner | Meaning |
| --- | --- | --- |
| `AuditionPhonology` | `src/engine/auditionPhonology.ts` | Renderer-neutral presentation derived from `SegmentSequence`. |
| `BrowserAuditionCue` | `src/engine/browserAuditionProjection.ts` | Browser-speech-friendly projection, not canonical pronunciation. |
| `NameAuditionCue` | `src/engine/audition.ts` | Current sound-backed name audition composition. |
| `IdentityAuditionPhrase` | `src/engine/identityAudition.ts` | Provenance-preserving phrase projection over a composed identity. |

## Current module seams

### Request resolver

```text
NameRequestInput -> resolveNameRequest -> ResolvedNameRequest + RandomizationResult
```

Owns criteria normalization, quantity/grouping validation/defaults, parent-seed resolution, algorithm tagging, and optional mode metadata preservation.

It does not own semantic callback selection, candidate generation, nuanced aggregate semantics, or product-specific mode behavior.

### Name response adapter/service

```text
NameRequest -> generateNameResponse -> NameResponse
```

Owner: `src/engine/nameResponse.ts`.

Owns:

- resolving the shared request once;
- running criteria diagnostics once;
- compiling shared criteria once through the current bridge;
- deriving deterministic child seeds;
- creating current child-local settings;
- deriving separate deterministic planning and generation random streams;
- generating one artifact per child seed through `generateName(...)`;
- mapping generated names to `NameArtifact`;
- returning flat artifacts and positional independent-set metadata.

It does not own semantic callback definitions, richer group optimization, product-specific roster UX, or mode semantics. It consumes the singular naming primitive directly and does not construct a silhouette or planning aggregate.

### Criteria diagnostics and compiler

```text
NameCriteria -> diagnostics
NameCriteria + base settings -> GenerationSettings
```

Owners: `src/engine/nameCriteriaDiagnostics.ts` and `src/engine/nameCriteriaCompiler.ts`.

They own current shared support classification, deterministic mappings, and honest fallback/partial diagnostics. They do not own semantic callback configuration, UI taxonomy, public match percentages, or universal taste claims.

Supported-target knowledge remains duplicated between the two modules and should be centralized before major shared-criteria expansion.

### Naming orchestration — implemented singular primitive

```text
GenerateNameOptions
  -> generateName(...)
  -> internal NameGenerationPlan
  -> StyleInput
  -> SoundProfile
  -> SoundCandidate
  -> ranked spelling candidates
  -> GeneratedName
```

Owner: `src/naming/generator.ts`.

Owns generic one-name orchestration: internal generation-plan materialization, style compilation, sound generation, spelling pool/ranking/selection, scoring, variants, and readability diagnostics.

It does **not** own Fiction Cast identity grammar, titles/epithets, cast roles, ensemble behavior, request quantity/grouping semantics, product modes, semantic name-kind labels, or low-level sound rules.

The planning and generation random streams are separate inputs so callers can preserve deterministic partitioning without constructing intermediate planning objects.

### Semantic naming callbacks — accepted next layer

```text
surface configuration
  -> semantic callback
  -> generateName(...)
  -> generated one-name result
```

Semantic callbacks own reusable domain meaning and typed configuration while delegating one-name mechanics to `generateName(...)`.

A surface may own aggregate orchestration above semantic callbacks. That orchestration does not become a generic grouping or naming primitive unless cross-surface reuse demonstrates the need.

### Internal generation-plan materialization

```text
GenerationSettings
+ optional NameGenerationPlanPreferences
+ StylePack
+ planning SeededRandom
+ index
  -> NameGenerationPlan
```

Owner: `src/engine/silhouettes.ts` (legacy filename).

`NameGenerationPlan` is internal mechanics/evidence. Generic planning preferences may adjust syllable-count and texture pressures without carrying a product role or semantic name-kind label into the naming primitive. The current `silhouette` result/artifact property and `silhouette-*` IDs are compatibility evidence, not caller-facing generation contracts.

### Sound generator

```text
SoundProfile + SeededRandom -> SoundCandidate
```

Owner: `src/engine/soundGenerator.ts`.

Collection semantics:

- `SegmentSequence.segments` is source-order;
- `SegmentSequence.syllables` is source-order.

The generator consumes the pure resolved profile value and does not branch on semantic name kind, Fiction Cast roles, or product modes.

### Spelling generator

```text
SoundCandidate -> SpellingCandidatePool
SpellingCandidatePool + SoundProfile -> RankedSpellingCandidateList
```

Owner: `src/engine/spellingGenerator.ts`.

Collection semantics:

- raw candidates are deterministic generation-order;
- ranked candidates are rank-order with explicit rank;
- bounded presentation is applied only after full-pool ranking.

### Name artifact mapper

```text
GeneratedName -> toNameArtifact -> NameArtifact
```

Owner: `src/engine/nameArtifact.ts`.

The mapper preserves generated facts; it must not invent information absent from the generated result.

### Fiction Cast identity and ensemble

`src/fictionCast/identity.ts` owns Fiction Cast identity grammar and materialization. Sound-backed given/family/place parts may retain the exact `SoundProfile`, `SoundCandidate`, and selected spelling used for that component. Titles, epithets, initials, and literals remain explicit product semantics.

`src/fictionCast/ensemble.ts` owns Fiction Cast surface-specific ensemble selection and roster behavior. It is separate from the shared `independent-set` request contract. It resolves cast-role preferences above `generateName(...)` and attaches cast-role evidence/scoring after singular generation. As semantic callbacks emerge, Fiction Cast should compose them rather than duplicate their one-name domain behavior.

### Audition

- `src/engine/auditionPhonology.ts` derives renderer-neutral sound presentation.
- `src/engine/browserAuditionProjection.ts` derives browser voice-draft cues.
- `src/engine/audition.ts` composes the sound-backed UI cue.
- `src/engine/identityAudition.ts` projects materialized identity phrase parts while preserving contained generation evidence.
- `src/ui/NameArtifactInspector.tsx` adapts those projections into current browser playback, including semantic phrase chunks and per-component Play actions.

Browser pause/chunking policy is presentation behavior, not durable phonology or a provider-neutral audio contract.