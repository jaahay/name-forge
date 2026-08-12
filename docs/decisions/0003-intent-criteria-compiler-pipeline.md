# 0003 - Intent to criteria to compiler pipeline

## Status

Accepted for planning, refined by Decision 0006.

Decision 0006 narrows this decision's earlier implication that every product-facing intent surface must terminate exclusively in `NameCriteria`. `NameCriteria` remains the stable shared request-facing intent contract; reusable semantic naming callbacks may also own typed domain configuration derived directly from a surface's UX.

## Context

The implementation has a typed style-to-`SoundProfile` path below the naming layer. That path is useful, but it is not the whole user-intent or domain-semantics model.

Name Forge needs room for richer user-facing controls, surface defaults, presets, saved preferences, and eventually assistive control filling without teaching generic mechanics about every surface. It also needs reusable semantic capabilities such as given-name or place-name generation that can be configured differently by different surfaces.

## Decision

There are two compatible intent paths above the generic singular naming primitive:

```text
shared request-oriented intent
  surface UX
    -> NameCriteria
    -> shared criteria compilation/adaptation
    -> reusable semantic callback or generateName(...)

semantic domain configuration
  surface UX
    -> typed semantic configuration
    -> reusable semantic callback
    -> generateName(...)
```

Both ultimately delegate one-name generation through the generic singular `generateName(...)` boundary and lower style/sound/spelling mechanics.

`NameCriteria` is the stable intermediate contract for intent that should cross the shared generic request boundary. It is not required to encode every domain-specific semantic configuration.

`StyleInput` remains a typed style language below naming semantics. It should not become the universal user-intent model, and semantic callbacks need not expose it directly to product surfaces.

## Intent surfaces

Intent surfaces are product-level ways to help the user declare what they want. Examples include:

- compact controls and sliders;
- intent-family chips;
- selected-criteria shelves;
- structured drawers and search for larger chip libraries;
- surface/mode defaults;
- presets or starting points;
- saved preferences;
- future assistive parsing.

A surface owns these UX choices and converts them into shared criteria, typed semantic configuration, or both. It should not bypass reusable naming capabilities to manipulate generic sound mechanics directly unless the product explicitly exposes a mechanics-oriented surface.

## Criteria families

The shared user-facing criteria families should remain fewer and cleaner than internal implementation details. The initial planning set is:

- `sound`
- `shape`
- `register`
- `spelling`
- `semantic`
- `avoid`
- `practical`

The UI may group these more simply than the internal model.

Do not continuously expand these families merely to encode every semantic distinction. A reusable `generatePlaceName(...)` capability, for example, may legitimately own typed place-name configuration that would be noise in a universal criteria taxonomy.

## Compiler and adapter responsibilities

Shared criteria compilation/adaptation translates `NameCriteria` into lower-level naming inputs that the current implementation understands, including:

- sound constraints and weights;
- spelling ranking preferences;
- exclusion pressure;
- practical constraints;
- candidate scoring inputs.

Semantic callbacks may additionally translate their own typed configuration into the style or naming inputs appropriate to that semantic domain before delegating to `generateName(...)`.

Neither path should require `mode` as a hidden behavior switch. Product surfaces choose which semantic capability they call and provide explicit configuration.

## Relationship to surface composition

The accepted dependency direction is:

```text
surface UX/state
  -> shared criteria and/or typed semantic configuration
  -> reusable semantic callback(s)
  -> generic singular generateName(...)
  -> typed style compilation
  -> SoundProfile
  -> sound + spelling mechanics
```

A nuanced multi-name surface may compose several semantic callbacks and own aggregate behavior above them. That surface-specific orchestration need not be forced through generic criteria or grouping if the cross-name semantics are not reusable.

## Product vocabulary

Use `criteria` for shared user-declared intent that belongs in the generic request contract.

Use semantic configuration names for typed inputs owned by a reusable domain capability.

Use `brief` only for a concise downstream summary of configured work or generated results. Do not use `brief` as the name of the shared input contract merely because future assistive parsing may exist.

## UI implications

A criteria-oriented surface may show a compact selected state and a structured way to add more:

```text
Selected criteria shelf
  + suggested chips
  + family drawer/search for larger libraries
```

That is one valid surface pattern, not a requirement that every future naming surface expose the same criteria UI. A surface can expose domain-specific controls and translate them into the semantic callback configuration it owns.

## Consequences

- The product can grow richer controls without making generic generation mode-driven.
- `NameCriteria` remains the shared output contract for criteria-oriented controls, presets, and future assistive parsing where generic request portability matters.
- Semantic callbacks can own typed domain configuration without bloating `NameCriteria`.
- `StyleInput` remains below naming semantics rather than becoming a universal surface contract.
- Public criteria-match explanation is still deferred; shared criteria first need to drive functional generation and internal selection.
- Free-form prose and LLM parsing stay out of v1.
