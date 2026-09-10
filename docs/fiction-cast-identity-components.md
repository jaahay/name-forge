# Fiction Cast identity-component model

## Status

Working design record for #252 under Fiction Cast requirements #233 / #212.

Naming-idiom semantics are governed by [`decisions/0007-naming-idioms-and-composition.md`](decisions/0007-naming-idioms-and-composition.md), #249, and PR #263. This record keeps the component ontology while using that settled terminology and causal boundary.

This document defines the bounded identity-component model that should precede broader Fiction Cast identity expansion. It is intentionally more concrete than the strategy-level [`naming-systems-product-thesis.md`](naming-systems-product-thesis.md), while remaining a requirements/design record rather than an authorization to implement every component described here.

The current implementation focus remains Fiction Cast. Product, company, place, software, and real-person naming are used only as adversarial architecture checks where they help distinguish structural mechanics from Fiction Cast vocabulary.

## Core decision

**Model meaningful identity components first; compose curated identity structures second.**

The current complete formats are useful shipped structures, but they must not become the permanent ontology of identity.

The target model separates:

```text
semantic component role
  x
component materialization class
  -> materialized identity component

materialized components
  + structure-owned phrase grammar
  -> displayed identity
```

A component's **role** answers what the value means in the identity. Its **materialization class** answers where the value came from and what provenance it can legitimately carry.

Those are intentionally separate axes.

## Why the current model needs to evolve

Today `NamePartRole` and `GeneratedNamePart` combine several different ideas:

- independently generated given/family/place names;
- an initial derived from a generated given name;
- titles and epithets selected from finite Fiction Cast vocabularies;
- phrase literals such as `of`.

`GeneratedNamePart` also requires `sourceNameId` / `sourceName` even for title and epithet values that were not generated from that name. That is sufficient for the five current forms, but it gives lexical and derived material provenance shapes that are semantically misleading.

The current format enum creates a second scaling pressure. Adding richer identities by continuing to add values such as `given-middle-family`, `title-given-middle-family`, `house-given-family`, and every combination would turn complete display permutations into the durable domain model.

#252 should remove those pressures before new identity families are added.

## Existing ownership boundary

Fiction Cast composition behavior is already correctly owned under `src/fictionCast/`. This design is **not** a request to relocate existing ensemble/identity orchestration merely for directory purity.

The accepted architecture remains:

```text
Fiction Cast surface
  -> semantic naming capabilities
  -> generateName(...)
  -> singular GeneratedName values

singular GeneratedName values
  + Fiction Cast lexical / derived / literal material
  -> Fiction Cast composed identity
```

That is consistent with Decisions 0005 and 0006: `generateName(...)` owns one sound-backed lexical name; semantic naming capabilities own reusable naming meaning; Fiction Cast owns the composition and lifecycle of the aggregate result.

#252 refines the **surface-owned materialized identity/provenance contract**. It should only move or narrow existing shared structural types when they encode Fiction Cast vocabulary that a genuinely shared layer does not need.

A lower helper may remain outside Fiction Cast when its contract is truly role-agnostic—for example, traversal or rendering over resolved text plus optional sound evidence. Shared mechanics should not need to understand `epithet`, `title`, `given-family`, or other Fiction Cast-specific meaning merely to perform that lower operation.

`src/fictionCast/` is already the domain module. If callers eventually benefit from one public domain entry point, prefer a curated `src/fictionCast/index.ts` that exposes only the intended contract. Do not replace the directory with one monolithic `fictionCast.ts`, and do not use indiscriminate `export *` re-exports as a substitute for deciding the boundary.

## Terminology

### Identity structure

A **Fiction Cast identity structure** is a curated composition policy for one visible identity.

Examples include the current:

- given only;
- given + family;
- initials + family;
- title + name;
- epithet/place-style.

A structure declares which semantic component instances are needed and how their materialized values are rendered into a phrase. A structure is not the permanent list of possible identity components.

