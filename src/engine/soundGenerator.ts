import type { SeededRandom } from './random';
import type { SoundProfile, SoundProfileCadence, SoundProfileTexture } from './soundProfile';
import type { SonorityClass } from './soundSegmentTypes';
import { getSoundSegment, starterSoundInventory, type SoundSegmentId } from './starterSoundInventory';
import type { WeightedValue } from './types';

export type SegmentSequenceContract = 'SegmentSequence';
export type SoundCandidateContract = 'SoundCandidate';
export type SupportedSyllableShape = 'V' | 'CV' | 'CVC' | 'CVL';
export type SyllableWeight = 'light' | 'heavy' | 'unspecified';
export type SyllableSonorityProfile = 'rising' | 'falling' | 'rise-fall' | 'flat' | 'complex' | 'unspecified';
export type SyllableStress = 'primary' | 'secondary' | 'unstressed' | 'unspecified';
export type SyllableStressSource = 'sequence' | 'cadence-rule' | 'weight-rule' | 'fallback' | 'unspecified';

export interface SegmentSyllable {
  readonly start: number;
  readonly end: number;
  readonly onset: readonly number[];
  readonly nucleus: readonly number[];
  readonly coda: readonly number[];
  readonly shape: SupportedSyllableShape;
  readonly weight: SyllableWeight;
  readonly sonorityProfile: SyllableSonorityProfile;
  readonly stress: SyllableStress;
  readonly stressSource: SyllableStressSource;
}

export interface SegmentSequence {
  readonly contract: SegmentSequenceContract;
  readonly version: 1;
  readonly id: string;
  readonly profileId: string;
  readonly segments: readonly SoundSegmentId[];
  readonly syllables: readonly SegmentSyllable[];
}

export interface SoundCandidate {
  readonly contract: SoundCandidateContract;
  readonly version: 1;
  readonly id: string;
  readonly profileId: string;
  readonly cadence: SoundProfileCadence;
  readonly sequence: SegmentSequence;
  readonly transcription: string;
}

const supportedSyllableShapes: readonly SupportedSyllableShape[] = ['V', 'CV', 'CVC', 'CVL'];
const fallbackSyllableShapes: readonly SupportedSyllableShape[] = ['CV'];
const allSegmentIds = Object.keys(starterSoundInventory) as SoundSegmentId[];
const sonorityRankByClass: Record<SonorityClass, number> = {
  obstruent: 1,
  nasal: 2,
  liquid: 3,
  glide: 4,
  vowel: 5,
};

function isSupportedSyllableShape(shape: string): shape is SupportedSyllableShape {
  return supportedSyllableShapes.includes(shape as SupportedSyllableShape);
}

function segmentHasRole(id: SoundSegmentId, role: 'onset' | 'nucleus' | 'coda'): boolean {
  return getSoundSegment(id).syllableRoles.includes(role);
}

const onsetSegmentIds = allSegmentIds.filter((id) => segmentHasRole(id, 'onset'));
const nucleusSegmentIds = allSegmentIds.filter((id) => segmentHasRole(id, 'nucleus'));
const codaSegmentIds = allSegmentIds.filter((id) => segmentHasRole(id, 'coda'));
const liquidCodaSegmentIds = codaSegmentIds.filter((id) => getSoundSegment(id).sonority === 'liquid');

function range(min: number, max: number): number[] {
  const values: number[] = [];

  for (let value = min; value <= max; value += 1) {
    values.push(value);
  }

  return values;
}

function pickSyllableCount(profile: SoundProfile, rng: SeededRandom): number {
  const target = profile.targets.syllableCount;
  const candidates = range(target.min, target.max).map((count): WeightedValue<number> => ({
    value: count,
    weight: count === target.preferred ? 4 : 1 / (Math.abs(target.preferred - count) + 1),
  }));

  return rng.pickWeighted(candidates);
}

function pickCadence(profile: SoundProfile, rng: SeededRandom): SoundProfileCadence {
  return rng.pick(profile.targets.cadences);
}

