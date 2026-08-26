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
  generateGivenName(...)   [implemented]
  generateFamilyName(...)  [accepted; implementation pending]
  generatePlaceName(...)   [accepted; implementation pending]
  ...as additional name-bearing domains are supported
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

This indirection is the primary horizontal-scaling mechanism. A semantic callback represents reusable domain meaning. A product surface injects configuration into one or more such callbacks as part of its own UX. Every semantic `-Name` callback delegates lexical-name generation to the same `generateName(...)` primitive; first-class semantic treatment does not require distinct mechanics on day one.

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

A **semantic naming capability** is reusable domain behavior for one kind of generated name. Given, family, and place are the currently supported sound-backed semantic roles and are first-class API categories. Future domains may include clan, house, faction, ship, product, handle, or other name-bearing concepts when the product actually supports those nouns.

A **surface** composes semantic capabilities into a user job. Its UX may derive different configuration for the same semantic callback than another surface would.

A **naming lexicon / lexical inventory** is typed source data for bounded lexical choices that should not be synthesized through `SoundProfile`, such as particles, honorifics, titles, or generational suffixes. Inventory authority is bounded by declared provenance and linguistic/regional scope rather than being treated as universal linguistic truth.

A cast, roster, shortlist, taxonomy, or other aggregate may be surface composition over individually inspectable artifacts. Group-level behavior may have its own state and selection logic without erasing `NameArtifact` as the unit of inspection and provenance.

## Why surfaces exist

A surface or mode is product/UI configuration around a naming job. It may choose controls, defaults, vocabulary, layout, actions, presentation, and which semantic capabilities it composes.

A surface should not automatically imply a separate low-level generator, transport schema, artifact type, or analysis stack.

A surface may, however, legitimately own aggregate orchestration that is specific to its job. Reuse is not improved by forcing every cast, roster, taxonomy, or set workflow into one universal plural API.

Likewise, heterogeneous identity composition does not by itself justify a universal `NameSegment` abstraction or an omnibus `generatePersonName(...)` API. Generated names, selected lexical values, derived values, and literals can remain concrete values composed by the domain whose grammar is actually known.

## Reusable semantic capabilities

Typed callbacks such as:

```ts
generateGivenName(...)
generateFamilyName(...)
generatePlaceName(...)
```

represent reusable naming-domain semantics. They are built on the single generic singular `generateName(...)` primitive rather than becoming parallel sound generators.

`generateGivenName(...)` is the first implemented semantic capability. `generateFamilyName(...)` and `generatePlaceName(...)` are now accepted first-class semantic wrappers because family and place are stable generated-name roles already supported by the product. They may initially preserve exactly the same lower generation behavior as `generateName(...)`; their value is a typed semantic caller contract, configuration boundary, and future specialization point.

The same capability can appear in many surfaces. For example, `generatePlaceName(...)` may be useful inside Fiction Cast, a world-building surface, an NPC workflow, or another product. Each surface may expose different controls and feed different typed configuration to the same domain capability.

A semantic callback may own domain-specific configuration and typed style behavior that would be inappropriate to force into one universal `NameCriteria` schema. Caller-facing typed `options` objects may also facade granular source, language, region, dialect, or planning details while preserving those details in the underlying typed data and deterministic invocation context.

## Finite lexical vocabularies

Not every semantic value that appears in an identity should be generated as a sound-backed name.

The reusable finite-choice direction is:

```text
NamingLexicon / typed caller options
  -> semantic selector
  -> selectFromOptions(...)
```

A small generic deterministic selector owns only choice from caller-supplied options. Semantic selectors such as `selectParticle(...)`, `selectGenerationalSuffix(...)`, or `selectHonorific(...)` own what those options mean. Their vocabularies should live in persisted typed inventory data rather than scattered hard-coded arrays when they become shared product data.

Name Forge owns the inventory contract, validation, deterministic consumption, versioning, and bundled datasets it ships. It does not claim that any bundled locale-, dialect-, period-, or tradition-scoped vocabulary is the definitive linguistic truth. Built-in, curated, imported, third-party, setting-specific, or user-defined inventories may coexist when product requirements introduce them.

Derived forms such as patronymics may use dedicated derivation rules rather than either name synthesis or finite-option selection.

## Active surfaces

### Fiction Cast

Primary job:

> Help me build a coherent but distinct ensemble of character names.

Fiction Cast owns the surface semantics required by that job: roster construction, roles, locks, targeted reroll, composed identities, conditional composed-identity collision notes, cross-name selection pressure, and cast export.

Fiction Cast primary given-name generation delegates through reusable `generateGivenName(...)`. Family/place supporting generation still uses generic `generateName(...)` in the current runtime, but #202 should add their accepted first-class wrappers while preserving the same singular primitive beneath them. Cast-specific roles, contextual scoring, rarity, composition, and aggregate behavior remain above those one-name mechanics.

