# Name Forge Architecture

Name Forge separates singular name generation from product-surface composition.

The central generation boundary is:

```text
explicit causal inputs
  -> generateName(...)
  -> GeneratedName
```

`generateName(...)` produces one sound-backed lexical name. Product surfaces compose those singular results into the identities, rosters, histories, exports, and presentations their own workflows require.

## Dependency direction

```text
product surface
  -> semantic naming capability
     generateGivenName(...)
     generateFamilyName(...)
     generatePlaceName(...)
  -> generateName(...)
  -> style compilation
  -> SoundProfile
  -> sound generation
  -> spelling generation and selection
  -> GeneratedName
```

A product surface owns its UX, settings, state, composition grammar, aggregate behavior, persistence, and presentation. Semantic naming capabilities translate domain-specific preferences into the generic singular generation boundary. The sound and spelling layers remain reusable mechanics.

Fiction Cast is one such surface. It composes generated primary personal, additional personal, family, and place components with surface-owned lexical, derived, and literal material. Additional personal names currently reuse the given-name semantic generation capability rather than introducing a generic `middleName` concept. Game NPC is a singular-name surface over the shared request/generation path.

## Singular generation and provenance

`generateName(...)` receives all causal generation inputs explicitly, including one immutable seed. It owns deterministic partitioning of that seed into the internal random streams used by planning and generation.

Conceptually:

```ts
generateName({
  settings,
  pack,
  seed,
  index,
  planningPreferences,
}) -> GeneratedName
```

The invocation is the causal provenance of the result. `GeneratedName` contains the intrinsic result and evidence produced by that invocation:

```text
GeneratedName
  name
  soundProfile
  sound
  spelling
  spellingCandidates
  generationPlan
  scores
  variants
  readabilityDiagnostics
```

`GeneratedName.name` is the selected generated spelling represented by `GeneratedName.spelling.text`.

The generation plan is internal generation evidence materialized by `generateName(...)`. Callers provide preferences, not a pre-built plan.

## Semantic naming capabilities

The reusable semantic layer currently exposes:

- `generateGivenName(...)`
- `generateFamilyName(...)`
- `generatePlaceName(...)`

Each callback resolves its semantic preferences and delegates lexical-name synthesis to `generateName(...)`. The semantic invocation boundary carries shared settings/source context, one seed, result addressability, and typed preferences.

Given, family, and place are first-class domain concepts even when their current lower mechanics are equivalent. Their semantic wrappers provide stable caller boundaries without duplicating the sound or spelling implementation. Fiction Cast may reuse a capability for more than one surface-owned component role when the generation semantics are intentionally the same; the component role remains surface-owned provenance.

## Surface composition

Composition belongs to the surface whose grammar gives the parts meaning.

Fiction Cast currently supports identity forms such as:

```text
given-only               := primary-personal
given-family             := primary-personal family
given-additional-family  := primary-personal additional-personal family
initials-family          := initials family
title-name               := title primary-personal
epithet-place            := primary-personal epithet "of" place
```

The richer additional-personal form is currently an explicit structure choice. It is not automatically part of the default Mixed structure-selection vocabulary.

`FictionCastGeneratedName` is the composed Fiction Cast result. It owns:

- its surface result ID;
- `displayName`;
- the materialized identity and phrase structure;
- whole-identity audition data;
- Cast role, rarity, readability, and retained generation-time intent evidence;
- `primaryName: GeneratedName`.

Every independently generated identity component retains its own generated-name evidence. Titles, epithets, initials, and literals remain explicit surface material with provenance appropriate to how they were materialized.

A composed display therefore remains distinct from any one generated component. Its surface identity can contain several independently generated names plus non-generated material.

## NameArtifact

`NameArtifact` is the shared durable projection of one singular `GeneratedName`:

```text
GeneratedName
  -> toNameArtifact(...)
  -> NameArtifact
```

It contains:

```text
id
soundProfile
sound
spelling
spellingCandidates
generationPlan
variants
readabilityDiagnostics
```

The artifact's generated text is `spelling.text`; there is no duplicate display-text field.

