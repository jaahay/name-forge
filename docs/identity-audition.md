# Identity Phrase Audition

Name Forge has two related audition surfaces:

```text
SegmentSequence -> NameAuditionCue
NameIdentity + source generated names -> IdentityAuditionPhrase
```

`NameAuditionCue` is still the single generated-name cue. It starts from one generated `SegmentSequence` and projects that sound into renderer-neutral phonology plus browser/display text.

`IdentityAuditionPhrase` is the phrase-level projection for composed display identities such as:

```text
{given} {family}
{title} {given}
{given} {epithet} of {place}
```

## Boundary rule

Phrase audition must preserve provenance. It should not turn every identity part into invented sound.

| Part kind | Meaning |
| --- | --- |
| `sound` | The identity part matches a generated source name and can reuse that source name's sound sequence. |
| `text` | The identity part is lexical or display text, such as a title, epithet, or initial. |
| `literal` | The format pattern contributes a literal word such as `of`. |

## Sound-backed parts

A part may become `sound` only when all of these are true:

1. Its role is sound-backed: `given`, `family`, or `place`.
2. A matching source generated name is supplied by `sourceNameId`.
3. The part value exactly equals the source generated name's display name.

When those conditions hold, phrase audition reuses the existing `renderAuditionCue(sourceName.sound.sequence)` behavior. This keeps the generated sound model as the source of truth.

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