function shapeWeight(shape: SupportedSyllableShape, profile: SoundProfile): number {
  const onsetPreference = shape.startsWith('C')
    ? profile.phonotactics.onsetWeight
    : 1 - profile.phonotactics.onsetWeight;
  const onsetFactor = Math.max(0.1, onsetPreference);

  if (shape === 'V') return 0.35 * onsetFactor;
  if (shape === 'CV') return 1.8 * onsetFactor;
  if (shape === 'CVC') return (0.35 + profile.phonotactics.codaWeight * 2.5) * onsetFactor;
  return (0.25 + profile.phonotactics.liquidWeight * 3) * onsetFactor;
}

function pickSyllableShape(profile: SoundProfile, rng: SeededRandom): SupportedSyllableShape {
  const preferredShapes = profile.phonotactics.preferredSyllableShapes.filter(isSupportedSyllableShape);
  const candidateShapes = preferredShapes.length > 0 ? preferredShapes : fallbackSyllableShapes;
  const candidates = candidateShapes.map((shape): WeightedValue<SupportedSyllableShape> => ({
    value: shape,
    weight: shapeWeight(shape, profile),
  }));

  return rng.pickWeighted(candidates);
}

function textureWeight(texture: SoundProfileTexture, sonority: SonorityClass): number {
  if (texture === 'soft') {
    if (sonority === 'nasal' || sonority === 'liquid' || sonority === 'glide') return 1.55;
    return 0.75;
  }

  if (texture === 'crisp') {
    if (sonority === 'obstruent') return 1.65;
    return 0.8;
  }

  if (texture === 'fluid') {
    if (sonority === 'liquid' || sonority === 'glide' || sonority === 'vowel') return 1.7;
    if (sonority === 'nasal') return 1.15;
    return 0.7;
  }

  return 1;
}

function onsetWeight(id: SoundSegmentId, profile: SoundProfile): number {
  const segment = getSoundSegment(id);
  let weight = textureWeight(profile.targets.texture, segment.sonority);

  if (segment.sonority === 'liquid') weight += profile.phonotactics.liquidWeight * 3;
  if (segment.sonority === 'glide') weight += profile.phonotactics.glideWeight * 3;
  if (segment.sonority === 'nasal') weight += 0.45;
  if (segment.category === 'consonant' && segment.voicing === 'voiced') weight += 0.15;

  return weight;
}

function nucleusWeight(id: SoundSegmentId, profile: SoundProfile): number {
  const segment = getSoundSegment(id);
  if (segment.category !== 'vowel') return 0;

  let weight = textureWeight(profile.targets.texture, segment.sonority);

  if (segment.movement === 'diphthong') weight += profile.targets.distinctiveness * 1.4;
  if (segment.movement === 'monophthong') {
    weight += 0.65;
    if (segment.rhotic) weight += profile.targets.distinctiveness * 0.5;
  }
  if (id === 'schwa') weight += (1 - profile.targets.distinctiveness) * 0.65;

  return weight;
}

function codaWeight(id: SoundSegmentId, profile: SoundProfile): number {
  const segment = getSoundSegment(id);
  let weight = profile.phonotactics.codaWeight * textureWeight(profile.targets.texture, segment.sonority);

  if (segment.sonority === 'liquid') weight += profile.phonotactics.liquidWeight * 2.2;
  if (segment.sonority === 'nasal') weight += 0.55;
  if (segment.sonority === 'obstruent') weight += profile.phonotactics.clusterTolerance;

  return weight;
}

function pickWeightedSegment(
  ids: readonly SoundSegmentId[],
  weight: (id: SoundSegmentId) => number,
  rng: SeededRandom,
): SoundSegmentId {
  return rng.pickWeighted(ids.map((id): WeightedValue<SoundSegmentId> => ({ value: id, weight: weight(id) })));
}

function addSegment(
  segments: SoundSegmentId[],
  bucket: number[],
  id: SoundSegmentId,
): void {
  bucket.push(segments.length);
  segments.push(id);
}

function syllableSegmentIds(segments: readonly SoundSegmentId[], start: number, end: number): readonly SoundSegmentId[] {
  return segments.slice(start, end);
}

