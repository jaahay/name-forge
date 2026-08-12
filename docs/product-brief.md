# Name Forge product brief

## Status

This is a durable strategy-level product brief. It describes the product thesis and sequencing principles without becoming a running implementation backlog.

For active scope and the shipped baseline, use [`current-product-scope.md`](current-product-scope.md). For the request platform, use [`name-request-planning.md`](name-request-planning.md). For the accepted naming-capability hierarchy, use [`decisions/0006-naming-capabilities-and-surface-composition.md`](decisions/0006-naming-capabilities-and-surface-composition.md).

## Product thesis

Name Forge is a random-name workbench designed to scale horizontally across product surfaces, semantic kinds of names, styles, and flavours while preserving shared generation mechanics and durable artifacts.

It is not one fantasy-name generator with optional skins, and it is not one monolithic mode-driven API. Different naming jobs may need different controls, defaults, result composition, aggregate behavior, and validation posture.

The durable product direction is:

```text
PRODUCT SURFACE
  owns UX, defaults, presets, state,
  and any surface-specific aggregate behavior
            |
            | composes/configures
            v
REUSABLE SEMANTIC NAMING CAPABILITIES
  generateGivenName(...)
  generateFamilyName(...)
  generatePlaceName(...)
  ...as real reusable domains are earned
            |
            v
GENERIC SINGULAR generateName(...)
            |
            v
STYLE / SOUND / SPELLING MECHANICS
            |
            v
DURABLE GENERATED RESULT / NameArtifact
```

This indirection is the primary horizontal-scaling mechanism. A semantic callback represents reusable domain meaning. A product surface injects configuration into one or more such callbacks as part of its own UX.

## Who it serves

Name Forge is for people who need names as part of creative or product work, including:

- writers building fictional casts;
- game masters and game writers naming NPCs and world elements;
- worldbuilders creating coherent naming systems;
- creators evaluating pen names or handles;
- teams naming products, projects, prototypes, tiers, or launches.

The shared need is not merely “produce a random string.” Users need generated names they can inspect, preserve, reroll, compose, compare, and hand off with enough evidence to understand what the system actually generated.

## Core product nouns

The primary durable result is a `NameArtifact`.

A **semantic naming capability** is reusable domain behavior for one kind of name. Examples may include given, family, place, faction, ship, product, handle, or other name domains when concrete use earns those APIs.

A **surface** composes semantic capabilities into a user job. Its UX may derive different configuration for the same semantic callback than another surface would.

A cast, roster, shortlist, taxonomy, or other aggregate may be surface composition over individually inspectable artifacts. Group-level behavior may have its own state and selection logic without erasing `NameArtifact` as the unit of inspection and provenance.

## Why surfaces exist

A surface or mode is product/UI configuration around a naming job. It may choose controls, defaults, vocabulary, layout, actions, presentation, and which semantic capabilities it composes.

A surface should not automatically imply a separate low-level generator, transport schema, artifact type, or analysis stack.

A surface may, however, legitimately own aggregate orchestration that is specific to its job. Reuse is not improved by forcing every cast, roster, taxonomy, or set workflow into one universal plural API.

## Reusable semantic capabilities

Typed callbacks such as:

```ts
generateGivenName(...)
generateFamilyName(...)
generatePlaceName(...)
```

represent reusable naming-domain semantics. They are built on the single generic singular `generateName(...)` primitive rather than becoming parallel sound generators.

The same capability can appear in many surfaces. For example, `generatePlaceName(...)` may be useful inside Fiction Cast, a world-building surface, an NPC workflow, or another product. Each surface may expose different controls and feed different typed configuration to the same domain capability.

A semantic callback may own domain-specific configuration and typed style behavior that would be inappropriate to force into one universal `NameCriteria` schema.

## Active surfaces

### Fiction Cast

Primary job:

> Help me build a coherent but distinct ensemble of character names.

Fiction Cast owns the surface semantics required by that job: roster construction, roles, locks, targeted reroll, cast review, composed identities, same-roster relationships, cross-name selection pressure, and cast export.

As reusable given/family/place callbacks become available, Fiction Cast should compose and configure them rather than owning duplicate one-name generation logic.

The aggregate operation that makes a cast coherent may remain Fiction Cast-specific. That specificity is compatible with a highly reusable lower naming library.

### Game NPC

Primary job:

> Give me one usable generated name quickly for prep or live play.

Game NPC is deliberately thinner. It reuses shared artifacts, inspection, evidence, and browser audition while owning its own fast UX and reroll behavior.

As the semantic layer becomes explicit, Game NPC should select and configure the appropriate reusable semantic callback. `mode` metadata should not become a hidden switch inside generic generation.

The existence of two active surfaces demonstrates the product boundary: shared mechanics and artifacts can remain common while surface UX and orchestration remain distinct.

## Request platform direction

The implemented shared request/transport operation is:

```text
NameRequest -> NameResponse
```

It supports the singular-compatible default and exact `independent-set` quantities from 1 through 100 with deterministic parent/child seeds and flat ordered artifact results.

This operation remains useful for shared criteria, deterministic replay, repeated independent generation, service/adapter boundaries, and artifact transport.

