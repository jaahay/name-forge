import type { GeneratedName } from '../engine/types';
import { rarityPresentation, scorePresentation } from './presentation';
import { formatScore, textureClassName } from './score';

interface NameCardHeaderProps {
  name: GeneratedName;
}

interface NameCardProps {
  name: GeneratedName;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

interface NameInspectorProps {
  name: GeneratedName;
}

function labelFor(value: string): string {
  return value
    .split('-')
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(' ');
}

function variantList(name: GeneratedName) {
  if (name.variants.length === 0) return null;
  return (
    <ul className="variants compact-variants" aria-label={`${name.name} alternate spellings`}>
      {name.variants.map((variant) => <li key={`${name.id}-${variant.value}`}><span>{variant.value}</span></li>)}
    </ul>
  );
}

function NameCardHeader({ name }: NameCardHeaderProps) {
  const rarity = rarityPresentation[name.silhouette.rarityBand];

  return (
    <div className="name-card-header">
      <div className="name-card-title-block">
        <h2 className={`name-card-title ${rarity.className}`}>{name.name}</h2>
        {variantList(name)}
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

export function NameInspector({ name }: NameInspectorProps) {
  const { formatLabel, identity, rarity, roleInfluenceLabel, roleLabel, textureLabel } = metadataFor(name);

  return (
    <aside className="selected-name-panel panel" aria-labelledby="selected-name-heading">
      <div className="selected-name-heading">
        <div>
          <p className="eyebrow">Selected name</p>
          <h2 id="selected-name-heading" className={`name-card-title ${rarity.className}`}>{name.name}</h2>
        </div>
        <span>{name.silhouette.syllableCount} syllables</span>
      </div>

      <div className="name-detail-grid" aria-label={`Selected details for ${name.name}`}>
        <section className="detail-block" aria-label={`${name.name} details`}>
          <h3>Details</h3>
          <ul className="metadata compact-metadata detail-metadata">
            <li><span>Role</span><strong>{roleLabel}</strong></li>
            <li><span>Influence</span><strong>{roleInfluenceLabel}</strong></li>
            <li><span>Texture</span><strong>{textureLabel}</strong></li>
            <li><span>Format</span><strong>{formatLabel}</strong></li>
            <li><span>Rarity</span><strong className={rarity.className}>{rarity.label}</strong></li>
          </ul>
        </section>

        <section className="detail-block" aria-label={`${name.name} fit score breakdown`}>
          <h3>Fit</h3>
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
            <h3>Role influence</h3>
            <p className="section-note">{name.roleInfluence.label} nudged this result at {name.roleInfluence.level} strength: {name.roleInfluence.effects.join(', ')}.</p>
          </section>
        ) : null}
      </div>
    </aside>
  );
}

export function NameCard({ name, isSelected, onSelect }: NameCardProps) {
  const cardClassName = `name-card panel ${textureClassName(name.silhouette.texture)}${isSelected ? ' selected' : ''}`;

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
        <span className="collapse-cue">{isSelected ? 'Selected' : 'Inspect'}</span>
      </button>
    </article>
  );
}
