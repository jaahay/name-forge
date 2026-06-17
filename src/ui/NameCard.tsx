import type { GeneratedName } from '../engine/types';
import { rarityPresentation, scorePresentation } from './presentation';
import { formatScore, rarityClassName, textureClassName } from './score';

interface NameCardProps {
  name: GeneratedName;
}

export function NameCard({ name }: NameCardProps) {
  const rarity = rarityPresentation[name.silhouette.rarityBand];
  const identity = name.identity;

  return (
    <details className={`name-card panel ${textureClassName(name.silhouette.texture)}`}>
      <summary className="name-card-summary">
        <div className="name-card-header">
          <div><h2 className={rarity.className}>{name.name}</h2><p>{identity ? identity.format.label : `${name.silhouette.rhythm} rhythm`}</p></div>
          <div className="name-card-meta" aria-label={`${name.silhouette.syllableCount} syllables, ${rarity.label} rarity`}>
            <span>{name.silhouette.syllableCount} syllables</span>
            <span className={rarityClassName(name.silhouette.rarityBand)}>{rarity.label}</span>
          </div>
        </div>
        <span className="collapse-cue">Details</span>
      </summary>
      <dl className="score-list" aria-label={`${name.name} diagnostic score breakdown`}>
        {scorePresentation.map((score) => <div key={`${name.id}-${score.key}`}><dt>{score.label}</dt><dd>{formatScore(name.scores[score.key])}</dd></div>)}
      </dl>
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
    </details>
  );
}
