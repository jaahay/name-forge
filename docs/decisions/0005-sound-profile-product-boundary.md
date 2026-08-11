# Decision 0005: Sound profile, style compilation, and product semantics boundary

## Status

Accepted and refined through the current migration slice. Reusable semantic name generators and a reusable compound-name API remain incremental follow-ups.

## Context

Fiction Cast can display identities containing semantically different parts: given names, family names, place names, titles, epithets, initials, and literals. The low-level sound generator operates on a much smaller contract: one `SoundProfile` plus seeded randomness produces one `SoundCandidate`, which can then project to spelling candidates.

Earlier composition code allowed Fiction Cast meaning to leak into that contract. `SoundProfile` carried a `fiction-cast` job tag and title/epithet lexemes even though `generateSound()` did not use either. Component labels such as `given`, `family`, and `place` also lived under the engine namespace even though they describe product meaning rather than phonological behavior.

The first boundary extraction separated Fiction Cast semantics and grammar from sound generation and established `StyleCompiler<Style>` as a complementary abstraction. A further refinement showed that profile identity and compiler provenance were also unnecessary for sound mechanics: the exact resolved `SoundProfile` value can be retained directly as provenance. The same reasoning applies to nested sound, sequence, and spelling values: they do not need identities merely so adjacent values can point back at them.

The current name orchestration also compiles style, selects spelling, scores names, and generates variants. That orchestration belongs above the low-level sound engine rather than inside it.

## Decision

### 1. Semantics belong above the sound engine

`given`, `family`, `place`, `epithet`, `title`, `initial`, and literal roles describe what a product-level identity part means. They are not primitives of generic sound generation.

Fiction Cast owns the semantic categories it currently uses. Future reusable naming capabilities may expose operations such as `generateGivenName()` or `generatePlaceName()` without requiring those meanings to become sound-engine concepts.

### 2. Grammars belong to product or semantic composition

A grammar decides which semantic parts make up an identity and how those parts are arranged.

The current Fiction Cast grammars remain:

```text
given-only      := given
given-family    := given family
initials-family := initials family
title-name      := title given
epithet-place   := given epithet "of" place
```

Fiction Cast owns those grammars. This decision does **not** introduce a reusable `generateCompoundName` API. Compound-name generation may later become a reusable composition capability, but it requires its own contract.

### 3. Style compilation is complementary to sound generation

Style expresses aesthetic intent. A style compiler translates one strongly typed style language into a fully resolved `SoundProfile`.

The generic seam is intentionally small:

```ts
interface StyleCompiler<Style> {
  compile(style: Style): SoundProfile;
}
```

The input type is generic. There is no universal union of every future given-name, place-name, baby-name, pen-name, NPC-name, or other product style. Each semantic naming capability may own the style language useful to it while sharing the same output type.

The existing `StyleInput` plus `compileStyle()` implementation is the first basic compiler. It is not the canonical style language for every future product.

The current `GenerationSettings` + `NameSilhouette` -> `StyleInput` bridge remains a transitional naming-layer concern. Given, family, and place components intentionally remain behaviorally equivalent apart from independent generation streams until categorical differences are designed explicitly.

### 4. No first-class Policy abstraction is required yet

Request defaults, constraints, variation, compiler choice, ranking, and similar behavior may be policy-like, but that does not require a `Policy` object or universal policy schema.

A future reusable semantic capability such as `generateBabyName()` may encapsulate that behavior directly. Extract a policy abstraction only if multiple callers later need to configure or replace that behavior independently.

### 5. SoundProfile is a pure resolved mechanics value

A `SoundProfile` contains only the resolved sound targets and phonotactic preferences needed by generic sound and spelling generation. It is a value, not an entity or serialization envelope.

A `SoundProfile` therefore has no:

- profile id;
- contract/version tags required by generation;
- compiler/source provenance;
- Fiction Cast job/type identifier;
- `given`, `family`, `place`, or other product semantic label;
- title or epithet lexicon;
- composition grammar;
- UI state, callbacks, caches, or runtime handles.

