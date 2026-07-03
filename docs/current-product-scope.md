# Current product scope

This document records the current working interpretation of the product requirements after the Fiction cast interaction pass, UI decomposition, stylesheet consolidation work, readability diagnostics slice, control-surface cleanup, and NameRequest/criteria planning pass.

The original [`product-requirements.md`](product-requirements.md) remains the historical requirements source. This document is the active scope lens for deciding what to build next.

Related decisions:

- [`decisions/0001-name-artifact-and-request-contract.md`](decisions/0001-name-artifact-and-request-contract.md)
- [`decisions/0002-criteria-driven-generation.md`](decisions/0002-criteria-driven-generation.md)
- [`decisions/0003-intent-criteria-compiler-pipeline.md`](decisions/0003-intent-criteria-compiler-pipeline.md)
- [`decisions/0004-modes-presets-and-grouping.md`](decisions/0004-modes-presets-and-grouping.md)

## Active product contract

Name Forge is a random-name workbench. Its first serious mode is **Fiction cast**.

The current product contract is:

> Generate inspectable `NameArtifact`s that are novel, usable, explainable, reproducible, and tuned to user-declared naming criteria.

For Fiction cast, that means:

> Help me name a cast of characters that feel coherent but distinct.

The product should remain a generator and evaluation workbench, not a writing assistant that invents character hooks by default.

## Current planning contract

The next architecture direction is criteria-driven:

```text
Intent surfaces
  -> NameCriteria
  -> compiled criteria
  -> SoundProfile / spelling preferences / exclusions / selection inputs
  -> candidate generation and scoring
  -> NameArtifact
```

The durable request shape is planned as:

```text
NameRequest -> NameResponse
```

V1 may implement only a single generated name while preserving room for later `quantity` and `grouping`. `mode` may be accepted as optional metadata, but generation should remain criteria-driven rather than mode-driven.

Use `criteria` for the input model. Use `brief` only for a concise downstream summary of configured work or generated results.

## Current shipped baseline

Fiction cast now includes deterministic readability diagnostics, sound-first generated names, spelling candidate retention, browser audition projection, and a selected-name artifact shell.

Current baseline capabilities include:

- deterministic seeded cast generation
- style-pack selection
- cast size, name format, role mix, slot override, role influence, rarity, and scoring controls
- lock/select iteration affordances
- deterministic readability notes for length friction, dense consonant/vowel clusters, repeated letters, and visual misreads
- Cast Health readability summaries
- Inspect-panel surfacing for sound, spelling, spelling candidates, readability notes, browser voice draft, and role influence
- JSON and Markdown export of generated names, role metadata, diagnostics metadata, variants, scores, and provenance

The next scope decisions should treat readability diagnostics, source descriptors, style pack validation, browser audition boundaries, selected-name artifact layout, and richer variant metadata as shipped primitives or near-term hardening targets.

## Pronounceability vs pronunciation

The docs intentionally separate these terms:

| Concept | Current status | Product meaning |
| --- | --- | --- |
| Pronounceability | MVP scoring/control axis | Does the generated name look and sound speakable enough? |
| Readability diagnostics | Shipped deterministic primitive | Explain likely friction such as length, clusters, repeated letters, or visual misreads. |
| Browser audition draft | Shipped projection primitive | Approximate browser voice/display guide derived from modeled sound; not canonical pronunciation. |
| Pronunciation hints | Deferred beyond current audition draft | Optional approximate reading guidance, clearly non-canonical. |
| IPA / phoneme output | Later | Requires locale assumptions, phoneme inventories, confidence labels, and provider strategy. |
| Audio / paid TTS provider integration | Later | Selected-name artifact, not default output for every generated candidate. |

The active rule is:

> Name Forge may score and explain pronounceability now. It should not claim canonical pronunciation.

## Next feature requirements

The next major work should strengthen the criteria/request foundation before broadening product surfaces.

### 1. NameRequest v1 contract

Introduce the singular criteria-driven planning contract without implementing plural or grouped generation yet.

Required capabilities:

- Define planning types for `NameRequest`, `NameResponse`, `NameArtifact`, `NameCriteria`, and seeded randomness.
- Treat `mode` as optional metadata, not a generation switch.
- Resolve missing seeds and always emit the resolved seed.
- Preserve same-request, same-seed, same-algorithm reproducibility.
- Return one generated `NameArtifact` in the first implementation slice.
- Keep `quantity` and `grouping` documented as future extension points, not required v1 behavior.

Validation target:

- Same request plus same seed produces deterministic output.
- Omitted seed produces a fresh emitted seed.
- `mode` can be echoed or preserved without changing generation behavior.
- The contract remains singular: no separate `CastRequest`, `ProductNameRequest`, or `NpcRequest` API is introduced.

