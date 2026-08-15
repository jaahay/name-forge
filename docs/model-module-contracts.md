# Model and Module Contracts

This document describes the current Name Forge models and module seams as executable contracts. It reflects the implemented singular naming API, the implemented given/family/place semantic callback layer, and the explicit boundary between singular generated names and composed product identities.

For active product scope see [`current-product-scope.md`](current-product-scope.md). For architectural ownership see [`architecture.md`](architecture.md), [`decisions/0001-name-artifact-and-request-contract.md`](decisions/0001-name-artifact-and-request-contract.md), [`decisions/0005-sound-profile-product-boundary.md`](decisions/0005-sound-profile-product-boundary.md), and [`decisions/0006-naming-capabilities-and-surface-composition.md`](decisions/0006-naming-capabilities-and-surface-composition.md).

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

The implemented generated-name API hierarchy is:

```text
surface-specific aggregate orchestration, when needed
  -> reusable typed semantic `-Name` callback(s)
     generateGivenName(...)   [implemented]
     generateFamilyName(...)  [implemented]
     generatePlaceName(...)   [implemented]
  -> generic singular generateName(...)
  -> typed style / sound / spelling mechanics
```

`NameRequest` provides shared criteria, deterministic replay, exact independent quantity, and artifact transport. Semantic `-Name` callbacks provide reusable domain meaning. A surface composes semantic callbacks and injects configuration derived from its UX. Surface-specific multi-name orchestration may remain surface-owned when its cross-name semantics are not reusable.

Every semantic `-Name` callback delegates lexical-name generation to the one `generateName(...)` primitive. Distinct sound-generation mechanics are not required for first-class semantic treatment: family/place currently remain behavior-equivalent where no supported heuristic distinguishes them while still providing typed semantic boundaries and future specialization points.

`NameSilhouette` and silhouette-shaped generator entry points are no longer part of the naming API. The legacy `silhouette` property remains compatibility evidence on singular generated names and generated-name artifacts.

Finite lexical values follow a separate accepted capability direction:

```text
NamingLexicon / LexicalInventory
  -> semantic selector
  -> selectFromOptions(...)
```

That direction is not yet a shared runtime module contract. Heterogeneous identity composition likewise does not establish a universal `NameSegment` contract or omnibus `generatePersonName(...)` API.

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

The generic request adapter currently emits `GeneratedNameArtifact` values because the shared request does not assert a product composition grammar or semantic name kind.

### `NameArtifact`

`NameArtifact` is the durable result unit shared by product surfaces. It is explicitly discriminated:

```ts
type NameArtifact = GeneratedNameArtifact | ComposedNameArtifact;
```

`GeneratedNameArtifact` has `kind: "generated-name"`. It carries one singular result's exact sound profile, sound candidate, selected spelling, retained spelling candidates, generation-plan evidence, variants, and readability diagnostics. Its `displayText` is the selected spelling described by that evidence.

`ComposedNameArtifact` has `kind: "composed-identity"`. It carries a materialized `NameIdentity`, optional `IdentityAuditionPhrase`, and readability diagnostics. It does **not** carry one aggregate `soundProfile`, `sound`, `spelling`, `spellingCandidates`, `silhouette`, or `variants` bundle. Generated component provenance remains on the generated identity part that owns it.

An independent-set response remains a collection of individually addressable artifacts. Grouping does not replace artifacts with one aggregate name-set entity.

Fiction Cast role/influence, contextual scoring, and rarity are surface result metadata rather than durable shared artifact fields.

Legacy browser-history v1 records are normalized on read. Coherent singular records become explicit generated-name artifacts. Valid legacy composed records become composed-identity artifacts while ambiguous aggregate primitive evidence is discarded; existing per-component identity provenance is retained.

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

It does not currently model cohesion/diversity optimization, ranked alternatives, generic semantic slots, per-slot criteria, aggregate diagnostics, partial-result recovery, generic child replacement semantics, or shared group-level product presentation.

Fiction Cast ensemble behavior is surface-specific and does not imply those capabilities should exist in shared grouping.

## Current model inventory

### Shared request and configuration models

