import type { NameArtifact } from './nameArtifact';
import type { SyllableStress } from './soundGenerator';
import type { SoundProfileCadence } from './soundProfile';
import type { SoundSegmentId } from './starterSoundInventory';

export interface NameArtifactStructureAnalysis {
  readonly segmentCount: number;
  readonly syllableCount: number;
  readonly syllableShapes: readonly string[];
  readonly stressPattern: readonly string[];
  readonly cadence?: string;
}

export interface NameArtifactSpellingAnalysis {
  readonly candidateCount: number;
  readonly selectedRank: number;
  readonly selectedText: string;
  readonly runnerUpText?: string;
  readonly selectionSummary: string;
}

export interface NameArtifactReadabilityAnalysis {
  readonly noticeCount: number;
  readonly warningCount: number;
  readonly diagnosticCount: number;
}

export interface NameArtifactAnalysis {
  readonly structure?: NameArtifactStructureAnalysis;
  readonly spelling?: NameArtifactSpellingAnalysis;
  readonly readability: NameArtifactReadabilityAnalysis;
}

export type NameArtifactCollisionKind =
  | 'exact-text'
  | 'shared-initial'
  | 'shared-ending'
  | 'near-spelling'
  | 'shared-cadence';

export interface NameArtifactCollision {
  readonly kind: NameArtifactCollisionKind;
  readonly artifactIds: readonly [string, string];
  readonly displayTexts: readonly [string, string];
  readonly evidence: string;
}

interface NameArtifactSoundRelationshipBase {
  readonly artifactIds: readonly [string, string];
  readonly displayTexts: readonly [string, string];
  readonly evidence: string;
}

export type NameArtifactSoundEdit =
  | {
    readonly kind: 'insertion';
    readonly index: number;
    readonly segment: SoundSegmentId;
  }
  | {
    readonly kind: 'deletion';
    readonly index: number;
    readonly segment: SoundSegmentId;
  }
  | {
    readonly kind: 'substitution';
    readonly index: number;
    readonly leftSegment: SoundSegmentId;
    readonly rightSegment: SoundSegmentId;
  };

export type NameArtifactSoundRelationship =
  | (NameArtifactSoundRelationshipBase & {
    readonly kind: 'identical-sound';
    readonly details: {
      readonly segments: readonly SoundSegmentId[];
    };
  })
  | (NameArtifactSoundRelationshipBase & {
    readonly kind: 'one-segment-edit';
    readonly details: {
      readonly leftSegments: readonly SoundSegmentId[];
      readonly rightSegments: readonly SoundSegmentId[];
      readonly edit: NameArtifactSoundEdit;
    };
  })
  | (NameArtifactSoundRelationshipBase & {
    readonly kind: 'shared-onset';
    readonly details: {
      readonly segments: readonly SoundSegmentId[];
    };
  })
  | (NameArtifactSoundRelationshipBase & {
    readonly kind: 'shared-final-syllable';
    readonly details: {
      readonly segments: readonly SoundSegmentId[];
    };
  })
  | (NameArtifactSoundRelationshipBase & {
    readonly kind: 'shared-coda';
    readonly details: {
      readonly segments: readonly SoundSegmentId[];
    };
  })
  | (NameArtifactSoundRelationshipBase & {
    readonly kind: 'matching-cadence-pattern';
    readonly details: {
      readonly cadence: SoundProfileCadence;
      readonly stressPattern: readonly SyllableStress[];
    };
  });

export type NameArtifactSoundRelationshipKind = NameArtifactSoundRelationship['kind'];

export interface NameArtifactSetAnalysis {
  readonly artifactCount: number;
  readonly repeatedInitials: number;
  readonly repeatedEndings: number;
  readonly repeatedCadences: number;
  readonly exactDuplicateCount: number;
  readonly nearSpellingPairCount: number;
  readonly collisions: readonly NameArtifactCollision[];
  readonly soundRelationships: readonly NameArtifactSoundRelationship[];
}

function normalizeText(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '');
}

function initialKey(value: string): string {
  return normalizeText(value).charAt(0);
}

function endingKey(value: string): string {
  const normalized = normalizeText(value);
  return normalized.slice(Math.max(0, normalized.length - 2));
}

function cadenceKey(artifact: NameArtifact): string | undefined {
  const plan = artifact.generationPlan;
  if (!plan) return undefined;
  return `${plan.stressPattern}:${plan.syllableCount}:${plan.rhythm}`;
}

