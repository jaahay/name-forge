# Decision 0005: Sound profile, style compilation, and product semantics boundary

## Status

Accepted.

Decision 0006 defines the semantic naming capability hierarchy above this sound/style boundary.

## Context

Name Forge needs reusable sound and spelling mechanics while product surfaces express richer naming semantics.

A Fiction Cast identity may contain given names, family names, place names, titles, epithets, initials, and literals. The low-level sound generator needs a much smaller input: a resolved `SoundProfile` plus deterministic randomness.

The architecture therefore separates:

- product and naming semantics;
- singular name orchestration;
- generation planning;
- style compilation;
- resolved sound mechanics;
- sound and spelling generation.

## Decision

### Semantic meaning lives above sound mechanics

Given, family, place, title, epithet, initial, and literal are naming or product concepts.

Reusable semantic capabilities currently expose:

```text
generateGivenName(...)
generateFamilyName(...)
generatePlaceName(...)
```

Each semantic capability translates its typed preferences and delegates lexical-name synthesis to the singular `generateName(...)` primitive.

A product surface composes these capabilities according to the grammar and workflow it owns.

### generateName is the singular generation boundary

The naming layer owns one generic sound-backed lexical-name operation:

```text
generateName(...)
```

The dependency direction is:

```text
product surface
  -> semantic naming capability
  -> generateName(...)
  -> generation planning
  -> style compilation
  -> SoundProfile
  -> sound generation
  -> spelling generation and selection
  -> GeneratedName
```

`generateName(...)` receives one deterministic seed and owns its internal random-stream partitioning. It also materializes the `NameGenerationPlan` used by the generation process.

Callers provide generation settings and preferences rather than constructing internal RNG objects or generation plans.

### Style packs provide coarse form priors

A `StylePack` may influence generation planning through `formBias`.

`formBias` is causal input to plan materialization, not a score or a completed-name model. It currently contains weighted preferences for coarse form dimensions that are useful before exact sounds or spellings exist:

```text
StylePack.formBias
  syllableCounts
  textures
        |
        v
createNameGenerationPlan(...)
        |
        v
NameGenerationPlan
```

Caller settings and semantic planning preferences can modify that pressure for a particular invocation. The materialized plan records the concrete choices used by that invocation.

### Style compilation resolves mechanics intent

A style compiler translates a typed style language into `SoundProfile`:

```ts
interface StyleCompiler<Style> {
  compile(style: Style): SoundProfile;
}
```

The current naming orchestration derives this style input from the materialized generation plan plus generic generation settings.

Semantic capabilities may evolve distinct typed style or preference languages while sharing the same `SoundProfile` mechanics below them.

### SoundProfile is a pure mechanics value

`SoundProfile` contains the resolved targets and phonotactic preferences required for sound generation.

It is passed by value into sound mechanics:

```text
SoundProfile
  -> generateSound(...)
  -> SoundCandidate
```

Product roles, composition grammar, lexical inventories, UI state, and surface metadata remain outside `SoundProfile`.

### Generated evidence is related by containment

A singular `GeneratedName` contains the exact generation evidence for its selected spelling:

```text
GeneratedName
  soundProfile
  sound
  spelling
  spellingCandidates
  generationPlan
```

The containing result establishes the relationship between those values. `SoundProfile`, `SoundCandidate`, `SegmentSequence`, and spelling candidates remain values rather than independently addressable entities.

A composed surface identity retains generation evidence on each generated component that owns it.

### Product composition remains surface-owned

Fiction Cast owns its identity grammar and aggregate generation behavior. It may compose several independently generated names with lexical or literal material while keeping each generated component's evidence intact.

`FictionCastGeneratedName` therefore contains an unchanged singular `primaryName` plus its surface identity, supporting components, roles, rarity, contextual scoring, and audition data.

### Generation plans are generation evidence

`NameGenerationPlan` is the per-invocation plan materialized during `generateName(...)` by `src/engine/nameGenerationPlan.ts` and retained as result evidence under the `generationPlan` property.

It captures current planning dimensions such as syllable count, stress/rhythm, shape, texture, novelty target, and length target.

It is an output/evidence model of the singular generation process, not a caller-facing alternative generation API.

Generic `NameScores` describe intrinsic scoring dimensions of the generated name. Plan-form conformance is not a generic score. A product surface may use plan evidence in its own contextual evaluation when the product semantics give that comparison meaning; Fiction Cast role fit is one such surface-owned use.

### Surface lifecycle remains above generation

Product surfaces own lifecycle concerns around their results, including persistence, history, export, selection, navigation, and presentation.

Fiction Cast export serializes Fiction Cast results at the surface boundary. Fiction Cast history, when implemented, belongs to that same surface boundary.

## Consequences

- Sound generation remains reusable across product surfaces.
- `generateName(...)` is the single sound-backed lexical-name primitive.
- `StylePack.formBias` supplies reusable causal pressure for coarse generation form.
- `NameGenerationPlan` records the concrete per-invocation plan produced from those priors, settings, preferences, and randomness.
- Generic scoring does not expose a form/plan-conformance score merely because generation has a plan.
- Semantic naming callbacks express domain meaning without duplicating mechanics.
- `SoundProfile` remains a compact resolved mechanics value.
- `GeneratedName` contains coherent singular generation evidence.
- `generationPlan` names the retained plan evidence directly.
- Product composition and lifecycle concerns remain with the product surface that owns them.
- Fiction Cast can evolve its grammar, contextual scoring, history, export, and presentation independently of the generic sound engine.
