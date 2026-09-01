# Fiction Cast Configure causal model

## Status

Working design record for #233 under the broader Fiction Cast requirements parent #212.

This document records the currently preferred causal model for Fiction Cast configuration. It is intended to make implementation slices precise without promoting unsettled UX constants into permanent architecture. Where a choice is still open, this document says so explicitly.

Related durable architecture:

- [`product-architecture.md`](product-architecture.md)
- [`architecture.md`](architecture.md)
- [`decisions/0006-naming-capabilities-and-surface-composition.md`](decisions/0006-naming-capabilities-and-surface-composition.md)

## Design thesis

Fiction Cast should express stable user intent in product language and resolve that intent into generation mechanics through one bounded translation layer.

The surface is not required to preserve a one-to-one mapping between visible controls and historical generic engine score fields.

The preferred dependency is:

```text
Naming style
  + user semantic baseline
  + cast-variation adjustment
  + role-shaping adjustment/preferences
  + explicit slot override where present
  -> effective slot intent
  -> semantic given/family/place generation
  -> identity composition
  -> ensemble candidate selection
```

This preserves the existing architectural rule that Fiction Cast owns its UX, composition, and aggregate behavior while singular generated-name synthesis continues through reusable semantic naming capabilities and `generateName(...)`.

## Why a surface-owned semantic-intent layer is needed

Several current controls are product labels over older generic generation settings:

- `Familiar` maps to `novelty`;
- `Readable` maps to `pronounceability`;
- `Compact` maps to `memorability`;
- Advanced `Style` maps to `culturalAnchoring`;
- `Spelling` maps to `orthographicWeirdness`.

Roles then adjust those same generic settings while also supplying syllable-count, texture, target-length, and rhythm preferences.

That implementation is functional, but it makes the product model unnecessarily hard to reason about. A control such as Compact should not need to mean “memorability score” merely because an earlier engine setting happened to influence form length. Likewise, role shaping should not behave as a hidden second copy of every visible control.

Fiction Cast should therefore be allowed to own a small semantic-intent representation and a resolver that translates the resolved slot intent into the generic settings and planning preferences required by lower generation.

This is a translation boundary, not a second generator.

## Control ownership

Each visible control should have one primary product job.

| Domain | Primary job | Must not silently do |
| --- | --- | --- |
| Cast size | Choose number of identities | Switch product surfaces or retune unrelated generation intent |
| Naming style | Select the shared naming grammar/world | Rewrite Familiar, roles, Cast variation, identity structure, or other independently visible intent |
| Style adherence | Control strength of style-owned soft priors | Become a global preset-strength control |
| Familiar | Set baseline novelty/familiarity target | Control cast-level spread |
| Cast variation | Control spread around the Familiar baseline | Shift the whole cast toward a different baseline |
| Cast roles | Assign story-role context across slots | Shape generated names when Role shaping is Off |
| Role shaping | Control strength of role-relative adjustments | Rewrite displayed baseline controls |
| Identity structure | Choose the current bounded composition policy | Define the permanent identity ontology |
| Readable | Bias structural/syllabic simplicity for first-pass reading | Claim validated human readability or pronounceability |
| Compact | Bias length/form toward shorter or more extended structures | Stand in for a human memorability claim |
| Spelling | Bias orthographic representation toward conventional or distinctive forms | Make the underlying sound object stranger merely because spelling is distinctive |
| Seed | Provide deterministic replay | Carry creative semantics |

Exact labels and discrete option names remain product choices until their behavior is implemented and evaluated.

## Baseline plus contextual shaping

Visible semantic tuning represents the user's baseline intent.

Changing Naming style, Cast roles, Role shaping, or Cast variation should not mutate the displayed values of Familiar, Readable, Compact, Style adherence, or Spelling.

Instead, generation resolves an effective per-slot intent from the stable baseline plus contextual adjustments.

Conceptually:

```text
effective slot intent
  = user baseline
  + deterministic cast-variation delta
  + role delta/preferences when shaping is enabled
```

The implementation may clamp or blend resolved mechanics where required, but those details remain below the product model.

## Cast variation

### Current problem

The current rarity-distribution path resolves `common` through `legendary` bands, but those bands are attached as metadata rather than translated into the generation intent for the slot.

Actual per-slot novelty planning is separately introduced by a fixed repeating offset:

```text
-0.12, -0.06, 0, +0.06, +0.12, ...
```