`generateSound(profile, rng)` consumes this value directly. Different compilers may produce structurally equal profiles without requiring shared identity infrastructure.

### 6. Generation provenance is containment, not relational identity

Every sound-backed identity part retains the exact `SoundProfile`, `SoundCandidate`, and selected spelling used for that part.

The containing generation result establishes their relationship. `SoundCandidate`, `SegmentSequence`, and spelling candidates do not need ids or cross-link fields merely to reconstruct that relationship. Validation checks their contained structure where consistency matters.

This does not prohibit identity at product or artifact boundaries. A `GeneratedName`, cast slot, lock, identity part, or persisted product artifact may have an id because callers need to address that thing independently. Internal generation values do not acquire identity solely for bookkeeping.

A compound identity does not have one authoritative aggregate profile merely because it has one displayed string. If a phrase contains two independently generated sound-backed parts, it retains two independently resolved profile values.

The current top-level `GeneratedName.soundProfile` field may continue to describe the primary generated component until the app-facing result model is simplified, but it must not be interpreted as describing the full compound identity.

### 7. Name orchestration belongs above the low-level engine

The low-level engine owns sound and spelling mechanics. It does not decide how `GenerationSettings` or a `NameSilhouette` become a style input.

Current name orchestration lives under `src/naming` and may:

- translate current settings/silhouette inputs into the basic typed style language;
- invoke style compilation;
- call `generateSound(profile, rng)`;
- project and rank spelling candidates;
- select a spelling;
- score the selected name and generate app-facing variants/diagnostics.

Fiction Cast and the shared Name Response adapter consume this naming layer. This is a migration/orchestration layer, not a declaration that its current settings-and-silhouette API is the final reusable semantic naming API.

### 8. Ownership moves are direct while contracts are unstable

The current codebase does not need compatibility aliases for internal module moves. When ownership changes, callers move to the owning module and the obsolete path is removed.

Compatibility facades should be introduced only when a stable or externally consumed contract creates an actual compatibility requirement.

## Directional architecture

```text
product surface / request adapter
            |
            v
reusable semantic naming capability
            |
            v
strongly typed style
            |
            v
StyleCompiler<Style>
            |
            v
pure SoundProfile value
            |
            v
generateSound(profile, rng)
            |
            v
SoundCandidate -> spelling mechanics
```

The current `src/naming` orchestration is the transitional implementation connecting existing settings/silhouettes to that direction. Product surfaces may eventually compose semantic naming capabilities from a shared Name Forge API without requiring speculative `generateBabyName()`, `generatePenName()`, or other APIs to be implemented now.

## Consequences

- `generateSound(profile, rng)` remains generic and does not branch on product semantics.
- Style compilation, naming orchestration, and sound generation have separate responsibilities and may evolve independently.
- `SoundProfile` can be compared, retained, and passed by value without identity infrastructure.
- Nested sound/sequence/spelling values are related through containment rather than synthetic ids and joins.
- Future given-name, family-name, place-name, baby-name, pen-name, NPC-name, and other capabilities may use distinct typed style languages while compiling to the same `SoundProfile` type.
- Fiction Cast may evolve given/family/place into genuinely different reusable capabilities without changing the sound engine.
- Lexical epithets and titles remain valid product grammar parts without pretending to be generated sounds.
- Fiction Cast ensemble and identity implementation live in the product-domain namespace.
- Style compilation lives in its own namespace.
- Current settings/silhouette-to-style translation lives in the naming layer rather than the sound engine.

## Deferred decisions

- The concrete style languages and defaults that should distinguish given, family, and place generation.
- When existing semantic component generation should become reusable `generateGivenName()`, `generateFamilyName()`, `generatePlaceName()`, or similar APIs.
- Whether epithets remain lexical, become generated, or support both realizations.
- Whether request-resolution behavior ever warrants a first-class policy abstraction.
- Whether the generic system should later expose a reusable compound-name or grammar/composition extension.
- Whether the current app-facing `GeneratedName` type should split into a primitive generated sound-name result and a composed product identity result.
