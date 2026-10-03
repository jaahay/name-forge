# Identity Phrase Audition

Related docs:

- [`requirements/sound-unit-audio-audition-boundary.md`](requirements/sound-unit-audio-audition-boundary.md): current browser-audition boundary plus the genuinely future renderer-neutral/provider audio boundary.
- [`decisions/0009-generated-pronunciation-authority.md`](decisions/0009-generated-pronunciation-authority.md): generated pronunciation authority and the rule that authority remains local to sound-backed parts with generation-owned pronunciation facts.

Name Forge has two related audition models:

```text
SegmentSequence -> NameAuditionCue
FictionCastMaterializedIdentity -> IdentityAuditionPhrase
```

`NameAuditionCue` is the single generated-name cue. It starts from one generated `SegmentSequence` and projects that sound into renderer-neutral phonology plus browser/display text.

`IdentityAuditionPhrase` is the Fiction Cast phrase-level projection for composed display identities such as:

```text
Aurelion Relmar
Archivist Aurelion
Aurelion the Ashen of Relmar
```

The current selected-name inspector can also consume these projections for lightweight browser playback. That adapter is downstream from the audition models; it does not change their provenance rules.

## Ownership split

For the current Fiction Cast product, `src/fictionCast/identity.ts` owns identity materialization. It creates a `FictionCastMaterializedIdentity` with `displayName`, `components`, and `phraseParts`.

`src/fictionCast/identityAudition.ts` owns the composed audition projection. It consumes those `phraseParts` and the generation evidence already contained by generated components; it does not parse a format template string or recover sound through an external lookup.

This keeps Fiction Cast composition and phrase provenance in the surface domain while reusing the shared singular `renderAuditionCue(...)` projection for each generated component.

## Boundary rule

Phrase audition must preserve provenance. It must not turn every identity component into invented generated sound.

| `FictionCastIdentityPhrasePart` | Resolved component | `IdentityAuditionPart` kind | Speech/display source |
| --- | --- | --- | --- |
| `{ kind: 'component', componentId }` | `kind: 'generated'` and the component value still equals `generatedName.name` | `sound` | `generated-sound` |
| `{ kind: 'component', componentId }` | lexical or derived component, or any component that cannot safely reuse its generated value | `text` | `identity-text` |
| `{ kind: 'literal', value }` | no component | `literal` | `format-literal` |

Each audition part carries both `speechSource` and `displaySource`. They currently match, but they remain explicit because speech and display may diverge in a future provider projection or richer presentation layer.

Current browser playback preserves the same `sound` / `text` / `literal` distinction while deriving utterance chunks. Future provider-neutral or provider-specific audio work must preserve it too. Text-backed components and literals stay explicit unless a future model gives them pronunciation provenance.

## Materialized phrase parts

`FictionCastMaterializedIdentity.phraseParts` is the structural phrase model. It records component references and literals in final phrase order.

For an epithet/place identity the current shape is conceptually:

```ts
[
  { kind: 'component', componentId: 'component:given:0' },
  { kind: 'component', componentId: 'component:epithet:0' },
  { kind: 'literal', value: 'of' },
  { kind: 'component', componentId: 'component:place:0' },
]
```

The referenced `components` collection independently preserves whether each value is generated, lexical, or derived and retains the provenance appropriate to that kind.

There is no separate format pattern field. Phrase order is materialized directly, avoiding a second template-string representation that could drift from `phraseParts`.

## Sound-backed components

A referenced component becomes an audition `sound` part only when it is a `FictionCastGeneratedIdentityComponent` and its materialized value still exactly equals `component.generatedName.name`.

Generated roles currently include:

- `given`;
- `additional-personal`;
- `family`;
- `place`.

When that condition holds, phrase audition derives `NameAuditionCue` from `component.generatedName.sound.sequence`. The resulting sound part records `componentId`, `generatedNameId`, `sourceName`, the retained transcription, and the cue.

This follows the current containment rule: the generated component already contains the complete `GeneratedName` evidence needed to explain and audition that value. No relational lookup is required.

## Text-backed components and literals

Lexical titles and epithets, derived initials, and format literals stay text-backed. They may be displayed or passed through as ordinary browser speech text, but the system does not fabricate a generated `SegmentSequence` for them.

That distinction is deliberate. `Archivist`, `the Ashen`, `J.`, and `of` can be useful display/speech text without pretending they were synthesized by the sound generator.

Under ADR 0009, this is also a pronunciation-authority boundary. A composed identity does not become wholly authoritative pronunciation merely because one or more generated components have authoritative sound evidence; lexical, derived, and literal parts remain renderer-interpreted until they receive explicit pronunciation provenance.

## Current browser playback

The selected-name inspector currently provides a lightweight Web Speech API adapter:

- whole composed identities are split into semantic speech chunks from `IdentityAuditionPhrase.parts`;
- sound-backed parts use their modeled `speechText`;
- adjacent text/literal parts are grouped as lexical chunks;
- the inspector inserts a short presentation pause between chunks;
- generated sound-backed given/additional-personal/family/place components can be played independently.

That pause and chunking policy belongs to the browser adapter. It is not a durable phonological fact and does not constitute a renderer-neutral phrase-audio plan.

## Non-goals

- No SSML.
- No IPA.
- No provider-specific TTS payload.
- No whole-identity authoritative pronunciation claim while any spoken part remains text-backed, derived/literal without pronunciation provenance, or dependent on audition fallback.
- No automatic pronunciation for arbitrary lexical text.
- No persisted waveform/audio cache.
- No new audio settings UI.
- No new pronunciation engine.

Phrase audition remains a provenance-preserving Fiction Cast projection over materialized identity structure and shared generated-name audition. The current Web Speech adapter is a lightweight consumer of that projection. Any future renderer-neutral timing model, provider payload, waveform generation, or persisted audio should start from [`requirements/sound-unit-audio-audition-boundary.md`](requirements/sound-unit-audio-audition-boundary.md) and add only the structure required by a concrete missing capability.
