# Game NPC mode boundary

This document defines the implemented product boundary for **Game NPC** mode against the current shared Name Forge platform.

## User job

Game NPC serves this job:

> Give me one usable generated name quickly for tabletop, videogame, or interactive-fiction prep, with minimal setup and fast reroll.

Fiction Cast serves a different job:

> Help me build a coherent but distinct ensemble of character names.

Game NPC optimizes for speed and immediate use. Fiction Cast optimizes for roster construction, ensemble comparison, locks, cast-level review, and cast export.

## Current cardinality decision

The implemented Game NPC mode generates **one name at a time**.

This is now a **product decision**, not a shared backend limitation.

The shared `NameRequest -> NameResponse` contract supports exact `independent-set` quantities from 1 through 100, but Game NPC intentionally omits quantity/grouping so the request resolves through the singular-compatible default.

That keeps the mode focused on:

- generate one name;
- inspect one artifact;
- copy/use it immediately;
- reroll with a fresh seed.

A future short NPC roster may be useful for encounter prep. If selected, it must reuse the shared quantity/grouping contract rather than introduce `NpcRosterRequest`, repeated client-side singular requests presented as one atomic roster, or a forked generator.

Shared multiplicity does not by itself authorize NPC roster UX. A roster still needs an explicit product boundary for quantity controls, browsing, reroll semantics, persistence expectations, and any group-level evidence.

## Platform pipeline

Game NPC is a thin mode over the shared naming platform:

```text
Game NPC product input
  -> NameRequest (mode metadata + criteria + seed)
  -> shared NameResponse adapter
  -> current naming orchestration
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

The mode does not own a second sound generator, request family, artifact model, analysis model, or artifact renderer.

## Current input boundary

The visible Game NPC workflow deliberately exposes a small input surface:

- style source;
- reroll/generate action.

The current mode does not expose speculative human-facing controls merely because similarly named internal heuristics or settings exist.

In particular, user-facing claims such as universal pronounceability, familiarity, memorability, beauty, realism, or cultural authenticity require a defensible product model and evidence before they become Game NPC controls or scores.

A future context preset such as faction, region, species, class, or genre should compile into explicit criteria or a separately accepted semantic naming contract. It must not become an opaque mode-driven branch inside shared generation.

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

`NameArtifact` is the reusable result contract across active modes.

Game NPC uses the shared `NameArtifactInspector` rather than a mode-specific artifact renderer.

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

A future mode must not create a parallel renderer merely to rename common artifact facts.

## Shared artifact analysis contract

Artifact analysis is derived through pure shared functions rather than becoming mode-owned mutable state.

Single-artifact evidence may include deterministic generated facts such as segment count, syllable structure, cadence, spelling count/rank, selection explanation, and readability notices.

Set-level analysis may inspect artifact collections for concrete modeled relationships. Those shared analysis capabilities do not imply that singular Game NPC should present roster-level analysis before a roster workflow exists.

Mode presentation must distinguish deterministic model evidence from claims about universal human perception or confusion.

## Audition boundary

Game NPC reuses the shared browser audition stack.

Browser playback is an approximation derived from modeled sound evidence. It is not IPA, a pronunciation dictionary, provider phoneme markup, or canonical pronunciation.

Provider-specific audio, pronunciation authority, or new phonological claims require separate contracts and are not part of the Game NPC mode merely because a Play action exists.

## Determinism and reroll

For the same selected style source and seed, Game NPC must reproduce the same singular artifact under the same engine/model version and data:

```text
same style source + same seed -> same singular artifact
same style source + fresh seed -> rerolled singular artifact
```

`mode: "game-npc"` remains metadata. It must not cause the shared generator to take a Game-NPC-specific generation branch.

## Current implemented boundary

Game NPC currently includes:

- selectable active mode presentation;
- singular-compatible shared `NameRequest -> NameResponse` generation;
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

- an NPC roster UX built on shared exact quantity/grouping;
- context presets backed by explicit criteria bundles or accepted semantic naming capabilities;
- user-facing per-context sound/style controls with clear product meaning;
- validated audience-specific pronounceability research;
- corpus-specific familiarity research;
- human-tested memorability research;
- semantic, genre, cultural, or realism claims backed by declared data and methodology;
- mode-specific grouped persistence or roster restore UX;
- character hooks, biographies, or encounter generation;
- provider-specific audio, IPA, dictionaries, or pronunciation authority.

## Invariants

- No separate Game NPC generator.
- No `NpcRequest`, `GameNpcRequest`, or `NpcRosterRequest` without a demonstrated incompatibility with the shared contract.
- No mode-driven branch inside shared generation.
- No fake one-member Fiction Cast state.
- No parallel artifact renderer or analyzer.
- No roster UI inferred solely from the existence of shared multiplicity.
- No derived analysis persisted into the durable artifact without an explicit versioned contract decision.
- No unsupported linguistic or psychological score presented as objective fact.
- No display cap applied before full-pool spelling ranking or selected-spelling resolution.
- No requested spelling count allowed to affect candidate generation, scoring, or ordering.
- Any bounded spelling result must be an exact prefix of the complete ranked result for identical model inputs.