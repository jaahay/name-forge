# Sound Model Behavior and Data Model

This document explains the sound side of Name Forge in plain terms. It is intentionally not a linguistics textbook. The goal is to make the product behavior understandable, keep the code honest about what it knows, and prevent browser/audio shortcuts from becoming the source of truth.

Related docs:

- [`decisions/0006-naming-capabilities-and-surface-composition.md`](decisions/0006-naming-capabilities-and-surface-composition.md): accepted surface -> semantic callback -> singular `generateName(...)` hierarchy above the sound model, plus the separate finite lexical inventory/selection path.
- [`requirements/sound-unit-audio-audition-boundary.md`](requirements/sound-unit-audio-audition-boundary.md): current browser-audition boundary plus the genuinely future renderer-neutral/provider audio boundary.

## The short version

Name Forge should behave like this for generated lexical names:

```text
product surface UX
  -> reusable semantic `-Name` callback
  -> generic singular generateName(...)
  -> typed style input
  -> sound recipe
  -> generated sound plan
  -> spelling options
  -> selected display name
  -> identity / product presentation
  -> sound guide and playback projections
```

The important rules are:

> Product surfaces express and inject naming intent above reusable semantic callbacks; every semantic `-Name` callback delegates lexical-name synthesis to one generic `generateName(...)` primitive; and generated sound comes before spelling.

Given, family, and place are first-class semantic generated-name roles. `generateGivenName(...)` is implemented; family/place wrappers are accepted pending #202 and do not need distinct sound mechanics to justify their semantic API status.

Spelling, display, browser voice, and future audio providers are projections of the generated sound model. Neither product-surface identity nor semantic name kind belongs inside `SoundProfile` or `generateSound(...)`.

Finite lexical values follow a different path. Particles, honorifics, titles, generational suffixes, or other bounded vocabulary terms may come from typed naming lexicons and semantic selectors over a deterministic `selectFromOptions(...)`-style mechanic. They do not pass through `SoundProfile` merely because they may appear in the same composed identity as a generated name.

## Behavior model

A behavior model describes what each part of the system is responsible for doing.

### 1. Surface intent and semantic naming capability

User-facing settings describe the desired feel and product context of the result: style source, name length, novelty, readability, rarity, cast role, region, faction, or other controls chosen by the surface.

These settings are ergonomic. They should not ask the user to know phonology terms.

A product surface owns how the user expresses intent. It derives configuration for one or more reusable semantic naming callbacks. `generateGivenName(...)` is implemented; `generateFamilyName(...)` and `generatePlaceName(...)` are accepted first-class wrappers pending #202. Every semantic `-Name` callback delegates generic one-name orchestration to the singular `generateName(...)` primitive. A wrapper may initially preserve exactly the same lower sound behavior while still owning a stable semantic caller contract.

Typed semantic `options` may facade granular language, region, dialect, inventory/source, or planning details rather than forcing every caller to pass those concerns independently. The underlying typed data may retain that resolution even when the sound engine receives only the resolved mechanics it actually needs.

The naming layer then resolves the typed style needed by the sound mechanics. The low-level sound engine does not own product semantics such as Fiction Cast roles, Game NPC mode identity, title/epithet vocabularies, naming lexicons, or semantic callback selection.

The singular `generateName(...)` boundary is implemented. It materializes internal `NameGenerationPlan` evidence before style compilation, sound generation, spelling, scoring, and variants. Callers do not construct a `NameSilhouette`; product-specific influences such as Fiction Cast roles are resolved above `generateName(...)` into generic planning preferences.

### 2. Sound recipe

`SoundProfile` is the resolved mechanics value consumed by the sound engine. It answers questions like:

- Which syllable shapes are preferred?
- What texture does this style prefer: soft, crisp, fluid, balanced?
- How many syllables are preferred?
- Which cadence families are allowed?
- How strongly should onset, coda, liquid, glide, and cluster tendencies influence generation?

This is where phonotactic preference belongs. In plain language: phonotactics are the rules and tendencies for which sounds can appear together.