| Model | Owner | Meaning |
| --- | --- | --- |
| `NameRequest` | `src/engine/nameRequest.ts` | Shared request/transport input with optional exact quantity/grouping; not the semantic callback hierarchy. |
| `ResolvedNameRequest` | `src/engine/nameRequest.ts` | Normalized request with explicit quantity/grouping and parent seed. |
| `NameResponse` | `src/engine/nameRequest.ts` | Flat ordered artifacts plus grouping/randomization metadata. |
| `NameGroupMetadata` | `src/engine/nameRequest.ts` | Parent/child seed metadata for the current independent set. |
| `NameCriteria` | `src/engine/nameCriteria.ts` | Shared structured request-intent model. |
| `NameGenerationSettings` | `src/engine/types.ts` | Narrow generic one-name settings consumed by `generateName(...)`; excludes surface-only metadata. |
| `GenerationSettings` | `src/engine/types.ts` | Shared generic orchestration settings: `NameGenerationSettings` plus `stylePackId` and `seed`; contains no Fiction Cast-only settings. |
| `NameGenerationPlanPreferences` | `src/engine/types.ts` | Generic resolved causal planning pressure for syllable/texture preferences without product roles, rarity labels, or semantic name-kind labels. |
| `NameGenerationPlan` | `src/engine/types.ts` | Internal pre-generation planning/scoring evidence materialized behind `generateName(...)`. |
| `SemanticNameOptions` | `src/naming/semanticName.ts` | Shared semantic-callback facade: `GenerationSettings`, registry, deterministic seed material/result index, and typed semantic preferences. |
| `SemanticNameDeterminism` | `src/naming/semanticName.ts` | Reusable planning/generation seed material plus result addressability; callers do not construct naming-layer RNG objects. |
| `SemanticNamePreferences` | `src/naming/semanticName.ts` | Shared semantic preference vocabulary translated internally into generic planning representation, including optional novelty offset. |
| `GenerateGivenNameOptions` / `GivenNamePreferences` | `src/naming/givenName.ts` | Given-name semantic aliases over the shared semantic invocation boundary. |
| `GenerateFamilyNameOptions` / `FamilyNamePreferences` | `src/naming/familyName.ts` | Family-name semantic aliases over the shared semantic invocation boundary. |
| `GeneratePlaceNameOptions` / `PlaceNamePreferences` | `src/naming/placeName.ts` | Place-name semantic aliases over the shared semantic invocation boundary. |
| `StyleInput` | `src/styleCompilation/styleCompiler.ts` | Current typed style language compiled into `SoundProfile`. |
| `StylePack` | `src/engine/types.ts` / `src/data/stylePacks.ts` | Built-in style/source data used by current product flows. |

Accepted but not yet implemented shared contracts remain limited to the finite lexical-inventory direction:

- a typed naming-lexicon / lexical-inventory contract for bounded lexical option data with declared provenance and relevant linguistic/regional scope;
- a small generic deterministic `selectFromOptions(...)`-style primitive, with semantic selectors owning the meaning of their option lists;
- typed semantic `options` facades that may hide granular inventory/source resolution from ordinary callers.

The exact TypeScript names/shapes for those lexical contracts remain future bounded implementation work.

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
| `GeneratedName` | `src/engine/types.ts` + `src/naming/generator.ts` | One singular sound-backed generated name. `name` is exactly its selected spelling; its sound/spelling/plan/variant evidence describes that same singular name. It contains no compound identity. |
| `GeneratedNameArtifact` | `src/engine/nameArtifact.ts` | Durable explicit singular artifact with `kind: "generated-name"` and primitive evidence. |
| `ComposedNameArtifact` | `src/engine/nameArtifact.ts` | Durable explicit composed artifact with `kind: "composed-identity"`, identity/audition/readability, and no aggregate primitive evidence. |
| `NameArtifact` | `src/engine/nameArtifact.ts` | Discriminated union of the two durable artifact kinds. |

Implemented contract direction:

