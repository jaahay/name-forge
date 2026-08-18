# Model and Module Contracts

This document describes the current executable model boundaries in Name Forge.

For architectural ownership see [`architecture.md`](architecture.md). For active product scope see [`current-product-scope.md`](current-product-scope.md).

## Contract map

```text
product surface
  -> semantic naming capability
  -> generateName(...)
  -> GeneratedName

GeneratedName
  -> toNameArtifact(...)
  -> NameArtifact
```

Fiction Cast composes `GeneratedName` values into its own surface results. Game NPC uses the shared singular request/artifact path directly.

## Collection order

| Order | Meaning |
| --- | --- |
| `source-order` | Order supplied by source data or structural sequence |
| `generation-order` | Deterministic traversal/generation order |
| `rank-order` | Explicit best-to-worst preference order |
| `display-order` | Presentation order selected by a surface |

Ranked collections carry explicit rank where ranking is part of the contract.

## Singular generation models

### `GenerateNameOptions`

Owner: `src/naming/generator.ts`.

Conceptually:

```ts
type GenerateNameOptions = {
  readonly settings: NameGenerationSettings;
  readonly pack: StylePack;
  readonly seed: string;
  readonly index: number;
  readonly planningSettings?: NameGenerationSettings;
  readonly planningPreferences?: NameGenerationPlanPreferences;
};
```

`seed` is the immutable deterministic input for one invocation. `generateName(...)` derives its planning and generation random streams internally.

### `StylePack.formBias`

Owner: `src/engine/types.ts`; built-in values live in `src/data/stylePacks.ts`.

```ts
type FormBias = {
  readonly syllableCounts: Array<WeightedValue<number>>;
  readonly textures: Array<WeightedValue<NameTexture>>;
};
```

`formBias` is a reusable causal prior for coarse name form before exact sounds or spellings exist. `createNameGenerationPlan(...)` combines it with generation settings, optional planning preferences, and seeded randomness to materialize a concrete plan.

### `GeneratedName`

Owner: `src/engine/types.ts`, materialized by `src/naming/generator.ts`.

```ts
type GeneratedName = {
  readonly id: string;
  readonly name: string;
  readonly soundProfile: SoundProfile;
  readonly sound: SoundCandidate;
  readonly spelling: RankedSpellingCandidate;
  readonly spellingCandidates: readonly RankedSpellingCandidate[];
  readonly generationPlan: NameGenerationPlan;
  readonly scores: NameScores;
  readonly variants: readonly NameVariant[];
  readonly readabilityDiagnostics: readonly ReadabilityDiagnostic[];
};
```

Contract:

- `name === spelling.text`;
- the contained sound, spelling, and generation-plan evidence describes this singular name;
- identical explicit `generateName(...)` arguments replay the same full result under the same current engine data and implementation.

### `NameGenerationPlan`

Owner: `src/engine/types.ts`; materialized by `src/engine/nameGenerationPlan.ts` during `generateName(...)`.

The plan currently carries:

- syllable count;
- stress pattern;
- rhythm;
- shape;
- texture;
- novelty target;
- length target.

It is retained as generation evidence under `GeneratedName.generationPlan`.

### `NameScores`

Owner: `src/engine/types.ts`; calculated by `src/engine/scoring.ts`.

Current generic intrinsic score dimensions are:

- pronounceability;
- memorability;
- novelty;
- cultural anchoring;
- orthographic naturalness;
- style fit;
- overall fit derived from those intrinsic dimensions and generation settings.

Generic scoring does not include a form/plan-conformance score. A surface can use generation-plan evidence in contextual scoring when its product semantics make that comparison meaningful.

## Semantic naming models

Owner: `src/naming/semanticName.ts` and the given/family/place modules.

The shared semantic invocation shape contains:

```text
GenerationSettings
+ SourceRegistry
+ { seed, resultIndex }
+ typed semantic preferences
  -> semantic callback
  -> generateName(...)
  -> GeneratedName
```

Current callbacks:

- `generateGivenName(...)`
- `generateFamilyName(...)`
- `generatePlaceName(...)`

The semantic layer owns source/style resolution and preference translation. `generateName(...)` owns singular generation and internal randomness.

## Shared artifact model

