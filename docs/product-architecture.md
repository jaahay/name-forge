# Name Forge product architecture

Name Forge should remain one product: a random-name workbench for producing inspectable `NameArtifact`s from user-declared naming criteria. Its first serious surface is **Fiction cast**, but the product should not collapse into only a fiction-cast generator.

The product can support multiple naming jobs that share core generation, scoring, comparison, diagnostics, export, and inspection primitives while giving each job its own controls, vocabulary, result presentation, and validation posture.

See [`product-brief.md`](product-brief.md) for the strategy-level thesis and recommended sequencing. See [`current-product-scope.md`](current-product-scope.md) for the current shipped baseline and next feature requirements. See [`decisions/0001-name-artifact-and-request-contract.md`](decisions/0001-name-artifact-and-request-contract.md), [`decisions/0002-criteria-driven-generation.md`](decisions/0002-criteria-driven-generation.md), [`decisions/0003-intent-criteria-compiler-pipeline.md`](decisions/0003-intent-criteria-compiler-pipeline.md), and [`decisions/0004-modes-presets-and-grouping.md`](decisions/0004-modes-presets-and-grouping.md) for the current request/criteria direction.

## Product language

Use **naming job** for the user's task: cast, NPC, product, pen name, place, handle, set, and so on.

Use **mode** for product/UI configuration around a naming job. Modes may choose labels, controls, skins, and defaults, but they should not automatically become backend engine primitives.

Use **criteria** for user-declared inputs that should influence generation.

Use **brief** only for a concise downstream summary of configured work or generated results. Do not use brief as the input contract.

Use **engine** only when discussing implementation internals.

The useful top-level product prompt is:

> What are you naming?

That prompt should route users into the right mode without fragmenting Name Forge into separate products.

## Product loop

Name Forge is a workbench for random names with a common loop:

```text
Criteria -> Generate -> Score/select -> Inspect -> Keep/regenerate/export
```

Each mode can tune the loop differently, but these shared product primitives should stay recognizable:

- **Criteria**: selected controls, chips, practical constraints, exclusions, and other declared name requirements.
- **Generate**: deterministic random candidate creation from a seed and compiled criteria.
- **Score/select**: functional candidate scoring used to choose names from generated candidates.
- **Compare**: future multiplicity and grouping pressure, including list distinctiveness and set cohesion.
- **Inspect**: selected-name facts, construction cues, scoring detail, variants, warnings, and diagnostics.
- **Export**: JSON, Markdown, or mode-specific handoff formats.

## Product shape

The durable workbench shape is:

```text
Configure criteria
  -> Candidates
  -> Inspect selected NameArtifact
```

The nouns may change as the UI matures, but the shape should remain stable. Configure is where the user declares criteria. Candidates are generated names. Inspect explains the selected artifact.

Mode-specific panels are allowed when the naming job earns them. Fiction cast can keep Cast Health, lock/select affordances, role labels, and cast export without turning those concepts into global product requirements.

## Intent surfaces and criteria

Intent surfaces are user-facing ways to declare criteria. They include sliders, compact controls, selected-criteria shelves, intent-family chips, drawer-based chip libraries, mode defaults, presets, saved preferences, and later LLM-assisted parsing.

These surfaces should produce explicit criteria. They should not directly generate names.

The initial user-facing criteria families should stay few and legible:

- Sound
- Shape
- Register
- Spelling
- Semantic / inspired-by
- Avoid
- Practical

The internal criteria model may be more precise than the UI labels. A single user-facing chip such as `Old maps` may compile into shape, register, spelling, and semantic criteria.

A large chip library should be exposed through selected shelves, suggested chips, drawers, subgroups, and search. Do not render the entire taxonomy as an always-visible control wall.

## Modes, presets, and skins

Modes are product/UI configurations for naming jobs. A mode may:

