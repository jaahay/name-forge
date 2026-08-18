# Decision 0006: Naming capabilities and surface composition boundary

## Status

Accepted.

## Context

Name Forge supports several product surfaces and several semantic kinds of names. The architecture needs reuse at the level where meaning is genuinely shared while preserving surface-specific composition and workflow behavior.

The shared sound-backed mechanics already produce one singular lexical name. Product surfaces may need more specific semantic capabilities—given names, family names, place names—or aggregate operations that coordinate several generated and lexical values.

These layers have different ownership.

## Decision

### One singular lexical-name primitive

All sound-backed lexical-name synthesis converges on:

```text
generateName(...)
```

`generateName(...)` owns one-name orchestration across planning, style compilation, sound generation, spelling generation/selection, scoring, variants, and readability diagnostics.

It returns one `GeneratedName`.

### Semantic `-Name` capabilities carry reusable domain meaning

Current semantic capabilities are:

```text
generateGivenName(...)
generateFamilyName(...)
generatePlaceName(...)
```

Each capability exposes typed semantic preferences and delegates lexical-name synthesis to `generateName(...)`.

The dependency is:

```text
semantic naming capability
  -> generateName(...)
  -> generic mechanics
```

A semantic capability earns its API identity from stable domain meaning. Distinct lower sound mechanics are optional; family and place callbacks may currently delegate behavior-equivalently while still providing meaningful typed caller boundaries.

Additional semantic name kinds can follow this pattern when supported by a product surface.

### Product surfaces compose semantic capabilities

A product surface owns the user workflow and converts surface settings into calls to the semantic capabilities it uses.

```text
surface UX + surface state
  -> semantic naming capability/capabilities
  -> generateName(...)
  -> GeneratedName values
  -> surface result
```

Surface-owned concerns include:

- defaults, presets, and controls;
- composition grammar;
- aggregate coordination;
- contextual evaluation;
- selection and locks;
- history and persistence;
- export;
- presentation and navigation.

### Fiction Cast owns its aggregate result

Fiction Cast coordinates several naming capabilities and surface-owned lexical values into composed character identities.

Its current aggregate generation path is:

```text
FictionCastSettings
  -> generateEnsemble(...)
  -> generateGivenName / generateFamilyName / generatePlaceName
  -> FictionCastGeneratedEnsemble
```

The resulting `FictionCastGeneratedName` owns the composed identity and contains an unchanged `primaryName: GeneratedName` plus generation evidence for generated supporting parts.

Roles, rarity, contextual scoring, identity grammar, whole-identity audition, selection, and reroll remain Fiction Cast concepts.

Fiction Cast history belongs at this same surface boundary. Generation returns a Fiction Cast result; a history implementation can retain that result or a surface-specific history record.

### Shared request infrastructure serves independent singular generation

`NameRequest -> NameResponse` provides shared criteria-driven request infrastructure for singular generation and exact independent sets.

It owns:

- shared criteria;
- seed resolution;
- exact quantity;
- deterministic child seeds;
- ordered singular `NameArtifact` results;
- request diagnostics.

This request path and surface-specific aggregate generation are complementary. Surfaces use the abstraction that matches the result they own.

### Criteria and semantic preferences have different scopes

`NameCriteria` represents structured intent that crosses the generic request boundary.

Semantic callbacks may additionally expose typed preferences meaningful to their domain. A surface can derive either or both from its UX.

### Finite lexical values use deterministic selection

Some identity values come from bounded vocabularies rather than sound-backed generation.

The reusable direction is:

```text
NamingLexicon / LexicalInventory
  -> semantic selector
  -> deterministic selectFromOptions(...)
```

Semantic selectors own the meaning of their option set. Inventories own the concrete values and declared source/scope. The generic selector owns deterministic finite choice.

Derived values such as patronymics may use dedicated derivation mechanics where appropriate.

### Composition uses concrete values

A surface may compose generated names, selected lexical values, derived values, initials, and literals directly according to its domain grammar.

Reuse comes from concrete semantic capabilities and shared mechanics rather than a universal heterogeneous part abstraction.

## Dependency model

Generated lexical names:

```text
PRODUCT SURFACE
        |
        v
SEMANTIC NAMING CAPABILITY
 given / family / place / ...
        |
        v
generateName(...)
        |
        v
STYLE + SOUND + SPELLING MECHANICS
```

Finite lexical values:

```text
TYPED LEXICAL INVENTORY
        |
        v
SEMANTIC SELECTOR
        |
        v
DETERMINISTIC FINITE CHOICE
```

Surface result:

```text
generated names
+ selected lexical values
+ derived values
+ literals
        |
        v
surface-owned composition and lifecycle
```

## Consequences

- one generic singular generator remains the mechanics foundation;
- given, family, and place have reusable semantic API boundaries;
- new product surfaces can reuse semantic capabilities without sharing their aggregate workflow;
- Fiction Cast can evolve its cast generation, identity grammar, history, scoring, and presentation as one product surface;
- shared independent-set generation remains useful for independent singular-name workflows;
- lexical inventories and deterministic selection can evolve alongside sound-backed name generation;
- generic one-name scores remain intrinsic while product surfaces own contextual evaluation;
- `NameGenerationPlan` remains generation evidence produced within `generateName(...)` and exposed as `generationPlan` on the singular result.