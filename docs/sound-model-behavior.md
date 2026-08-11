# Sound Model Behavior and Data Model

This document explains the sound side of Name Forge in plain terms. It is intentionally not a linguistics textbook. The goal is to make the product behavior understandable, keep the code honest about what it knows, and prevent browser/audio shortcuts from becoming the source of truth.

Related docs:

- [`requirements/sound-unit-audio-audition-boundary.md`](requirements/sound-unit-audio-audition-boundary.md): current browser-audition boundary plus the genuinely future renderer-neutral/provider audio boundary.

## The short version

Name Forge should behave like this:

```text
user intent
  -> typed style input
  -> sound recipe
  -> generated sound plan
  -> spelling options
  -> selected display name
  -> identity / product presentation
  -> sound guide and playback projections
```

The important rule is:

> The generated sound comes before the spelling. Spelling, display, browser voice, and future audio providers are projections of that sound model.

## Behavior model

A behavior model describes what each part of the system is responsible for doing.

### 1. User intent

User-facing settings describe the desired feel of the result: style pack, name length, novelty, readability, rarity, cast role, and similar controls.

These settings are ergonomic. They should not ask the user to know phonology terms.

Product or naming-layer code translates that intent into an appropriate typed style language. The low-level sound engine does not own product semantics such as Fiction Cast roles or title/epithet vocabularies.

### 2. Sound recipe

`SoundProfile` is the resolved mechanics value consumed by the sound engine. It answers questions like:

- Which syllable shapes are preferred?
- What texture does this style prefer: soft, crisp, fluid, balanced?
- How many syllables are preferred?
- Which cadence families are allowed?
- How strongly should onset, coda, liquid, glide, and cluster tendencies influence generation?

This is where phonotactic preference belongs. In plain language: phonotactics are the rules and tendencies for which sounds can appear together.

`SoundProfile` is a pure value. It does not contain a profile id, compiler provenance, product role, Fiction Cast job identifier, title/epithet lexicon, composition grammar, UI state, or runtime handles. Different style compilers may produce structurally equal profiles without requiring shared identity infrastructure.

### 3. Generated sound plan

`SegmentSequence` is the actual sound plan for one generated name before spelling.

It stores:

- the ordered sound segments
- the syllable spans over those segments
- which segment indexes act as onset, nucleus, and coda inside each syllable
- explicit coarse syllable metadata: `weight`, `sonorityProfile`, `stress`, and `stressSource`

This is the core generated sound value. It is not browser text, IPA, spelling, or a provider payload. It also does not need a synthetic sequence id merely to remain related to the `SoundCandidate` that contains it.

### 4. Spelling options

`generateSpellingCandidatePool(sound)` projects one generated sound into possible written forms.

`SpellingCandidatePool.candidates` is an ordered JavaScript/TypeScript collection because arrays are ordered. Its order is deterministic generation order, not quality ranking.

`rankSpellingCandidatePool(pool, profile)` creates a `RankedSpellingCandidateList`. At that point, order is meaningful: `.candidates` is sorted by score and each candidate also carries an explicit `rank` field. Consumers should use the rank field or ranked-list contract, not infer quality from an unranked spelling pool.

### 5. Selected display name

`GeneratedName` is the selected app-facing result. It preserves both sides:

- `name`: the selected display spelling
- `soundProfile`: the exact resolved profile value used for the primary generated component
- `sound`: the generated sound candidate behind the selected spelling
- `spelling`: the selected ranked spelling candidate
- `spellingCandidates`: retained ranked alternatives

The containing result establishes the relationship among those values. Nested generation values do not need relational ids merely so adjacent values can point back at one another.

### 6. Identity composition

Product-owned identity composition arranges generated and lexical parts into display forms such as:

```text
{given}
{given} {family}
{title} {given}
{given} {epithet} of {place}
```

For Fiction Cast, the current grammar and title/epithet lexicon live in the Fiction Cast domain rather than `SoundProfile` or the low-level sound engine.