function syllableWeight(segments: readonly SoundSegmentId[], nucleus: readonly number[], coda: readonly number[]): SyllableWeight {
  if (nucleus.length === 0) return 'unspecified';
  if (coda.length > 0) return 'heavy';

  const hasHeavyNucleus = nucleus.some((index) => {
    const segmentId = segments[index];
    if (!segmentId) return false;
    const segment = getSoundSegment(segmentId);
    return segment.category === 'vowel' && (segment.movement === 'diphthong' || segment.rhotic === true);
  });

  return hasHeavyNucleus ? 'heavy' : 'light';
}

function syllableSonorityProfile(segmentIds: readonly SoundSegmentId[]): SyllableSonorityProfile {
  if (segmentIds.length === 0) return 'unspecified';
  if (segmentIds.length === 1) return 'flat';

  const ranks = segmentIds.map((segmentId) => sonorityRankByClass[getSoundSegment(segmentId).sonority]);
  const movements = ranks
    .slice(1)
    .map((rank, index) => Math.sign(rank - ranks[index]))
    .filter((movement) => movement !== 0);

  if (movements.length === 0) return 'flat';
  if (movements.every((movement) => movement > 0)) return 'rising';
  if (movements.every((movement) => movement < 0)) return 'falling';

  const changesDirectionOnce = movements.every((movement, index) => index === 0 || movement === movements[index - 1] || movement < movements[index - 1]);
  const risesThenFalls = movements[0] > 0 && movements[movements.length - 1] < 0;

  return risesThenFalls && changesDirectionOnce ? 'rise-fall' : 'complex';
}

function generateSyllable(
  shape: SupportedSyllableShape,
  profile: SoundProfile,
  rng: SeededRandom,
  segments: SoundSegmentId[],
): SegmentSyllable {
  const start = segments.length;
  const onset: number[] = [];
  const nucleus: number[] = [];
  const coda: number[] = [];

  if (shape.startsWith('C')) {
    addSegment(segments, onset, pickWeightedSegment(onsetSegmentIds, (id) => onsetWeight(id, profile), rng));
  }

  addSegment(segments, nucleus, pickWeightedSegment(nucleusSegmentIds, (id) => nucleusWeight(id, profile), rng));

  if (shape === 'CVC') {
    addSegment(segments, coda, pickWeightedSegment(codaSegmentIds, (id) => codaWeight(id, profile), rng));
  }

  if (shape === 'CVL') {
    addSegment(segments, coda, pickWeightedSegment(liquidCodaSegmentIds, (id) => codaWeight(id, profile), rng));
  }

  const end = segments.length;
  const segmentIds = syllableSegmentIds(segments, start, end);

  return {
    start,
    end,
    onset,
    nucleus,
    coda,
    shape,
    weight: syllableWeight(segments, nucleus, coda),
    sonorityProfile: syllableSonorityProfile(segmentIds),
    stress: 'unspecified',
    stressSource: 'unspecified',
  };
}

export function renderSegmentSequenceTranscription(sequence: SegmentSequence): string {
  const syllables = sequence.syllables.map((syllable) =>
    sequence.segments
      .slice(syllable.start, syllable.end)
      .map((segmentId) => getSoundSegment(segmentId).symbol)
      .join(''),
  );

  return `/${syllables.join('.')}/`;
}

export function generateSound(profile: SoundProfile, rng: SeededRandom): SoundCandidate {
  const syllableCount = pickSyllableCount(profile, rng);
  const cadence = pickCadence(profile, rng);
  const segments: SoundSegmentId[] = [];
  const syllables: SegmentSyllable[] = [];

  for (let index = 0; index < syllableCount; index += 1) {
    syllables.push(generateSyllable(pickSyllableShape(profile, rng), profile, rng, segments));
  }

  const segmentKey = segments.join('-');
  const sequence: SegmentSequence = {
    contract: 'SegmentSequence',
    version: 1,
    id: `segment-sequence:${profile.id}:${segmentKey}`,
    profileId: profile.id,
    segments,
    syllables,
  };
  const transcription = renderSegmentSequenceTranscription(sequence);

  return {
    contract: 'SoundCandidate',
    version: 1,
    id: `sound-candidate:${profile.id}:${segmentKey}`,
    profileId: profile.id,
    cadence,
    sequence,
    transcription,
  };
}
