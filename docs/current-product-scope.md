# Current product scope

This document describes the active Name Forge product boundary and the foundation that current product work builds on.

Related architecture:

- [`architecture.md`](architecture.md)
- [`model-module-contracts.md`](model-module-contracts.md)
- [`decisions/0001-name-artifact-and-request-contract.md`](decisions/0001-name-artifact-and-request-contract.md)
- [`decisions/0005-sound-profile-product-boundary.md`](decisions/0005-sound-profile-product-boundary.md)
- [`decisions/0006-naming-capabilities-and-surface-composition.md`](decisions/0006-naming-capabilities-and-surface-composition.md)

## Product contract

Name Forge is a multi-mode random-name workbench.

Its shared product goal is:

> Generate names that are novel, usable, explainable, reproducible, and tunable through explicit product controls while keeping modeled evidence distinct from claims about human perception.

The two active product surfaces are:

- **Fiction Cast:** generate and refine a coherent but distinct ensemble of character identities.
- **Game NPC:** generate one usable name quickly for preparation or live play.

The product focuses on naming. Character biographies, encounter generation, and general writing assistance are outside the current product job.

## Generation foundation

All sound-backed lexical-name synthesis converges on one singular operation:

```text
explicit causal inputs
  -> generateName(...)
  -> GeneratedName
```

`generateName(...)` accepts one immutable seed and owns deterministic partitioning of that seed into its internal random streams.

The reusable semantic layer currently provides:

```text
generateGivenName(...)
generateFamilyName(...)
generatePlaceName(...)
```

Each semantic callback delegates lexical-name synthesis to `generateName(...)` while translating typed semantic preferences into generic generation inputs.

`GeneratedName` contains one generated name and its intrinsic evidence:

```text
name
soundProfile
sound
spelling
spellingCandidates
generationPlan
scores
variants
readabilityDiagnostics
```

`GeneratedName.name` is the selected spelling represented by `spelling.text`.

## Shared artifact and request infrastructure

`NameArtifact` is the durable singular projection of a `GeneratedName`. It carries the generated evidence needed for persistence, inspection, and analysis:

```text
id
soundProfile
sound
spelling
spellingCandidates
generationPlan
variants
readabilityDiagnostics
```

Its generated text is `spelling.text`.

The shared request path is:

```text
NameRequest
  -> resolve shared criteria and seed
  -> deterministic independent generation
  -> GeneratedName
  -> NameArtifact
  -> NameResponse
```

The current grouping operation is an exact `independent-set` with deterministic child seeds and stable ordered results.

## Fiction Cast

Fiction Cast owns its aggregate semantics above singular name generation.

A `FictionCastGeneratedName` contains:

- a surface result ID and `displayName`;
- a materialized identity and phrase structure;
- an unchanged singular `primaryName: GeneratedName`;
- generation evidence for generated supporting components;
- role and rarity metadata;
- contextual role/ensemble scoring;
- readability evidence;
- whole-identity audition data.

Fiction Cast composes generated given, family, and place names with surface-owned lexical and literal material. Current identity formats include given-only, given-family, initials-family, title-name, and epithet-place.

Current Fiction Cast capabilities include:

- deterministic ensemble generation;
- cast size, format, role mix, role influence, rarity, and tuning controls;
- slot locks and selected-name reroll;
- surface-owned contextual scoring and internal ensemble diagnostics;
- conditional collision notes over composed visible identities;
- Cast-ID navigation from the name rail and collision notes into the selected-name inspector;
- whole-identity and per-generated-component browser audition;
- JSON and Markdown export of the Fiction Cast result.

Fiction Cast collision notes are deliberately narrow. They report supported deterministic relationships on the composed `displayName` only when they identify concrete identities the user can inspect; they do not grade cast quality or surface primary-name sound analysis as if it described the whole composed identity.

Fiction Cast export is surface-owned and currently serializes the composed display identity together with relevant primary-name sound, spelling, generation-plan, variant, and score evidence. It carries no public schema-version branding.

### Fiction Cast history

Fiction Cast history belongs to the Fiction Cast surface.

The current Fiction Cast flow does not save composed Cast results into the shared singular `NameArtifact` history. A future Fiction Cast history feature should retain the Fiction Cast result or a Fiction Cast-specific history record so the saved value represents the composed identity the surface generated.

Generation and persistence remain separate operations: Fiction Cast generation returns a result; the surface decides whether and how to retain it.

## Game NPC

Game NPC is a singular-name workflow over the shared request/artifact foundation.

Current Game NPC capabilities include:

- style-source selection;
- singular generation;
- fresh-seed reroll;
- shared artifact inspection;
- copy and browser voice-draft actions;
- singular browser history through `NameArtifact`.

## Lexical inventory direction

Finite lexical material such as titles, epithets, particles, honorifics, and suffixes uses a conceptually separate path from sound-backed name generation:

```text
NamingLexicon / LexicalInventory
  -> semantic selector
  -> deterministic finite choice
```

The inventory owns source data and declared scope. Semantic selectors own the meaning of the options. Shared finite-choice mechanics own deterministic selection.

The exact shared runtime inventory contracts remain future bounded implementation work.

## Analysis and human-facing evidence

Name Forge may present deterministic evidence about generated structure, spelling alternatives, readability observations, and modeled sound relationships when that evidence improves a concrete naming decision.

Human-perception claims require separate evidence. The current boundary is:

| Concept | Current product status |
| --- | --- |
| Readability diagnostics | Deterministic generated-text observations |
| Browser audition | Approximate browser speech projection |
| Composed Fiction Cast collision notes | Conditional deterministic visible-identity relationships |
| NameArtifact modeled-sound relationships | Reusable deterministic analysis; not ordinary composed-identity Cast review UI |
| Pronounceability as a human metric | Research boundary |
| Familiarity | Research boundary |
| Memorability | Research boundary |
| Beauty, realism, cultural authenticity | Require an explicit validated methodology |
| IPA/provider audio | Future audio boundary |

Issue #152 remains the governance boundary for any future human-facing name metric. A metric should enter product work only with a declared population or corpus, an exact construct, validation evidence, limitations, and a concrete user decision it improves.

## Foundation checkpoint

Parent checkpoint #198 is the active gate before a new comprehensive Fiction Cast UI/UX requirements boundary.

The current foundation now establishes:

- Fiction Cast semantics above generic generation;
- reusable given/family/place semantic callbacks;
- one seed-driven singular `generateName(...)` boundary;
- singular `GeneratedName` and `NameArtifact` evidence;
- surface-owned Fiction Cast composition and lifecycle concerns.

After #203 merges, #198 should record the explicit foundation sign-off conclusion. The next comprehensive Fiction Cast requirements pass can then evaluate controls, rarity, roles, presets, tuning, formats, Configure/Inspect behavior, history, help, and visual presentation as product choices rather than inherited architecture.

## Deferred product work

The following areas remain available for separately scoped product work after the foundation checkpoint:

- Fiction Cast-specific history;
- richer reusable grouping semantics where more than one surface demonstrates the same need;
- explicit per-component tuning controls;
- Game NPC roster UX;
- shared lexical inventory implementation;
- Help/FAQ presentation;
- broader shell or visual-system redesign;
- validated human-facing name metrics;
- provider-backed pronunciation or audio.