### `NameArtifact`

Owner: `src/engine/nameArtifact.ts`.

```ts
type NameArtifact = {
  readonly id: string;
  readonly soundProfile: SoundProfile;
  readonly sound: SoundCandidate;
  readonly spelling: RankedSpellingCandidate;
  readonly spellingCandidates: readonly RankedSpellingCandidate[];
  readonly generationPlan: NameGenerationPlan;
  readonly variants: readonly NameVariant[];
  readonly readabilityDiagnostics: readonly ReadabilityDiagnostic[];
};
```

The artifact's generated text is `spelling.text`.

`toNameArtifact(generatedName)` projects the singular generated evidence. `isNameArtifact(value)` validates the current singular durable shape.

## Shared request models

Owner: `src/engine/nameRequest.ts` and `src/engine/nameResponse.ts`.

### `NameRequest`

The current request carries:

- structured `NameCriteria`;
- optional product `mode` metadata;
- optional exact quantity;
- optional `independent-set` grouping;
- optional parent seed.

The current TypeScript contract also contains its existing `version: 1` field.

### `ResolvedNameRequest`

Resolution makes quantity, grouping, and randomization explicit before generation.

### `NameResponse`

A response contains:

```text
resolved request
ordered NameArtifact[]
independent-set grouping metadata
resolved randomization metadata
optional diagnostics
```

For quantity `n`:

- `names.length === n`;
- `grouping.childSeeds.length === n`;
- `grouping.childSeeds[index]` is the seed used for `names[index]`;
- increasing quantity preserves the existing result prefix.

### `NameCriteria`

`NameCriteria` is shared structured request intent. Current clause families include sound, shape, register, spelling, semantic, avoid, and practical intent.

Criteria diagnostics report current support and fallback behavior. Semantic callbacks may additionally expose typed preferences specific to their domain.

## Sound and spelling models

### `SoundProfile`

Owner: `src/engine/soundProfile.ts`.

A pure resolved mechanics value containing sound targets and phonotactic preferences.

### `SegmentSequence`

Owner: `src/engine/soundGenerator.ts`.

An ordered pre-spelling sound plan. Segment and syllable arrays are source-order.

### `SoundCandidate`

Owner: `src/engine/soundGenerator.ts`.

The generated sound result containing its sequence, cadence, and transcription.

### Spelling candidates

Owner: `src/engine/spellingGenerator.ts`.

```text
SoundCandidate
  -> SpellingCandidatePool
  -> RankedSpellingCandidateList
```

Raw candidates are deterministic generation-order. Ranked candidates are rank-order with explicit rank. The selected spelling is retained alongside the full ranked pool.

## Fiction Cast models

### `FictionCastSettings`

Owner: `src/fictionCast/types.ts`.

Surface settings for cast size, format, roles, rarity, tuning controls, source/style selection, and seed.

### `FictionCastGeneratedName`

Owner: `src/fictionCast/types.ts`.

A composed surface result containing:

```text
id
displayName
identity
identityAudition
primaryName: GeneratedName
readabilityDiagnostics
role / roleInfluence
contextualScores
rarityBand
```

`primaryName` remains the singular generated result. Supporting generated parts retain their own generation evidence in the identity structure.

### `FictionCastGeneratedEnsemble`

Owner: `src/fictionCast/types.ts` and `src/fictionCast/ensemble.ts`.

The current aggregate result contains:

- resolved Fiction Cast settings;
- source-pack summary;
- ordered composed names;
- cast diagnostics.

`generateEnsemble(...)` is the current implementation entry point for this aggregate result.

### Fiction Cast contextual models

Owned by `src/fictionCast`:

- role assignment and role influence;
- rarity distribution/bands;
- contextual role and ensemble scores;
- identity grammar;
- lexical title/epithet material;
- component-generation context;
- identity audition.

These models describe Fiction Cast semantics above singular generation. `scoreFictionCastRoleFit(...)` may use `NameGenerationPlan` evidence such as target length, texture, rhythm, and syllable count because the role preference supplies the surface context that makes those comparisons meaningful.

### Primary-name analysis/addressability adapter

Owner: `src/fictionCast/nameArtifact.ts`.

