# Sound Proximity Diagnostics v1

## Purpose

This contract defines deterministic structural evidence for comparing modeled sounds across a supplied `NameArtifact[]`. It does not estimate human confusion, similarity, quality, cohesion, memorability, or fit.

## Canonical data

Each `NameArtifactSoundRelationship` is a discriminated union.

- `kind` selects the relationship variant.
- `artifactIds` and `displayTexts` identify the compared pair.
- `details` is the canonical machine-readable evidence.
- `evidence` is derived explanatory text for logs, inspection, and initial presentation.

Consumers must use `kind` and `details` for logic. They must not parse `evidence` to recover segments, edit operations, cadence, stress, or other structure. Product copy may be generated separately from the typed record.

## Segment vocabulary

Segment-bearing details use `SoundSegmentId`, the current engine's closed starter-inventory vocabulary. This is intentional for v1 because every modeled `SegmentSequence` uses that inventory.

Supporting provider-defined or dynamically registered segment identifiers requires a separately designed segment-registry contract. This v1 diagnostic contract does not imply that extension.

## Pair and relationship ordering

The analyzer walks the supplied array in deterministic index order:

1. `(0, 1)`, `(0, 2)`, and subsequent pairs for index `0`;
2. then pairs for index `1`;
3. continuing until every unordered pair has been considered once.

For a non-identical pair, independent evidence is emitted in this fixed order when present:

1. `one-segment-edit`;
2. `shared-onset`;
3. `shared-final-syllable` or `shared-coda`;
4. `matching-cadence-pattern`.

## Precedence and suppression

The contract favors the most specific evidence where weaker evidence would be redundant.

- `identical-sound` suppresses all other sound relationships for that artifact pair.
- `shared-final-syllable` suppresses `shared-coda` for that artifact pair.
- Other independent relationship kinds may coexist in the fixed order above.

These are output-contract rules, not scores or rankings of user-perceived importance.

## Provenance boundary

`analyzeNameArtifactSoundRelationships` compares artifacts exactly as supplied. It does not infer or validate that they came from the same request, response, roster, mode, or generation operation.

A caller presenting results as same-roster evidence must pass artifacts from one grouped `NameResponse` operation and retain that provenance outside this pure helper.

## Presentation and scale

The analyzer returns all applicable pairwise facts. It does not group, prioritize, truncate, paginate, or summarize results for a user interface.

Any future UI may collapse redundant presentation, group by artifact pair, impose display limits, or prioritize evidence kinds. Those choices are presentation policy and must not change the deterministic engine evidence returned for the same input.

## Non-goals

- no scalar similarity or confusion score;
- no human-perception claim;
- no rejection, reranking, regeneration, or optimization;
- no mode-specific diagnostic contract;
- no provider-defined segment registry;
- no UI presentation policy.
