import type { GeneratedName } from '../engine/types';
import type { CardDensity } from './presentation';
import { rarityPresentation, scorePresentation } from './presentation';
import { formatScore, rarityClassName, textureClassName } from './score';

interface NameCardProps {
  name: GeneratedName;
  density: CardDensity;
}

function labelFor(value: string): string {
  return value
    .split('-')
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(' ');
}

function NameCardHeader({ name, density }: NameCardProps) {
  const rarity = rarityPresentation[name.silhouette.rarityBand];
  const identity = name.identity;
  const roleLabel = name.role?.label ?? 'No role';
  const toneLabel = `${labelFor(name.silhouette.texture)} tone`;
  const formatLabel = identity ? identity.format.label : `${labelFor(name.silhouette.rhythm)} rhythm`;

  return (
    <div className="name-card-header">
      <div className="name-card-title-block">
        <h2 className={`name-card-title ${rarity.className}`}>{name.name}</h2>
        {density === 'basic' ? (
          <p className="name-style-row compact"><span>{roleLabel}</span></p>
        ) : (
          <p className="name-style-row"><span>Role: {roleLabel}</span><span>Tone: {toneLabel}</span><span>Format: {formatLabel}</span></p>
        )}
      </div>
      <div className="name-card-meta" aria-label={`${name.silhouette.syllableCount} syllables, ${rarity.label} rarity`}>
        <span>{name.silhouette.syllableCount} syllables</span>
        <span className={rarityClassName(name.silhouette.rarityBand)}>{rarity.label}</span>
      </div>
    </div>
  );
}

export function NameCard({ name, density }: NameCardProps) {
  const identity = name.identity;
  const densityClassName = `name-card panel ${textureClassName(name.silhouette.texture)} card-density-${density}`;

  return (
    <details className={densityClassName}>
      <summary className="name-card-summary">
        <NameCardHeader name={name} density={density} />
        <span className="collapse-cue">{density === 'detail' ? 'Details' : 'More'}</span>
      </summary>
      {identity ? (
        <div>
          <h3>Name parts</h3>
          <p className="section-note">{identity.format.pattern}</p>
          <ul className="variants">
            {identity.parts.map((part) => <li key={part.id}><span>{part.value}</span><em>{part.role}</em></li>)}
          </ul>
        </div>
      ) : null}
      <div>
        <h3>Alternate spellings</h3>
        {name.variants.length > 0 ? (
          <ul className="variants">{name.variants.map((variant) => <li key={`${name.id}-${variant.value}`}><span>{variant.value}</span><em>{variant.kind}</em></li>)}</ul>
        ) : <p className="empty-state">No alternate spellings for this name.</p>}
      </div>
      {density === 'detail' ? (
        <div>
          <h3>Diagnostic scores</h3>
          <dl className="score-list" aria-label={`${name.name} diagnostic score breakdown`}>
            {scorePresentation.map((score) => <div key={`${name.id}-${score.key}`}><dt>{score.label}</dt><dd>{formatScore(name.scores[score.key])}</dd></div>)}
          </dl>
        </div>
      ) : null}
    </details>
  );
}