The current `mixed` value is not itself a materialized identity structure. It is a deterministic **structure-selection policy** that chooses one materialized structure per cast slot.

### Identity component

A **materialized identity component** is an independently addressable semantic value retained as part of the resolved identity.

Examples:

- generated personal name `Daywoj`;
- generated family name `Bayr`;
- lexical title `Archivist`;
- derived initial `D.`;
- a future generated alias;
- a future patronymic derived from retained source material.

### Phrase material

The displayed phrase is assembled from references to materialized components plus grammar/literals such as `of`, punctuation, or fixed connective text.

A literal participates in the materialized phrase representation, but it is **not** an identity component merely because it appears in the rendered phrase. It ordinarily needs no independently addressable component ID or component provenance record.

This preserves the existing Inspector principle:

> **Enumerate independent generated artifacts, not every textual fragment of the displayed identity.**

## Identity-component classes and phrase material

The initial ontology has **three independently addressable identity-component classes**. Literal/grammar material is represented separately in phrase structure.

### 1. Generated name component

An independently generated sound-backed naming artifact produced through a semantic naming capability.

Examples:

- primary personal/given name;
- additional personal name;
- family name;
- independently generated place name;
- future independently generated alias or house/clan name when a concrete semantic capability justifies it.

A generated component retains the generated-name evidence belonging to that exact invocation. Sound, spelling, generation-plan, and source evidence may be inspected because the component was actually generated through that path.

### 2. Lexical component

A value selected deterministically from a finite typed inventory rather than synthesized as a sound-backed name.

Examples:

- title or honorific;
- epithet;
- rank or office term;
- future bounded house/clan marker;
- future idiom-scoped identity vocabulary.

A lexical component retains lexical provenance such as the selected lexeme ID and inventory/source identity. It must not masquerade as an independently generated name merely because its selection happened while composing one.

A lexical value may itself contain multiple rendered words, such as the current epithet lexeme `the Ashen`. Whether a token such as `the` is retained inside one lexical value or represented as separate phrase grammar is a declared structure/inventory decision, not something inferred from token count.

### 3. Derived component

A value mechanically derived from retained source material under an explicit derivation rule.

Examples:

- an initial derived from a personal name;
- a patronymic or matronymic derived from a retained parent-name source;
- abbreviation;
- inflected locative or dynastic form;
- regnal/succession notation when it is actually determined from source/context rather than independently selected.

A derived component retains the derivation rule and source provenance required to explain the value. It does not receive independent generated-name evidence unless an explicit future mechanism genuinely generates it independently.

### Phrase literal / grammar material

Structure-owned text used only to render the identity phrase.

Examples:

- `of`;
- punctuation;
- fixed connectors such as a future `called` / `known as` construction;
- other structure grammar that is not itself an identity value.

Literals belong in the materialized phrase and persistence representation, but they are **not a fourth identity-component class** and ordinarily do not need stable component IDs.

## Semantic roles are orthogonal to materialization class

The component class must not determine the semantic role, and representational form must not be smuggled back into the semantic-role axis.

For example:

```text
Daywoj
  class: generated
  role: primary personal

D.
  class: derived
  role: primary personal
  derivation: initial

Archivist
  class: lexical
  role: title / honorific

Morvane
  class: generated
  role: place
```

`D.` and `Daywoj` can therefore carry the same broad semantic role while remaining different component instances with different materialization/provenance semantics. The initial-ness of `D.` belongs to its derivation rule, not to a supposedly universal semantic role named `initial`.

The same broad semantic concept can also have more than one legitimate materialization strategy in different structures.

A house/clan identity is a useful example:

- the house name itself might be an independently generated name;
- a house marker such as `House` may be lexical or literal depending on the structure/idiom contract;
- a dynastic adjective may be derived from another retained name.

