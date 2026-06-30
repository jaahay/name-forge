import type { GeneratedName, NameVariant } from '../engine/types';
import { rarityPresentation, scorePresentation } from './presentation';
import { formatScore } from './score';
import { getNameDisplayLength, labelFor, protectInitialBreaks } from './namePresentation';

interface NameInspectorProps {
  name: GeneratedName;
}

function metadataFor(name: GeneratedName) {
  const identity = name.identity;
  const rarity = rarityPresentation[name.silhouette.rarityBand];
  const roleLabel = name.role?.label ?? 'No role';
  const roleInfluenceLabel = name.roleInfluence ? `${name.roleInfluence.level} influence` : 'role-neutral';
  const textureLabel = `${labelFor(name.silhouette.texture)} texture`;
  const formatLabel = identity ? identity.format.label : `${labelFor(name.silhouette.rhythm)} rhythm`;
  return { formatLabel, identity, rarity, roleInfluenceLabel, roleLabel, textureLabel };
}

function variantRelationshipLabel(variant: NameVariant): string {
  return variant.relationship.replace(/_/g, ' ');
}

function variantMetadataLabel(variant: NameVariant): string {
  const generatedLabel = variant.generated ? 'generated' : 'listed';
  return `${variantRelationshipLabel(variant)}; ${variant.confidence} confidence; ${generatedLabel}; ${variant.source.label}`;
}

function readStatusLabel(name: GeneratedName): string {
  const noteCount = name.readabilityDiagnostics.length;
  if (noteCount === 0) return 'Clean read';
  return `${noteCount} read note${noteCount === 1 ? '' : 's'}`;
}

export function NameInspector({ name }: NameInspectorProps) {
  const { formatLabel, identity, rarity, roleInfluenceLabel, roleLabel, textureLabel } = metadataFor(name);
  const displayName = protectInitialBreaks(name.name);
  const displayLength = getNameDisplayLength(name.name);
  const readNotes = name.readabilityDiagnostics;
  const spellingCandidates = name.spellingCandidates.slice(0, 6);

  return (
    <aside className="selected-name-panel panel" aria-labelledby="selected-name-heading">
      <header className="selected-name-heading">
        <div className="selected-name-title-block">
          <p className="eyebrow inspector-eyebrow">Inspect</p>
          <h2 id="selected-name-heading" className={`name-card-title ${rarity.className}`} data-name-length={displayLength}>{displayName}</h2>
        </div>
        <ul className="selected-name-chips" aria-label="Name snapshot">
          <li>{rarity.label}</li>
          <li>{roleLabel}</li>
          <li>{name.silhouette.syllableCount} syllables</li>
        </ul>
      </header>

      <div className="name-detail-grid" aria-label={`Selected details for ${name.name}`}>
        <section className="detail-block artifact-detail-block">
          <h3>Sound</h3>
          <dl className="artifact-fact-list">
            <div><dt>Sound sketch</dt><dd>{name.sound.transcription}</dd></div>
            <div><dt>Profile</dt><dd>{name.soundProfile.id}</dd></div>
            <div><dt>Playback</dt><dd>Planned</dd></div>
          </dl>
        </section>

        <section className="detail-block artifact-detail-block">
          <h3>Spelling</h3>
          <dl className="artifact-fact-list">
            <div><dt>Selected</dt><dd>{name.spelling.text}</dd></div>
            <div><dt>Rank</dt><dd>{name.spelling.rank}</dd></div>
            <div><dt>Score</dt><dd>{formatScore(name.spelling.score)}</dd></div>
          </dl>
        </section>

        <section className="detail-block artifact-detail-block">
          <h3>Spelling candidates</h3>
          <ul className="variants detail-variants" aria-label={`${name.name} ranked spelling candidates`}>
            {spellingCandidates.map((candidate) => (
              <li key={`${name.id}-${candidate.id}`}>
                <span>{candidate.text}</span>
                <em>{candidate.id === name.spelling.id ? 'selected; ' : ''}rank {candidate.rank}; score {formatScore(candidate.score)}</em>
              </li>
            ))}
          </ul>
        </section>

        <section className="detail-block artifact-detail-block">
          <h3>Cast context</h3>
          <dl className="artifact-fact-list">
            <div><dt>Role</dt><dd>{roleLabel}</dd></div>
            <div><dt>Influence</dt><dd>{roleInfluenceLabel}</dd></div>
            <div><dt>Format</dt><dd>{formatLabel}</dd></div>
          </dl>
        </section>

        <section className="detail-block artifact-detail-block">
          <h3>Usability</h3>
          <dl className="artifact-fact-list">
            <div><dt>Read status</dt><dd>{readStatusLabel(name)}</dd></div>
            <div><dt>Texture</dt><dd>{textureLabel}</dd></div>
            <div><dt>Rarity</dt><dd>{rarity.label}</dd></div>
          </dl>
          {readNotes.length > 0 ? (
            <ul className="readability-list" aria-label={`${name.name} readability notes`}>
              {readNotes.map((diagnostic) => (
                <li key={`${name.id}-${diagnostic.id}`} className={`readability-note ${diagnostic.severity}`}>
                  <strong>{diagnostic.label}</strong>
                  <span>{diagnostic.detail}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="section-note">No deterministic read-friction notes. This is not a canonical pronunciation.</p>
          )}
        </section>

        <section className="detail-block" aria-label={`${name.name} score breakdown`}>
          <h3>Score detail</h3>
          <dl className="score-list detail-score-list">
            {scorePresentation.map((score) => <div key={`${name.id}-${score.key}`}><dt>{score.label}</dt><dd>{formatScore(name.scores[score.key])}</dd></div>)}
          </dl>
        </section>

        {identity ? (
          <section className="detail-block">
            <h3>Name parts</h3>
            <ul className="variants detail-variants">
              {identity.parts.map((part) => <li key={part.id}><span>{part.value}</span><em>{part.role}</em></li>)}
            </ul>
          </section>
        ) : null}

        {name.variants.length > 0 ? (
          <section className="detail-block">
            <h3>Variants</h3>
            <ul className="variants detail-variants" aria-label={`${name.name} variants`}>
              {name.variants.map((variant) => <li key={`${name.id}-${variant.value}`}><span>{variant.value}</span><em>{variantMetadataLabel(variant)}</em></li>)}
            </ul>
          </section>
        ) : null}

        {name.roleInfluence ? (
          <section className="detail-block">
            <h3>Role cue</h3>
            <dl className="artifact-fact-list">
              <div><dt>Label</dt><dd>{name.roleInfluence.label}</dd></div>
              <div><dt>Strength</dt><dd>{name.roleInfluence.level}</dd></div>
              <div><dt>Effects</dt><dd>{name.roleInfluence.effects.join(', ')}</dd></div>
            </dl>
          </section>
        ) : null}
      </div>
    </aside>
  );
}
