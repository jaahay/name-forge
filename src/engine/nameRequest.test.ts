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

  it('represents a resolved response with name artifacts, an emitted seed, and criteria diagnostics', () => {
    const artifact: NameArtifact = {
      id: 'name-artifact-1',
      displayText: 'Aurel',
    };

    const response: NameResponse = {
      version: 1,
      request: {
        version: 1,
        criteria: { clauses: [] },
        random: {
          seed: 'resolved-seed',
          algorithm: 'name-forge-v1',
        },
      },
      names: [artifact],
      random: {
        seed: 'resolved-seed',
        algorithm: 'name-forge-v1',
      },
      diagnostics: [
        {
          id: 'unsupported-clause',
          kind: 'unsupported-criteria',
          severity: 'warning',
          message: 'Criteria diagnostics can identify unsupported clauses when behavior lands later.',
          clauseIds: ['future-clause'],
        },
        {
          id: 'partial-clause',
          kind: 'partially-implemented-criteria',
          severity: 'info',
          message: 'Criteria diagnostics can identify partially implemented clauses when behavior lands later.',
          clauseIds: ['partial-clause'],
        },
      ],
    };

    expect(response.names).toHaveLength(1);

    const firstArtifact = requireValue(response.names[0], 'first name artifact');
    expect(firstArtifact).toBe(artifact);
    expect(firstArtifact.displayText).toBe('Aurel');
    expect(response.random.seed).toBe('resolved-seed');
    expect(response.request.random.seed).toBe('resolved-seed');

    const diagnostics = requireValue(response.diagnostics, 'diagnostics');
    expect(diagnostics).toHaveLength(2);

    const unsupportedDiagnostic = requireValue(diagnostics[0], 'unsupported diagnostic');
    expect(unsupportedDiagnostic.kind).toBe('unsupported-criteria');

    const partialDiagnostic = requireValue(diagnostics[1], 'partially implemented diagnostic');
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