As a result, the visible Cast variety choice and the actual generated novelty spread are not the same causal mechanism.

### Preferred model

`Familiar` defines the center of the cast's novelty distribution.

`Cast variation` defines how widely slot targets spread around that center.

The variation policy should produce deterministic mean-zero offsets for the current cast size, then deterministically assign those offsets to slots. Increasing or decreasing variation should widen or tighten the cast without moving the overall baseline.

For example, conceptually:

```text
Familiar baseline: 0.48
Variation: moderate
Resolved slot novelty targets: 0.38, 0.43, 0.48, 0.53, 0.58
```

The exact amplitudes and user-facing labels remain open implementation constants.

For cast size 1, the only variation delta is zero. This should fall out of the model naturally rather than require a separate product mode.

### Rarity metadata

Rarity bands should not remain a second independent truth about a generated name.

Preferred direction:

- generation uses the resolved novelty target directly;
- any retained rarity-like label is derived after generation or from resolved intent;
- decorative `common` / `rare` / `epic` / `legendary` labels do not drive generation independently of the user's Familiar and Cast variation choices.

Whether rarity labels remain visible at all is a separate presentation decision.

## Roles

### Assignment and shaping are separate concerns

Cast roles answer which story-role context is assigned to each slot.

Role shaping answers how strongly that assigned context may adjust generation.

When Role shaping is Off, role assignment may remain visible context but must not affect generation or role-weighted selection.

When no role is assigned, Role shaping has no object to act on and should not appear independently actionable.

Slot overrides change role assignment for that slot and inherit the same shaping policy.

### Role profiles should live in semantic space

Current role profiles directly shift generic dimensions such as novelty, pronounceability, memorability, cultural anchoring, and orthographic weirdness, while also supplying form preferences.

Preferred direction: express each role as product-level semantic deltas plus planning hints, then translate the resolved result into lower settings.

A role profile may therefore contain concepts such as:

- slightly more or less unusual than the user's baseline;
- somewhat shorter or longer form pressure;
- simpler or more complex structural pressure;
- more or less adherence to the selected naming style;
- more conventional or distinctive spelling pressure;
- texture, syllable, length, or rhythm planning hints.

The user-facing explanation should describe the creative direction rather than raw numeric shifts.

### Role presets must be real compositions

The current `classic-ensemble`, `quest-party`, and `court-intrigue` presets each contain the same eight roles once when the cast has eight slots; they primarily differ in ordering.

A role preset should instead represent a materially different role recipe or distribution that adapts deterministically to cast size.

The exact recipes are not settled in this document. Their acceptance bar is that changing the role preset at a common cast size changes the actual role composition in a way that matches the preset's stated story purpose.

### Cast size 1

A one-identity cast remains Fiction Cast.

For one slot, ensemble role recipes may collapse to a direct Role choice or another context-appropriate presentation of the same underlying role domain. This is a UI adaptation, not a switch to a separate Character surface.

Role shaping remains meaningful for the assigned role.

### Role guidance

Roles are too opaque to rely on labels alone.

Use tiered contextual guidance:

1. ordinary controls may remain label-only when self-explanatory;
2. domains that need one or two sentences may use an accessible info action adjacent to the label;
3. Roles require deeper dedicated guidance describing each shipped role's story idea and shaping tendencies.

Do not create a generic glossary subsystem merely because Roles need richer explanation.

Role guidance should be derived from or co-located with the authoritative role definition so implementation data and explanatory copy cannot drift independently.

## Naming style and StylePack ownership

### Product-level Naming style

The user-facing Naming style is a Fiction Cast product concept. It may compose bounded references to more than one architectural source of style-bearing material.

A minimal conceptual binding is:

```text
FictionCastNamingStyle
  -> generated-name StylePack
  -> Fiction Cast identity lexicon
```

The exact runtime type is not settled by this document.

The important ownership rule is that the product-level style may bind the appropriate pieces without turning any one lower object into an omnipotent preset.

### StylePack remains bounded

`StylePack` owns generated-name style data such as:

- phonotactic and segment preferences;
- form priors;
- spelling tendencies and style-specific orthographic evidence;
- source/provenance metadata;
- other bounded generated-name style data justified by the singular generation pipeline.

It must not silently rewrite:

- Familiar;
- Readable;
- Compact;
- Cast roles;
- Role shaping;
- Cast variation;
- identity structure;
- seed;
- unrelated surface state.

