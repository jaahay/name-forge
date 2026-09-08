import { clamp } from '../engine/random';
import { castReadabilityDiagnostics, diagnoseNameReadability, readabilitySummary } from '../engine/diagnostics';
import { generateFamilyName } from '../naming/familyName';
import { generateGivenName } from '../naming/givenName';
import { generatePlaceName } from '../naming/placeName';
import type { GeneratedName } from '../engine/types';
import type { SourceRegistry } from '../engine/registry';
import {
  resolveFictionCastComponentGenerationContext,
  supportingComponentKindForFormat,
} from './componentGenerationContext';
import {
  resolveMaterializedFormatPlan,
  type MaterializedNameFormatKind,
} from './formatSelection';
import {
  componentMaterializationSeed,
  type FictionCastIdentityMaterializationContext,
} from './identityDeterminism';
import { createNameIdentity, identityStructureForFormat, requiresSupportingName } from './identity';
import { renderIdentityAuditionPhrase } from './identityAudition';
import { rarityBandForNovelty } from './rarity';
import { isRoleInfluenceActive, resolveCastRole, resolveRoleInfluence } from './roles';
import type {
  CastRoleAssignment,
  FictionCastGeneratedEnsemble,
  FictionCastGeneratedName,
  FictionCastSettings,
  RoleInfluenceMetadata,
} from './types';

export interface LockedNameSlot { index: number; name: FictionCastGeneratedName; }

interface ContextualizedPrimaryName {
  readonly primaryName: GeneratedName;
  readonly roleInfluence?: RoleInfluenceMetadata;
}

type UncomposedFictionCastName = ContextualizedPrimaryName & Pick<FictionCastGeneratedName, 'role' | 'rarityBand' | 'resolvedIntentEvidence'>;

function endingKey(name: string): string { const normalized = name.toLowerCase(); return normalized.slice(Math.max(0, normalized.length - 2)); }
function cadenceKey(name: FictionCastGeneratedName): string { return `${name.primaryName.generationPlan.stressPattern}:${name.primaryName.generationPlan.syllableCount}:${name.primaryName.generationPlan.rhythm}`; }
function countRepeated(values: string[]): number { const seen = new Set<string>(); let repeated = 0; for (const value of values) { if (seen.has(value)) repeated += 1; seen.add(value); } return repeated; }
function roleSeedSegment(settings: FictionCastSettings, role?: CastRoleAssignment): string { return role && isRoleInfluenceActive(settings) ? `:role-${role.role}` : ''; }
function generatedComponentSeed(
  settings: FictionCastSettings,
  role: CastRoleAssignment | undefined,
  materializationContext: FictionCastIdentityMaterializationContext,
  formatKind: MaterializedNameFormatKind,
  componentInstanceKey: string,
): string {
  const structure = identityStructureForFormat(formatKind);
  return `${componentMaterializationSeed(materializationContext, structure, componentInstanceKey)}${roleSeedSegment(settings, role)}`;
}

function withRoleInfluence(
  candidate: GeneratedName,
  settings: FictionCastSettings,
  role?: CastRoleAssignment,
): ContextualizedPrimaryName {
  const roleInfluence = resolveRoleInfluence(settings, role);
  return {
    primaryName: candidate,
    ...(roleInfluence === undefined ? {} : { roleInfluence }),
  };
}