The aggregate operation that makes a cast coherent may remain Fiction Cast-specific. That specificity is compatible with a highly reusable lower naming library. Aggregate analysis should appear in the product only when it helps the user locate a concrete naming decision; the surface should report supported deterministic relationships rather than grade the creative quality of the cast.

### Game NPC

Primary job:

> Give me one usable generated name quickly for prep or live play.

Game NPC is deliberately thinner. It reuses shared artifacts, inspection, evidence, browser audition, and the generic singular naming path while owning its own fast UX and reroll behavior.

The semantic capability layer exists, but the current Game NPC request does not assert a semantic name kind and therefore legitimately continues through the generic request adapter. A future Game NPC requirements slice may choose and configure an appropriate reusable semantic callback explicitly; `mode` metadata must not become a hidden switch inside generic generation.

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
semantic `-Name` callback
  -> generic singular generateName(...)
  -> typed style
  -> pure SoundProfile
  -> SoundCandidate / SegmentSequence
  -> supported spelling pool
  -> deterministic ranking and selection
```

Product and naming-domain semantics remain above sound mechanics.

The generic singular `generateName(...)` boundary is implemented. It materializes internal `NameGenerationPlan` evidence rather than requiring callers to construct a silhouette. The legacy `silhouette` result/artifact property remains compatibility and inspection/scoring evidence, not a product concept or generation callback.

The architecture is currently in foundation checkpoint #198. Review #199 found the dependency direction sound but the concrete engine/interface foundation not yet settled. Bounded blockers #201, #202, and #203 cover generic/surface type ownership, semantic-callback invocation plumbing plus the accepted family/place wrappers, and primitive-result versus composed-identity meaning. Surface-specific requirements work should follow only after that foundation is explicitly signed off.

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

1. **Keep one generic singular primitive below domain semantics.** `generateName(...)` is the big lexical-name implementation; every semantic `-Name` callback delegates to it rather than recreating generation mechanics.
2. **Give supported generated-name roles first-class semantic APIs.** Given, family, and place already have stable product meaning. A wrapper may initially be behavior-equivalent to `generateName(...)`; distinct mechanics are not a prerequisite.
3. **Let surfaces inject configuration through typed facades.** UX, presets, roles, local context, and source resolution can shape semantic callbacks without becoming generic engine state or forcing every granular detail into the caller contract.
4. **Keep finite vocabulary selection separate from name synthesis.** Persist typed lexical inventories and reuse deterministic `selectFromOptions(...)`-style mechanics under semantic selectors rather than sending static terms through `SoundProfile`.
5. **Keep surface aggregate and identity composition where their semantics live.** Fiction Cast does not need to become generic grouping, a universal `NameSegment`, or a universal `generatePersonName(...)` merely because it composes multiple heterogeneous values.
6. **Keep request transport distinct from semantic APIs.** Reuse `NameRequest -> NameResponse` for the platform jobs it solves without treating it as the only naming callback.
7. **Keep product semantics above mechanics.** Do not move Fiction Cast, Game NPC, semantic name-kind concepts, or lexical vocabularies into `SoundProfile` or `generateSound(...)`.
8. **Promote shared abstractions from demonstrated reuse.** New surfaces, semantic name nouns, styles, lexical inventory sources, and aggregate contracts can evolve independently.
9. **Treat legacy silhouette evidence as compatibility, not architecture.** `NameGenerationPlan` may remain internal while it serves concrete scoring/inspection consumers; callers should not regain a silhouette-shaped API.
10. **Separate mechanics from human claims.** Deterministic evidence may ship before validated human-facing metrics.
11. **Separate audition from pronunciation authority.** Browser playback may improve independently of provider-quality or canonical pronunciation work.
12. **Keep assistive parsing optional.** Future LLM assistance may translate user language into criteria or semantic configuration, but core generation should not depend on prompt-first behavior.
13. **Prefer bounded changes over framework speculation.** Do not invent a universal identity-segment ontology, person-name composer, Policy framework, provider layer, or plugin system without concrete reuse.

## What this brief does not authorize

This document does not by itself authorize:

- a new surface;
- a universal list of semantic callback APIs beyond supported product nouns;
- a universal `NameSegment` abstraction;
- an omnibus `generatePersonName(...)` composer;
- a universal lexical-inventory taxonomy or claim of linguistic authority;
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

Active implementation should begin from [`current-product-scope.md`](current-product-scope.md), accepted decisions, and parent checkpoint #198. The current sequence is to resolve the foundation blockers from #199 as refined by the checkpoint decisions, align stale documentation through #200, and only then decide whether the platform is stable enough to begin a new Fiction Cast UI/UX requirements boundary.
