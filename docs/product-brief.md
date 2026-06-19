# Name Forge product brief

## Product thesis

Name Forge is a random-name workbench for generating names that are not only novel, but usable, explainable, reproducible, and tuned to a specific naming job.

The product should not be understood as a single fantasy-name generator. Fiction cast is the first serious mode because it exercises many of the hardest shared primitives: seeded generation, style anchoring, silhouette planning, ensemble balance, role metadata, optional role influence, Fit scoring, variants, provenance, and export.

## Who it serves

Name Forge is for people who need names as part of creative or product work:

- writers naming fictional casts
- game masters and game writers naming NPCs, factions, places, and artifacts
- creators evaluating pen names or handles
- teams naming projects, prototypes, tools, tiers, and launches
- worldbuilders creating coherent naming systems

These users usually need more than one random suggestion. They need a workbench that can produce options, compare them, explain them, preserve context, and let the user iterate.

## Why modes exist

Different naming jobs need different defaults, controls, result cards, scoring priorities, and export contracts.

A fiction cast, an NPC list, a pen name, a product codename, and a place-name set can reuse the same generation primitives, but they are not the same user experience. Modes let Name Forge reuse shared machinery while presenting each naming job in its own language.

The top-level product question is:

> What are you naming?

The answer should choose a mode. The mode should then define the right defaults, controls, output shape, and evaluation criteria.

## Current active mode

### Fiction cast

Primary job:

> Help me name a cast of characters that feel coherent but distinct.

Current strengths:

- cast-size and seed controls
- style-pack anchoring
- name-format variation
- rarity distribution controls
- role presets and slot overrides
- optional role influence
- compact result cards
- Details and Fit sections
- JSON and Markdown cast export
- provenance-bearing generated names and variants

Current gaps:

- no lock/regenerate workflow for individual names
- no explicit naming brief or constraints layer
- no custom style pack creation/import
- no second active mode to stress-test the mode boundary
- limited user-facing explanation of how role influence changes results

## Candidate future modes

These modes are product directions, not commitments to build all of them now.

| Mode | User job | Likely output | Shared primitives stressed |
| --- | --- | --- | --- |
| Fiction cast | Name a coherent ensemble of fictional characters. | Cast, roles, Details, Fit, export. | Silhouettes, ensemble balance, role influence, variants, provenance. |
| Game NPC | Generate usable names quickly for play/session prep. | Name, role, faction/species, compact hook. | Briefs, role influence, fast reroll, compact export. |
| Pen name | Evaluate pseudonyms for authors or creators. | Name, market fit, memorability, privacy/risk notes. | Briefs, scoring, style fit, screening. |
| Product / codename | Name products, projects, features, prototypes, or internal initiatives. | Name, rationale, tone fit, collision/risk notes. | Briefs, constraints, memorability, availability-looking variants. |
| Place / toponym | Generate place names or regional naming systems. | Place name, type, morphology, regional texture. | Style packs, morphology, set coherence, provenance. |
| Set / taxonomy | Name a coherent group of related items. | Named list with hierarchy or theme relationships. | Comparison pressure, shared affixes/themes, export. |

## Sequencing principles

1. **Do not add modes just to populate the selector.** A second mode should prove that the mode boundary is real.
2. **Harden Fiction cast first.** It should feel like a workbench, not a static random batch.
3. **Promote shared primitives deliberately.** A primitive should become shared because at least two modes need it or because it clearly belongs below mode presentation.
4. **Avoid genericizing the current mode.** Fiction cast should keep cast language, role controls, and cast export where they improve the mode.
5. **Prefer iteration tools before expansion.** Lock/regenerate and brief/constraints work will make every future mode stronger.

## Recommended next product slices

### 1. Lock and regenerate individual names

Make Fiction cast more workbench-like by letting users preserve good names and reroll weak names.

Potential capabilities:

- lock one or more generated names
- regenerate unlocked names only
- reroll one card while preserving cast size
- preserve export shape for the final cast

### 2. Naming brief primitive

Add a reusable brief layer that captures user intent beyond sliders.

Potential fields:

- audience or use context
- desired associations
- avoid list
- tone words
- domain or genre
- hard constraints

This primitive should be designed so Fiction cast can use it first, then Game NPC, Pen name, and Product/codename modes can reuse it later.

### 3. Role influence v2

Make role influence more legible.

Potential capabilities:

- show what each role profile nudges
- preview role influence before generation
- explain role-fit differences in Details/Fit
- keep Off as the default baseline

### 4. First second mode: Game NPC

Game NPC is the best first second mode because it is close enough to Fiction cast to reuse the engine, but different enough to validate mode-specific controls and outputs.

## Product non-goals for the next few slices

- Do not build a full plugin framework.
- Do not make multiple unfinished modes selectable.
- Do not make Fiction cast generic at the cost of product quality.
- Do not add external availability checks before local generation, scoring, and iteration are strong.
- Do not treat the old Phase One model as an active roadmap.
