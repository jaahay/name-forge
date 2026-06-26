import type { SoundCandidate } from './soundGenerator';
import { getSoundSegment, type SoundSegmentId } from './starterSoundInventory';

export type SpellingCandidateContract = 'SpellingCandidate';
export type SpellingSegmentRole = 'onset' | 'nucleus' | 'coda';

export interface SpellingCandidateOptions {
  readonly maxCandidates?: number;
}

export interface SpellingSegmentMapping {
  readonly segmentIndex: number;
  readonly segmentId: SoundSegmentId;
  readonly syllableIndex: number;
  readonly syllableRole: SpellingSegmentRole;
  readonly text: string;
  readonly start: number;
  readonly end: number;
}

export interface SpellingCandidate {
  readonly contract: SpellingCandidateContract;
  readonly version: 1;
  readonly id: string;
  readonly soundCandidateId: string;
  readonly profileId: string;
  readonly sequenceId: string;
  readonly text: string;
  readonly score: number;
  readonly mappings: readonly SpellingSegmentMapping[];
}

interface SpellingRule {
  readonly text: string;
  readonly weight: number;
}

interface PartialSpellingCandidate {
  readonly text: string;
  readonly score: number;
  readonly mappings: readonly SpellingSegmentMapping[];
}

const spellingRules: Record<SoundSegmentId, readonly SpellingRule[]> = {
  p: [{ text: 'p', weight: 1 }],
  b: [{ text: 'b', weight: 1 }],
  t: [{ text: 't', weight: 1 }],
  d: [{ text: 'd', weight: 1 }],
  k: [
    { text: 'k', weight: 1 },
    { text: 'c', weight: 0.72 },
  ],
  g: [{ text: 'g', weight: 1 }],
  f: [{ text: 'f', weight: 1 }],
  v: [{ text: 'v', weight: 1 }],
  th: [{ text: 'th', weight: 1 }],
  dh: [{ text: 'th', weight: 0.82 }],
  s: [{ text: 's', weight: 1 }],
  z: [{ text: 'z', weight: 1 }],
  sh: [{ text: 'sh', weight: 1 }],
  zh: [
    { text: 'zh', weight: 0.88 },
    { text: 'j', weight: 0.54 },
  ],
  h: [{ text: 'h', weight: 1 }],
  ch: [{ text: 'ch', weight: 1 }],
  j: [
    { text: 'j', weight: 1 },
    { text: 'g', weight: 0.55 },
  ],
  m: [{ text: 'm', weight: 1 }],
  n: [{ text: 'n', weight: 1 }],
  ng: [{ text: 'ng', weight: 1 }],
  l: [{ text: 'l', weight: 1 }],
  r: [{ text: 'r', weight: 1 }],
  w: [{ text: 'w', weight: 0.95 }],
  y: [{ text: 'y', weight: 0.95 }],
  i: [
    { text: 'i', weight: 1 },
    { text: 'ee', weight: 0.72 },
  ],
  ih: [{ text: 'i', weight: 1 }],
  e: [
    { text: 'e', weight: 1 },
    { text: 'ee', weight: 0.56 },
  ],
  eh: [{ text: 'e', weight: 1 }],
  ae: [
    { text: 'a', weight: 1 },
    { text: 'ae', weight: 0.5 },
  ],
  schwa: [
    { text: 'a', weight: 0.92 },
    { text: 'e', weight: 0.74 },
  ],
  uh: [{ text: 'u', weight: 0.95 }],
  a: [
    { text: 'a', weight: 1.02 },
    { text: 'ah', weight: 0.68 },
  ],
  aa: [
    { text: 'a', weight: 0.96 },
    { text: 'ah', weight: 0.74 },
  ],
  ao: [
    { text: 'o', weight: 0.92 },
    { text: 'au', weight: 0.6 },
  ],
  o: [
    { text: 'o', weight: 1.05 },
    { text: 'oh', weight: 0.72 },
    { text: 'oe', weight: 0.38 },
  ],
  uhRounded: [
    { text: 'u', weight: 0.9 },
    { text: 'oo', weight: 0.62 },
  ],
  u: [
    { text: 'u', weight: 1 },
    { text: 'oo', weight: 0.74 },
    { text: 'ou', weight: 0.52 },
  ],
  er: [
    { text: 'er', weight: 1 },
    { text: 'ir', weight: 0.58 },
    { text: 'ur', weight: 0.5 },
  ],
  ey: [
    { text: 'ay', weight: 1 },
    { text: 'ai', weight: 0.78 },
    { text: 'ey', weight: 0.68 },
  ],
  ay: [
    { text: 'ay', weight: 1.05 },
    { text: 'ai', weight: 0.82 },
    { text: 'y', weight: 0.55 },
  ],
  oy: [
    { text: 'oy', weight: 1 },
    { text: 'oi', weight: 0.75 },
  ],
  ow: [
    { text: 'ow', weight: 1 },
    { text: 'ou', weight: 0.72 },
  ],
  aw: [
    { text: 'aw', weight: 1 },
    { text: 'au', weight: 0.68 },
  ],
};

