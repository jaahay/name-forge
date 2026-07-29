# NameRequest v1 checkpoint

This checkpoint records the implemented `NameRequest -> NameResponse` state after the singular criteria-driven foundation and the first shared quantity/grouping slice.

## Implemented arc

```text
NameRequest / NameCriteria contract
  -> request resolver and parent-seed handling
  -> NameArtifact mapper
  -> singular-compatible request adapter
  -> criteria diagnostics bridge
  -> criteria-to-generator compiler
  -> internal candidate selection scoring
  -> bounded Configure criteria surface
  -> exact quantity and independent-set grouping
  -> deterministic child seeds and ordered artifacts
```

## Current v1 architecture

The implemented core operation is:

```text
NameRequest -> NameResponse
```

The stable input model is `NameCriteria`. The primary output unit is `NameArtifact`.

The current runtime path is:

```text
NameRequest
  -> resolve criteria, optional mode metadata, exact quantity, grouping, and parent seed
  -> diagnostics
  -> compile NameCriteria into current GenerationSettings
  -> derive one deterministic child seed per artifact index
  -> generate sound/silhouette/spelling candidates for each child
  -> internally select spelling candidates under compiled criteria
  -> map each GeneratedName to NameArtifact
  -> NameResponse with flat ordered artifacts and grouping metadata
```

`mode` is optional metadata. It may preserve product/UI context, but it must not drive generation, quantity, or grouping behavior.

`random.seed` is optional in the request and always emitted in the response. If omitted, the resolver creates a fresh parent seed and records the `name-forge-v1` algorithm.

## Quantity and grouping boundary

V1 supports:

- omitted quantity/grouping, resolving to exact quantity 1 and `independent-set`;
- explicit exact quantity from 1 through 100;
- one atomic grouped engine operation;
- flat ordered `NameArtifact[]` output;
- explicit grouping metadata containing quantity, parent seed, and ordered child seeds.

`grouping.childSeeds[index]` is the seed used to generate `names[index]`.

Index 0 uses the parent seed directly, preserving the previous singular deterministic stream. Later indexes use deterministic child-seed labels, so increasing quantity preserves the existing result prefix.

Artifact and silhouette identities use the ordered artifact index. Equal display values therefore remain distinct durable artifacts.

## Current criteria support boundary

The criteria compiler supports a small implemented subset of `NameCriteria` by translating criteria into current `GenerationSettings`.

Diagnostics report unsupported and partially implemented criteria honestly. Unsupported criteria should not fail ordinary generation by default; the adapter continues with neutral best-effort settings for every requested artifact.

Follow-up risk: supported-criteria knowledge is duplicated between `nameCriteriaCompiler.ts` and `nameCriteriaDiagnostics.ts`. Before expanding supported criteria targets, centralize supported-target metadata or introduce a shared helper such as `isCriteriaClauseCompiled(...)`.

## Internal candidate scoring boundary

Candidate selection scoring is internal machinery only.

It can influence which generated result or spelling candidate is selected. It must not leak into public response artifacts as a fit percentage, Criteria Match percentage, or polished public scoring UI.

## Active app surface boundary

Fiction Cast may keep Cast-facing concepts such as role mix, slot controls, cast health, and export language in its product UI.

Those concepts are not global grouping assumptions. The shared v1 request contract supports independent sets only; it does not provide cohesion optimization, role slots, locks, or ensemble scoring.

Game NPC may continue using the singular default. Mode metadata must not alter engine output when criteria, quantity, grouping, and seed are otherwise identical.

## Deferred after the first grouping slice

The following remain explicit non-goals:

- cohesion or diversity optimization;
- ranked alternatives for one naming problem;
- slotted generation and slot-level criteria;
- aggregate or per-slot diagnostics;
- partial-result recovery;
- per-artifact reroll or child replacement;
- public group-fit scoring;
- new active modes;
- LLM prompt-first UI;
- public Criteria Match UI or fit percentages.

## Current handoff

Future grouping work should begin from:

```text
docs/requirements/name-request-v1.md
docs/requirements/name-grouping-design-boundary.md
```

Despite its historical filename, the grouping boundary now records the accepted exact independent-set implementation and the semantics still deferred beyond it.
