# Name Forge Product Requirements

> Converted from the uploaded `Name Forge Product Requirements.docx`. This Markdown copy is intended as the canonical repo-readable product specification.

# 1. Product Summary

**Name Forge** is a fictional character name generation system for authors, game designers, screenwriters, worldbuilders, and media creators.

Its core purpose is to generate names that are truly random enough to feel fresh, while still seeming reasonable, pronounceable, memorable, and narratively usable.

Name Forge is not merely a random string generator. It is a fictional naming engine built around:

- ensemble-aware cast generation
- name silhouettes
- plausibility scoring
- spelling variants
- provider/source registries
- provenance-bearing outputs
- soft-coded linguistic and cultural data packs
- future pronunciation/audio artifacts
- future social and cultural bias warnings

The MVP should start with a Vite + TypeScript + React/Preact application, preferably React unless there is a strong reason to optimize bundle size with Preact.

# 2. Product Thesis

A good fictional name generator should not only ask:

> How random should this name be?

It should ask:

> What degree of familiarity, pronounceability, memorability, cultural anchoring, narrative weight, and ensemble fit should this name have?

The design center is **controlled stochasticity**: names should be generated through randomness, but judged and shaped through explicit product criteria.

# 3. First-Class Use Case

## Primary Use Case

Generate names for fictional characters in media such that the names:

- feel plausible
- are easy enough to pronounce
- fit together as a cast
- vary in rarity and narrative weight
- avoid accidental sameness
- can be tuned from ordinary to mythic to alien
- provide useful explanation metadata

## Example Design Reference

A cast like Ron, Harry, Hermione, Draco, Minerva, and Neville works because the names occupy different regions of the name-space.

| Name | Functional Effect |
|---|---|
| Ron | plain, short, grounded |
| Harry | familiar, traditional, approachable |
| Hermione | rare, literary, distinctive |
| Draco | sharp, memorable, stylized |
| Minerva | classical, authoritative, mythic |
| Neville | familiar, comic/grounded, old-fashioned |

Name Forge should support this kind of ensemble diversity, not just isolated name generation.

# 4. Core Product Concepts

## 4.1 Ensemble Generation

An ensemble is a group of names generated together with cast-level balance.

The generator should not produce ten names that all sound as if they came from the same pattern. It should vary initials, endings, syllable count, rarity, cadence, phonetic texture, narrative weight, memorability, first-name/surname rhythm, and faction/culture coherence.

### Ensemble Goals

The system should be able to avoid:

- repeated initials
- repeated endings such as `-a`, `-on`, `-en`, `-ia`
- too many rare names
- too many plain names
- identical syllable shapes
- unintentional role stereotypes
- excessive orthographic weirdness across the whole cast

### Example Ensemble Profile

```json
{
  "ensembleProfile": {
    "size": 8,
    "rarityDistribution": {
      "plain": 2,
      "familiar": 3,
      "rare": 2,
      "mythic": 1
    },
    "cadenceDiversity": true,
    "initialDiversity": true,
    "endingDiversity": true,
    "roleFit": true
  }
}
```

## 4.2 Name Silhouette

A name silhouette describes the shape of a name before the exact letters are generated.

It should represent qualities such as number of parts, syllable count, length band, stress/cadence feel, rarity band, phonetic texture, orthographic texture, ending class, narrative weight, and formality.

### Example

```json
{
  "given": {
    "syllables": 3,
    "length": "medium",
    "rarity": "rare",
    "texture": ["liquid", "soft"],
    "narrativeWeight": "major"
  },
  "surname": {
    "syllables": 1,
    "length": "short",
    "texture": ["sharp"],
    "orthography": "plain"
  }
}
```

Possible outputs include Elowen Crake, Maribel Thorn, Aurelia Voss, and Seren Black. The exact names differ, but they share the same broad silhouette.

## 4.3 Plausibility Scoring