- `src/naming` exposes one generic singular `generateName(...)` lexical-name primitive;
- `generateName(...)` internally materializes `NameGenerationPlan` rather than accepting one from the caller;
- `GenerateNameOptions` contains no product mode, Fiction Cast role, rarity category, or semantic name-kind label;
- `generateGivenName(...)`, `generateFamilyName(...)`, and `generatePlaceName(...)` are implemented semantic callbacks over one shared invocation facade;
- every semantic `-Name` callback delegates lexical-name generation to `generateName(...)`;
- family/place remain mechanically behavior-equivalent where no supported semantic heuristic distinguishes them;
- current `NameGenerationCandidate` remains private implementation structure.

### Fiction Cast semantic models

| Model | Owner | Meaning |
| --- | --- | --- |
| `NameIdentity` | `src/fictionCast/identity.ts` + `src/engine/types.ts` | Materialized Fiction Cast display identity and phrase-part structure. |
| `GeneratedNamePart` | `src/engine/types.ts` | Product-semantic identity part; sound-backed parts may contain exact component generation evidence. It does not establish a universal `NameSegment` contract. |
| `FictionCastSettings` | `src/fictionCast/types.ts` | Fiction Cast settings specialization, including surface-owned cast size, format, role configuration, and rarity distribution. |
| `FictionCastGeneratedName` | `src/fictionCast/types.ts` | Composed Cast result with Cast `id`, `displayName`, `identity`, identity audition, contained singular `primaryName`, readability/context/role/rarity metadata. It is not a subtype of `GeneratedName`. |
| `FictionCastContextualScores` | `src/fictionCast/types.ts` | Role/ensemble/contextual overall evidence owned by Fiction Cast rather than generic scoring. |
| `FictionCastGeneratedEnsemble` | `src/fictionCast/types.ts` + `src/fictionCast/ensemble.ts` | Fiction Cast roster result with surface settings, composed names, and cast diagnostics; separate from shared independent-set grouping. |
| `FictionCastRarityBand` / rarity distribution | `src/fictionCast/rarity.ts` | User/surface classification and deterministic distribution policy; not generic planning or semantic generated-name input. |
| component generation context | `src/fictionCast/componentGenerationContext.ts` | Surface-owned semantic settings context for generated given/family/place components. |
| Cast artifact projections | `src/fictionCast/nameArtifact.ts` | Explicit composed persistence/inspection projection and primary generated-name sound-analysis projection. |

Titles, epithets, given/family/place roles, and Fiction Cast grammar are naming/product semantics. They are not fields of `SoundProfile` and do not enter `GenerateNameOptions` as semantic labels.

Fiction Cast converts role-specific profile preferences into semantic naming preferences and routes primary given plus supporting family/place generation through their corresponding semantic wrappers. It then attaches role metadata, contextual scoring, and rarity in the surface ensemble layer.

A composed Cast result never redefines `primaryName.name`. `displayName` belongs to the product identity. Intrinsic sound, spelling, plan, variants, and intrinsic scores are read from `primaryName`; a generated supporting component's generation evidence is read from its identity part.

`toFictionCastNameArtifact(...)` persists/inspects the composed identity without aggregate primitive evidence. `toFictionCastPrimaryNameArtifact(...)` explicitly projects the singular primary name for same-roster sound relationship analysis while retaining the Cast result ID so relationship navigation addresses the Cast slot.

Cast JSON/Markdown export remains `name-forge.cast.v2`: exported `name` is the composed display identity, while existing sound/silhouette/variant/intrinsic-score fields are compatibility projections from `primaryName`.

Fiction Cast's current title/epithet lexical material remains surface-owned runtime data. The accepted future shared lexical-inventory direction may provide typed storage/selection for reusable finite vocabularies without moving Fiction Cast identity grammar into the generic engine.

### Audition/projection models

| Model | Owner | Meaning |
| --- | --- | --- |
| `AuditionPhonology` | `src/engine/auditionPhonology.ts` | Renderer-neutral presentation derived from `SegmentSequence`. |
| `BrowserAuditionCue` | `src/engine/browserAuditionProjection.ts` | Browser-speech-friendly projection, not canonical pronunciation. |
| `NameAuditionCue` | `src/engine/audition.ts` | Current singular sound-backed name audition composition. |
| `IdentityAuditionPhrase` | `src/engine/identityAudition.ts` | Provenance-preserving phrase projection over a composed identity. |

