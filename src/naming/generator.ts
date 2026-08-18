import { selectRankedSpellingCandidate } from '../engine/candidateSelection';
import { diagnoseNameReadability } from '../engine/diagnostics';
import { clamp, createSeededRandom, type SeededRandom } from '../engine/random';
import { scoreName } from '../engine/scoring';
import { generateSound, type SoundCandidate } from '../engine/soundGenerator';
import type { SoundProfile } from '../engine/soundProfile';
import { generateRankedSpellingCandidates, type RankedSpellingCandidate, type RankedSpellingCandidateList } from '../engine/spellingGenerator';
import { createNameGenerationPlan } from '../engine/nameGenerationPlan';
import type { GeneratedName, NameGenerationPlan, NameGenerationPlanPreferences, NameGenerationSettings, StylePack } from '../engine/types';
import { generateVariants } from '../engine/variants';
import { compileStyle, type StyleInput } from '../styleCompilation/styleCompiler';

export interface GenerateNameOptions {
  readonly settings: NameGenerationSettings;
  readonly pack: StylePack;
  readonly seed: string;
  readonly index: number;
  readonly planningSettings?: NameGenerationSettings;
  readonly planningPreferences?: NameGenerationPlanPreferences;
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

function spellingDistinctivenessFor(settings: NameGenerationSettings): StyleInput['distinctiveness'] {
  const orthographicWeirdness = clamp(settings.orthographicWeirdness);
  if (orthographicWeirdness < 0.38) return 'familiar';
  if (orthographicWeirdness > 0.62) return 'distinctive';
  return 'balanced';
}

function compileSoundProfileForName(settings: NameGenerationSettings, plan: NameGenerationPlan): SoundProfile {
  return compileStyle({
    feel: feelFor(plan),
    length: plan.targetLength,
    distinctiveness: spellingDistinctivenessFor(settings),
  });
}

function generateNameCandidate(plan: NameGenerationPlan, settings: NameGenerationSettings, random: SeededRandom): NameGenerationCandidate {
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

function materializeGeneratedName(plan: NameGenerationPlan, pack: StylePack, settings: NameGenerationSettings, random: SeededRandom, index: number): GeneratedName {
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
    generationPlan: plan,
    scores,
    variants,
    readabilityDiagnostics: diagnoseNameReadability(baseName),
  };
}

export function generateName(options: GenerateNameOptions): GeneratedName {
  const planningSettings = options.planningSettings ?? options.settings;
  const planningRandom = createSeededRandom(`${options.seed}:planning`);
  const generationRandom = createSeededRandom(`${options.seed}:generation`);
  const plan = createNameGenerationPlan(
    planningSettings,
    options.pack,
    planningRandom,
    options.index,
    options.planningPreferences,
  );

  return materializeGeneratedName(
    plan,
    options.pack,
    options.settings,
    generationRandom,
    options.index,
  );
}
