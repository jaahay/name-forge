import { describe, expect, it } from 'vitest';
import type { NameArtifact } from './nameArtifact';
import type { NameCriteria, NameCriteriaFamily } from './nameCriteria';
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

function criteriaClause(id: string, family: NameCriteriaFamily, target: string): NameCriteria {
  return {
    clauses: [
      {
        id,
        family,
        polarity: 'prefer',
        target,
        strength: 1,
      },
    ],
  };
}

const emptyCriteria: NameCriteria = { clauses: [] };
const soundCriteria: NameCriteria = criteriaClause('prefer-soft-sound', 'sound', 'soft');
const crispSoundCriteria: NameCriteria = criteriaClause('prefer-crisp-sound', 'sound', 'crisp');
const flowingSoundCriteria: NameCriteria = criteriaClause('prefer-flowing-sound', 'sound', 'flowing');
const clippedSoundCriteria: NameCriteria = criteriaClause('prefer-clipped-sound', 'sound', 'clipped');
const plainSpellingCriteria: NameCriteria = criteriaClause('prefer-plain-spelling', 'spelling', 'plain');
const distinctiveSpellingCriteria: NameCriteria = criteriaClause('prefer-distinctive-spelling', 'spelling', 'distinctive');
const easyToSpellCriteria: NameCriteria = criteriaClause('prefer-easy-to-spell', 'practical', 'easy-to-spell');
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
const unsupportedCriteria: NameCriteria = criteriaClause('prefer-moonlit-meaning', 'semantic', 'moonlit');
const registerCriteria: NameCriteria = criteriaClause('prefer-formal-register', 'register', 'formal');
const blankIdCriteria: NameCriteria = {
  clauses: [
    {
      id: ' ',
      family: 'semantic',
      polarity: 'prefer',
      target: 'moonlit',
      strength: 0.7,
    },
  ],
};
const mixedDiagnosticCriteria: NameCriteria = {
  clauses: [
    ...clippedSoundCriteria.clauses,
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
    expect(artifact.spelling.text.length).toBeGreaterThan(0);
    expect(artifact.sound).toBeDefined();
    expect(artifact.spelling).toBeDefined();
    expect(spellingCandidates.length).toBeGreaterThan(0);
    expect('role' in artifact).toBe(false);
  });

  it('maps supported sound criteria into the current generation plan and sound profile texture', () => {
    const softArtifact = firstArtifact(generateNameResponse({
      version: 1,
      criteria: soundCriteria,
      random: { seed: 'sound-texture-seed' },
    }));
    const crispArtifact = firstArtifact(generateNameResponse({
      version: 1,
      criteria: crispSoundCriteria,
      random: { seed: 'sound-texture-seed' },
    }));
    const flowingArtifact = firstArtifact(generateNameResponse({
      version: 1,
      criteria: flowingSoundCriteria,
      random: { seed: 'sound-texture-seed' },
    }));

    expect(softArtifact.generationPlan.texture).toBe('soft');
    expect(softArtifact.soundProfile.targets.texture).toBe('soft');
    expect(crispArtifact.generationPlan.texture).toBe('hard');
    expect(crispArtifact.soundProfile.targets.texture).toBe('crisp');
    expect(flowingArtifact.generationPlan.texture).toBe('liquid');
    expect(flowingArtifact.soundProfile.targets.texture).toBe('fluid');
  });

  it('maps supported spelling criteria into current sound profile distinctiveness', () => {
    const plainArtifact = firstArtifact(generateNameResponse({
      version: 1,
      criteria: plainSpellingCriteria,
      random: { seed: 'spelling-profile-seed' },
    }));
    const distinctiveArtifact = firstArtifact(generateNameResponse({
      version: 1,
      criteria: distinctiveSpellingCriteria,
      random: { seed: 'spelling-profile-seed' },
    }));
    const easyToSpellArtifact = firstArtifact(generateNameResponse({
      version: 1,
      criteria: easyToSpellCriteria,
      random: { seed: 'spelling-profile-seed' },
    }));

    expect(requireValue(plainArtifact.soundProfile, 'plain sound profile').targets.distinctiveness).toBe(0.28);
    expect(requireValue(distinctiveArtifact.soundProfile, 'distinctive sound profile').targets.distinctiveness).toBe(0.72);
    expect(requireValue(easyToSpellArtifact.soundProfile, 'easy-to-spell sound profile').targets.distinctiveness).toBe(0.28);
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

  it('does not emit diagnostics for supported criteria', () => {
    const response = generateNameResponse({
      version: 1,
      criteria: {
        clauses: [
          ...supportedSingularCriteria.clauses,
          ...soundCriteria.clauses,
          ...plainSpellingCriteria.clauses,
          ...easyToSpellCriteria.clauses,
        ],
      },
      random: { seed: 'supported-criteria-seed' },
    });
    const diagnostics = responseDiagnostics(response);

    expect(diagnostics).toHaveLength(0);
  });

  it('emits partial diagnostics for diagnostic-only current-generator criteria', () => {
    const response = generateNameResponse({
      version: 1,
      criteria: clippedSoundCriteria,
      random: { seed: 'partial-diagnostic-seed' },
    });
    const diagnostics = responseDiagnostics(response);

    expect(diagnostics.map((diagnostic) => diagnostic.code)).toEqual([
      'criteria_partially_implemented',
      'fallback_used',
    ]);
    expect(diagnostics.some((diagnostic) => diagnostic.code === 'criteria_not_implemented')).toBe(false);
  });

  it('treats register criteria as unsupported until a real register mapping exists', () => {
    const response = generateNameResponse({
      version: 1,
      criteria: registerCriteria,
      random: { seed: 'register-unsupported-seed' },
    });
    const diagnostics = responseDiagnostics(response);

    expect(diagnostics.map((diagnostic) => diagnostic.code)).toEqual([
      'criteria_not_implemented',
      'fallback_used',
    ]);
    expect(diagnostics[0]).toMatchObject({
      id: 'criteria_not_implemented:prefer-formal-register',
      clauseIds: ['prefer-formal-register'],
    });
  });

  it('uses the same stable fallback clause id for diagnostic ids and clauseIds', () => {
    const response = generateNameResponse({
      version: 1,
      criteria: blankIdCriteria,
      random: { seed: 'blank-clause-id-seed' },
    });
    const diagnostics = responseDiagnostics(response);

    expect(diagnostics[0]).toMatchObject({
      id: 'criteria_not_implemented:semantic-1',
      clauseIds: ['semantic-1'],
    });
    expect(diagnostics[1]).toMatchObject({
      code: 'fallback_used',
      clauseIds: ['semantic-1'],
    });
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
    expect(firstArtifact(response).spelling.text.length).toBeGreaterThan(0);
  });
});