A sound-backed identity part retains the exact contained generation bundle used for that part: `SoundProfile`, `SoundCandidate`, and selected spelling. A compound identity therefore may contain multiple independently generated sound-backed parts without pretending one aggregate profile describes the whole phrase.

Identity composition should not invent new generated sound material by string surgery. Text-backed titles, epithets, initials, and literals stay explicit unless a future model gives them their own sound provenance.

### 7. Audition and projection

Audition reads the generated sound model and prepares it for presentation.

Generated-name pipeline:

```text
SegmentSequence
  -> AuditionPhonology
  -> BrowserAuditionCue
  -> NameAuditionCue
```

Phrase pipeline:

```text
NameIdentity
  -> IdentityAuditionPhrase
  -> persisted NameArtifact.identityAudition
```

`AuditionPhonology` is renderer-neutral. It reads syllables, segments, generated syllable metadata, and stress hints. If generated stress is still `unspecified`, it may expose fallback stress, but it must label that fallback with `stressSource: 'fallback'`.

`BrowserAuditionCue` is renderer-specific. It may use practical text tricks to make browser speech or human display less awkward. It is not the source of truth.

The selected-name inspector already performs lightweight runtime browser playback through the Web Speech API. Whole composed identities are spoken as semantic chunks with a short presentation pause, and generated sound-backed given/family/place components can be played individually. That playback remains an approximation over existing audition projections; it is not a renderer-neutral sound-unit contract or canonical pronunciation model.

Future provider audio, SSML, IPA, waveform generation/caching, or portable timing models should follow [`requirements/sound-unit-audio-audition-boundary.md`](requirements/sound-unit-audio-audition-boundary.md). A new audio-plan abstraction should be added only when a concrete renderer requirement exceeds `AuditionPhonology`, `NameAuditionCue`, and `IdentityAuditionPhrase`.

## Data model

A data model describes what facts the system preserves.

### Durable facts

Durable facts are facts the generator has produced and later systems should be able to trust.

Examples:

- the resolved `SoundProfile` value retained with a generated component
- `SegmentSequence.segments`
- `SegmentSequence.syllables`
- `SegmentSyllable.start` / `end`
- `SegmentSyllable.onset` / `nucleus` / `coda`
- `SegmentSyllable.weight`
- `SegmentSyllable.sonorityProfile`
- `SegmentSyllable.stress`
- `SegmentSyllable.stressSource`
- `SpellingSegmentMapping.segmentIndex`
- `RankedSpellingCandidate.rank`
- the contained per-part generation bundle on sound-backed identity parts

These facts should be explicit and testable. When the generator does not know a linguistic fact, it should record `unspecified` rather than omit the field or pretend to know more.

### Derived facts

Derived facts are calculated from durable facts for a specific purpose.

Examples:

- a human-readable sound guide
- browser speech text
- fallback audition stress
- phrase-level browser playback chunks
- readability diagnostics
- future renderer-neutral audio plans, if a concrete need appears
- future SSML/provider payloads

Derived facts may be useful, but they should not silently replace the durable model. A fallback should stay visibly marked as a fallback.

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

A light syllable is short and open. A heavy syllable has a coda, diphthong, or rhotic nucleus in the current coarse model. This is approximate for this product; it should not claim linguistic authority.

The field is explicit:

```ts
weight: 'light' | 'heavy' | 'unspecified';
```

Do not use an optional field for this. Optional fields make it unclear whether the value is unknown, not modeled, forgotten, or not applicable.

### Sonority profile

Sonority is a rough idea of how open or vowel-like a sound is. Vowels are highly sonorous; stops like `p` and `t` are less sonorous; liquids like `l` and `r` sit in the middle.

A sonority profile describes the shape of a syllable's sound energy. The current generator computes it mechanically from segment sonority ranks:

```ts
sonorityProfile:
  | 'rising'
  | 'falling'
  | 'rise-fall'
  | 'flat'
  | 'complex'
  | 'unspecified';
```

This is a coarse product signal, not a language-specific phonology claim.

### Stress

Stress describes which syllable gets emphasis.

