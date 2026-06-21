# Name Forge product brief

## Product thesis

Name Forge is a random-name workbench for generating names that are not only novel, but usable, explainable, reproducible, and tuned to a specific naming job.

The product should not be understood as a single fantasy-name generator. Fiction cast is the first serious mode because it exercises many of the hardest shared primitives: seeded generation, style anchoring, silhouette planning, ensemble balance, role metadata, optional role influence, Naming Briefs, deterministic readability diagnostics, Fit scoring, variants, provenance, inspection, and export.

See [`current-product-scope.md`](current-product-scope.md) for the current scope lens and next feature requirements.

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
- Naming Brief controls for context, tone, associations, avoid terms, constraints, anchors, and notes
- deterministic brief influence metadata in generation, scoring, Inspect, and export
- compact result cards for scan/select/lock
- persistent Inspect panel for selected-name detail
- deterministic readability notes surfaced in Inspect and Cast Health
- Cast Health checks for roster-level coherence
- JSON and Markdown cast export
- provenance-bearing generated names, variants, brief influence, and diagnostics

Current gaps:

- variant metadata is still too thin for relationship, confidence, locale, and source-aware display
- source/provider descriptors do not yet model the full future built-in/file/HTTP/API/package/custom source contract
- built-in style packs do not yet have a formal validation layer
- collision and warning metadata is still early and should remain cautious
- no second active mode exists yet to stress-test the mode boundary
- role influence can be made more legible before it becomes editable or mode-specific

## Candidate future modes

These modes are product directions, not commitments to build all of them now.

| Mode | User job | Likely output | Shared primitives stressed |
| --- | --- | --- | --- |
| Fiction cast | Name a coherent ensemble of fictional characters. | Cast, roles, Inspect, Cast Health, Fit, export. | Silhouettes, ensemble balance, role influence, briefs, diagnostics, variants, provenance. |
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
5. **Prefer trust infrastructure before expansion.** Variant relationships, source descriptors, pack validation, warnings, and collision checks will make every future mode safer.
6. **Separate pronounceability from pronunciation.** Speakability scoring and diagnostics exist now; IPA, audio, and dictionary-backed pronunciation remain later artifacts.

## Recommended next product slices

### 1. Variant relationship metadata

Variants should become source-aware objects rather than display-only alternate spellings.

Potential capabilities:

- relationship type such as `orthographic_variant`, `creative_respelling`, `near_pronunciation`, or `regional_variant`
- confidence metadata
- generated/listed/curated/source distinction
- optional locale metadata
- clear Inspect and export display for variant provenance

This is the highest-leverage next slice because variants are already visible to users and included in exports.

### 2. Source descriptor + pack validation

The registry should gain a more durable source descriptor contract before custom packs, remote providers, pronunciation dictionaries, or source-rich modes appear.

Potential capabilities:

- typed descriptors for built-in, file, HTTP, API, package, and custom/user-pack sources
- license, locale, priority, enabled-by-default, and cache-policy metadata
- validation for built-in style pack shape
- clear boundary between source pointers/contracts and the data itself

This keeps the product aligned with the core rule: hard-code mechanisms, not linguistic knowledge.

### 3. Warning and collision scaffolding

Warnings should be introduced as a cautious local screening surface.

Potential capabilities:

- common-word collision notes
- known-name or anchor-distance warnings
- suspiciously dense similarity within a cast
- explicit warning metadata in Inspect and export
- no demographic inference, external search, or cultural certainty in this slice

### 4. Role influence v2

Make role influence more legible.

Potential capabilities:

- show what each role profile nudges
- preview role influence before generation
- explain role-fit differences in Inspect/Fit
- keep Off as the default baseline

### 5. First second mode: Game NPC

Game NPC remains the best first second mode because it is close enough to Fiction cast to reuse the engine, but different enough to validate mode-specific controls and outputs.

It should follow the trust/source-contract slices rather than precede them.

## Product non-goals for the next few slices

- Do not build a full plugin framework.
- Do not make multiple unfinished modes selectable.
- Do not make Fiction cast generic at the cost of product quality.
- Do not add external availability checks before local generation, scoring, source contracts, and iteration are strong.
- Do not treat the old Phase One model as an active roadmap.
- Do not make baby-name generation the next major feature.
- Do not add IPA, audio, or pronunciation dictionaries while readability diagnostics remain the only shipped pronounceability artifact.
- Do not add remote/API providers before source descriptors and pack validation exist.
