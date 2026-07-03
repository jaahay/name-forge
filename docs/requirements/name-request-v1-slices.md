# NameRequest v1 implementation slices

## Purpose

This document turns the NameRequest v1 requirements into a concrete implementation sequence.

It should be read after [`name-request-v1.md`](name-request-v1.md). The goal is to keep each future PR small, reviewable, and tied to the criteria-driven request contract.

## Sequencing principle

Build the contract from the outside inward:

```text
Types
  -> request resolution
  -> response mapping
  -> generator adapter
  -> criteria bridge
  -> criteria-driven selection
  -> UI criteria controls
```

Do not start with plural generation, grouping, Cast refactors, or chip-library UI. Those are downstream of the singular request contract.

## Slice 1 - Contract model types

### Goal

Introduce the planning types with no runtime behavior change.

### Scope

Add types for:

- `NameRequest`
- `ResolvedNameRequest`
- `NameResponse`
- `NameArtifact`
- `NameCriteria`
- `NameCriteriaClause`
- `RandomizationRequest`
- `RandomizationResult`
- `NameDiagnostic`

### Suggested location

Likely options:

- `src/engine/nameRequest.ts`
- `src/engine/nameCriteria.ts`
- `src/engine/nameArtifact.ts`

The exact split should follow implementation ergonomics, but the types should not be placed in UI modules.

### Acceptance criteria

- Types compile.
- `criteria` is explicit and structured.
- `mode` is optional metadata.
- No `CastRequest`, `ProductNameRequest`, `NpcRequest`, or mode-specific API types are added.
- No behavior changes.

### Non-goals

- No generator adapter.
- No criteria compilation.
- No UI change.
- No grouping implementation.

## Slice 2 - Request resolver and seed handling

### Goal

Resolve a raw `NameRequest` into a deterministic `ResolvedNameRequest`.

### Scope

- Resolve missing `random.seed`.
- Preserve supplied seed.
- Preserve optional `mode` metadata.
- Normalize missing or empty criteria.
- Attach `RandomizationResult` metadata.

### Acceptance criteria

- Same request with same seed resolves identically.
- Request without seed receives a resolved seed.
- Response-facing random metadata always includes a seed.
- Two requests differing only by `mode` resolve to equivalent generation inputs.

### Tests

Use positive deterministic assertions:

- provided seed is preserved
- omitted seed is filled
- `mode` is present in resolved metadata but not in generation-driving fields

## Slice 3 - NameArtifact mapper

### Goal

Map the current selected-name model into the future `NameArtifact` noun without flattening it to plain text.

### Scope

- Map current `GeneratedName` display text.
- Preserve current sound metadata.
- Preserve selected spelling metadata.
- Preserve ranked spelling alternatives where available.
- Preserve diagnostics or warnings where already available.
- Keep Cast role/ensemble metadata out of the universal artifact core unless represented as optional context.

### Acceptance criteria

- A mapped artifact includes display text.
- Sound and spelling metadata survive the mapping.
- Cast-specific metadata is not required for all artifacts.
- Existing Inspect/export needs are not weakened by the mapping.

### Non-goals

- No new Criteria Match UI.
- No fit percentage.
- No new scoring model.

## Slice 4 - Singular NameRequest adapter

### Goal

Create the first `NameRequest -> NameResponse` behavior by adapting the current generator path.

### Scope

- Accept `NameRequest`.
- Resolve request and seed.
- Bridge criteria into the current generation path with minimal behavior change.
- Generate/select one current name.
- Map it to `NameArtifact`.
- Return `NameResponse` with `names.length === 1`.

### Acceptance criteria

- Same request plus same seed produces the same response artifact.
- Omitted seed is emitted and can reproduce the run.
- `mode` does not alter output when criteria and seed are unchanged.
- Response contains exactly one name artifact.

### Non-goals

- No plural count support.
- No grouping.
- No Cast ensemble behavior through this API.

## Slice 5 - Criteria diagnostics bridge

### Goal

Make accepted-but-unimplemented criteria explicit without blocking generation.

