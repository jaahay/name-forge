import { toNameArtifact } from '../engine/nameArtifact';
import type { GeneratedName } from '../engine/types';
import { NameArtifactInspector } from './NameArtifactInspector';
export { visibleSpellingCandidateLimit } from './NameArtifactInspector';
import { rarityPresentation, scorePresentation } from './presentation';
import { formatScore } from './score';
import { labelFor } from './namePresentation';

interface NameInspectorProps {
  name: GeneratedName;
  isLocked: boolean;
  onToggleLockedName: (id: string) => void;
}

function castSections(name: GeneratedName) {
  const identity = name.identity;
  const rarity = rarityPresentation[name.silhouette.rarityBand];
  const roleLabel = name.role?.label ?? 'No role';
  const roleInfluenceLabel = name.roleInfluence ? `${name.roleInfluence.level} influence` : 'role-neutral';
  const textureLabel = `${labelFor(name.silhouette.texture)} texture`;
  const formatLabel = identity ? identity.format.label : `${labelFor(name.silhouette.rhythm)} rhythm`;

  return (
    <>
      <section className="detail-block artifact-detail-block">
        <h3>Cast context</h3>
        <dl className="artifact-fact-list">
          <div><dt>Role</dt><dd>{roleLabel}</dd></div>
          <div><dt>Influence</dt><dd>{roleInfluenceLabel}</dd></div>
          <div><dt>Format</dt><dd>{formatLabel}</dd></div>
        </dl>
      </section>

      <section className="detail-block artifact-detail-block">
        <h3>Generated shape</h3>
        <dl className="artifact-fact-list">
          <div><dt>Texture</dt><dd>{textureLabel}</dd></div>
          <div><dt>Rarity</dt><dd>{rarity.label}</dd></div>
          <div><dt>Syllables</dt><dd>{name.silhouette.syllableCount}</dd></div>
        </dl>
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
    </>
  );
}

export function NameInspector({ name, isLocked, onToggleLockedName }: NameInspectorProps) {
  return (
    <NameArtifactInspector
      artifact={toNameArtifact(name)}
      extraActions={(
        <button
          type="button"
          className="secondary selected-name-lock-action"
          aria-pressed={isLocked}
          aria-label={`${isLocked ? 'Unlock' : 'Lock'} ${name.name}`}
          onClick={() => onToggleLockedName(name.id)}
        >
          {isLocked ? 'Unlock' : 'Lock'}
        </button>
      )}
      extraSections={castSections(name)}
    />
  );
}
