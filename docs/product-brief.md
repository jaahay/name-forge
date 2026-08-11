# Name Forge product brief

## Status

This is a durable strategy-level product brief. It should describe the product thesis and sequencing principles without becoming a running implementation backlog.

For active scope and the shipped baseline, use [`current-product-scope.md`](current-product-scope.md). For current request/grouping state, use [`name-request-planning.md`](name-request-planning.md). Detailed technical contracts belong in architecture docs, accepted decisions, and requirements boundaries.

## Product thesis

Name Forge is a random-name workbench for generating names that are novel, usable, inspectable, reproducible, and tuned to a specific naming job.

It is not one fantasy-name generator with optional skins. Different naming jobs may need different controls, defaults, result presentation, and validation posture while sharing the same lower-level generation and artifact platform.

The durable product direction is:

```text
intent surfaces
  -> NameCriteria
  -> shared request/naming platform
  -> NameArtifact
  -> mode-specific iteration and presentation
```

## Who it serves

Name Forge is for people who need names as part of creative or product work, including:

- writers building fictional casts;
- game masters and game writers naming NPCs and world elements;
- worldbuilders creating coherent naming systems;
- creators evaluating pen names or handles;
- teams naming products, projects, prototypes, tiers, or launches.

The shared need is not merely “produce a random string.” Users need names they can inspect, compare, preserve, reroll, group, and hand off with enough evidence to understand what the system actually generated.

## Core product noun

The primary durable result is a `NameArtifact`.

A cast, shortlist, roster, taxonomy, or other grouping is a collection or product composition of artifacts. Group-level behavior may need its own metadata and selection logic, but it should not erase the artifact as the unit of inspection and provenance.

## Why modes exist

A **mode** is product/UI configuration around a naming job. It may choose controls, defaults, vocabulary, layout, actions, and a restrained presentation skin.

A mode should not automatically imply a separate generator, request family, artifact type, or analysis stack.

The useful top-level question remains:

> What are you naming?

The answer may choose a mode. Shared generation should still be driven by structured criteria, deterministic randomness, and reusable naming mechanics rather than branching on mode metadata.

## Active modes

### Fiction Cast

Primary job:

> Help me build a coherent but distinct ensemble of character names.

Fiction Cast owns the product semantics required by that job: roster construction, role-aware presentation, locks, targeted reroll, cast review, composed identities, same-roster relationships, and cast export.

Those concepts are intentionally allowed to remain cast-specific instead of being generalized into the shared engine prematurely.

### Game NPC

Primary job:

> Give me one usable generated name quickly for prep or live play.

Game NPC is deliberately thinner. It reuses the shared request/artifact platform, shared inspector, spelling evidence, readability evidence, and browser audition, while owning its own fast reroll and product presentation.

The existence of two active modes is now the evidence that the mode boundary is real: shared mechanics can remain shared while product workflows remain distinct.

## Shared platform direction

The implemented shared operation is:

```text
NameRequest -> NameResponse
```

The contract supports the singular default and exact independent-set quantities from 1 through 100 with deterministic parent/child seeds and flat ordered artifact results.

This multiplicity is a platform capability, not automatic product authorization for every mode to expose plural UI. For example, Game NPC remains intentionally singular until a separately bounded roster workflow is justified.

The lower-level generation direction is sound-first:

```text
typed style
  -> pure SoundProfile
  -> SoundCandidate / SegmentSequence
  -> supported spelling pool
  -> deterministic ranking and selection
```

Product semantics such as Fiction Cast given/family/place/title/epithet grammar remain above that mechanics layer.

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

## Candidate future modes

These are product directions, not an implementation queue.

| Mode | User job | Shared primitives it would stress |
| --- | --- | --- |
| Pen name | Generate/evaluate pseudonyms for creators or public identity. | criteria, screening, evidence-backed risk/fit models |
| Product / codename | Name products, projects, tools, or launches. | practical criteria, spelling risk, collision evidence, shortlist workflows |
| Place / toponym | Generate place names or regional naming systems. | semantic style languages, morphology, grouping, regional coherence |
| Set / taxonomy | Name a coherent set of related items. | richer grouping, slots/hierarchy, comparison pressure, export |
| Handle / username | Generate handles within explicit platform constraints. | practical constraints, variant generation, availability-aware boundaries if later supported |

Baby-name generation remains explicitly deferred because real-world personal naming raises materially different plausibility, cultural-sensitivity, and duty-of-care requirements.

## Sequencing principles

1. **Select the next slice from current product need, not stale roadmap order.** Completed historical slice plans should not silently remain the active queue.
2. **Keep product semantics in the product domain.** Do not move Fiction Cast or Game NPC concepts into generic sound mechanics merely to reuse code.
3. **Promote shared primitives deliberately.** Share behavior because multiple modes need it or because it intrinsically belongs below mode presentation.
4. **Do not genericize strong mode UX.** Fiction Cast can remain cast-specific; Game NPC can remain speed-oriented.
5. **Reuse the shared request/artifact platform.** New modes should not fork request families, generators, artifact renderers, or analysis stacks without a concrete incompatibility.
6. **Treat grouping as a spectrum of explicit contracts.** Exact independent sets are implemented; cohesion, diversity, slots, ranked alternatives, and richer group UX require separate decisions.
7. **Separate mechanics from human claims.** Deterministic evidence may ship before validated human-facing metrics.
8. **Separate audition from pronunciation authority.** Browser playback may improve independently of provider-quality or canonical pronunciation work.
9. **Keep assistive parsing optional.** Future LLM assistance may help translate user language into criteria, but core generation should not depend on prompt-first behavior.
10. **Prefer bounded changes over framework speculation.** Introduce reusable semantic APIs, provider abstractions, or plugin systems only when concrete product work requires them.

## What this brief does not authorize

This document does not by itself authorize:

- a new mode;
- richer grouping semantics;
- public fit percentages;
- provider-specific audio or IPA;
- remote naming providers;
- a plugin framework;
- prompt-first generation;
- demographic or cultural inference;
- baby-name workflows;
- broad shell redesign.

Those decisions should begin from [`current-product-scope.md`](current-product-scope.md) and receive their own bounded requirement or issue when selected.