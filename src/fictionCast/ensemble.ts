import { createSeededRandom, clamp } from '../engine/random';
import { castReadabilityDiagnostics, diagnoseNameReadability, readabilitySummary } from '../engine/diagnostics';
import { generateName } from '../naming/generator';
import { toNameGenerationSettings } from '../naming/settings';
import { renderIdentityAuditionPhrase } from '../engine/identityAudition';
import type { CastRoleAssignment, GeneratedEnsemble, GeneratedName, GenerationSettings, NameGenerationPlanPreferences } from '../engine/types';
import type { SourceRegistry } from '../engine/registry';
import {
  resolveFictionCastComponentGenerationContext,
  supportingComponentKindForFormat,
} from './componentGenerationContext';
import { createNameIdentity, requiresSupportingName, resolveMaterializedFormatKind } from './identity';
import { resolveFictionCastRarityBand } from './rarity';
import { getRolePreferenceProfile, isRoleInfluenceActive, resolveCastRole, resolveRoleInfluence } from './roles';
import { combineFictionCastOverallFit, scoreFictionCastRoleFit } from './scoring';

export interface LockedNameSlot { index: number; name: GeneratedName; }

function endingKey(name: string): string { const normalized = name.toLowerCase(); return normalized.slice(Math.max(0, normalized.length - 2)); }
function cadenceKey(name: GeneratedName): string { return `${name.silhouette.stressPattern}:${name.silhouette.syllableCount}:${name.silhouette.rhythm}`; }
function countRepeated(values: string[]): number { const seen = new Set<string>(); let repeated = 0; for (const value of values) { if (seen.has(value)) repeated += 1; seen.add(value); } return repeated; }
function roleSeedSegment(settings: GenerationSettings, role?: CastRoleAssignment): string { return role && isRoleInfluenceActive(settings) ? `:role-${role.role}` : ''; }
function ensembleFitScore(candidate: GeneratedName, selected: GeneratedName[]): number { const initials = new Set(selected.map((name) => name.name.charAt(0).toLowerCase())); const endings = new Set(selected.map((name) => endingKey(name.name))); const cadences = new Set(selected.map(cadenceKey)); const rarities = new Set(selected.map((name) => name.silhouette.rarityBand)); const names = new Set(selected.map((name) => name.name.toLowerCase())); const penalty = (initials.has(candidate.name.charAt(0).toLowerCase()) ? 0.24 : 0) + (endings.has(endingKey(candidate.name)) ? 0.22 : 0) + (cadences.has(cadenceKey(candidate)) ? 0.16 : 0) + (rarities.has(candidate.silhouette.rarityBand) ? 0.08 : 0) + (names.has(candidate.name.toLowerCase()) ? 1 : 0); return clamp(1 - penalty); }
function withEnsembleFit(candidate: GeneratedName, selected: GeneratedName[], settings: GenerationSettings): GeneratedName { const ensembleFit = ensembleFitScore(candidate, selected); const scores = { ...candidate.scores, ensembleFit }; const scoringSettings = resolveFictionCastComponentGenerationContext(settings, candidate.role, 'given').settings; return { ...candidate, scores: { ...scores, overallFit: combineFictionCastOverallFit(scores, scoringSettings) } }; }

function planningSettingsForCandidate(settings: GenerationSettings, index: number): GenerationSettings {
  return {
    ...settings,
    novelty: clamp(settings.novelty + ((index % 5) - 2) * 0.06),
  };
}

function planningPreferencesForCandidate(settings: GenerationSettings, role: CastRoleAssignment | undefined, index: number): NameGenerationPlanPreferences | undefined {
  const influence = resolveRoleInfluence(settings, role);
  const rarityBand = resolveFictionCastRarityBand(settings, index);
  if (!influence && !rarityBand) return undefined;
  const profile = influence ? getRolePreferenceProfile(influence.role) : undefined;
  return {
    strength: influence?.strength ?? 0,
    ...(profile === undefined ? {} : { syllableCounts: profile.syllableCounts, textures: profile.textures }),
    ...(rarityBand === undefined ? {} : { rarityBand }),
  };
}

function withRoleInfluence(candidate: GeneratedName, settings: GenerationSettings, role?: CastRoleAssignment): GeneratedName {
  const roleInfluence = resolveRoleInfluence(settings, role);
  if (!roleInfluence) return candidate;
  const plan = { ...candidate.silhouette, roleInfluence };
  const scores = {
    ...candidate.scores,
    roleFit: scoreFictionCastRoleFit(candidate.name, plan, roleInfluence),
  };
  return {
    ...candidate,
    silhouette: plan,
    roleInfluence,
    scores: { ...scores, overallFit: combineFictionCastOverallFit(scores, settings) },
  };
}

