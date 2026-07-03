# 0003 - Intent to criteria to compiler pipeline

## Status

Accepted for planning.

## Context

The current implementation has a narrow `StyleInput -> compileStyle -> SoundProfile` path. That path is useful, but it should no longer be treated as the whole user-intent model.

Name Forge needs room for richer user-facing controls such as intent families, criteria shelves, drawer-based chip libraries, mode defaults, presets, and eventually LLM-assisted control filling. Those surfaces should not each teach the generator a new input shape.

## Decision

The durable planning pipeline is:

```text
Intent surfaces
  -> NameCriteria
  -> compiled criteria
  -> SoundProfile / spelling preferences / exclusions / selection inputs
  -> candidate generation and scoring
  -> NameArtifact
```

`NameCriteria` is the stable intermediate contract between product-facing controls and engine-facing generation behavior.

`StyleInput` should be understood as one current ergonomic producer of criteria or profile inputs, not the final abstraction for all user intent. Future UI surfaces may produce the same `NameCriteria` without changing the core naming operation.

## Intent surfaces

Intent surfaces are frontend or product-level ways to help the user declare what they want. Examples include:

- compact controls and sliders
- intent-family chips
- selected-criteria shelves
- structured drawers and search for larger chip libraries
- mode defaults
- presets or starting points
- saved preferences
- future LLM-assisted parsing

These surfaces should produce explicit criteria rather than directly generating names.

## Criteria families

The user-facing criteria families should remain fewer and cleaner than the internal implementation details. The initial planning set is:

- `sound`
- `shape`
- `register`
- `spelling`
- `semantic`
- `avoid`
- `practical`

The UI may group these more simply than the internal model. For example, a drawer labeled `Inspired by` may produce semantic, shape, register, and spelling criteria.

## Compiler responsibilities

The compiler translates criteria into lower-level generation concerns:

- sound constraints and weights
- spelling ranking preferences
- exclusion pressure
- practical constraints
- candidate scoring inputs
- future grouping or slot-specific behavior

The compiler should not require `mode`, `StylePack`, `BaseStyle`, or `Role` as foundational concepts. Those can prefill, shape, or annotate criteria before compilation.

## Product vocabulary

Use `criteria` for user-declared inputs.

Use `brief` only for a concise downstream summary of configured work or generated results. Do not use `brief` as the name of the input contract, because that risks implying loose free-form text fields or an LLM prompt box.

## UI implications

The primary criteria UI should show a compact selected state and a structured way to add more:

```text
Selected criteria shelf
  + suggested chips
  + family drawer/search for larger libraries
```

The chip universe can be large, but it should not be rendered as a giant always-visible taxonomy wall. A normal run should remain legible as a small set of selected criteria.

## Consequences

- The product can grow richer controls without making the backend mode-driven.
- `NameCriteria` becomes the shared output of UI controls, presets, and future assistive parsing.
- `StyleInput` can remain as an implementation bridge while the richer criteria model is introduced.
- Public criteria-match explanation is still deferred; criteria first need to drive generation and internal selection.
- Free-form prose and LLM parsing stay out of v1.
