# Current product scope

This document records the current working interpretation of the product requirements after the Fiction cast interaction pass, UI decomposition, stylesheet consolidation work, readability diagnostics slice, and control-surface cleanup.

The original [`product-requirements.md`](product-requirements.md) remains the historical/canonical requirements source. This document is the active scope lens for deciding what to build next.

## Active product contract

Name Forge is a random-name workbench. Its first serious mode is **Fiction cast**.

The current product contract is:

> Generate names that are novel, usable, explainable, reproducible, and tuned to a specific naming job.

For Fiction cast, that means:

> Help me name a cast of characters that feel coherent but distinct.

The product should remain a generator and evaluation workbench, not a writing assistant that invents character hooks by default.

## Current shipped baseline

Fiction cast now includes deterministic readability diagnostics and a simplified control surface.

Current baseline capabilities include:

- deterministic seeded cast generation
- style-pack selection
- cast size, name format, role mix, slot override, role influence, rarity, and scoring controls
- lock/select iteration affordances
- deterministic readability notes for length friction, dense consonant/vowel clusters, repeated letters, and visual misreads
- Cast Health readability summaries
- Inspect-panel surfacing for readability notes and role influence
- JSON and Markdown export of generated names, role metadata, diagnostics metadata, variants, scores, and provenance

The next scope decisions should treat readability diagnostics, source descriptors, asset descriptors, style pack validation, and richer variant metadata as shipped primitives or near-term hardening targets.

## Pronounceability vs pronunciation

The docs intentionally separate these terms:

| Concept | Current status | Product meaning |
| --- | --- | --- |
| Pronounceability | MVP scoring/control axis | Does the generated name look and sound speakable enough? |
| Readability diagnostics | Shipped deterministic primitive | Explain likely friction such as length, clusters, repeated letters, or visual misreads. |
| Pronunciation hints | Deferred | Optional approximate reading guidance, clearly non-canonical. |
| IPA / phoneme output | Later | Requires locale assumptions, phoneme inventories, confidence labels, and provider strategy. |
| Audio / TTS | Later | Selected-name artifact, not default output for every generated candidate. |

The active rule is:

> Name Forge may score and explain pronounceability now. It should not claim canonical pronunciation yet.

## Next feature requirements

The next major work should strengthen trust and source contracts before adding broader product surfaces.

### 1. Variant relationship metadata

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

### 2. Source and asset contracts

The registry should move from MVP provider lookup toward explicit source and asset descriptor contracts without adding remote-provider behavior yet.

Required capabilities:

- Define typed source descriptors for built-in, file, HTTP, API, package, and custom/user-pack sources.
- Define typed asset descriptors for concrete assets such as style packs, phonotactics, listed variants, variant rules, pronunciation lexicons, IPA rules, and name lists.
- Add source fields for license, locale, priority, enabled-by-default status, and cache policy where applicable.
- Attach license/locale/source/asset metadata to built-in style packs.
- Add deterministic validation for built-in source, asset, style-pack, phonotactic, and variant-rule shape.
- Keep remote/API providers and user-uploaded packs deferred until validation exists.

Validation target:

- Built-in packs validate at startup or in tests.
- Registry descriptors can list sources and concrete assets separately.
- Registry descriptors can represent future local/user, remote, package, and API sources without changing generation semantics.
- No external network or paid provider is required for this slice.

### 3. Warning and collision scaffolding

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

### 4. Game NPC mode discovery

Game NPC remains the likely first second mode, but it should follow trust/source-contract hardening.

Requirements before implementation:

- Fiction cast contracts are stable enough that Game NPC can reuse shared primitives rather than forking them.
- The mode boundary can support a faster workflow with different controls/result presentation.
- The first Game NPC slice has a concrete user job, output contract, validation target, and smoke test.

## Explicit non-goals for the next few slices

- No baby-name mode.
- No IPA output.
- No audio/TTS.
- No pronunciation dictionaries.
- No claim of canonical pronunciation for invented names.
- No external demographic inference.
- No remote/API provider integration before source descriptors and validation exist.
- No broad plugin framework.
- No selectable placeholder modes.

## Issue hygiene baseline

Active planning should use one canonical issue per coherent slice. Duplicate exploration issues should be closed in favor of the canonical issue, and completed issues should stay closed through their merged implementation PR.