function countRepeated(values: readonly string[]): number {
  const seen = new Set<string>();
  let repeated = 0;
  for (const value of values.filter(Boolean)) {
    if (seen.has(value)) repeated += 1;
    seen.add(value);
  }
  return repeated;
}

function editDistance<T>(left: readonly T[], right: readonly T[]): number {
  const previous = Array.from({ length: right.length + 1 }, (_, index) => index);
  for (let leftIndex = 1; leftIndex <= left.length; leftIndex += 1) {
    const current = [leftIndex];
    for (let rightIndex = 1; rightIndex <= right.length; rightIndex += 1) {
      const substitutionCost = left[leftIndex - 1] === right[rightIndex - 1] ? 0 : 1;
      current[rightIndex] = Math.min(
        current[rightIndex - 1] + 1,
        previous[rightIndex] + 1,
        previous[rightIndex - 1] + substitutionCost,
      );
    }
    previous.splice(0, previous.length, ...current);
  }
  return previous[right.length];
}

function arraysEqual<T>(left: readonly T[], right: readonly T[]): boolean {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

function firstDifferenceIndex<T>(left: readonly T[], right: readonly T[]): number {
  const sharedLength = Math.min(left.length, right.length);
  for (let index = 0; index < sharedLength; index += 1) {
    if (left[index] !== right[index]) return index;
  }
  return sharedLength;
}

function findSingleSegmentEdit(
  left: readonly SoundSegmentId[],
  right: readonly SoundSegmentId[],
): NameArtifactSoundEdit | undefined {
  if (left.length === right.length) {
    const index = firstDifferenceIndex(left, right);
    if (index >= left.length || !arraysEqual(left.slice(index + 1), right.slice(index + 1))) return undefined;
    return {
      kind: 'substitution',
      index,
      leftSegment: left[index],
      rightSegment: right[index],
    };
  }

  if (right.length === left.length + 1) {
    const index = firstDifferenceIndex(left, right);
    if (!arraysEqual(left.slice(index), right.slice(index + 1))) return undefined;
    return { kind: 'insertion', index, segment: right[index] };
  }

  if (left.length === right.length + 1) {
    const index = firstDifferenceIndex(left, right);
    if (!arraysEqual(left.slice(index + 1), right.slice(index))) return undefined;
    return { kind: 'deletion', index, segment: left[index] };
  }

  return undefined;
}

function indexedSegments(
  artifact: NameArtifact,
  indexes: readonly number[],
): readonly SoundSegmentId[] | undefined {
  const segments = artifact.sound?.sequence.segments;
  if (!segments || indexes.length === 0) return undefined;
  return indexes.map((index) => segments[index]);
}

function firstOnset(artifact: NameArtifact): readonly SoundSegmentId[] | undefined {
  const firstSyllable = artifact.sound?.sequence.syllables[0];
  return firstSyllable ? indexedSegments(artifact, firstSyllable.onset) : undefined;
}

function finalSyllable(artifact: NameArtifact): readonly SoundSegmentId[] | undefined {
  const sound = artifact.sound;
  const syllables = sound?.sequence.syllables;
  const final = syllables?.[syllables.length - 1];
  if (!sound || !final || final.end <= final.start) return undefined;
  return sound.sequence.segments.slice(final.start, final.end);
}

function finalCoda(artifact: NameArtifact): readonly SoundSegmentId[] | undefined {
  const syllables = artifact.sound?.sequence.syllables;
  const final = syllables?.[syllables.length - 1];
  return final ? indexedSegments(artifact, final.coda) : undefined;
}

function soundCadencePattern(artifact: NameArtifact): {
  readonly cadence: SoundProfileCadence;
  readonly stressPattern: readonly SyllableStress[];
} | undefined {
  const sound = artifact.sound;
  if (!sound) return undefined;
  return {
    cadence: sound.cadence,
    stressPattern: sound.sequence.syllables.map((syllable) => syllable.stress),
  };
}

function formatSegments(segments: readonly SoundSegmentId[]): string {
  return `[${segments.join(' ')}]`;
}

function describeEdit(edit: NameArtifactSoundEdit): string {
  if (edit.kind === 'substitution') {
    return `one substitution at index ${edit.index} (${edit.leftSegment} -> ${edit.rightSegment})`;
  }
  return `one ${edit.kind} at index ${edit.index} (${edit.segment})`;
}

function pairIdentity(left: NameArtifact, right: NameArtifact): {
  readonly artifactIds: readonly [string, string];
  readonly displayTexts: readonly [string, string];
} {
  return {
    artifactIds: [left.id, right.id],
    displayTexts: [left.spelling.text, right.spelling.text],
  };
}

function analyzeSoundPair(left: NameArtifact, right: NameArtifact): readonly NameArtifactSoundRelationship[] {
  const leftSegments = left.sound?.sequence.segments;
  const rightSegments = right.sound?.sequence.segments;
  if (!leftSegments || !rightSegments) return [];

  const identity = pairIdentity(left, right);
  if (arraysEqual(leftSegments, rightSegments)) {
    return [{
      kind: 'identical-sound',
      ...identity,
      details: { segments: [...leftSegments] },
      evidence: `Modeled segment sequences are identical: ${formatSegments(leftSegments)}.`,
    }];
  }

  const relationships: NameArtifactSoundRelationship[] = [];
  const edit = findSingleSegmentEdit(leftSegments, rightSegments);
  if (edit) {
    relationships.push({
      kind: 'one-segment-edit',
      ...identity,
      details: {
        leftSegments: [...leftSegments],
        rightSegments: [...rightSegments],
        edit,
      },
      evidence: `Modeled segment sequences differ by ${describeEdit(edit)}: ${formatSegments(leftSegments)} vs ${formatSegments(rightSegments)}.`,
    });
  }

  const leftOnset = firstOnset(left);
  const rightOnset = firstOnset(right);
  if (leftOnset && rightOnset && arraysEqual(leftOnset, rightOnset)) {
    relationships.push({
      kind: 'shared-onset',
      ...identity,
      details: { segments: [...leftOnset] },
      evidence: `First-syllable onsets are identical: ${formatSegments(leftOnset)}.`,
    });
  }

  const leftFinalSyllable = finalSyllable(left);
  const rightFinalSyllable = finalSyllable(right);
  if (leftFinalSyllable && rightFinalSyllable && arraysEqual(leftFinalSyllable, rightFinalSyllable)) {
    relationships.push({
      kind: 'shared-final-syllable',
      ...identity,
      details: { segments: [...leftFinalSyllable] },
      evidence: `Final modeled syllables are identical: ${formatSegments(leftFinalSyllable)}.`,
    });
  } else {
    const leftCoda = finalCoda(left);
    const rightCoda = finalCoda(right);
    if (leftCoda && rightCoda && arraysEqual(leftCoda, rightCoda)) {
      relationships.push({
        kind: 'shared-coda',
        ...identity,
        details: { segments: [...leftCoda] },
        evidence: `Final-syllable codas are identical: ${formatSegments(leftCoda)}.`,
      });
    }
  }

  const leftCadence = soundCadencePattern(left);
  const rightCadence = soundCadencePattern(right);
  if (
    leftCadence
    && rightCadence
    && leftCadence.cadence === rightCadence.cadence
    && arraysEqual(leftCadence.stressPattern, rightCadence.stressPattern)
  ) {
    relationships.push({
      kind: 'matching-cadence-pattern',
      ...identity,
      details: {
        cadence: leftCadence.cadence,
        stressPattern: [...leftCadence.stressPattern],
      },
      evidence: `Modeled cadence and syllable stress pattern are identical: ${leftCadence.cadence}:${leftCadence.stressPattern.join(',')}.`,
    });
  }

  return relationships;
}

function sameSpellingCandidate(
  left: NonNullable<NameArtifact['spelling']>,
  right: NonNullable<NameArtifact['spelling']>,
): boolean {
  return left.text === right.text && left.rank === right.rank && left.score === right.score;
}

export function analyzeNameArtifact(artifact: NameArtifact): NameArtifactAnalysis {
  const sequence = artifact.sound?.sequence;
  const spellingCandidates = artifact.spellingCandidates ?? [];
  const selectedSpelling = artifact.spelling;
  const selectedCandidateIndex = selectedSpelling
    ? spellingCandidates.findIndex((candidate) => sameSpellingCandidate(candidate, selectedSpelling))
    : -1;
  const runnerUp = spellingCandidates.find((candidate) => !selectedSpelling || !sameSpellingCandidate(candidate, selectedSpelling));
  const diagnostics = artifact.readabilityDiagnostics ?? [];

  const structure = sequence ? {
    segmentCount: sequence.segments.length,
    syllableCount: sequence.syllables.length,
    syllableShapes: sequence.syllables.map((syllable) => syllable.shape),
    stressPattern: sequence.syllables.map((syllable) => syllable.stress),
    ...(artifact.sound?.cadence === undefined ? {} : { cadence: artifact.sound.cadence }),
  } : undefined;

  const spelling = selectedSpelling ? {
    candidateCount: spellingCandidates.length,
    selectedRank: selectedCandidateIndex >= 0 ? selectedCandidateIndex + 1 : selectedSpelling.rank,
    selectedText: selectedSpelling.text,
    ...(runnerUp === undefined ? {} : { runnerUpText: runnerUp.text }),
    selectionSummary: spellingCandidates.length > 1
      ? `${selectedSpelling.text} ranked first of ${spellingCandidates.length} retained spellings under the current deterministic spelling rules.`
      : `${selectedSpelling.text} is the retained spelling under the current deterministic spelling rules.`,
  } : undefined;

  return {
    ...(structure === undefined ? {} : { structure }),
    ...(spelling === undefined ? {} : { spelling }),
    readability: {
      noticeCount: diagnostics.filter((diagnostic) => diagnostic.severity === 'notice').length,
      warningCount: diagnostics.filter((diagnostic) => diagnostic.severity === 'warning').length,
      diagnosticCount: diagnostics.length,
    },
  };
}

/**
 * Compares the artifacts exactly as supplied. Callers that present these records as
 * same-roster evidence must pass artifacts from one explicit roster snapshot;
 * this pure helper intentionally does not infer or validate snapshot provenance.
 */
export function analyzeNameArtifactSoundRelationships(
  artifacts: readonly NameArtifact[],
): readonly NameArtifactSoundRelationship[] {
  const relationships: NameArtifactSoundRelationship[] = [];
  for (let leftIndex = 0; leftIndex < artifacts.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < artifacts.length; rightIndex += 1) {
      relationships.push(...analyzeSoundPair(artifacts[leftIndex], artifacts[rightIndex]));
    }
  }
  return relationships;
}