Generated names should be evaluated by a scoring layer. The scorer should consider pronounceability, memorability, novelty, distance from known names, distance from common words, cultural anchoring, orthographic naturalness, style fit, silhouette fit, ensemble fit, and eventual social/cultural risk.

### Example Score Object

```ts
type CandidateScore = {
  total: number
  pronounceability: number
  memorability: number
  novelty: number
  culturalAnchoring: number
  orthographicNaturalness: number
  styleFit: number
  silhouetteFit: number
  ensembleFit: number
}
```

## 4.4 Controlled Randomness

The primary controls should not be a single `randomness` value. The system should expose several axes.

### Recommended Controls

```ts
type NameGenerationControls = {
  novelty: number
  pronounceability: number
  culturalAnchoring: number
  orthographicWeirdness: number
  memorability: number
  socialRiskTolerance: number
}
```

### Example Preset

For contemporary literary fantasy:

```json
{
  "novelty": 0.35,
  "pronounceability": 0.9,
  "culturalAnchoring": 0.75,
  "orthographicWeirdness": 0.25,
  "memorability": 0.8,
  "socialRiskTolerance": 0.25
}
```

## 4.5 Spelling Variants

The system should generate or retrieve alternate spellings for a given name. Example variants for Vivian include Vivian, Vivien, Vivienne, Vyvian, and Vivyan.

Variants must not all be treated as equivalent. The system should distinguish relationship types.

### Variant Relationship Types

- `same_pronunciation`
- `near_pronunciation`
- `orthographic_variant`
- `regional_variant`
- `historical_variant`
- `transliteration`
- `cognate`
- `diminutive`
- `nickname`
- `creative_respelling`
- `alias`

### Example

```json
{
  "spelling": "Vivienne",
  "relationship": "orthographic_variant",
  "confidence": 0.89,
  "sources": ["generated.en.rules"],
  "provenance": [
    {
      "source": "generated.en.rules",
      "contribution": "rule_generated",
      "confidence": 0.62
    }
  ]
}
```

Generated variants must be marked differently from curated or externally sourced variants.

## 4.6 Provenance

Every generated result should carry provenance. The system should explain which source generated it, which rules contributed, whether it was found in a source or invented, confidence score, style pack used, random seed used, and scoring reasons.

### Example

```json
{
  "name": "Elowen Crake",
  "source": "generator.phonotactic",
  "stylePack": "british-literary-fantasy",
  "seed": "42",
  "generated": true,
  "provenance": [
    {
      "source": "builtin.fallback_inventory",
      "contribution": "phoneme_inventory"
    },
    {
      "source": "style_pack.british-literary-fantasy",
      "contribution": "style_constraints"
    }
  ]
}
```

## 4.7 Provider and Source Registry

The product should avoid hard-coding linguistic knowledge directly into application logic. Instead, it should hard-code mechanisms and soft-code data.

### Hard-Code

The core may hard-code schemas, loader interfaces, registry interfaces, scoring algorithms, generator algorithms, normalization pipeline, fallback inventory, fallback templates, and small test fixtures.

### Soft-Code

The product should load style packs, name corpora, pronunciation dictionaries, spelling variant rules, cultural naming packs, frequency data, script inventories, phoneme inventories, future sign/gesture/tactile systems, remote APIs, and user-uploaded packs.

### Source Descriptor Shape

```ts
type DataSourceDescriptor = {
  id: string
  label: string
  kind:
    | "pronunciation_dictionary"
    | "name_variant_source"
    | "name_frequency_source"
    | "phoneme_inventory"
    | "grapheme_inventory"
    | "sign_lexicon"
    | "tts_backend"
    | "style_pack"
    | "custom_pack"

  modality?: "spoken" | "written" | "signed" | "tactile" | "rhythmic" | "symbolic"

  access:
    | { type: "builtin" }
    | { type: "file"; path: string }
    | { type: "http"; url: string }
    | { type: "api"; baseUrl: string; auth?: "none" | "api_key" | "oauth" }
    | { type: "package"; name: string; version?: string }

  loader: string
  license?: string
  locale?: string
  priority?: number
  enabledByDefault?: boolean
  cachePolicy?: {
    ttlSeconds?: number
    immutable?: boolean
  }
}
```

