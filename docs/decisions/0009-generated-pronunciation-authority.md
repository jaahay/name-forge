# ADR 0009: Generated pronunciation authority and renderer boundary

## Status

Proposed for issue #222. This decision becomes accepted when the resolving pull request is merged.

## Context

Name Forge generates sound-backed lexical names from sound before spelling:

```text
SegmentSequence
  -> spelling candidates
  -> selected spelling
```

The current sound model already preserves ordered sound segments, syllable boundaries, coarse syllable metadata, and explicit stress fields. Browser audition projects that evidence into human-readable guide text and Web Speech-friendly text.

That projection is intentionally not authoritative pronunciation today. Generation already records coarse plan-level stress intent in `NameGenerationPlan`, but generated syllables leave realized stress as `unspecified`, and `AuditionPhonology` may supply fallback stress for presentation without consulting that plan pattern. The renderer therefore supplies a realized pronunciation fact that has not been materialized into the generated sound contract and is not guaranteed to reflect the plan-level intent.

The current `SoundCandidate.transcription` also must not be treated as provider-ready IPA merely because it uses phonetic-looking symbols and slash notation. The structured inventory and its symbols have not been audited as a complete IPA contract. For example, the current `r` segment is modeled as an alveolar approximant while its display symbol is `r`; IPA normally represents that approximant as `ɹ`. The structured segment identity is therefore stronger evidence than the current rendered transcription string.

Fiction Cast adds a second boundary. A composed identity may combine generated sound-backed names with lexical titles or epithets, derived initials, and format literals. Those text-backed parts do not acquire pronunciation authority merely because they appear beside generated parts.

Issue #152 separately governs claims about human perception. Whether Name Forge knows the pronunciation it intended is not the same question as whether people will find a name easy to pronounce, familiar, memorable, realistic, beautiful, or culturally authentic.

## Decision

### Generated sound is the source of intended pronunciation

For a sound-backed generated lexical name, the structured generated sound is the source of Name Forge's intended pronunciation.

The authoritative evidence is the structured `SegmentSequence` and pronunciation-defining facts owned by generation, not the selected spelling, browser speech text, human-readable guide text, or a TTS provider's interpretation.

This is a claim about Name Forge's generation intent. It is not a claim that every reader, dialect, accent, or language community must realize the name identically.

### Renderer projections may realize pronunciation facts, but may not invent authority

Human-readable guides, browser audition, IPA-like text, SSML, provider phoneme payloads, and generated audio are projections of the generated pronunciation intent.

A projection may choose a voice or accent, choose a provider-supported phonetic alphabet, insert renderer-specific pacing, approximate unsupported phonetic detail, or expose a clearly labeled fallback for audition. It may not turn a renderer guess into an authoritative pronunciation fact.

If a pronunciation-defining fact is missing from generation, a renderer may still produce a useful audition, but that result remains a guide or draft rather than authoritative pronunciation.

### Stress must move upstream before complete pronunciation authority

In the current implementation, sound-level stress is the known missing pronunciation-defining fact. `NameGenerationPlan` already materializes a coarse `stressPattern` before sound generation, but `generateSound(...)` does not consume that pattern and independently chooses the actual sound syllable count from `SoundProfile`. The resulting `SegmentSequence` therefore records `stress: 'unspecified'` and `stressSource: 'unspecified'`, while `AuditionPhonology` may derive fallback stress later.

The plan-level stress pattern is relevant generation-time intent, but it is not yet authoritative pronunciation evidence for the realized sound: its syllable count is not guaranteed to equal the generated sequence's syllable count, and no mapping currently materializes the plan pattern onto the sequence. The implementation follow-up must deliberately reconcile those two layers rather than simply copying the plan string into `SegmentSequence`.

Before the product relabels the current Sound guide as `Pronunciation`, generation must resolve the stress information that the pronunciation contract requires. The exact stress algorithm is a bounded follow-up implementation decision; this ADR does not prescribe one universal language rule.

Fallback stress may remain in audition as an explicit approximation, but `stressSource: 'fallback'` does not become canonical merely because it sounds plausible.

The current `SyllableStressSource` type is shared by generated syllables and audition syllables and therefore includes `'fallback'` even though generation never produces that source. The implementation follow-up should preserve the semantic boundary in the types as well: fallback provenance belongs to audition/rendering, not to durable generated `SegmentSyllable` evidence. That may mean narrowing the generated stress-source type and giving audition its own extended provenance type rather than persisting fallback into the sequence.

### Do not create a second durable pronunciation model yet

The first implementation step should complete the existing generated-sound contract rather than introduce a parallel top-level `Pronunciation` object.

