# Name Forge product architecture

Name Forge is one random-name workbench whose product surfaces compose reusable naming capabilities over shared mechanics and durable artifacts.

This document describes the **current product architecture**: which concepts are shared, which belong to a surface, and how reusable domain semantics allow Name Forge to grow horizontally across surfaces, styles, flavours, and types of names. For shipped scope and sequencing, use [`current-product-scope.md`](current-product-scope.md). For technical ownership, use [`architecture.md`](architecture.md). For the authoritative naming-capability hierarchy, use [`decisions/0006-naming-capabilities-and-surface-composition.md`](decisions/0006-naming-capabilities-and-surface-composition.md).

## Product language

Use **surface** or **mode** for a product/UI workflow around a naming job. A surface owns controls, defaults, labels, actions, layout, and presentation without becoming a generic generation primitive.

Use **semantic naming capability** for a reusable domain callback such as `generateGivenName(...)`, `generateFamilyName(...)`, or `generatePlaceName(...)`.

Use **criteria** for structured shared intent that should cross the generic request boundary.

Use **semantic configuration** for typed configuration owned by one reusable naming domain when that meaning does not belong in universal criteria.

Use **artifact** for one durable generated result, `NameArtifact`.

Use **independent set** for shared repeated generation with no required cross-name semantic relationship.

Use **surface aggregate** for multi-name orchestration whose relationships, roles, locks, or selection behavior belong to a particular product surface.

Use **engine** only for implementation mechanics below naming semantics.

## Core horizontal-scaling model

The accepted dependency direction is:

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
  ...only when reusable domain meaning is earned
            |
            v
GENERIC SINGULAR generateName(...)
            |
            v
STYLE / SOUND / SPELLING MECHANICS
```

This indirection is intentional. Different surfaces may reuse the same semantic capability while injecting different configurations derived from their own UX.

For example, `generatePlaceName(...)` could be used by a world-building surface, a Fiction Cast identity, an NPC-region workflow, or another future product. Each surface can expose different controls without forking place-name mechanics or teaching `generateName(...)` about the surface.

Horizontal growth therefore has independent axes:

- new product surfaces can compose existing semantic capabilities;
- new semantic name kinds can be reused by multiple surfaces;
- new styles and flavours can evolve inside typed semantic/style configuration without creating a new sound engine.

## Shared workbench loop

A common interaction loop remains useful:

```text
Configure intent
  -> Generate
  -> Inspect
  -> Keep / reroll / compare / export
