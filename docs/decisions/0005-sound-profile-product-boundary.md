# Decision 0005: Sound profile, style compilation, and product semantics boundary

## Status

Accepted for the current migration slice. Reusable semantic name generators and a reusable compound-name API remain explicitly incremental follow-ups.

## Context

Fiction Cast can display identities containing semantically different parts: given names, family names, place names, titles, epithets, initials, and literals. The low-level sound generator operates on a much smaller contract: one `SoundProfile` plus seeded randomness produces one `SoundCandidate`, which can then project to spelling candidates.

Earlier composition code allowed Fiction Cast meaning to leak into that contract. `SoundProfile` carried a `fiction-cast` job tag and title/epithet lexemes even though `generateSound()` did not use either. Component labels such as `given`, `family`, and `place` also lived under the engine namespace even though they describe product meaning rather than phonological behavior.

At the same time, the existing `compileStyle()` function represents a useful boundary of its own. A product or reusable naming capability may express intent in a strongly typed style language, while a compiler translates that language into the neutral mechanical `SoundProfile` consumed by sound generation. Different naming capabilities should be free to use different style input types without teaching the sound generator about those domains.

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

This slice moves ownership of those grammars to the Fiction Cast domain while preserving their behavior exactly.

This decision does **not** introduce a reusable `generateCompoundName` API. Compound-name generation may later become a reusable composition capability, but it requires its own contract.

### 3. Style compilation is a complementary system to sound generation

Style expresses aesthetic intent. A style compiler translates one strongly typed style language into a fully resolved `SoundProfile`.

The generic seam is intentionally small:

```ts
interface StyleCompiler<Style> {
  compile(style: Style): SoundProfile;
}
```

The input type is generic. There is no universal union of every future given-name, place-name, baby-name, pen-name, NPC-name, or other product style. Each semantic naming capability may own the style language that is useful to it while sharing the same output contract.

The existing `StyleInput` plus `compileStyle()` implementation is the first basic compiler. It is not the canonical style language for every future product.

The current `GenerationSettings` + `NameSilhouette` -> `StyleInput` bridge remains in place for this migration slice. Given, family, and place components intentionally remain behaviorally equivalent apart from their independent generation streams until categorical differences are designed explicitly.

### 4. No first-class Policy abstraction is required yet

Request defaults, constraints, variation, compiler choice, ranking, and similar behavior may be policy-like, but that does not require a `Policy` object or universal policy schema.

A future reusable semantic capability such as `generateBabyName()` may encapsulate that behavior directly. Extract a policy abstraction only if multiple callers later need to configure or replace that behavior independently.

### 5. One generated sound is governed by one resolved SoundProfile

Every sound-backed identity part retains the exact `SoundProfile` used to generate its `SoundCandidate` and selected spelling.

A compound identity does not have one authoritative aggregate profile merely because it has one displayed string. If a phrase contains two independently generated sound-backed parts, it retains two independently resolved profiles.

The current top-level `GeneratedName.soundProfile` field may continue to describe the primary generated component until the app-facing result model is simplified, but it must not be interpreted as describing the full compound identity.

### 6. SoundProfile contains mechanics, not semantic meaning

A `SoundProfile` contains the resolved sound targets and phonotactic preferences needed by generic sound and spelling generation. It does not contain:

- Fiction Cast job/type identifiers;
- `given`, `family`, `place`, or other product semantic labels;
- title or epithet lexicons;
- composition grammar;
- UI state, callbacks, or runtime handles.

`SoundProfile.id` is opaque. Callers must not parse it for style, product, or semantic information. The current implementation keeps it deterministic for stable provenance links, but the identifier format is not a semantic contract.

Compiler provenance may remain attached to a profile, but the `SoundProfile` contract does not restrict compilation to one concrete compiler implementation.

The current short Fiction Cast title and epithet lists remain product-owned lexical data. They may later be replaced by generated semantic capabilities, a provider, or another lexical source without changing the generic sound contract.

### 7. Ownership moves are direct while contracts are unstable

The current codebase does not need compatibility aliases for internal module moves. When ownership changes, callers move to the owning module and the obsolete path is removed.

Compatibility facades should be introduced only when a stable or externally consumed contract creates an actual compatibility requirement.

## Directional architecture

```text
product surface
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
SoundProfile
      |
      v
generateSound(profile, rng)
      |
      v
SoundCandidate
```

Product surfaces may compose semantic naming capabilities from a shared Name Forge API. That direction does not require speculative `generateBabyName()`, `generatePenName()`, or other APIs to be implemented in this slice.

## Consequences

- `generateSound(profile, rng)` remains generic and does not branch on product semantics.
- Style compilation and sound generation have separate contracts and may evolve independently.
- Future given-name, family-name, place-name, baby-name, pen-name, NPC-name, and other capabilities may use distinct typed style languages while compiling to the same `SoundProfile` contract.
- Fiction Cast may evolve given/family/place into genuinely different reusable capabilities without changing the sound engine.
- Lexical epithets and titles remain valid product grammar parts without pretending to be generated sounds.
- Per-part provenance remains the reliable explanation surface for compound identities.
- Fiction Cast ensemble and identity implementation live in the product-domain namespace without compatibility re-exports from the engine namespace.
- Style compilation lives in its own namespace without a compatibility re-export from the engine namespace.

## Deferred decisions

- The concrete style languages and defaults that should distinguish given, family, and place generation.
- When existing semantic component generation should become reusable `generateGivenName()`, `generateFamilyName()`, `generatePlaceName()`, or similar APIs.
- Whether epithets remain lexical, become generated, or support both realizations.
- Whether request-resolution behavior ever warrants a first-class policy abstraction.
- Whether the generic engine should later expose a reusable compound-name or grammar/composition extension.
- Whether `SoundProfile` should eventually be a pure value without identity/compiler provenance fields.
- Whether the current app-facing `GeneratedName` type should split into a primitive generated sound-name result and a composed product identity result.