Example:

```text
owr · EHL · ee-oh-n
       ^ primary stress
```

Generated syllables carry explicit stress fields:

```ts
stress: 'primary' | 'secondary' | 'unstressed' | 'unspecified';
stressSource: 'sequence' | 'cadence-rule' | 'weight-rule' | 'fallback' | 'unspecified';
```

The generator currently sets stress to `unspecified`. `AuditionPhonology` applies the existing fallback stress rule only for presentation, and exposes that with `stressSource: 'fallback'` so a fallback guess does not look as authoritative as a generated stress decision.

### Phonotactics

Phonotactics are the rules and tendencies for sound combinations.

Plain examples:

- Some styles may like particular onset/coda balances.
- Some styles may avoid hard clusters.
- Some styles may prefer more fluid sonority.
- Some styles may allow heavier final syllables.

Phonotactics belong in the resolved `SoundProfile` and `soundGenerator` behavior. Product semantics and lexical inventories belong above that layer. Browser projection should own neither.

## Module responsibilities

| Module / layer | Plain responsibility | Should own | Should not own |
| --- | --- | --- | --- |
| `src/styleCompilation` | Turns a typed style language into a resolved engine recipe | Style compilation and `SoundProfile` values | Generated names or product identity grammar |
| `soundProfile.ts` | Describes the low-level sound recipe | Resolved sound targets and phonotactic preferences | Ids, compiler provenance, product roles, lexicons, UI state |
| `soundGenerator.ts` | Creates generated sound plans | Segment sequences, syllable spans, syllable metadata, sound candidates | Browser text or spelling display |
| `spellingGenerator.ts` | Writes the sound plan in letters | Spelling candidate pools, mappings, ranking | Sound validity |
| `src/naming` | Orchestrates current style compilation, sound generation, spelling selection, scoring, and variants | Name-generation workflow above the low-level engine | Fiction Cast composition grammar |
| `src/fictionCast/identity.ts` | Arranges Fiction Cast generated and lexical parts | Fiction Cast display identity parts and phrase structure | Low-level sound generation rules |
| `auditionPhonology.ts` | Reads generated sound for presentation | Renderer-neutral syllable metadata and explicit fallback stress | Generation rules or browser hacks |
| `browserAuditionProjection.ts` | Makes browser/display text from audition facts | `speechText`, guide text, browser-specific compromises | Core phonology or name validity |
| `identityAudition.ts` | Projects composed identities into audition phrase parts | Sound/text/literal provenance | Provider audio payloads or invented sound for text |
| `NameArtifactInspector.tsx` | Shows and lightly auditions the selected artifact | Labels, controls, browser Web Speech playback | Generation logic or canonical pronunciation |

## Working rules

1. Keep sound before spelling.
2. Keep durable facts explicit.
3. Prefer `unspecified` over optional fields for uncertain linguistic facts.
4. Do not let browser voice hacks become the sound model.
5. Do not let display spelling become the sound model.
6. Treat arrays as ordered collections. If order is semantic, document what it means. If order is only deterministic traversal, do not let callers treat it as ranking.
7. A rank field is stronger than array position when ranking is part of the contract.
8. Add small, testable facts before adding a large phonology abstraction.
9. Keep any future audio plan renderer-neutral before provider-specific projection.
10. Preserve phrase-level sound/text/literal provenance through browser playback and any future audio rendering.
11. Use containment for adjacent generation provenance instead of inventing relational ids without an independently addressable entity.

## Near-term direction

The explicit syllable metadata fields are in the durable sound model. Future work should make stress assignment smarter only when the generator has a real rule to own, such as cadence-driven or weight-driven stress. Until then, fallback stress belongs in audition projection and must remain labeled as fallback.

Browser speech playback already covers the current lightweight audition need. Future audio work should start from a concrete missing capability, then consult [`requirements/sound-unit-audio-audition-boundary.md`](requirements/sound-unit-audio-audition-boundary.md) before adding renderer-neutral timing, provider payloads, SSML, IPA, waveform generation, or audio persistence.
