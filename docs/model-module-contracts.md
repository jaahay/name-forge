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

`NameRequest` provides shared criteria, deterministic replay, exact independent quantity, and singular artifact transport. Semantic `-Name` callbacks provide reusable domain meaning. A surface composes semantic callbacks and injects configuration derived from its UX. Surface-specific multi-name orchestration may remain surface-owned when its cross-name semantics are not reusable.

Every semantic `-Name` callback delegates lexical-name generation to the one `generateName(...)` primitive. Distinct sound-generation mechanics are not required for first-class semantic treatment: family/place currently remain behavior-equivalent where no supported heuristic distinguishes them while still providing typed semantic boundaries and future specialization points.

`NameSilhouette` and silhouette-shaped generator entry points are no longer part of the naming API. The legacy `silhouette` property remains compatibility evidence on singular generated names and `NameArtifact` values.

Finite lexical values follow a separate accepted capability direction:

```text
NamingLexicon / LexicalInventory
  -> semantic selector
  -> selectFromOptions(...)
```

That direction is not yet a shared runtime module contract. Heterogeneous identity composition likewise does not establish a universal `NameSegment` contract, universal compound artifact, or omnibus `generatePersonName(...)` API.

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

- `names` is a flat singular-artifact array in deterministic generation order;
- `names.length` equals resolved exact quantity;
- `grouping.childSeeds.length` equals `names.length`;
- `grouping.childSeeds[index]` generated `names[index]`;
- index 0 uses the parent seed, preserving the previous singular stream;
- later indexes use deterministic child seeds;
- increasing quantity preserves the existing result prefix;
- diagnostics report support/fallback truthfully and are not public fit scores.

The generic request adapter emits singular `NameArtifact` values because the shared request does not assert a product composition grammar or semantic name kind.

### `NameArtifact`

`NameArtifact` is the durable shared evidence record for exactly one sound-backed generated name:

```ts
type NameArtifact = {
  readonly id: string;
  readonly displayText: string;
  readonly soundProfile: SoundProfile;
  readonly sound: SoundCandidate;
  readonly spelling: RankedSpellingCandidate;
  readonly spellingCandidates: readonly RankedSpellingCandidate[];
  readonly silhouette: NameGenerationPlan;
  readonly variants: readonly NameVariant[];
  readonly readabilityDiagnostics: readonly ReadabilityDiagnostic[];
};
```

Contract:

- `displayText` is exactly the selected spelling represented by `spelling`;
- contained sound/spelling evidence must be structurally coherent;
- the selected spelling must be present among retained spelling candidates;
- the artifact has no composition discriminator, `NameIdentity`, identity audition, Fiction Cast role/influence, contextual scoring, or rarity fields;
- runtime validation rejects composition fields rather than interpreting them as extensions.

An independent-set response remains a collection of individually addressable singular artifacts. Grouping does not replace artifacts with one aggregate name-set entity.

A surface-composed identity is a separate result. Shared persistence, analysis, or inspection may project one generated component into `NameArtifact`, but that projection does not become aggregate evidence for the entire composed display.

Browser history validates the current singular artifact shape. Older malformed, unsupported, or composition-shaped records are dropped rather than migrated into a broader shared artifact type.

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
| `NameResponse` | `src/engine/nameRequest.ts` | Flat ordered singular artifacts plus grouping/randomization metadata. |
| `NameGroupMetadata` | `src/engine/nameRequest.ts` | Parent/child seed metadata for the current independent set. |
| `NameCriteria` | `src/engine/nameCriteria.ts` | Shared structured request-intent model. |
| `NameGenerationSettings` | `src/engine/types.ts` | Narrow generic one-name settings consumed by `generateName(...)`; excludes surface-only metadata. |
| `GenerationSettings` | `src/engine/types.ts` | Shared generic orchestration settings: `NameGenerationSettings` plus `stylePackId` and `seed`; contains no Fiction Cast-only settings. |
| `NameGenerationPlanPreferences` | `src/engine/types.ts` | Generic resolved causal planning pressure for syllable/texture preferences without product roles, rarity labels, or semantic name-kind labels. |
| `NameGenerationPlan` | `src/engine/types.ts` | Internal pre-generation planning/scoring evidence materialized behind `generateName(...)`. |
| `SemanticNameOptions` | `src/naming/semanticName.ts` | Shared semantic-callback facade: `GenerationSettings`, registry, one deterministic seed/result index, and typed semantic preferences. |
| `SemanticNameDeterminism` | `src/naming/semanticName.ts` | `{ seed, resultIndex }`; stable causal seed material plus result addressability. |
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
| `GenerateNameOptions` | `src/naming/generator.ts` | Generic singular orchestration input: settings, pack, one deterministic seed, index, and optional generic planning settings/preferences. |
| `NameGenerationCandidate` | `src/naming/generator.ts` | Private pre-materialization result containing exact profile, sound, ranked spellings, and selected spelling. |
| `GeneratedName` | `src/engine/types.ts` + `src/naming/generator.ts` | One singular sound-backed generated name. `name` is exactly its selected spelling; its sound/spelling/plan/variant evidence describes that same singular name. It contains no compound identity. |
| `NameArtifact` | `src/engine/nameArtifact.ts` | Durable singular generated-name evidence. It contains no product-composition discriminator or identity fields. |

