# Future sound-unit audio audition boundary

This design note defines the future audio-facing boundary after the current sound and phrase audition models. It does not implement audio.

## Current invariant

The current audition path is text/display projection only:

```text
SegmentSequence
  -> AuditionPhonology
  -> BrowserAuditionCue
  -> NameAuditionCue
```

Phrase audition composes generated sound-backed parts and text/literal parts without inventing sound provenance:

```text
NameIdentity + source generated names
  -> IdentityAuditionPhrase
```

`SegmentSequence`, `AuditionPhonology`, `NameAuditionCue`, and `IdentityAuditionPhrase` are the source material for future audio planning. `BrowserAuditionCue.speechText` is a browser/display convenience, not a durable audio plan, phoneme model, SSML payload, or provider contract.

## Why audio needs a boundary first

Audio audition is not just "play the generated name." It may need to represent renderer-neutral sound units, syllable timing, stress, pauses, text-backed lexemes, literals, provider constraints, caching, and user-facing confidence labels.

Adding provider payloads directly to the current browser projection would blur three distinct facts:

1. generated sound-backed material from `SegmentSequence`;
2. renderer-neutral presentation facts from `AuditionPhonology`;
3. text or literal phrase material that has no generated sound provenance.

The boundary must preserve those distinctions before any Web Speech API, paid TTS, SSML, IPA, audio cache, or UI work begins.

## Future concept vocabulary

These names are design vocabulary only until a later implementation slice accepts them.

### `SoundUnitAudioPlan`

A future renderer-neutral plan for one generated sound-backed name or name part.

Potential source path:

```text
SegmentSequence
  -> AuditionPhonology
  -> NameAuditionCue
  -> SoundUnitAudioPlan
```

Potential unit shapes:

```ts
type SoundUnitAudioPlan = {
  readonly contract: "SoundUnitAudioPlan";
  readonly version: 1;
  readonly source: "audition-phonology";
  readonly sequenceId: string;
  readonly profileId: string;
  readonly units: readonly SoundAudioUnit[];
};

type SoundAudioUnit = {
  readonly kind: "segment" | "syllable";
  readonly ids: readonly string[];
  readonly stress: "primary" | "secondary" | "unstressed" | "unspecified";
  readonly stressSource: "sequence" | "cadence-rule" | "weight-rule" | "fallback" | "unspecified";
  readonly timingHint?: AudioTimingHint;
};
```

Open decision: the smallest stable unit may be a segment, syllable, or phrase part. The first implementation should not assume a paid-provider phoneme inventory is the core unit.

### `AudioAuditionCue`

A future renderable cue for one selected generated name.

Potential source path:

```text
NameAuditionCue
  -> AudioAuditionCue
```

It may combine renderer-neutral audio units with one or more renderer-specific projections, but the renderer-neutral plan must remain separable from browser or provider payloads.

### `PhraseAudioPlan`

A future phrase-level plan for composed identities.

Potential source path:

```text
IdentityAuditionPhrase
  -> PhraseAudioPlan
```

`PhraseAudioPlan` must preserve per-part provenance:

| Current part kind | Future audio status | Rule |
| --- | --- | --- |
| `sound` | May reference a `SoundUnitAudioPlan` derived from the source generated name. | Reuse generated sound-backed material. |
| `text` | Text-only unless a later explicit lexeme sound model exists. | Do not fabricate generated sound provenance. |
| `literal` | Literal/text-only unless later punctuation or pause policy is explicit. | Do not treat punctuation as provider syntax by default. |

## Renderer layering

Future audio work should stay layered:

```text
AuditionPhonology / IdentityAuditionPhrase
  -> renderer-neutral audio plan
  -> renderer-specific projection
  -> playback or persistence decision
```

Renderer-specific projection examples may include Web Speech API text, SSML, provider phoneme markup, or cached waveform references. Those should be downstream projections, not replacements for `SegmentSequence`, `AuditionPhonology`, or phrase provenance.

## Pauses, punctuation, and literals

Phrase-level audio must not rely on punctuation string hacks as the structural model.

Future phrase planning should distinguish:

- generated sound-backed name parts;
- identity text such as titles, epithets, and initials;
- literal words such as `of`;
- punctuation literals such as `,` or `-`;
- optional pause or boundary hints, if those become explicit.

Punctuation may later project to a pause for a renderer, but the durable phrase plan should represent pause/boundary intent explicitly before provider payloads are generated.

## Persistence boundary

Do not persist audio payloads by default.

Derived plans may be recalculated from durable generation facts:

- `SegmentSequence`;
- `AuditionPhonology`;
- `NameAuditionCue`;
- `IdentityAuditionPhrase`;
- selected renderer/provider settings, if a future slice adds them.

Persisted waveform/cache references should require a separate storage/cache decision, including invalidation when sound units, renderer settings, provider version, or voice changes.

## Boundary rules

- Keep generated sound before spelling, browser speech text, SSML, IPA, and provider payloads.
- Treat `AuditionPhonology` as the renderer-neutral source for generated sound-backed audition.
- Treat `IdentityAuditionPhrase.parts` as the source of phrase-level provenance.
- Keep text-backed lexemes and literals explicit; do not silently convert them into generated sound-backed units.
- Keep fallback stress labeled as fallback when future timing or emphasis hints use it.
- Keep provider-specific payloads downstream from renderer-neutral audio planning.
- Do not add audio fields to the current public `NameRequest` or `NameResponse` without a contract slice.

## Runtime non-goals

- No audio implementation.
- No Web Speech API changes.
- No paid provider integration.
- No SSML generation.
- No IPA generation.
- No phoneme dictionary.
- No waveform generation.
- No audio persistence or cache.
- No automatic pronunciation for arbitrary lexical text.
- No UI changes.
- No new active mode.

## Future design questions

- Is the smallest stable audio unit a segment, syllable, name part, or phrase part?
- Should timing hints exist before a renderer/provider is chosen?
- Which stress sources are safe to expose to users or providers?
- How should text-backed lexemes acquire sound provenance, if ever?
- Should literals and punctuation produce pause hints, text tokens, or no audio units?
- Should provider payloads be generated lazily, cached, or never persisted?
- How should exports represent future audio plans without implying canonical pronunciation?

## Safe next step after this boundary

A future implementation slice may add type-only contract sketches for `SoundUnitAudioPlan`, `AudioAuditionCue`, or `PhraseAudioPlan`. Runtime audio playback, provider integration, and persisted audio should remain deferred until the renderer-neutral contract and provenance rules are accepted.
