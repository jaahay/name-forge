# Sound-unit audio audition boundary

This note records the boundary between the audition behavior that exists today and a future renderer-neutral sound-unit audio model. It does not authorize provider audio, SSML, IPA, waveform generation, or audio persistence.

## Current implemented boundary

Name Forge already has two audition layers and one lightweight browser playback adapter.

Generated sound audition:

```text
SegmentSequence
  -> AuditionPhonology
  -> BrowserAuditionCue
  -> NameAuditionCue
```

Composed identity audition:

```text
NameIdentity
  -> IdentityAuditionPhrase
  -> persisted NameArtifact.identityAudition
```

Browser playback then consumes those existing projections:

```text
NameArtifact
  -> browserVoiceDraftSegments(...)
  -> Web Speech API utterances
```

The selected-name inspector can play a whole identity as paced semantic chunks and can play generated sound-backed given, family, or place parts individually. Text-backed titles, epithets, initials, and literals remain text-backed during that playback.

This is useful runtime audio, but it is still browser text-to-speech projection. It is not a sound-unit audio contract, canonical pronunciation model, provider phoneme payload, or persisted audio representation.

## Provenance invariant

Generated sound remains the source of truth before spelling and before playback.

- `SoundProfile` is a pure resolved mechanics value. It has no synthetic profile id and no product, compiler, or lexeme provenance.
- `SegmentSequence` is a contained generated sound value. It has no synthetic sequence id.
- A sound-backed identity part retains the exact `SoundProfile`, `SoundCandidate`, and selected spelling used for that component in its contained generation bundle.
- `IdentityAuditionPhrase` preserves the phrase-level distinction between `sound`, `text`, and `literal` parts.
- Browser speech text is derived presentation material. It must not become the durable sound model.

Containment establishes generation provenance. Future audio planning must not reintroduce relational ids merely to link adjacent generated values.

## What is already solved

The existing implementation already answers several questions that the original future-audio note treated as open:

- Whole-identity browser playback exists.
- Generated sound-backed components can be auditioned independently.
- Phrase playback preserves sound/text/literal provenance rather than flattening the identity model first.
- Phrase playback can insert a short presentation pause between semantic chunks.
- Browser speech remains explicitly an approximation rather than a canonical pronunciation claim.

Those behaviors do not need a second audio subsystem.

## What remains genuinely future

A new renderer-neutral audio plan is justified only if a future renderer needs structure that `AuditionPhonology`, `NameAuditionCue`, and `IdentityAuditionPhrase` do not already provide.

Likely reasons include:

- provider phoneme or pronunciation markup;
- explicit duration, timing, or boundary hints;
- a renderer-independent pause model;
- generated audio or waveform caching;
- provider/voice selection;
- exportable audio-plan metadata;
- a sound model for currently text-backed lexemes.

Until one of those needs is concrete, the current browser adapter is sufficient and should remain downstream from the existing audition models.

## Future concept vocabulary

These names remain design vocabulary only.

### `SoundUnitAudioPlan`

A possible renderer-neutral plan for one generated sound-backed name or name part.

Potential source path:

```text
SegmentSequence
  -> AuditionPhonology
  -> SoundUnitAudioPlan
```

A future plan should carry the sound facts it needs by value rather than by synthetic profile/sequence identifiers. For example:

```ts
type SoundUnitAudioPlan = {
  readonly contract: "SoundUnitAudioPlan";
  readonly version: 1;
  readonly source: "audition-phonology";
  readonly units: readonly SoundAudioUnit[];
};

type SoundAudioUnit = {
  readonly kind: "syllable";
  readonly segments: readonly SoundSegmentId[];
  readonly stress: "primary" | "secondary" | "unstressed" | "unspecified";
  readonly stressSource: "sequence" | "cadence-rule" | "weight-rule" | "fallback" | "unspecified";
  readonly timingHint?: AudioTimingHint;
};
```

That shape is illustrative, not an accepted runtime contract. Segment-level detail is already available inside each syllable when a renderer needs it; the core model should not adopt a provider-specific phoneme inventory.

### `PhraseAudioPlan`

A possible renderer-neutral phrase plan downstream from `IdentityAuditionPhrase`.

```text
IdentityAuditionPhrase
  -> PhraseAudioPlan
  -> renderer-specific projection
```

A phrase plan must preserve current provenance:

| Current part kind | Future audio status | Rule |
| --- | --- | --- |
| `sound` | May derive renderer-neutral audio units from the contained generated sound. | Preserve generated sound evidence. |
| `text` | Remains text-backed unless an explicit lexeme sound model exists. | Do not fabricate generated sound provenance. |
| `literal` | Remains literal/text-backed unless an explicit boundary or pronunciation policy exists. | Do not treat punctuation as provider syntax by default. |

### Renderer-specific projection

Web Speech API text, SSML, provider phoneme markup, synthesized audio, and cached waveform references belong after the renderer-neutral boundary.

The current Web Speech API adapter is one such projection. Its existence does not require the core engine to model provider payloads.

## Pauses and phrase boundaries

The current inspector uses a short inter-chunk pause as a presentation behavior. That pause is UI/browser-adapter policy, not a durable phonological fact.

If future renderers need portable pause semantics, introduce an explicit renderer-neutral boundary hint rather than inferring durable meaning from punctuation or preserving the current millisecond value as a core contract.

## Persistence boundary

Do not persist provider payloads or audio blobs by default.

Current persisted artifacts may retain `IdentityAuditionPhrase` because it preserves useful provenance and presentation facts. Future renderer-specific payloads should normally be derived from durable generation and audition facts.

Persisted waveform or cache references require a separate storage decision covering at least renderer/provider version, voice/settings, invalidation, and reproducibility.

## Boundary rules

- Keep generated sound before spelling and before browser/provider projection.
- Keep `AuditionPhonology` renderer-neutral.
- Keep `IdentityAuditionPhrase.parts` as the phrase-level provenance boundary.
- Keep browser playback as an adapter over audition projections, not a new source of truth.
- Keep text-backed lexemes and literals explicit unless a future model gives them sound provenance.
- Keep fallback stress labeled as fallback.
- Prefer contained values over synthetic relational ids for sound-generation provenance.
- Add a new audio-plan abstraction only when a concrete renderer requirement exceeds the current audition contracts.
- Do not add audio fields to the public `NameRequest` or `NameResponse` without a separate contract decision.

## Non-goals

- No change to current browser playback behavior.
- No paid provider integration.
- No SSML generation.
- No IPA generation.
- No phoneme dictionary.
- No waveform generation.
- No audio persistence or cache.
- No automatic pronunciation for arbitrary lexical text.
- No new audio settings UI.
- No new active mode.

## Open design questions

- Does any future renderer actually need a new sound-unit plan, or is `AuditionPhonology` already sufficient?
- If a new plan is needed, is the stable unit a syllable with contained segments rather than a separate segment entity?
- Which timing or boundary hints are renderer-neutral enough to deserve a core contract?
- How, if ever, should text-backed lexemes acquire explicit sound provenance?
- Should provider payloads be generated lazily, cached, or never persisted?
- How should exports describe browser/provider audio without implying canonical pronunciation?

## Safe next step

Do not implement `SoundUnitAudioPlan` merely because the vocabulary exists. The next audio slice should start from a concrete missing capability in the current browser audition path and introduce only the smallest renderer-neutral structure required to support it.