Therefore do not encode assumptions such as `house always means lexical` or `alias always means generated` into the structural component machinery.

## Fiction Cast semantic-role vocabulary

The component mechanism should be capable of representing at least these Fiction Cast meanings as the domain grows:

- primary personal / given;
- additional personal;
- family;
- place / locative source;
- house / clan / dynastic identity;
- parent / lineage source where needed for derivation;
- alias / byname / pen-name-like identity;
- title / honorific / rank;
- epithet;
- patronymic / matronymic result;
- regnal / succession result.

This is a requirements vocabulary, not a requirement to add every value to one runtime union immediately.

Implementation should add supported roles as concrete structures need them. TypeScript exhaustiveness is desirable: adding a new semantic role should force deliberate answers where that role changes provenance, generation, audition, idiom participation, locking, reroll, persistence, or Inspector behavior.

A narrower future domain must be able to define a narrower vocabulary without importing Fiction Cast roles such as epithet, house, or regnal identity merely because it reuses some structural mechanics.

## Proposed materialized identity shape

The first implementation should remain Fiction Cast-owned rather than introducing a universal cross-product identity framework or shared heterogeneous `NamePart` abstraction.

Conceptually:

```ts
type FictionCastIdentityComponent =
  | FictionCastGeneratedComponent
  | FictionCastLexicalComponent
  | FictionCastDerivedComponent;

type FictionCastIdentityPhrasePart =
  | { kind: 'component'; componentId: string }
  | { kind: 'literal'; value: string };

interface FictionCastMaterializedIdentity {
  structure: FictionCastIdentityStructure;
  components: readonly FictionCastIdentityComponent[];
  phraseParts: readonly FictionCastIdentityPhrasePart[];
  displayName: string;
}
```

The exact TypeScript names are implementation choices. The important contract is:

1. component materialization class is explicit;
2. semantic role is explicit and independent from class;
3. generated, lexical, and derived provenance have different shapes;
4. phrase order is separate from component inventory;
5. literals remain phrase material rather than fake components;
6. hidden/support source components may be retained without requiring them to appear directly in the displayed phrase;
7. the representation belongs to Fiction Cast unless a smaller role-agnostic structural primitive is independently demonstrated.

This remains consistent with Decision 0006's rule that composition uses concrete values. The component union is the Fiction Cast surface's resolved aggregate representation; it is not a replacement for `GeneratedName`, semantic naming capabilities, or the generic one-name generation path.

### Generated component provenance

Conceptually a generated component needs:

- stable component-instance ID within the materialized identity;
- semantic role;
- displayed/generated value;
- the exact `GeneratedName` or an equivalent lossless generated-name provenance projection;
- any component-instance key required for deterministic replay/materialization.

The implementation should avoid duplicating intrinsic generation evidence into several slightly different structures when the exact generated result can be retained or referenced safely.

### Lexical component provenance

Conceptually a lexical component needs:

- stable component-instance ID;
- semantic role;
- selected text;
- lexeme/value ID;
- inventory/source identity when the inventory has one;
- enough deterministic context to explain which bounded vocabulary was selected.

It does **not** need `sourceNameId` merely because another generated component happened to be present when the lexical choice was made.

### Derived component provenance

Conceptually a derived component needs:

- stable component-instance ID;
- semantic role;
- derived value;
- derivation kind/rule ID;
- source component/provenance references sufficient to explain the transformation.

Derived-component dependencies must be acyclic within one materialized identity.

A future derivation may depend on retained source material that is not itself rendered. That source must still be preserved strongly enough that the derived value does not become provenance-free after persistence.

## Current structures under the new model

The current shipped structures collectively exercise all three component classes plus literal phrase material and should be the migration fixture for the new model.

### Given only

```text
Daywoj
```

Components:

- `Daywoj` — generated, primary personal.

Phrase:

- primary personal component.

### Given + family

```text
Daywoj Bayr
```

Components:

- `Daywoj` — generated, primary personal;
- `Bayr` — generated, family.

Phrase:

- primary personal;
- family.

### Initials + family

```text
D. Bayr
```

Components:

- `Daywoj` — generated, primary personal source;
- `D.` — derived, primary personal, from `Daywoj` by the initial derivation rule;
- `Bayr` — generated, family.

Phrase:

- derived initial representation;
- family.

This is an important correction to the current shape: the underlying independently generated personal name remains part of provenance even though the phrase renders only its derived initial.

Inspector should therefore still be able to enumerate `Daywoj` and `Bayr` as the genuinely generated artifacts. `D.` is construction/derivation evidence, not a third generated name.

### Title + name

```text
Archivist Daywoj
```

Components:

- `Archivist` — lexical, title/honorific;
- `Daywoj` — generated, primary personal.

Phrase:

- title;
- primary personal.

The title selection has lexical provenance. It does not inherit generated-name provenance from Daywoj.

### Epithet/place-style

```text
Daywoj the Ashen of Morvane
```

Components:

- `Daywoj` — generated, primary personal;
- `the Ashen` — lexical, epithet;
- `Morvane` — generated, place.

Phrase:

- primary personal;
- epithet;
- literal phrase part `of`;
- place.

## Richer identity cases

The ontology should classify richer target examples without requiring a universal grammar.

| Target case | Likely materialization |
| --- | --- |
| given + additional personal + family | generated primary + generated additional + generated family |
| multiple additional personal names | repeated generated additional-personal component instances |
| `House Veyran` | literal/lexical marker + generated or lexical house component, depending on declared structure/source |
| `Eriksson` from `Erik` | derived patronymic retaining source-name provenance |
| `known as Red Jack` | literal connector + independently generated or lexical alias/byname component |
| `King Alaric IV` | lexical title + generated personal + derived/contextual regnal component |
| `Daywoj of Morvane` | generated personal + literal `of` + generated place |
| `Morvanian Daywoj` | derived locative/adjectival component from retained place source + generated personal |
| `Daywoj the Ashen` | generated personal + lexical epithet |

The table intentionally permits more than one materialization strategy where the product has not yet chosen the source semantics. The component model should represent the selected strategy faithfully rather than hiding it behind one universal role implementation.

## Multiplicity and component instances

Semantic role must not imply uniqueness.

At minimum:

- primary personal source and a derived representation of it may coexist;
- additional personal names may repeat;
- aliases/by-names may eventually repeat;
- titles/honorifics may eventually appear more than once in some structures;
- generated or derived support components may exist without appearing directly in the phrase.

Each materialized component therefore needs an **instance identity** separate from its role.

A structure may declare instance keys such as conceptually:

```text
personal:primary
personal:primary:initial
personal:additional:0
personal:additional:1
family:0
title:0
```

The exact key syntax is not a public contract. The requirement is stable addressability inside a materialized identity without assuming one component per semantic role.

## Deterministic materialization

Same resolved settings + seed + structure definition/version must reproduce the same materialized identity under the active deterministic contract.

Component choice should be driven by explicit deterministic context, not by incidental fingerprints of another component's displayed text unless that dependency is part of the declared semantic rule.

In particular, future lexical selection should prefer a stable component-instance seed namespace over patterns such as selecting a title by hashing the generated given-name spelling. That gives each independently materialized choice an explicit causal input and makes later component-level reroll semantics possible without inventing hidden dependencies.

Conceptually:

```text
cast seed
  + cast slot
  + materialized structure id/version
  + component instance key
  -> deterministic component materialization
```

Generated-name components still delegate their own internal determinism to the semantic naming callback / `generateName(...)` boundary.

This requirement does not promise that future algorithm versions will reproduce historical results from seed alone. Remembered/persisted casts must retain the resolved materialized identity rather than reinterpret old results against new component definitions.

