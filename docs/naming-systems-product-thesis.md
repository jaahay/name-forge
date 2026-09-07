# Naming systems product thesis

## Status

This is a strategy-level working record for the product direction emerging from Fiction Cast. It informs the identity-component requirements work in #252 and the broader Fiction Cast model in #233, but it does not by itself authorize new product surfaces, a universal relationship model, or a generic identity framework.

The current implementation focus remains Fiction Cast. Other naming domains in this document are architectural probes: they help distinguish durable naming-system concerns from vocabulary and orchestration that should remain domain-owned.

## Product value proposition

Name Forge should help users create **names that fit the thing and fit together**.

The product is increasingly more than an isolated random-name generator. The valuable problem is often a naming system: multiple named entities, structured identities, shared style or context, and enough differentiation that the resulting names remain individually useful.

A useful product-level progression is:

```text
individual naming quality
  -> structured identity composition
  -> coherent naming systems
```

### Individual naming quality

A generated name should satisfy the user's declared intent, such as familiarity, readability, compactness, spelling character, and selected naming style, without presenting internal heuristics as validated human truth.

### Structured identity composition

The visible identity may contain several semantically different values:

```text
Lady Elara Voss of Greyhaven
Aster Pro 3
Northstar Analytics LLC
```

Some values may be independently generated names, some may come from finite lexical inventories, some may be mechanically derived, and some may be structural literals or grammar. The product should preserve those distinctions instead of treating every visible fragment as the same kind of generated artifact.

### Coherent naming systems

Many useful naming jobs concern groups of related entities rather than one isolated string:

- a fictional cast;
- an NPC roster, encounter, faction, clan, or house;
- a product family or line;
- a company, division, or sub-brand family;
- a place system spanning regions, settlements, streets, buildings, or celestial entities;
- a software or technical system with related products, services, projects, repositories, or releases.

The exact relationship semantics differ by domain, but the recurring user need is recognizable: generate names that are distinct enough to work individually while remaining coherent with the system they belong to.

## Fiction Cast remains the primary proving surface

Fiction Cast currently provides unusually strong product pressure because it exercises all three layers at once:

- individual name generation and evaluation;
- composed identities with generated, lexical, derived, and literal material;
- plural coordination through cast variation, roles, locks, reroll, and ensemble selection.

This is a reason to continue developing Fiction Cast rather than pivoting immediately to a generic platform or a collection of shallow naming modes. Shared abstractions should continue to be extracted from demonstrated domain pressure rather than designed in anticipation of hypothetical reuse.

Game-oriented NPC needs are increasingly better understood as possible Fiction Cast semantics rather than necessarily requiring a permanent parallel product domain. A roster may use a different role vocabulary or assignment recipe, for example Shopkeeper, Boss, Minion, Guard, or Quest giver, while preserving the same lower naming and cast mechanisms. Whether the current Game NPC surface should eventually be consolidated is a later product decision, not a requirement of #252.

## Domain probes

The following domains are useful tests for the durability of the emerging architecture. They are not an implementation queue.

### Fiction Cast

Primary pressure:

> Produce a coherent but distinct ensemble of structured character identities.

Representative domain vocabulary includes personal names, family names, houses or clans, aliases, titles, epithets, locatives, role assignments, and cast-level contextual shaping.

### Product families

Primary pressure:

> Produce names that belong to one brand or family while remaining clearly differentiated by product role, tier, generation, edition, or variant.

Representative structures might include:

```text
Aster
Aster Pro
Aster Pro 3
Aster Studio
```

Product naming is a particularly useful second-domain probe because it creates family-level coherence pressure without sharing Fiction Cast's identity vocabulary.

### Companies and organizations

Primary pressure:

> Compose a durable institutional identity from brand-bearing and conventional material.

Representative structures might include:

```text
Northstar Analytics LLC
Northstar Labs
Northstar Systems
```

This domain pressures the distinction between generated brand identity, descriptors, legal suffixes, divisions, and sub-brands.

### Places and spatial systems

Primary pressure:

> Produce a coherent namespace for related locations or celestial entities.

Representative entities may include regions, cities, districts, streets, buildings, landmarks, stars, planets, moons, stations, or fictional settlements.

Spatial domains may introduce hierarchical relationships, but hierarchy should not be assumed to be the universal naming-system relationship model.

### Software and technical systems

Primary pressure:

> Name related technical entities so that names are usable, coherent, and semantically informative.

Representative entities include products, services, APIs, packages, repositories, jobs, environments, projects, releases, and codenames.

This domain may exercise semantic clarity and naming-convention constraints more strongly than phonetic creativity.

### Real-person or baby naming as a narrowing test

A real-person naming domain is useful architecturally because its component vocabulary should be deliberately narrower than Fiction Cast's.

