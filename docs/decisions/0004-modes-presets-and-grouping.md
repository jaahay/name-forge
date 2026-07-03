# 0004 - Modes, presets, and grouping boundaries

## Status

Accepted for planning.

## Context

Name Forge needs to support multiple naming jobs without turning each job into a separate backend API or subproduct. The current Fiction cast surface has cast-specific controls, role concepts, ensemble selection, and a fantasy-appropriate visual treatment. Future jobs such as Product, NPC, Pen name, Place, or Handle may need different controls and presentation.

The product also needs a way to offer strong starting points without making those starting points required backend concepts.

## Decision

Modes are product/UI configurations for naming jobs. In v1 planning, they are not required engine primitives.

A mode may:

- prefill criteria
- choose suggested chips and drawer contents
- configure available UI sections
- choose a restrained visual skin or accent treatment
- choose labels, examples, empty states, and Inspect sections
- set a default quantity or grouping intent in future versions

A mode should not by itself be the source of generation truth. Backend generation should be driven by criteria, randomness, and later quantity/grouping.

## Backend mode handling

The backend may accept an optional `mode?: string` field on `NameRequest`. In v1 this is metadata: it may be echoed, persisted, or used for diagnostics, but core generation should not branch on mode.

If a future mode requires a real backend invariant, that invariant should usually be expressed as criteria, quantity, grouping, practical constraints, or slot criteria rather than by adding mode-specific request types.

## Presets and base styles

Presets and base styles are frontend/client conveniences unless proven otherwise.

Examples:

- `British literary fantasy`
- `Old maps`
- `NASA missions`
- `Botanical Latin`
- `Product/codename starter`

A preset can preselect criteria and adjust UI defaults. It does not need to exist in the backend request. The backend should receive the resulting criteria rather than a mandatory `baseStyle` or `StylePack` field.

## Shell and skin

Name Forge should keep one stable workbench shell. Mode changes should feel like changing the naming job, not entering a different app.

Stable shell:

- configure/criteria surface
- candidate list or tiles
- Inspect panel
- keep/lock/regenerate/export flow

Mode skin:

- restrained accent palette
- suggested criteria
- mode-specific copy
- optional mode-specific panels

The current hazy-brown fantasy palette is a good Cast/Fantasy skin, but it should not become the global Name Forge identity.

## Grouping as the ensemble abstraction

Cast and ensemble behavior should eventually be modeled as grouping, not as a foundational `Cast` primitive.

Planning grouping kinds:

```ts
type NameGrouping =
  | { readonly kind: "none" }
  | { readonly kind: "independent" }
  | { readonly kind: "set"; readonly criteria?: NameSetCriteria }
  | {
      readonly kind: "slotted-set";
      readonly criteria?: NameSetCriteria;
      readonly slots: readonly NameSlotRequest[];
    };
```

Meanings:

- `none`: one generated name.
- `independent`: multiple names with no relationship requirement.
- `set`: multiple names selected to work together.
- `slotted-set`: a set where each slot may add local criteria.

This is the likely backend abstraction for Fiction cast, named teams, taxonomies, factions, and other related-name workflows.

## Role handling

Roles are not global name properties. If roles remain useful, they should be treated as mode-specific UI labels that compile into slot criteria.

For example, a Cast UI may expose `Lead`, `Mentor`, or `Rival`, but the backend should receive normalized slot criteria rather than a universal `Role` primitive.

## Consequences

- Modes can evolve quickly in the frontend without canonizing backend API branches.
- Presets can be useful without becoming generation dependencies.
- Cast keeps its product specificity while ensemble logic moves toward a reusable grouping abstraction.
- The app can later support plural and grouped results without creating separate `CastRequest`, `ProductNameRequest`, or `NpcRequest` APIs.