The current `FictionCastRememberedCast` already retains the complete `FictionCastGeneratedEnsemble`, which is the correct ownership direction: once the richer materialized identity is part of that result, remembered casts can retain the resolved identity rather than introducing a seed-only reconstruction contract.

## Structure definitions and versioning

Curated structures may evolve, but a remembered result must not silently acquire a new meaning because the current structure implementation changed.

A materialized identity should therefore retain enough identity-structure information to distinguish the rule set that produced it. The smallest appropriate version boundary should be chosen during implementation.

Do not store only `format = "title-name"` and later reconstruct historical title/phrase semantics from the newest code if the result itself is intended to survive that change.

The durable value is the materialized identity: resolved components, resolved phrase material, and their provenance.

## Configure boundary

The component ontology is not automatically the Configure UI.

Preferred product direction remains curated structures such as:

```text
Given only
Given + family
Initial + family
Title + name
Epithet + place
```

with richer curated structures added when they solve real user jobs.

Do not expose an arbitrary drag-and-drop component grammar, universal component matrix, or user-authored formatting language merely because the internal representation can compose more parts.

A future advanced component-oriented control may be justified by concrete workflows, but #252 does not require one.

## Naming idiom

The three component classes and phrase material participate in the selected Naming idiom differently.

### Generated components

Use the selected Naming idiom through the semantic generated-name capability. Selecting an idiom activates its supported bounded tendencies; there is no separate adherence, influence, or strength scalar. Familiar, Readable, Compact, Spelling, Cast variation, Roles, identity structure, and seed remain independently declared intent. See ADR 0007 and #249 / PR #263.

### Lexical components

May select from idiom-scoped Fiction Cast inventories or deliberately shared inventories. Their idiom relationship remains surface-owned; they do not need to become generated-name `StylePack` data.

### Derived components

Inherit their form from explicit source material and derivation rules. They do not receive independent idiom influence unless the derivation rule itself is idiom-scoped.

### Phrase literals

Belong to structure grammar. A literal may differ by idiom/structure only when that is an explicit composition decision. Do not treat every connector as a generated or independently scored idiom value.

This provides the component-level boundary needed for visible identity coherence without allowing Naming idiom selection to override unrelated Fiction Cast intent.

## Inspector and provenance

The ordinary Inspector should continue to promote independent generated artifacts, not every component equally.

For example:

```text
D. Bayr
```

may expose generated components:

```text
Daywoj · Personal source
Bayr   · Family
```

while the initial derivation remains construction detail.

Likewise:

```text
Archivist Daywoj
```

should not claim `Archivist` was generated through the sound-backed name engine. It may be inspectable as lexical construction/provenance where useful, but it is not a generated-name artifact.

The materialized identity must make these distinctions directly available so Inspector does not infer provenance from string equality or current role names.

## Audition boundary

Generated components may provide sound-backed component audition when the rendered component is the exact sound-backed generated spelling represented by that generated result.

Lexical, derived, and literal material remain text-oriented unless a separate explicit sound/pronunciation contract is introduced.

A derivation such as an initial or future patronymic must not automatically inherit the source component's sound sequence merely because it is derived from that source.

Whole-identity and component audition presentation remains Fiction Cast-owned, consistent with the existing architecture. A lower phrase renderer may remain shared only if it is genuinely role-agnostic and consumes resolved phrase/text/sound evidence rather than Fiction Cast roles or structure names.

Pronunciation authority remains separately governed by #222.

## Locks and reroll

The existing member lock remains a **whole materialized-identity lock**.

- ordinary regeneration and seed changes preserve a valid locked member;
- changing a semantic setting that materially changes the member's generation configuration invalidates that member under the existing lock policy;
- changing identity structure invalidates the member because it changes the materialized identity contract.

#252 does not require component-level locks.

If component-level reroll or preservation is added later, the component model should make the semantics tractable:

- rerolling a generated component rematerializes that component;
- rerolling a lexical component makes a new deterministic lexical selection;
- rerolling a source component invalidates derived dependents;
- unrelated components may remain stable when the product explicitly promises targeted component reroll;
- literals do not reroll independently unless a structure itself changes.

Do not add those interactions until a concrete UX requires them.

## Primary-name compatibility

`FictionCastGeneratedName.primaryName` currently serves important generation, scoring, analysis, and presentation compatibility roles.

The richer component ontology must not redefine `primaryName` as the identity ontology itself. A generated identity may contain multiple independently generated components, and some visible structures may not directly render the underlying primary personal spelling.

The first migration may retain `primaryName` as the current ensemble/scoring anchor while making component provenance authoritative for identity composition. Any later replacement or renaming of that anchor should be justified separately.

## Relationship boundary

Identity-component dependencies are not a general entity relationship graph.

A derived component may retain a provenance dependency on another component or source value. That is enough to explain transformations such as initials or patronymics.

It does not imply that #252 should model:

- bosses and minions;
- dungeon membership;
- clans and faction membership;
- family trees;
- spatial containment;
- product-family graphs.

Those relationships may remain domain-specific, or a genuinely domain-agnostic relationship model may later emerge from repeated pressure. The identity-component model should not prejudge that decision.

## Cross-domain source boundary

The semantic identity role must remain separate from the domain/source that supplied candidate material.

A future personal-name workflow might intentionally consider astronomical, mythological, geographical, historical, or other declared source vocabularies while still materializing the selected value as a personal-name component.

Therefore:

```text
the thing being named
  != component semantic role
  != candidate/source domain
```

#252 does not introduce a cross-domain source registry or graph. It only avoids making Fiction Cast component roles synonymous with source taxonomy.

## Extensibility target: +1 without a plugin framework

The design target is **O(1)-ish conceptual integration, not zero-touch extensibility**.

Adding one supported component should normally require:

1. define/enable its Fiction Cast semantic role;
2. define how that component materializes as generated, lexical, or derived;
3. define provenance/idiom/audition semantics that differ from class defaults, if any;
4. add it to one or more curated identity structures;
5. add focused fixtures/tests.

It should **not** require bespoke rewrites of role-agnostic identity traversal, phrase rendering, Inspector provenance classification, audition classification, persistence traversal, and every existing structure merely because one component was added.

Conversely, do not create `registerIdentityComponent(...)`, arbitrary materializer callbacks, a plugin registry, or a universal grammar DSL merely to make a new role appear zero-touch.

TypeScript exhaustiveness is a feature here: a genuinely new semantic capability should make the compiler surface places where product semantics need an explicit decision.

The portability test remains:

> Can a narrower domain reuse any genuinely shared structural mechanics without dragging Fiction Cast's fantastical semantic vocabulary along with it?

Passing that test does not require extracting the shared mechanics during #252. It requires that the Fiction Cast design not make future extraction impossible or semantically dishonest.

## First implementation decomposition

The recommended bounded sequence after this design is accepted is:

### A. #255 — Migrate current identities onto explicit component provenance

Without adding new user-visible identity structures:

- introduce the Fiction Cast-owned generated / lexical / derived component contract;
- keep phrase literals explicit and separate;
- migrate all five current materialized structures;
- retain the underlying generated personal source for `initials-family`;
- stop assigning fake generated-name provenance to title/epithet lexical values;
- make Inspector/audition consume explicit materialization truth rather than infer it from role/string equality;
- keep `primaryName` as the current compatibility/scoring anchor;
- preserve existing Configure behavior;
- do not reorganize already-correct Fiction Cast orchestration merely for directory purity;
- add a curated `src/fictionCast/index.ts` only if the implementation produces a real public-boundary benefit.

This slice proves the ontology against production behavior before expanding it.

### B. #256 — Make component selection deterministically explicit

As a separate follow-up because it may deliberately change same-seed visible lexical choices:

- give lexical/component selections explicit deterministic component-instance seed namespaces;
- remove incidental lexical dependence on another component's spelling where no semantic dependency exists;
- retain enough structure/version material for remembered identities to preserve resolved meaning;
- document any intentional deterministic-contract migration.

Do not preserve accidental string-fingerprint coupling merely to keep old same-seed lexical output, but do not hide that behavior change inside the provenance migration either.

### C. #257 — Add the first richer generated structure: additional personal name

Prefer additional-personal naming as the first new structure because it exercises:

- repeated generated semantic component roles;
- multiple independently generated artifacts in one identity;
- component-instance addressability;
- phrase composition;
- deterministic per-component materialization;

without first requiring a new derivation language or relationship model.

Potential example:

```text
Daywoj Aven Bayr
```

The user-facing label may be `Middle name` only where that wording accurately describes the selected structure/idiom; the underlying role should remain the broader additional-personal concept.

### D. Add richer lexical/derivation families only after the component contract proves stable

Candidate later slices include:

- house/clan composition;
- patronymic/matronymic derivation;
- aliases/by-names;
- richer title/honorific constructions;
- locative derivation;
- dynastic/regnal forms.

Each should be introduced as a concrete user-facing structure set rather than as an ontology-completeness exercise.

## Acceptance tests for the model

The design is successful when all of these statements can be true without special-case provenance fiction:

1. `Daywoj Bayr` contains two independently generated name components.
2. `D. Bayr` still retains Daywoj as the generated source of `D.` and does not call the initial a generated name.
3. `D.` can remain semantically primary-personal while its initial form is expressed by derivation semantics rather than a separate universal `initial` role.
4. `Archivist Daywoj` identifies Archivist as a lexical selection rather than attributing it to Daywoj's generated-name evidence.
5. `Daywoj the Ashen of Morvane` distinguishes two generated components, one lexical component, and one literal phrase part.
6. two additional personal names can coexist without inventing two new complete format ontologies.
7. a future patronymic can retain derivation provenance without masquerading as an independent generated artifact.
8. a future narrower personal-name domain could reuse any proven structural mechanics without importing Fiction Cast roles such as epithet or fantasy house.
9. Product/Company/Place examples do not force changes to Fiction Cast semantic-role vocabulary merely to validate the component classes.
10. no hierarchy/graph framework is required to explain identity composition.
11. adding one new supported component does not require a universal plugin or grammar framework.
12. the design remains consistent with the existing singular `GeneratedName` boundary and surface-owned composition decisions.

## Resolved and remaining implementation decisions

The design pass resolves these points:

- Fiction Cast composition remains under the existing `src/fictionCast/` domain ownership;
- the materialized identity has three independently addressable component classes: generated, lexical, derived;
- literals/grammar are separate phrase material, not a fourth component class;
- representational forms such as an initial belong in derivation semantics rather than forcing a separate semantic role;
- deterministic lexical reseeding is a separate follow-up (#256), not hidden inside the provenance migration (#255);
- a curated `src/fictionCast/index.ts` is optional and should be introduced only if it clarifies a real public boundary.

The following implementation choices remain deliberately open for #255 / #256:

- whether generated components retain the complete `GeneratedName` object or a lossless/provenance-preserving reference/projection;
- the smallest structure-version field required for durable remembered casts;
- whether component-instance keys are persisted or remain deterministic implementation metadata;
- whether the first migration renames `format` to `structure` immediately or preserves compatibility terminology behind a Fiction Cast adapter;
- whether any existing phrase/traversal types can remain genuinely shared after Fiction Cast-specific role/format assumptions are removed.

None of these remaining choices changes the central ontology: semantic role and materialization class remain separate, phrase grammar remains separate from component inventory, singular generated-name evidence remains singular, and richer identity expansion should proceed through curated structures over explicit Fiction Cast provenance.
