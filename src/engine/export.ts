import type { GeneratedEnsemble, GeneratedName, NameSilhouette, ProvenanceNote } from './types';

export interface ExportedNamePart {
  role: string;
  value: string;
  sourceName: string;
}

export interface ExportedName {
  id: string;
  name: string;
  role?: string;
  score: number;
  scores: GeneratedName['scores'];
  silhouette: Pick<NameSilhouette, 'syllableCount' | 'stressPattern' | 'rhythm' | 'rarityBand' | 'texture' | 'targetNovelty' | 'targetLength'>;
  format: string;
  parts: ExportedNamePart[];
  variants: Array<{ value: string; kind: string; ruleId: string; sourceId: string }>;
  provenance: string[];
  seed: string;
  warnings: string[];
}

export interface CastExportPayload {
  exportVersion: 'name-forge.cast.v1';
  generatedBy: 'Name Forge';
  seed: string;
  settings: GeneratedEnsemble['settings'];
  sourcePack: GeneratedEnsemble['sourcePack'];
  diagnostics: GeneratedEnsemble['diagnostics'];
  names: ExportedName[];
}

function uniqueProvenanceLabels(entries: ProvenanceNote[]): string[] {
  const labels = new Set<string>();
  for (const entry of entries) {
    labels.add(`${entry.label} (${entry.sourceId})`);
  }
  return [...labels];
}

function silhouetteSummary(silhouette: NameSilhouette): string {
  return `${silhouette.syllableCount} syllable ${silhouette.texture} ${silhouette.rarityBand} name with ${silhouette.rhythm} rhythm`;
}

function scoreLabel(value: number): string {
  return value.toFixed(2);
}

function exportName(name: GeneratedName, seed: string): ExportedName {
  const identity = name.identity;
  return {
    id: name.id,
    name: name.name,
    role: name.role?.label,
    score: name.scores.overallFit,
    scores: name.scores,
    silhouette: {
      syllableCount: name.silhouette.syllableCount,
      stressPattern: name.silhouette.stressPattern,
      rhythm: name.silhouette.rhythm,
      rarityBand: name.silhouette.rarityBand,
      texture: name.silhouette.texture,
      targetNovelty: name.silhouette.targetNovelty,
      targetLength: name.silhouette.targetLength,
    },
    format: identity?.format.label ?? name.silhouette.rhythm,
    parts: identity?.parts.map((part) => ({
      role: part.role,
      value: part.value,
      sourceName: part.sourceName,
    })) ?? [],
    variants: name.variants.map((variant) => ({
      value: variant.value,
      kind: variant.kind,
      ruleId: variant.ruleId,
      sourceId: variant.provenance.sourceId,
    })),
    provenance: uniqueProvenanceLabels(name.provenance),
    seed,
    warnings: [],
  };
}

export function createCastExportPayload(ensemble: GeneratedEnsemble): CastExportPayload {
  return {
    exportVersion: 'name-forge.cast.v1',
    generatedBy: 'Name Forge',
    seed: ensemble.settings.seed,
    settings: ensemble.settings,
    sourcePack: ensemble.sourcePack,
    diagnostics: ensemble.diagnostics,
    names: ensemble.names.map((name) => exportName(name, ensemble.settings.seed)),
  };
}

export function serializeCastAsJson(ensemble: GeneratedEnsemble): string {
  return `${JSON.stringify(createCastExportPayload(ensemble), null, 2)}\n`;
}

export function serializeCastAsMarkdown(ensemble: GeneratedEnsemble): string {
  const lines = [
    '# Name Forge Cast Export',
    '',
    `Seed: \`${ensemble.settings.seed}\``,
    `Style pack: ${ensemble.sourcePack.label}`,
    `Cast size: ${ensemble.names.length}`,
    '',
    '## Ensemble balance',
    '',
    ensemble.diagnostics.summary,
    '',
  ];

  ensemble.names.forEach((name, index) => {
    const exported = exportName(name, ensemble.settings.seed);
    const variantText = exported.variants.length > 0
      ? exported.variants.map((variant) => `${variant.value} (${variant.kind}, ${variant.sourceId})`).join(', ')
      : 'None';
    const partText = exported.parts.length > 0
      ? exported.parts.map((part) => `${part.role}: ${part.value}`).join('; ')
      : 'Single generated name';
    const provenanceText = exported.provenance.length > 0 ? exported.provenance.join('; ') : 'None';

    lines.push(
      `## ${index + 1}. ${exported.name}`,
      '',
      `- Role: ${exported.role ?? 'Unassigned'}`,
      `- Overall fit: ${scoreLabel(exported.score)}`,
      `- Format: ${exported.format}`,
      `- Parts: ${partText}`,
      `- Silhouette: ${silhouetteSummary(name.silhouette)}`,
      `- Variants: ${variantText}`,
      `- Provenance: ${provenanceText}`,
      '- Warnings: none',
      '',
    );
  });

  return `${lines.join('\n').trimEnd()}\n`;
}
