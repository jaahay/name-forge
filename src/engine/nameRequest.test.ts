import { describe, expect, it } from 'vitest';
import type { NameArtifact } from './nameArtifact';
import type { NameCriteria } from './nameCriteria';
import { resolveNameRequest } from './nameRequest';
import type { NameRequest, NameRequestInput, NameRequestResolution, NameResponse } from './nameRequest';

function requireValue<T>(value: T | undefined, label: string): T {
  if (value === undefined) {
    throw new Error(`Expected ${label}.`);
  }

  return value;
}

function generationDrivingFields(resolution: NameRequestResolution) {
  return {
    criteria: resolution.request.criteria,
    quantity: resolution.request.quantity,
    grouping: resolution.request.grouping,
    random: resolution.request.random,
  };
}

const softSoundCriteria: NameCriteria = {
  clauses: [
    {
      id: 'prefer-soft-sound',
      family: 'sound',
      polarity: 'prefer',
      target: 'soft',
      strength: 0.8,
    },
  ],
};

describe('NameRequest v1 contracts', () => {
  it('represents a criteria-driven request with optional mode metadata', () => {
    const request: NameRequest = {
      version: 1,
      criteria: softSoundCriteria,
      mode: 'fiction-cast',
      random: { seed: 'slice-1-seed' },
    };

    expect(request.criteria.clauses).toHaveLength(1);

    const clause = requireValue(request.criteria.clauses[0], 'first criteria clause');
    expect(clause.family).toBe('sound');
    expect(clause.polarity).toBe('prefer');
    expect(request.mode).toBe('fiction-cast');
  });

  it('represents a resolved response with grouping, name artifacts, an emitted seed, and criteria diagnostics', () => {
    const spelling = {
      contract: 'SpellingCandidate' as const,
      version: 1 as const,
      text: 'Aurel',
      mappings: [],
      rank: 1,
      score: 1,
    };
    const artifact: NameArtifact = {
      id: 'name-artifact-1',
      displayText: 'Aurel',
      soundProfile: {
        targets: {
          length: 'short',
          syllableCount: { min: 1, max: 1, preferred: 1 },
          texture: 'balanced',
          distinctiveness: 0.5,
          cadences: ['balanced'],
        },
        phonotactics: {
          preferredSyllableShapes: ['CV'],
          onsetWeight: 0.7,
          codaWeight: 0.4,
          liquidWeight: 0.3,
          glideWeight: 0.2,
          clusterTolerance: 0.2,
        },
      },
      sound: {
        contract: 'SoundCandidate',
        version: 1,
        cadence: 'balanced',
        sequence: {
          contract: 'SegmentSequence',
          version: 1,
          segments: ['m', 'a'],
          syllables: [{
            start: 0,
            end: 2,
            onset: [0],
            nucleus: [1],
            coda: [],
            shape: 'CV',
            weight: 'light',
            sonorityProfile: 'rising',
            stress: 'primary',
            stressSource: 'sequence',
          }],
        },
        transcription: '/ma/',
      },
      spelling,
      spellingCandidates: [spelling],
      silhouette: {
        id: 'silhouette-name-artifact-1',
        syllableCount: 1,
        stressPattern: 'primary',
        rhythm: 'balanced',
        shape: ['CV'],
        texture: 'balanced',
        targetNovelty: 0.5,
        targetLength: 'short',
      },
      variants: [],
      readabilityDiagnostics: [],
    };

    const response: NameResponse = {
      version: 1,
      request: {
        version: 1,
        criteria: { clauses: [] },
        quantity: { kind: 'exact', value: 1 },
        grouping: { kind: 'independent-set' },
        random: {
          seed: 'resolved-seed',
          algorithm: 'name-forge-v1',
        },
      },
      names: [artifact],
      grouping: {
        kind: 'independent-set',
        quantity: 1,
        parentSeed: 'resolved-seed',
        childSeeds: ['resolved-seed'],
      },
      random: {
        seed: 'resolved-seed',
        algorithm: 'name-forge-v1',
      },
      diagnostics: [
        {
          id: 'unsupported-clause',
          code: 'criteria_not_implemented',
          kind: 'unsupported-criteria',
          severity: 'warning',
          message: 'Criteria diagnostics can identify unsupported clauses when behavior lands later.',
          clauseIds: ['future-clause'],
        },
        {
          id: 'partial-clause',
          code: 'criteria_partially_implemented',
          kind: 'partially-implemented-criteria',
          severity: 'warning',
          message: 'Criteria diagnostics can identify partially implemented clauses when behavior lands later.',
          clauseIds: ['partial-clause'],
        },
      ],
    };

    expect(response.names).toHaveLength(1);
    expect(response.grouping.childSeeds[0]).toBe('resolved-seed');

    const firstArtifact = requireValue(response.names[0], 'first name artifact');
    expect(firstArtifact).toBe(artifact);
    expect(firstArtifact.displayText).toBe('Aurel');
    expect(response.random.seed).toBe('resolved-seed');
    expect(response.request.random.seed).toBe('resolved-seed');

    const diagnostics = requireValue(response.diagnostics, 'diagnostics');
    expect(diagnostics).toHaveLength(2);

    const unsupportedDiagnostic = requireValue(diagnostics[0], 'unsupported diagnostic');
    expect(unsupportedDiagnostic.code).toBe('criteria_not_implemented');
    expect(unsupportedDiagnostic.kind).toBe('unsupported-criteria');

    const partialDiagnostic = requireValue(diagnostics[1], 'partially implemented diagnostic');
    expect(partialDiagnostic.code).toBe('criteria_partially_implemented');
    expect(partialDiagnostic.kind).toBe('partially-implemented-criteria');
  });
});