It is **not** the semantic callback hierarchy. The existence of one shared request schema does not prohibit typed domain APIs such as `generatePlaceName(...)`, and exact independent quantity does not imply every nuanced multi-name surface must become a richer grouping kind.

## Mechanics direction

The lower generation direction is:

```text
semantic callback
  -> generic singular generateName(...)
  -> typed style
  -> pure SoundProfile
  -> SoundCandidate / SegmentSequence
  -> supported spelling pool
  -> deterministic ranking and selection
```

Product and naming-domain semantics remain above sound mechanics.

The current `GenerationSettings + NameSilhouette` pathway is transitional implementation structure. `NameSilhouette` is not a product concept or accepted caller-facing generation API. The next naming-layer refactor should establish `generateName(...)` and keep only silhouette-derived internal planning structure that still has a clear owner and purpose.

## Plural behavior

Plurality has more than one meaning:

- **independent repeated generation** is already supported by the shared request platform;
- **surface-specific aggregate behavior** belongs to the surface when the relationships themselves are product semantics;
- **reusable aggregate behavior** should be extracted only after multiple surfaces demonstrate the same cross-name contract.

A conceptual `generateFantasyCastNames(...)` may therefore be perfectly legitimate even if no other surface ever calls it, provided it composes reusable lower semantic capabilities rather than duplicating the naming engine.

Horizontal scalability comes from the reusable lower layers, not from demanding that every top-level surface operation be universal.

## Product trust boundary

Name Forge should explain what it can actually support:

- generated structure;
- exact retained spelling alternatives and ranks;
- deterministic readability observations;
- modeled sound relationships;
- source/provenance metadata;
- approximate browser voice drafts.

It should not convert internal weights into universal human claims such as “78% pronounceable,” “highly memorable,” “culturally authentic,” “realistic,” or “beautiful” without declared evidence, methodology, audience/corpus, limitations, and validation.

Pronunciation is also a separate claim boundary. Current browser speech is useful audition, not canonical pronunciation. IPA, dictionary-backed pronunciation, provider phoneme markup, or persisted provider audio require their own contracts.

## Candidate future surfaces and semantic capabilities

These are product directions, not an implementation queue.

| Direction | Possible reusable domain capability | Surface-specific pressure |
| --- | --- | --- |
| Pen name | pen-name generation/evaluation | screening, privacy/risk posture, public-identity workflow |
| Product / codename | product/codename generation | practical constraints, shortlist workflow, collision evidence |
| Place / world builder | `generatePlaceName(...)` | regional systems, repeated place generation, optional coherence orchestration |
| Set / taxonomy | semantic callbacks appropriate to the items | hierarchy, relationships, cross-item contrast, export |
| Handle / username | handle generation | platform constraints, variants, later availability boundaries |

Baby-name generation remains explicitly deferred because real-world personal naming raises materially different plausibility, cultural-sensitivity, and duty-of-care requirements.

## Sequencing principles

1. **Establish the generic singular primitive before layering domain callbacks on top.** The next naming-layer step is `generateName(...)`, not another silhouette-shaped helper.
2. **Build reusable semantic APIs from concrete domain meaning.** `generateGivenName(...)` and `generatePlaceName(...)` should exist because surfaces can reuse those meanings, not because every noun deserves a wrapper.
3. **Let surfaces inject configuration.** UX, presets, roles, and local context can shape semantic callbacks without becoming generic engine state.
4. **Keep surface aggregate behavior where its semantics live.** Fiction Cast does not need to become generic grouping merely because it produces many names.
5. **Keep request transport distinct from semantic APIs.** Reuse `NameRequest -> NameResponse` for the platform jobs it solves without treating it as the only naming callback.
6. **Keep product semantics above mechanics.** Do not move Fiction Cast, Game NPC, or semantic name-kind concepts into `SoundProfile` or `generateSound(...)`.
7. **Promote shared abstractions from demonstrated reuse.** New surfaces, semantic capabilities, styles, and aggregate contracts can evolve independently.
8. **Do not preserve historical helper abstractions by inertia.** `NameSilhouette` and related façade functions must earn any remaining internal role during the `generateName(...)` refactor.
9. **Separate mechanics from human claims.** Deterministic evidence may ship before validated human-facing metrics.
10. **Separate audition from pronunciation authority.** Browser playback may improve independently of provider-quality or canonical pronunciation work.
11. **Keep assistive parsing optional.** Future LLM assistance may translate user language into criteria or semantic configuration, but core generation should not depend on prompt-first behavior.
12. **Prefer bounded changes over framework speculation.** Introduce a universal Policy, grouping framework, compound grammar API, provider layer, or plugin system only when concrete reuse requires it.

## What this brief does not authorize

This document does not by itself authorize:

- a new surface;
- a universal list of semantic callback APIs;
- a universal multi-name abstraction;
- richer shared grouping semantics;
- public fit percentages;
- provider-specific audio or IPA;
- remote naming providers;
- a plugin framework;
- prompt-first generation;
- demographic or cultural inference;
- baby-name workflows;
- broad shell redesign.

Active implementation should begin from [`current-product-scope.md`](current-product-scope.md) and the accepted decisions. The current selected architecture sequence is to establish `generateName(...)`, audit the silhouette boundary, then introduce reusable semantic callbacks from real existing naming domains.