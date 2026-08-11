# Name Forge product architecture

Name Forge is one random-name workbench with multiple product modes over shared naming and artifact infrastructure.

This document describes the **current product architecture**: which concepts are shared, which belong to a mode, and how platform capabilities relate to product UX. For the shipped baseline and next-slice selection, use [`current-product-scope.md`](current-product-scope.md). For technical ownership, use [`architecture.md`](architecture.md).

## Product language

Use **naming job** for the user's task: cast, NPC, pen name, product, place, set, handle, and so on.

Use **mode** for product/UI configuration around a naming job. A mode may choose controls, defaults, labels, actions, layout, and presentation without becoming a backend engine primitive.

Use **criteria** for structured user intent that should influence shared generation.

Use **artifact** for one durable generated result, `NameArtifact`.

Use **grouping** for shared request semantics over multiple artifacts. Do not use it as a synonym for every mode-specific roster or set workflow.

Use **engine** only for implementation mechanics below product semantics.

The useful top-level product question remains:

> What are you naming?

## Shared workbench loop

The recognizable product loop is:

```text
Configure intent
  -> Generate
  -> Inspect
  -> Keep / reroll / compare / export
```

Modes may emphasize different parts of that loop, but shared product primitives should remain recognizable:

- **Configure**: product controls, presets, criteria, source/style selection, and practical constraints.
- **Generate**: deterministic name generation through the shared platform.
- **Inspect**: evidence and retained structure for one selected `NameArtifact`.
- **Keep / reroll**: preserve useful artifacts and deliberately generate alternatives.
- **Compare**: mode-appropriate comparison when multiple artifacts matter.
- **Export**: shared or mode-specific handoff of generated results.

The shared artifact is the stable center even when a mode presents a roster or other group around it.

## Shared platform versus mode semantics

The durable shared operation is:

```text
NameRequest -> NameResponse
```

The current request platform supports:

- a singular default;
- exact independent-set quantity from 1 through 100;
- deterministic parent and child seeds;
- flat ordered `NameArtifact[]` output;
- structured criteria diagnostics;
- shared artifact inspection and analysis.

`mode` may be retained as product metadata, but shared generation and grouping must not branch on it.

This distinction matters: a **platform capability does not automatically become a mode feature**. Shared multiplicity exists, but Game NPC still intentionally presents one generated name at a time. Fiction Cast has roster behavior, but its roles, locks, ensemble scoring, and cast review do not become shared grouping semantics merely because they involve multiple artifacts.

## Intent surfaces and criteria

Intent surfaces are user-facing ways to declare naming intent. They may include sliders, compact controls, selected criteria, presets, saved preferences, source/style choices, and later assistive parsing.

Where intent is meant to cross the shared request boundary, it should become explicit `NameCriteria` rather than hidden mode-specific generator behavior.

The current criteria family vocabulary remains intentionally broad:

- Sound
- Shape
- Register
- Spelling
- Semantic / inspired-by
- Avoid
- Practical

The internal criteria model may be more precise than those labels. Product UI does not need to expose every internal target or compiler detail.

Not every current mode control has already been promoted into the shared criteria contract. Existing lower-level settings may continue as migration seams while shared criteria coverage grows deliberately.

## Modes, presets, and skins

Modes are product configurations, not separate products or generator families.

A mode may:

- choose the visible workflow and product vocabulary;
- expose a bounded set of controls;
- choose sensible defaults or presets;
- shape result browsing and actions;
- add mode-specific analysis or review surfaces;
- choose a restrained presentation treatment;
- decide whether a shared platform capability is appropriate to expose.

Presets may produce criteria or adjust product defaults. They should not require a mandatory universal `baseStyle` field in the shared request contract.

The product should keep one recognizable shell while allowing modes to be meaningfully different rather than cosmetically renamed copies of one another.

## Active mode: Fiction Cast

Primary job:

> Help me build a coherent but distinct ensemble of character names.

Fiction Cast is intentionally roster-oriented. It currently owns product-specific behavior including:

- cast size and cast-oriented setup;
- role mix, slot overrides, role influence, and name-format choices;
- deterministic ensemble generation and balancing;
- scan/select/lock behavior;
- selected-name reroll while preserving non-target roster state;
- composed identities and Fiction Cast identity grammar;
- cast review and same-roster relationship evidence;
- JSON and Markdown cast export.

Its primary workbench combines roster browsing with the shared selected-artifact inspector. Generated given, family, and place components may preserve exact generation evidence for phrase audition and explanation, while lexical titles, epithets, initials, and literals remain explicit Fiction Cast semantics.

Fiction Cast is allowed to remain cast-specific. The product should not weaken useful cast language or interactions merely to make the mode resemble a generic list generator.

### Fiction Cast versus shared grouping

Fiction Cast ensemble behavior and shared `independent-set` grouping are different contracts.

Shared `independent-set` says: generate N deterministic artifacts independently from common normalized criteria.

Fiction Cast may additionally apply product-specific role, lock, ensemble, identity, and review behavior.

A future shared cohesion/diversity/slotted grouping contract may eventually absorb some reusable set semantics, but it should do so through an explicit contract decision rather than by treating the current cast implementation as the generic model.

## Active mode: Game NPC

Primary job:

