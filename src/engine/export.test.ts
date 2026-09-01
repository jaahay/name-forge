import { describe, expect, it } from 'vitest';
import { generateEnsemble } from '../fictionCast/ensemble';
import { createCastExportPayload, serializeCastAsJson, serializeCastAsMarkdown } from '../fictionCast/export';
import type { FictionCastSettings } from '../fictionCast/types';
import { createDefaultRegistry } from './registry';

const settings: FictionCastSettings = {
  castSize: 4,
  semanticBaseline: {
    familiarity: 'balanced',
    readability: 'clear',
    compactness: 'compact',
    styleAnchoring: 'balanced',
    spellingDistinctiveness: 'conventional',
  },
  stylePackId: 'british-literary-fantasy',
  seed: 'export-test-seed',
  nameFormat: 'mixed',
  rolePreset: 'classic-ensemble',
  roleInfluence: 'light',
};

function exportableEnsemble() {
  return generateEnsemble(settings, createDefaultRegistry());
}

describe('cast export serialization', () => {
  it('creates a deterministic JSON payload with cast metadata, selected sound, spelling candidates, and exportable names', () => {
    const ensemble = exportableEnsemble();
    const firstJson = serializeCastAsJson(ensemble);
    const secondJson = serializeCastAsJson(exportableEnsemble());
    const payload = JSON.parse(firstJson) as ReturnType<typeof createCastExportPayload>;

    expect(secondJson).toBe(firstJson);
    expect(payload.generatedBy).toBe('Name Forge');
    expect(payload.seed).toBe(settings.seed);
    expect(payload.settings.seed).toBe(settings.seed);
    expect(payload.settings.roleInfluence).toBe('light');
    expect(payload.settings.novelty).toBe(0.48);
    expect(payload.settings.pronounceability).toBe(0.72);
    expect(payload.settings.memorability).toBe(0.65);
    expect(payload.settings.culturalAnchoring).toBe(0.62);
    expect(payload.settings.orthographicWeirdness).toBe(0.28);
    expect('semanticBaseline' in payload.settings).toBe(false);
    expect(payload.sourcePack.id).toBe(settings.stylePackId);
    expect(payload.names).toHaveLength(settings.castSize);

    const [firstName] = payload.names;
    const [sourceName] = ensemble.names;
    expect(firstName).toBeDefined();
    expect(sourceName).toBeDefined();
    if (!firstName || !sourceName) throw new Error('Expected at least one exported name.');
    const primaryName = sourceName.primaryName;
    expect(firstName.name).toBe(sourceName.displayName);
    expect(firstName.seed).toBe(settings.seed);
    expect(firstName.role).toBe('Protagonist');
    expect(firstName.roleInfluence?.level).toBe('light');
    expect(firstName.roleInfluence?.profileId).toBe('role-profile:protagonist');
    expect(firstName.score).toBe(sourceName.contextualScores.overallFit);
    expect(firstName.scores.overallFit).toBe(sourceName.contextualScores.overallFit);
    expect(firstName.scores.ensembleFit).toBe(sourceName.contextualScores.ensembleFit);
    expect(firstName.scores.roleFit).toBe(sourceName.contextualScores.roleFit);
    expect(firstName.scores.pronounceability).toBe(primaryName.scores.pronounceability);
    expect(firstName.sound.profile).toEqual(primaryName.soundProfile);
    expect(firstName.sound.transcription).toBe(primaryName.sound.transcription);
    expect(firstName.sound.selectedSpelling.text).toBe(primaryName.spelling.text);
    expect(firstName.sound.selectedSpelling.rank).toBe(1);
    expect(firstName.sound.selectedSpelling.score).toBe(primaryName.spelling.score);
    expect(firstName.sound.selectedSpelling.selected).toBe(true);
    expect(firstName.sound.spellingCandidates).toHaveLength(primaryName.spellingCandidates.length);
    expect(firstName.sound.spellingCandidates.map((candidate) => candidate.text)).toEqual(primaryName.spellingCandidates.map((candidate) => candidate.text));
    expect(firstName.sound.spellingCandidates.map((candidate) => candidate.rank)).toEqual(primaryName.spellingCandidates.map((candidate) => candidate.rank));
    expect(firstName.sound.spellingCandidates.filter((candidate) => candidate.selected)).toEqual([firstName.sound.selectedSpelling]);
    expect(firstName.generationPlan.syllableCount).toBe(primaryName.generationPlan.syllableCount);
    expect(firstName.generationPlan.rarityBand).toBe(sourceName.rarityBand);
    expect(firstName.parts.length).toBeGreaterThan(0);
    expect(firstName.warnings).toEqual([]);
  });

  it('renders a Markdown export with score, selected sound, spelling candidates, variants, role influence, and seed', () => {
    const ensemble = exportableEnsemble();
    const markdown = serializeCastAsMarkdown(ensemble);
    const [sourceName] = ensemble.names;
    expect(sourceName).toBeDefined();
    if (!sourceName) throw new Error('Expected at least one exported name.');
    const [selectedCandidate] = sourceName.primaryName.spellingCandidates;
    expect(selectedCandidate).toBeDefined();
    if (!selectedCandidate) throw new Error('Expected at least one retained spelling candidate.');

    expect(markdown).toContain('# Name Forge Cast Export');
    expect(markdown).toContain('Seed: `export-test-seed`');
    expect(markdown).toContain('Style pack: British literary fantasy');
    expect(markdown).toContain('Role influence: light');
    expect(markdown).toContain('## Ensemble balance');
    expect(markdown).toContain('## 1.');
    expect(markdown).toContain('- Role: Protagonist');
    expect(markdown).toContain('- Role influence: Protagonist clarity (light;');
    expect(markdown).toContain('- Overall fit:');
    expect(markdown).toContain('- Format:');
    expect(markdown).toContain('- Parts:');
    expect(markdown).toContain('- Sound: /');
    expect(markdown).toContain('- Selected spelling:');
    expect(markdown).toContain('- Spelling candidates:');
    expect(markdown).toContain(`${selectedCandidate.text} (selected; rank ${selectedCandidate.rank}, score ${selectedCandidate.score.toFixed(2)})`);
    expect(markdown).toContain('- Generation plan:');
    expect(markdown).toContain('- Variants:');
    expect(markdown).toContain('- Warnings: none');
  });
});
