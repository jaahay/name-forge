import type { NameArtifact } from './nameArtifact';

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

export type NameArtifactSoundRelationshipKind =
  | 'identical-sound'
  | 'one-segment-edit'
  | 'shared-onset'
  | 'shared-final-syllable'
  | 'shared-coda'
  | 'shared-cadence';

export interface NameArtifactSoundRelationship {
  readonly kind: NameArtifactSoundRelationshipKind;
  readonly artifactIds: readonly [string, string];
  readonly displayTexts: readonly [string, string];
  readonly evidence: string;
}

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
  const silhouette = artifact.silhouette;
  if (!silhouette) return undefined;
  return `${silhouette.stressPattern}:${silhouette.syllableCount}:${silhouette.rhythm}`;
}

function soundCadenceKey(artifact: NameArtifact): string | undefined {
  const sound = artifact.sound;
  if (!sound) return undefined;
  return `${sound.cadence}:${sound.sequence.syllables.map((syllable) => syllable.stress).join(',')}`;
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

function indexedSegments(artifact: NameArtifact, indexes: readonly number[]): readonly string[] | undefined {
  const segments = artifact.sound?.sequence.segments;
  if (!segments || indexes.length === 0) return undefined;
  return indexes.map((index) => segments[index]);
}

function firstOnset(artifact: NameArtifact): readonly string[] | undefined {
  const firstSyllable = artifact.sound?.sequence.syllables[0];
  return firstSyllable ? indexedSegments(artifact, firstSyllable.onset) : undefined;
}

function finalSyllable(artifact: NameArtifact): readonly string[] | undefined {
  const sound = artifact.sound;
  const syllables = sound?.sequence.syllables;
  const final = syllables?.[syllables.length - 1];
  if (!sound || !final || final.end <= final.start) return undefined;
  return sound.sequence.segments.slice(final.start, final.end);
}

function finalCoda(artifact: NameArtifact): readonly string[] | undefined {
  const syllables = artifact.sound?.sequence.syllables;
  const final = syllables?.[syllables.length - 1];
  return final ? indexedSegments(artifact, final.coda) : undefined;
}

function formatSegments(segments: readonly string[]): string {
  return `[${segments.join(' ')}]`;
}

function pairIdentity(left: NameArtifact, right: NameArtifact): {
  readonly artifactIds: readonly [string, string];
  readonly displayTexts: readonly [string, string];
} {
  return {
    artifactIds: [left.id, right.id],
    displayTexts: [left.displayText, right.displayText],
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
      evidence: `Modeled segment sequences are identical: ${formatSegments(leftSegments)}.`,
    }];
  }

  const relationships: NameArtifactSoundRelationship[] = [];
  if (editDistance(leftSegments, rightSegments) === 1) {
    relationships.push({
      kind: 'one-segment-edit',
      ...identity,
      evidence: `Modeled segment sequences differ by one insertion, deletion, or substitution: ${formatSegments(leftSegments)} vs ${formatSegments(rightSegments)}.`,
    });
  }

  const leftOnset = firstOnset(left);
  const rightOnset = firstOnset(right);
  if (leftOnset && rightOnset && arraysEqual(leftOnset, rightOnset)) {
    relationships.push({
      kind: 'shared-onset',
      ...identity,
      evidence: `First-syllable onsets are identical: ${formatSegments(leftOnset)}.`,
    });
  }

  const leftFinalSyllable = finalSyllable(left);
  const rightFinalSyllable = finalSyllable(right);
  if (leftFinalSyllable && rightFinalSyllable && arraysEqual(leftFinalSyllable, rightFinalSyllable)) {
    relationships.push({
      kind: 'shared-final-syllable',
      ...identity,
      evidence: `Final modeled syllables are identical: ${formatSegments(leftFinalSyllable)}.`,
    });
  } else {
    const leftCoda = finalCoda(left);
    const rightCoda = finalCoda(right);
    if (leftCoda && rightCoda && arraysEqual(leftCoda, rightCoda)) {
      relationships.push({
        kind: 'shared-coda',
        ...identity,
        evidence: `Final-syllable codas are identical: ${formatSegments(leftCoda)}.`,
      });
    }
  }

  const leftCadence = soundCadenceKey(left);
  const rightCadence = soundCadenceKey(right);
  if (leftCadence && leftCadence === rightCadence) {
    relationships.push({
      kind: 'shared-cadence',
      ...identity,
      evidence: `Modeled cadence and syllable stress pattern are identical: ${leftCadence}.`,
    });
  }

  return relationships;
}

export function analyzeNameArtifact(artifact: NameArtifact): NameArtifactAnalysis {
  const sequence = artifact.sound?.sequence;
  const spellingCandidates = artifact.spellingCandidates ?? [];
  const selectedSpelling = artifact.spelling;
  const selectedCandidateIndex = selectedSpelling
    ? spellingCandidates.findIndex((candidate) => candidate.id === selectedSpelling.id)
    : -1;
  const runnerUp = spellingCandidates.find((candidate) => candidate.id !== selectedSpelling?.id);
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
      const displayTexts: readonly [string, string] = [left.displayText, right.displayText];
      const leftText = normalizeText(left.displayText);
      const rightText = normalizeText(right.displayText);

      if (leftText && leftText === rightText) {
        collisions.push({ kind: 'exact-text', artifactIds: ids, displayTexts, evidence: 'Normalized display text is identical.' });
      } else if (leftText && rightText && editDistance([...leftText], [...rightText]) === 1) {
        collisions.push({ kind: 'near-spelling', artifactIds: ids, displayTexts, evidence: 'Normalized display text differs by one insertion, deletion, or substitution.' });
      }

      const leftInitial = initialKey(left.displayText);
      const rightInitial = initialKey(right.displayText);
      if (leftInitial && leftInitial === rightInitial) {
        collisions.push({ kind: 'shared-initial', artifactIds: ids, displayTexts, evidence: `Both names begin with ${leftInitial.toUpperCase()}.` });
      }

      const leftEnding = endingKey(left.displayText);
      const rightEnding = endingKey(right.displayText);
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
    repeatedInitials: countRepeated(artifacts.map((artifact) => initialKey(artifact.displayText))),
    repeatedEndings: countRepeated(artifacts.map((artifact) => endingKey(artifact.displayText))),
    repeatedCadences: countRepeated(artifacts.map((artifact) => cadenceKey(artifact) ?? '')),
    exactDuplicateCount: collisions.filter((collision) => collision.kind === 'exact-text').length,
    nearSpellingPairCount: collisions.filter((collision) => collision.kind === 'near-spelling').length,
    collisions,
    soundRelationships: analyzeNameArtifactSoundRelationships(artifacts),
  };
}