function withNameIdentity(candidate: GeneratedName, settings: GenerationSettings, registry: SourceRegistry, index: number, attempt: number): GeneratedName {
  const formatKind = resolveMaterializedFormatKind(settings.nameFormat, index);
  const pack = registry.getStylePack(settings.stylePackId);
  const supportingKind = supportingComponentKindForFormat(formatKind);
  const supportingContext = supportingKind
    ? resolveFictionCastComponentGenerationContext(settings, candidate.role, supportingKind)
    : undefined;
  const supportingIndex = index + 1000;
  const supportingName = requiresSupportingName(formatKind) && supportingKind && supportingContext
    ? generateName({
      settings: toNameGenerationSettings(supportingContext.settings),
      planningSettings: toNameGenerationSettings(planningSettingsForCandidate(supportingContext.settings, supportingIndex)),
      planningPreferences: planningPreferencesForCandidate(supportingContext.settings, candidate.role, supportingIndex),
      pack,
      planningRandom: createSeededRandom(`${settings.seed}${roleSeedSegment(settings, candidate.role)}:slot-${index}:supporting-${attempt}:${supportingIndex}`),
      generationRandom: createSeededRandom(`${settings.seed}${roleSeedSegment(settings, candidate.role)}:supporting:${index}:${attempt}`),
      index: supportingIndex,
    })
    : undefined;
  const identity = createNameIdentity(candidate, supportingName, formatKind);
  const identityAudition = renderIdentityAuditionPhrase(identity);
  const safeDisplaySlug = identity.displayName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return {
    ...candidate,
    id: `name-${index + 1}-${safeDisplaySlug}`,
    name: identity.displayName,
    identity,
    identityAudition,
    readabilityDiagnostics: diagnoseNameReadability(identity.displayName),
  };
}

function diagnosticsFor(selected: GeneratedName[], castSize: number): GeneratedEnsemble['diagnostics'] {
  const repeatedInitials = countRepeated(selected.map((name) => name.name.charAt(0).toLowerCase()));
  const repeatedEndings = countRepeated(selected.map((name) => endingKey(name.name)));
  const repeatedCadences = countRepeated(selected.map(cadenceKey));
  const repeatedRarityBands = countRepeated(selected.map((name) => name.silhouette.rarityBand));
  const noveltyScores = selected.map((name) => name.scores.novelty);
  const noveltySpread = noveltyScores.length ? Math.max(...noveltyScores) - Math.min(...noveltyScores) : 0;
  const readabilityDiagnostics = castReadabilityDiagnostics(selected);
  const readabilityIssues = selected.reduce((sum, name) => sum + name.readabilityDiagnostics.length, 0);
  const readabilityWarnings = selected.reduce((sum, name) => sum + name.readabilityDiagnostics.filter((diagnostic) => diagnostic.severity === 'warning').length, 0);
  const summary = repeatedInitials === 0 && repeatedEndings === 0 && repeatedCadences <= Math.max(0, castSize - 5) ? 'The cast avoids repeated initials and repeated endings while varying cadence, rarity, and syllable count.' : `The cast keeps balance pressure active: ${repeatedInitials} repeated initial(s), ${repeatedEndings} repeated ending(s), ${repeatedCadences} repeated cadence(s), and ${Math.round(noveltySpread * 100)} points of novelty spread.`;
  return { repeatedInitials, repeatedEndings, repeatedCadences, repeatedRarityBands, noveltySpread, readabilityIssues, readabilityWarnings, readabilitySummary: readabilitySummary(selected), readabilityDiagnostics, summary };
}

function lockedSlotMap(lockedSlots: LockedNameSlot[] | undefined, castSize: number): Map<number, GeneratedName> {
  const slots = new Map<number, GeneratedName>();
  for (const locked of lockedSlots ?? []) {
    if (locked.index >= 0 && locked.index < castSize) slots.set(locked.index, locked.name);
  }
  return slots;
}

export function generateEnsemble(settings: GenerationSettings, registry: SourceRegistry, lockedSlots?: LockedNameSlot[]): GeneratedEnsemble {
  const castSize = Math.round(clamp(settings.castSize, 1, 24));
  const safeSettings = { ...settings, castSize };
  const pack = registry.getStylePack(settings.stylePackId);
  const selected: GeneratedName[] = [];
  const lockedNames = lockedSlotMap(lockedSlots, castSize);

  for (let index = 0; index < castSize; index += 1) {
    const lockedName = lockedNames.get(index);
    if (lockedName) {
      selected.push(lockedName);
      continue;
    }

    const role = resolveCastRole(safeSettings, index);
    const primaryContext = resolveFictionCastComponentGenerationContext(safeSettings, role, 'given');
    const candidates = Array.from({ length: 16 }, (_, attempt) => {
      const generated = generateName({
        settings: toNameGenerationSettings(primaryContext.settings),
        planningSettings: toNameGenerationSettings(planningSettingsForCandidate(primaryContext.settings, index)),
        planningPreferences: planningPreferencesForCandidate(primaryContext.settings, role, index),
        pack,
        planningRandom: createSeededRandom(`${safeSettings.seed}${roleSeedSegment(safeSettings, role)}:slot-${index}:attempt-${attempt}:${index}`),
        generationRandom: createSeededRandom(`${settings.seed}${roleSeedSegment(safeSettings, role)}:name:${index}:${attempt}`),
        index,
      });
      const baseName = {
        ...withRoleInfluence(generated, primaryContext.settings, role),
        role,
      };
      return withEnsembleFit(withNameIdentity(baseName, safeSettings, registry, index, attempt), selected, safeSettings);
    });
    candidates.sort((left, right) => right.scores.overallFit - left.scores.overallFit);
    selected.push(candidates[0]);
  }

  return { settings: safeSettings, sourcePack: { id: pack.id, label: pack.label, description: pack.description, source: pack.source, style: pack.style }, names: selected, diagnostics: diagnosticsFor(selected, castSize) };
}
