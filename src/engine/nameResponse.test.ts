import { describe, expect, it } from 'vitest';
import type { NameArtifact } from './nameArtifact';
import type { NameCriteria } from './nameCriteria';
import type { NameRequest } from './nameRequest';
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
});
