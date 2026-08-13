import type { SoundProfile } from '../engine/soundProfile';
import type { GeneratedEnsemble, GeneratedName, NameGenerationPlan, NameVariant, ReadabilityDiagnostic, RoleInfluenceMetadata } from '../engine/types';
import { requireFictionCastGeneratedName } from './types';

export interface ExportedNamePart { role: string; value: string; sourceName: string; }
export interface ExportedRoleInfluence { level: RoleInfluenceMetadata['level']; profileId: string; label: string; effects: string[]; }
export interface ExportedReadabilityDiagnostic { id: string; severity: ReadabilityDiagnostic['severity']; label: string; detail: string; }
export interface ExportedNameVariant { value: string; kind: NameVariant['kind']; relationship: NameVariant['relationship']; confidence: NameVariant['confidence']; generated: boolean; ruleId: string; sourceId: string; sourceKind: NameVariant['source']['kind']; sourceLabel: string; locale?: string; }
export interface ExportedSpellingCandidate { text: string; rank: number; score: number; selected: boolean; }
export interface ExportedSelectedSpelling extends ExportedSpellingCandidate { selected: true; }
export interface ExportedSound { profile: SoundProfile; transcription: string; selectedSpelling: ExportedSelectedSpelling; spellingCandidates: ExportedSpellingCandidate[]; }
export type ExportedNameScores = Omit<GeneratedName['scores'], 'overallFit'> & { ensembleFit: number; roleFit: number; overallFit: number; };
export interface ExportedName { id: string; name: string; role?: string; roleInfluence?: ExportedRoleInfluence; readabilityDiagnostics: ExportedReadabilityDiagnostic[]; score: number; scores: ExportedNameScores; sound: ExportedSound; silhouette: Pick<NameGenerationPlan, 'syllableCount' | 'stressPattern' | 'rhythm' | 'rarityBand' | 'texture' | 'targetNovelty' | 'targetLength'>; format: string; parts: ExportedNamePart[]; variants: ExportedNameVariant[]; seed: string; warnings: string[]; }
export interface CastExportPayload { exportVersion: 'name-forge.cast.v2'; generatedBy: 'Name Forge'; seed: string; settings: GeneratedEnsemble['settings']; sourcePack: GeneratedEnsemble['sourcePack']; diagnostics: GeneratedEnsemble['diagnostics']; names: ExportedName[]; }

type RetainedSpellingCandidate = GeneratedName['spellingCandidates'][number];

function exportRoleInfluence(influence: RoleInfluenceMetadata | undefined): ExportedRoleInfluence | undefined { return influence ? { level: influence.level, profileId: influence.profileId, label: influence.label, effects: influence.effects } : undefined; }
function exportReadabilityDiagnostics(diagnostics: ReadabilityDiagnostic[]): ExportedReadabilityDiagnostic[] { return diagnostics.map((diagnostic) => ({ id: diagnostic.id, severity: diagnostic.severity, label: diagnostic.label, detail: diagnostic.detail })); }
function exportVariants(variants: NameVariant[]): ExportedNameVariant[] { return variants.map((variant) => ({ value: variant.value, kind: variant.kind, relationship: variant.relationship, confidence: variant.confidence, generated: variant.generated, ruleId: variant.ruleId, sourceId: variant.source.id, sourceKind: variant.source.kind, sourceLabel: variant.source.label, locale: variant.locale })); }
function exportSpellingCandidate(candidate: RetainedSpellingCandidate, selectedSpelling: RetainedSpellingCandidate): ExportedSpellingCandidate { return { text: candidate.text, rank: candidate.rank, score: candidate.score, selected: candidate === selectedSpelling }; }
function exportSound(name: GeneratedName): ExportedSound {
  const spellingCandidates = name.spellingCandidates.map((candidate) => exportSpellingCandidate(candidate, name.spelling));
  const selectedSpelling = exportSpellingCandidate(name.spelling, name.spelling);
  return { profile: name.soundProfile, transcription: name.sound.transcription, selectedSpelling: { ...selectedSpelling, selected: true }, spellingCandidates };
}
function diagnosticText(diagnostics: ExportedReadabilityDiagnostic[]): string { return diagnostics.length === 0 ? 'None' : diagnostics.map((diagnostic) => diagnostic.label + ': ' + diagnostic.detail).join('; '); }
function relationshipLabel(relationship: ExportedNameVariant['relationship']): string { return relationship.replace(/_/g, ' '); }
function variantText(variants: ExportedNameVariant[]): string { return variants.length === 0 ? 'None' : variants.map((variant) => variant.value + ' (' + relationshipLabel(variant.relationship) + ', ' + variant.confidence + ' confidence, ' + (variant.generated ? 'generated' : 'listed') + ', ' + variant.sourceId + ')').join(', '); }
function spellingCandidateText(candidates: ExportedSpellingCandidate[]): string { return candidates.length === 0 ? 'None' : candidates.map((candidate) => candidate.text + ' (' + (candidate.selected ? 'selected; ' : '') + 'rank ' + candidate.rank + ', score ' + candidate.score.toFixed(2) + ')').join(', '); }
function silhouetteSummary(silhouette: NameGenerationPlan): string { return silhouette.syllableCount + ' syllable ' + silhouette.texture + ' ' + silhouette.rarityBand + ' name with ' + silhouette.rhythm + ' rhythm'; }
function soundProfileSummary(profile: SoundProfile): string { return `${profile.targets.length}, ${profile.targets.texture}, distinctiveness ${profile.targets.distinctiveness.toFixed(2)}`; }

