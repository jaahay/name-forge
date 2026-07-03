# Name Forge product brief

## Status

This is a strategy-level product brief. For active planning, start with [`name-request-planning.md`](name-request-planning.md) and [`current-product-scope.md`](current-product-scope.md).

This brief should stay concise. Detailed contracts belong in architecture docs, decision records, and requirements docs.

## Product thesis

Name Forge is a random-name workbench for generating names that are not only novel, but usable, inspectable, reproducible, and tuned to a specific naming job.

The product should not be understood as a single fantasy-name generator. Fiction cast is the first serious mode because it exercises many of the hardest shared primitives: seeded generation, sound-first generation, spelling projection, selected-name inspection, scoring, variants, diagnostics, export, and eventually grouping/ensemble behavior.

The current architectural direction is criteria-driven:

```text
Intent surfaces
  -> NameCriteria
  -> compiled criteria
  -> candidate generation and scoring
  -> NameArtifact
```

## Who it serves

Name Forge is for people who need names as part of creative or product work:

- writers naming fictional casts
- game masters and game writers naming NPCs, factions, places, and artifacts
- creators evaluating pen names or handles
- teams naming projects, prototypes, tools, tiers, and launches
- worldbuilders creating coherent naming systems

These users usually need more than one random string. They need a workbench that can produce options, compare them, inspect them, preserve context, and let the user iterate.

## Core product noun

The primary artifact is a `NameArtifact`.

A cast, shortlist, set, taxonomy, or grouped output is a collection or grouping of name artifacts. Those collection concepts may need their own presentation and selection logic, but they should not replace the name artifact as the center of the product.

## Why modes exist

Different naming jobs need different defaults, controls, result cards, scoring priorities, and export contracts.

A fiction cast, an NPC list, a pen name, a product codename, and a place-name set can reuse the same generation primitives, but they are not the same user experience. Modes let Name Forge reuse shared machinery while presenting each naming job in its own language.

The top-level product question is:

> What are you naming?

The answer can choose a mode. The mode may prefill criteria, choose suggested controls, adjust presentation, and apply a restrained visual skin. The backend should still be driven by criteria and seeded randomness rather than branching on mode in v1.

## Current active mode

### Fiction cast

Primary job:

> Help me name a cast of characters that feel coherent but distinct.

Current strengths:

- cast-size and seed controls
- style-pack selection
- name-format variation
- rarity distribution controls
- role presets and slot overrides
- optional role influence
- compact result cards for scan/select/lock
- persistent Inspect panel for selected-name detail
- deterministic readability notes surfaced in Inspect and Cast Health
- sound and browser audition projection for selected names
- spelling candidate retention in Inspect
- Cast Health checks for roster-level coherence
- JSON and Markdown cast export

Current gaps:

- criteria are not yet the explicit input contract
- `NameRequest -> NameResponse` is not yet implemented
- current style controls still route through a narrow `StyleInput` bridge
- variant metadata is still too thin for relationship, confidence, locale, and source-aware display
- source/provider descriptors do not yet model the full future built-in/file/HTTP/API/package/custom source contract
- built-in style packs do not yet have a formal validation layer
- collision and warning metadata is still early and should remain cautious
- no second active mode exists yet to stress-test the mode boundary

## Candidate future modes

These modes are product directions, not commitments to build all of them now.

| Mode | User job | Likely result | Shared primitives stressed |
| --- | --- | --- | --- |
| Fiction cast | Name a coherent ensemble of fictional characters. | Generated names with cast presentation, Inspect, Cast Health, export. | NameArtifact, grouping, role/slot criteria, diagnostics, variants. |
| Game NPC | Generate usable names quickly for play/session prep. | One or more names with compact context and fast reroll. | Criteria presets, compact export, lock/regenerate. |
| Pen name | Evaluate pseudonyms for authors or creators. | Name, market fit, memorability, privacy/risk notes. | Criteria, scoring, screening. |
| Product / codename | Name products, projects, features, prototypes, or internal initiatives. | Name, rationale, tone fit, collision/risk notes. | Practical criteria, memorability, spelling risk. |
| Place / toponym | Generate place names or regional naming systems. | Place-like name, type, morphology, regional texture. | Criteria presets, morphology, grouping, diagnostics. |
| Set / taxonomy | Name a coherent group of related items. | Named list with hierarchy or theme relationships. | Grouping, comparison pressure, shared affixes/themes, export. |

## Sequencing principles

1. **Do not add modes just to populate the selector.** A second mode should prove that the mode boundary is real.
2. **Stabilize the criteria/request contract first.** Future modes should reuse shared primitives rather than fork them.
3. **Promote shared primitives deliberately.** A primitive should become shared because at least two modes need it or because it clearly belongs below mode presentation.
4. **Avoid genericizing the current mode.** Fiction cast should keep cast language, role controls, and cast export where they improve the mode.
5. **Prefer trust infrastructure before broad expansion.** Variant relationships, source descriptors, pack validation, warnings, and collision checks will make future modes safer.
6. **Separate pronounceability from pronunciation.** Speakability scoring, readability diagnostics, and browser audition drafts exist now; IPA, paid audio, and dictionary-backed pronunciation remain later artifacts.
7. **Keep LLM out of v1.** Future LLM assistance may fill criteria, but the product should not rely on prompt-first generation.

## Recommended next product slices

The detailed implementation sequence is now maintained in [`requirements/name-request-v1-slices.md`](requirements/name-request-v1-slices.md).

High-level sequence:

1. `NameRequest` / `NameResponse` model contracts.
2. Request resolver and seed handling.
3. `NameArtifact` mapping from current generated names.
4. Singular `NameRequest -> NameResponse` adapter.
5. Criteria diagnostics bridge.
6. Small criteria-to-current-compiler mapping.
7. Internal candidate scoring boundary.
8. Configure criteria surface exploration.
9. Grouping design spike only.

Variant relationship metadata, source descriptors, warning scaffolding, and Game NPC mode remain valuable, but they should follow the criteria/request foundation rather than precede it.

## Product non-goals for the next few slices

- Do not build a full plugin framework.
- Do not make multiple unfinished modes selectable.
- Do not make Fiction cast generic at the cost of product quality.
- Do not add plural/grouped backend behavior before the singular request contract is stable.
- Do not expose public fit percentages before internal selection scoring has earned product meaning.
- Do not add external availability checks before local generation, scoring, source contracts, and iteration are strong.
- Do not treat the old Phase One model as an active roadmap.
- Do not make baby-name generation the next major feature.
- Do not add IPA, paid audio, or pronunciation dictionaries while readability/audition remain approximation surfaces.
- Do not add remote/API providers before source descriptors and pack validation exist.