### 2. Criteria model and compiler bridge

Move from broad style settings toward explicit user-declared criteria.

Required capabilities:

- Define `NameCriteria` and `NameCriteriaClause` as the durable input model.
- Represent current controls as criteria where practical.
- Preserve current `StyleInput -> SoundProfile` behavior as an implementation bridge while criteria work matures.
- Allow accepted-but-unimplemented criteria to be diagnosed rather than causing request failure.
- Add internal candidate scoring only when it affects selection.

Validation target:

- Criteria compilation remains deterministic.
- Unsupported criteria are handled safely and honestly.
- Public fit percentages or polished Criteria Match UI are not required for this slice.

### 3. Intent-family criteria UI discovery

Explore a structured criteria UI without committing to prompt-first UX.

Required capabilities:

- Treat selected chips, sliders, presets, and future drawer choices as intent surfaces that produce criteria.
- Keep user-facing criteria families few and legible.
- Use selected shelves, suggested chips, and structured drawers rather than an always-visible taxonomy wall.
- Keep LLM parsing out of v1.

Validation target:

- The UI can describe selected criteria compactly.
- Large chip libraries remain discoverable without overwhelming the primary Configure surface.
- The generated request shape remains criteria-driven.

### 4. Variant relationship metadata

Spelling variants should become more explicit and more source-aware.

Required capabilities:

- Add a relationship field such as `same_pronunciation`, `near_pronunciation`, `orthographic_variant`, `regional_variant`, `historical_variant`, `transliteration`, `cognate`, `diminutive`, `nickname`, `creative_respelling`, or `alias`.
- Add confidence metadata for each variant.
- Preserve whether a variant is listed, curated, generated, or later externally sourced.
- Include source and optional locale metadata.
- Keep generated rewrite-rule variants clearly distinct from listed alternates.
- Include the richer variant metadata in Inspect, JSON export, and Markdown export.

Validation target:

- Existing generated variants map deterministically to relationship and confidence metadata.
- Listed and generated variants are distinguishable in code, UI, and export.
- No variant is presented as externally validated unless its source/provenance supports that claim.

### 5. Source descriptor and pack validation

The registry should move from MVP provider lookup toward the future source descriptor contract without adding remote-provider behavior yet.

Required capabilities:

- Define a typed `DataSourceDescriptor` or equivalent contract for built-in, file, HTTP, API, package, and custom/user-pack sources.
- Add source fields for license, locale, priority, enabled-by-default status, and cache policy where applicable.
- Attach license/locale/source metadata to built-in style packs when available.
- Add deterministic validation for built-in style-pack shape.
- Keep remote/API providers and user-uploaded packs deferred until validation exists.

Validation target:

- Built-in packs validate at startup or in tests.
- Registry descriptors can represent future local/user, remote, package, and API sources without changing generation semantics.
- No external network or paid provider is required for this slice.

### 6. Warning and collision scaffolding

Warnings should become a typed product surface before stronger cultural or demographic features are attempted.

Required capabilities:

- Add a cautious warning model for generated names.
- Add first-pass common-word collision and known-name distance signals using local deterministic data only.
- Include warnings in Inspect and export only when present.
- Avoid demographic inference, cultural certainty, or external search.
- Keep warning language scoped as screening guidance, not truth.

Validation target:

- Warning generation is deterministic for the same seed/settings/output.
- No warning requires an external database.
- Warning text is cautious and does not imply demographic classification.

### 7. Game NPC mode discovery

Game NPC remains the likely first second mode, but it should follow criteria/request hardening.

Requirements before implementation:

- The criteria/request contract is stable enough that Game NPC can reuse shared primitives rather than forking them.
- The mode boundary can support a faster workflow with different controls/result presentation.
- The first Game NPC slice has a concrete user job, criteria model, validation target, and smoke test.

## Explicit non-goals for the next few slices

- No baby-name mode.
- No prompt-first UX.
- No LLM-driven compilation.
- No public criteria-fit percentage.
- No plural or grouped backend request behavior until the singular request contract is stable.
- No backend-required `BaseStyle` or `StylePack` field in the criteria contract.
- No IPA output.
- No paid TTS/provider integration.
- No pronunciation dictionaries.
- No claim of canonical pronunciation for invented names.
- No external demographic inference.
- No remote/API provider integration before source descriptors and validation exist.
- No broad plugin framework.
- No selectable placeholder modes.

## Issue hygiene baseline

Active planning should use one canonical issue per coherent slice. Duplicate exploration issues should be closed in favor of the canonical issue, and completed issues should stay closed through their merged implementation PR.