function getRules(segmentId: SoundSegmentId): readonly SpellingRule[] {
  return spellingRules[segmentId] ?? [{ text: getSoundSegment(segmentId).id, weight: 0.1 }];
}

function roundScore(score: number): number {
  return Math.round(score * 1000) / 1000;
}

function sanitizeMaxCandidates(maxCandidates: number | undefined): number | undefined {
  if (maxCandidates === undefined || !Number.isFinite(maxCandidates)) return undefined;

  return Math.max(1, Math.floor(maxCandidates));
}

function capitalizeName(text: string): string {
  return text.length === 0 ? text : `${text[0].toUpperCase()}${text.slice(1)}`;
}

function spellingKey(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

function resolveSegmentRole(sound: SoundCandidate, segmentIndex: number): Pick<SpellingSegmentMapping, 'syllableIndex' | 'syllableRole'> {
  const syllableIndex = sound.sequence.syllables.findIndex(
    (syllable) => segmentIndex >= syllable.start && segmentIndex < syllable.end,
  );
  const syllable = sound.sequence.syllables[syllableIndex];

  if (syllable?.onset.includes(segmentIndex)) return { syllableIndex, syllableRole: 'onset' };
  if (syllable?.coda.includes(segmentIndex)) return { syllableIndex, syllableRole: 'coda' };

  return { syllableIndex, syllableRole: 'nucleus' };
}

function sortCandidates(candidates: readonly PartialSpellingCandidate[]): PartialSpellingCandidate[] {
  return [...candidates].sort((left, right) => right.score - left.score || left.text.localeCompare(right.text));
}

function materializeCandidate(sound: SoundCandidate, candidate: PartialSpellingCandidate): SpellingCandidate {
  const text = capitalizeName(candidate.text);
  const mappings = candidate.mappings.map((mapping) => ({
    ...mapping,
    text: text.slice(mapping.start, mapping.end),
  }));

  return {
    contract: 'SpellingCandidate',
    version: 1,
    id: `spelling-candidate:${sound.id}:${spellingKey(text)}`,
    soundCandidateId: sound.id,
    profileId: sound.profileId,
    sequenceId: sound.sequence.id,
    text,
    score: roundScore(candidate.score),
    mappings,
  };
}

export function enumerateSpellings(
  sound: SoundCandidate,
  options: SpellingCandidateOptions = {},
): readonly SpellingCandidate[] {
  const maxCandidates = sanitizeMaxCandidates(options.maxCandidates);
  let candidates: readonly PartialSpellingCandidate[] = [{ text: '', score: 0, mappings: [] }];

  sound.sequence.segments.forEach((segmentId, segmentIndex) => {
    const segmentRole = resolveSegmentRole(sound, segmentIndex);
    candidates = candidates.flatMap((candidate) =>
      getRules(segmentId).map((rule): PartialSpellingCandidate => {
        const start = candidate.text.length;
        const end = start + rule.text.length;

        return {
          text: `${candidate.text}${rule.text}`,
          score: candidate.score + rule.weight,
          mappings: [
            ...candidate.mappings,
            {
              segmentIndex,
              segmentId,
              ...segmentRole,
              text: rule.text,
              start,
              end,
            },
          ],
        };
      }),
    );
  });

  const deduped = new Map<string, PartialSpellingCandidate>();
  for (const candidate of candidates) {
    const key = capitalizeName(candidate.text);
    const existing = deduped.get(key);
    if (!existing || candidate.score > existing.score) {
      deduped.set(key, candidate);
    }
  }

  const sorted = sortCandidates([...deduped.values()]);
  const bounded = maxCandidates === undefined ? sorted : sorted.slice(0, maxCandidates);

  return bounded.map((candidate) => materializeCandidate(sound, candidate));
}