function withNameIdentity(
  candidate: UncomposedFictionCastName,
  settings: FictionCastSettings,
  registry: SourceRegistry,
  index: number,
  formatKind: MaterializedNameFormatKind,
  materializationContext: FictionCastIdentityMaterializationContext,
): FictionCastGeneratedName {
  const supportingKind = supportingComponentKindForFormat(formatKind);
  const supportingIndex = index + 1000;
  const supportingContext = supportingKind
    ? resolveFictionCastComponentGenerationContext(settings, candidate.role, supportingKind, index)
    : undefined;
  const supportingComponentKey = supportingKind === 'family'
    ? 'component:family:0'
    : supportingKind === 'place'
      ? 'component:place:0'
      : undefined;
  const supportingOptions = supportingContext && supportingComponentKey
    ? {
      settings: supportingContext.settings,
      registry,
      determinism: {
        seed: generatedComponentSeed(
          settings,
          candidate.role,
          materializationContext,
          formatKind,
          supportingComponentKey,
        ),
        resultIndex: supportingIndex,
      },
      preferences: supportingContext.preferences,
    }
    : undefined;
  const supportingName = requiresSupportingName(formatKind) && supportingKind && supportingOptions
    ? supportingKind === 'family'
      ? generateFamilyName(supportingOptions)
      : supportingKind === 'place'
        ? generatePlaceName(supportingOptions)
        : undefined
    : undefined;

  const additionalPersonalContext = formatKind === 'given-additional-family'
    ? resolveFictionCastComponentGenerationContext(settings, candidate.role, 'additional-personal', index)
    : undefined;
  const additionalPersonalName = additionalPersonalContext
    ? generateGivenName({
      settings: additionalPersonalContext.settings,
      registry,
      determinism: {
        seed: generatedComponentSeed(
          settings,
          candidate.role,
          materializationContext,
          formatKind,
          'component:additional-personal:0',
        ),
        resultIndex: index + 2000,
      },
      preferences: additionalPersonalContext.preferences,
    })
    : undefined;

  const identity = createNameIdentity({
    primaryPersonal: candidate.primaryName,
    ...(additionalPersonalName ? { additionalPersonal: [additionalPersonalName] } : {}),
    ...(supportingKind === 'family' && supportingName ? { family: supportingName } : {}),
    ...(supportingKind === 'place' && supportingName ? { place: supportingName } : {}),
  }, formatKind, materializationContext);
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
    resolvedIntentEvidence: candidate.resolvedIntentEvidence,
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
  const pack = registry.getStylePack(settings.stylePackId);
  const selected: FictionCastGeneratedName[] = [];
  const lockedNames = lockedSlotMap(lockedSlots, castSize);
  const lockedFormats = new Map<number, MaterializedNameFormatKind>();
  for (const [index, lockedName] of lockedNames) lockedFormats.set(index, lockedName.identity.format.kind);
  const materializedFormats = resolveMaterializedFormatPlan(
    safeSettings.nameFormat,
    safeSettings.seed,
    castSize,
    lockedFormats,
  );

  for (let index = 0; index < castSize; index += 1) {
    const lockedName = lockedNames.get(index);
    if (lockedName) {
      selected.push(lockedName);
      continue;
    }

    const formatKind = materializedFormats[index];
    if (!formatKind) throw new Error(`Fiction Cast has no materialized format for slot ${index}.`);
    const role = resolveCastRole(safeSettings, index);
    const primaryContext = resolveFictionCastComponentGenerationContext(safeSettings, role, 'given', index);
    const rarityBand = rarityBandForNovelty(primaryContext.settings.novelty);
    const materializationContext: FictionCastIdentityMaterializationContext = {
      castSeed: safeSettings.seed,
      slotIndex: index,
    };
    const generated = generateGivenName({
      settings: primaryContext.settings,
      registry,
      determinism: {
        seed: generatedComponentSeed(
          safeSettings,
          role,
          materializationContext,
          formatKind,
          'component:given:0',
        ),
        resultIndex: index,
      },
      preferences: primaryContext.preferences,
    });
    const baseName: UncomposedFictionCastName = {
      ...withRoleInfluence(generated, safeSettings, role),
      role,
      rarityBand,
      resolvedIntentEvidence: {
        baseline: { ...primaryContext.semanticIntent.baseline },
        castVariation: safeSettings.castVariation ?? 'balanced',
        variationDelta: primaryContext.semanticIntent.variationDelta,
      },
    };
    selected.push(withNameIdentity(baseName, safeSettings, registry, index, formatKind, materializationContext));
  }

  return { settings: safeSettings, sourcePack: { id: pack.id, label: pack.label, description: pack.description, source: pack.source, style: pack.style }, names: selected, diagnostics: diagnosticsFor(selected, castSize) };
}
