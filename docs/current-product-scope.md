# Current product scope

This document is the active scope lens for deciding what Name Forge should build next. The historical requirements remain in [`product-requirements.md`](product-requirements.md).

Related decisions and boundaries:

- [`decisions/0001-name-artifact-and-request-contract.md`](decisions/0001-name-artifact-and-request-contract.md)
- [`decisions/0002-criteria-driven-generation.md`](decisions/0002-criteria-driven-generation.md)
- [`decisions/0003-intent-criteria-compiler-pipeline.md`](decisions/0003-intent-criteria-compiler-pipeline.md)
- [`decisions/0004-modes-presets-and-grouping.md`](decisions/0004-modes-presets-and-grouping.md)
- [`requirements/game-npc-mode-boundary.md`](requirements/game-npc-mode-boundary.md)
- [`requirements/name-grouping-design-boundary.md`](requirements/name-grouping-design-boundary.md)
- [`implementation/sound-proximity-diagnostics.md`](implementation/sound-proximity-diagnostics.md)

## Active product contract

Name Forge is a multi-mode random-name workbench whose durable result is an inspectable `NameArtifact`.

The shared product contract is:

> Generate names that are novel, usable, explainable, reproducible, and tuned through explicit product controls without presenting internal heuristics as universal human truth.

The two active modes serve different jobs:

- **Fiction Cast:** help build a coherent but distinct ensemble of character names.
- **Game NPC:** provide one usable generated name quickly for prep or live play, with immediate inspection, copy, and reroll.

The product remains a generator and evaluation workbench. It is not a writing assistant that invents character hooks, biographies, or encounter content by default.

## Current platform contract

The shared architecture is criteria-driven and sound-first:

```text
Intent surfaces
  -> NameCriteria
  -> compiled criteria
  -> SoundProfile / SegmentSequence
  -> complete supported spelling pool
  -> deterministic orthographic preference ranking
  -> selected spelling + NameArtifact
  -> shared Inspect and export surfaces
```

The durable request boundary is implemented as:

```text
NameRequest -> NameResponse
```

The request contract supports the existing singular default and an exact independent set. Omitted quantity/grouping returns one artifact through the previous singular seed stream; an explicit exact quantity returns a flat ordered `NameArtifact[]` with deterministic child seeds and grouping metadata. `mode` is optional metadata and must not drive core generation or grouping behavior.

## Current shipped baseline

Shared platform capabilities now include:

