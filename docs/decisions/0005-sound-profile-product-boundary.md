# Decision 0005: Sound profile, style compilation, and product semantics boundary

## Status

Accepted and refined through the current migration slices. Decision 0006 defines the naming capability hierarchy above this sound/style boundary.

The sound/profile/containment decisions here remain authoritative. The earlier statement that reusable semantic name generators were merely deferred is refined: reusable typed semantic callbacks are an implemented architectural layer. Given, family, and place are current first-class semantic generated-name categories, and `generateGivenName(...)`, `generateFamilyName(...)`, and `generatePlaceName(...)` all use the stable semantic invocation boundary implemented by issue #202.

Issue #186 implemented the singular `generateName(...)` boundary anticipated by this decision. Issue #203 then made the result boundary explicit: `GeneratedName` is a singular sound-backed result coherent with its own selected spelling, while composed product identities live above that primitive and retain generation provenance per generated component. References below to the old silhouette-shaped bridge describe the pre-#186 context unless explicitly stated otherwise.

## Context

Fiction Cast can display identities containing semantically different parts: given names, family names, place names, titles, epithets, initials, and literals. The low-level sound generator operates on a much smaller contract: one `SoundProfile` plus seeded randomness produces one `SoundCandidate`, which can then project to spelling candidates.

Earlier composition code allowed Fiction Cast meaning to leak into that contract. `SoundProfile` carried product tags and lexical material even though `generateSound()` did not need them. Component labels such as `given`, `family`, and `place` also lived too low even though they describe naming-domain or product meaning rather than phonological behavior.

The first boundary extraction separated Fiction Cast semantics and grammar from sound generation and established `StyleCompiler<Style>` as a complementary abstraction. A further refinement showed that profile identity and compiler provenance were unnecessary for sound mechanics: the exact resolved `SoundProfile` value can be retained directly as provenance. The same reasoning applies to nested sound, sequence, and spelling values: they do not need identities merely so adjacent values can point back at them.

Name orchestration also compiles style, selects spelling, scores names, and generates variants. That orchestration belongs above the low-level sound engine. Decision 0006 clarified that the silhouette-shaped orchestration then in use was transitional and should converge on one generic singular `generateName(...)` primitive; issue #186 completed that boundary move.

## Decision

### 1. Semantics belong above the sound engine

`given`, `family`, `place`, `epithet`, `title`, `initial`, and literal roles describe naming-domain or product-level meaning. They are not primitives of generic sound generation.

Reusable naming capabilities expose typed operations such as `generateGivenName(...)`, `generateFamilyName(...)`, or `generatePlaceName(...)` without requiring those meanings to become sound-engine concepts. Distinct sound mechanics are not required merely for those stable semantic roles to have first-class callbacks.

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

Issue #202 establishes the current stable semantic invocation pattern above `generateName(...)`: callers provide shared settings/source context plus deterministic seed material and typed semantic preferences; the naming layer owns style-pack resolution, RNG construction, and translation into generic planning representation.

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

Issue #186 establishes `generateName(...)` and moves planning behind that boundary. The retained internal value is `NameGenerationPlan`; the legacy `silhouette` result/generated-name-artifact property and `silhouette-*` evidence IDs remain for compatibility, scoring, inspection, and export rather than as caller-facing generation abstractions. Composed identity artifacts do not carry one aggregate silhouette.

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

Issue #203 makes this rule explicit in result and persistence contracts. A singular `GeneratedName` contains only the primitive sound/spelling/planning evidence for its own selected `name`. A composed product result such as `FictionCastGeneratedName` contains that unchanged primitive as `primaryName` and retains generated supporting-part evidence on `NameIdentity.parts[].generation`. Durable `composed-identity` artifacts likewise carry identity/audition/readability data without one aggregate primitive sound/spelling/plan bundle.

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

Product/domain semantics stay above this boundary. Fiction Cast, for example, resolves role-specific behavior into semantic naming preferences before calling the appropriate `-Name` wrapper, then attaches role evidence and role-fit scoring in its own orchestration layer.

### 10. Ownership moves are direct while contracts are unstable

The current codebase does not need compatibility aliases for internal module moves. When ownership changes, callers move to the owning module and the obsolete path is removed.

Compatibility facades should be introduced only when a stable or externally consumed contract creates an actual compatibility requirement. Existing `name-forge.cast.v2` export shape is one such surface contract: it keeps the composed display in exported `name` while explicitly projecting sound/silhouette/variant/intrinsic-score compatibility fields from the contained primary singular name.

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
- Reusable semantic callbacks represent domain semantics and delegate to `generateName(...)`.
- Given, family, and place are implemented first-class semantic generated-name categories through one stable invocation pattern.
- Product surfaces compose semantic callbacks and inject their own configuration rather than teaching generic mechanics about the surface.
- Surface-specific aggregate callbacks may remain product-specific when their cross-name semantics are not reusable.
- Style compilation, naming orchestration, and sound generation have separate responsibilities and may evolve independently.
- `SoundProfile` can be compared, retained, and passed by value without identity infrastructure.
- Nested sound/sequence/spelling values are related through containment rather than synthetic ids and joins.
- Different semantic capabilities may use distinct typed style languages while compiling to the same `SoundProfile` type.
- Fiction Cast consumes given/family/place semantic callbacks without changing the sound engine and retains its own cast orchestration.
- A singular `GeneratedName` is coherent with its own selected spelling; a composed product identity is a separate result and persistence shape.
- Generated component provenance is retained per component; lexical epithets, titles, initials, and literals remain valid product grammar parts without fabricated sound provenance.
- Legacy history-v1 artifact records are normalized into explicit generated/composed artifact kinds on read rather than preserving ambiguous aggregate evidence on composed records.
- Legacy silhouette evidence remains compatibility data, not a naming API boundary.

## Deferred decisions

- Whether concrete style languages, defaults, or typed configuration later distinguish given, family, place, and other semantic capabilities beyond their stable caller boundaries.
- Which additional semantic callbacks earn reusable API status from real product use.
- Whether epithets remain lexical, become generated, or support both realizations.
- Whether request-resolution behavior ever warrants a first-class policy abstraction.
- Whether multiple surfaces later create enough pressure for a reusable compound-name or grammar/composition extension above the now-explicit primitive/composed result boundary.
- Whether and when the legacy `silhouette` property or `silhouette-*` evidence IDs should be migrated or removed after concrete consumers no longer require them.
