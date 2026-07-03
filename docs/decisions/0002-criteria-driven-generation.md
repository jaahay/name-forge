# 0002 - Criteria-driven generation

## Status

Accepted for planning.

## Context

The product direction is moving from broad generator knobs toward user-declared naming criteria. The criteria system must stay functional and bounded: it should guide generation and selection before it becomes a polished explanation surface.

The term `brief` should not be used for the input control model. In this product vocabulary, a brief is a concise downstream summary of work already configured or produced. The input model is criteria.

## Decision

The core input model is `NameCriteria`.

`NameCriteria` contains declared criteria clauses. Criteria include what the user prefers, what the user wants to avoid, and what the user treats as a requirement. Fine-tuning controls are criteria too; they should not require a separate foundational model unless the implementation earns it.

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

Criteria compile into generation constraints, ranking inputs, spelling preferences, exclusion pressure, practical constraints, and later grouping behavior. Criteria are not free-form prose and do not require an LLM in v1.

## Internal scoring

Internal candidate scoring belongs in the generation path once criteria become meaningful. The generator may produce a candidate pool, evaluate candidates against compiled criteria, and select the best candidate for the response.

This internal scoring is functional: it affects which name is returned.

```text
NameCriteria
  -> compiled criteria
  -> candidate pool
  -> candidate scoring
  -> selected NameArtifact
```

A public `CriteriaMatch` or `Style fit` surface is deferred. If it is added later, it should derive from the same functional scoring/evaluation layer rather than becoming separate explanatory theater.

## Fit language

Avoid public `0%` or `100%` fit claims. Naming fit is not an objective scientific percentage. A name may be a weak, partial, good, or strong match against declared criteria, but even the weakest candidate is not literally 0% and the best candidate is not literally 100%.

If a score is needed internally, call it a candidate score or selection score. Do not expose it as a precise fit percentage until the product has earned that meaning.

## Accepted but unimplemented criteria

The backend may accept criteria before every criterion is fully implemented. Unsupported or partially implemented criteria should be safe to include and may produce diagnostics.

Diagnostics should be best-effort notes, not a normal product failure mode.

Examples:

- `criteria_not_implemented`
- `criteria_partially_implemented`
- `fallback_used`

The generator should usually return the closest available candidate rather than fail because taste criteria collide or are only partly supported.

## Consequences

- User-declared criteria are the center of generation.
- Fine tuning belongs inside criteria unless a stronger reason emerges.
- Internal candidate scoring is allowed and expected when it affects selection.
- Public criteria-match explanation is deferred.
- No prompt-first or LLM-driven compiler is required for v1.
- The product can accept practical constraints before all of them are enforced, as long as diagnostics stay honest.
