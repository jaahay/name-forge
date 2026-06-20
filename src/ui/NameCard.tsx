import type { GeneratedName } from '../engine/types';
import { rarityPresentation, scorePresentation } from './presentation';
import { formatScore, textureClassName } from './score';

interface NameCardHeaderProps {
  name: GeneratedName;
}

interface NameCardProps {
  name: GeneratedName;
  isSelected: boolean;
  isLocked: boolean;
  onSelect: (id: string) => void;
  onToggleLocked: (id: string) => void;
}

interface NameInspectorProps {
  name: GeneratedName;
  onDismiss: () => void;
}

function labelFor(value: string): string {
  return value
    .split('-')
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(' ');
}

function NameCardHeader({ name }: NameCardHeaderProps) {
  const rarity = rarityPresentation[name.silhouette.rarityBand];

  return (
    <div className="name-card-header">
      <div className="name-card-title-block">
        <h2 className={`name-card-title ${rarity.className}`}>{name.name}</h2>
      </div>
      <div className="name-card-meta" aria-label={`${name.silhouette.syllableCount} syllables`}>
        <span>{name.silhouette.syllableCount} syllables</span>
      </div>
    </div>
  );
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

export function NameInspector({ name, onDismiss }: NameInspectorProps) {
  const { formatLabel, identity, rarity, roleInfluenceLabel, roleLabel, textureLabel } = metadataFor(name);

  return (
    <aside className="selected-name-panel panel" aria-labelledby="selected-name-heading">
      <header className="selected-name-heading">
        <div className="name-card-header">
          <h2 id="selected-name-heading" className={`name-card-title ${rarity.className}`}>{name.name}</h2>
          <button type="button" className="anchor-button" aria-label="Close detail pane" onClick={onDismiss}>Close</button>
        </div>
        <ul className="selected-name-chips" aria-label="Name snapshot">
          <li>{rarity.label}</li>
          <li>{roleLabel}</li>
          <li>{name.silhouette.syllableCount} syllables</li>
        </ul>
      </header>

      <ul className="inspector-summary" aria-label={`${name.name} summary`}>
        <li><span>Format</span><strong>{formatLabel}</strong></li>
        <li><span>Texture</span><strong>{textureLabel}</strong></li>
        <li><span>Role cue</span><strong>{roleInfluenceLabel}</strong></li>
      </ul>

      <div className="name-detail-grid" aria-label={`Selected details for ${name.name}`}>
        <section className="detail-block" aria-label={`${name.name} read breakdown`}>
          <h3>Read</h3>
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
            <h3>Spellings</h3>
            <ul className="variants detail-variants" aria-label={`${name.name} alternate spellings`}>
              {name.variants.map((variant) => <li key={`${name.id}-${variant.value}`}><span>{variant.value}</span></li>)}
            </ul>
          </section>
        ) : null}

        {name.roleInfluence ? (
          <section className="detail-block">
            <h3>Role cue</h3>
            <p className="section-note">{name.roleInfluence.label} nudged this result at {name.roleInfluence.level} strength: {name.roleInfluence.effects.join(', ')}.</p>
          </section>
        ) : null}
      </div>
    </aside>
  );
}

export function NameCard({ name, isSelected, isLocked, onSelect, onToggleLocked }: NameCardProps) {
  const cardClassName = `name-card panel ${textureClassName(name.silhouette.texture)}${isSelected ? ' selected' : ''}${isLocked ? ' locked' : ''}`;

  return (
    <article className={cardClassName} aria-current={isSelected ? 'true' : undefined}>
      <button
        type="button"
        className="name-card-button"
        aria-pressed={isSelected}
        aria-label={`Inspect ${name.name}`}
        onClick={() => onSelect(name.id)}
      >
        <NameCardHeader name={name} />
      </button>
      <button
        type="button"
        className="anchor-button lock-toggle"
        aria-pressed={isLocked}
        aria-label={`${isLocked ? 'Unlock' : 'Lock'} ${name.name}`}
        onClick={() => onToggleLocked(name.id)}
      >
        {isLocked ? 'Locked' : 'Lock'}
      </button>
    </article>
  );
}
