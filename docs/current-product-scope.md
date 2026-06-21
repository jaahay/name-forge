# Current product scope

This document records the current working interpretation of the product requirements after the Fiction cast interaction pass, UI decomposition, and stylesheet consolidation work.

The original [`product-requirements.md`](product-requirements.md) remains the historical/canonical requirements source. This document is the active scope lens for deciding what to build next.

## Active product contract

Name Forge is a random-name workbench. Its first serious mode is **Fiction cast**.

The current product contract is:

> Generate names that are novel, usable, explainable, reproducible, and tuned to a specific naming job.

For Fiction cast, that means:

> Help me name a cast of characters that feel coherent but distinct.

The product should remain a generator and evaluation workbench, not a writing assistant that invents character hooks by default.

## Pronounceability vs pronunciation

The docs intentionally separate these terms:

| Concept | Current status | Product meaning |
| --- | --- | --- |
| Pronounceability | MVP scoring/control axis | Does the generated name look and sound speakable enough? |
| Readability diagnostics | Good next slice | Explain likely friction such as length, clusters, repeated sounds, or awkward endings. |
| Pronunciation hints | Deferred | Optional approximate reading guidance, clearly non-canonical. |
| IPA / phoneme output | Later | Requires locale assumptions, phoneme inventories, confidence labels, and provider strategy. |
| Audio / TTS | Later | Selected-name artifact, not default output for every generated candidate. |

The active rule is:

> Name Forge may score and explain pronounceability now. It should not claim canonical pronunciation yet.

## Next major feature decision

The next major feature should be **briefed generation with pronounceability diagnostics**.

It should not be baby-name generation, IPA output, or audio.

### Why not baby names next?

Baby names are a distinct real-world naming product. They carry higher user stakes and stronger demographic, cultural, religious, class, nationality, gender, and family-history implications. A serious baby-name mode would require stronger data provenance, source licensing, cultural-pack boundaries, frequency data, and bias/risk posture than the current Fiction cast workbench needs.

Baby-name work should stay deferred until Name Forge has stronger source and risk infrastructure.

### Why not IPA next?

IPA is an artifact, not a mode. It depends on locale assumptions, phoneme inventories, dictionaries/providers, invented-name fallback rules, and confidence labeling. If IPA arrives too early, the product may imply precision it does not have.

IPA should follow a narrower layer of pronounceability/readability diagnostics.

### Recommended feature slice

Add a reusable **Naming Brief** primitive and pair it with non-canonical pronounceability/readability diagnostics.

Candidate capabilities:

- Capture use context, tone words, desired associations, avoid list, hard constraints, and optional anchor examples.
- Use brief fields to influence generation and scoring without replacing sliders.
- Surface readability/pronounceability diagnostics in Inspect and Cast Health.
- Keep diagnostics explicit: speakable/readable guidance, not canonical pronunciation.
- Include brief and diagnostics in JSON/Markdown export.

Non-goals:

- no baby-name mode
- no IPA output
- no audio/TTS
- no pronunciation dictionaries
- no claim of canonical pronunciation for invented names

Validation target:

- Same seed + same settings + same brief reproduces the same cast.
- Brief changes produce explainable output or score changes.
- Diagnostics are deterministic and testable without external data.
- Fiction cast remains the active mode; the brief is designed as a reusable primitive for future modes.

## Implementation tickets to cut when ready

The major work should be split into actual tickets, not a broad planning issue.

Suggested tickets:

1. **Define Naming Brief domain model**
   - Add `NamingBrief` type.
   - Add fields for use context, tone words, desired associations, avoid list, hard constraints, and anchors.
   - Keep it mode-agnostic.

2. **Add Fiction cast brief controls**
   - Add progressive UI for brief input.
   - Preserve existing sliders and presets.
   - Export brief metadata.

3. **Apply brief to scoring/generation**
   - Use brief fields as deterministic scoring and candidate-selection signals.
   - Preserve seed reproducibility.
   - Add tests for stable brief behavior.

4. **Add pronounceability/readability diagnostics**
   - Add deterministic diagnostics for length, clusters, repeated sound/letter friction, and awkward endings.
   - Surface diagnostics in Inspect and Cast Health.
   - Avoid phonetic certainty or IPA.

5. **Document brief and diagnostics behavior**
   - Update product docs, architecture docs, README, and export contract notes.