### Fiction Cast lexical style remains surface-owned

Titles, epithets, and future bounded identity vocabulary do not need to move into the generic singular-name StylePack type.

Fiction Cast may associate an identity lexicon with the selected Naming style so the visible composed identity belongs to one coherent naming world.

This preserves the architectural distinction between generated lexical names and deterministic selection from finite lexical inventories.

## Style adherence

If Style adherence remains visible, it must mean only:

> How strongly generated names follow the selected Naming style's soft priors.

Preferred implementation direction: compile or blend between a neutral/general profile and the selected style's causal priors.

Only style-owned dimensions participate. Style adherence must not become a back door that changes unrelated baseline or contextual controls.

Hard validity constraints and source-safety boundaries remain invariant regardless of adherence.

The exact discrete labels and interpolation strengths remain open implementation constants.

## Style compilation must make pack data causal

The current built-in StylePack declares weighted onset, nucleus, coda, ending, grapheme, and form data. The current sound generator, however, draws sound segments from the shared starter inventory using a generic `SoundProfile`; it does not directly consume the pack's declared onset/nucleus/coda collections.

Before adding multiple Naming styles, style compilation should ensure enough pack-specific data reaches the generic sound-generation profile or another generic mechanics value to produce materially distinct output.

Preferred dependency remains:

```text
StylePack
  -> typed style compilation
  -> resolved generic sound/style mechanics value
  -> generateSound(...)
```

`generateSound(...)` should remain ignorant of Fiction Cast and product-level Naming style concepts.

Acceptance test for multiple styles:

> With seed, cast structure, roles, and semantic baseline held constant, selecting a different Naming style produces a recognizably different but still coherent cast.

Do not expand the style catalog until that test is meaningful.

## Readable, Compact, and Spelling semantics

### Readable

Readable should bias deterministic generated structure toward simpler or more complex first-pass reading conditions.

Do not present it as a validated prediction of how humans will pronounce or rate a name. Human-facing pronounceability/readability metrics remain under the separate evidence-governance boundary.

### Compact

Compact should directly influence name form, such as syllable-count or target-length preferences.

It should not be defined as memorability merely because the current generic `memorability` setting happens to influence length and candidate selection.

### Spelling

Spelling should primarily influence how a generated sound is represented orthographically.

Where possible, distinctive spelling pressure should operate in spelling generation/ranking rather than increasing unrelated phonetic distinctiveness. Any intentional cross-effect must be documented rather than inherited accidentally from `orthographicWeirdness`.

## Identity structure

The current Fiction Cast identity forms are a bounded initial vocabulary:

```text
given-only
given-family
initials-family
title-name
epithet-place
```

The current `mixed` value is a deterministic cycle through those forms rather than a direct user-selected structural policy.

For the current bounded product, prefer an understandable identity-structure choice such as a single form or a clearly described varied-forms policy.

Do not use #233 to define the permanent identity ontology.

Middle names, multiple personal names, houses/clans, patronymics, aliases, dynastic forms, richer honorifics, locatives, and similar expansion require a subsequent bounded identity-component requirements issue.

That later work should first decide what kinds of values exist—generated semantic names, finite lexical values, derived values, and literals—before expanding complete format permutations.

## Ensemble distinctness is not Cast variation

Cast variation and ensemble distinctness solve different problems.

Cast variation controls intentional spread around the user's Familiar baseline.

Ensemble selection should independently apply modest always-on pressure against confusingly similar roster members, such as exact duplicate display identities or strongly repeated initials/endings/cadences where those heuristics are supported.

Conceptually:

```text
Naming style + user baseline -> coherence
Cast variation -> controlled spread
ensemble selection -> avoid confusingly similar cast members
```

Do not force the user to increase Cast variation merely to obtain distinguishable identities.

## Configure information architecture

Dependency should influence spatial grouping.

Preferred relationship:

- Naming style and Style adherence should appear as one conceptual family;
- Cast roles and Role shaping should appear as one conceptual family;
- Cast variation should be explained relative to Familiar;
- advanced implementation-oriented controls should not separate a child control from the domain it modifies merely to preserve an old disclosure layout.

This requirement does not by itself decide the final `Essentials` / `More` / `Advanced` grouping. That layout should be revisited once the causal model is implemented enough to evaluate the actual control count and dependency hierarchy.