function exportName(name: GeneratedName, seed: string): ExportedName {
  const identity = name.identity;
  const contextualScores = requireFictionCastGeneratedName(name).contextualScores;
  const scores: ExportedNameScores = {
    ...name.scores,
    ensembleFit: contextualScores.ensembleFit,
    roleFit: contextualScores.roleFit,
    overallFit: contextualScores.overallFit,
  };
  return {
    id: name.id,
    name: name.name,
    role: name.role?.label,
    roleInfluence: exportRoleInfluence(name.roleInfluence),
    readabilityDiagnostics: exportReadabilityDiagnostics(name.readabilityDiagnostics),
    score: contextualScores.overallFit,
    scores,
    sound: exportSound(name),
    silhouette: { syllableCount: name.silhouette.syllableCount, stressPattern: name.silhouette.stressPattern, rhythm: name.silhouette.rhythm, rarityBand: name.silhouette.rarityBand, texture: name.silhouette.texture, targetNovelty: name.silhouette.targetNovelty, targetLength: name.silhouette.targetLength },
    format: identity?.format.label ?? name.silhouette.rhythm,
    parts: identity?.parts.map((part) => ({ role: part.role, value: part.value, sourceName: part.sourceName })) ?? [],
    variants: exportVariants(name.variants),
    seed,
    warnings: name.readabilityDiagnostics.filter((diagnostic) => diagnostic.severity === 'warning').map((diagnostic) => diagnostic.label),
  };
}

export function createCastExportPayload(ensemble: GeneratedEnsemble): CastExportPayload {
  return { exportVersion: 'name-forge.cast.v2', generatedBy: 'Name Forge', seed: ensemble.settings.seed, settings: ensemble.settings, sourcePack: ensemble.sourcePack, diagnostics: ensemble.diagnostics, names: ensemble.names.map((name) => exportName(name, ensemble.settings.seed)) };
}

export function serializeCastAsJson(ensemble: GeneratedEnsemble): string { return JSON.stringify(createCastExportPayload(ensemble), null, 2) + '\n'; }

export function serializeCastAsMarkdown(ensemble: GeneratedEnsemble): string {
  const lines = ['# Name Forge Cast Export', '', 'Seed: `' + ensemble.settings.seed + '`', 'Style pack: ' + ensemble.sourcePack.label, 'Cast size: ' + ensemble.names.length, 'Role influence: ' + (ensemble.settings.roleInfluence ?? 'off'), '', '## Ensemble balance', '', ensemble.diagnostics.summary, ensemble.diagnostics.readabilitySummary, ''];
  ensemble.names.forEach((name, index) => {
    const exported = exportName(name, ensemble.settings.seed);
    const partText = exported.parts.length > 0 ? exported.parts.map((part) => part.role + ': ' + part.value).join('; ') : 'Single generated name';
    const roleInfluenceText = exported.roleInfluence ? exported.roleInfluence.label + ' (' + exported.roleInfluence.level + '; ' + exported.roleInfluence.effects.join(', ') + ')' : 'Off';
    lines.push('## ' + (index + 1) + '. ' + exported.name, '', '- Role: ' + (exported.role ?? 'Unassigned'), '- Role influence: ' + roleInfluenceText, '- Overall fit: ' + exported.score.toFixed(2), '- Format: ' + exported.format, '- Parts: ' + partText, '- Sound: ' + exported.sound.transcription + ' (' + soundProfileSummary(exported.sound.profile) + ')', '- Selected spelling: ' + exported.sound.selectedSpelling.text + ' (rank ' + exported.sound.selectedSpelling.rank + ', score ' + exported.sound.selectedSpelling.score.toFixed(2) + ')', '- Spelling candidates: ' + spellingCandidateText(exported.sound.spellingCandidates), '- Silhouette: ' + silhouetteSummary(name.silhouette), '- Readability notes: ' + diagnosticText(exported.readabilityDiagnostics), '- Variants: ' + variantText(exported.variants), '- Warnings: ' + (exported.warnings.length > 0 ? exported.warnings.join(', ') : 'none'), '');
  });
  return lines.join('\n').trimEnd() + '\n';
}