- deterministic parent-seed resolution and replay through `NameRequest -> NameResponse`;
- exact independent-set quantities from 1 through 100;
- deterministic index-stable child seeds, ordered artifacts, and grouping metadata;
- singular-compatible defaults when quantity and grouping are omitted;
- criteria diagnostics and a compiler bridge into current generation settings;
- sound-first generation through `SoundProfile` and `SegmentSequence`;
- exhaustive spelling derivation from the current grapheme inventory;
- deterministic rule-weighted spelling ranking with ordinal tie-breaking;
- complete ranked spelling retention on `NameArtifact`;
- exact bounded-result prefix invariance after full-pool ranking;
- shared `NameArtifactInspector` rendering;
- deterministic readability observations and browser audition projection;
- provenance-preserving identity audition phrases for composed names, retaining generated sound evidence for sound-backed given, family, and place parts while leaving lexical text and literals explicit (issue #174);
- semantic component-generation contexts for given, family, and place sound-backed parts, with current defaults preserving existing generation behavior while establishing a future internal override seam (issue #176);
- pure single-artifact and artifact-set analysis APIs;
- deterministic same-roster sound-relationship evidence with typed details, exact pair identity, and fixed precedence and ordering;
- source descriptors and built-in style-pack validation;
- richer variant relationship, confidence, source, and locale metadata where available;
- versioned, bounded browser persistence for explicit user-generated `NameArtifact` snapshots;
- a Recent names surface that restores saved artifacts into the shared inspector without regeneration;
- explicit clear-history behavior and safe handling of malformed, unsupported, or unavailable browser storage.

Fiction Cast additionally includes:

- deterministic ensemble generation;
- cast size, format, role mix, slot override, role influence, rarity, and tuning controls;
- a compact post-generation summary bar that keeps Tune and Regenerate available without leaving the full criteria summary in the primary reading path (issue #176);
- lock and selection iteration;
- selected-name single-slot reroll with non-target preservation, lock semantics, selection continuity, and targeted Recent names recording (issue #167);
- full-card collapsed-name selection with a separately actionable lock control;
- an integrated Names + Inspect workbench with the roster and selected artifact presented as two regions of one surface (issue #176);
- a decision-oriented primary inspector centered on modeled sound parts and base spelling, with readability notes, variants, cast context, composition, and scoring consolidated behind one `More details` disclosure (issues #174 and #176);
- composed-name sound presentation that exposes only generated sound-backed components in the visible Sound surface while full phrase-level browser playback retains lexical and literal connective text (issue #176);
- full phrase-level browser voice drafts for composed identities while retaining modeled sound projection for simple names (issue #174);
- cast-level balancing and collision diagnostics without repeated-initials presentation chrome;
- a collapsed Cast review surface that exposes actionable cast notes and same-roster sound relationships without permanently presenting healthy diagnostic prose (issue #176);
- pair-grouped same-roster sound relationships with plain-language labels and typed technical evidence;
- direct artifact-ID navigation from either sound-relationship name into the existing selected-name Inspect, Lock, and reroll workflow (issue #170);
- JSON and Markdown cast export.

Game NPC additionally includes:

- a minimal singular generation workflow;
- style-source selection;
- fast reroll with a fresh seed;
- shared artifact inspection, copy, and browser voice-draft actions.

## Human-facing claims boundary

Name Forge may expose deterministic facts about generated structure, spelling alternatives, and observed read friction. It must not relabel internal weighted heuristics as validated human-facing metrics.

| Concept | Current status | Product boundary |
| --- | --- | --- |
| Readability diagnostics | Shipped deterministic evidence | Reports concrete letter-pattern and structure observations; not a measured ease score. |
| Browser audition draft | Shipped projection | Approximate browser speech derived from modeled sound and provenance-preserving composed-name phrase projection; not canonical pronunciation. |
| Same-roster sound relationships | Shipped deterministic evidence and Fiction Cast presentation | Reports exact modeled relationships between artifacts from one explicit roster snapshot; not measured human similarity or confusion. |
| Pronounceability | Research only as a human-facing metric | Requires a declared listener population, language assumptions, methodology, and validation. |
| Familiarity | Research only | Requires a declared corpus or audience. |
| Memorability | Research only | Requires evidence that the model predicts recall or recognition. |
| Beauty, realism, cultural authenticity | Unsupported as universal scores | Must not be inferred from internal weights or presented without declared evidence and governance. |
| IPA or provider audio | Deferred | Requires a separate locale, confidence, and provider strategy. |

The active rule is:

> Explain modeled structure and deterministic evidence. Do not claim validated human perception without validated human evidence.

## Next implementation sequence

### 1. Prune and select the next product slice

Issues #167, #170, #172, #174, and #176 are part of the shipped Fiction Cast baseline. Before authorizing another implementation slice, prune this document again and select one bounded next step explicitly. Do not infer broader evaluation, optimization, mode, grouping, provider, help-system, per-component control, or shell work from deferred architecture vocabulary alone.

## Research-only backlog

### Human-facing name metrics — issue #152

Issue #152 is the governance boundary for claims such as pronounceability, familiarity, memorability, beauty, realism, or cultural authenticity. It is not part of the active implementation sequence.

A metric may move into a separate bounded implementation issue only after it has:

- a declared audience, listener population, language, locale, genre, or corpus;
- an exact construct and methodology;
- validation data or expert evidence;
- confidence, limitations, and known failure cases;
- a concrete user decision it improves;
- accurate UX copy explaining what is and is not being estimated.

## Deferred product and grouping work

The following remain possible later slices but are not authorized by this document:

- cohesion or diversity optimization;
- ranked-alternative grouping semantics;
- slot-level criteria or slotted sets;
- explicit per-component given/family/place tuning controls or public request overrides;
- partial-result recovery;
- Fiction Cast assumptions as shared engine behavior;
- Game NPC roster UI;
- dedicated Help/FAQ presentation;
- broader shell or visual-system redesign.

## Explicit non-goals for the next slice

- No baby-name mode.
- No prompt-first UX or LLM-driven criteria compilation.
- No public criteria-fit percentage.
- No mode-specific request or response families.
- No IPA, paid TTS integration, or pronunciation dictionaries.
- No external demographic inference.
- No remote provider integration without an accepted source and validation contract.
- No broad plugin framework.
- No character biography or encounter generation.
- No per-component tuning UI without a separately authorized user-facing contract.

## Issue hygiene baseline

Use one canonical issue per coherent slice. Completed issues remain closed through their merged implementation PRs. Exploration that is not required for the active slice belongs in a separate issue rather than expanding the current PR.
