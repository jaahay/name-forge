# Game NPC mode boundary

This document defines the implemented product and platform boundary for **Game NPC** mode.

## User job

Game NPC serves this job:

> Give me one usable generated name quickly for tabletop, videogame, or interactive-fiction prep, with minimal setup and fast reroll.

Fiction Cast serves a different job:

> Help me build a coherent but distinct ensemble of character names.

Game NPC optimizes for speed and immediate use. Fiction Cast optimizes for roster construction, ensemble comparison, locks, cast-level diagnostics, and cast export.

## Cardinality decision

The implemented Game NPC mode generates **one name at a time**.

That is intentional:

- it matches the current singular `NameRequest -> NameResponse` v1 behavior;
- it supports generate, inspect, copy, and reroll during live play;
- it avoids disguising one NPC as a one-member cast;
- it avoids inventing mode-specific plural behavior before the shared quantity/grouping contract exists.

A future short NPC roster may be useful for encounter prep. It must use the shared quantity and grouping model when that contract is implemented. It must not become a separate `NpcRosterRequest`, repeated client-side singular requests presented as one atomic roster, or a forked generator.

## Platform pipeline

Game NPC is a thin mode over the shared naming platform:

```text
NameRequest
  -> existing criteria compiler
  -> SoundProfile / SegmentSequence
  -> exhaustive supported spelling pool
  -> deterministic orthographic preference ranking
  -> selected spelling + NameArtifact
  -> analyzeNameArtifact
  -> shared NameArtifactInspector
```

The mode owns navigation, labels, style-source selection, reroll behavior, and mode-specific surrounding actions. It does not own a second phonological engine, request family, artifact model, analysis model, or artifact renderer.

## Current input boundary

The initial Game NPC workflow exposes only the shared style source and seed behavior.

It does not expose speculative controls for:

- pronounceability;
- familiarity;
- memorability;
- beauty;
- realism;
- cultural authenticity;
- sound texture;
- spelling style.

Those labels are not useful merely because internal generator settings or heuristics exist. A user-facing control must correspond to a clear product intent and a defensible model.

The spelling display cap is different. It is a local presentation preference, not a generation criterion. Changing it reveals more or fewer already-ranked spellings without regenerating the sound or changing the selected spelling.

## Same-sound spelling contract

For one generated sound sequence, Name Forge derives every spelling supported by the current grapheme inventory. The engine ranks the full pool before any display cap is applied.

The ranking is an **orthographic preference**, not a universal beauty score:

- conventional segment-to-grapheme mappings carry the strongest base weight;
- recognizable alternatives follow;
- unusual or heavily expanded mappings rank lower;
- profile distinctiveness and texture may reorder otherwise plausible alternatives;
- deterministic text ordering breaks exact score ties.

This supports a result shape such as:

```text
more conventional
  -> Sean
  -> Shawn
  -> Shon
  -> ...
  -> Phsawn
less conventional
```

The specific forms depend on the available segment-to-grapheme rules. “All supported spellings” means every orthographic realization derivable from that inventory, not every spelling a person could invent outside the model.

The inspector defaults to the top **10** same-sound spellings. The user can change the cap from 1 up to the full supported count. The cap affects only rendering and copied details; the complete ranked pool remains attached to the artifact.

## Shared artifact rendering contract

`NameArtifact` is the reusable result contract across modes.

Both Fiction Cast and Game NPC render common facts through `NameArtifactInspector`, including:

- display name;
- sound sketch;
- sound-derived pronunciation guide;
- browser voice draft state;
- deterministic structure facts;
- selected spelling;
- total supported same-sound spelling count;
- a configurable top-N view of the ranked same-sound spellings;
- spelling-selection explanation;
- readability diagnostics;
- variants;
- copy-name and copy-details actions.

Modes may compose additional sections and actions around the shared inspector:

- Fiction Cast adds lock controls, cast context, generated shape, score detail, name parts, and role influence.
- Game NPC adds reroll behavior.

A mode must not create a parallel renderer for common `NameArtifact` facts.