The registry should store pointers and contracts, not the data itself.

## 4.8 Style Packs

Style packs define the statistical neighborhood or aesthetic space for generation. They are not full dictionaries. They should guide generation using constraints and preferences.

### Example Style Pack

```json
{
  "id": "british-literary-fantasy",
  "description": "Grounded English names with rare classical/literary influence.",
  "givenNameAnchors": ["Harry", "Ron", "Hermione", "Neville", "Minerva"],
  "surnameAnchors": ["Potter", "Weasley", "Granger", "Longbottom"],
  "phonotactics": {
    "preferredOnsets": ["h", "r", "m", "n", "l", "gr", "br"],
    "preferredCodas": ["n", "r", "y", "tt", "ll"]
  },
  "orthography": {
    "maxWeirdness": 0.35,
    "avoid": ["xx", "zzh", "q'"]
  }
}
```

Anchors should guide style and distance calculations, not be copied blindly.

## 4.9 Pronunciation and Audio

The MVP may start with text-only pronunciation hints. Future versions should support audio artifacts.

### Desired Artifact Bundle

```text
name/
  manifest.json
  pronunciation.wav
  pronunciation.ogg
  pronunciation.txt
  pronunciation.ipa
  provenance.json
```

### Manifest Example

```json
{
  "name": "Vivienne",
  "locale": "en-US",
  "voice": "espeak-ng:en-us",
  "ipa": "vɪviɛn",
  "generatedAt": "2026-06-14T00:00:00Z"
}
```

Audio should be generated only for selected names, not every candidate by default.

## 4.10 Social and Cultural Bias Awareness

Names encode real-world information, including race, ethnicity, religion, class, nationality, region, language, gender, and age cohort. The MVP does not need to fully solve bias detection, but the architecture should not assume names are neutral.

### Future Bias Controls

```ts
type BiasControls = {
  demographicInferenceMode: "off" | "warn" | "annotate"
  avoidRealPersonCollision: boolean
  avoidStereotypeClusters: boolean
  requireUserConfirmedCulturePack: boolean
}
```

### Narrative Bias Concerns

The product should avoid hard-coding lazy tropes such as `villain = harsh consonants`, `elder = long vowel + ancient suffix`, or `foreign empire = vaguely non-English phonemes`. Instead, it should use neutral aesthetic dimensions such as austere, ornate, plainspoken, scholarly, comic, severe, warm, archaic, and mythic.

# 5. Feature Priority Matrix

## 5.1 Must Have

These are required for the MVP to represent the product correctly.

| Feature | Requirement |
|---|---|
| Vite + TypeScript app | Project must be initialized as a Vite TypeScript web app |
| React or Preact UI | Use React by default unless choosing Preact deliberately |
| Single-page interface | App should expose controls and generated outputs in one flow |
| Seeded randomness | Same seed and settings should reproduce the same output |
| Basic name generation engine | Generate names from phonotactic templates and fallback inventories |
| Name silhouette type | Silhouette must be first-class in the engine model |
| Ensemble generation | Generate a cast, not just individual names |
| Basic ensemble balancing | Avoid same initials, repeated endings, and overly similar cadence where possible |
| Plausibility scoring | Names must include score metadata |
| Generation controls | User can tune novelty, pronounceability, memorability, cultural anchoring, orthographic weirdness |
| Style pack support | At least one built-in style pack must exist |
| Spelling variant prototype | Produce simple generated variants and label them as generated |
| Provenance metadata | Generated names and variants must include source/provenance labels |
| Provider registry abstraction | Include typed registry structure even if only built-in providers exist |
| README | Explain product concept, setup, and MVP scope |
| Architecture doc | Document engine, registry, scoring, silhouette, and ensemble design |

