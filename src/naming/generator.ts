import { selectRankedSpellingCandidate } from '../engine/candidateSelection';
import type { SoundCandidate } from '../engine/soundGenerator';
import type { SoundProfile } from '../engine/soundProfile';
import type { RankedSpellingCandidate, RankedSpellingCandidateList } from '../engine/spellingGenerator';
import type { CastRoleAssignment, GeneratedName, GenerationSettings, NameGenerationPlan, StylePack } from '../engine/types';
import type { SeededRandom } from '../engine/random';
import { diagnoseNameReadability } from '../engine/diagnostics';
import { clamp } from '../engine/random';
import { scoreName } from '../engine/scoring';
import { generateSound } from '../engine/soundGenerator';
import { createNameSilhouette } from '../engine/silhouettes';
import type { StyleInput } from '../styleCompilation/styleCompiler';
import { compileStyle } from '../styleCompilation/styleCompiler';
import { generateRankedSpellingCandidates } from '../engine/spellingGenerator';
import { generateVariants } from '../engine/variants';

export interface GenerateNameOptions {
  readonly settings: GenerationSettings;
  readonly pack: StylePack;
  readonly planningRandom: SeededRandom;
  readonly generationRandom: SeededRandom;
  readonly index: number;
  readonly role?: CastRoleAssignment;
  readonly planningSettings?: GenerationSettings;
}

interface NameGenerationCandidate {
  readonly soundProfile: SoundProfile;
  readonly sound: SoundCandidate;
  readonly rankedSpellings: RankedSpellingCandidateList;
  readonly selectedSpelling: RankedSpellingCandidate;
}

function feelFor(plan: NameGenerationPlan): StyleInput['feel'] {
  if (plan.texture === 'soft') return 'gentle';
  if (plan.texture === 'hard') return 'strong';
  if (plan.texture === 'liquid') return 'lyrical';
  return 'balanced';
}

function spellingDistinctivenessFor(settings: GenerationSettings): StyleInput['distinctiveness'] {
  const orthographicWeirdness = clamp(settings.orthographicWeirdness);
  if (orthographicWeirdness < 0.38) return 'familiar';
  if (orthographicWeirdness > 0.62) return 'distinctive';
  return 'balanced';
}

function compileSoundProfileForName(settings: GenerationSettings, plan: NameGenerationPlan): SoundProfile {
  return compileStyle({
    feel: feelFor(plan),
    length: plan.targetLength,
    distinctiveness: spellingDistinctivenessFor(settings),
  });
}

function generateNameCandidate(plan: NameGenerationPlan, settings: GenerationSettings, random: SeededRandom): NameGenerationCandidate {
  const soundProfile = compileSoundProfileForName(settings, plan);
  const sound = generateSound(soundProfile, random);
  const rankedSpellings = generateRankedSpellingCandidates(sound, soundProfile);
  const selection = selectRankedSpellingCandidate(rankedSpellings.candidates, settings);
  const selectedSpelling = selection?.candidate;

  if (!selectedSpelling) {
    throw new Error('Expected at least one spelling candidate for the generated sound.');
  }

  return { soundProfile, sound, rankedSpellings, selectedSpelling };
}

function materializeGeneratedName(plan: NameGenerationPlan, pack: StylePack, settings: GenerationSettings, random: SeededRandom, index: number): GeneratedName {
  const candidate = generateNameCandidate(plan, settings, random);
  const baseName = candidate.selectedSpelling.text;
  const scores = scoreName(baseName, plan, pack, settings);
  const variants = generateVariants(baseName, pack, settings);

  return {
    id: `name-${index + 1}-${baseName.toLowerCase()}`,
    name: baseName,
    soundProfile: candidate.soundProfile,
    sound: candidate.sound,
    spelling: candidate.selectedSpelling,
    spellingCandidates: candidate.rankedSpellings.candidates,
    silhouette: plan,
    scores,
    variants,
    roleInfluence: plan.roleInfluence,
    readabilityDiagnostics: diagnoseNameReadability(baseName),
  };
}

export function generateName(options: GenerateNameOptions): GeneratedName {
  const planningSettings = options.planningSettings ?? options.settings;
  const plan = createNameSilhouette(
    planningSettings,
    options.pack,
    options.planningRandom,
    options.index,
    options.role,
  );

  return materializeGeneratedName(
    plan,
    options.pack,
    options.settings,
    options.generationRandom,
    options.index,
  );
}
