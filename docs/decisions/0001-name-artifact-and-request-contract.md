# 0001 - NameArtifact and NameRequest contract

## Status

Accepted.

Decisions 0005 and 0006 define the sound/style boundary and the semantic naming hierarchy used by this contract.

## Context

Name Forge supports both singular generated names and product surfaces that compose several values into a larger identity.

Those are different result shapes:

- a singular generated name has one selected spelling with one coherent sound/spelling/generation evidence bundle;
- a composed product identity may contain several independently generated names plus lexical, derived, initial, or literal material.

The shared durable contract should describe the evidence that is genuinely common across product surfaces without absorbing each surface's composition grammar or lifecycle state.

The shared request layer also needs a reusable operation for criteria-driven singular generation and independent quantities.

## Decision

### NameArtifact represents one generated name

`NameArtifact` is the durable shared projection of one singular `GeneratedName`.

Conceptually:

```ts
type NameArtifact = {
  readonly id: string;
  readonly soundProfile: SoundProfile;
  readonly sound: SoundCandidate;
  readonly spelling: RankedSpellingCandidate;
  readonly spellingCandidates: readonly RankedSpellingCandidate[];
  readonly generationPlan: NameGenerationPlan;
  readonly variants: readonly NameVariant[];
  readonly readabilityDiagnostics: readonly ReadabilityDiagnostic[];
};
```

The generated text is `spelling.text`. The artifact contains no duplicate display-text field.

`toNameArtifact(...)` projects the intrinsic generated evidence from `GeneratedName` into this durable form.

### Product composition stays with the product result

A product surface may combine generated names with other generated components, lexical values, derived values, initials, and literals.

The surface result owns that composition. Each generated component retains the generation evidence that belongs to it.

For Fiction Cast, `FictionCastGeneratedName` owns the composed identity while `primaryName` remains an unchanged singular `GeneratedName`.

### NameRequest is shared singular-generation infrastructure

The shared request operation is:

```text
NameRequest -> NameResponse
```

It owns shared criteria, seed resolution, exact independent quantity, deterministic child seeds, diagnostics, and ordered `NameArtifact` results.

The current grouping operation is:

```text
one parent request
  -> deterministic child seeds
  -> independent generateName(...) calls
  -> ordered NameArtifact[]
```

Semantic callbacks such as `generateGivenName(...)`, `generateFamilyName(...)`, and `generatePlaceName(...)` sit above the same singular `generateName(...)` primitive and provide domain-specific caller boundaries.

Surface-specific aggregate generation sits above those semantic capabilities when the surface owns cross-name semantics.

### History follows result ownership

The shared browser history stores singular `NameArtifact` records for singular-name workflows.

A surface that owns a richer result owns the corresponding history shape. Fiction Cast therefore keeps composed Cast history separate from shared singular artifact history.

Generation functions return results. The owning surface decides whether and how those results are persisted.

### Analysis may use surface projections

Shared artifact analysis consumes singular `NameArtifact` evidence.

A composed surface may project one generated component into that analysis while preserving its own surface result addressability. Such a projection is an adapter for shared analysis or presentation; it is not another generation or persistence contract.

## Consequences

- `GeneratedName` and `NameArtifact` describe one singular generated name.
- Product surfaces own composition and composed-result lifecycle concerns.
- `NameArtifact.spelling.text` is the durable generated text.
- `NameArtifact.generationPlan` carries the generated plan evidence.
- Shared request/grouping infrastructure remains useful for independent singular generation.
- Semantic naming callbacks and surface aggregate operations can evolve independently of the shared transport contract.
- Shared analysis can be reused by surfaces through narrow singular-evidence projections.
- Fiction Cast history can preserve the complete Fiction Cast result without expanding `NameArtifact`.