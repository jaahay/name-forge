# Name Forge product architecture

Name Forge should remain one product: a random-name workbench. Its first serious mode is **Fiction cast**, but the product should not collapse into only a fiction-cast generator.

The product should support multiple naming modes that share core generation, scoring, comparison, export, and provenance primitives while giving each mode its own controls, vocabulary, result presentation, and validation criteria.

See [`product-brief.md`](product-brief.md) for the strategy-level thesis and recommended sequencing. See [`current-product-scope.md`](current-product-scope.md) for the current next-feature decision.

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
Style -> Constraints -> Generate -> Score -> Compare -> Export
```

Each mode can tune the loop differently, but these shared product primitives should stay recognizable:

- **Style**: source packs, texture, tone, domain, language feel, or theme pools.
- **Constraints**: quantity, format, length, rarity, memorability, pronounceability, brief terms, or mode-specific requirements.
- **Generate**: deterministic random candidate creation from a seed and settings.
- **Score**: explainable quality signals for ranking and filtering names.
- **Compare**: ensemble balance, duplicate pressure, similarity pressure, or list coherence.
- **Inspect**: selected-name explanation, construction cues, scoring detail, and future diagnostics.
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

- Compact browsing cards for scan/select/lock
- Persistent Inspect panel for selected-name details
- Cast Health panel for roster-level checks
- JSON and Markdown cast export

Fiction cast mode is allowed to be fiction-specific. Its role controls, cast language, slot overrides, inspection, cast health, and cast export should not be watered down merely to look generic.

## Mode taxonomy

Candidate modes are planning surfaces, not implementation commitments. Each mode should have a user job, control model, result contract, and validation posture before it becomes active.

| Mode | Primary user job | Result contract | Shared primitives stressed | Suggested maturity |
| --- | --- | --- | --- | --- |
| Fiction cast | Name a coherent cast of fictional characters. | Cast list, role metadata, cards, Inspect, Cast Health, JSON/Markdown export. | Silhouettes, ensemble balance, role influence, variants, provenance. | Active MVP. |
| Game NPC | Generate usable names quickly for tabletop, videogame, or interactive-fiction prep. | Names with role/faction/species hints, compact hook, fast reroll. | Briefs, role profiles, compact export, lock/regenerate. | Best first second mode. |
| Pen name | Generate pseudonyms for authors, creators, or public identity work. | Names with genre/market fit, memorability, privacy/risk notes. | Briefs, style fit, scoring, screening metadata. | Later non-fiction validation mode. |
| Product / codename | Name products, projects, features, prototypes, or launches. | Names with rationale, tone fit, risk/collision notes, shortlist export. | Briefs, constraints, memorability, availability-looking variants. | Later product-work mode. |
| Place / toponym | Generate towns, regions, planets, rivers, institutions, and map-region systems. | Place names with type, morphology, and regional texture. | Style packs, morphology, set coherence, provenance. | Later worldbuilding mode. |
| Set / taxonomy | Name coherent groups: spells, ships, factions, tiers, AI agents, menu items, design tokens. | Named set with shared theme, hierarchy, or relation metadata. | Comparison pressure, shared affixes/themes, export. | Later set-work mode. |

## Candidate future modes

These are product directions, not implementation commitments for the current slice.

### Game / NPC quick names

A faster sibling of Fiction cast mode for prep or live play.

Primary job:

> Give me usable names quickly with minimal configuration.

Likely controls:

- Brief or use context
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

Baby-name generation is a separate real-world naming product. It has higher stakes than fictional naming and requires stronger cultural, demographic, religious, family-history, source-licensing, frequency, and bias/risk infrastructure than Name Forge currently has.

The product can eventually support real-world name work, but baby names should follow stronger provenance, source-pack, and bias controls.

## Explicitly deferred artifact: IPA

IPA output should not be the next major feature.

IPA is not a naming mode. It is a pronunciation artifact that requires locale assumptions, phoneme inventories, dictionary/provider strategy, invented-name fallback rules, and confidence labels.

Near-term work should focus on pronounceability/readability diagnostics rather than canonical pronunciation claims.

## Mode maturity model

Track mode work with explicit maturity levels instead of phases.

| Level | Meaning | Evidence |
| --- | --- | --- |
| Concept | The user job is named but not implemented. | Brief description, target user, candidate controls. |
| Prototype | The mode can generate something but may borrow generic UI. | Basic config, manual exploration, known gaps. |
| Usable | The mode has coherent controls, results, and export for its job. | Smoke tests, deterministic fixtures, docs. |
| Polished | Iteration tools and explanations make the mode workbench-like. | Lock/reroll, brief support, strong result cards, validated copy. |
| Stable | The mode has durable contracts and can guide future modes. | Exact tests, mature docs, low churn in config/result shape. |

Fiction cast is currently between **Usable** and **Polished**. Naming brief support and pronounceability diagnostics are the most direct path toward Polished.

## Shared primitive maturity model

Track shared primitives separately from modes.

| Primitive | Current role | Maturity question |
| --- | --- | --- |
| Seeded random generation | Reproducibility base. | Does every mode expose or preserve reproducibility appropriately? |
| Silhouettes | Pre-spelling shape contract. | Can non-fiction modes use or adapt silhouettes without fiction assumptions? |
| Style packs | Soft-coded language feel. | Can users eventually create/import packs safely? |
| Scoring / Fit | Ranking and explanation. | Are mode-specific scoring priorities explicit? |
| Ensemble/list comparison | Diversity and coherence pressure. | Can it support lists beyond casts? |
| Role influence | Optional mode-specific nudge layer. | Can profiles be explained and edited without magic? |
| Variants | Alternative spellings and related names. | Are variant relationships clear across modes? |
| Provenance | Explanation and reproducibility. | Does every output explain why it exists? |
| Export | Handoff format. | Can export shapes vary by mode while reusing mechanics? |
| Briefs | User intent capture. | Next major shared primitive. |
| Pronounceability diagnostics | Readability/speakability explanation. | Can diagnostics stay deterministic and non-canonical before pronunciation artifacts exist? |

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
- Future naming briefs
- Future pronounceability diagnostics

### Fiction cast responsibilities

- Cast vocabulary
- Role mix and slot overrides
- Role influence
- Cast size language
- Name-card scanning behavior
- Inspect presentation
- Cast Health presentation
- Cast-oriented JSON and Markdown copy
- Result cards optimized for character-name scanning

### Future mode responsibilities

Each future mode should own its own:

- default settings
- controls
- labels and vocabulary
- scoring priorities
- result card presentation
- inspection presentation
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
- Avoid making export, Fit metadata, or diagnostics dominate the primary generation loop.
- Let result-card presentation vary by mode and user intent later.
- Keep cards scannable; move overflow explanation into Inspect or mode-specific detail surfaces.

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
- Do not build baby-name generation next.
- Do not add IPA/audio before deterministic pronounceability diagnostics exist.

## Related work

- #36 introduced fiction-cast role and rarity controls.
- #37 introduced optional role-specific naming influence.
- #38 tracks the multi-mode product architecture direction.
- #66 tracks the product decision on pronunciation as a requirement.