```text
FictionCastGeneratedName
  -> toFictionCastPrimaryNameArtifact(...)
  -> NameArtifact with Cast result ID
```

The adapter exposes the primary singular evidence to shared analysis/inspection while preserving the Cast result ID used by surface navigation.

It is an analysis/presentation adapter. Fiction Cast generation continues to return `FictionCastGeneratedName` / `FictionCastGeneratedEnsemble` results.

### Fiction Cast export

Owner: `src/fictionCast/export.ts`.

The export serializer owns the surface representation of the composed Cast result. It currently includes the composed display identity and selected primary-name sound, spelling, generation-plan, variant, and score evidence. The export carries no public schema-version branding.

## History models

### Shared singular history

Owner: `src/engine/nameHistory.ts`.

The shared browser history stores `NameArtifact` entries with saved seed, surface metadata, and timestamp. Loading validates the current singular artifact shape.

The current Game NPC workflow records into this history.

### Fiction Cast history

Fiction Cast currently keeps its generated results in live surface state and does not write them into shared singular history.

A Fiction Cast history implementation belongs to the Fiction Cast surface and should store a Fiction Cast result or a Fiction Cast-specific history record.

## Analysis models

Owner: `src/engine/nameArtifactAnalysis.ts`.

Shared analysis consumes singular `NameArtifact` values and produces deterministic evidence for:

- generated structure;
- spelling selection;
- readability;
- pairwise collisions;
- modeled sound relationships.

Fiction Cast supplies primary-name artifact projections when using this shared analysis for same-roster relationships.

## Audition models

- `AuditionPhonology`: renderer-neutral sound presentation derived from `SegmentSequence`.
- `BrowserAuditionCue`: browser-speech projection for one generated sound.
- `IdentityAuditionPhrase`: Fiction Cast composed-identity phrase projection retaining generated component evidence.

The shared artifact inspector presents singular generated evidence. Fiction Cast supplies its composed display, whole-identity voice text, component audition controls, context, and scoring through its surface inspector.

## Module seams

### Singular generation

```text
GenerateNameOptions
  -> generateName(...)
  -> createNameGenerationPlan(...)
     <- StylePack.formBias
  -> GeneratedName
```

Owners: `src/naming/generator.ts` and `src/engine/nameGenerationPlan.ts`.

### Semantic generation

```text
semantic options
  -> generateGivenName / generateFamilyName / generatePlaceName
  -> generateName(...)
  -> GeneratedName
```

Owner: `src/naming`.

### Shared request generation

```text
NameRequest
  -> generateNameResponse(...)
  -> independent generateName(...) calls
  -> NameArtifact[]
  -> NameResponse
```

Owner: `src/engine/nameResponse.ts`.

### Fiction Cast generation

```text
FictionCastSettings
  -> generateEnsemble(...)
  -> semantic given/family/place callbacks
  -> FictionCastGeneratedEnsemble
```

Owner: `src/fictionCast/ensemble.ts`.

### Artifact mapping

```text
GeneratedName
  -> toNameArtifact(...)
  -> NameArtifact
```

Owner: `src/engine/nameArtifact.ts`.

### Shared history

```text
NameArtifact
  -> addNameHistoryEntries(...)
  -> browser storage
```

Owner: `src/engine/nameHistory.ts`.

## Durable invariants

- `GeneratedName.name === GeneratedName.spelling.text`.
- `StylePack.formBias` supplies coarse causal planning pressure rather than a completed-name score.
- `GeneratedName.generationPlan` is the plan evidence for that singular generation.
- generic `NameScores` contain intrinsic name scores and no form/plan-conformance metric.
- `NameArtifact.spelling.text` is the artifact's generated text.
- `NameArtifact.generationPlan` retains the singular generation plan evidence.
- `generateName(...)` receives one seed and owns its internal RNG partitioning.
- given, family, and place semantic callbacks delegate to `generateName(...)`.
- Fiction Cast composition, roles, rarity, contextual scoring, audition, export, and future history remain surface-owned.
- Fiction Cast role fit may use generation-plan evidence as surface-contextual evaluation.
- generated components of a composed identity retain their own generation evidence.
- shared artifact analysis consumes singular evidence; surface adapters preserve surface addressability where needed.
