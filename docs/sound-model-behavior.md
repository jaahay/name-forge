# Sound Model Behavior and Data Model

This document explains the sound side of Name Forge in plain terms. It is intentionally not a linguistics textbook. The goal is to make the product behavior understandable, keep the code honest about what it knows, and prevent browser/audio shortcuts from becoming the source of truth.

## The short version

Name Forge should behave like this:

```text
user intent
  -> sound recipe
  -> generated sound plan
  -> spelling options
  -> selected display name
  -> identity / cast presentation
  -> sound guide and playback projections
```

The important rule is:

> The generated sound comes before the spelling. Spelling, display, browser voice, and future audio providers are projections of that sound model.

## Behavior model

A behavior model describes what each part of the system is responsible for doing.

### 1. User intent

User-facing settings describe the desired feel of the result: style pack, name length, novelty, readability, rarity, cast role, and similar controls.

These settings are ergonomic. They should not ask the user to know phonology terms.

### 2. Sound recipe

`SoundProfile` is the compiled recipe used by the engine. It answers questions like:

- Which sound segments are likely?
- Which syllable shapes are likely?
- What texture does this style prefer: soft, crisp, fluid, balanced?
- What title or epithet lexemes are licensed by the profile?

This is where phonotactic preference belongs. In plain language: phonotactics are the rules and tendencies for which sounds can appear together.

### 3. Generated sound plan

`SegmentSequence` is the actual sound plan for one generated name before spelling.

It stores:

- the ordered sound segments
- the syllable spans over those segments
- which segment indexes act as onset, nucleus, and coda inside each syllable

This is the core generated sound artifact. It is not browser text, IPA, spelling, or a provider payload.

### 4. Spelling options

`generateSpellings(sound)` projects one generated sound into possible written forms.

`SpellingCandidate[]` is an ordered JavaScript/TypeScript collection because arrays are ordered. However, plain `SpellingCandidate` order should not be treated as quality ranking unless the function contract says so. Generation order is useful for deterministic traversal and tests, but it is not the same as ranked preference.

`rankSpellings(spellings, profile)` creates `RankedSpellingCandidate[]`. At that point, order is meaningful: the array is sorted by score and each candidate also carries an explicit `rank` field. Consumers should use the rank field or the ranked array contract, not infer quality from an unranked spelling array.

### 5. Selected display name

`GeneratedName` is the selected app-facing result. It preserves both sides:

- `name`: the selected display spelling
- `sound`: the generated sound candidate behind the selected spelling
- `spelling`: the selected ranked spelling candidate
- `spellingCandidates`: retained ranked alternatives

This lets the product show a polished name while still retaining the sound model that produced it.

### 6. Identity composition

`NameIdentity` arranges already licensed parts into display forms such as:

```text
{given}
{given} {family}
{title} {given}
{given} {epithet} of {place}
```

Identity composition should not invent new sound material by string surgery. If a part is verbal, it should come from generated sound, profile data, or a profile-selected lexeme.

### 7. Audition and projection

Audition reads the generated sound model and prepares it for presentation.

Current pipeline:

```text
SegmentSequence
  -> AuditionPhonology
  -> BrowserAuditionCue
```

`AuditionPhonology` is renderer-neutral. It should read syllables, segments, and stress hints. It should not decide what names are valid.

`BrowserAuditionCue` is renderer-specific. It may use practical text tricks to make browser speech or human display less awkward. It is not the source of truth.

## Data model

A data model describes what facts the system preserves.

### Durable facts

Durable facts are facts the generator has produced and later systems should be able to trust.

Examples:

- `SegmentSequence.segments`
- `SegmentSequence.syllables`
- `SegmentSyllable.start` / `end`
- `SegmentSyllable.onset` / `nucleus` / `coda`
- `SpellingSegmentMapping.segmentIndex`
- `RankedSpellingCandidate.rank`

These facts should be explicit and testable.

### Derived facts

Derived facts are calculated from durable facts for a specific purpose.

Examples:

- a human-readable sound guide
- browser speech text
- readability diagnostics
- future SSML/provider payloads

Derived facts may be useful, but they should not silently replace the durable model.

## Syllables, stress, and phonotactics in plain terms

### Syllabification

Syllabification means deciding how the sound sequence breaks into syllables.

Example:

```text
aurelion -> au / rel / ion
```

