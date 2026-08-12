# 0002 - Criteria-driven generation

## Status

Accepted for planning, refined by Decision 0006.

Decision 0006 clarifies that `NameCriteria` is the shared structured intent model where intent crosses the generic request boundary. It is not required to be the complete typed configuration vocabulary of every reusable semantic naming callback.

## Context

The product direction moved from broad generator knobs toward user-declared naming criteria. The criteria system must stay functional and bounded: it should guide shared generation and selection before it becomes a polished explanation surface.

The term `brief` should not be used for the shared input control model. In this product vocabulary, a brief is a concise downstream summary of work already configured or produced. The shared request input model is criteria.

Reusable semantic callbacks may additionally expose typed configuration specific to their domain when that configuration does not belong in a universal criteria vocabulary.

## Decision

The core shared request-intent model is `NameCriteria`.

`NameCriteria` contains declared criteria clauses. Criteria include what the user prefers, what the user wants to avoid, and what the user treats as a requirement. Fine-tuning controls that are genuinely shared across naming domains may remain criteria rather than requiring a separate foundational model.

```ts
type NameCriteria = {
  readonly clauses: readonly NameCriteriaClause[];
};

type NameCriteriaClause = {
  readonly id: string;
  readonly family:
    | "sound"
    | "shape"
    | "register"
    | "spelling"
    | "semantic"
    | "avoid"
    | "practical";
  readonly polarity: "prefer" | "avoid" | "require";
  readonly target: string;
  readonly strength: number;
};
```

Shared criteria compile into generation constraints, ranking inputs, spelling preferences, exclusion pressure, and practical constraints. Criteria are not free-form prose and do not require an LLM in v1.

Do not use this decision to force given-name-, place-name-, faction-name-, or other domain-specific typed configuration into `NameCriteria` merely to preserve one universal input schema. A semantic capability may translate its own typed configuration into lower-level style/mechanics concerns before delegating to the generic singular `generateName(...)` primitive.

## Relationship to naming capabilities

The accepted dependency direction is:

```text
surface UX
  -> shared NameCriteria and/or semantic typed configuration
  -> reusable semantic callback
  -> generic singular generateName(...)
  -> generic mechanics
```

A surface owns how the user expresses intent. `NameCriteria` remains useful where intent is shared and transportable; semantic configuration remains useful where meaning belongs to one reusable naming domain.

## Internal scoring

Internal candidate scoring belongs in the generation path once criteria become meaningful. The generator may produce a candidate pool, evaluate candidates against compiled shared criteria and other legitimate naming inputs, and select the best candidate for the result.

This internal scoring is functional: it affects which name is returned.

```text
shared criteria / semantic configuration
  -> resolved generation inputs
  -> candidate pool
  -> candidate scoring
  -> selected generated result
```

A public `CriteriaMatch` or `Style fit` surface is deferred. If it is added later, it should derive from the same functional scoring/evaluation layer rather than becoming separate explanatory theater.

## Fit language

Avoid public `0%` or `100%` fit claims. Naming fit is not an objective scientific percentage. A name may be a weak, partial, good, or strong match against declared criteria, but even the weakest candidate is not literally 0% and the best candidate is not literally 100%.

If a score is needed internally, call it a candidate score or selection score. Do not expose it as a precise fit percentage until the product has earned that meaning.

## Accepted but unimplemented criteria

The shared request boundary may accept criteria before every criterion is fully implemented. Unsupported or partially implemented criteria should be safe to include and may produce diagnostics.

Diagnostics should be best-effort notes, not a normal product failure mode.

Examples:

- `criteria_not_implemented`
- `criteria_partially_implemented`
- `fallback_used`

Generation should usually return the closest available candidate rather than fail because taste criteria collide or are only partly supported.

## Consequences

- `NameCriteria` remains the center of shared request intent, not the sole configuration model for every semantic callback.
- Shared fine tuning belongs inside criteria when it is genuinely cross-domain; semantic-specific configuration can remain typed inside the semantic capability.
- Internal candidate scoring is allowed and expected when it affects selection.
- Public criteria-match explanation is deferred.
- No prompt-first or LLM-driven compiler is required for v1.
- The product can accept practical constraints before all of them are enforced, as long as diagnostics stay honest.