## Current module seams

### Request resolver

```text
NameRequestInput -> resolveNameRequest -> ResolvedNameRequest + RandomizationResult
```

Owner: `src/engine/nameRequest.ts`.

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
- creating child-local settings;
- deriving separate deterministic planning and generation random streams;
- generating one singular result per child seed through `generateName(...)`;
- mapping each result through `toNameArtifact(...)` to a generated-name artifact;
- returning flat artifacts and positional independent-set metadata.

It does not own semantic callback definitions, richer group optimization, product-specific roster UX, mode semantics, or finite lexical vocabulary selection. It consumes the singular naming primitive directly because the generic request does not assert a semantic name kind.

### Criteria diagnostics and compiler

```text
NameCriteria -> diagnostics
NameCriteria + base settings -> GenerationSettings
```

Owners: `src/engine/nameCriteriaDiagnostics.ts` and `src/engine/nameCriteriaCompiler.ts`.

They own current shared support classification, deterministic mappings, and honest fallback/partial diagnostics. The compiler returns only generic/shared `GenerationSettings` and does not fabricate Fiction Cast defaults.

Supported-target knowledge remains duplicated between the two modules and should be centralized before major shared-criteria expansion.

### Naming orchestration — singular primitive

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

It does **not** own Fiction Cast identity grammar, titles/epithets, cast roles, rarity categories/distribution, ensemble behavior, request quantity/grouping semantics, product modes, semantic name-kind labels, naming lexicons, or low-level sound rules.

Planning and generation RNGs remain explicit at this lower primitive. Ordinary semantic callers do not construct them directly; the semantic invocation layer owns that translation from stable deterministic seed material.

### Semantic naming callbacks — implemented layer

```text
GenerationSettings + SourceRegistry
+ SemanticNameDeterminism
+ semantic preferences
  -> semantic `-Name` callback
  -> generateSemanticName(...)
  -> generateName(...)
  -> GeneratedName
```

Owners: `src/naming/semanticName.ts`, `src/naming/givenName.ts`, `src/naming/familyName.ts`, and `src/naming/placeName.ts`.

The shared semantic layer owns style-pack lookup, `GenerationSettings -> NameGenerationSettings` narrowing, seeded RNG construction, novelty-offset translation, and semantic-preference translation into generic planning preferences.

Current callbacks:

- `generateGivenName(...)`;
- `generateFamilyName(...)`;
- `generatePlaceName(...)`.

All delegate to the single `generateName(...)` primitive. No semantic callback duplicates sound/spelling mechanics or carries Fiction Cast role semantics downward.

### Finite lexical inventory and selection — accepted, not yet implemented as shared runtime

Conceptual contract:

```text
typed NamingLexicon / LexicalInventory
  -> semantic selector
  -> selectFromOptions(...)
  -> selected lexical value
```

The generic finite-choice primitive should own deterministic selection only. Semantic selectors own the meaning of their option set. The persisted inventory owns the actual vocabulary plus declared provenance/scope.

Derived forms such as patronymics may need dedicated derivation mechanics rather than either finite selection or `generateName(...)`.

### Internal generation-plan materialization

```text
NameGenerationSettings
+ optional NameGenerationPlanPreferences
+ StylePack
+ planning SeededRandom
+ index
  -> NameGenerationPlan
```

Owner: `src/engine/silhouettes.ts` (legacy filename).

`NameGenerationPlan` is internal mechanics/evidence. Generic planning preferences may adjust syllable-count and texture pressures without carrying a product role, role-influence record, rarity category, or semantic name-kind label into the naming primitive.

For deterministic compatibility, the implementation currently consumes the historical planning RNG position where generic rarity selection used to occur before issue #196. That compatibility draw is tracked separately and does not restore rarity as a generic model field.

### Sound generator

```text
SoundProfile + SeededRandom -> SoundCandidate
```

Owner: `src/engine/soundGenerator.ts`.