## 5.2 Need to Have

These should follow quickly after the MVP.

| Feature | Requirement |
|---|---|
| Multiple style packs | Add several fictional naming profiles |
| Name part generation | Support given name, surname, title, epithet |
| Cast role inputs | Allow roles such as protagonist, rival, mentor, sidekick |
| Rarity distribution | Let user request plain/familiar/rare/mythic distribution |
| Better scoring explanations | Explain why a name scored well or poorly |
| Common-word collision detection | Warn if a generated name resembles a common word |
| Known-name distance | Estimate distance from anchor names or known names |
| Basic pronunciation hints | Textual pronunciation approximations |
| Export results | Copy/download generated cast as JSON or Markdown |
| User-defined style packs | Allow custom JSON style pack input |
| License metadata on sources | Include license info in source descriptors |
| Data pack validation | Validate style pack/source pack shape before use |
| Test coverage | Unit tests for generator, variants, scoring, registry, seeded randomness |
| Local persistence | Save recent settings or generated casts in browser storage |

## 5.3 Nice to Have

Useful, but not necessary for the early product loop.

| Feature | Requirement |
|---|---|
| Audio generation | Generate `.wav`, `.ogg`, or browser TTS playback |
| IPA/phoneme output | Emit IPA or phoneme metadata where possible |
| Remote source registry | Load provider descriptors from remote endpoints |
| API-backed providers | Support Wikidata, Behind the Name-style APIs, CMUdict/WikiPron-like sources |
| Real name frequency data | Rank or warn based on real-world name frequency |
| Advanced cultural packs | Locale/script/culture-specific packs |
| Variant clustering | Group variants by relationship type |
| Bias warnings | Warn on likely cultural/religious/demographic associations |
| Real-person collision checks | Search or check against known public names |
| Domain/social handle checks | Useful for product/brand naming mode |
| Conlang mode | Let users define phonotactics for fictional cultures |
| Faction/culture generation | Generate coherent naming systems for groups |
| Character sheet export | Export names with role, feel, pronunciation, and notes |
| Visual name map | Plot names by novelty/familiarity/memorability |
| Batch comparison | Compare several generated casts side by side |

## 5.4 Later / Advanced

These belong to the larger vision.

| Feature | Requirement |
|---|---|
| Multimodal communication systems | Support gestural, tactile, symbolic, rhythmic, signed, visual systems |
| Sign-language lexicon providers | Load from licensed sign-language datasets |
| Tactile/symbolic naming | Generate non-spoken name sequences |
| Full pronunciation dictionaries | Integrate CMUdict, WikiPron, eSpeak-style providers |
| ML-generated variants | Learn spelling variants from aligned name clusters |
| Weighted finite-state transducers | Use formal rewrite models for spelling/pronunciation |
| Social-context simulation | Model how names read in different cultural/social settings |
| Narrative role-fit models | Evaluate fit for protagonist, antagonist, comic relief, mentor, etc. |
| Plugin marketplace | External packs/providers installed by users |
| Collaboration features | Shared style packs, saved projects, project-level naming rules |
| Full API service | Backend service for generation, provider caching, and source resolution |

# 6. MVP User Interface Requirements

## 6.1 Main Controls

The UI should include cast size, seed, style preset, novelty, pronounceability, memorability, cultural anchoring, and orthographic weirdness.

Optional early controls include surname, title, rarity distribution, max syllables, output count, and regenerate selected name.

## 6.2 Output Requirements

Each generated name should display name, score, silhouette summary, rarity band, pronunciation hint if available, variant suggestions, provenance labels, and reason/explanation metadata.

### Example Output Card

```text
Elowen Crake

Score: 0.84
Rarity: rare + grounded surname
Silhouette: 3-syllable soft/liquid given + 1-syllable sharp surname
Variants: Elowyn, Elowin, Ellowen
Sources: builtin.fallback_inventory, style_pack.british-literary-fantasy
Notes: High memorability, good cadence, moderate novelty.
```