Implemented contract direction:

- `src/naming` exposes one generic singular `generateName(...)` lexical-name primitive;
- `generateName(...)` accepts one seed and derives its planning/generation RNG streams internally;
- `generateName(...)` internally materializes `NameGenerationPlan` rather than accepting one from the caller;
- `GenerateNameOptions` contains no RNG objects, product mode, Fiction Cast role, rarity category, or semantic name-kind label;
- identical explicit `generateName(...)` arguments replay the same full `GeneratedName`;
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
| `toFictionCastPrimaryNameArtifact(...)` | `src/fictionCast/nameArtifact.ts` | Projects only `primaryName` evidence while retaining the Cast result ID for inspector/relationship addressability. |

Titles, epithets, given/family/place roles, and Fiction Cast grammar are naming/product semantics. They are not fields of `SoundProfile` and do not enter `GenerateNameOptions` as semantic labels.

Fiction Cast converts role-specific profile preferences into semantic naming preferences and routes primary given plus supporting family/place generation through their corresponding semantic wrappers. It then attaches role metadata, contextual scoring, and rarity in the surface ensemble layer.

A composed Cast result never redefines `primaryName.name`. `displayName` belongs to the product identity. Intrinsic sound, spelling, plan, variants, and intrinsic scores are read from `primaryName`; a generated supporting component's generation evidence is read from its identity part.

Shared history records `toNameArtifact(primaryName)` for normal Cast generation and targeted reroll. `toFictionCastPrimaryNameArtifact(...)` is not a composed persistence format: it preserves the Cast result ID while exposing only primary singular evidence for relationship navigation and selected-name inspector addressability.

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
- passing each child seed directly to `generateName(...)`;
- generating one singular result per child seed;
- mapping each result through `toNameArtifact(...)`;
- returning flat singular artifacts and positional independent-set metadata.

It does not construct planning/generation RNG objects; `generateName(...)` owns deterministic partitioning of the child seed. It also does not own semantic callback definitions, richer group optimization, product-specific roster UX, mode semantics, or finite lexical vocabulary selection. It consumes the singular naming primitive directly because the generic request does not assert a semantic name kind.

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
GenerateNameOptions { settings, pack, seed, index, ... }
  -> generateName(...)
  -> seed -> internal planning/generation RNG streams
  -> internal NameGenerationPlan
  -> StyleInput
  -> SoundProfile
  -> SoundCandidate
  -> ranked spelling candidates
  -> GeneratedName
```

Owner: `src/naming/generator.ts`.

Owns generic one-name orchestration: deterministic stream partitioning, internal generation-plan materialization, style compilation, sound generation, spelling pool/ranking/selection, scoring, variants, and readability diagnostics.

It does **not** own Fiction Cast identity grammar, titles/epithets, cast roles, rarity categories/distribution, ensemble behavior, request quantity/grouping semantics, product modes, semantic name-kind labels, naming lexicons, or low-level sound rules.

Callers provide one immutable seed. Planning and generation RNG objects are internal implementation details of this boundary rather than caller-supplied causal arguments.

### Semantic naming callbacks — implemented layer

```text
GenerationSettings + SourceRegistry
+ SemanticNameDeterminism { seed, resultIndex }
+ semantic preferences
  -> semantic `-Name` callback
  -> generateSemanticName(...)
  -> generateName(...)
  -> GeneratedName
