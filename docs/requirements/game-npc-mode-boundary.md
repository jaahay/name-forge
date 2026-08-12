# Game NPC mode boundary

This document defines the implemented product boundary for **Game NPC** against the current shared Name Forge platform and the accepted naming-capability direction.

For the reusable naming hierarchy, see [`../decisions/0006-naming-capabilities-and-surface-composition.md`](../decisions/0006-naming-capabilities-and-surface-composition.md).

## User job

Game NPC serves this job:

> Give me one usable generated name quickly for tabletop, videogame, or interactive-fiction prep, with minimal setup and fast reroll.

Fiction Cast serves a different job:

> Help me build a coherent but distinct ensemble of character names.

Game NPC optimizes for speed and immediate use. Fiction Cast optimizes for roster construction, composition, comparison, locks, cast-level review, and cast export.

## Current cardinality decision

The implemented Game NPC surface generates **one name at a time**.

This is a **product decision**, not a shared backend limitation.

The shared `NameRequest -> NameResponse` contract supports exact `independent-set` quantities from 1 through 100, but Game NPC intentionally omits quantity/grouping so the request resolves through the singular-compatible default.

That keeps the current surface focused on:

- generate one name;
- inspect one artifact;
- copy/use it immediately;
- reroll with a fresh seed.

Shared multiplicity does not by itself authorize NPC roster UX.

## Naming capability direction

Game NPC is a product surface, not a semantic naming primitive.

The accepted dependency is:

```text
Game NPC UX/state
  -> choose/configure reusable semantic callback
  -> generateName(...)
  -> style / sound / spelling mechanics
  -> NameArtifact
```

The exact semantic callback Game NPC should use depends on the naming job the surface exposes. A generic humanoid NPC may use a given/family-name capability; another future NPC workflow may need a faction, place, creature, or other semantic naming domain.

The surface owns how its UX derives configuration. The reusable semantic callback owns the domain meaning. The generic `generateName(...)` primitive owns one-name orchestration. `mode: "game-npc"` must not become a hidden semantic switch in generic generation.

The semantic callback layer is not implemented yet. The shared request adapter now delegates singular production through the implemented generic `generateName(...)` boundary, so Game NPC no longer reaches a silhouette-shaped naming API.

## Current platform pipeline

Today, Game NPC is a thin surface over the shared request/artifact platform:

```text
Game NPC product input
  -> NameRequest (mode metadata + criteria + seed)
  -> shared NameResponse adapter
  -> generic singular generateName(...)
  -> internal NameGenerationPlan
  -> SoundProfile / SoundCandidate / SegmentSequence
  -> complete supported spelling pool
  -> deterministic spelling ranking and selection
  -> NameArtifact
  -> shared artifact analysis / inspection
```

The current `GameNpcView` supplies:

- `mode: "game-npc"` as metadata;
- one practical `single-name` criterion;
- the selected style source through adapter options;
- a deterministic seed for replay or a fresh seed for reroll.

The surface does not own a second sound generator, request family, artifact model, analysis model, or artifact renderer.

The current generic singular boundary is deliberately domain-neutral: `GenerateNameOptions` contains no Game NPC mode or semantic name-kind label. Future semantic callbacks should sit above it without changing Game NPC's current user-facing behavior merely for architecture cleanup.

## Current input boundary

The visible Game NPC workflow deliberately exposes a small input surface:

- style source;
- reroll/generate action.

The current surface does not expose speculative human-facing controls merely because similarly named internal heuristics or settings exist.

In particular, user-facing claims such as universal pronounceability, familiarity, memorability, beauty, realism, or cultural authenticity require a defensible product model and evidence before they become Game NPC controls or scores.

A future context control such as faction, region, species, class, or genre may derive shared criteria, typed semantic configuration, or both. It must not become an opaque mode-driven branch inside `generateName(...)` or `generateSound(...)`.

## Future NPC plurality

There are two different possible future needs.

### Independent names

If Game NPC simply needs N unrelated names under the same normalized shared criteria, the existing atomic `independent-set` request contract may be sufficient.

That path should preserve the existing deterministic parent/child seed and ordered-artifact contract rather than disguising unrelated client-side calls as one atomic request.

### NPC-specific roster semantics

If an NPC roster needs encounter roles, per-slot semantic kinds, shared regional configuration, locks, coordinated reroll, cross-name contrast, preserved roster state, or other product relationships, those semantics may belong to **Game NPC surface orchestration**.

Such an aggregate may compose reusable semantic callbacks and remain Game-NPC-specific. It does not need to become a new generic `NameGrouping` kind or a universal `NpcRosterRequest` merely because multiple names are involved.

A reusable aggregate contract should be extracted only if multiple surfaces later demonstrate the same cross-name semantics.

## Same-sound spelling contract

For one generated sound sequence, Name Forge derives the complete spelling pool supported by the current grapheme inventory and deterministically ranks that full pool before presentation limits are applied.

The ranking is a **rule-weighted orthographic preference**, not a universal beauty or human-likelihood score.

Important invariants:

- candidate count does not participate in spelling generation, scoring, or sorting;
- bounded views are exact prefixes of the complete ranked result for identical inputs;
- changing only a display limit cannot change the selected spelling or earlier-ranked candidates;
- the complete ranked spelling evidence remains part of the generated artifact contract even when the UI shows a smaller prefix.

The phrase “all supported spellings” means all realizations derivable from the current model inventory, not every spelling a person could invent outside that inventory.

## Shared artifact rendering contract

`NameArtifact` is the reusable result contract across active surfaces.

Game NPC uses the shared `NameArtifactInspector` rather than a surface-specific artifact renderer.

Shared Inspect may expose facts such as:

- display name;
- modeled sound evidence;
- selected spelling and retained alternatives;
- deterministic spelling-selection explanation;
- readability observations;
- variants;
- approximate browser voice draft;
- copy actions.

Game NPC adds fast reroll around that shared surface. Fiction Cast adds cast-specific context and composition around the same artifact-reading boundary.

A future surface must not create a parallel renderer merely to rename common artifact facts.

## Shared artifact analysis contract

Artifact analysis is derived through pure shared functions rather than becoming surface-owned mutable state.

Single-artifact evidence may include deterministic generated facts such as segment count, syllable structure, cadence, spelling count/rank, selection explanation, and readability notices.

Set-level analysis may inspect artifact collections for concrete modeled relationships. Those shared analysis capabilities do not imply that singular Game NPC should present roster-level analysis before a roster workflow exists.

Surface presentation must distinguish deterministic model evidence from claims about universal human perception or confusion.

## Audition boundary

Game NPC reuses the shared browser audition stack.

Browser playback is an approximation derived from modeled sound evidence. It is not IPA, a pronunciation dictionary, provider phoneme markup, or canonical pronunciation.

Provider-specific audio, pronunciation authority, or new phonological claims require separate contracts and are not part of the Game NPC surface merely because a Play action exists.

## Determinism and reroll

For the same selected style source and seed, Game NPC must reproduce the same singular artifact under the same engine/model version and data:

```text
same style source + same seed -> same singular artifact
same style source + fresh seed -> rerolled singular artifact
```

`mode: "game-npc"` remains metadata. It must not cause the shared generator to take a Game-NPC-specific generation branch.

Issue #186 preserves the existing request seed partition while routing singular generation through `generateName(...)`; the architectural change must not alter this deterministic user-visible behavior.

## Current implemented boundary

Game NPC currently includes:

- selectable active surface presentation;
- singular-compatible shared `NameRequest -> NameResponse` generation;
- singular production through the generic `generateName(...)` boundary;
- internal generation-plan materialization hidden from the surface/request caller;
- style-source selection;
- fresh-seed reroll;
- deterministic same-input replay behavior;
- complete supported spelling generation and deterministic ranking;
- shared `NameArtifactInspector` usage;
- shared readability, spelling, and sound evidence;
- shared browser audition behavior;
- participation in the product's artifact-oriented generated-result continuity through the surrounding app callback;
- separation from Fiction Cast ensemble state, identity grammar, locks, and cast review.

The broader platform additionally supports exact independent-set quantity/grouping and richer artifact-set analysis. Game NPC does not currently expose those capabilities as an NPC roster workflow.

## Deferred Game NPC product work

The following remain possible future Game NPC slices, not implied current behavior:

- selection/configuration of reusable semantic callbacks once those callbacks are implemented;
- independent NPC quantity UX where the existing `independent-set` contract is sufficient;
- NPC-specific roster orchestration where the cross-name semantics belong to this surface;
- context presets backed by explicit shared criteria and/or typed semantic naming configuration;
- user-facing per-context sound/style controls with clear product meaning;
- validated audience-specific pronounceability research;
- corpus-specific familiarity research;
- human-tested memorability research;
- semantic, genre, cultural, or realism claims backed by declared data and methodology;
- surface-specific roster persistence or restore UX;
- character hooks, biographies, or encounter generation;
- provider-specific audio, IPA, dictionaries, or pronunciation authority.

## Invariants

- No separate Game NPC sound generator.
- No `NpcRequest`, `GameNpcRequest`, or `NpcRosterRequest` merely because the UI surface differs.
- Reusable semantic callback names are allowed and expected when they represent domain semantics rather than surface identity.
- No mode-driven branch inside `generateName(...)` or generic sound mechanics.
- No fake one-member Fiction Cast state.
- No parallel artifact renderer or analyzer.
- No roster UI inferred solely from the existence of shared multiplicity.
- No requirement that nuanced NPC roster semantics become generic grouping.
- No caller-facing dependency on `NameSilhouette`; legacy `silhouette` artifact evidence is not a generation API.
- No derived analysis persisted into the durable artifact without an explicit versioned contract decision.
- No unsupported linguistic or psychological score presented as objective fact.
- No display cap applied before full-pool spelling ranking or selected-spelling resolution.
- No requested spelling count allowed to affect candidate generation, scoring, or ordering.
- Any bounded spelling result must be an exact prefix of the complete ranked result for identical model inputs.