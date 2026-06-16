import { createSeededRandom, clamp } from './random';
import { createNameSilhouette } from './silhouettes';
import { generateNameFromSilhouette } from './generator';
import type { GeneratedEnsemble, GeneratedName, GenerationSettings, NameSilhouette } from './types';
import type { SourceRegistry } from './registry';

function endingKey(name: string): string { const normalized = name.toLowerCase(); return normalized.slice(Math.max(0, normalized.length - 2)); }
function countRepeated(values: string[]): number { const seen = new Set<string>(); let repeated = 0; for (const value of values) { if (seen.has(value)) repeated += 1; seen.add(value); } return repeated; }
function candidatePenalty(candidate: GeneratedName, selected: GeneratedName[]): number { const initials = new Set(selected.map((name) => name.name.charAt(0).toLowerCase())); const endings = new Set(selected.map((name) => endingKey(name.name))); const names = new Set(selected.map((name) => name.name.toLowerCase())); return (initials.has(candidate.name.charAt(0).toLowerCase()) ? 0.16 : 0) + (endings.has(endingKey(candidate.name)) ? 0.14 : 0) + (names.has(candidate.name.toLowerCase()) ? 1 : 0) - candidate.scores.plausibility * 0.08; }

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
    const candidates = Array.from({ length: 10 }, (_, attempt) => {
      const silhouette = createBalancedSilhouette(safeSettings, `slot-${index}:attempt-${attempt}`, registry, index);
      const random = createSeededRandom(`${settings.seed}:name:${index}:${attempt}`);
      return generateNameFromSilhouette(silhouette, pack, safeSettings, random, index);
    });
    candidates.sort((left, right) => candidatePenalty(left, selected) - candidatePenalty(right, selected));
    selected.push(candidates[0]);
  }
  const repeatedInitials = countRepeated(selected.map((name) => name.name.charAt(0).toLowerCase()));
  const repeatedEndings = countRepeated(selected.map((name) => endingKey(name.name)));
  const noveltyScores = selected.map((name) => name.scores.novelty);
  const noveltySpread = noveltyScores.length ? Math.max(...noveltyScores) - Math.min(...noveltyScores) : 0;
  const summary = repeatedInitials === 0 && repeatedEndings === 0 ? 'The cast avoids repeated initials and repeated endings while varying silhouette rarity and syllable count.' : `The cast keeps balance pressure active: ${repeatedInitials} repeated initial(s), ${repeatedEndings} repeated ending(s), and ${Math.round(noveltySpread * 100)} points of novelty spread.`;
  return { settings: safeSettings, sourcePack: { id: pack.id, label: pack.label, description: pack.description }, names: selected, diagnostics: { repeatedInitials, repeatedEndings, noveltySpread, summary } };
}
