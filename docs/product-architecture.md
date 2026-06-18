# Name Forge product architecture

Name Forge should remain one product: a random-name workbench. Its first serious mode is **Fiction cast**, but the product should not collapse into only a fiction-cast generator.

The product should support multiple naming modes that share core generation, scoring, comparison, export, and provenance primitives while giving each mode its own controls, vocabulary, and result presentation.

## Product language

Use **mode** in the UI and product docs.

Use **engine** only when discussing implementation internals.

Examples:

- UI: `Fiction cast mode`, `Brand / product mode`, `Place mode`.
- Code/docs: mode configs, shared engine primitives, and mode-specific presentation.

The useful top-level product prompt is:

> What are you naming?

That prompt should route users into the right mode without fragmenting Name Forge into separate products.

## Product loop

Name Forge is a workbench for random names with a common loop:

```text
Style -> Constraints -> Generate -> Score -> Compare -> Export
```

Each mode can tune the loop differently, but these shared product primitives should stay recognizable:

- **Style**: source packs, texture, tone, domain, language feel, or theme pools.
- **Constraints**: quantity, format, length, rarity, memorability, pronounceability, or mode-specific requirements.
- **Generate**: deterministic random candidate creation from a seed and settings.
- **Score**: explainable quality signals for ranking and filtering names.
- **Compare**: ensemble balance, duplicate pressure, similarity pressure, or list coherence.
- **Export**: JSON, Markdown, or mode-specific handoff formats.

## Current supported mode

### Fiction cast

The current product surface is Fiction cast mode.

Primary job:

> Help me name a cast of characters that feel coherent but distinct.

Current controls:

- Cast size
- Style preset
- Name format
- Cast role mix
- Slot overrides
- Role influence
- Rarity distribution
- Novelty
- Pronounceability
- Memorability
- Cultural anchoring
- Orthographic weirdness
- Cast export

Current result presentation:

- Compact browsing cards
- Syllable and alternate-spelling hints while collapsed
- Nested **Details** for role, texture, format, rarity, name parts, and provenance-style metadata
- Nested **Fit** for score breakdowns
- JSON and Markdown cast export

Fiction cast mode is allowed to be fiction-specific. Its role controls, cast language, slot overrides, and cast export should not be watered down merely to look generic.

## Candidate future modes

These are product directions, not implementation commitments for the current slice.

### Brand / product

Names for products, apps, companies, tools, features, or services.

Primary job:

> Help me find names that are memorable, pronounceable, tone-appropriate, and usable in a market context.

Likely controls:

- Industry or domain
- Tone: serious, playful, premium, technical, earthy, etc.
- Real-word vs coined
- Length
- Memorability
- Pronounceability
- Spelling risk
- Distinctiveness
- Optional later availability checks

### Project codename

Internal project names that are memorable without being too precious.

Primary job:

> Help me name a project in a way that is readable, low-risk, and easy for a team to use.

Likely controls:

- Theme pool: mythology, birds, minerals, weather, cities, etc.
- Seriousness
- Obscurity
- Length
- Team readability
- Embarrassment or loaded-term risk

### Place / toponym

Names for towns, regions, planets, rivers, taverns, institutions, and map-region naming systems.

Primary job:

> Help me create place names that feel regionally coherent and geographically plausible.

Likely controls:

- Place type
- Region or culture style
- Age: ancient, frontier, modern, ruined
- Morphology: compounds, suffixes, geographic roots
- Cross-region coherence

### Username / handle

Identity-fitting handles for social platforms, games, creators, or professional use.

Primary job:

> Help me generate handles that feel like me and fit platform constraints.

Likely controls:

- Personality or tone
- Length
- Separator style
- Numbers: never, allowed, preferred
- Real-ish vs abstract
- Platform flavor
- Availability-looking variants

### Game / NPC quick names

A faster sibling of Fiction cast mode for prep or live play.

Primary job:

> Give me usable names quickly with minimal configuration.

Likely controls:

- Species, faction, class, or region
- Quantity
- Familiarity
- One-click reroll per slot
- Compact result cards

### Set / taxonomy naming

Names for coherent groups of related things.

Examples include spells, ships, factions, achievements, product tiers, AI agents, menu items, or design tokens.

Primary job:

> Help me name a set where the items feel related but not interchangeable.

Likely controls:

- Count
- Shared theme
- Distinctness
- Hierarchy or tiering
- Prefix or suffix consistency
- Set-level export

## Mode boundary direction

The first implementation boundary is intentionally light:

```ts
export type NamingModeId = 'fiction-cast';

export interface NamingModeConfig {
  id: NamingModeId;
  label: string;
  shortLabel: string;
  description: string;
  heroTitle: string;
  heroCopy: string;
  outputHeading: string;
  exportHeading: string;
  generateLabel: string;
  defaultSettings: (stylePackId: string) => GenerationSettings;
}
```

This is not yet a plugin API. It is a seam that removes fiction-specific defaults and presentation copy from the app shell.

The future interface may grow toward controls, result presentation, mode-specific export bundles, and mode-specific scoring priorities, but that should happen when a second real mode exists.

## Shared vs mode-specific responsibilities

### Shared primitives

- Seeded random generation
- Style packs and source registry
- Silhouettes and constraints
- Candidate generation
- Decomposed scoring
- Comparison pressure across a result set
- Variants
- Provenance
- Export mechanics

### Fiction cast responsibilities

- Cast vocabulary
- Role mix and slot overrides
- Role influence
- Cast size language
- Ensemble-balance presentation
- Cast-oriented JSON and Markdown copy
- Result cards optimized for character-name scanning

### Future mode responsibilities

Each future mode should own its own:

- default settings
- controls
- labels and vocabulary
- scoring priorities
- result card presentation
- export shape

## UX direction

The generator should begin with:

```text
What are you naming?
[Fiction cast]
```

The selector may be disabled while only one mode exists. That is acceptable because it introduces the product model without pretending additional modes are ready.

Near-term implications:

- Keep current fiction controls behind the Fiction cast mode boundary.
- Use progressive disclosure for advanced mode-specific controls.
- Keep baseline generation approachable.
- Avoid making export or Fit metadata dominate the primary generation loop.
- Let result-card presentation vary by mode and user intent later.

## Tracking model after Phase One

The original PRD used phases as a build-order metaphor. That was useful for inception, but it no longer describes the product accurately.

Going forward, track work by:

1. **Mode maturity**: how complete and coherent each naming mode is.
2. **Shared primitive maturity**: how reusable the underlying generation, scoring, comparison, export, and provenance pieces are.
3. **Validation posture**: whether a branch is exploratory, draft PR, or merge-ready.

See [`phase-one-closeout.md`](phase-one-closeout.md) for the Phase One retirement notes.

## Non-goals for the current implementation slice

- Do not build every candidate mode.
- Do not create a full plugin framework.
- Do not make Fiction cast generic at the cost of its product quality.
- Do not let the old phase model drive current scope decisions.

## Related work

- #36 introduced fiction-cast role and rarity controls.
- #37 introduced optional role-specific naming influence.
- #38 tracks the multi-mode product architecture direction.
