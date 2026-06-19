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

interface NameInlineDetailsProps {
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
      {name.variants.map((variant) => <li key={`${name.id}-${variant.value}`}><span>{variant.value}</span><em>{variant.kind}</em></li>)}
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

function NameInlineDetails({ name }: NameInlineDetailsProps) {
  const { formatLabel, identity, rarity, roleInfluenceLabel, roleLabel, textureLabel } = metadataFor(name);

  return (
    <div className="name-inline-detail" aria-label={`Selected details for ${name.name}`}>
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
  );
}

export function NameCard({ name, isSelected, onSelect }: NameCardProps) {
  const cardClassName = `name-card panel ${textureClassName(name.silhouette.texture)}${isSelected ? ' selected' : ''}`;

  return (
    <article className={cardClassName}>
      <button
        type="button"
        className="name-card-button"
        aria-expanded={isSelected}
        aria-label={`View details for ${name.name}`}
        onClick={() => onSelect(name.id)}
      >
        <NameCardHeader name={name} />
        <span className="collapse-cue">{isSelected ? 'Selected' : 'View details'}</span>
      </button>
      {isSelected ? <NameInlineDetails name={name} /> : null}
    </article>
  );
}