`SoundProfile` is a pure value. It does not contain a profile id, compiler provenance, product role, semantic name kind, Fiction Cast job identifier, title/epithet lexicon, naming lexicon, composition grammar, UI state, or runtime handles. Different style compilers may produce structurally equal profiles without requiring shared identity infrastructure.

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

The current `silhouette` property on `GeneratedName` is compatibility/inspection evidence backed by `NameGenerationPlan`; it is not an input to the singular naming callback.

Checkpoint #199 found that the meaning of this app-facing result is not fully settled once Fiction Cast composes multiple parts: #203 tracks the required separation between one primitive sound-backed result and a composed product identity. This document therefore describes the current representation without declaring that representation a stable future surface contract.

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

Identity composition should not invent new generated sound material by string surgery. Text-backed titles, epithets, initials, selected lexical values, and literals stay explicit unless a future model gives them their own sound provenance.

The fact that these heterogeneous values can appear together does not require a universal `NameSegment` abstraction or omnibus `generatePersonName(...)` generator. The domain that knows the composition grammar owns composition.

### 7. Finite lexical selection

Some semantic values are naturally chosen from bounded vocabularies rather than synthesized from sound mechanics.

The accepted reusable direction is:

```text
typed NamingLexicon / LexicalInventory
  -> semantic selector
  -> deterministic selectFromOptions(...)
  -> selected lexical value
```

The generic selector owns only deterministic finite choice. A semantic selector such as `selectParticle(...)`, `selectGenerationalSuffix(...)`, or `selectHonorific(...)` owns the meaning of the list. The typed inventory owns the vocabulary and relevant provenance/scope.

The eventual inventory model should be able to retain language, region, dialect, historical period, register, or other source qualifiers where known, while a typed caller-facing `options` object may facade that detail. Name Forge owns the inventory contract, validation, deterministic consumption, versioning, and bundled datasets it ships; it does not claim that any built-in vocabulary is definitive linguistic truth for a locale or naming tradition.

This finite-choice path is deliberately outside `SoundProfile` and `generateSound(...)`.

### 8. Audition and projection

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

Phonotactics belong in the resolved `SoundProfile` and `soundGenerator` behavior. Product semantics, semantic name kinds, and lexical inventories belong above that layer. Browser projection should own neither.

## Module responsibilities

| Module / layer | Plain responsibility | Should own | Should not own |
| --- | --- | --- | --- |
| product surface | Captures UX intent and composes naming capabilities | Surface controls, defaults, presets, state, surface-specific aggregate behavior | Generic sound mechanics or hidden mode-driven generator branches |
| semantic `-Name` capability | Represents a reusable generated-name role | Typed domain configuration and semantic defaults before delegating to `generateName(...)` | Parallel low-level sound generator implementations |
| finite lexical capability | Selects bounded lexical values outside sound synthesis | Typed lexical inventories, semantic selectors, deterministic finite-choice plumbing | `SoundProfile` generation or universal identity composition |
| `src/naming` | Owns generic one-name orchestration above mechanics | Singular `generateName(...)`, internal generation-plan materialization, reusable semantic `-Name` capabilities | Fiction Cast composition grammar, cast roles, surface-specific aggregate behavior, caller-facing silhouette prerequisite |
| `src/styleCompilation` | Turns a typed style language into a resolved engine recipe | Style compilation and `SoundProfile` values | Generated names or product identity grammar |
| `soundProfile.ts` | Describes the low-level sound recipe | Resolved sound targets and phonotactic preferences | Ids, compiler provenance, semantic name kinds, product roles, lexicons, UI state |
| `soundGenerator.ts` | Creates generated sound plans | Segment sequences, syllable spans, syllable metadata, sound candidates | Browser text, spelling display, product semantics |
| `spellingGenerator.ts` | Writes the sound plan in letters | Spelling candidate pools, mappings, ranking | Sound validity |
| `src/fictionCast/ensemble.ts` | Owns cast-specific generation composition | Role-derived planning preferences, role evidence/scoring, ensemble selection | Generic singular naming mechanics |
| `src/fictionCast/identity.ts` | Arranges Fiction Cast generated and lexical parts | Fiction Cast display identity parts and phrase structure | Low-level sound generation rules or universal identity ontology |
| `auditionPhonology.ts` | Reads generated sound for presentation | Renderer-neutral syllable metadata and explicit fallback stress | Generation rules or browser hacks |
| `browserAuditionProjection.ts` | Makes browser/display text from audition facts | `speechText`, guide text, browser-specific compromises | Core phonology or name validity |
| `identityAudition.ts` | Projects composed identities into audition phrase parts | Sound/text/literal provenance | Provider audio payloads or invented sound for text |
| `NameArtifactInspector.tsx` | Shows and lightly auditions the selected artifact | Labels, controls, browser Web Speech playback | Generation logic or canonical pronunciation |

