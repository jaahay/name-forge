# Decision 0005: Sound profile, style compilation, and product semantics boundary

## Status

Accepted and refined through the current migration slices. Decision 0006 defines the naming capability hierarchy above this sound/style boundary.

The sound/profile/containment decisions here remain authoritative. The earlier statement that reusable semantic name generators were merely deferred is refined: reusable typed semantic callbacks are now an accepted architectural layer, while their concrete TypeScript contracts and domain-specific configuration remain implementation work.

Issue #186 has implemented the singular `generateName(...)` boundary anticipated by this decision. References below to the old silhouette-shaped bridge describe the pre-#186 context unless explicitly stated otherwise.

## Context

Fiction Cast can display identities containing semantically different parts: given names, family names, place names, titles, epithets, initials, and literals. The low-level sound generator operates on a much smaller contract: one `SoundProfile` plus seeded randomness produces one `SoundCandidate`, which can then project to spelling candidates.

Earlier composition code allowed Fiction Cast meaning to leak into that contract. `SoundProfile` carried product tags and lexical material even though `generateSound()` did not need them. Component labels such as `given`, `family`, and `place` also lived too low even though they describe naming-domain or product meaning rather than phonological behavior.

The first boundary extraction separated Fiction Cast semantics and grammar from sound generation and established `StyleCompiler<Style>` as a complementary abstraction. A further refinement showed that profile identity and compiler provenance were unnecessary for sound mechanics: the exact resolved `SoundProfile` value can be retained directly as provenance. The same reasoning applies to nested sound, sequence, and spelling values: they do not need identities merely so adjacent values can point back at them.

Name orchestration also compiles style, selects spelling, scores names, and generates variants. That orchestration belongs above the low-level sound engine. Decision 0006 clarified that the silhouette-shaped orchestration then in use was transitional and should converge on one generic singular `generateName(...)` primitive; issue #186 has now completed that boundary move.

## Decision

### 1. Semantics belong above the sound engine

`given`, `family`, `place`, `epithet`, `title`, `initial`, and literal roles describe naming-domain or product-level meaning. They are not primitives of generic sound generation.

Reusable naming capabilities may expose typed operations such as `generateGivenName(...)`, `generateFamilyName(...)`, or `generatePlaceName(...)` without requiring those meanings to become sound-engine concepts.

A product surface composes one or more such capabilities and injects configuration derived from its UX. Fiction Cast may consume them while continuing to own cast-specific identity and aggregate behavior.

### 2. One generic singular naming primitive sits above mechanics

The naming layer owns one generic singular operation conceptually named:

```ts
generateName(...)
```

Reusable semantic callbacks delegate to that singular primitive. They are not parallel implementations of sound generation.

The ordered dependency is:

```text
surface-specific aggregate orchestration, when needed
        -> reusable semantic callback(s)
        -> generic singular generateName(...)
        -> typed style compilation
        -> SoundProfile
        -> sound + spelling mechanics
```

This decision did not prescribe the exact input/output types. Issue #186 provides the current implementation contract while preserving the architectural dependency above.

### 3. Grammars belong to product or semantic composition

A grammar decides which semantic parts make up an identity and how those parts are arranged.

The current Fiction Cast grammars remain examples such as:

```text
given-only      := given
given-family    := given family
initials-family := initials family
title-name      := title given
epithet-place   := given epithet "of" place
```

Fiction Cast owns those current grammars. This decision does **not** introduce a reusable `generateCompoundName` API. Compound-name generation may later become reusable if multiple consumers create real pressure for that contract.

### 4. Style compilation is complementary to naming and sound generation

Style expresses resolved aesthetic/mechanical intent for one naming capability. A style compiler translates one strongly typed style language into a fully resolved `SoundProfile`.

The generic seam remains intentionally small:

```ts
interface StyleCompiler<Style> {
  compile(style: Style): SoundProfile;
}
```

The input type is generic. There is no universal union of every future given-name, place-name, baby-name, pen-name, faction-name, or other semantic style.

A reusable semantic callback may own the typed configuration and style language useful to its domain while sharing the same `generateName(...)` primitive and `SoundProfile` output mechanics below it.

The existing `StyleInput` plus `compileStyle()` implementation is the first basic compiler. It is not the canonical style language for every future semantic capability.

### 5. The silhouette bridge is not architectural API

The pre-#186 `GenerationSettings + NameSilhouette -> StyleInput` bridge was implementation structure rather than a reusable naming contract.

`NameSilhouette`, `createNameSilhouette(...)`, and `generateNameFromSilhouette(...)`-shaped entry points are **not** accepted flavours of the reusable naming API. Callers must not be required to manufacture a silhouette before they can generate a name.

Issue #186 establishes `generateName(...)` and moves planning behind that boundary. The retained internal value is `NameGenerationPlan`; the legacy `silhouette` result/artifact property and `silhouette-*` evidence IDs remain for compatibility, scoring, inspection, and export rather than as caller-facing generation abstractions.

Further reduction or renaming of that evidence should be driven by concrete consumer or persistence needs, not by preserving or eliminating a historical noun for its own sake.

### 6. No first-class Policy abstraction is required yet

Request defaults, constraints, variation, compiler choice, ranking, and similar behavior may be policy-like, but that does not require a `Policy` object or universal policy schema.

