import { selectRankedSpellingCandidate } from '../engine/candidateSelection';
import type { SoundCandidate } from '../engine/soundGenerator';
import type { SoundProfile } from '../engine/soundProfile';
import type { RankedSpellingCandidate, RankedSpellingCandidateList } from '../engine/spellingGenerator';
import type { GeneratedName, GenerationSettings, NameSilhouette, StylePack } from '../engine/types';
import type { SeededRandom } from '../engine/random';
import { diagnoseNameReadability } from '../engine/diagnostics';
import { clamp } from '../engine/random';
import { scoreName } from '../engine/scoring';
import { generateSound } from '../engine/soundGenerator';
import type { StyleInput } from '../styleCompilation/styleCompiler';
import { compileStyle } from '../styleCompilation/styleCompiler';
import { generateRankedSpellingCandidates } from '../engine/spellingGenerator';
import { generateVariants } from '../engine/variants';

export interface NameGenerationCandidate {
  readonly soundProfile: SoundProfile;
  readonly sound: SoundCandidate;
  readonly rankedSpellings: RankedSpellingCandidateList;
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

export function compileSoundProfileForName(settings: GenerationSettings, silhouette: NameSilhouette): SoundProfile {
  return compileStyle({
    feel: feelFor(silhouette),
    length: silhouette.targetLength,
    distinctiveness: spellingDistinctivenessFor(settings),
  });
}

export function generateNameCandidateFromSilhouette(silhouette: NameSilhouette, settings: GenerationSettings, random: SeededRandom): NameGenerationCandidate {
  const soundProfile = compileSoundProfileForName(settings, silhouette);
  const sound = generateSound(soundProfile, random);
  const rankedSpellings = generateRankedSpellingCandidates(sound, soundProfile);
  const selection = selectRankedSpellingCandidate(rankedSpellings.candidates, settings);
  const selectedSpelling = selection?.candidate;

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
    spellingCandidates: candidate.rankedSpellings.candidates,
    silhouette,
    scores,
    variants,
    roleInfluence: silhouette.roleInfluence,
    readabilityDiagnostics: diagnoseNameReadability(baseName),
  };
}
