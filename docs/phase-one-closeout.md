# Phase One closeout

The original PRD used phases as a tracking metaphor. That helped during project inception, but the implementation has now moved beyond the phase map.

This document closes out Phase One as a product-planning concept and replaces it with a mode-and-primitives tracking model.

## What Phase One meant

Phase One was the foundation slice:

- Vite + TypeScript + React scaffold
- domain types
- deterministic seeded randomness
- fallback sound-pattern generator
- at least one style pack
- basic generated-name rendering

That foundation is complete.

## What was completed beyond Phase One

The current product also includes substantial work that originally belonged to later phases:

- first-class `NameSilhouette` modeling
- cast/ensemble generation
- ensemble balancing
- decomposed scoring metadata
- spelling variants
- provider/source registry abstraction
- provenance-bearing output
- JSON and Markdown export
- role presets and slot overrides
- rarity distribution controls
- optional role influence
- compact result cards with nested Details and Fit sections
- in-app changelog and About surfaces
- documented multi-mode product direction

The product is therefore not merely past Phase One; it has a coherent Fiction cast mode that exercises the core engine primitives.

## What remains intentionally incomplete

These are not Phase One blockers:

- multiple implemented naming modes
- user-defined style packs
- pronunciation hints, IPA, or audio
- real-world frequency data
- cultural/demographic bias warning system
- real-person collision checks
- remote providers or API-backed sources
- login, cloud persistence, collaboration, or backend service

Those remain expansion work.

## Why retire the phase model

The phase list was linear, but the product did not evolve linearly. Work from later phases became necessary to make the first serious mode credible.

Continuing to track by phases would create false signals:

- It would imply foundational work is unfinished when the foundation is already usable.
- It would hide the fact that Fiction cast mode is now the real product surface.
- It would encourage generic abstraction before a second mode exists.
- It would blur the difference between product maturity and merge readiness.

## Replacement tracking model

Track future work by three dimensions.

### 1. Mode maturity

A mode is mature when it has:

- a clear user job
- mode-specific settings and vocabulary
- appropriate defaults
- result presentation that fits the job
- export shape that serves downstream use
- tests for its current contract

Current status:

| Mode | Status |
|---|---|
| Fiction cast | First serious mode, active |
| Brand / product | Documented direction only |
| Project codename | Documented direction only |
| Place / toponym | Documented direction only |
| Username / handle | Documented direction only |
| Game / NPC quick names | Documented direction only |
| Set / taxonomy naming | Documented direction only |

### 2. Shared primitive maturity

A primitive is mature when more than one mode could reasonably reuse it without fiction-specific assumptions leaking through.

Current shared primitives:

- seeded random generation
- style packs
- source/provider registry
- silhouettes
- candidate generation
- scoring
- ensemble/list comparison pressure
- variants
- provenance
- export mechanics

### 3. Validation posture

A branch can be:

- **Exploratory**: implementation still changing; CI should stay quiet.
- **Draft PR**: scoped review surface exists; CI should usually stay quiet.
- **Merge-ready**: scope frozen; CI should run automatically from a merge-readiness signal.

CI is therefore configured for merge-readiness signals rather than every push.

## Closeout decision

Phase One is complete and retired as a tracking mechanism.

Going forward, use:

- `docs/product-architecture.md` for product direction
- `docs/architecture.md` for current implementation architecture
- GitHub issues for scoped implementation slices
- mode maturity and shared primitive maturity as the planning language
