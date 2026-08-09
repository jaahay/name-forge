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
  const roleInfluenceLabel = name.roleInfluence ? `${name.roleInfluence.level} influence` : 'role-neutral';
  const textureLabel = `${labelFor(name.silhouette.texture)} texture`;
  const formatLabel = identity ? identity.format.label : `${labelFor(name.silhouette.rhythm)} rhythm`;

  return (
    <>
      <details className="detail-block artifact-detail-block">
        <summary>Cast context</summary>
        <dl className="artifact-fact-list">
          <div><dt>Role</dt><dd>{roleLabel}</dd></div>
          <div><dt>Influence</dt><dd>{roleInfluenceLabel}</dd></div>
          <div><dt>Format</dt><dd>{formatLabel}</dd></div>
        </dl>
      </details>

      <details className="detail-block artifact-detail-block">
        <summary>Generated shape</summary>
        <dl className="artifact-fact-list">
          <div><dt>Texture</dt><dd>{textureLabel}</dd></div>
          <div><dt>Rarity</dt><dd>{rarity.label}</dd></div>
          <div><dt>Syllables</dt><dd>{name.silhouette.syllableCount}</dd></div>
        </dl>
      </details>

      <details className="detail-block" aria-label={`${name.name} score breakdown`}>
        <summary>Score detail</summary>
        <dl className="score-list detail-score-list">
          {scorePresentation.map((score) => <div key={`${name.id}-${score.key}`}><dt>{score.label}</dt><dd>{formatScore(name.scores[score.key])}</dd></div>)}
        </dl>
      </details>

      {identity ? (
        <details className="detail-block">
          <summary>Name parts</summary>
          <ul className="variants detail-variants">
            {identity.parts.map((part) => <li key={part.id}><span>{part.value}</span><em>{part.role}</em></li>)}
          </ul>
        </details>
      ) : null}

      {name.roleInfluence ? (
        <details className="detail-block">
          <summary>Role cue</summary>
          <dl className="artifact-fact-list">
            <div><dt>Label</dt><dd>{name.roleInfluence.label}</dd></div>
            <div><dt>Strength</dt><dd>{name.roleInfluence.level}</dd></div>
            <div><dt>Effects</dt><dd>{name.roleInfluence.effects.join(', ')}</dd></div>
          </dl>
        </details>
      ) : null}
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
            Reroll this name
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
