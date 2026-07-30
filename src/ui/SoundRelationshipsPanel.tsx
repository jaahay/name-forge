import type { NameArtifactSoundRelationship, SoundSegmentId } from '../engine/types';

interface SoundRelationshipsPanelProps {
  relationships: readonly NameArtifactSoundRelationship[];
}

function formatSegments(segments: readonly SoundSegmentId[]): string {
  return segments.join(' ');
}

export function describeSoundRelationship(relationship: NameArtifactSoundRelationship): string {
  if (relationship.kind === 'identical-sound') {
    return `Identical modeled segment sequence: ${formatSegments(relationship.details.segments)}.`;
  }

  if (relationship.kind === 'one-segment-edit') {
    const [leftName, rightName] = relationship.displayTexts;
    const edit = relationship.details.edit;
    const position = edit.index + 1;

    if (edit.kind === 'insertion') {
      return `${rightName} adds modeled segment ${edit.segment} at position ${position} relative to ${leftName}.`;
    }

    if (edit.kind === 'deletion') {
      return `${rightName} removes modeled segment ${edit.segment} at position ${position} relative to ${leftName}.`;
    }

    return `${leftName} uses ${edit.leftSegment} where ${rightName} uses ${edit.rightSegment} at position ${position}.`;
  }

  if (relationship.kind === 'shared-onset') {
    return `Shared first-syllable onset: ${formatSegments(relationship.details.segments)}.`;
  }

  if (relationship.kind === 'shared-final-syllable') {
    return `Shared final modeled syllable: ${formatSegments(relationship.details.segments)}.`;
  }

  if (relationship.kind === 'shared-coda') {
    return `Shared final-syllable coda: ${formatSegments(relationship.details.segments)}.`;
  }

  return `Matching modeled cadence and stress: ${relationship.details.cadence}; ${relationship.details.stressPattern.join(', ')}.`;
}

export function SoundRelationshipsPanel({ relationships }: SoundRelationshipsPanelProps) {
  if (relationships.length === 0) return null;

  return (
    <>
      <div className="cast-health-heading">
        <h2 id="sound-relationships-heading">Sound relationships</h2>
        <p>Exact modeled structure within the active cast roster.</p>
      </div>
      <ul className="cast-health-list" aria-labelledby="sound-relationships-heading">
        {relationships.map((relationship, index) => (
          <li
            key={`${relationship.artifactIds[0]}:${relationship.artifactIds[1]}:${relationship.kind}:${index}`}
            className="cast-health-item"
          >
            <span className="cast-health-status" aria-hidden="true">&#8226;</span>
            <span>
              <strong>{relationship.displayTexts[0]} and {relationship.displayTexts[1]}</strong>
              {describeSoundRelationship(relationship)}
            </span>
          </li>
        ))}
      </ul>
    </>
  );
}