```

Surfaces may emphasize different parts of that loop, but shared product primitives should remain recognizable:

- **Configure**: surface-owned controls, presets, criteria, semantic configuration, source/style choices, and practical constraints.
- **Generate**: invoke one or more reusable semantic capabilities, which delegate singular mechanics through `generateName(...)`.
- **Inspect**: read evidence and retained structure for one selected `NameArtifact`.
- **Keep / reroll**: preserve useful artifacts and deliberately generate alternatives.
- **Compare**: surface-appropriate comparison when multiple artifacts matter.
- **Export**: shared or surface-specific handoff of generated results.

The shared artifact is the stable result center even when a surface composes several artifacts into a richer product structure.

## Request platform versus naming semantics

The implemented shared request/transport operation is:

```text
NameRequest -> NameResponse
```

It currently supports:

- a singular-compatible default;
- exact independent-set quantity from 1 through 100;
- deterministic parent and child seeds;
- flat ordered `NameArtifact[]` output;
- structured shared-criteria diagnostics;
- shared artifact inspection and analysis.

`mode` may be retained as product metadata, but generic generation, grouping, and semantic callback selection must not branch on it.

`NameRequest -> NameResponse` is useful platform infrastructure. It is **not** the semantic callback hierarchy and does not replace reusable APIs such as `generatePlaceName(...)`.

Likewise, a platform capability does not automatically become a surface feature. Exact independent quantity exists, but Game NPC intentionally remains singular today. Fiction Cast has multi-name semantics, but its roles, locks, composition, and cross-name pressure do not automatically become generic grouping.

## Surface UX and configuration injection

A surface owns how the user expresses intent. It may expose:

- sliders or compact controls;
- shared criteria;
- semantic-specific controls;
- presets and starting points;
- style/flavour selection;
- role or slot state meaningful only to that surface;
- saved preferences;
- later assistive parsing.

The surface translates that UX into shared `NameCriteria`, typed semantic configuration, or both.

Do not require every surface to expose the same criteria UI. Do not force every semantic distinction into `NameCriteria`. Do not let surfaces bypass semantic capabilities and manipulate generic sound mechanics merely because the current implementation makes that possible.

## Active surface: Fiction Cast

Primary job:

> Help me build a coherent but distinct ensemble of character names.

Fiction Cast is intentionally surface-specific. It currently owns:

- cast size and cast-oriented setup;
- role mix, slot overrides, role influence, and identity-format choices;
- deterministic ensemble generation and balancing;
- scan/select/lock behavior;
- selected-name reroll while preserving non-target roster state;
- composed identities and Fiction Cast grammar;
- cast review and same-roster relationship evidence;
- JSON and Markdown cast export.

Its identity grammar uses semantic parts including given, family, and place names plus lexical titles, epithets, initials, and literals.

Given, family, and place are good candidates for reusable semantic callbacks because other surfaces can plausibly need those same naming domains. As those callbacks are implemented, Fiction Cast should configure and compose them rather than own duplicate one-name generation behavior.

Fiction Cast itself should remain responsible for what makes a **cast** a cast: roles, locks, composition, roster state, cross-name selection pressure, review, and targeted reroll.

### Fiction Cast aggregate behavior

A future surface-level operation could conceptually resemble:

```ts
generateFantasyCastNames(...)
```

The specific name is not a contract. The important point is ownership: such an operation may remain Fiction Cast-specific because its cross-name semantics are product semantics, not universally reusable naming behavior.

It can internally compose semantic callbacks such as:

```text
Fiction Cast orchestration
  -> generateGivenName(...)
  -> generateFamilyName(...)
  -> generatePlaceName(...)
  -> cast-specific composition / balancing / locking
```

There is no requirement that this aggregate become a generic `NameGrouping` kind.

## Active surface: Game NPC

Primary job:

> Give me one usable generated name quickly for prep or live play.

Game NPC is intentionally minimal and speed-oriented. It currently reuses shared request/artifact infrastructure and the common inspector while owning a smaller surrounding workflow:

- choose the current style/source input;
- generate one artifact;
- inspect it;
- copy it;
- reroll with a fresh seed.

It does not own a separate phonological generator, `NpcRequest`, artifact type, analyzer, or inspector.

As the semantic naming layer is implemented, Game NPC should choose the reusable semantic callback appropriate to the name it is generating and inject configuration derived from its own UX. `mode: "game-npc"` must not become the mechanism that switches generic generation behavior.

### Future NPC plurality

The shared platform already supports exact independent sets, so singular Game NPC is a product decision rather than a backend limitation.

If a future NPC workflow simply needs N unrelated names under common criteria, the existing independent-set contract may be sufficient.

If it needs encounter-specific roles, slots, cross-name relationships, preserved roster state, or coordinated reroll, that behavior may belong to Game NPC surface orchestration over reusable semantic callbacks. It should not be forced into generic grouping solely because more than one name is generated.

## Shared Inspect architecture

`NameArtifactInspector` is the common artifact-reading surface across active product surfaces.

Shared facts may include:

- display name;
- modeled sound evidence;
- selected spelling and retained same-sound alternatives;
- deterministic spelling-selection explanation;
- readability observations;
- variants;
- browser voice-draft audition;
- copy actions.

Surfaces may add product-specific context around those common facts. Fiction Cast adds cast context and composed identity semantics; Game NPC adds fast reroll/copy workflow.

A new surface should not create a parallel artifact renderer merely to change surrounding product vocabulary.

## Persistence and continuity

Persisted Recent names are artifact-oriented rather than surface-specific regeneration state. The product can restore saved `NameArtifact` snapshots into the shared inspector without regenerating them.

Persistence should preserve explicit user-generated results and remain versioned/bounded. A future surface aggregate may need its own persisted surface state, but that should be designed at the surface boundary rather than inferred from artifact persistence alone.

## Sound and product semantics

The lower dependency direction remains:

```text
semantic naming capability
  -> generic singular generateName(...)
  -> typed style compilation
  -> pure SoundProfile
  -> sound generation
  -> spelling mechanics
