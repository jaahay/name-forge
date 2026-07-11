# Game NPC mode discovery boundary

This document defines the first product and compiler boundary for a future **Game NPC** mode. It does not activate a new mode or add runtime behavior.

## User job

The Game NPC job is:

> Give me usable names quickly for tabletop, videogame, or interactive-fiction prep, with minimal configuration and fast reroll.

This differs from Fiction cast:

> Help me name a coherent cast of characters that feel distinct.

Fiction cast optimizes for ensemble coherence, roster browsing, role-aware selection, and cast-level diagnostics. Game NPC should optimize for speed, low setup cost, and rapid use during prep or live play.

## Product boundary

Game NPC is a **mode**, not a separate generator.

The intended pipeline remains:

```text
Game NPC intent surface
  -> NameCriteria
  -> compiled criteria
  -> existing SoundProfile / spelling preferences / exclusions / selection inputs
  -> existing sound-first generation
  -> NameArtifact
  -> Game NPC result presentation
```

The mode may choose labels, defaults, suggested criteria, compact controls, result presentation, and export language. It must not introduce a second phonological engine, a separate request family, or a mode-driven branch inside v1 generation.

## Current architectural invariants

The future Game NPC slice must preserve these current contracts:

- `NameRequest -> NameResponse` remains the public request/response direction.
- `NameRequest.mode` remains optional product metadata and must not drive v1 generation behavior.
- `NameCriteria` is the durable input model.
- `SoundProfile` remains the shared compiled sound-generation contract.
- `SegmentSequence` remains the pre-spelling generated sound plan.
- ranked spelling candidates remain projections of generated sound.
- `NameArtifact` remains the inspectable output artifact.
- the singular v1 request still returns exactly one artifact.

Game NPC should not require `NpcRequest`, `GameNpcRequest`, or a dedicated backend generator.

## First input model

The first Game NPC interface should be a compact intent surface that emits existing or future `NameCriteriaClause` values.

Potential user-facing controls:

| Control | Product meaning | Criteria/compiler direction |
| --- | --- | --- |
| Context preset | Region, faction, species, class, culture-like fictional frame, or campaign tone. | Produces a bounded set of sound, register, spelling, semantic, and practical criteria. |
| Familiarity | Familiar, balanced, or strange. | Adjusts novelty, cultural anchoring, orthographic naturalness, and spelling pressure. |
| Pronounceability | How easily the name can be read aloud during play. | Reuses pronounceability and readability-related selection inputs. |
| Length | Short, medium, or long. | Produces shape criteria and syllable/length targets. |
| Texture | Soft, balanced, hard, or liquid. | Produces sound criteria and existing texture preferences. |
| Format | Given name, full name, title-name, or place-like form where supported. | Reuses existing name-format or identity composition paths. |
| Avoid | Fragments, initials, or other practical exclusions. | Produces avoid/practical criteria. |
| Seed | Reproduce or reroll the same configured job. | Reuses existing randomization behavior. |

The UI does not need to expose criteria-family terminology directly. Presets and compact controls may compile into several clauses.

## `GameNpcStyleInput` design vocabulary

A future frontend-only convenience type may be useful:

```ts
type GameNpcStyleInput = {
  readonly contextPresetId?: string;
  readonly familiarity: "familiar" | "balanced" | "strange";
  readonly pronounceability: number;
  readonly length?: "short" | "medium" | "long";
  readonly texture?: "soft" | "balanced" | "hard" | "liquid";
  readonly format?: string;
  readonly avoid?: readonly string[];
};
```

This type is design vocabulary only. It should compile to `NameCriteria`; it should not be added to the engine as a parallel durable request contract.

Potential direction:

```text
GameNpcStyleInput
  -> compileGameNpcStyleInput
  -> NameCriteria
  -> existing criteria compiler / generator path
```

The compiler should be deterministic and data-shaped. Context presets should be explicit frontend configuration, not hidden prompt logic.

## Result presentation

The first Game NPC result surface should emphasize speed:

- one prominent generated name;
- immediate reroll using the same configured criteria with a new seed;
- copy-name action;
- compact access to selected spelling, sound guide, readability notes, and variants;
- optional deeper Inspect using the existing selected-name artifact surface;
- concise mode-specific export or copied detail text.

The first implementation should not require plural generation. A fast singular generate/reroll loop is compatible with the current v1 request contract.

Future quantity may later support a short NPC list, but it belongs to the accepted grouping/quantity contract rather than a Game NPC-specific loop around generation.

## Fiction Cast assumptions that must not leak

Game NPC must not inherit these as global requirements:

- cast size;
- ensemble balance;
- Cast Health;
- cast role presets;
- slot overrides;
- role influence;
- lock behavior designed around maintaining an ensemble;
- cast-oriented headings or export language;
- assumptions that all results belong to one coherent roster.

Shared workbench primitives may remain reusable:

- Configure;
- generated candidate/result display;
- Inspect;
- copy/export;
- seed and reroll;
- spelling candidates;
- readability diagnostics;
- sound audition draft;
- variants and provenance.

## Mode configuration boundary

The current `NamingModeConfig` contains Fiction cast labels and `GenerationSettings` defaults. A future implementation should avoid simply adding `game-npc` to that type while retaining cast-only fields as universal mode requirements.

Before activating Game NPC, the mode configuration should be reviewed so that:

- common workbench labels and presentation options are shared;
- Fiction cast-only configuration remains owned by Fiction cast;
- Game NPC defaults can produce criteria without requiring cast settings;
- no inactive placeholder mode appears in the UI.

This may require decomposing the current mode config before or during the first implementation slice.

## Validation target for a later implementation slice

A future implementation PR should demonstrate:

1. a Game NPC intent input compiles deterministically into `NameCriteria`;
2. the existing criteria-driven request/generator path produces the result;
3. the same input and seed produce the same selected `NameArtifact`;
4. changing a meaningful Game NPC control changes compiled criteria or selection behavior;
5. no separate Game NPC generator or request type is introduced;
6. the rendered result surface uses Game NPC language rather than cast language;
7. Fiction cast behavior remains unchanged.

A minimal smoke path could be:

```text
Game NPC preset + compact controls
  -> NameCriteria
  -> NameRequest
  -> one NameArtifact
  -> compact result + reroll + Inspect
```

## Recommended implementation sequence

### Slice A: criteria projection

- introduce frontend Game NPC preset/input vocabulary;
- compile it deterministically into `NameCriteria`;
- test the compiled criteria;
- do not expose a selectable mode yet.

### Slice B: mode shell

- separate shared workbench mode configuration from Fiction cast-only configuration;
- add the Game NPC mode surface;
- reuse the singular request/response path;
- add a compact result and reroll loop;
- keep existing Inspect available.

### Slice C: mode-specific polish

- refine quick-copy/export language;
- add preset discovery and compact configuration;
- evaluate whether lock/keep behavior is useful for a single result;
- defer quantity/list behavior to the grouping contract.

## Non-goals for this discovery slice

- No selectable Game NPC mode.
- No runtime code.
- No separate generator.
- No `NpcRequest` or Game NPC-specific backend API.
- No plural quantity or grouped response.
- No prompt-first or LLM-based criteria compilation.
- No character hooks or biography generation.
- No source/asset taxonomy work.
- No warning/collision implementation.
- No new phonology or pronunciation implementation.
- No persistence changes.

## Decision

Game NPC is the preferred first second mode because it reuses the current sound-first, criteria-driven, inspectable artifact path while materially changing the workflow emphasis from ensemble construction to rapid single-name use.

The next safe implementation slice is **Game NPC criteria projection**, not an immediately selectable mode.