export function analyzeNameArtifactSet(artifacts: readonly NameArtifact[]): NameArtifactSetAnalysis {
  const collisions: NameArtifactCollision[] = [];

  for (let leftIndex = 0; leftIndex < artifacts.length; leftIndex += 1) {
    const left = artifacts[leftIndex];
    for (let rightIndex = leftIndex + 1; rightIndex < artifacts.length; rightIndex += 1) {
      const right = artifacts[rightIndex];
      const ids: readonly [string, string] = [left.id, right.id];
      const displayTexts: readonly [string, string] = [left.spelling.text, right.spelling.text];
      const leftText = normalizeText(left.spelling.text);
      const rightText = normalizeText(right.spelling.text);

      if (leftText && leftText === rightText) {
        collisions.push({ kind: 'exact-text', artifactIds: ids, displayTexts, evidence: 'Normalized display text is identical.' });
      } else if (leftText && rightText && editDistance([...leftText], [...rightText]) === 1) {
        collisions.push({ kind: 'near-spelling', artifactIds: ids, displayTexts, evidence: 'Normalized display text differs by one insertion, deletion, or substitution.' });
      }

      const leftInitial = initialKey(left.spelling.text);
      const rightInitial = initialKey(right.spelling.text);
      if (leftInitial && leftInitial === rightInitial) {
        collisions.push({ kind: 'shared-initial', artifactIds: ids, displayTexts, evidence: `Both names begin with ${leftInitial.toUpperCase()}.` });
      }

      const leftEnding = endingKey(left.spelling.text);
      const rightEnding = endingKey(right.spelling.text);
      if (leftEnding && leftEnding === rightEnding) {
        collisions.push({ kind: 'shared-ending', artifactIds: ids, displayTexts, evidence: `Both normalized names end in "${leftEnding}".` });
      }

      const leftCadence = cadenceKey(left);
      const rightCadence = cadenceKey(right);
      if (leftCadence && leftCadence === rightCadence) {
        collisions.push({ kind: 'shared-cadence', artifactIds: ids, displayTexts, evidence: 'Stress pattern, syllable count, and rhythm are identical.' });
      }
    }
  }

  return {
    artifactCount: artifacts.length,
    repeatedInitials: countRepeated(artifacts.map((artifact) => initialKey(artifact.spelling.text))),
    repeatedEndings: countRepeated(artifacts.map((artifact) => endingKey(artifact.spelling.text))),
    repeatedCadences: countRepeated(artifacts.map((artifact) => cadenceKey(artifact) ?? '')),
    exactDuplicateCount: collisions.filter((collision) => collision.kind === 'exact-text').length,
    nearSpellingPairCount: collisions.filter((collision) => collision.kind === 'near-spelling').length,
    collisions,
    soundRelationships: analyzeNameArtifactSoundRelationships(artifacts),
  };
}