> Give me one usable generated name quickly for prep or live play.

Game NPC is intentionally minimal and speed-oriented. It reuses the shared naming platform and `NameArtifactInspector` while owning a smaller surrounding workflow:

- choose the current style/source input;
- generate one artifact;
- inspect it through the shared artifact surface;
- copy it;
- reroll with a fresh seed.

It does not own a separate phonological generator, `NpcRequest`, artifact type, analyzer, or inspector.

### Why Game NPC remains singular

The shared platform now supports exact independent sets, so singular Game NPC is no longer a backend limitation. It is a product decision.

A future NPC roster may be useful for encounter preparation, but exposing that workflow requires its own product boundary: roster quantity, browsing, reroll semantics, persistence expectations, and any group-level analysis must be deliberately designed.

If implemented, such a roster should reuse shared `NameRequest` quantity/grouping rather than introducing an NPC-specific request family or repeated client-side singular requests disguised as one atomic result.

## Shared Inspect architecture

`NameArtifactInspector` is the common artifact-reading surface across modes.

Shared facts may include:

- display name;
- modeled sound evidence;
- selected spelling and retained same-sound alternatives;
- deterministic spelling-selection explanation;
- readability observations;
- variants;
- browser voice-draft audition;
- copy actions.

Modes may add product-specific context around those common facts. Fiction Cast adds cast context and composed identity semantics; Game NPC adds fast reroll/copy workflow.

A new mode should not create a parallel artifact renderer merely to change surrounding product vocabulary.

## Persistence and continuity

Persisted Recent names are artifact-oriented rather than mode-specific regeneration state. The product can restore saved `NameArtifact` snapshots into the shared inspector without regenerating them.

Persistence should preserve explicit user-generated results and remain versioned/bounded. A future grouped or mode-specific persistence experience may need additional product metadata, but that should not be inferred from artifact persistence alone.

## Sound and product semantics

The product architecture follows the technical boundary established in Decision 0005:

```text
product semantics
  -> naming orchestration
  -> typed style compilation
  -> pure SoundProfile
  -> sound generation
  -> spelling mechanics
```

`SoundProfile` describes generic sound mechanics. It does not contain Fiction Cast roles, titles, epithets, composition grammar, or mode identity.

This allows product modes to evolve semantic naming behavior without making the low-level sound engine aware of every naming job.

## Grouping layers

It is useful to distinguish three levels:

1. **Singular artifact** — one naming result.
2. **Independent set** — implemented shared quantity/grouping with no cross-artifact optimization.
3. **Semantic or optimized group** — future contracts for cohesion, diversity, slots, ranked alternatives, hierarchy, or other cross-artifact relationships.

The existence of level 2 does not imply level 3. Product modes should state which level they actually use.

## Human-facing claims boundary

Product controls and explanations must correspond to defensible model behavior.

Name Forge can directly expose deterministic evidence such as generated structure, supported spellings, read-friction observations, and modeled relationships. It must not turn internal heuristic weights into validated human-facing claims without appropriate evidence.

Concepts such as universal pronounceability, familiarity, memorability, realism, beauty, cultural authenticity, or likely human confusion require declared populations/corpora, methodology, validation, confidence, and limitations before being presented as measured product facts.

Browser speech is similarly an audition aid, not canonical pronunciation. Provider audio, IPA, dictionaries, or pronunciation authority require separate contracts.

## Candidate future modes

Future modes are product directions, not an active implementation queue.

| Mode | Primary job | Platform/product questions it would stress |
| --- | --- | --- |
| Pen name | Generate or evaluate a pseudonym for public identity. | screening evidence, privacy/risk posture, validated market/context claims |
| Product / codename | Name products, projects, features, or launches. | practical criteria, collision evidence, shortlist workflow, later availability boundaries |
| Place / toponym | Generate place names or regional naming systems. | semantic style languages, morphology, regional coherence, richer grouping |
| Set / taxonomy | Name a related set such as ships, spells, tiers, agents, or tokens. | cohesion/diversity, hierarchy, slots, set-level export |
| Handle / username | Generate handles under platform constraints. | practical constraints, variant rules, later availability-aware behavior |

A candidate mode should earn activation by defining a clear user job, bounded controls, result workflow, claims posture, and reuse plan for the shared platform.

## Explicitly deferred mode: baby names

Baby-name workflows imply real-world plausibility, social usability, cultural sensitivity, and a higher duty of care than the current invented-name workbench supports. They should not be inferred from generic “name” infrastructure or treated as a routine next mode.

## Product architecture rules

1. Keep one shared `NameArtifact` center of gravity.
2. Keep mode semantics above shared generation mechanics.
3. Reuse `NameRequest -> NameResponse`; do not fork request families by mode without a demonstrated incompatibility.
4. Treat exact independent sets as implemented platform behavior, not as proof that every mode needs plural UI.
5. Keep Fiction Cast ensemble semantics cast-specific until a reusable grouping contract is explicitly designed.
6. Keep Game NPC singular until a separately bounded roster workflow is selected.
7. Reuse the shared inspector and analysis primitives across modes.
8. Do not expose internal heuristic weights as validated human metrics.
9. Select future modes and major features from current product need, not historical roadmap order.
10. Introduce new abstractions only when concrete cross-mode requirements justify them.