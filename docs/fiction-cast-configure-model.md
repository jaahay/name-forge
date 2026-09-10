# Fiction Cast Configure causal model

## Status

Resolved reference index for #233 under the broader Fiction Cast requirements parent #212.

This file is no longer a working specification. The former version mixed historical diagnosis, proposed terminology, and open implementation choices that have since been decided in bounded issues and merged pull requests. Those superseded sections have been removed so this document points to the records that now own the product and architecture truth.

## Resolved decisions and evidence

| Concern | Current decision | Evidence |
| --- | --- | --- |
| Surface-owned semantic intent | Fiction Cast owns semantic product intent and resolves it through one explicit boundary into lower generation mechanics. Visible product controls are not generic engine score fields. | #235; [PR #238](https://github.com/jaahay/name-forge/pull/238) |
| Stable baseline + Cast variation | Familiar is the cast baseline; Cast variation controls deterministic spread around it. The old independent rarity-distribution generation policy and fixed novelty cycle were removed. Cast size 1 naturally receives zero variation. | #239; [PR #240](https://github.com/jaahay/name-forge/pull/240) |
| Roles, shaping, overrides, and locks | Roles have one coherent Configure home. Assignment and Generation influence are distinct; per-slot overrides are sparse deviations; role guidance is user-facing; seed changes alone do not invalidate locks, while causal intent changes do. | #247; [PR #253](https://github.com/jaahay/name-forge/pull/253) |
| Mixed identity structures | Mixed is seed-driven and rerollable rather than a fixed slot-index cycle. Explicit formats remain fixed, and remembered materialized identities remain stable. | #248; [PR #251](https://github.com/jaahay/name-forge/pull/251) |
| Identity-component model | Generated, lexical, derived, and literal material have explicit Fiction Cast-owned semantics and provenance. Curated structures compose those components without turning the product into a universal grammar or checkbox matrix. | #252; [design PR #254](https://github.com/jaahay/name-forge/pull/254); #257; [PR #262](https://github.com/jaahay/name-forge/pull/262) |
| Deterministic materialization and selection | Component materialization uses explicit deterministic context. Fiction Cast no longer runs the old 16-candidate hidden `overallFit` tournament; one resolved slot intent materializes one deterministic identity. Diagnostics remain descriptive evidence. | #256; [PR #260](https://github.com/jaahay/name-forge/pull/260) |
| Naming idiom | The product term is **Naming idiom**. Selecting an idiom activates its bounded causal tendencies while other declared controls remain authoritative. The former `Style adherence` / `Loose · Balanced · Faithful` axis was removed and has no replacement strength scalar. | [ADR 0007](decisions/0007-naming-idioms-and-composition.md); #249; [PR #263](https://github.com/jaahay/name-forge/pull/263) |
| Contextual guidance | Guidance follows three tiers: self-explanatory UI, selective contextual disclosure, and deeper operational Help. Naming idiom, Cast variation, and Generation seed have the initial local disclosures; Roles retain their dedicated guide. | [ADR 0008](decisions/0008-contextual-help-and-help-surface.md); #250; [PR #264](https://github.com/jaahay/name-forge/pull/264) |

## Current durable principles

### Configure expresses declared intent

Visible controls describe user intent. Contextual shaping composes downstream rather than silently rewriting other displayed controls.

### Generation realizes intent; evidence explains the result

Generation should realize the resolved request directly. Diagnostics may describe concrete outcomes, collisions, relationships, provenance, or generation context, but they do not silently choose a different identity through an undeclared quality objective.

### Naming idiom is bounded

A Naming idiom contributes characteristic naming tendencies where supported. It is not the complete generation request, does not imply cultural authenticity, and does not own unrelated controls such as Familiar, Readable, Compact, Spelling, Cast variation, Roles, identity structure, or seed.

Generated-name mechanics remain generic. Fiction Cast may own finite lexical material used to compose visible identities.

### Identity structures remain curated

Current visible identity structures are a bounded product vocabulary, not the permanent ontology. Richer structures should be added as explicit user-facing compositions over the component model rather than by exposing arbitrary component permutations.

### One identity is still Fiction Cast

Cast size 1 does not switch product surfaces. Ensemble-only spread naturally becomes inert where appropriate; the remaining declared controls keep their ordinary meaning.

### Explanation is selective

Explain opacity where it exists; do not make explanation itself the interface. ADR 0008 owns the current guidance policy.

## Historical terminology that is no longer current

Do not revive these former #233 assumptions as current requirements:

- `Naming style` as the Fiction Cast product term;
- a visible `Style adherence`, `Idiom influence`, or `Idiom strength` scalar;
- `Loose · Balanced · Faithful`;
- `Cast variety` / independent rarity-distribution generation semantics;
- scattered `Cast role mix`, Role influence, and slot-override controls;
- fixed slot-index Mixed-format cycling;
- hidden ensemble candidate selection by aggregate `overallFit`.

The linked decisions and merged PRs above supersede those formulations.

## Work that remains separate from #233

These are not unfinished #233 requirements and should stay independently scoped:

- #245 — wide-screen Fiction Cast workspace layout and active-name navigation;
- #246 — compact long Alternative Spellings lists;
- #222 — pronunciation authority and production TTS boundary;
- #152 — validated human-facing name metrics research;
- #221 — repository-wide stale-test and obsolete-contract audit.

#233 should be treated as a resolved parent requirements record, not as an active source of new Configure semantics.