## Working rules

1. Keep the generated-name dependency direction `surface -> semantic -Name callback -> generateName(...) -> style/sound/spelling mechanics` explicit.
2. Every semantic `-Name` callback delegates to `generateName(...)`; do not create parallel sound generators merely because a name role has a first-class API.
3. Keep finite lexical selection separate from generated-name synthesis; typed lexicons and semantic selectors stay above the sound model.
4. Allow typed semantic `options` facades to hide granular source/language/region/dialect details while preserving those details in typed underlying data.
5. Keep sound before spelling.
6. Keep durable facts explicit.
7. Prefer `unspecified` over optional fields for uncertain linguistic facts.
8. Do not let browser voice hacks become the sound model.
9. Do not let display spelling become the sound model.
10. Do not let `mode`, semantic name kind, cast role, lexical vocabulary, or legacy `silhouette` evidence become hidden low-level sound switches.
11. Treat arrays as ordered collections. If order is semantic, document what it means. If order is only deterministic traversal, do not let callers treat it as ranking.
12. A rank field is stronger than array position when ranking is part of the contract.
13. Add small, testable facts before adding a large phonology abstraction.
14. Keep any future audio plan renderer-neutral before provider-specific projection.
15. Preserve phrase-level sound/text/literal provenance through browser playback and any future audio rendering.
16. Use containment for adjacent generation provenance instead of inventing relational ids without an independently addressable entity.
17. Do not introduce a universal `NameSegment` or omnibus `generatePersonName(...)` merely to unify heterogeneous identity composition.
18. Treat lexical inventory authority as bounded by declared provenance/scope rather than universal linguistic truth.

## Near-term direction

The singular `generateName(...)` boundary and first semantic `generateGivenName(...)` capability are implemented. Given, family, and place are all accepted first-class generated-name roles; #202 should narrow the stable semantic invocation contract and add `generateFamilyName(...)` / `generatePlaceName(...)` as wrappers over the same primitive. Their initial sound behavior may remain identical to generic generation.

The typed naming-lexicon / deterministic finite-choice direction is also accepted, but its exact runtime contract and migration of current static lexical lists should remain a separate bounded slice unless #201-#203 directly require it.

The current architecture work is checkpoint #198 and its evidence-backed blockers from #199 as refined by subsequent checkpoint decisions. #201 still owns generic/surface settings and role metadata separation; #202 owns semantic invocation and the wrapper family; #203 must stabilize the meaning of a primitive generated-name result versus a composed identity. None of those corrections should push semantic name kind, lexical vocabulary, or product-surface identity down into `SoundProfile` or `generateSound(...)`.

The explicit syllable metadata fields are in the durable sound model. Future work should make stress assignment smarter only when the generator has a real rule to own, such as cadence-driven or weight-driven stress. Until then, fallback stress belongs in audition projection and must remain labeled as fallback.

Browser speech playback already covers the current lightweight audition need. Future audio work should start from a concrete missing capability, then consult [`requirements/sound-unit-audio-audition-boundary.md`](requirements/sound-unit-audio-audition-boundary.md) before adding renderer-neutral timing, provider payloads, SSML, IPA, waveform generation, or audio persistence.