- prefill criteria
- choose suggested chips and drawer contents
- configure available UI sections
- choose a restrained visual skin or accent treatment
- choose labels, examples, empty states, and Inspect sections
- set default quantity or grouping intent later

Presets and base styles are frontend/client conveniences unless proven otherwise. A preset such as `British literary fantasy`, `Old maps`, or `NASA missions` can preselect criteria and adjust defaults. The backend does not need a mandatory `baseStyle` or `StylePack` field for the criteria-driven contract.

Name Forge should keep one stable workbench shell. The current hazy-brown fantasy palette is appropriate as a Cast/Fantasy skin, but it should not define the global product shell.

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

Longer term, Cast-specific ensemble behavior should be expressed through grouping and slot criteria rather than a foundational backend `Cast` primitive.

## Backend contract direction

The durable backend planning contract is:

```text
NameRequest -> NameResponse
```

`NameRequest` is criteria-driven. It may accept optional `mode` metadata, but v1 generation should not branch on mode.

Future multiplicity should extend the same request model through quantity and grouping rather than separate API families such as `CastRequest`, `ProductNameRequest`, or `NpcRequest`.

## Mode taxonomy

Candidate modes are planning surfaces, not implementation commitments. Each mode should have a user job, control model, result contract, and validation posture before it becomes active.

| Mode | Primary user job | Result contract | Shared primitives stressed | Suggested maturity |
| --- | --- | --- | --- | --- |
| Fiction cast | Name a coherent cast of fictional characters. | Generated names with cast-specific presentation, role labels, Inspect, Cast Health, JSON/Markdown export. | Silhouettes, ensemble balance, slot criteria, diagnostics, variants. | Active MVP, approaching polished. |
| Game NPC | Generate usable names quickly for tabletop, videogame, or interactive-fiction prep. | One or more names with compact context and fast reroll. | Criteria presets, compact export, lock/regenerate. | Best first second mode after criteria/request hardening. |
| Pen name | Generate pseudonyms for authors, creators, or public identity work. | Names with genre/market fit, memorability, privacy/risk notes. | Criteria, scoring, screening metadata. | Later non-fiction validation mode. |
| Product / codename | Name products, projects, features, prototypes, or launches. | Names with tone fit, risk/collision notes, shortlist export. | Practical criteria, memorability, spelling risk, future availability-looking variants. | Later product-work mode. |
| Place / toponym | Generate towns, regions, planets, rivers, institutions, and map-region systems. | Place-like names with morphology and regional texture. | Criteria presets, morphology, grouping, diagnostics. | Later worldbuilding mode. |
| Set / taxonomy | Name coherent groups: spells, ships, factions, tiers, AI agents, menu items, design tokens. | Named set with shared theme, hierarchy, or relation metadata. | Grouping, comparison pressure, shared affixes/themes, export. | Later set-work mode. |

## Candidate future modes

These are product directions, not implementation commitments for the current slice.

### Game / NPC quick names

A faster sibling of Fiction cast mode for prep or live play.

Primary job:

> Give me usable names quickly with minimal configuration.

Likely controls:

- Species, faction, class, role, or region as UI presets that compile into criteria
- Quantity, once multiplicity is supported
- Familiarity
- Pronounceability
- One-click reroll
- Optional compact hook
- Compact result cards

Why it is a good first second mode:

- It reuses many Fiction cast primitives.
- It has a different workflow: speed and low configuration matter more than deep ensemble browsing.
- It can validate whether result presentation and controls are genuinely mode-specific.

Do not start this until the criteria/request contract is stable enough for the mode to reuse shared primitives rather than fork them.

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
- Region or culture style as criteria presets
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

- Count, once multiplicity is supported
- Shared theme
- Distinctness
- Hierarchy or tiering
- Prefix or suffix consistency
- Set-level export

## Explicitly deferred mode: baby names

Baby names should not be the next major feature. Baby-name workflows imply real-world plausibility, social usability, cultural sensitivity, and higher duty of care than the current invented-name engine can support.