```

Owners: `src/naming/semanticName.ts`, `src/naming/givenName.ts`, `src/naming/familyName.ts`, and `src/naming/placeName.ts`.

The shared semantic layer owns style-pack lookup, `GenerationSettings -> NameGenerationSettings` narrowing, novelty-offset translation, and semantic-preference translation into generic planning preferences. It passes one seed and result index to `generateName(...)`; it does not construct the primitive's RNG objects.

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

### Name artifact mapping

```text
GeneratedName -> toNameArtifact -> NameArtifact
unknown persisted value -> isNameArtifact -> NameArtifact | false
```

Owner: `src/engine/nameArtifact.ts`.

`toNameArtifact(...)` preserves one singular generated name's exact facts. `isNameArtifact(...)` validates that singular shape and explicitly rejects composition/discriminator fields. There is no shared composed-artifact constructor or legacy composition migration.

### Fiction Cast identity, artifact projection, and ensemble

`src/fictionCast/identity.ts` owns the Fiction Cast identity grammar and materialization. Sound-backed given/family/place parts retain the exact `SoundProfile`, `SoundCandidate`, and selected spelling used for that component. Titles, epithets, initials, and literals remain explicit product semantics.

`src/fictionCast/ensemble.ts` owns surface-specific ensemble selection and roster behavior. It resolves Cast role preferences above semantic naming callbacks, composes generated/lexical/literal parts into `FictionCastGeneratedName`, attaches contextual scoring and rarity, and never overwrites the contained primitive `primaryName`.

`src/fictionCast/nameArtifact.ts` owns one narrow projection:

- `FictionCastGeneratedName` -> primary singular `NameArtifact` with the Cast result ID for relationship/inspector navigation.

Normal Cast history persistence does not use that addressability projection; it records `toNameArtifact(primaryName)`. Full composition remains in the Fiction Cast result and export contract.

`src/fictionCast/export.ts` owns Cast JSON/Markdown serialization and its `name-forge.cast.v2` compatibility projection.

### Browser history

```text
serialized history v1
  -> parseNameHistory
  -> validate each singular NameArtifact
  -> current NameHistoryEnvelopeV1
```

Owner: `src/engine/nameHistory.ts`.

The storage key and envelope version remain stable. Persistence is best-effort. Malformed, unsupported, or composition-shaped records are rejected. The history parser does not reinterpret those records into a broader artifact type.

### Audition and inspection

- `src/engine/auditionPhonology.ts` derives renderer-neutral sound presentation.
- `src/engine/browserAuditionProjection.ts` derives browser voice-draft cues.
- `src/engine/audition.ts` composes the singular sound-backed UI cue.
- `src/engine/identityAudition.ts` projects materialized identity phrase parts while preserving contained generation evidence.
- `src/ui/NameArtifactInspector.tsx` renders singular artifact evidence only. A caller may supply its own display text, whole-name voice draft, actions, and secondary surface sections without adding composition semantics to `NameArtifact`.
- `src/ui/NameInspector.tsx` owns Fiction Cast adaptation: composed display, whole-identity voice text, composition/context/scoring, and per-generated-component audition controls remain Cast-owned while primitive sound/spelling evidence comes from the primary-name artifact projection.

Browser pause/chunking policy is presentation behavior, not durable phonology or a provider-neutral audio contract.

## Durable invariants

- `GeneratedName.name === GeneratedName.spelling.text` for the singular result it describes.
- `GeneratedName` carries no compound identity or Cast metadata.
- Identical explicit `generateName(...)` arguments, including seed, reproduce the same full `GeneratedName` under the same engine data/version.
- `generateName(...)` owns its internal planning/generation RNG partitioning; callers do not inject RNG objects through the public singular boundary.
- `NameArtifact.displayText === NameArtifact.spelling.text` and the artifact contains the singular evidence for that same selected spelling.
- `NameArtifact` carries no product-composition discriminator, identity, identity audition, Cast role, rarity, or contextual scoring.
- A composed product display is not allowed to imply one aggregate `SoundProfile`, spelling, generation plan, variant set, or intrinsic score bundle.
- Generated identity parts retain their own exact generation evidence through containment.
- `generateGivenName(...)`, `generateFamilyName(...)`, and `generatePlaceName(...)` all delegate lexical-name generation to `generateName(...)` using one seed plus result addressability.
- Fiction Cast role, rarity, contextual score, identity grammar, component audition, and ensemble behavior remain above generic naming mechanics.
- Fiction Cast history may persist `primaryName` as singular evidence without making the composed result a shared artifact.
- The shared request adapter may call `generateName(...)` directly because `NameRequest` does not assert a semantic name kind.
- Generic `independent-set` grouping does not subsume surface-specific aggregate orchestration.
- No universal `NameSegment`, universal compound grammar/artifact, or omnibus `generatePersonName(...)` contract is implied by the current composed identity model.
