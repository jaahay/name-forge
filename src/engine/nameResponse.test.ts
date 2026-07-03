import { describe, expect, it } from 'vitest';
import type { NameArtifact } from './nameArtifact';
import type { NameCriteria } from './nameCriteria';
import type { NameDiagnostic, NameRequest } from './nameRequest';
import { generateNameResponse } from './nameResponse';

function requireValue<T>(value: T | undefined, label: string): T {
  if (value === undefined) {
    throw new Error(`Expected ${label}.`);
  }

  return value;
}

function firstArtifact(response: ReturnType<typeof generateNameResponse>): NameArtifact {
  return requireValue(response.names[0], 'first response artifact');
}

function responseDiagnostics(response: ReturnType<typeof generateNameResponse>): readonly NameDiagnostic[] {
  return response.diagnostics ?? [];
}

const emptyCriteria: NameCriteria = { clauses: [] };
const soundCriteria: NameCriteria = {
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
const supportedSingularCriteria: NameCriteria = {
  clauses: [
    {
      id: 'require-single-name',
      family: 'practical',
      polarity: 'require',
      target: 'single-name',
      strength: 1,
    },
  ],
};
const unsupportedCriteria: NameCriteria = {
  clauses: [
    {
      id: 'prefer-moonlit-meaning',
      family: 'semantic',
      polarity: 'prefer',
      target: 'moonlit',
      strength: 0.7,
    },
  ],
};
const mixedDiagnosticCriteria: NameCriteria = {
  clauses: [
    ...soundCriteria.clauses,
    ...unsupportedCriteria.clauses,
  ],
};

describe('generateNameResponse', () => {
  it('returns the same artifact for the same request and seed', () => {
    const request: NameRequest = {
      version: 1,
      criteria: soundCriteria,
      random: { seed: 'slice-4-fixed-seed' },
    };

    const firstResponse = generateNameResponse(request);
    const secondResponse = generateNameResponse(request);

    expect(firstArtifact(firstResponse)).toEqual(firstArtifact(secondResponse));
    expect(firstResponse.random.seed).toBe('slice-4-fixed-seed');
    expect(firstResponse.request.random.seed).toBe('slice-4-fixed-seed');
  });

  it('emits an omitted seed that can reproduce the run', () => {
    const firstResponse = generateNameResponse({
      version: 1,
      criteria: emptyCriteria,
    });
    const replayResponse = generateNameResponse({
      version: 1,
      criteria: emptyCriteria,
      random: { seed: firstResponse.random.seed },
    });

    expect(firstResponse.random.seed).toMatch(/^name-forge-/);
    expect(firstResponse.request.random.seed).toBe(firstResponse.random.seed);
    expect(firstArtifact(firstResponse)).toEqual(firstArtifact(replayResponse));
  });

  it('does not let mode alter generation output', () => {
    const fictionResponse = generateNameResponse({
      version: 1,
      criteria: soundCriteria,
      mode: 'fiction-cast',
      random: { seed: 'mode-neutral-seed' },
    });
    const productResponse = generateNameResponse({
      version: 1,
      criteria: soundCriteria,
      mode: 'product',
      random: { seed: 'mode-neutral-seed' },
    });

    expect(fictionResponse.request.mode).toBe('fiction-cast');
    expect(productResponse.request.mode).toBe('product');
    expect(firstArtifact(fictionResponse)).toEqual(firstArtifact(productResponse));
  });

  it('returns exactly one artifact with selected-name metadata', () => {
    const response = generateNameResponse({
      version: 1,
      criteria: emptyCriteria,
      random: { seed: 'single-artifact-seed' },
    });
    const artifact = firstArtifact(response);
    const spellingCandidates = requireValue(artifact.spellingCandidates, 'spelling candidates');

    expect(response.version).toBe(1);
    expect(response.names).toHaveLength(1);
    expect(response.random.seed).toBe('single-artifact-seed');
    expect(artifact.displayText.length).toBeGreaterThan(0);
    expect(artifact.sound).toBeDefined();
    expect(artifact.spelling).toBeDefined();
    expect(spellingCandidates.length).toBeGreaterThan(0);
    expect(artifact.role).toBeUndefined();
  });

  it('emits diagnostics for unsupported criteria', () => {
    const response = generateNameResponse({
      version: 1,
      criteria: unsupportedCriteria,
      random: { seed: 'unsupported-diagnostic-seed' },
    });
    const diagnostics = responseDiagnostics(response);

    expect(diagnostics.map((diagnostic) => diagnostic.code)).toEqual([
      'criteria_not_implemented',
      'fallback_used',
    ]);
    expect(diagnostics[0]).toMatchObject({
      id: 'criteria_not_implemented:prefer-moonlit-meaning',
      kind: 'unsupported-criteria',
      severity: 'warning',
      clauseIds: ['prefer-moonlit-meaning'],
    });
  });

  it('does not emit unsupported diagnostics for supported singular criteria', () => {
    const response = generateNameResponse({
      version: 1,
      criteria: supportedSingularCriteria,
      random: { seed: 'supported-singular-seed' },
    });
    const diagnostics = responseDiagnostics(response);

    expect(diagnostics).toHaveLength(0);
  });

  it('emits partial diagnostics for diagnostic-only current-generator criteria', () => {
    const response = generateNameResponse({
      version: 1,
      criteria: soundCriteria,
      random: { seed: 'partial-diagnostic-seed' },
    });
    const diagnostics = responseDiagnostics(response);

    expect(diagnostics.map((diagnostic) => diagnostic.code)).toEqual([
      'criteria_partially_implemented',
      'fallback_used',
    ]);
    expect(diagnostics.some((diagnostic) => diagnostic.code === 'criteria_not_implemented')).toBe(false);
  });

  it('emits stable diagnostics for the same request', () => {
    const request: NameRequest = {
      version: 1,
      criteria: mixedDiagnosticCriteria,
      random: { seed: 'stable-diagnostics-seed' },
    };

    const firstResponse = generateNameResponse(request);
    const secondResponse = generateNameResponse(request);

    expect(responseDiagnostics(firstResponse)).toEqual(responseDiagnostics(secondResponse));
  });

  it('still returns one artifact when unsupported criteria are present', () => {
    const response = generateNameResponse({
      version: 1,
      criteria: unsupportedCriteria,
      random: { seed: 'unsupported-best-effort-seed' },
    });

    expect(response.names).toHaveLength(1);
    expect(firstArtifact(response).displayText.length).toBeGreaterThan(0);
  });
});