`SegmentSequence` already owns ordered sound segments, syllable boundaries, onset/nucleus/coda membership, syllable weight, sonority profile, and stress/provenance fields. If a future renderer or language model demonstrates a pronunciation fact that cannot coherently live in the existing generated-sound model, that evidence can justify a new contract then.

### Current transcription is not yet the provider contract

`SoundCandidate.transcription` remains useful inspection evidence, but it is not declared canonical IPA or a direct provider payload.

Before exposing an IPA label or sending phonemes to a production provider, implementation must audit the sound inventory and define an explicit phonetic projection from structured segment identity plus resolved stress to the selected provider alphabet.

The projection should fail visibly when a segment cannot be represented faithfully rather than silently substituting spelling or provider defaults.

### Pronunciation authority is component-local in composed identities

A generated Fiction Cast component may carry generated pronunciation authority once the generated-sound contract is complete.

Lexical, derived, and literal identity material remains text-backed unless a future model gives that material explicit pronunciation provenance.

Therefore a whole composed Fiction Cast identity should continue to use **Sound guide** while any spoken part depends on ordinary text interpretation. A whole identity may be labeled `Pronunciation` only when every spoken part has explicit pronunciation provenance or a deliberate user-owned override.

This preserves the existing `sound | text | literal` provenance distinction in `IdentityAuditionPhrase`.

### Product terminology follows provenance

- **Pronunciation** — Name Forge's intended pronunciation for a sound-backed value whose pronunciation-defining facts are owned by the authoritative contract.
- **Pronunciation guide** — a human-readable projection of that authoritative pronunciation.
- **Sound guide** — the safe term when a phrase mixes authoritative generated sound with text interpretation or still relies on pronunciation fallback.
- **Approximate browser voice** / **browser voice draft** — Web Speech playback derived from audition text; never pronunciation authority.
- **Pronunciation audio** — provider audio only when provider input is derived from the authoritative pronunciation contract using explicit pronunciation controls.
- **Voice draft** — provider or browser audio when pronunciation still depends on spelling, prompt inference, or other renderer guesswork.

### A future user override may supersede generated intent without erasing it

The generated pronunciation is Name Forge's intended default for the generated artifact, not an immutable claim about how a fictional name must be spoken.

If a future product allows a creator to specify another reading, that explicit user pronunciation may become the active playback/presentation authority while the original generated pronunciation remains provenance. This ADR does not require implementing such an override.

### Production TTS must pass a pronunciation-control gate

A production provider is eligible for authoritative pronunciation audio only if the selected model/voice supports an explicit pronunciation representation that Name Forge can derive from its own contract. Naturalness alone is insufficient.

The provider path must demonstrate, for the selected model and locale:

- explicit phoneme or equivalent pronunciation control for invented words;
- representation of the stress distinctions Name Forge claims;
- predictable phrase pacing or an explicit composition strategy;
- deterministic, inspectable renderer input;
- graceful failure or fallback when the contract cannot be represented;
- acceptable latency, quota, retention, licensing, and cost characteristics.

A provider that accepts only spelling plus natural-language delivery instructions may still be useful for a voice draft, but it does not satisfy the authoritative pronunciation path.

Provider comparison is deliberately deferred. When provider-backed audio becomes concrete product work, evaluate the then-current options against this pronunciation-control boundary rather than maintaining a standing vendor survey in the repository.

## Consequences

The current Fiction Cast and Game NPC UI should continue to use Sound guide / approximate browser voice terminology until the generated pronunciation contract is complete.

The next implementation work should be bounded around:

1. resolving generation-owned stress rather than promoting audition fallback;
2. auditing the sound inventory and defining an explicit phonetic/provider projection;
3. proving that generated pronunciation projections are deterministic and preserve segment/stress intent;
4. only then evaluating a provider integration against the selected renderer contract.

Provider integration is not required to make the semantic decision useful. A complete pronunciation contract improves human-readable guidance and future renderers even if browser audition remains the only audio implementation.

A future provider implementation should remain downstream from generation. It should not move provider vocabulary, SSML, voice IDs, network handles, or vendor-specific phoneme syntax into `SoundProfile` or `generateSound(...)`.

## Non-goals

- no production TTS integration in #222;
- no commitment to one TTS vendor;
- no claim that current `SoundCandidate.transcription` is canonical IPA;
- no universal human pronounceability score;
- no language-independent stress algorithm;
- no pronunciation authority for lexical or literal text without explicit provenance;
- no requirement to expose technical phonetic evidence in the default Fiction Cast UI;
- no change to #152's evidence gate for human-facing perception metrics.
