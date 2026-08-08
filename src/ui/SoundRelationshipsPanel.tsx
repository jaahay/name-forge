import type { NameArtifactSoundRelationship, SoundSegmentId } from '../engine/types';

interface SoundRelationshipsPanelProps {
  relationships: readonly NameArtifactSoundRelationship[];
  onSelectName: (id: string) => void;
}

interface SoundRelationshipPairGroup {
  key: string;
  artifactIds: readonly [string, string];
  displayTexts: readonly [string, string];
  relationships: NameArtifactSoundRelationship[];
}

interface SoundRelationshipPresentation {
  label: string;
  summary: string;
  technical: string;
}

function formatSegments(segments: readonly SoundSegmentId[]): string {
  return segments.join(' ');
}

function segmentLabel(segments: readonly SoundSegmentId[], singular: string, plural: string): string {
  return `${segments.length === 1 ? singular : plural}: ${formatSegments(segments)}`;
}

function relationshipPresentation(relationship: NameArtifactSoundRelationship): SoundRelationshipPresentation {
  if (relationship.kind === 'identical-sound') {
    return {
      label: 'Same modeled sound',
      summary: 'Both names use the same modeled sound pattern.',
      technical: segmentLabel(relationship.details.segments, 'Sound', 'Sounds'),
    };
  }

  if (relationship.kind === 'one-segment-edit') {
    const [leftName, rightName] = relationship.displayTexts;
    const edit = relationship.details.edit;
    const position = edit.index + 1;
    const sequenceChange = `${formatSegments(relationship.details.leftSegments)} → ${formatSegments(relationship.details.rightSegments)}`;

    if (edit.kind === 'insertion') {
      return {
        label: 'One sound differs',
        summary: `${rightName} has one additional modeled sound at position ${position}.`,
        technical: `Added sound: ${edit.segment} · ${sequenceChange}`,
      };
    }

    if (edit.kind === 'deletion') {
      return {
        label: 'One sound differs',
        summary: `${rightName} has one fewer modeled sound at position ${position}.`,
        technical: `Removed sound: ${edit.segment} · ${sequenceChange}`,
      };
    }

    return {
      label: 'One sound differs',
      summary: `The names use different modeled sounds at position ${position}.`,
      technical: `${leftName}: ${edit.leftSegment} · ${rightName}: ${edit.rightSegment}`,
    };
  }

  if (relationship.kind === 'shared-onset') {
    return {
      label: 'Same opening sound',
      summary: 'Both names begin with the same modeled sound.',
      technical: segmentLabel(relationship.details.segments, 'Opening sound', 'Opening sounds'),
    };
  }

  if (relationship.kind === 'shared-final-syllable') {
    return {
      label: 'Same final syllable',
      summary: 'Both names end with the same modeled syllable.',
      technical: `Final syllable: ${formatSegments(relationship.details.segments)}`,
    };
  }

  if (relationship.kind === 'shared-coda') {
    return {
      label: 'Same ending sound',
      summary: 'Both names end with the same modeled sound.',
      technical: segmentLabel(relationship.details.segments, 'Ending sound', 'Ending sounds'),
    };
  }

  return {
    label: 'Same rhythm and stress',
    summary: 'The names use the same modeled rhythm and stress pattern.',
    technical: `Cadence: ${relationship.details.cadence} · Stress: ${relationship.details.stressPattern.join(', ')}`,
  };
}

function groupSoundRelationships(
  relationships: readonly NameArtifactSoundRelationship[],
): readonly SoundRelationshipPairGroup[] {
  const groups: SoundRelationshipPairGroup[] = [];
  const groupsByPair = new Map<string, SoundRelationshipPairGroup>();

  for (const relationship of relationships) {
    const key = JSON.stringify(relationship.artifactIds);
    let group = groupsByPair.get(key);
    if (!group) {
      group = {
        key,
        artifactIds: relationship.artifactIds,
        displayTexts: relationship.displayTexts,
        relationships: [],
      };
      groupsByPair.set(key, group);
      groups.push(group);
    }
    group.relationships.push(relationship);
  }

  return groups;
}

export function describeSoundRelationship(relationship: NameArtifactSoundRelationship): string {
  const presentation = relationshipPresentation(relationship);
  return `${presentation.label}. ${presentation.summary} ${presentation.technical}`;
}

export function SoundRelationshipsPanel({ relationships, onSelectName }: SoundRelationshipsPanelProps) {
  if (relationships.length === 0) return null;

  const groups = groupSoundRelationships(relationships);

  return (
    <section className="sound-relationships" aria-labelledby="sound-relationships-heading">
      <div className="sound-relationships-heading">
        <div>
          <h3 id="sound-relationships-heading">Sound relationships</h3>
          <p>Modeled sound patterns shared within this cast.</p>
        </div>
        <span className="sound-relationships-count">
          {groups.length} {groups.length === 1 ? 'pair' : 'pairs'}
        </span>
      </div>
      <ol className="sound-relationship-pairs">
        {groups.map((group) => (
          <li key={group.key} className="sound-relationship-pair">
            <div className="sound-relationship-pair-heading">
              <span className="sound-relationship-marker" aria-hidden="true" />
              <h4>
                <button
                  type="button"
                  className="sound-relationship-name"
                  aria-label={`Select ${group.displayTexts[0]} from sound relationships`}
                  onClick={() => onSelectName(group.artifactIds[0])}
                >
                  {group.displayTexts[0]}
                </button>{' '}
                <span>and</span>{' '}
                <button
                  type="button"
                  className="sound-relationship-name"
                  aria-label={`Select ${group.displayTexts[1]} from sound relationships`}
                  onClick={() => onSelectName(group.artifactIds[1])}
                >
                  {group.displayTexts[1]}
                </button>
              </h4>
            </div>
            <ul className="sound-relationship-facts">
              {group.relationships.map((relationship, index) => {
                const presentation = relationshipPresentation(relationship);
                return (
                  <li
                    key={`${relationship.kind}:${index}`}
                    className="sound-relationship-fact"
                  >
                    <strong>{presentation.label}</strong>
                    <span className="sound-relationship-summary">{presentation.summary}</span>
                    <span className="sound-relationship-technical">{presentation.technical}</span>
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
      </ol>
    </section>
  );
}
