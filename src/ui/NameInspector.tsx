import { toNameArtifact } from '../engine/nameArtifact';
import type { GeneratedName } from '../engine/types';
import { NameArtifactInspector } from './NameArtifactInspector';
import { rarityPresentation, scorePresentation } from './presentation';
import { formatScore } from './score';
import { labelFor } from './namePresentation';

interface NameInspectorProps {
  name: GeneratedName;
  isLocked: boolean;
  onRerollName: () => void;
  onToggleLockedName: (id: string) => void;
}

function castSections(name: GeneratedName) {
  const identity = name.identity;
  const rarity = rarityPresentation[name.silhouette.rarityBand];
  const roleLabel = name.role?.label ?? 'No role';
  const roleInfluenceLabel = name.roleInfluence ? `${name.roleInfluence.level} influence` : 'Role-neutral';
  const textureLabel = `${labelFor(name.silhouette.texture)} texture`;
  const formatLabel = identity ? identity.format.label : `${labelFor(name.silhouette.rhythm)} rhythm`;

  return (
    <>
      <section className="inspector-detail-group">
        <h3>Cast context</h3>
        <dl className="inspector-detail-facts">
          <div><dt>Role</dt><dd>{roleLabel}</dd></div>
          <div><dt>Format</dt><dd>{formatLabel}</dd></div>
          <div><dt>Rarity</dt><dd>{rarity.label}</dd></div>
          <div><dt>Texture</dt><dd>{textureLabel}</dd></div>
          <div><dt>Syllables</dt><dd>{name.silhouette.syllableCount}</dd></div>
          <div><dt>Influence</dt><dd>{roleInfluenceLabel}</dd></div>
        </dl>
        {name.roleInfluence ? (
          <p className="inspector-detail-note">
            <strong>{name.roleInfluence.label}</strong>
            <span>{name.roleInfluence.effects.join(', ')}</span>
          </p>
        ) : null}
      </section>

      {identity ? (
        <section className="inspector-detail-group">
          <h3>Composition</h3>
          <ul className="inspector-name-parts">
            {identity.parts.map((part) => <li key={part.id}><span>{part.value}</span><em>{part.role}</em></li>)}
          </ul>
        </section>
      ) : null}

      <section className="inspector-detail-group" aria-label={`${name.name} score breakdown`}>
        <h3>Score detail</h3>
        <dl className="score-list detail-score-list">
          {scorePresentation.map((score) => <div key={`${name.id}-${score.key}`}><dt>{score.label}</dt><dd>{formatScore(name.scores[score.key])}</dd></div>)}
        </dl>
      </section>
    </>
  );
}

export function NameInspector({ name, isLocked, onRerollName, onToggleLockedName }: NameInspectorProps) {
  return (
    <NameArtifactInspector
      artifact={toNameArtifact(name)}
      extraActions={(
        <>
          <button
            type="button"
            className="secondary selected-name-reroll-action"
            aria-label={`Reroll ${name.name}`}
            disabled={isLocked}
            title={isLocked ? 'Unlock this name to reroll it.' : undefined}
            onClick={onRerollName}
          >
            Reroll
          </button>
          <button
            type="button"
            className="secondary selected-name-lock-action"
            aria-pressed={isLocked}
            aria-label={`${isLocked ? 'Unlock' : 'Lock'} ${name.name}`}
            onClick={() => onToggleLockedName(name.id)}
          >
            {isLocked ? 'Unlock' : 'Lock'}
          </button>
        </>
      )}
      extraSections={castSections(name)}
    />
  );
}