```

`SoundProfile` describes generic sound mechanics. It does not contain Fiction Cast roles, titles, epithets, composition grammar, mode identity, or semantic name kind.

The current `GenerationSettings + NameSilhouette` bridge is transitional implementation structure. A surface should not need to construct a `NameSilhouette` to generate a name.

## Plurality layers

Distinguish these concepts:

1. **Singular generic name** — generated through the intended `generateName(...)` primitive.
2. **Reusable semantic singular name** — generated through a domain callback such as `generatePlaceName(...)`, which delegates to `generateName(...)`.
3. **Independent set** — implemented shared request behavior for N unrelated names under common shared criteria.
4. **Surface aggregate** — surface-owned orchestration when multiple names have product-specific relationships.
5. **Reusable aggregate contract** — only if future evidence shows the same cross-name semantics are needed across multiple surfaces.

Do not collapse these layers into one universal grouping system.

## Human-facing claims boundary

Product controls and explanations must correspond to defensible model behavior.

Name Forge can directly expose deterministic evidence such as generated structure, supported spellings, read-friction observations, and modeled relationships. It must not turn internal heuristic weights into validated human-facing claims without appropriate evidence.

Concepts such as universal pronounceability, familiarity, memorability, realism, beauty, cultural authenticity, or likely human confusion require declared populations/corpora, methodology, validation, confidence, and limitations before being presented as measured product facts.

Browser speech is an audition aid, not canonical pronunciation. Provider audio, IPA, dictionaries, or pronunciation authority require separate contracts.

## Candidate future surfaces

Future surfaces are product directions, not an active implementation queue.

| Surface | Primary job | Reusable capabilities / surface pressure |
| --- | --- | --- |
| Pen name | Generate or evaluate a pseudonym for public identity. | likely pen-name semantic capability, screening evidence, privacy/risk posture |
| Product / codename | Name products, projects, features, or launches. | product/codename semantic capability, practical constraints, shortlist workflow |
| Place / world builder | Generate places or regional naming systems. | reusable `generatePlaceName(...)`, regional style configuration, optional surface aggregate coherence |
| Set / taxonomy | Name a related set such as ships, spells, tiers, agents, or tokens. | reusable semantic callbacks plus strongly surface-shaped set relationships |
| Handle / username | Generate handles under platform constraints. | handle semantic capability, practical constraints, variant rules |

A candidate surface should earn activation by defining a clear user job, bounded controls, result workflow, claims posture, and a composition plan using existing semantic capabilities where possible.

## Explicitly deferred surface: baby names

Baby-name workflows imply real-world plausibility, social usability, cultural sensitivity, and a higher duty of care than the current invented-name workbench supports. They should not be inferred from generic “name” infrastructure or treated as a routine next surface.

## Product architecture rules

1. Keep one shared `NameArtifact` center of gravity.
2. Establish and preserve one generic singular `generateName(...)` primitive above generic mechanics.
3. Put reusable domain semantics in typed callbacks such as `generatePlaceName(...)` rather than in mode switches or sound profiles.
4. Let surfaces own UX-derived configuration and compose one or more semantic callbacks.
5. Keep `NameRequest -> NameResponse` as shared platform/transport infrastructure rather than treating it as the only domain API.
6. Treat exact independent sets as implemented repeated-generation behavior, not as the inevitable abstraction for nuanced multi-name surfaces.
7. Keep surface-specific aggregate semantics surface-specific until concrete cross-surface reuse earns extraction.
8. Do not preserve `NameSilhouette` as a caller-facing generation boundary merely because the current implementation uses it.
9. Reuse the shared inspector and analysis primitives across surfaces.
10. Do not expose internal heuristic weights as validated human metrics.
11. Add new surfaces, semantic name kinds, and styles/flavours independently where their contracts are earned.
12. Introduce shared abstractions only when concrete reuse demonstrates them.