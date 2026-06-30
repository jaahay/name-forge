import type { SoundCandidate } from './soundGenerator';
import type { SoundProfile } from './soundProfile';
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
  readonly soundProfile: SoundProfile;
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

function spellingDistinctivenessFor(settings: GenerationSettings): StyleInput['distinctiveness'] {
  const orthographicWeirdness = clamp(settings.orthographicWeirdness);
  if (orthographicWeirdness < 0.38) return 'familiar';
  if (orthographicWeirdness > 0.62) return 'distinctive';
  return 'balanced';
}

function compileSoundProfileFromSettings(settings: GenerationSettings, silhouette: NameSilhouette): SoundProfile {
  return compileStyle({
    feel: feelFor(silhouette),
    length: silhouette.targetLength,
    distinctiveness: spellingDistinctivenessFor(settings),
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

  return { soundProfile, sound, rankedSpellings, selectedSpelling };
}

export function generateNameFromSilhouette(silhouette: NameSilhouette, pack: StylePack, settings: GenerationSettings, random: SeededRandom, index: number): GeneratedName {
  const candidate = generateNameCandidateFromSilhouette(silhouette, settings, random);
  const baseName = candidate.selectedSpelling.text;
  const scores = scoreName(baseName, silhouette, pack, settings);
  const variants = generateVariants(baseName, pack, settings);

  return {
    id: `name-${index + 1}-${baseName.toLowerCase()}`,
    name: baseName,
    soundProfile: candidate.soundProfile,
    sound: candidate.sound,
    spelling: candidate.selectedSpelling,
    spellingCandidates: candidate.rankedSpellings,
    silhouette,
    scores,
    variants,
    roleInfluence: silhouette.roleInfluence,
    readabilityDiagnostics: diagnoseNameReadability(baseName),
  };
}