## Shared artifact analysis contract

Artifact analysis is derived through pure platform functions rather than persisted into `NameArtifact`:

```ts
analyzeNameArtifact(artifact)
analyzeNameArtifactSet(artifacts)
```

This keeps the durable artifact contract focused while allowing every mode to compute the same evidence.

### Reasonable single-artifact analysis

The platform may expose deterministic observations that follow directly from generated structure or retained candidates:

- segment count;
- syllable count;
- syllable shapes;
- stress pattern;
- cadence;
- supported same-sound spelling count;
- selected spelling rank;
- runner-up spelling;
- deterministic selection explanation;
- readability notice and warning counts.

These are observations or explanations of actual generator state. They are not claims about universal human perception.

### Reasonable artifact-set analysis

The platform may inspect any `NameArtifact[]` for concrete pairwise collisions:

- identical normalized display text;
- shared initials;
- shared endings;
- one-edit spelling proximity;
- identical cadence keys based on stress pattern, syllable count, and rhythm.

The API reports the collision kind and evidence. It does not collapse these facts into a universal fit, quality, or confusion percentage. Same-roster sound proximity remains deferred to issue #154.

## Why pronounceability is not a current score

Name Forge does not currently possess a validated scalar pronounceability model.

A meaningful claim would require at least:

- a declared listener language or language family;
- phonotactic legality and markedness for that population;
- syllable structure, stress, sonority transitions, cluster complexity, and segment inventory;
- separation of sound-generation difficulty from spelling interpretation;
- empirical or expert validation showing that the model predicts human performance.

The current sound structure, audition projection, browser voice approximation, and read-friction diagnostics do not justify a universal “78% pronounceable” score.

## Why familiarity and memorability are not current scores

Familiarity requires a declared corpus or audience. It may refer to lexical frequency, phonological-neighborhood density, cultural exposure, spelling-pattern frequency, genre exposure, or prior experience.

Memorability requires evidence that a model predicts recall or recognition. Distinctiveness, length, rhythm, and spelling complexity may contribute, but internal weighted heuristics do not become a valid UX claim without validation.

These ideas remain research work, not current product facts.

## Determinism and reroll

The same style source and seed must produce the same singular `NameArtifact`.

```text
same style source + same seed -> same singular artifact
same style source + fresh seed -> rerolled singular artifact
```

Changing the spelling display cap does not alter either mapping.

## Implemented in this slice

- selectable Game NPC mode;
- singular shared `NameRequest -> NameArtifact` generation;
- style-source selection and reroll;
- deterministic same-seed artifact test;
- exhaustive same-sound spelling derivation from the current grapheme inventory;
- deterministic orthographic preference ranking over the full pool;
- configurable spelling display cap with a default of 10;
- shared `NameArtifactInspector` used by both active modes;
- shared pure artifact-analysis APIs;
- deterministic single-artifact structure, spelling, and readability evidence;
- deterministic artifact-set collision analysis;
- public exports for the analysis functions and types;
- separation from Fiction Cast ensemble state and UI.

## Deferred work

- Shared quantity and grouping for NPC rosters.
- Context presets backed by explicit criteria bundles and product evidence.
- Audience-specific pronounceability research and validation.
- Corpus-specific familiarity research and validation.
- Human-tested memorability research and validation.
- Same-roster sound proximity diagnostics.
- Semantic, genre, cultural, or realism scoring backed by declared data and methodology.
- Persistence.
- Character hooks, biography generation, or encounter generation.
- New phonology, audio-provider, or IPA implementation.

## Invariants

- No separate Game NPC generator.
- No `NpcRequest`, `GameNpcRequest`, or `NpcRosterRequest`.
- No mode-driven branch inside core v1 generation.
- No fake one-member cast state.
- No parallel artifact renderer or analyzer.
- No derived analysis persisted into the durable artifact without a versioned contract decision.
- No unsupported linguistic or psychological score presented as objective fact.
- No display cap applied before full-pool ranking or selected-spelling resolution.
- No plural request behavior until the shared quantity/grouping contract is implemented.
