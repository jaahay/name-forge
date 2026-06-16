import type { GeneratedName, GenerationSettings, NameSilhouette, StylePack } from './types';
import type { SeededRandom } from './random';
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

function applyEnding(name: string, silhouette: NameSilhouette, pack: StylePack, random: SeededRandom): string {
  if (silhouette.rarityBand === 'common' && random.chance(0.35)) return name;
  const ending = random.pickWeighted(pack.phonotactics.preferredEndings);
  const lower = name.toLowerCase();
  if (lower.endsWith(ending) || ending.length === 0) return name;
  if (/[aeiouy]$/i.test(name) && /^[aeiouy]/i.test(ending)) return `${name.slice(0, -1)}${ending}`;
  if (silhouette.rarityBand === 'rare' && random.chance(0.38)) return `${name}${ending}`;
  return `${name.slice(0, Math.max(3, name.length - 1))}${ending}`;
}

function generateSyllable(shape: string, silhouette: NameSilhouette, pack: StylePack, random: SeededRandom): string {
  const liquidBias = silhouette.texture === 'liquid' || shape.includes('L');
  return `${pickOnset(pack, random, liquidBias)}${pickNucleus(pack, random)}${pickCoda(pack, random, shape.endsWith('C'))}`;
}

export function generateNameFromSilhouette(silhouette: NameSilhouette, pack: StylePack, settings: GenerationSettings, random: SeededRandom, index: number): GeneratedName {
  const fromCurated = settings.culturalAnchoring > 0.78 && random.chance(0.22);
  const baseName = fromCurated ? random.pick(pack.curatedNames) : titleCase(applyEnding(softenCollisions(silhouette.shape.map((shape) => generateSyllable(shape, silhouette, pack, random)).join('')), silhouette, pack, random));
  const scores = scoreName(baseName, silhouette, pack, settings);
  const variants = generateVariants(baseName, pack);
  return { id: `name-${index + 1}-${baseName.toLowerCase()}`, name: baseName, silhouette, scores, variants, provenance: [...silhouette.provenance, { sourceId: fromCurated ? `${pack.id}:curatedNames` : 'name-forge:phonotactic-generator@0.1.0', sourceKind: fromCurated ? 'curated-list' : 'algorithm', label: fromCurated ? 'Curated seed' : 'Generated name', detail: fromCurated ? `Selected from curated examples in ${pack.label}.` : 'Generated from style-pack phonotactics, selected silhouette, seeded randomness, and ending bias.' }, { sourceId: 'name-forge:scoring@0.1.0', sourceKind: 'algorithm', label: 'Plausibility scoring', detail: 'Scores combine pronounceability, memorability, novelty, cultural anchoring, and orthographic naturalness.' }] };
}