The first-run inline-Configure versus post-generation drawer behavior remains a separate UI implementation concern.

## Cast size 1 coherence test

Every settled Configure domain should be checked against a one-identity cast.

Expected behavior:

- Cast size remains a quantity control, not a mode switch;
- Cast variation resolves to zero spread;
- ensemble distinctness has no cross-name work to perform;
- one Role and Role shaping remain meaningful;
- Naming style, Familiar, Readable, Compact, Style adherence, Spelling, identity structure, and seed remain meaningful where their causal contracts support it;
- no separate Fantasy/Fiction Character surface is required by this model.

A future Character surface should be introduced only if a distinct user job emerges, such as deep deliberate construction of one identity, rather than because cast quantity equals one.

## Implementation sequence

The preferred bounded sequence after #233 reaches a requirements conclusion is:

1. **Semantic-intent resolver**
   - introduce the Fiction Cast surface-owned semantic baseline and effective-slot resolution path;
   - translate into existing generic generation settings/planning preferences;
   - avoid a generic engine rewrite.

2. **Cast variation and rarity cleanup**
   - replace the disconnected fixed novelty cycle with deterministic spread derived from Cast variation;
   - make Familiar the baseline center;
   - remove or demote rarity bands as independent generation truth;
   - verify natural size-1 behavior.

3. **Role model**
   - express role shaping through semantic deltas plus planning hints;
   - make role assignment and Role shaping one explicit dependency;
   - replace permutation-like role presets with materially different recipes;
   - add authoritative Role guidance data;
   - adapt the one-slot presentation without creating a new mode.

4. **Style causality**
   - enforce bounded StylePack ownership;
   - compile enough pack-specific data into generic mechanics to make style selection causal;
   - implement real Style adherence over style-owned dimensions;
   - bind Fiction Cast identity lexical material at the product-level Naming style boundary.

5. **Configure presentation**
   - apply final terminology and contextual help;
   - group dependent controls together;
   - reevaluate disclosure placement after causal semantics are real.

6. **Current identity-structure cleanup**
   - replace or clarify the opaque `mixed` presentation without expanding the identity domain;
   - then open the separate identity-component requirements issue before broader composed-identity expansion.

Keep Inspector score-label changes, alternate-spelling vertical rhythm, provider-backed TTS, and first-run Configure container behavior out of this causal-model implementation sequence unless a bounded child explicitly owns them.

## Confidence and open decisions

High-confidence architectural conclusions:

- Fiction Cast should own semantic product intent rather than expose generic engine scores as product ontology;
- visible baselines should remain stable while Cast variation and roles apply contextual shaping;
- Familiar and Cast variation should represent center and spread rather than two competing rarity systems;
- StylePack must remain bounded;
- generated-name style and Fiction Cast finite lexical style can be associated at the product layer without collapsing their ownership;
- ensemble distinctness is separate from Cast variation;
- cast size 1 should remain the same surface;
- the current five identity forms must not become the permanent identity ontology by accident.

Still-open product or implementation constants:

- exact Cast variation labels and spread amplitudes;
- exact role recipes for each preset;
- whether the default active Role shaping level is Off or Light;
- exact user-facing role guidance wording;
- exact Style adherence labels and interpolation strengths;
- exact neutral/default profile used for style-adherence blending;
- whether rarity labels remain visible as derived evidence;
- final identity-structure control wording;
- final Configure disclosure grouping after dependencies are implemented.

These open choices should be settled by bounded implementation/evaluation rather than by enlarging the generic engine contract.

## Acceptance principles

An implementation derived from this record should satisfy all of the following:

- changing one visible domain has a predictable primary job;
- contextual controls do not silently rewrite baseline controls;
- Cast variation materially changes generated spread while preserving the Familiar center;
- size 1 behaves coherently without special product-mode logic;
- roles only shape generation when shaping is enabled;
- role presets produce materially different role compositions at ordinary cast sizes;
- role guidance explains creative naming tendencies without raw implementation weights or human-truth claims;
- changing Naming style materially changes generated output under otherwise fixed inputs;
- Style adherence scales only style-owned soft priors;
- StylePack cannot subsume unrelated Configure domains;
- finite identity vocabulary remains surface-owned and can be style-associated without entering sound generation;
- Compact and Spelling act on the mechanics their labels describe rather than inheriting unrelated historical score semantics;
- the current identity-structure control is improved without prematurely defining the future identity-component domain.
