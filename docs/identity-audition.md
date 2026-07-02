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
{given}, {given} of {place}
```

## Boundary rule

Phrase audition must preserve provenance. It should not turn every identity part into invented sound.

| Part kind | Meaning | Speech/display source |
| --- | --- | --- |
| `sound` | The identity part matches a generated source name and can reuse that source name's sound sequence. | `generated-sound` |
| `text` | The identity part is lexical or display text, such as a title, epithet, or initial. | `identity-text` |
| `literal` | The format pattern contributes a literal word or punctuation such as `of` or `,`. | `format-literal` |

Each phrase part carries both `speechSource` and `displaySource`. They currently match, but they are explicit because speech and display will likely diverge once provider-specific speech payloads or richer UI rendering are introduced.

## Controlled format parsing

Identity phrase audition parses the controlled `NameFormatRule.pattern` string without regular expressions. It scans the string for known placeholders such as `{given}` and `{place}`, then emits literal tokens for controlled words and punctuation.

This supports simple punctuation and repeated placeholders:

```text
{given}, {given} of {place}
```

Whitespace is formatting glue, not an audition part. Punctuation such as `,` is emitted as a `literal` part and attaches to the previous phrase text when the final speech/display string is assembled.

Repeated placeholders are deterministic. When multiple identity parts with the same role exist, repeated placeholders consume matching parts by occurrence. If there is only one matching part for a repeated placeholder, the projection reuses that part.

## Sound-backed parts

A part may become `sound` only when all of these are true:

1. Its role is sound-backed: `given`, `family`, or `place`.
2. A matching source generated name is supplied by `sourceNameId`.
3. The part value exactly equals the source generated name's display name.

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