In the code, syllables are represented as spans over the segment list. The segment list stays flat, and syllables point into it by index. That avoids storing two competing sources of truth.

### Syllable weight

Syllable weight is a rough description of whether a syllable feels light or heavy.

A light syllable is usually short and open. A heavy syllable often has a long vowel, diphthong, or closing consonant. This is approximate for this product; it should not claim linguistic authority.

When we add this field, prefer an explicit unknown state:

```ts
weight: 'light' | 'heavy' | 'unspecified';
```

Do not use an optional field for this. Optional fields make it unclear whether the value is unknown, not modeled, forgotten, or not applicable.

### Sonority profile

Sonority is a rough idea of how open or vowel-like a sound is. Vowels are highly sonorous; stops like `p` and `t` are less sonorous; liquids like `l` and `r` sit in the middle.

A sonority profile describes the shape of a syllable's sound energy. For this product, it should remain coarse and humble:

```ts
sonorityProfile:
  | 'rising'
  | 'falling'
  | 'rise-fall'
  | 'flat'
  | 'complex'
  | 'unspecified';
```

Again, prefer explicit `unspecified` over optional fields.

### Stress

Stress describes which syllable gets emphasis.

Example:

```text
owr · EHL · ee-oh-n
       ^ primary stress
```

Current stress handling is a fallback approximation. It is good enough for a first guide, but it is not a deep prosody model.

Future stress fields should also carry the reason for the decision:

```ts
stress: 'primary' | 'secondary' | 'unstressed' | 'unspecified';
stressSource: 'sequence' | 'cadence-rule' | 'weight-rule' | 'fallback' | 'unspecified';
```

The source matters because a fallback guess should not look as authoritative as a generated or profile-driven stress decision.

### Phonotactics

Phonotactics are the rules and tendencies for sound combinations.

Plain examples:

- Some styles may like `br`, `dr`, or `th` onsets.
- Some styles may avoid hard clusters.
- Some styles may prefer names ending in vowels.
- Some styles may allow heavier final syllables.

Phonotactics belong in the sound recipe and generation behavior: `SoundProfile`, `soundGenerator`, and related profile/style compilation code. They should not be smuggled into browser projection.

## Module responsibilities

| Module | Plain responsibility | Should own | Should not own |
| --- | --- | --- | --- |
| `styleCompiler.ts` | Turns user-facing style intent into an engine recipe | Compiled profile data | Generated names |
| `soundProfile.ts` | Describes the internal sound recipe | Sound weights, cadence preferences, lexicon | Runtime callbacks or UI state |
| `soundGenerator.ts` | Creates generated sound plans | Segment sequences, syllable spans, sound candidates | Browser text or spelling display |
| `spellingGenerator.ts` | Writes the sound plan in letters | Spelling candidates, spelling mappings, spelling ranking | Sound validity |
| `identity.ts` | Arranges licensed name parts | Display identity parts | New arbitrary sound material |
| `auditionPhonology.ts` | Reads generated sound for sound presentation | Renderer-neutral syllable/stress facts | Generation rules or browser hacks |
| `browserAuditionProjection.ts` | Makes browser/display text from audition facts | `speechText`, guide text, browser-specific compromises | Core phonology or name validity |
| `NameInspector.tsx` | Shows the selected name to the user | Labels, controls, selected-name presentation | Generation logic |

## Working rules

1. Keep sound before spelling.
2. Keep durable facts explicit.
3. Prefer `unspecified` over optional fields for uncertain linguistic facts.
4. Do not let browser voice hacks become the sound model.
5. Do not let display spelling become the sound model.
6. Treat arrays as ordered collections. If order is semantic, document what it means. If order is only deterministic traversal, do not let callers treat it as ranking.
7. A rank field is stronger than array position when ranking is part of the contract.
8. Add small, testable facts before adding a large phonology abstraction.

## Near-term direction

The next responsible data-model improvements are likely:

```ts
weight: 'light' | 'heavy' | 'unspecified';
sonorityProfile: 'rising' | 'falling' | 'rise-fall' | 'flat' | 'complex' | 'unspecified';
stress: 'primary' | 'secondary' | 'unstressed' | 'unspecified';
stressSource: 'sequence' | 'cadence-rule' | 'weight-rule' | 'fallback' | 'unspecified';
```

These should be added only when tests can explain the behavior in plain terms. The product should prefer explicit uncertainty over confident-looking pseudo-science.
