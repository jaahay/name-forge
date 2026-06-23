# Name Forge product architecture

Name Forge should remain one product: a random-name workbench. Its first serious mode is **Fiction cast**, but the product should not collapse into only a fiction-cast generator.

The product should support multiple naming modes that share core generation, scoring, comparison, diagnostics, export, and provenance primitives while giving each mode its own controls, vocabulary, result presentation, and validation criteria.

See [`product-brief.md`](product-brief.md) for the strategy-level thesis and recommended sequencing. See [`current-product-scope.md`](current-product-scope.md) for the current shipped baseline and next feature requirements.

## Product language

Use **mode** in the UI and product docs.

Use **engine** only when discussing implementation internals.

Examples:

- UI: `Fiction cast mode`, `Game NPC mode`, `Pen name mode`, `Product / codename mode`, `Place mode`.
- Code/docs: mode configs, shared engine primitives, and mode-specific presentation.

The useful top-level product prompt is:

> What are you naming?

That prompt should route users into the right mode without fragmenting Name Forge into separate products.

## Product loop

Name Forge is a workbench for random names with a common loop:

```text
Style -> Controls -> Generate -> Score -> Compare -> Inspect -> Export
```

Each mode can tune the loop differently, but these shared product primitives should stay recognizable:

- **Style**: source packs, texture, tone, domain, language feel, or theme pools.
- **Controls**: quantity, format, length, rarity, memorability, pronounceability, role influence, or mode-specific requirements.
- **Generate**: deterministic random candidate creation from a seed and settings.
- **Score**: explainable quality signals for ranking and filtering names.
- **Compare**: ensemble balance, duplicate pressure, similarity pressure, readability pressure, or list coherence.
- **Inspect**: selected-name explanation, construction cues, scoring detail, variant metadata, warnings, and diagnostics.
- **Export**: JSON, Markdown, or mode-specific handoff formats.

## Current supported mode

### Fiction cast

The current product surface is Fiction cast mode.

Primary job:

> Help me name a cast of characters that feel coherent but distinct.

Current controls:

- Cast size
- Style pack
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

- Compact browsing cards for scan/select/lock
- Persistent Inspect panel for selected-name details
- Deterministic readability notes in selected-name detail and Cast Health
- Cast Health panel for roster-level checks
- JSON and Markdown cast export

Fiction cast mode is allowed to be fiction-specific. Its role controls, cast language, slot overrides, inspection, cast health, and cast export should not be watered down merely to look generic.

## Mode taxonomy

Candidate modes are planning surfaces, not implementation commitments. Each mode should have a user job, control model, result contract, and validation posture before it becomes active.

| Mode | Primary user job | Result contract | Shared primitives stressed | Suggested maturity |
| --- | --- | --- | --- | --- |
| Fiction cast | Name a coherent cast of fictional characters. | Cast list, role metadata, cards, Inspect, Cast Health, JSON/Markdown export. | Silhouettes, ensemble balance, role influence, diagnostics, variants, provenance. | Active MVP, approaching polished. |
| Game NPC | Generate usable names quickly for tabletop, videogame, or interactive-fiction prep. | Names with role/faction/species hints, compact hook, fast reroll. | Role profiles, compact export, lock/regenerate. | Best first second mode after trust/source hardening. |
| Pen name | Generate pseudonyms for authors, creators, or public identity work. | Names with genre/market fit, memorability, privacy/risk notes. | Style fit, scoring, screening metadata. | Later non-fiction validation mode. |
| Product / codename | Name products, projects, features, prototypes, or launches. | Names with rationale, tone fit, risk/collision notes, shortlist export. | Constraints, memorability, availability-looking variants. | Later product-work mode. |
| Place / toponym | Generate towns, regions, planets, rivers, institutions, and map-region systems. | Place names with type, morphology, and regional texture. | Style packs, morphology, set coherence, provenance. | Later worldbuilding mode. |
| Set / taxonomy | Name coherent groups: spells, ships, factions, tiers, AI agents, menu items, design tokens. | Named set with shared theme, hierarchy, or relation metadata. | Comparison pressure, shared affixes/themes, export. | Later set-work mode. |

## Candidate future modes

These are product directions, not implementation commitments for the current slice.

### Game / NPC quick names

A faster sibling of Fiction cast mode for prep or live play.

Primary job:

> Give me usable names quickly with minimal configuration.

Likely controls:

- Species, faction, class, role, or region
- Quantity
- Familiarity
- Pronounceability
- One-click reroll per slot
- Optional compact hook
- Compact result cards

Why it is a good first second mode:

- It reuses many Fiction cast primitives.
- It has a different workflow: speed and low configuration matter more than deep ensemble browsing.
- It can validate whether result presentation and controls are genuinely mode-specific.

Do not start this until Fiction cast's variant, source, warning, and validation contracts are stable enough to be reused.

### Pen name

Names for authors, creators, newsletters, artists, or pseudonymous public work.

Primary job:

> Help me choose a pseudonym that fits the market and carries the right amount of identity signal.

Likely controls:

- Genre, market, or platform context
- Public vs private posture
- Realistic vs stylized
- Initials preference
- Tone
- Memorability
- Spelling risk
- Optional risk notes

### Product / codename

Names for products, apps, companies, tools, features, services, or internal initiatives.

Primary job:

> Help me find names that are memorable, pronounceable, tone-appropriate, and usable in a market or team context.

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

## Explicitly deferred mode: baby names

Baby names should not be the next major feature.
