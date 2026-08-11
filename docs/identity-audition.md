# Identity Phrase Audition

Related docs:

- [`requirements/sound-unit-audio-audition-boundary.md`](requirements/sound-unit-audio-audition-boundary.md): current browser-audition boundary plus the genuinely future renderer-neutral/provider audio boundary.

Name Forge has two related audition models:

```text
SegmentSequence -> NameAuditionCue
NameIdentity -> IdentityAuditionPhrase
```

`NameAuditionCue` is the single generated-name cue. It starts from one generated `SegmentSequence` and projects that sound into renderer-neutral phonology plus browser/display text.

`IdentityAuditionPhrase` is the phrase-level projection for composed display identities such as:

```text
Aurelion Relmar
Archivist Aurelion
Aurelion the Ashen of Relmar
```

The current selected-name inspector can also consume these projections for lightweight browser playback. That adapter is downstream from the audition models; it does not change their provenance rules.

## Ownership split

For the current Fiction Cast product, `src/fictionCast/identity.ts` owns phrase materialization. It creates `NameIdentity.phraseParts` at the same time it creates `displayName` and `parts`.

`src/engine/identityAudition.ts` owns audition projection. It consumes `NameIdentity.phraseParts` and the generation evidence already contained on sound-backed identity parts; it does not parse a format template string or look up an external source-name collection.

That split keeps product layout/grammar knowledge near identity construction and keeps shared audition focused on sound/text/literal projection.

## Boundary rule

Phrase audition must preserve provenance. It should not turn every identity part into invented generated sound.

| `NameIdentity.phraseParts` entry | `IdentityAuditionPart` kind | Meaning | Speech/display source |
| --- | --- | --- | --- |
| `{ kind: 'part', partId, role }` referencing a sound-backed part with contained generation evidence | `sound` | The identity part retains the generated sound used for that component and can reuse its sequence. | `generated-sound` |
| `{ kind: 'part', partId, role }` for lexical/display text | `text` | The identity part is text such as a title, epithet, or initial. | `identity-text` |
| `{ kind: 'literal', value }` | `literal` | The identity format contributes a literal word or punctuation such as `of` or `,`. | `format-literal` |

Each phrase part carries both `speechSource` and `displaySource`. They currently match, but they are explicit because speech and display may diverge in a future provider projection or richer presentation layer.

Current browser playback preserves the same `sound` / `text` / `literal` distinction while deriving utterance chunks. Future provider-neutral or provider-specific audio work must preserve it too. Text-backed lexemes and literals must stay explicit unless a future model gives them their own sound provenance.

## Materialized phrase parts

`NameIdentity.phraseParts` is the structural phrase model. It records part references and literals in final phrase order:

```ts
[
  { kind: 'part', partId: 'given-name:given', role: 'given' },
  { kind: 'part', partId: 'given-name:epithet', role: 'epithet' },
  { kind: 'literal', value: 'of' },
  { kind: 'part', partId: 'place-name:place', role: 'place' },
]
```

Repeated references are represented by repeated phrase entries:

```ts
[
  { kind: 'part', partId: 'given-name:given', role: 'given' },
  { kind: 'literal', value: ',' },
  { kind: 'part', partId: 'given-name:given', role: 'given' },
]
```

There is no separate format pattern field. That is deliberate: phrase structure should not have a second template-string representation that can drift from `phraseParts`.

## Sound-backed parts

A referenced identity part may become `sound` only when all of these are true:

1. Its role is sound-backed: `given`, `family`, or `place`.
2. The part contains generation evidence (`soundProfile`, `sound`, and selected `spelling`) retained when the identity was materialized.
3. The identity part value still exactly equals its recorded `sourceName`.

When those conditions hold, phrase audition derives `NameAuditionCue` from the contained `generation.sound.sequence`. `sourceNameId` and `sourceName` remain useful product/artifact metadata, but they are not relational lookup keys required to recover the sound model.

This follows the current containment rule: the identity part already owns the generation evidence needed to explain and audition that component.

## Text-only parts

Titles, epithets, initials, and literals stay text-only. They may be displayed or passed through as plain browser speech text, but the engine does not invent segment sequences for them.

That distinction is deliberate. `Archivist`, `the Ashen`, `J.`, and `of` are useful display/speech text, but they are not generated sound-backed names unless a future model explicitly gives them sound provenance.

## Current browser playback

The selected-name inspector currently provides a lightweight Web Speech API adapter:

- whole composed identities are split into semantic speech chunks from `IdentityAuditionPhrase.parts`;
- sound-backed parts use their modeled `speechText`;
- adjacent text/literal parts are grouped as lexical chunks;
- the inspector inserts a short presentation pause between chunks;
- generated sound-backed given/family/place components can also be played independently.

That pause and chunking policy belong to the browser adapter. They are not durable phonological facts and do not constitute a renderer-neutral phrase-audio plan.

## Non-goals

- No SSML.
- No IPA.
- No provider-specific TTS payload.
- No canonical pronunciation claim.
- No automatic pronunciation for arbitrary lexical text.
- No persisted waveform/audio cache.
- No new audio settings UI.
- No new pronunciation engine.

Phrase audition remains a provenance-preserving projection. The current Web Speech adapter is a lightweight consumer of that projection. Any future renderer-neutral timing model, provider payload, waveform generation, or persisted audio should start from [`requirements/sound-unit-audio-audition-boundary.md`](requirements/sound-unit-audio-audition-boundary.md) and add only the structure required by a concrete missing capability.