A reusable semantic capability may encapsulate its domain defaults and typed configuration directly. Extract a policy abstraction only if multiple callers later need to configure or replace that behavior independently.

### 7. SoundProfile is a pure resolved mechanics value

A `SoundProfile` contains only the resolved sound targets and phonotactic preferences needed by generic sound and spelling generation. It is a value, not an entity or serialization envelope.

A `SoundProfile` therefore has no:

- profile id;
- contract/version tags required by generation;
- compiler/source provenance;
- product job/type identifier;
- `given`, `family`, `place`, or other semantic label;
- title or epithet lexicon;
- composition grammar;
- UI state, callbacks, caches, or runtime handles.

`generateSound(profile, rng)` consumes this value directly. Different compilers may produce structurally equal profiles without requiring shared identity infrastructure.

### 8. Generation provenance is containment, not relational identity

Every sound-backed generated component retains the exact `SoundProfile`, `SoundCandidate`, and selected spelling used for that component.

The containing generation result establishes their relationship. `SoundCandidate`, `SegmentSequence`, and spelling candidates do not need ids or cross-link fields merely to reconstruct that relationship. Validation checks their contained structure where consistency matters.

This does not prohibit identity at product or artifact boundaries. A generated result, artifact, cast slot, lock, identity part, or persisted product record may have an id because callers need to address that thing independently. Internal generation values do not acquire identity solely for bookkeeping.

A compound identity does not have one authoritative aggregate profile merely because it has one displayed string. If a phrase contains two independently generated sound-backed parts, it retains two independently resolved profile values.

The current top-level `GeneratedName.soundProfile` field may continue to describe the primary generated component until the app-facing result model is simplified, but it must not be interpreted as describing the full compound identity.

### 9. Name orchestration belongs above the low-level engine

The low-level engine owns sound and spelling mechanics. It does not decide how surface UX, semantic configuration, or product roles become naming/style input.

Current name orchestration lives under `src/naming` and exposes the generic singular `generateName(...)` boundary. It may:

- materialize internal `NameGenerationPlan` evidence from generic planning inputs;
- translate that plan plus current lower-level settings into the basic typed style language;
- invoke style compilation;
- call `generateSound(profile, rng)`;
- project and rank spelling candidates;
- select a spelling;
- score the selected name and generate app-facing variants/diagnostics.

Product/domain semantics stay above this boundary. Fiction Cast, for example, resolves role-specific behavior into generic planning preferences before calling `generateName(...)`, then attaches role evidence and role-fit scoring in its own orchestration layer.

### 10. Ownership moves are direct while contracts are unstable

The current codebase does not need compatibility aliases for internal module moves. When ownership changes, callers move to the owning module and the obsolete path is removed.

Compatibility facades should be introduced only when a stable or externally consumed contract creates an actual compatibility requirement.

## Directional architecture

```text
PRODUCT SURFACE
  owns UX, defaults, presets, state,
  and surface-specific aggregate behavior
            |
            v
REUSABLE SEMANTIC NAMING CAPABILITY
  e.g. given / family / place
            |
            v
GENERIC SINGULAR generateName(...)
            |
            v
STRONGLY TYPED STYLE
            |
            v
StyleCompiler<Style>
            |
            v
PURE SoundProfile VALUE
            |
            v
generateSound(profile, rng)
            |
            v
SoundCandidate -> spelling mechanics
```

`NameRequest -> NameResponse` remains alongside this as shared criteria/replay/independent-set platform infrastructure. It is not a substitute for the semantic callback hierarchy.

## Consequences

- `generateSound(profile, rng)` remains generic and does not branch on product semantics.
- `generateName(...)` is the implemented singular naming primitive above mechanics.
- Reusable semantic callbacks represent domain semantics and will delegate to `generateName(...)`.
- Product surfaces compose semantic callbacks and inject their own configuration rather than teaching generic mechanics about the surface.
- Surface-specific aggregate callbacks may remain product-specific when their cross-name semantics are not reusable.
- Style compilation, naming orchestration, and sound generation have separate responsibilities and may evolve independently.
- `SoundProfile` can be compared, retained, and passed by value without identity infrastructure.
- Nested sound/sequence/spelling values are related through containment rather than synthetic ids and joins.
- Different semantic capabilities may use distinct typed style languages while compiling to the same `SoundProfile` type.
- Fiction Cast may evolve given/family/place into reusable capabilities without changing the sound engine and while retaining its own cast orchestration.
- Lexical epithets and titles remain valid product grammar parts without pretending to be generated sounds.
- Legacy silhouette evidence remains compatibility data, not a naming API boundary.

## Deferred decisions

- The concrete style languages, defaults, and typed configuration that distinguish given, family, place, and other semantic capabilities.
- Which additional semantic callbacks earn reusable API status from real cross-surface use.
- Whether epithets remain lexical, become generated, or support both realizations.
- Whether request-resolution behavior ever warrants a first-class policy abstraction.
- Whether the generic system should later expose a reusable compound-name or grammar/composition extension.
- Whether the current app-facing `GeneratedName` type should split into a primitive generated one-name result and a composed product identity result.
- Whether and when the legacy `silhouette` property or `silhouette-*` evidence IDs should be migrated or removed after concrete consumers no longer require them.
