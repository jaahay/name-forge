import type { SoundCandidate } from './soundGenerator';
import type { SoundProfile, SoundProfileTexture } from './soundProfile';
import { getSoundSegment, type SoundSegmentId } from './starterSoundInventory';

export type SpellingCandidateContract = 'SpellingCandidate';
export type SpellingSegmentRole = 'onset' | 'nucleus' | 'coda';

export interface SpellingCandidateOptions {
  readonly limit?: number;
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
  readonly distinctiveness: number;
  readonly textures?: readonly SoundProfileTexture[];
}

interface PartialSpellingCandidate {
  readonly text: string;
  readonly score: number;
  readonly mappings: readonly SpellingSegmentMapping[];
}

const DEFAULT_LIMIT = 12;
const DISTINCTIVENESS_WEIGHT = 0.35;
const TEXTURE_MATCH_BONUS = 0.18;

const spellingRules: Record<SoundSegmentId, readonly SpellingRule[]> = {
  p: [{ text: 'p', weight: 1, distinctiveness: 0.2 }],
  b: [{ text: 'b', weight: 1, distinctiveness: 0.2 }],
  t: [{ text: 't', weight: 1, distinctiveness: 0.2 }],
  d: [{ text: 'd', weight: 1, distinctiveness: 0.2 }],
  k: [
    { text: 'k', weight: 1, distinctiveness: 0.45 },
    { text: 'c', weight: 0.72, distinctiveness: 0.28 },
  ],
  g: [{ text: 'g', weight: 1, distinctiveness: 0.25 }],
  f: [{ text: 'f', weight: 1, distinctiveness: 0.24, textures: ['crisp'] }],
  v: [{ text: 'v', weight: 1, distinctiveness: 0.34 }],
  th: [{ text: 'th', weight: 1, distinctiveness: 0.42 }],
  dh: [{ text: 'th', weight: 0.82, distinctiveness: 0.5 }],
  s: [{ text: 's', weight: 1, distinctiveness: 0.22, textures: ['crisp'] }],
  z: [{ text: 'z', weight: 1, distinctiveness: 0.44 }],
  sh: [{ text: 'sh', weight: 1, distinctiveness: 0.46, textures: ['soft', 'fluid'] }],
  zh: [
    { text: 'zh', weight: 0.88, distinctiveness: 0.72 },
    { text: 'j', weight: 0.54, distinctiveness: 0.58 },
  ],
  h: [{ text: 'h', weight: 1, distinctiveness: 0.26 }],
  ch: [{ text: 'ch', weight: 1, distinctiveness: 0.42, textures: ['crisp'] }],
  j: [
    { text: 'j', weight: 1, distinctiveness: 0.42 },
    { text: 'g', weight: 0.55, distinctiveness: 0.35 },
  ],
  m: [{ text: 'm', weight: 1, distinctiveness: 0.18, textures: ['soft'] }],
  n: [{ text: 'n', weight: 1, distinctiveness: 0.18, textures: ['soft'] }],
  ng: [{ text: 'ng', weight: 1, distinctiveness: 0.48 }],
  l: [{ text: 'l', weight: 1, distinctiveness: 0.24, textures: ['soft', 'fluid'] }],
  r: [{ text: 'r', weight: 1, distinctiveness: 0.32, textures: ['fluid'] }],
  w: [{ text: 'w', weight: 0.95, distinctiveness: 0.35, textures: ['soft', 'fluid'] }],
  y: [{ text: 'y', weight: 0.95, distinctiveness: 0.36, textures: ['soft', 'fluid'] }],
  i: [
    { text: 'i', weight: 1, distinctiveness: 0.32 },
    { text: 'ee', weight: 0.72, distinctiveness: 0.44 },
  ],
  ih: [{ text: 'i', weight: 1, distinctiveness: 0.24 }],
  e: [
    { text: 'e', weight: 1, distinctiveness: 0.3 },
    { text: 'ee', weight: 0.56, distinctiveness: 0.45 },
  ],
  eh: [{ text: 'e', weight: 1, distinctiveness: 0.28 }],
  ae: [
    { text: 'a', weight: 1, distinctiveness: 0.3 },
    { text: 'ae', weight: 0.5, distinctiveness: 0.72 },
  ],
  schwa: [
    { text: 'a', weight: 0.92, distinctiveness: 0.18 },
    { text: 'e', weight: 0.74, distinctiveness: 0.22 },
  ],
  uh: [{ text: 'u', weight: 0.95, distinctiveness: 0.3 }],
  a: [
    { text: 'a', weight: 1.02, distinctiveness: 0.34 },
    { text: 'ah', weight: 0.68, distinctiveness: 0.56 },
  ],
  aa: [
    { text: 'a', weight: 0.96, distinctiveness: 0.32 },
    { text: 'ah', weight: 0.74, distinctiveness: 0.54 },
  ],
  ao: [
    { text: 'o', weight: 0.92, distinctiveness: 0.34 },
    { text: 'au', weight: 0.6, distinctiveness: 0.58 },
  ],
  o: [
    { text: 'o', weight: 1.05, distinctiveness: 0.35 },
    { text: 'oh', weight: 0.72, distinctiveness: 0.6 },
    { text: 'oe', weight: 0.38, distinctiveness: 0.75 },
  ],
  uhRounded: [
    { text: 'u', weight: 0.9, distinctiveness: 0.34 },
    { text: 'oo', weight: 0.62, distinctiveness: 0.48 },
  ],
  u: [
    { text: 'u', weight: 1, distinctiveness: 0.34 },
    { text: 'oo', weight: 0.74, distinctiveness: 0.46 },
    { text: 'ou', weight: 0.52, distinctiveness: 0.6 },
  ],
  er: [
    { text: 'er', weight: 1, distinctiveness: 0.34 },
    { text: 'ir', weight: 0.58, distinctiveness: 0.54 },
    { text: 'ur', weight: 0.5, distinctiveness: 0.58 },
  ],
  ey: [
    { text: 'ay', weight: 1, distinctiveness: 0.38 },
    { text: 'ai', weight: 0.78, distinctiveness: 0.44 },
    { text: 'ey', weight: 0.68, distinctiveness: 0.58 },
  ],
  ay: [
    { text: 'ay', weight: 1.05, distinctiveness: 0.45 },
    { text: 'ai', weight: 0.82, distinctiveness: 0.35 },
    { text: 'y', weight: 0.55, distinctiveness: 0.75 },
  ],
  oy: [
    { text: 'oy', weight: 1, distinctiveness: 0.42 },
    { text: 'oi', weight: 0.75, distinctiveness: 0.48 },
  ],
  ow: [
    { text: 'ow', weight: 1, distinctiveness: 0.42 },
    { text: 'ou', weight: 0.72, distinctiveness: 0.5 },
  ],
  aw: [
    { text: 'aw', weight: 1, distinctiveness: 0.48 },
    { text: 'au', weight: 0.68, distinctiveness: 0.56 },
  ],
};

