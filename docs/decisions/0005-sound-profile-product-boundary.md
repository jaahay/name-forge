# Decision 0005: Sound profile and product semantics boundary

## Status

Accepted for the current migration slice. A reusable compound-name API remains explicitly undecided.

## Context

Fiction Cast currently generates names whose displayed identity can contain several semantically different parts: given names, family names, place names, titles, epithets, initials, and literals. The low-level sound generator, however, already operates on a much smaller contract: one `SoundProfile` plus seeded randomness produces one `SoundCandidate`, which can then project to spelling candidates.

Earlier composition code allowed Fiction Cast semantics to leak into the sound contract. `SoundProfile` carried a `fiction-cast` job tag and title/epithet lexemes even though `generateSound()` did not use either. Component labels such as `given`, `family`, and `place` also lived under the engine namespace even though they describe product meaning rather than phonological behavior.

That coupling makes it harder to treat given-name, family-name, and place-name generation as independently configurable product experiences. It also obscures the useful invariant that each generated sound should be explainable by one exact resolved profile.

## Decision

### 1. Semantics belong to the product domain

`given`, `family`, `place`, `epithet`, `title`, `initial`, and literal roles describe what an identity part means in a Name Forge product. They are not primitives of the generic sound generator.

Fiction Cast owns the semantic categories it currently uses. Other future products may use different categories without extending the generic sound engine.

### 2. Grammars belong to the product domain

A product grammar decides which semantic parts make up an identity and how those parts are arranged.

The current Fiction Cast grammars remain:

```text
given-only     := given
given-family   := given family
initials-family := initials family
title-name     := title given
epithet-place  := given epithet "of" place
```

This slice moves ownership of those grammars to the Fiction Cast domain while preserving their behavior exactly.

This decision does **not** introduce a reusable `generateCompoundName` API. Compound-name generation may later become a first-class engine extension, but that requires its own contract and should not be inferred from the current Fiction Cast formats.

### 3. Product policy resolves to a standalone SoundProfile

Product policy expresses reusable preferences or defaults for a semantic naming experience. A resolved `SoundProfile` is the complete executable sound specification for one concrete generated sound.

The directional invariant is:

```text
product policy / settings
        +
per-generation variation
        ↓
resolved SoundProfile
        ↓
generic sound generation
        ↓
SoundCandidate
        ↓
spelling projection
```

A product may maintain categorically different given-name, family-name, and place-name policies. The generic generator does not need to know which policy produced the profile.

The current `GenerationSettings -> StyleInput -> SoundProfile` bridge remains in place for now. Moving all profile resolution into explicit product policy is a later slice.

### 4. One generated sound owns one resolved SoundProfile

Every sound-backed identity part retains the exact `SoundProfile` used to generate its `SoundCandidate` and spelling.

A compound identity does not have one authoritative aggregate `SoundProfile` merely because it has one displayed string. If a phrase contains two independently generated sound-backed parts, it retains two independently resolved profiles.

Top-level legacy `GeneratedName.soundProfile` fields may continue to describe the primary generated component until the app-facing result model is simplified, but they must not be interpreted as describing the full compound identity.

### 5. SoundProfile contains sound-generation data, not product meaning

A `SoundProfile` must be sufficient to drive generic sound and spelling generation without knowing the intended semantic category.

It therefore contains sound targets and phonotactic preferences, but does not contain:

- Fiction Cast job/type identifiers;
- `given`, `family`, `place`, or other product semantic labels;
- title or epithet lexicons;
- composition grammar;
- UI state, callbacks, or runtime handles.

The current short Fiction Cast title and epithet lists remain product-owned lexical data. They may later be replaced by generated sound-backed experiences, a provider, or another lexical source without changing the generic `SoundProfile` contract.

## Consequences

- `generateSound(profile, rng)` remains a generic primitive and does not branch on product semantics.
- Fiction Cast may evolve given/family/place into genuinely different experiences while compiling all of them to the same generic profile contract.
- Lexical epithets and titles remain valid product grammar parts without pretending to be generated sounds.
- Per-part provenance becomes the reliable explanation surface for compound identities.
- The current Fiction Cast ensemble and identity implementation can move into a product-domain namespace without requiring a speculative generic compound-name abstraction.

## Deferred decisions

- Whether `given`, `family`, and `place` should share one policy schema or become three different product-policy contracts.
- The concrete defaults that should make those three experiences categorically different.
- Whether epithets remain lexical, become generated, or support both realizations.
- Whether the generic engine should later expose `generateCompoundName` or another grammar/composition extension.
- Whether the legacy app-facing `GeneratedName` type should split into a primitive generated sound-name result and a composed product identity result.
