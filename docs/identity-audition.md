# Identity Phrase Audition

Name Forge has two related audition surfaces:

```text
SegmentSequence -> NameAuditionCue
NameIdentity + source generated names -> IdentityAuditionPhrase
```

`NameAuditionCue` is still the single generated-name cue. It starts from one generated `SegmentSequence` and projects that sound into renderer-neutral phonology plus browser/display text.

`IdentityAuditionPhrase` is the phrase-level projection for composed display identities such as:

```text
Aurelion Relmar
Archivist Aurelion
Aurelion the Ashen of Relmar
```

## Ownership split

`identity.ts` owns phrase materialization. It creates `NameIdentity.phraseParts` at the same time it creates `displayName` and `parts`.

`identityAudition.ts` owns audition projection. It consumes `NameIdentity.phraseParts`; it does not parse a format template string.

That split keeps layout knowledge near identity construction and keeps audition focused on sound/text/literal projection.

## Boundary rule

Phrase audition must preserve provenance. It should not turn every identity part into invented sound.

| `NameIdentity.phraseParts` entry | `IdentityAuditionPart` kind | Meaning | Speech/display source |
| --- | --- | --- | --- |
| `{ kind: 'part', partId, role }` for a sound-backed generated name | `sound` | The identity part matches a generated source name and can reuse that source name's sound sequence. | `generated-sound` |
| `{ kind: 'part', partId, role }` for lexical/display text | `text` | The identity part is text such as a title, epithet, or initial. | `identity-text` |
| `{ kind: 'literal', value }` | `literal` | The identity format contributes a literal word or punctuation such as `of` or `,`. | `format-literal` |

Each phrase part carries both `speechSource` and `displaySource`. They currently match, but they are explicit because speech and display may diverge once provider-specific speech payloads or richer UI rendering are introduced.

## Materialized phrase parts

`NameIdentity.phraseParts` is the only structural phrase model. It records part references and literals in final phrase order:

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

A phrase part may become `sound` only when all of these are true:

1. The referenced identity part role is sound-backed: `given`, `family`, or `place`.
2. A matching source generated name is supplied by `sourceNameId`.
3. The identity part value exactly equals the source generated name's display name.

When those conditions hold, phrase audition reuses the existing generated-name audition behavior from the source name's `sound.sequence`. This keeps the generated sound model as the source of truth.

## Text-only parts

Titles, epithets, initials, and literals stay text-only. They may be displayed or passed through as plain speech text, but the engine does not invent segment sequences for them.

That distinction is deliberate. `Archivist`, `the Ashen`, `J.`, and `of` are useful display text, but they are not generated names unless a future model explicitly gives them sound provenance.

## Non-goals

- No SSML.
- No IPA.
- No provider-specific TTS payload.
- No automatic pronunciation for arbitrary lexical text.
- No UI redesign.

This keeps phrase audition as a provenance-preserving projection rather than a new pronunciation engine.
