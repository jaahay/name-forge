# Current product scope

This document is the active scope lens for deciding what Name Forge should build next. The historical requirements remain in [`product-requirements.md`](product-requirements.md).

Related decisions and boundaries:

- [`decisions/0001-name-artifact-and-request-contract.md`](decisions/0001-name-artifact-and-request-contract.md)
- [`decisions/0002-criteria-driven-generation.md`](decisions/0002-criteria-driven-generation.md)
- [`decisions/0003-intent-criteria-compiler-pipeline.md`](decisions/0003-intent-criteria-compiler-pipeline.md)
- [`decisions/0004-modes-presets-and-grouping.md`](decisions/0004-modes-presets-and-grouping.md)
- [`requirements/game-npc-mode-boundary.md`](requirements/game-npc-mode-boundary.md)
- [`requirements/name-grouping-design-boundary.md`](requirements/name-grouping-design-boundary.md)

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

V1 supports the existing singular default and an exact independent set. Omitted quantity/grouping returns one artifact through the previous singular seed stream; an explicit exact quantity returns a flat ordered `NameArtifact[]` with deterministic child seeds and grouping metadata. `mode` is optional metadata and must not drive core generation or grouping behavior.

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
- pure single-artifact and artifact-set analysis APIs;
- source descriptors and built-in style-pack validation;
- richer variant relationship, confidence, source, and locale metadata where available.

Fiction Cast additionally includes:

- deterministic ensemble generation;
- cast size, format, role mix, slot override, role influence, rarity, and tuning controls;
- lock and selection iteration;
- cast-level balancing and collision diagnostics;
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
| Browser audition draft | Shipped projection | Approximate browser speech derived from modeled sound; not canonical pronunciation. |
| Pronounceability | Research only as a human-facing metric | Requires a declared listener population, language assumptions, methodology, and validation. |
| Familiarity | Research only | Requires a declared corpus or audience. |
| Memorability | Research only | Requires evidence that the model predicts recall or recognition. |
| Beauty, realism, cultural authenticity | Unsupported as universal scores | Must not be inferred from internal weights or presented without declared evidence and governance. |
| IPA or provider audio | Deferred | Requires a separate locale, confidence, and provider strategy. |

The active rule is:

> Explain modeled structure and deterministic evidence. Do not claim validated human perception without validated human evidence.

## Next implementation sequence

### 1. Recent generated-name history

Add client-side persistence for recent durable `NameArtifact` snapshots.

Required boundary:

- persist explicit user-generated artifacts from active modes;
- use a versioned browser-storage envelope;
- keep a bounded recent list;
- restore artifacts into the shared inspector without regeneration;
- provide explicit clear-history behavior;
- ignore malformed or unsupported stored data safely;
- persist durable product artifacts, not internal runtime handles or unversioned component state.

Non-goals:

- no backend, accounts, sync, or collaboration;
- no compatibility adapter for obsolete pre-reset shapes;
- no persistence of internal-only `SoundProfile` state outside the artifact already carrying it intentionally;
- no generalized application-state framework.

### 2. First shared quantity and grouping slice — implemented

The shared request operation now supports an exact independent set with deterministic child seeds and explicit grouping metadata.

Implemented boundary:

- `NameArtifact` remains the individual result unit;
- plural output is produced by one atomic engine operation rather than repeated client-side singular calls;
- mode metadata remains separate from grouping semantics;
- output is a deterministic flat artifact array plus explicit grouping metadata;
- exact quantity is bounded from 1 through 100;
- contract tests cover quantity, child seeds, ordering, replay, prefix stability, indexed identity, and mode neutrality.

Still deferred:

- cohesion optimization;
- ranked-alternative semantics;
- slot-level criteria;
- partial-result recovery;
- per-artifact reroll behavior;
- Fiction Cast assumptions as shared engine behavior.

### 3. Evidence-led research and later diagnostics

Human-facing name metrics and same-roster sound proximity remain research or later diagnostic work. They must not block the implementation slices above.

## Explicit non-goals for the next slices

- No baby-name mode.
- No prompt-first UX or LLM-driven criteria compilation.
- No public criteria-fit percentage.
- No mode-specific request or response families.
- No IPA, paid TTS integration, or pronunciation dictionaries.
- No external demographic inference.
- No remote provider integration without an accepted source and validation contract.
- No broad plugin framework.
- No character biography or encounter generation.

## Issue hygiene baseline

Use one canonical issue per coherent slice. Completed issues remain closed through their merged implementation PRs. Exploration that is not required for the active slice belongs in a separate issue rather than expanding the current PR.