A plausible personal identity might use given, additional or middle, family, lineage, particle, patronymic, or suffix semantics without importing Fiction Cast concepts such as epithets, fantasy houses, or regnal constructions by default.

This gives a useful portability test:

> **Can the component mechanism support a narrower domain without dragging Fiction Cast's fantastical vocabulary along with it?**

Real-world personal naming also carries cultural-sensitivity, plausibility, and duty-of-care requirements that are separate from this architectural test. This document does not authorize a baby-name product surface.

## Component mechanism versus domain vocabulary

The emerging identity-component model should distinguish reusable structural concerns from domain-owned meaning.

Potentially reusable structural concerns include:

- generated-component provenance;
- finite lexical-component provenance;
- derived-component provenance and source dependency;
- separate literal / grammatical phrase material;
- deterministic materialization;
- component-instance addressability;
- ordered composition;
- persistence and reroll semantics.

This does **not** imply one universal four-way component union. In the current #252 design, generated, lexical, and derived are independently addressable component classes, while literal/grammar material remains separate phrase structure.

Domain vocabularies remain domain-owned. For example:

```text
Fiction Cast
  personal, family, title, epithet, house, alias, locative, patronymic

Product
  brand, family, tier, generation, edition, variant, descriptor

Company
  brand, descriptor, division, legal suffix

Place
  region, settlement, street, building, celestial body
```

The architecture should aim for **O(1)-ish conceptual integration, not zero-touch extensibility**. Adding one worthwhile component kind should not require a new architecture or a new complete-format combinatorial matrix, but it is acceptable and often desirable for TypeScript exhaustiveness to force explicit decisions about provenance, sound, style, locking, reroll, and persistence.

Do not pre-emptively build a plugin framework, arbitrary grammar language, or universal component registry solely to make new component kinds appear mechanically cheap.

## Relationships: deliberately unresolved at the shared layer

Naming systems often involve relationships among named entities, but the topology is not obviously universal.

Examples include:

- minions serving one or several bosses;
- unique NPCs associated with a dungeon;
- people belonging to clans, houses, factions, or families;
- products belonging to lines, tiers, or generations;
- places belonging to regions or developments;
- companies owning products or containing divisions.

Some domains naturally look hierarchical. Others are many-to-many graphs. Some may need no explicit relationship model at all.

Therefore:

> **Do not introduce a shared hierarchy or graph abstraction merely because multiple naming domains contain relationships.**

Let relationship semantics remain domain-specific until repeated implementation pressure demonstrates a genuinely reusable contract. If a wholly domain-agnostic relationship model eventually emerges, it should be extracted from those concrete cases rather than imposed ahead of them.

## Cross-domain candidate sourcing

A product surface's ontology does not necessarily have to constrain where candidate names may come from.

For example, a future personal-naming workflow could deliberately draw inspiration from astronomical names, mythological corpora, places, historical vocabularies, or another declared source domain while still composing the result according to personal-name semantics. Conversely, a fictional character, product, or company might draw from source material that originated in another naming domain.

This suggests a useful separation:

```text
the thing being named
  !=
the semantic structure of its identity
  !=
the source domain from which candidate material may be drawn
```

That separation could become important to Name Forge's long-term range. It should not yet be generalized into one universal source graph or cross-domain API; #252 should simply avoid an identity-component model that makes such reuse impossible.

## Implications for #252

The richer Fiction Cast identity-component requirements should remain Fiction Cast-owned, but the proposed mechanism should be tested against the domain probes above.

In particular, #252 should prefer a design where:

- current complete formats are curated compositions, not the permanent ontology;
- generated, lexical, and derived components retain distinct provenance while literal/grammar remains separate phrase material;
- semantic component roles remain Fiction Cast vocabulary rather than leaking into the generic singular-name engine;
- adding one new component does not require enumerating every complete identity permutation;
- a narrower future domain could reuse structural component mechanics without inheriting Fiction Cast-specific roles;
- relationships among named entities remain outside the component model unless a concrete identity-composition requirement needs them;
- cross-domain candidate sourcing remains possible in principle without becoming part of the first implementation.

Representative non-Fiction examples should be used only as adversarial architecture checks. They are not requirements to implement Product, Company, Place, Software, or Personal naming during #252.

## Product discipline

The broadened value proposition should not broaden the codebase indiscriminately.

Use this sequence of evidence:

```text
concrete domain pressure
  -> bounded domain solution
  -> repeated structural pattern
  -> shared abstraction
```

Not:

```text
possible future domains
  -> speculative platform framework
  -> force current domains into it
```

The immediate product direction remains Fiction Cast because it is still exposing important questions about identity composition, style, role vocabularies, deterministic materialization, provenance, and system-level coherence.

A useful future checkpoint is reached when additional Fiction Cast work stops materially teaching us about those boundaries. At that point Product, Company, Place, or another concrete domain can serve as the next proving surface for whatever abstractions have actually earned promotion.