# 7. Engine Requirements

## 7.1 Generation Pipeline

Recommended pipeline:

```text
Input Settings
  -> Resolve Style Pack
  -> Construct Silhouettes
  -> Generate Candidate Pool
  -> Score Candidates
  -> Apply Ensemble Constraints
  -> Generate Variants
  -> Attach Provenance
  -> Return Ranked Results
```

## 7.2 Candidate Generator

The candidate generator should use deterministic seeded randomness, generate syllables from fallback inventories, respect style pack preferences, respect silhouette constraints, produce more candidates than needed, and let the scoring layer choose the best results.

## 7.3 Candidate Judge

The judge should score candidates independently, score ensemble fit, penalize collisions, penalize repeated initials/endings, penalize excessive similarity, prefer silhouette fit, and include explanation metadata.

## 7.4 Candidate Renderer

The renderer should prepare output for UI cards, JSON export, Markdown export, and future audio/pronunciation artifact export.

# 8. TypeScript Domain Model Draft

## 8.1 Name Silhouette

```ts
type NameSilhouette = {
  parts: NamePartSilhouette[]
}

type NamePartSilhouette = {
  kind: "given" | "middle" | "surname" | "title" | "epithet"
  syllables?: number | [number, number]
  length?: "short" | "medium" | "long"
  rarity?: "plain" | "familiar" | "rare" | "archaic" | "mythic" | "alien"
  texture?: Array<"soft" | "liquid" | "nasal" | "sharp" | "breathy" | "percussive">
  orthography?: "plain" | "modern" | "antique" | "ornate" | "severe"
  ending?: "vowel" | "consonant" | "diminutive" | "latinate" | "germanic"
  narrativeWeight?: "minor" | "supporting" | "major" | "mythic"
}
```

## 8.2 Generated Name

```ts
type GeneratedName = {
  id: string
  display: string
  parts: GeneratedNamePart[]
  score: CandidateScore
  silhouette: NameSilhouette
  variants: NameVariant[]
  provenance: ProvenanceEntry[]
  seed: string
  warnings: NameWarning[]
}
```

## 8.3 Name Variant

```ts
type NameVariant = {
  spelling: string
  relationship:
    | "same_pronunciation"
    | "near_pronunciation"
    | "orthographic_variant"
    | "regional_variant"
    | "historical_variant"
    | "transliteration"
    | "cognate"
    | "diminutive"
    | "nickname"
    | "creative_respelling"
    | "alias"
  confidence: number
  source: string
  locale?: string
  generated: boolean
}
```

## 8.4 Provenance

```ts
type ProvenanceEntry = {
  sourceId: string
  sourceLabel: string
  contribution:
    | "phoneme_inventory"
    | "style_constraints"
    | "rewrite_rule"
    | "curated_variant"
    | "generated_candidate"
    | "scoring_signal"
  confidence?: number
}
```

## 8.5 Style Pack

```ts
type StylePack = {
  id: string
  label: string
  description: string
  locale?: string
  genre?: string
  givenNameAnchors?: string[]
  surnameAnchors?: string[]
  phonotactics?: {
    preferredOnsets?: string[]
    preferredVowels?: string[]
    preferredCodas?: string[]
    avoid?: string[]
  }
  orthography?: {
    maxWeirdness?: number
    avoid?: string[]
    preferredEndings?: string[]
  }
  defaults?: Partial<NameGenerationControls>
}
```

# 9. Initial Project Structure

Recommended scaffold:

```text
/
  package.json
  vite.config.ts
  tsconfig.json
  index.html
  README.md
  docs/
    architecture.md
    product-requirements.md
  src/
    main.tsx
    App.tsx
    styles.css
    engine/
      ensemble.ts
      generator.ts
      random.ts
      registry.ts
      scoring.ts
      silhouettes.ts
      types.ts
      variants.ts
    data/
      stylePacks.ts
  tests/
    generator.test.ts
    variants.test.ts
    ensemble.test.ts
```