describe('resolveNameRequest', () => {
  it('preserves a supplied seed deterministically', () => {
    const firstResolution = resolveNameRequest({
      version: 1,
      criteria: softSoundCriteria,
      random: { seed: 'supplied-seed' },
    });
    const secondResolution = resolveNameRequest({
      version: 1,
      criteria: softSoundCriteria,
      random: { seed: 'supplied-seed' },
    });

    expect(firstResolution).toEqual(secondResolution);
    expect(firstResolution.random.seed).toBe('supplied-seed');
    expect(firstResolution.random.algorithm).toBe('name-forge-v1');
    expect(firstResolution.request.random).toEqual(firstResolution.random);
    expect(firstResolution.request.quantity).toEqual({ kind: 'exact', value: 1 });
    expect(firstResolution.request.grouping).toEqual({ kind: 'independent-set' });
  });

  it('fills an omitted seed and exposes it on the resolved request and random result', () => {
    const resolution = resolveNameRequest({
      version: 1,
      criteria: { clauses: [] },
    });

    expect(resolution.random.seed).toMatch(/^name-forge-/);
    expect(resolution.random.algorithm).toBe('name-forge-v1');
    expect(resolution.request.random.seed).toBe(resolution.random.seed);
    expect(resolution.request.random.algorithm).toBe(resolution.random.algorithm);
  });

  it('preserves mode as metadata while keeping generation-driving fields mode-free', () => {
    const fictionResolution = resolveNameRequest({
      version: 1,
      criteria: softSoundCriteria,
      mode: 'fiction-cast',
      random: { seed: 'same-seed' },
    });
    const productResolution = resolveNameRequest({
      version: 1,
      criteria: softSoundCriteria,
      mode: 'product',
      random: { seed: 'same-seed' },
    });

    expect(fictionResolution.request.mode).toBe('fiction-cast');
    expect(productResolution.request.mode).toBe('product');
    expect(generationDrivingFields(fictionResolution)).toEqual(generationDrivingFields(productResolution));
  });

  it('normalizes empty or missing criteria to an empty criteria contract', () => {
    const emptyCriteriaResolution = resolveNameRequest({
      version: 1,
      criteria: { clauses: [] },
      random: { seed: 'empty-criteria-seed' },
    });
    const missingCriteriaInput: NameRequestInput = {
      version: 1,
      random: { seed: 'missing-criteria-seed' },
    };
    const missingCriteriaResolution = resolveNameRequest(missingCriteriaInput);

    expect(emptyCriteriaResolution.request.criteria).toEqual({ clauses: [] });
    expect(missingCriteriaResolution.request.criteria).toEqual({ clauses: [] });
  });
});
