import type { SoundCandidate } from './soundGenerator';
import type { RankedSpellingCandidate } from './spellingGenerator';
import type { GeneratedName, GenerationSettings, NameSilhouette, StylePack } from './types';
import type { SeededRandom } from './random';
import { diagnoseNameReadability } from './diagnostics';
import { clamp } from './random';
import { scoreName } from './scoring';
import { generateSound } from './soundGenerator';
import type { StyleInput } from './styleCompiler';
import { compileStyle } from './styleCompiler';
import { generateRankedSpellings } from './spellingGenerator';
import { generateVariants } from './variants';

export interface NameGenerationCandidate {
  readonly sound: SoundCandidate;
  readonly rankedSpellings: readonly RankedSpellingCandidate[];
  readonly selectedSpelling: RankedSpellingCandidate;
}

function feelFor(silhouette: NameSilhouette): StyleInput['feel'] {
  if (silhouette.texture === 'soft') return 'gentle';
  if (silhouette.texture === 'hard') return 'strong';
  if (silhouette.texture === 'liquid') return 'lyrical';
  return 'balanced';
}

function distinctivenessFor(settings: GenerationSettings): StyleInput['distinctiveness'] {
  const novelty = clamp(settings.novelty);
  if (novelty < 0.38) return 'familiar';
  if (novelty > 0.62) return 'distinctive';
  return 'balanced';
}

function compileSoundProfileFromSettings(settings: GenerationSettings, silhouette: NameSilhouette) {
  return compileStyle({
    feel: feelFor(silhouette),
    length: silhouette.targetLength,
    distinctiveness: distinctivenessFor(settings),
  });
}

export function generateNameCandidateFromSilhouette(silhouette: NameSilhouette, settings: GenerationSettings, random: SeededRandom): NameGenerationCandidate {
  const soundProfile = compileSoundProfileFromSettings(settings, silhouette);
  const sound = generateSound(soundProfile, random);
  const rankedSpellings = generateRankedSpellings(sound, soundProfile, { maxCandidates: 12 });
  const [selectedSpelling] = rankedSpellings;

  if (!selectedSpelling) {
    throw new Error(`Expected at least one spelling candidate for ${sound.id}.`);
  }

  return { sound, rankedSpellings, selectedSpelling };
}

export function generateNameFromSilhouette(silhouette: NameSilhouette, pack: StylePack, settings: GenerationSettings, random: SeededRandom, index: number): GeneratedName {
  const candidate = generateNameCandidateFromSilhouette(silhouette, settings, random);
  const baseName = candidate.selectedSpelling.text;
  const scores = scoreName(baseName, silhouette, pack, settings);
  const variants = generateVariants(baseName, pack, settings);

  return {
    id: `name-${index + 1}-${baseName.toLowerCase()}`,
    name: baseName,
    sound: candidate.sound,
    spelling: candidate.selectedSpelling,
    silhouette,
    scores,
    variants,
    roleInfluence: silhouette.roleInfluence,
    readabilityDiagnostics: diagnoseNameReadability(baseName),
  };
}