### Scope

- Identify which criteria families or targets are supported by the adapter.
- Emit diagnostics for unsupported or partially implemented criteria.
- Keep generation best-effort.

### Acceptance criteria

- Unsupported criteria do not crash ordinary requests.
- Diagnostics identify unsupported or partially supported criteria.
- Supported criteria are not mislabeled as unsupported.
- Diagnostics are deterministic for the same request.

### Non-goals

- No public criteria match score.
- No request failure for ordinary taste conflicts.

## Slice 6 - Criteria-to-current-compiler mapping

### Goal

Start making `NameCriteria` functionally affect generation beyond diagnostics.

### Scope

Map a small, high-value subset of criteria to the existing compiler/generator path.

Candidate first criteria:

- sound: `soft`, `crisp`, `flowing`, `clipped`
- practical: `easy-to-say`, `easy-to-spell`
- spelling: `plain`, `distinctive`
- avoid: a small deterministic fragment list, if the current generator path can enforce or penalize it safely

### Acceptance criteria

- Chosen criteria produce deterministic, observable generation differences.
- Tests assert exact positive behavior for deterministic fixtures.
- Unsupported criteria still produce diagnostics rather than pretending to work.

### Non-goals

- No large chip taxonomy.
- No LLM.
- No cultural/language authenticity claims.
- No public fit percentage.

## Slice 7 - Internal candidate scoring boundary

### Goal

Introduce or clarify where functional candidate scoring belongs when criteria need selection pressure.

### Scope

- Evaluate generated candidates against compiled criteria.
- Use score to select the returned artifact.
- Keep score internal or debug-facing.
- Preserve ranked spelling candidate behavior.

### Acceptance criteria

- Scoring affects selection where implemented.
- Score components are deterministic.
- Score is not exposed as a public fit percentage.
- Tests assert selected output for deterministic candidate pools.

### Non-goals

- No polished Criteria Match UI.
- No 0%/100% fit language.

## Slice 8 - Configure criteria surface exploration

### Goal

Begin aligning the UI with criteria without building the full drawer/chip system.

### Scope

- Reframe current Configure controls around criteria language where practical.
- Keep existing Fiction cast workflow intact.
- Introduce a small selected-criteria or run-summary concept only if it reduces ambiguity.
- Defer large chip libraries and drawers unless the generator can already honor the criteria.

### Acceptance criteria

- UI still supports current Fiction cast generation.
- Criteria language does not imply free-form prompt input.
- Controls remain bounded and understandable.
- No LLM surface appears.

### Non-goals

- No full chip library.
- No hundreds-of-chips drawer.
- No new mode implementation.

## Slice 9 - Grouping design spike only

### Goal

Prepare for future Cast/ensemble extraction without implementing it.

### Scope

- Document how current `GeneratedEnsemble` behavior could map to future `NameGrouping`.
- Identify which current Cast-specific concepts are UI-only and which are engine invariants.
- Identify possible `NameSetCriteria` fields from existing ensemble behavior.

### Acceptance criteria

- No runtime behavior change.
- No public API grouping support yet.
- The spike identifies a concrete future implementation path.

## Explicitly deferred beyond these slices

- Plural `quantity` behavior.
- `grouping` behavior.
- Slotted set generation.
- New active modes.
- LLM-assisted criteria filling.
- Public Criteria Match UI.
- Fit percentages.
- Domain/trademark/availability checks.
- Baby-name mode.

## Suggested issue decomposition

Each slice can become one canonical issue. Avoid creating implementation issues that mix:

- type contracts with UI changes
- request resolution with criteria scoring
- singular request work with grouping
- criteria UI with LLM parsing
- Cast extraction with NameRequest v1

The first issue should probably be:

> Add NameRequest v1 model contracts

The second issue should probably be:

> Resolve NameRequest seeds and mode metadata

The third issue should probably be:

> Map GeneratedName to NameArtifact

That sequence keeps the product architecture executable without skipping ahead to the more speculative surfaces.
