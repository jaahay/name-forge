import { clamp } from '../engine/random';
import { castReadabilityDiagnostics, diagnoseNameReadability, readabilitySummary } from '../engine/diagnostics';
import { generateFamilyName } from '../naming/familyName';
import { generateGivenName, type GivenNamePreferences } from '../naming/givenName';
import { generatePlaceName } from '../naming/placeName';
import { renderIdentityAuditionPhrase } from '../engine/identityAudition';
import type { GeneratedName, GenerationSettings } from '../engine/types';
import type { SourceRegistry } from '../engine/registry';
import {
  resolveFictionCastComponentGenerationContext,
  supportingComponentKindForFormat,
} from './componentGenerationContext';
import { createNameIdentity, requiresSupportingName, resolveMaterializedFormatKind } from './identity';
import { resolveFictionCastRarityBand } from './rarity';
import { getRolePreferenceProfile, isRoleInfluenceActive, resolveCastRole, resolveRoleInfluence } from './roles';
import { combineFictionCastOverallFit, scoreFictionCastRoleFit } from './scoring';
import { fictionCastBaselineGenerationSettings } from './semanticIntent';
import type {
  CastRoleAssignment,
  FictionCastContextualScores,
  FictionCastGeneratedEnsemble,
  FictionCastGeneratedName,
  FictionCastSettings,
  RoleInfluenceMetadata,
} from './types';

export interface LockedNameSlot { index: number; name: FictionCastGeneratedName; }

interface ContextualizedPrimaryName {
  readonly primaryName: GeneratedName;
  readonly roleInfluence?: RoleInfluenceMetadata;
  readonly contextualScores: FictionCastContextualScores;
}

type UncomposedFictionCastName = ContextualizedPrimaryName & Pick<FictionCastGeneratedName, 'role' | 'rarityBand'>;

function endingKey(name: string): string { const normalized = name.toLowerCase(); return normalized.slice(Math.max(0, normalized.length - 2)); }
function cadenceKey(name: FictionCastGeneratedName): string { return `${name.primaryName.generationPlan.stressPattern}:${name.primaryName.generationPlan.syllableCount}:${name.primaryName.generationPlan.rhythm}`; }
function countRepeated(values: string[]): number { const seen = new Set<string>(); let repeated = 0; for (const value of values) { if (seen.has(value)) repeated += 1; seen.add(value); } return repeated; }
function roleSeedSegment(settings: FictionCastSettings, role?: CastRoleAssignment): string { return role && isRoleInfluenceActive(settings) ? `:role-${role.role}` : ''; }
function ensembleFitScore(candidate: FictionCastGeneratedName, selected: FictionCastGeneratedName[]): number { const initials = new Set(selected.map((name) => name.displayName.charAt(0).toLowerCase())); const endings = new Set(selected.map((name) => endingKey(name.displayName))); const cadences = new Set(selected.map(cadenceKey)); const names = new Set(selected.map((name) => name.displayName.toLowerCase())); const penalty = (initials.has(candidate.displayName.charAt(0).toLowerCase()) ? 0.24 : 0) + (endings.has(endingKey(candidate.displayName)) ? 0.22 : 0) + (cadences.has(cadenceKey(candidate)) ? 0.16 : 0) + (names.has(candidate.displayName.toLowerCase()) ? 1 : 0); return clamp(1 - penalty); }
function withEnsembleFit(candidate: FictionCastGeneratedName, selected: FictionCastGeneratedName[], settings: FictionCastSettings): FictionCastGeneratedName {
  const ensembleFit = ensembleFitScore(candidate, selected);
  const scoringSettings = resolveFictionCastComponentGenerationContext(settings, candidate.role, 'given').settings;
  const contextualScores = {
    ...candidate.contextualScores,
    ensembleFit,
    overallFit: combineFictionCastOverallFit(candidate.primaryName.scores, { ensembleFit, roleFit: candidate.contextualScores.roleFit }, scoringSettings, settings.roleInfluence),
  };
  return { ...candidate, contextualScores };
}