`NameArtifact` is useful where a caller needs durable singular evidence for persistence, inspection, or analysis. Product composition remains in the product result rather than expanding the shared artifact contract.

## History ownership

History belongs to the workflow that owns the result being saved.

The shared browser history currently stores singular `NameArtifact` records and is used by singular-name workflows such as Game NPC. It validates the current singular artifact shape when loading persisted records.

Fiction Cast does not write composed results into that shared singular history. A Fiction Cast history feature should be owned by Fiction Cast and retain the Fiction Cast result or a Fiction Cast-specific history record, so the saved value represents the identity the surface actually generated.

Generation functions return results; persistence remains a caller/surface responsibility.

## Shared request layer

`NameRequest -> NameResponse` is shared request/orchestration infrastructure for criteria-driven singular generation and exact independent sets.

```text
NameRequest
  -> resolve criteria, quantity, grouping, and parent seed
  -> compile shared criteria into GenerationSettings
  -> derive one deterministic child seed per result
  -> generateName(...) per child seed
  -> toNameArtifact(...)
  -> ordered NameArtifact[]
```

The current grouping operation is `independent-set`. Each result is independently generated from its deterministic child seed, and increasing quantity preserves the existing result prefix.

This request layer is separate from semantic callbacks and from surface-specific aggregate generation such as Fiction Cast.

## Finite lexical values

Finite lexical values such as titles, epithets, particles, honorifics, or suffixes belong on a deterministic selection path rather than the sound-generation path.

The reusable direction is:

```text
NamingLexicon / LexicalInventory
  -> semantic selector
  -> deterministic selectFromOptions(...)
```

The inventory owns its source data and scope. The semantic selector owns what the values mean. The generic selector owns deterministic choice.

Derived forms such as patronymics may use dedicated derivation mechanics when required by a surface or semantic capability.

## Sound mechanics

`SoundProfile` is the resolved mechanics value consumed by sound generation. It contains sound targets and phonotactic preferences.

```text
SoundProfile
  -> generateSound(...)
  -> SoundCandidate
  -> SegmentSequence
```

`SoundCandidate`, `SegmentSequence`, and spelling candidates are values related through containment in one generated result. They do not require independent identity merely to reference one another.

## Spelling mechanics

Spelling is derived from generated sound:

```text
SoundCandidate
  -> complete supported spelling pool
  -> deterministic ranking
  -> selected spelling
```

The selected spelling and retained alternatives remain attached to the exact generated sound in `GeneratedName` and `NameArtifact`.

## Analysis

Shared artifact analysis operates on singular generated evidence. It can derive structure, spelling relationships, readability observations, collisions, and sound relationships.

Fiction Cast may project the `primaryName` of a surface result into singular analysis while retaining its own Cast result addressability for navigation. That projection is a surface adapter, not a second generation boundary.

Human-facing claims remain evidence-specific. Structural and deterministic observations can be presented directly; claims such as universal pronounceability, memorability, realism, beauty, or cultural authenticity require separate validation.

## Audition

Singular audition derives browser-oriented presentation from generated sound:

```text
SegmentSequence
  -> AuditionPhonology
  -> BrowserAuditionCue
```

Fiction Cast owns whole-identity and component audition presentation for composed identities. Sound-backed identity parts reuse their contained generation evidence; lexical and literal parts remain text.

## Module ownership

```text
src/
  engine/
    shared request, artifact, sound, spelling, analysis,
    diagnostics, source registry, and low-level mechanics

  naming/
    generateName(...)
    semantic naming callbacks

  styleCompilation/
    typed style input -> SoundProfile

  fictionCast/
    Fiction Cast settings and results
    identity grammar and lexical material
    ensemble generation
    roles, rarity, deterministic cast diagnostics
    whole-identity/component audition
    surface export
    primary-name analysis/addressability adapter

  ui/
    shared singular-name presentation
    Fiction Cast and Game NPC surface presentation
```

The stable architectural rule is ownership: `generateName(...)` owns one generated lexical name; semantic callbacks own reusable naming meaning; product surfaces own composition and lifecycle concerns around the results they create.
