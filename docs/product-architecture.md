# Name Forge product architecture

Name Forge should remain one product: a random name workbench. It should not collapse into only a fiction-cast generator, even though fiction-cast generation is currently the most developed mode.

The product should support multiple naming modes that share core generation, scoring, comparison, and export primitives while adding mode-specific controls and presentation.

## Product language

Use **mode** in the UI and **engine** only where implementation language helps.

- UI language: `Fiction cast mode`, `Brand / product mode`, `Place mode`.
- Internal language: mode or engine modules that share the same core generation pipeline.

A useful top-level prompt for the product is:

> What are you naming?

That prompt should lead users toward the right mode without fragmenting Name Forge into separate products.

## Core product model

Name Forge is a workbench for random names with a common loop:

```text
Style -> Constraints -> Generate -> Score -> Compare -> Export
```

Each mode can tune that loop differently, but the shared product primitives should stay recognizable:

- **Style**: source packs, tone, domain, language feel, or theme pools.
- **Constraints**: quantity, format, length, rarity, memorability, pronounceability, or domain-specific requirements.
- **Generate**: deterministic random candidate creation from a seed and settings.
- **Score**: explainable quality signals for ranking and filtering names.
- **Compare**: ensemble balance, duplicate pressure, similarity pressure, or list coherence.
- **Export**: JSON, Markdown, or mode-specific handoff formats.

## Candidate modes

### Fiction cast

The current advanced mode. It supports coherent-but-distinct character ensembles, role mixes, slot overrides, rarity distributions, and fiction-oriented exports.

Primary job:

> Help me name a cast of characters that feel coherent but distinct.

Likely controls:

- Cast size
- Style preset
- Name format
- Cast role mix
- Slot overrides
- Rarity distribution
- Role influence, if enabled later
- Card density
- Cast export

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

A faster sibling of fiction-cast mode for prep or live play.

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

## Architecture direction

A future mode boundary might look roughly like this:

```ts
interface NameMode {
  id: string;
  label: string;
  description: string;
  defaultSettings: GenerationSettings;
  controls: ControlSchema[];
  generate(settings: GenerationSettings): GeneratedResult;
  export(result: GeneratedResult): ExportBundle;
}
```

This is directional rather than final. The exact interface should emerge from the first refactor.

The important boundary is product-level: mode-specific logic should not leak into the entire app shell. The fiction-cast workflow should become the first serious mode, not the whole product identity.

## UX direction

The generator should eventually start with a mode selector such as:

```text
What are you naming?
[Fiction cast]
```

Then each mode can reveal its own controls and result presentation.

Near-term implications:

- Move fiction-specific controls behind a fiction-mode boundary.
- Use progressive disclosure for advanced mode-specific controls.
- Keep baseline generation approachable.
- Avoid making export or diagnostics dominate the primary generation loop.
- Let result-card density vary by mode and user intent.

## Non-goals for the first implementation slice

Do not build every candidate mode at once.

The first implementation should likely focus on clarifying the current fiction-cast mode boundary and improving the generator layout. Other modes should remain documented as product direction until the shared primitives are clearer.

## Related work

- #36 introduced fiction-cast role and rarity controls.
- #37 tracks optional role-specific phonotactic and scoring influence.
- #38 tracks this multi-mode product architecture direction.
