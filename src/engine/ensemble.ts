import { createSeededRandom, clamp } from './random';
import { createNameSilhouette } from './silhouettes';
import { generateNameFromSilhouette } from './generator';
import { createNameIdentity, requiresSupportingName, resolveMaterializedFormatKind } from './identity';
import { isRoleInfluenceActive, resolveCastRole, roleInfluencedSettings } from './roles';
import { combineOverallFit } from './scoring';
import type { CastRoleAssignment, GeneratedEnsemble, GeneratedName, GenerationSettings, NameSilhouette } from './types';
import type { SourceRegistry } from './registry';

export interface LockedNameSlot { index: number; name: GeneratedName; }

function endingKey(name: string): string { const normalized = name.toLowerCase(); return normalized.slice(Math.max(0, normalized.length - 2)); }
function cadenceKey(name: GeneratedName): string { return `${name.silhouette.stressPattern}:${name.silhouette.syllableCount}:${name.silhouette.rhythm}`; }
function countRepeated(values: string[]): number { const seen = new Set<string>(); let repeated = 0; for (const value of values) { if (seen.has(value)) repeated += 1; seen.add(value); } return repeated; }
function roleSeedSegment(settings: GenerationSettings, role?: CastRoleAssignment): string { return role && isRoleInfluenceActive(settings) ? `:role-${role.role}` : ''; }
function ensembleFitScore(candidate: GeneratedName, selected: GeneratedName[]): number { const initials = new Set(selected.map((name) => name.name.charAt(0).toLowerCase())); const endings = new Set(selected.map((name) => endingKey(name.name))); const cadences = new Set(selected.map(cadenceKey)); const rarities = new Set(selected.map((name) => name.silhouette.rarityBand)); const names = new Set(selected.map((name) => name.name.toLowerCase())); const penalty = (initials.has(candidate.name.charAt(0).toLowerCase()) ? 0.24 : 0) + (endings.has(endingKey(candidate.name)) ? 0.22 : 0) + (cadences.has(cadenceKey(candidate)) ? 0.16 : 0) + (rarities.has(candidate.silhouette.rarityBand) ? 0.08 : 0) + (names.has(candidate.name.toLowerCase()) ? 1 : 0); return clamp(1 - penalty); }
function withEnsembleFit(candidate: GeneratedName, selected: GeneratedName[], settings: GenerationSettings): GeneratedName { const ensembleFit = ensembleFitScore(candidate, selected); const scores = { ...candidate.scores, ensembleFit }; const scoringSettings = roleInfluencedSettings(settings, candidate.role); return { ...candidate, scores: { ...scores, overallFit: combineOverallFit(scores, scoringSettings) } }; }

function createBalancedSilhouette(settings: GenerationSettings, randomLabel: string, registry: SourceRegistry, index: number, role?: CastRoleAssignment): NameSilhouette {
  const pack = registry.getStylePack(settings.stylePackId);
  const influencedSettings = roleInfluencedSettings(settings, role);
  const random = createSeededRandom(`${settings.seed}${roleSeedSegment(settings, role)}:${randomLabel}:${index}`);
  return createNameSilhouette({ ...influencedSettings, novelty: clamp(influencedSettings.novelty + ((index % 5) - 2) * 0.06) }, pack, random, index, role);
}

function withNameIdentity(candidate: GeneratedName, settings: GenerationSettings, registry: SourceRegistry, index: number, attempt: number): GeneratedName {
  const formatKind = resolveMaterializedFormatKind(settings.nameFormat, index);
  const pack = registry.getStylePack(settings.stylePackId);
  const influencedSettings = roleInfluencedSettings(settings, candidate.role);
  const supportingName = requiresSupportingName(formatKind)
    ? generateNameFromSilhouette(
      createBalancedSilhouette(settings, `slot-${index}:supporting-${attempt}`, registry, index + 1000, candidate.role),
      pack,
      influencedSettings,
      createSeededRandom(`${settings.seed}${roleSeedSegment(settings, candidate.role)}:supporting:${index}:${attempt}`),
      index + 1000,
    )
    : undefined;
  const identity = createNameIdentity(candidate, supportingName, formatKind);
  const safeDisplaySlug = identity.displayName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return {
    ...candidate,
    id: `name-${index + 1}-${safeDisplaySlug}`,
    name: identity.displayName,
    identity,
    provenance: [...candidate.provenance, identity.format.provenance],
  };
}

function diagnosticsFor(selected: GeneratedName[], castSize: number): GeneratedEnsemble['diagnostics'] {
  const repeatedInitials = countRepeated(selected.map((name) => name.name.charAt(0).toLowerCase()));
  const repeatedEndings = countRepeated(selected.map((name) => endingKey(name.name)));
  const repeatedCadences = countRepeated(selected.map(cadenceKey));
  const repeatedRarityBands = countRepeated(selected.map((name) => name.silhouette.rarityBand));
  const noveltyScores = selected.map((name) => name.scores.novelty);
  const noveltySpread = noveltyScores.length ? Math.max(...noveltyScores) - Math.min(...noveltyScores) : 0;
  const summary = repeatedInitials === 0 && repeatedEndings === 0 && repeatedCadences <= Math.max(0, castSize - 5) ? 'The cast avoids repeated initials and repeated endings while varying cadence, rarity, and syllable count.' : `The cast keeps balance pressure active: ${repeatedInitials} repeated initial(s), ${repeatedEndings} repeated ending(s), ${repeatedCadences} repeated cadence(s), and ${Math.round(noveltySpread * 100)} points of novelty spread.`;
  return { repeatedInitials, repeatedEndings, repeatedCadences, repeatedRarityBands, noveltySpread, summary };
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
    const influencedSettings = roleInfluencedSettings(safeSettings, role);
    const candidates = Array.from({ length: 16 }, (_, attempt) => {
      const silhouette = createBalancedSilhouette(safeSettings, `slot-${index}:attempt-${attempt}`, registry, index, role);
      const random = createSeededRandom(`${settings.seed}${roleSeedSegment(safeSettings, role)}:name:${index}:${attempt}`);
      const baseName = { ...generateNameFromSilhouette(silhouette, pack, influencedSettings, random, index), role };
      return withEnsembleFit(withNameIdentity(baseName, safeSettings, registry, index, attempt), selected, safeSettings);
    });
    candidates.sort((left, right) => right.scores.overallFit - left.scores.overallFit);
    selected.push(candidates[0]);
  }

  return { settings: safeSettings, sourcePack: { id: pack.id, label: pack.label, description: pack.description }, names: selected, diagnostics: diagnosticsFor(selected, castSize) };
}
