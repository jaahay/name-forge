# ADR 0007: Naming idioms and future composition

## Status

Accepted for the #249 product vocabulary and immediate Fiction Cast control model.

This decision does not implement multi-idiom composition. It defines the semantic boundary so later composition can be added without redefining today's selector or reusing the overloaded term `style`.

## Context

`Style` is overloaded in Name Forge.

At the core generation boundary, `style` can reasonably mean the complete set of instructions that determine how a name is realized. Separately, the current Fiction Cast selector uses `Style pack` for a much narrower source of phonological, form, spelling, and provenance tendencies such as `British literary fantasy`.

Those are different abstraction levels. Treating both as `style` makes it difficult to reason about causality and encourages a selected pack to become an omnipotent preset.

Terms such as `Culture`, `Tradition`, `Genre`, and `Ethos` were considered but carry unwanted implications. A Fiction Cast source such as `British literary fantasy` is a constructed creative naming direction; it is not a claim to model a real culture, historical tradition, or genre taxonomy authoritatively.

The existing `Style` / `Loose · Balanced · Faithful` control is also not a sound product model. It currently maps to compatibility-oriented `culturalAnchoring` mechanics rather than controlling a complete, causal degree of adherence to the selected naming source. More importantly, a one-dimensional adherence axis would constrain future product directions such as blending several sources or explicitly avoiding characteristics of another source.

## Decision

### 1. Use `Naming idiom` for the selected creative naming source

A **Naming idiom** is a reusable, bounded source of characteristic naming expression.

It may contribute:

- phonological and phonotactic tendencies;
- form and morphological priors;
- orthographic tendencies;
- bounded generated-name source/provenance evidence;
- Fiction Cast-owned lexical material, such as titles or epithets, through an explicit surface-level binding.

`British literary fantasy` is therefore a Naming idiom: a deliberately constructed set of naming tendencies intended to evoke a creative direction, with explicit limitations and provenance.

The term does not imply cultural authenticity, historical authority, or a validated human classification.

### 2. Do not use `Naming idiom` for the complete generation request

The selected idiom is one contributor to resolved generation intent, not the union of all inputs.

Conceptually:

```text
resolved generation intent
  = explicit user semantic intent
  + naming idiom contribution
  + contextual shaping
  + structural intent
  + deterministic context
```

A future core type may use a name such as `NameGenerationSpec` or another term for the complete resolved instruction set. This ADR does not require that rename.

### 3. A selected idiom is simply active

The current Fiction Cast product will not expose a separate `Style adherence`, `Idiom influence`, or `Idiom strength` control.

Selecting an idiom means that generation uses that idiom while still respecting all other explicit user controls.

The former `Loose · Balanced · Faithful` control is retired from the product model rather than renamed.

This avoids treating the selected idiom as something that must be continuously diluted toward a generic midpoint and avoids introducing a misleading scalar before the real composition model exists.

### 4. Preserve explicit user intent

A Naming idiom must not silently rewrite independently visible intent such as:

- Familiar;
- Readable;
- Compact;
- Spelling;
- Cast variation;
- Cast roles or Role shaping;
- identity structure;
- seed.

The idiom supplies characteristic realization choices within those declared constraints.

### 5. Keep current identity structure explicit

An idiom does not currently choose or bias Fiction Cast identity structure.

Future naming systems may justify idiom-specific structural capabilities, but that requires a separate explicit product decision. The current identity-structure selector remains surface-owned user intent.

## Future idiom composition

The domain model must not assume there will always be exactly one positive idiom contribution.

A future composition model may support intentions such as:

```text
include British literary fantasy
include Gothic romance
avoid High Arthurian
```

or other relative blends.

The exact API and UI are deliberately deferred, but the semantic requirements are:

### Positive composition

Multiple idioms may contribute compatible soft priors to the resolved naming mechanics.

Where mathematically useful, an idiom can be treated as characteristic deviations from a neutral/general mechanics baseline rather than as an absolute replacement grammar. This makes relative blending meaningful without making `neutral` a product truth claim.

### Avoidance / subtraction

Avoiding an idiom means suppressing characteristics that distinguish that idiom from the current baseline or positive composition.

It must not mechanically invert every idiom property. In particular:

- hard validity or safety constraints are never inverted;
- categorical lexical eligibility is resolved explicitly rather than by negative probability arithmetic;
- provenance is factual and is never blended or subtracted;
- a negative contribution must not turn an idiom's prohibition into a preference for invalid output.

### Different properties may compose differently

Do not force all idiom data through one universal signed-weight operation.

Distribution-like phonological, morphological, or orthographic priors may support weighted composition. Finite lexical inventories may require eligibility and preference rules. Hard constraints remain constraints.

The product concept is idiom composition; normalization and weighting techniques remain implementation mechanics.

## Architectural boundary

The existing generic `StylePack` is currently an implementation/source object used by singular generation. Fiction Cast may continue to reference that object while exposing the product concept as Naming idiom.

A minimal conceptual binding is:

```text
FictionCast Naming idiom
  -> generated-name source/mechanics object
  -> Fiction Cast lexical inventory where applicable
```

This ADR does not require an immediate repository-wide rename of `StylePack`. If the core generation API later adopts `Style` for the complete generation specification, the lower source type should be renamed deliberately rather than allowing both meanings to coexist indefinitely.

## Immediate product migration

For the current Fiction Cast surface:

- `Style pack` becomes `Naming idiom`;
- the Advanced `Style` control and `Loose · Balanced · Faithful` choices are removed from the visible product;
- no replacement strength/influence control is added;
- the selected idiom remains an explicit generation input;
- legacy `styleAnchoring` / `culturalAnchoring` fields may remain temporarily as compatibility mechanics, but they are no longer product semantics and must not be described as idiom fidelity.

## Acceptance bar for idiom causality

Before expanding the idiom catalog materially, selection must be causally meaningful.

With seed, identity structure, semantic controls, cast variation, and roles held constant, switching between deliberately contrastive idioms should produce materially different but internally coherent output traceable to idiom-owned mechanics.

This is evidence that the idiom affects generation. It is not a human-facing quality, authenticity, or faithfulness score.

## Non-goals

- no multi-idiom UI in this decision;
- no percentage mixer;
- no generic positive/negative weight editor;
- no cultural-authenticity claim;
- no universal identity grammar;
- no implicit identity-structure selection;
- no requirement to rename every historical engine `StylePack` symbol in the same slice;
- no reintroduction of aggregate candidate optimization.

## Consequences

The product vocabulary becomes less ambiguous: an idiom is a bounded creative naming source, while the complete generation request remains a separate concept.

Removing the current adherence control also reduces false causality. Future mixing, relative contribution, and avoidance can be designed as genuine idiom composition instead of being forced into a single `Loose · Balanced · Faithful` dimension.