Collection semantics:

- `SegmentSequence.segments` is source-order;
- `SegmentSequence.syllables` is source-order.

The generator consumes the pure resolved profile value and does not branch on semantic name kind, Fiction Cast roles, rarity categories, lexical vocabularies, or product modes.

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

### Name artifact mapping and migration

```text
GeneratedName -> toNameArtifact -> GeneratedNameArtifact
legacy persisted artifact -> migrateLegacyNameArtifact -> NameArtifact | undefined
```

Owner: `src/engine/nameArtifact.ts`.

`toNameArtifact(...)` preserves singular generated facts and cannot create a composed identity. `migrateLegacyNameArtifact(...)` is the explicit compatibility boundary for older durable records; it does not add identity fields back to `GeneratedName`.

### Fiction Cast identity, artifacts, and ensemble

`src/fictionCast/identity.ts` owns the Fiction Cast identity grammar and materialization. Sound-backed given/family/place parts retain the exact `SoundProfile`, `SoundCandidate`, and selected spelling used for that component. Titles, epithets, initials, and literals remain explicit product semantics.

`src/fictionCast/ensemble.ts` owns surface-specific ensemble selection and roster behavior. It resolves Cast role preferences above semantic naming callbacks, composes generated/lexical/literal parts into `FictionCastGeneratedName`, attaches contextual scoring and rarity, and never overwrites the contained primitive `primaryName`.

`src/fictionCast/nameArtifact.ts` owns the two explicit Cast projections:

- composed identity -> `ComposedNameArtifact` for history and inspection;
- primary singular name -> `GeneratedNameArtifact` with the Cast result ID for sound-relationship navigation.

`src/fictionCast/export.ts` owns Cast JSON/Markdown serialization and its `name-forge.cast.v2` compatibility projection.

### Browser history

```text
serialized history v1
  -> parseNameHistory
  -> migrateLegacyNameArtifact per entry
  -> current NameHistoryEnvelopeV1
```

Owner: `src/engine/nameHistory.ts`.

The storage key and envelope version remain stable. Persistence is best-effort. Malformed or unsupported records are rejected, and legacy ambiguous composed records are normalized rather than treated as current coherent primitive artifacts.

### Audition and inspection

- `src/engine/auditionPhonology.ts` derives renderer-neutral sound presentation.
- `src/engine/browserAuditionProjection.ts` derives browser voice-draft cues.
- `src/engine/audition.ts` composes the singular sound-backed UI cue.
- `src/engine/identityAudition.ts` projects materialized identity phrase parts while preserving contained generation evidence.
- `src/ui/NameArtifactInspector.tsx` branches on artifact kind: singular artifacts expose primitive sound/spelling evidence; composed artifacts expose component-owned modeled sound and the composed display identity.
- `src/ui/NameInspector.tsx` adapts the composed Cast result into the shared artifact inspector while keeping Cast context/scoring as surface-owned detail.

Browser pause/chunking policy is presentation behavior, not durable phonology or a provider-neutral audio contract.

## Durable invariants

- `GeneratedName.name === GeneratedName.spelling.text` for the singular result it describes.
- `GeneratedName` carries no compound identity or Cast metadata.
- A composed product display is not allowed to imply one aggregate `SoundProfile`, spelling, generation plan, variant set, or intrinsic score bundle.
- Generated identity parts retain their own exact generation evidence through containment.
- `NameArtifact.kind` determines whether primitive evidence or composition evidence is valid; the two shapes are mutually exclusive at the durable boundary.
- `generateGivenName(...)`, `generateFamilyName(...)`, and `generatePlaceName(...)` all delegate lexical-name generation to `generateName(...)`.
- Fiction Cast role, rarity, contextual score, identity grammar, and ensemble behavior remain above generic naming mechanics.
- The shared request adapter may call `generateName(...)` directly because `NameRequest` does not assert a semantic name kind.
- Generic `independent-set` grouping does not subsume surface-specific aggregate orchestration.
- No universal `NameSegment`, universal compound grammar, or omnibus `generatePersonName(...)` contract is implied by the current composed identity model.
