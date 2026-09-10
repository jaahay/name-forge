# ADR 0008: Contextual help and operational Help surface

## Status

Accepted for the current Name Forge guidance model and issue #250.

## Context

Name Forge needs to explain a small set of concepts whose meaning cannot be carried responsibly by a short label alone. Repeating long explanations in Configure or Inspector makes the naming surface noisy, while adding an info icon to every control merely replaces prose clutter with chrome clutter.

The product therefore needs a stable rule for where explanation belongs.

## Decision

Use three guidance tiers.

### Tier 1 — self-explanatory UI

Prefer a clear label and, where necessary, concise permanent supporting copy when the user can understand the control or evidence without a separate disclosure.

Do not add an info control for visual consistency alone.

### Tier 2 — contextual info

Use a small accessible disclosure when one or two short statements materially change how an otherwise compact control should be interpreted.

The first Fiction Cast placements are intentionally limited to:

- **Naming idiom** — a bounded creative naming source that works alongside the user's other declared intent; there is no separate idiom adherence, influence, or strength control;
- **Cast variation** — spread around the Familiar baseline rather than a replacement for that baseline;
- **Generation seed** — deterministic replay behavior and the distinction between an explicit seed and Generate choosing a fresh seed.

The disclosure is keyboard and touch operable, has an explicit accessible name and relationship to its content, and keeps focus on the invoking control. Its content overlays the local surface rather than forcing a large layout shift.

The info control owns its one circular hit target. The inner `i` glyph does not draw a second circle.

### Tier 3 — operational Help

Use a dedicated Help surface when responsible explanation requires more than a sentence or two.

The initial Help surface covers:

- Roles and generation influence;
- Naming idiom;
- deterministic generation and targeted reroll;
- browser audition versus pronunciation authority;
- locking and intent invalidation;
- generated components versus composed or derived identity material.

Help is operational guidance. About remains concise product and author context.

Help topics have stable fragment IDs so the surface can be addressed directly without duplicating its longer copy in primary workflows.

## Domain ownership

Guidance must describe product semantics at the layer that owns them.

- Fiction Cast owns role guidance and composed-identity semantics.
- ADR 0007 owns Naming idiom semantics; Help must not reintroduce `Style adherence`, `Loose · Balanced · Faithful`, or an undeclared idiom-strength model.
- Browser audition remains an approximate rendering boundary; it is not pronunciation authority.
- Human-facing claims such as authenticity, memorability, or universal pronounceability remain subject to their separate evidence/validation boundaries.

The existing detailed Fiction Cast Role guide remains the role-specific source. The general Help surface explains how Roles behave operationally rather than duplicating every role profile.

## Consequences

Primary naming workflows remain sparse while opaque concepts still have accessible explanations.

New info controls require a concrete local interpretation problem. The existence of the reusable disclosure component is not itself justification for adding one.

Longer explanations gain one predictable home, reducing the pressure to turn About, Configure, or Inspector into documentation surfaces.

## Non-goals

- no tooltip or popover framework;
- no documentation CMS;
- no info icon beside every field;
- no replacement of useful permanent inline caveats with hidden help;
- no provider-backed TTS decision;
- no human-facing quality or authenticity score;
- no reintroduction of retired Naming style/adherence semantics.
