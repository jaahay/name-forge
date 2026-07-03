import { describe, expect, it } from 'vitest';
import type { NameArtifact } from './nameArtifact';
import type { NameCriteria } from './nameCriteria';
import type { NameRequest, NameResponse } from './nameRequest';

describe('NameRequest v1 contracts', () => {
  it('represents a criteria-driven request with optional mode metadata', () => {
    const criteria: NameCriteria = {
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

    const request: NameRequest = {
      version: 1,
      criteria,
      mode: 'fiction-cast',
      random: { seed: 'slice-1-seed' },
    };

    expect(request.criteria.clauses).toHaveLength(1);
    expect(request.criteria.clauses[0]?.family).toBe('sound');
    expect(request.criteria.clauses[0]?.polarity).toBe('prefer');
    expect(request.mode).toBe('fiction-cast');
  });

  it('represents a resolved response with name artifacts and an emitted seed', () => {
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
      ],
    };

    expect(response.names).toHaveLength(1);
    expect(response.names[0]?.displayText).toBe('Aurel');
    expect(response.random.seed).toBe('resolved-seed');
    expect(response.request.random.seed).toBe('resolved-seed');
    expect(response.diagnostics?.[0]?.kind).toBe('unsupported-criteria');
  });
});