function planningNoveltyOffsetForCandidate(index: number): number {
  return ((index % 5) - 2) * 0.06;
}

function semanticNamePreferencesForCandidate(settings: FictionCastSettings, role: CastRoleAssignment | undefined, index: number): GivenNamePreferences {
  const noveltyOffset = planningNoveltyOffsetForCandidate(index);
  const influence = resolveRoleInfluence(settings, role);
  if (!influence) return { noveltyOffset };
  const profile = getRolePreferenceProfile(influence.role);
  return {
    noveltyOffset,
    preferenceStrength: influence.strength,
    syllableCounts: profile.syllableCounts,
    textures: profile.textures,
  };
}

function withRoleInfluence(
  candidate: GeneratedName,
  generationSettings: GenerationSettings,
  settings: FictionCastSettings,
  role?: CastRoleAssignment,
): ContextualizedPrimaryName {
  const roleInfluence = resolveRoleInfluence(settings, role);
  const roleFit = scoreFictionCastRoleFit(candidate.name, candidate.generationPlan, roleInfluence);
  const contextualScores = {
    ensembleFit: 0.72,
    roleFit,
    overallFit: combineFictionCastOverallFit(candidate.scores, { ensembleFit: 0.72, roleFit }, generationSettings, settings.roleInfluence),
  };
  return {
    primaryName: candidate,
    ...(roleInfluence === undefined ? {} : { roleInfluence }),
    contextualScores,
  };
}

function withNameIdentity(candidate: UncomposedFictionCastName, settings: FictionCastSettings, registry: SourceRegistry, index: number, attempt: number): FictionCastGeneratedName {
  const formatKind = resolveMaterializedFormatKind(settings.nameFormat, index);
  const supportingKind = supportingComponentKindForFormat(formatKind);
  const supportingContext = supportingKind
    ? resolveFictionCastComponentGenerationContext(settings, candidate.role, supportingKind)
    : undefined;
  const supportingIndex = index + 1000;
  const supportingOptions = supportingContext
    ? {
      settings: supportingContext.settings,
      registry,
      determinism: {
        seed: `${settings.seed}${roleSeedSegment(settings, candidate.role)}:slot-${index}:supporting-${attempt}`,
        resultIndex: supportingIndex,
      },
      preferences: semanticNamePreferencesForCandidate(settings, candidate.role, supportingIndex),
    }
    : undefined;
  const supportingName = requiresSupportingName(formatKind) && supportingKind && supportingOptions
    ? supportingKind === 'family'
      ? generateFamilyName(supportingOptions)
      : supportingKind === 'place'
        ? generatePlaceName(supportingOptions)
        : undefined
    : undefined;
  const identity = createNameIdentity(candidate.primaryName, supportingName, formatKind);
  const identityAudition = renderIdentityAuditionPhrase(identity);
  const safeDisplaySlug = identity.displayName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return {
    id: `name-${index + 1}-${safeDisplaySlug}`,
    displayName: identity.displayName,
    primaryName: candidate.primaryName,
    identity,
    identityAudition,
    readabilityDiagnostics: diagnoseNameReadability(identity.displayName),
    role: candidate.role,
    ...(candidate.roleInfluence === undefined ? {} : { roleInfluence: candidate.roleInfluence }),
    contextualScores: candidate.contextualScores,
    rarityBand: candidate.rarityBand,
  };
}

