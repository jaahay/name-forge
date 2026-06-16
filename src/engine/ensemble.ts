import { createSeededRandom, clamp } from './random';
import { createNameSilhouette } from './silhouettes';
import { generateNameFromSilhouette } from './generator';
import { combinePlausibility } from './scoring';
import type { GeneratedEnsemble, GeneratedName, GenerationSettings, NameSilhouette } from './types';
import type { SourceRegistry } from './registry';

function endingKey(name: string): string { const normalized = name.toLowerCase(); return normalized.slice(Math.max(0, normalized.length - 2)); }
function cadenceKey(name: GeneratedName): string { return `${name.silhouette.stressPattern}:${name.silhouette.syllableCount}:${name.silhouette.rhythm}`; }
function countRepeated(values: string[]): number { const seen = new Set<string>(); let repeated = 0; for (const value of values) { if (seen.has(value)) repeated += 1; seen.add(value); } return repeated; }
function ensembleFitScore(candidate: GeneratedName, selected: GeneratedName[]): number { const initials = new Set(selected.map((name) => name.name.charAt(0).toLowerCase())); const endings = new Set(selected.map((name) => endingKey(name.name))); const cadences = new Set(selected.map(cadenceKey)); const rarities = new Set(selected.map((name) => name.silhouette.rarityBand)); const names = new Set(selected.map((name) => name.name.toLowerCase())); const penalty = (initials.has(candidate.name.charAt(0).toLowerCase()) ? 0.24 : 0) + (endings.has(endingKey(candidate.name)) ? 0.22 : 0) + (cadences.has(cadenceKey(candidate)) ? 0.16 : 0) + (rarities.has(candidate.silhouette.rarityBand) ? 0.08 : 0) + (names.has(candidate.name.toLowerCase()) ? 1 : 0); return clamp(1 - penalty); }
function withEnsembleFit(candidate: GeneratedName, selected: GeneratedName[]): GeneratedName { const ensembleFit = ensembleFitScore(candidate, selected); const scores = { ...candidate.scores, ensembleFit }; return { ...candidate, scores: { ...scores, plausibility: combinePlausibility(scores) } }; }

function createBalancedSilhouette(settings: GenerationSettings, randomLabel: string, registry: SourceRegistry, index: number): NameSilhouette {
  const pack = registry.getStylePack(settings.stylePackId);
  const random = createSeededRandom(`${settings.seed}:${randomLabel}:${index}`);
  return createNameSilhouette({ ...settings, novelty: clamp(settings.novelty + ((index % 5) - 2) * 0.06) }, pack, random, index);
}

export function generateEnsemble(settings: GenerationSettings, registry: SourceRegistry): GeneratedEnsemble {
  const castSize = Math.round(clamp(settings.castSize, 1, 24));
  const safeSettings = { ...settings, castSize };
  const pack = registry.getStylePack(settings.stylePackId);
  const selected: GeneratedName[] = [];
  for (let index = 0; index < castSize; index += 1) {
    const candidates = Array.from({ length: 16 }, (_, attempt) => {
      const silhouette = createBalancedSilhouette(safeSettings, `slot-${index}:attempt-${attempt}`, registry, index);
      const random = createSeededRandom(`${settings.seed}:name:${index}:${attempt}`);
      return withEnsembleFit(generateNameFromSilhouette(silhouette, pack, safeSettings, random, index), selected);
    });
    candidates.sort((left, right) => right.scores.plausibility - left.scores.plausibility);
    selected.push(candidates[0]);
  }
  const repeatedInitials = countRepeated(selected.map((name) => name.name.charAt(0).toLowerCase()));
  const repeatedEndings = countRepeated(selected.map((name) => endingKey(name.name)));
  const repeatedCadences = countRepeated(selected.map(cadenceKey));
  const repeatedRarityBands = countRepeated(selected.map((name) => name.silhouette.rarityBand));
  const noveltyScores = selected.map((name) => name.scores.novelty);
  const noveltySpread = noveltyScores.length ? Math.max(...noveltyScores) - Math.min(...noveltyScores) : 0;
  const summary = repeatedInitials === 0 && repeatedEndings === 0 && repeatedCadences <= Math.max(0, castSize - 5) ? 'The cast avoids repeated initials and repeated endings while varying cadence, rarity, and syllable count.' : `The cast keeps balance pressure active: ${repeatedInitials} repeated initial(s), ${repeatedEndings} repeated ending(s), ${repeatedCadences} repeated cadence(s), and ${Math.round(noveltySpread * 100)} points of novelty spread.`;
  return { settings: safeSettings, sourcePack: { id: pack.id, label: pack.label, description: pack.description }, names: selected, diagnostics: { repeatedInitials, repeatedEndings, repeatedCadences, repeatedRarityBands, noveltySpread, summary } };
}
