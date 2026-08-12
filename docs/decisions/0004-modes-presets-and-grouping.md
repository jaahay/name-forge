# 0004 - Modes, presets, and grouping boundaries

## Status

Accepted for planning, refined by Decision 0006.

The mode/preset boundary remains accepted. Decision 0006 supersedes this decision's earlier expectation that Fiction Cast and other nuanced multi-name workflows should generally converge on one reusable grouping abstraction.

## Context

Name Forge needs to support multiple naming jobs without turning each job into a separate low-level generator or transport schema. Fiction Cast and Game NPC already demonstrate that surfaces can expose different controls and presentation while reusing lower mechanics and durable artifacts.

The product also needs strong starting points and domain-specific UX without making every surface concept foundational engine state.

## Decision

Modes are product/UI configurations for naming jobs. They are not required generic generation primitives.

A mode or surface may:

- choose which reusable semantic naming callbacks it composes;
- derive typed configuration for those callbacks from its UX;
- prefill shared criteria;
- choose suggested controls and available UI sections;
- choose a restrained visual skin or accent treatment;
- choose labels, examples, empty states, and Inspect sections;
- own surface-specific aggregate orchestration where cross-name semantics belong to that surface.

A mode must not be a hidden source of generic generation truth. `mode` metadata does not choose `generateName(...)` behavior or semantic callback behavior implicitly.

## Backend mode handling

The shared `NameRequest` contract may accept an optional `mode?: string` field. It is metadata: it may be echoed, persisted, or used for diagnostics, but generic generation and independent grouping must not branch on it.

If a surface requires a real naming-domain invariant, the surface should call the appropriate reusable semantic capability explicitly and pass typed configuration. If a surface requires aggregate behavior, it may own that orchestration above semantic callbacks.

Do not add mode-specific transport families merely because surfaces differ. This is separate from semantic API names such as `generatePlaceName(...)`, which intentionally represent reusable domain meaning.

## Presets and styles

Presets and surface starting points are product/client conveniences unless a lower typed style contract explicitly earns ownership of their mechanics.

Examples may include:

- `British literary fantasy`;
- `Old maps`;
- `NASA missions`;
- `Botanical Latin`;
- product/codename starting points.

A preset can preselect shared criteria, semantic callback configuration, or both. The user-facing preset noun does not automatically become a required field on `SoundProfile` or the shared request transport.

## Shell and skin

Name Forge should keep one stable workbench identity while allowing surfaces to compose different naming jobs.

Shared shell patterns may include:

- configure surface;
- generated results;
- Inspect;
- keep/lock/regenerate/export where relevant.

Surface-specific presentation may include:

- restrained accent treatment;
- suggested controls;
- surface-specific copy;
- optional surface-specific panels;
- different result composition when the job requires it.

A visual treatment used by Fiction Cast must not become the global Name Forge identity merely because it existed first.

## Semantic capabilities and surface composition

Decision 0006 establishes the reusable naming dependency:

```text
product surface
  -> reusable semantic callback(s)
  -> generic singular generateName(...)
  -> style / sound / spelling mechanics
```

A semantic callback such as `generatePlaceName(...)` may be reused by multiple unrelated surfaces. Each surface may inject different configuration derived from its own UX.

This is the main horizontal-scaling mechanism for new name kinds and surfaces. The generic primitive does not learn every product job, and a semantic callback does not own a product surface.

## Generic grouping versus surface aggregate orchestration

The implemented shared grouping contract is exact `independent-set` generation. It means repeated names generated under common shared request criteria without cross-name semantic optimization.

A nuanced surface aggregate is different. Fiction Cast may require roles, locks, identity composition, per-component configuration, cross-name contrast, cast-specific selection pressure, and targeted reroll. Those concerns may remain Fiction Cast orchestration that composes reusable semantic callbacks.

Therefore:

```text
independent-set grouping
  = shared repeated independent generation

surface-specific aggregate callback
  = product orchestration when cross-name semantics belong to one surface
```

Do not force the latter into `NameGrouping` merely because multiple names are involved.

If future surfaces reveal a genuinely repeated cross-surface aggregate pattern, extract a shared grouping or set abstraction from those concrete requirements then.

## Role handling

Roles are not global name properties merely because Fiction Cast uses them.

A cast surface may keep roles as surface state and use them to choose or configure semantic callbacks, candidate selection, or aggregate orchestration. A reusable semantic capability may accept domain configuration influenced by that state without making `Role` a generic `generateName(...)` primitive.

Do not assume roles must compile into universal slot criteria. That is one possible future reusable contract only if multiple surfaces demonstrate the need.

## Consequences

- Modes and surfaces can evolve without canonizing hidden backend branches.
- Semantic callback names are valid reusable domain APIs even though mode-specific request transport families remain discouraged.
- Presets can configure shared criteria and/or semantic callbacks without becoming mechanics identity.
- Fiction Cast keeps surface-specific aggregate semantics where they belong.
- Exact independent quantity remains shared platform infrastructure.
- Richer grouping is extracted only when cross-surface reuse is demonstrated, not forecast from one surface.
- New surfaces scale horizontally by composing semantic capabilities and styles/flavours rather than forking the generic generator.
