import type { GeneratedName, GenerationSettings, NameSilhouette, StylePack } from './types';
import type { SeededRandom } from './random';
import { clamp, lerp } from './random';
import { scoreName } from './scoring';
import { generateVariants } from './variants';

const fallbackOnsets = ['b', 'c', 'd', 'f', 'g', 'l', 'm', 'n', 'r', 's', 't', 'v'];
const fallbackNuclei = ['a', 'e', 'i', 'o', 'u'];
const fallbackCodas = ['', 'l', 'n', 'r', 's'];

function titleCase(value: string): string { return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase(); }
function pickOnset(pack: StylePack, random: SeededRandom, liquidBias: boolean): string { const source = pack.phonotactics.onsets.length > 0 ? pack.phonotactics.onsets : fallbackOnsets.map((value) => ({ value, weight: 1 })); const onset = random.pickWeighted(source); return liquidBias && onset && !/[lrw]/.test(onset) && random.chance(0.35) ? random.pick(['l', 'r', 'w']) : onset; }
function pickNucleus(pack: StylePack, random: SeededRandom): string { const source = pack.phonotactics.nuclei.length > 0 ? pack.phonotactics.nuclei : fallbackNuclei.map((value) => ({ value, weight: 1 })); return random.pickWeighted(source); }
function pickCoda(pack: StylePack, random: SeededRandom, needsCoda: boolean): string { if (!needsCoda) return ''; const source = pack.phonotactics.codas.length > 0 ? pack.phonotactics.codas : fallbackCodas.map((value) => ({ value, weight: 1 })); return random.pickWeighted(source); }
function softenCollisions(value: string): string { return value.replace(/([bcdfghjklmnpqrstvwxz])\1{2,}/gi, '$1$1').replace(/([aeiouy])\1{2,}/gi, '$1').replace(/thth/gi, 'th').replace(/rrr/gi, 'rr'); }

function curatedChance(settings: GenerationSettings): number { return lerp(0, 0.025, settings.culturalAnchoring); }
function anchoredEndingChance(settings: GenerationSettings): number { return lerp(0.28, 0.88, settings.culturalAnchoring); }

function applyEnding(name: string, silhouette: NameSilhouette, pack: StylePack, settings: GenerationSettings, random: SeededRandom): string {
  if (!random.chance(anchoredEndingChance(settings))) return name;
  if (silhouette.rarityBand === 'common' && random.chance(lerp(0.52, 0.12, settings.culturalAnchoring))) return name;
  const ending = random.pickWeighted(pack.phonotactics.preferredEndings);
  const lower = name.toLowerCase();
  if (lower.endsWith(ending) || ending.length === 0) return name;
  if (/[aeiouy]$/i.test(name) && /^[aeiouy]/i.test(ending)) return `${name.slice(0, -1)}${ending}`;
  if (silhouette.rarityBand === 'rare' && random.chance(lerp(0.28, 0.48, settings.culturalAnchoring))) return `${name}${ending}`;
  return `${name.slice(0, Math.max(3, name.length - 1))}${ending}`;
}

function applyOrthographicWeirdness(name: string, pack: StylePack, settings: GenerationSettings, random: SeededRandom): string {
  const weirdness = clamp(settings.orthographicWeirdness);
  if (!random.chance(lerp(0.02, 0.58, weirdness))) return name;
  const rareGraphemes = pack.phonotactics.rareGraphemes.filter((fragment) => fragment.length > 0);
  if (rareGraphemes.length === 0) return name;
  const lower = name.toLowerCase();
  const fragment = random.pick(rareGraphemes);
  if (lower.includes(fragment) && !random.chance(lerp(0.08, 0.28, weirdness))) return name;
  const vowelIndex = lower.search(/[aeiouy]/);
  const insertionIndex = vowelIndex < 0 ? lower.length : vowelIndex;
  const mutated = random.chance(0.56)
    ? `${lower.slice(0, insertionIndex)}${fragment}${lower.slice(insertionIndex + 1)}`
    : `${lower}${fragment}`;
  return titleCase(softenCollisions(mutated));
}

function enforceMinimumNameLength(name: string, pack: StylePack): string {
  if (name.length >= 3) return name;
  const lower = name.toLowerCase();
  const padding = pack.phonotactics.preferredEndings.find(({ value }) => value.length >= 2 && !lower.endsWith(value))?.value ?? 'en';
  return titleCase(softenCollisions(`${lower}${padding}`));
}

function generateSyllable(shape: string, silhouette: NameSilhouette, pack: StylePack, random: SeededRandom): string {
  const liquidBias = silhouette.texture === 'liquid' || shape.includes('L');
  return `${pickOnset(pack, random, liquidBias)}${pickNucleus(pack, random)}${pickCoda(pack, random, shape.endsWith('C'))}`;
}

export function generateNameFromSilhouette(silhouette: NameSilhouette, pack: StylePack, settings: GenerationSettings, random: SeededRandom, index: number): GeneratedName {
  const fromCurated = random.chance(curatedChance(settings));
  const generatedName = enforceMinimumNameLength(titleCase(applyOrthographicWeirdness(applyEnding(softenCollisions(silhouette.shape.map((shape) => generateSyllable(shape, silhouette, pack, random)).join('')), silhouette, pack, settings, random), pack, settings, random)), pack);
  const baseName = fromCurated ? random.pick(pack.curatedNames) : generatedName;
  const scores = scoreName(baseName, silhouette, pack, settings);
  const variants = generateVariants(baseName, pack, settings);
  return { id: `name-${index + 1}-${baseName.toLowerCase()}`, name: baseName, silhouette, scores, variants, provenance: [...silhouette.provenance, { sourceId: fromCurated ? `${pack.id}:curatedNames` : 'name-forge:phonotactic-generator@0.1.0', sourceKind: fromCurated ? 'curated-list' : 'algorithm', label: fromCurated ? 'Curated seed' : 'Generated name', detail: fromCurated ? `Selected from curated examples in ${pack.label} using cultural anchoring pressure.` : 'Generated from style-pack phonotactics, selected silhouette, seeded randomness, anchoring pressure, orthographic weirdness, and minimum viability guards.' }, { sourceId: 'name-forge:scoring@0.1.0', sourceKind: 'algorithm', label: 'Overall fit scoring', detail: 'Overall fit is a slider-weighted selection score over intrinsic component scores. The displayed number is not a school grade or percentile.' }] };
}
