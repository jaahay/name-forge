import { describe, expect, it } from 'vitest';
import { generateEnsemble } from './ensemble';
import { createCastExportPayload, serializeCastAsJson, serializeCastAsMarkdown } from './export';
import { createDefaultRegistry } from './registry';
import type { GenerationSettings } from './types';

const settings: GenerationSettings = {
  castSize: 4,
  novelty: 0.5,
  pronounceability: 0.7,
  memorability: 0.6,
  culturalAnchoring: 0.65,
  orthographicWeirdness: 0.25,
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
  it('creates a deterministic JSON payload with cast metadata, selected sound, and exportable names', () => {
    const ensemble = exportableEnsemble();
    const firstJson = serializeCastAsJson(ensemble);
    const secondJson = serializeCastAsJson(exportableEnsemble());
    const payload = JSON.parse(firstJson) as ReturnType<typeof createCastExportPayload>;

    expect(secondJson).toBe(firstJson);
    expect(payload.exportVersion).toBe('name-forge.cast.v1');
    expect(payload.generatedBy).toBe('Name Forge');
    expect(payload.seed).toBe(settings.seed);
    expect(payload.settings.seed).toBe(settings.seed);
    expect(payload.settings.roleInfluence).toBe('light');
    expect(payload.sourcePack.id).toBe(settings.stylePackId);
    expect(payload.names).toHaveLength(settings.castSize);

    const [firstName] = payload.names;
    const [sourceName] = ensemble.names;
    expect(firstName).toBeDefined();
    expect(sourceName).toBeDefined();
    if (!firstName || !sourceName) throw new Error('Expected at least one exported name.');
    expect(firstName.name).toBe(sourceName.name);
    expect(firstName.seed).toBe(settings.seed);
    expect(firstName.role).toBe('Protagonist');
    expect(firstName.roleInfluence?.level).toBe('light');
    expect(firstName.roleInfluence?.profileId).toBe('role-profile:protagonist');
    expect(firstName.score).toBe(sourceName.scores.overallFit);
    expect(firstName.scores.roleFit).toBe(sourceName.scores.roleFit);
    expect(firstName.sound.profileId).toBe(sourceName.soundProfile.id);
    expect(firstName.sound.candidateId).toBe(sourceName.sound.id);
    expect(firstName.sound.sequenceId).toBe(sourceName.sound.sequence.id);
    expect(firstName.sound.transcription).toBe(sourceName.sound.transcription);
    expect(firstName.sound.selectedSpelling.id).toBe(sourceName.spelling.id);
    expect(firstName.sound.selectedSpelling.text).toBe(sourceName.spelling.text);
    expect(firstName.sound.selectedSpelling.rank).toBe(1);
    expect(firstName.sound.selectedSpelling.soundCandidateId).toBe(sourceName.sound.id);
    expect(firstName.sound.selectedSpelling.sequenceId).toBe(sourceName.sound.sequence.id);
    expect(firstName.silhouette.syllableCount).toBeGreaterThan(0);
    expect(firstName.silhouette.rarityBand).toBeDefined();
    expect(firstName.parts.length).toBeGreaterThan(0);
    expect(firstName.warnings).toEqual([]);
  });

  it('renders a Markdown export with score, selected sound, silhouette, variants, role influence, and seed', () => {
    const markdown = serializeCastAsMarkdown(exportableEnsemble());

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
    expect(markdown).toContain('- Silhouette:');
    expect(markdown).toContain('- Variants:');
    expect(markdown).toContain('- Warnings: none');
  });
});