function diagnosticsFor(selected: FictionCastGeneratedName[], castSize: number): FictionCastGeneratedEnsemble['diagnostics'] {
  const repeatedInitials = countRepeated(selected.map((name) => name.displayName.charAt(0).toLowerCase()));
  const repeatedEndings = countRepeated(selected.map((name) => endingKey(name.displayName)));
  const repeatedCadences = countRepeated(selected.map(cadenceKey));
  const repeatedRarityBands = countRepeated(selected.map((name) => name.rarityBand));
  const noveltyScores = selected.map((name) => name.primaryName.scores.novelty);
  const noveltySpread = noveltyScores.length ? Math.max(...noveltyScores) - Math.min(...noveltyScores) : 0;
  const readabilityNames = selected.map((name) => ({ ...name.primaryName, readabilityDiagnostics: name.readabilityDiagnostics }));
  const readabilityDiagnostics = castReadabilityDiagnostics(readabilityNames);
  const readabilityIssues = selected.reduce((sum, name) => sum + name.readabilityDiagnostics.length, 0);
  const readabilityWarnings = selected.reduce((sum, name) => sum + name.readabilityDiagnostics.filter((diagnostic) => diagnostic.severity === 'warning').length, 0);
  const summary = repeatedInitials === 0 && repeatedEndings === 0 && repeatedCadences <= Math.max(0, castSize - 5) ? 'The cast avoids repeated initials and repeated endings while varying cadence, rarity, and syllable count.' : `The cast keeps balance pressure active: ${repeatedInitials} repeated initial(s), ${repeatedEndings} repeated ending(s), ${repeatedCadences} repeated cadence(s), and ${Math.round(noveltySpread * 100)} points of novelty spread.`;
  return { repeatedInitials, repeatedEndings, repeatedCadences, repeatedRarityBands, noveltySpread, readabilityIssues, readabilityWarnings, readabilitySummary: readabilitySummary(readabilityNames), readabilityDiagnostics, summary };
}

function lockedSlotMap(lockedSlots: LockedNameSlot[] | undefined, castSize: number): Map<number, FictionCastGeneratedName> {
  const slots = new Map<number, FictionCastGeneratedName>();
  for (const locked of lockedSlots ?? []) {
    if (locked.index >= 0 && locked.index < castSize) slots.set(locked.index, locked.name);
  }
  return slots;
}

export function generateEnsemble(settings: FictionCastSettings, registry: SourceRegistry, lockedSlots?: LockedNameSlot[]): FictionCastGeneratedEnsemble {
  const castSize = Math.round(clamp(settings.castSize, 1, 24));
  const safeSettings: FictionCastSettings = { ...settings, castSize };
  const baselineGenerationSettings = fictionCastBaselineGenerationSettings(safeSettings);
  const pack = registry.getStylePack(settings.stylePackId);
  const selected: FictionCastGeneratedName[] = [];
  const lockedNames = lockedSlotMap(lockedSlots, castSize);

  for (let index = 0; index < castSize; index += 1) {
    const lockedName = lockedNames.get(index);
    if (lockedName) {
      selected.push(lockedName);
      continue;
    }

    const role = resolveCastRole(safeSettings, index);
    const rarityBand = resolveFictionCastRarityBand({
      novelty: baselineGenerationSettings.novelty,
      rarityDistribution: safeSettings.rarityDistribution,
      seed: safeSettings.seed,
      stylePackId: safeSettings.stylePackId,
    }, index);
    const primaryContext = resolveFictionCastComponentGenerationContext(safeSettings, role, 'given');
    const candidates = Array.from({ length: 16 }, (_, attempt) => {
      const generated = generateGivenName({
        settings: primaryContext.settings,
        registry,
        determinism: {
          seed: `${safeSettings.seed}${roleSeedSegment(safeSettings, role)}:slot-${index}:attempt-${attempt}`,
          resultIndex: index,
        },
        preferences: semanticNamePreferencesForCandidate(safeSettings, role, index),
      });
      const baseName: UncomposedFictionCastName = {
        ...withRoleInfluence(generated, primaryContext.settings, safeSettings, role),
        role,
        rarityBand,
      };
      return withEnsembleFit(withNameIdentity(baseName, safeSettings, registry, index, attempt), selected, safeSettings);
    });
    candidates.sort((left, right) => right.contextualScores.overallFit - left.contextualScores.overallFit);
    selected.push(candidates[0]);
  }

  return { settings: safeSettings, sourcePack: { id: pack.id, label: pack.label, description: pack.description, source: pack.source, style: pack.style }, names: selected, diagnostics: diagnosticsFor(selected, castSize) };
}
