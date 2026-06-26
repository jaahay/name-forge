import type { GeneratedEnsemble, GeneratedName, NameSilhouette, NameVariant, ReadabilityDiagnostic, RoleInfluenceMetadata } from './types';

export interface ExportedNamePart { role: string; value: string; sourceName: string; }
export interface ExportedRoleInfluence { level: RoleInfluenceMetadata['level']; profileId: string; label: string; effects: string[]; }
export interface ExportedReadabilityDiagnostic { id: string; severity: ReadabilityDiagnostic['severity']; label: string; detail: string; }
export interface ExportedNameVariant { value: string; kind: NameVariant['kind']; relationship: NameVariant['relationship']; confidence: NameVariant['confidence']; generated: boolean; ruleId: string; sourceId: string; sourceKind: NameVariant['source']['kind']; sourceLabel: string; locale?: string; }
export interface ExportedName { id: string; name: string; role?: string; roleInfluence?: ExportedRoleInfluence; readabilityDiagnostics: ExportedReadabilityDiagnostic[]; score: number; scores: GeneratedName['scores']; silhouette: Pick<NameSilhouette, 'syllableCount' | 'stressPattern' | 'rhythm' | 'rarityBand' | 'texture' | 'targetNovelty' | 'targetLength'>; format: string; parts: ExportedNamePart[]; variants: ExportedNameVariant[]; seed: string; warnings: string[]; }
export interface CastExportPayload { exportVersion: 'name-forge.cast.v1'; generatedBy: 'Name Forge'; seed: string; settings: GeneratedEnsemble['settings']; sourcePack: GeneratedEnsemble['sourcePack']; diagnostics: GeneratedEnsemble['diagnostics']; names: ExportedName[]; }

function exportRoleInfluence(influence: RoleInfluenceMetadata | undefined): ExportedRoleInfluence | undefined { return influence ? { level: influence.level, profileId: influence.profileId, label: influence.label, effects: influence.effects } : undefined; }
function exportReadabilityDiagnostics(diagnostics: ReadabilityDiagnostic[]): ExportedReadabilityDiagnostic[] { return diagnostics.map((diagnostic) => ({ id: diagnostic.id, severity: diagnostic.severity, label: diagnostic.label, detail: diagnostic.detail })); }
function exportVariants(variants: NameVariant[]): ExportedNameVariant[] { return variants.map((variant) => ({ value: variant.value, kind: variant.kind, relationship: variant.relationship, confidence: variant.confidence, generated: variant.generated, ruleId: variant.ruleId, sourceId: variant.source.id, sourceKind: variant.source.kind, sourceLabel: variant.source.label, locale: variant.locale })); }
function diagnosticText(diagnostics: ExportedReadabilityDiagnostic[]): string { return diagnostics.length === 0 ? 'None' : diagnostics.map((diagnostic) => diagnostic.label + ': ' + diagnostic.detail).join('; '); }
function relationshipLabel(relationship: ExportedNameVariant['relationship']): string { return relationship.replace(/_/g, ' '); }
function variantText(variants: ExportedNameVariant[]): string { return variants.length === 0 ? 'None' : variants.map((variant) => variant.value + ' (' + relationshipLabel(variant.relationship) + ', ' + variant.confidence + ' confidence, ' + (variant.generated ? 'generated' : 'listed') + ', ' + variant.sourceId + ')').join(', '); }
function silhouetteSummary(silhouette: NameSilhouette): string { return silhouette.syllableCount + ' syllable ' + silhouette.texture + ' ' + silhouette.rarityBand + ' name with ' + silhouette.rhythm + ' rhythm'; }

function exportName(name: GeneratedName, seed: string): ExportedName {
  const identity = name.identity;
  return {
    id: name.id,
    name: name.name,
    role: name.role?.label,
    roleInfluence: exportRoleInfluence(name.roleInfluence),
    readabilityDiagnostics: exportReadabilityDiagnostics(name.readabilityDiagnostics),
    score: name.scores.overallFit,
    scores: name.scores,
    silhouette: { syllableCount: name.silhouette.syllableCount, stressPattern: name.silhouette.stressPattern, rhythm: name.silhouette.rhythm, rarityBand: name.silhouette.rarityBand, texture: name.silhouette.texture, targetNovelty: name.silhouette.targetNovelty, targetLength: name.silhouette.targetLength },
    format: identity?.format.label ?? name.silhouette.rhythm,
    parts: identity?.parts.map((part) => ({ role: part.role, value: part.value, sourceName: part.sourceName })) ?? [],
    variants: exportVariants(name.variants),
    seed,
    warnings: name.readabilityDiagnostics.filter((diagnostic) => diagnostic.severity === 'warning').map((diagnostic) => diagnostic.label),
  };
}

export function createCastExportPayload(ensemble: GeneratedEnsemble): CastExportPayload {
  return { exportVersion: 'name-forge.cast.v1', generatedBy: 'Name Forge', seed: ensemble.settings.seed, settings: ensemble.settings, sourcePack: ensemble.sourcePack, diagnostics: ensemble.diagnostics, names: ensemble.names.map((name) => exportName(name, ensemble.settings.seed)) };
}

export function serializeCastAsJson(ensemble: GeneratedEnsemble): string { return JSON.stringify(createCastExportPayload(ensemble), null, 2) + '\n'; }

export function serializeCastAsMarkdown(ensemble: GeneratedEnsemble): string {
  const lines = ['# Name Forge Cast Export', '', 'Seed: `' + ensemble.settings.seed + '`', 'Style pack: ' + ensemble.sourcePack.label, 'Cast size: ' + ensemble.names.length, 'Role influence: ' + (ensemble.settings.roleInfluence ?? 'off'), '', '## Ensemble balance', '', ensemble.diagnostics.summary, ensemble.diagnostics.readabilitySummary, ''];
  ensemble.names.forEach((name, index) => {
    const exported = exportName(name, ensemble.settings.seed);
    const partText = exported.parts.length > 0 ? exported.parts.map((part) => part.role + ': ' + part.value).join('; ') : 'Single generated name';
    const roleInfluenceText = exported.roleInfluence ? exported.roleInfluence.label + ' (' + exported.roleInfluence.level + '; ' + exported.roleInfluence.effects.join(', ') + ')' : 'Off';
    lines.push('## ' + (index + 1) + '. ' + exported.name, '', '- Role: ' + (exported.role ?? 'Unassigned'), '- Role influence: ' + roleInfluenceText, '- Overall fit: ' + exported.score.toFixed(2), '- Format: ' + exported.format, '- Parts: ' + partText, '- Silhouette: ' + silhouetteSummary(name.silhouette), '- Readability notes: ' + diagnosticText(exported.readabilityDiagnostics), '- Variants: ' + variantText(exported.variants), '- Warnings: ' + (exported.warnings.length > 0 ? exported.warnings.join(', ') : 'none'), '');
  });
  return lines.join('\n').trimEnd() + '\n';
}
