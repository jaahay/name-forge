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

function selectedSpellingText(name: GeneratedName): string {
  const [primarySpelling] = name.rankedSpellings;
  return primarySpelling?.text ?? name.name;
}

export function generateNameFromSilhouette(silhouette: NameSilhouette, pack: StylePack, settings: GenerationSettings, random: SeededRandom, index: number): GeneratedName {
  const soundProfile = compileSoundProfileFromSettings(settings, silhouette);
  const sound = generateSound(soundProfile, random);
  const rankedSpellings = generateRankedSpellings(sound, soundProfile, { maxCandidates: 12 });
  const [primarySpelling] = rankedSpellings;
  const baseName = primarySpelling?.text ?? sound.transcription;
  const scores = scoreName(baseName, silhouette, pack, settings);
  const variants = generateVariants(baseName, pack, settings);
  const generatedName: GeneratedName = {
    id: `name-${index + 1}-${baseName.toLowerCase()}`,
    name: baseName,
    sound,
    rankedSpellings,
    silhouette,
    scores,
    variants,
    roleInfluence: silhouette.roleInfluence,
    readabilityDiagnostics: diagnoseNameReadability(baseName),
  };

  return { ...generatedName, name: selectedSpellingText(generatedName) };
}
