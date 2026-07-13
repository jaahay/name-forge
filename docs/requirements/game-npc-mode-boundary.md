# Game NPC mode boundary

This document defines the implemented product, criteria, and presentation boundary for **Game NPC** mode.

## User job

Game NPC serves this job:

> Give me one usable name quickly for tabletop, videogame, or interactive-fiction prep, with minimal configuration and fast reroll.

Fiction Cast serves a different job:

> Help me build a coherent but distinct ensemble of character names.

Game NPC optimizes for speed, low setup cost, and immediate use. Fiction Cast optimizes for roster construction, ensemble comparison, role-aware selection, locks, cast-level diagnostics, and cast export.

## Cardinality decision

The implemented Game NPC mode generates **one name at a time**.

That is intentional:

- it matches the current singular `NameRequest -> NameResponse` v1 contract;
- it supports the live-play loop of generate, inspect, copy, or reroll;
- it avoids disguising one NPC as a one-member cast;
- it avoids introducing a mode-specific plural loop before the shared quantity/grouping contract exists.

A future short NPC roster may be useful for encounter prep. That must use the shared quantity and grouping model when it exists. It must not become a separate `NpcRosterRequest`, repeated client-side singular requests presented as one atomic roster, or a forked generator.

## Platform pipeline

Game NPC is a mode over the shared naming platform, not a separate generator:

```text
GameNpcStyleInput
  -> compileGameNpcStyleInput
  -> NameCriteria
  -> NameRequest
  -> existing criteria compiler
  -> SoundProfile / SegmentSequence / spelling selection
  -> NameArtifact
  -> shared NameArtifactInspector
```

The mode may own labels, defaults, compact controls, reroll behavior, and mode-specific surrounding actions. It must not own a second phonological engine, request family, artifact model, or artifact renderer.

## Implemented input contract

The first `GameNpcStyleInput` intentionally exposes only criteria the current compiler implements explicitly:

```ts
type GameNpcStyleInput = {
  readonly spellingStyle: "plain" | "balanced" | "distinctive";
  readonly texture: "soft" | "balanced" | "hard" | "liquid";
};
```

Compilation is deterministic:

- `plain` and `distinctive` map to supported spelling criteria;
- `soft`, `hard`, and `liquid` map to supported sound-texture criteria;
- `balanced` emits no preference for that dimension;
- every request requires one name.

The mode does not currently expose familiarity, pronounceability, length, semantic context, format, or avoidance controls.

## Why pronounceability is not a current control

Name Forge does not currently possess a validated scalar pronounceability model.

A meaningful pronounceability claim would need at least:

- a declared listener language or language family;
- phonotactic legality and markedness for that listener population;
- syllable structure, stress, sonority transitions, cluster complexity, and segment inventory;
- a distinction between generated sound and orthographic interpretation;
- empirical or expert validation showing that the score predicts human performance.

The current system has renderer-neutral sound structure, an audition projection, browser voice approximation, and deterministic read-friction diagnostics. Those are useful facts, but they do not justify a universal “78% pronounceable” control or score.

Readability diagnostics may report observable orthographic friction. They must not be presented as proof of pronunciation ease.

## Why familiarity is not a current control

Name familiarity is also population- and context-dependent.

A meaningful familiarity model would need a declared reference corpus or audience and would likely distinguish:

- lexical or name-frequency familiarity;
- phonological neighborhood familiarity;
- cultural or regional familiarity;
- spelling-pattern familiarity;
- genre familiarity;
- prior exposure to related names.

The current compiler can choose plain or distinctive spelling pressure. That is not equivalent to name familiarity, so the UI labels the implemented control **Spelling style** rather than Familiarity.

## Shared artifact rendering contract

`NameArtifact` is the reusable result contract across modes.

Both Fiction Cast and Game NPC render the common artifact surface through `NameArtifactInspector`, including:

- display name;
- sound sketch;
- sound-derived pronunciation guide;
- browser voice draft state;
- selected spelling;
- ranked spelling candidates;
- readability diagnostics;
- variants;
- copy-name and copy-details actions.

Modes may compose additional sections and actions around the shared inspector:

- Fiction Cast adds lock controls, cast context, generated shape, score detail, name parts, and role influence.
- Game NPC adds reroll behavior and compact criteria configuration.

A mode must not create a parallel rendering implementation for common `NameArtifact` facts.

## Mode configuration boundary

Shared mode presentation metadata is separate from Fiction Cast generation settings.

- `NamingModePresentation` owns common labels and descriptive copy.
- `FictionCastModeConfig` owns Fiction Cast-specific `GenerationSettings` defaults.
- Game NPC compiles its own input into `NameCriteria` and calls the shared request adapter directly.

Game NPC does not fabricate cast size, role presets, slot overrides, lock state, Cast Health, or cast export.

## Determinism and reroll

The same Game NPC input, style source, and seed must produce the same singular `NameArtifact`.

Reroll means:

```text
same mode input + same style source + fresh seed -> new singular response
```

Reproduction means:

```text
same mode input + same style source + same seed -> same singular artifact
```

## Implemented slices

### Slice A: criteria projection

Implemented:

- frontend-owned Game NPC input vocabulary;
- deterministic projection into `NameCriteria`;
- exact contract tests for emitted criteria.

### Slice B: mode shell

Implemented:

- selectable Game NPC mode;
- singular `NameRequest -> NameArtifact` generation;
- compact criteria controls;
- reroll with a fresh seed;
- shared `NameArtifactInspector` rendering;
- deterministic same-seed artifact test;
- separation from Fiction Cast ensemble state and UI.

## Deferred work

- Shared quantity and grouping for NPC rosters.
- Context presets backed by explicit criteria bundles.
- Meaningful audience-specific familiarity research.
- Meaningful language-specific pronounceability research.
- Additional format, semantic, practical, or avoidance criteria once supported honestly.
- Persistence.
- Character hooks, biography generation, or encounter generation.
- Warning/collision implementation.
- New phonology, audio-provider, IPA, or pronunciation-scoring implementation.

## Invariants

- No separate Game NPC generator.
- No `NpcRequest`, `GameNpcRequest`, or `NpcRosterRequest`.
- No mode-driven branch inside core v1 generation.
- No fake one-member cast state.
- No parallel artifact renderer.
- No unsupported linguistic score presented as objective fact.
- No plural response until the shared quantity/grouping contract is implemented.