function getRules(segmentId: SoundSegmentId): readonly SpellingRule[] {
  return spellingRules[segmentId] ?? [{ text: getSoundSegment(segmentId).id, weight: 0.1, distinctiveness: 1 }];
}

function scoreRule(rule: SpellingRule, profile: SoundProfile): number {
  const distinctivenessFit = 1 - Math.abs(profile.targets.distinctiveness - rule.distinctiveness);
  const textureBonus = rule.textures?.includes(profile.targets.texture) ? TEXTURE_MATCH_BONUS : 0;

  return rule.weight + distinctivenessFit * DISTINCTIVENESS_WEIGHT + textureBonus;
}

function roundScore(score: number): number {
  return Math.round(score * 1000) / 1000;
}

function sanitizeLimit(limit: number | undefined): number {
  if (limit === undefined) return DEFAULT_LIMIT;
  if (!Number.isFinite(limit)) return DEFAULT_LIMIT;

  return Math.max(1, Math.floor(limit));
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
  profile: SoundProfile,
  options: SpellingCandidateOptions = {},
): readonly SpellingCandidate[] {
  const limit = sanitizeLimit(options.limit);
  let candidates: readonly PartialSpellingCandidate[] = [{ text: '', score: 0, mappings: [] }];

  sound.sequence.segments.forEach((segmentId, segmentIndex) => {
    const segmentRole = resolveSegmentRole(sound, segmentIndex);
    candidates = candidates.flatMap((candidate) =>
      getRules(segmentId).map((rule): PartialSpellingCandidate => {
        const start = candidate.text.length;
        const end = start + rule.text.length;

        return {
          text: `${candidate.text}${rule.text}`,
          score: candidate.score + scoreRule(rule, profile),
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

  return sortCandidates([...deduped.values()])
    .slice(0, limit)
    .map((candidate) => materializeCandidate(sound, candidate));
}