# 10. Acceptance Criteria

## MVP Acceptance Criteria

The MVP is acceptable when:

1. The app runs locally with Vite.
2. The user can generate a cast of names.
3. The same seed and controls produce the same results.
4. The user can tune novelty, pronounceability, memorability, cultural anchoring, and orthographic weirdness.
5. Generated names include score metadata.
6. Generated names include silhouette metadata.
7. Generated names include provenance metadata.
8. Generated casts avoid obvious repetition of initials/endings when possible.
9. The app includes at least one style pack.
10. The app includes spelling variant suggestions.
11. Generated variants are clearly labeled as generated, not curated.
12. README explains the product concept and setup.
13. Architecture docs explain the core domain model.
14. Code is organized so generation logic is separate from UI.
15. The provider registry abstraction exists even if only built-in providers are active.

# 11. Non-Goals for MVP

The MVP does not need to include real pronunciation audio, full IPA support, paid API integrations, exhaustive real-world name databases, multilingual correctness, real demographic inference, sign/tactile/symbolic communication generation, cloud backend, login/accounts, collaborative projects, production-grade bias detection, or machine-learning-generated spelling variants.

These should remain architecturally possible but not implemented in the first pass.

# 12. Risks and Open Questions

## 12.1 Product Risks

| Risk | Notes |
|---|---|
| Names feel too random | Scoring and style packs must constrain output |
| Names feel too derivative | Novelty and known-name distance must prevent simple recombination |
| Casts lack variety | Ensemble balancing must be first-class |
| Variants are misleading | Generated variants must be labeled clearly |
| Cultural bias appears accidental | Bias warnings should be designed early even if not implemented |
| Source licensing becomes messy | Source registry needs license metadata from the start |
| UI becomes a toy demo | Engine must be real TypeScript logic, not mock data |

## 12.2 Open Questions

1. Should the MVP use React or Preact?
2. Should style packs be editable in the UI from day one?
3. Should generated casts include surnames by default?
4. Should role labels be part of MVP?
5. Should the app prioritize fantasy, contemporary literary, sci-fi, or general fictional naming first?
6. Should local storage save user settings?
7. Should export be JSON only, Markdown only, or both?
8. How strict should collision detection be in the first version?
9. How much should the UI explain scoring?
10. Should real-world cultural anchors be opt-in only?

# 13. Recommended Build Order

## Phase 1: Foundation

- Initialize Vite + TypeScript + React.
- Define domain types.
- Implement seeded random utility.
- Implement fallback phonotactic generator.
- Add one style pack.
- Render basic generated names.

## Phase 2: Fiction-Specific Logic

- Add name silhouettes.
- Add cast/ensemble generation.
- Add ensemble balancing.
- Add scoring metadata.
- Add explanation metadata.

## Phase 3: Variants and Provenance

- Add spelling variant generator.
- Add provider registry abstraction.
- Add provenance entries.
- Add source labels in UI.

## Phase 4: Product Polish

- Add better controls.
- Add JSON/Markdown export.
- Add tests.
- Add architecture docs.
- Improve visual design.

## Phase 5: Expansion

- Add more style packs.
- Add pronunciation hints.
- Add user style packs.
- Add source license metadata.
- Add optional audio.
- Add warning/bias scaffolding.

# 14. Guiding Principle

The core rule of Name Forge is:

> Hard-code mechanisms, not linguistic knowledge.

Hard-code schemas, interfaces, generation mechanisms, scoring mechanisms, normalization, fallback behavior, and provenance structure.

Soft-code languages, phoneme inventories, name corpora, style packs, pronunciation dictionaries, spelling conventions, variant rules, cultural naming behavior, and TTS/audio providers.

This keeps the system extensible, testable, legally safer, and suitable for fictional media workflows.
