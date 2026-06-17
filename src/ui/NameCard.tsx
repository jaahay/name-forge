import type { GeneratedName } from '../engine/types';
import { rarityPresentation, scorePresentation } from './presentation';
import { formatScore, rarityClassName, textureClassName } from './score';

interface NameCardProps {
  name: GeneratedName;
}

export function NameCard({ name }: NameCardProps) {
  const rarity = rarityPresentation[name.silhouette.rarityBand];

  return (
    <details className={`name-card panel ${textureClassName(name.silhouette.texture)}`}>
      <summary className="name-card-summary">
        <div className="name-card-header">
          <div><h2 className={rarity.className}>{name.name}</h2><p>{name.silhouette.rhythm} rhythm</p></div>
          <div className="name-card-meta" aria-label={`${name.silhouette.syllableCount} syllables, ${rarity.label} rarity`}>
            <span>{name.silhouette.syllableCount} syllables</span>
            <span className={rarityClassName(name.silhouette.rarityBand)}>{rarity.label}</span>
          </div>
        </div>
        <span className="collapse-cue">Details</span>
      </summary>
      <p className="score-note">Diagnostics explain why this name was selected; they are not grades and are mostly useful when comparing close alternatives.</p>
      <dl className="score-list" aria-label={`${name.name} diagnostic score breakdown`}>
        {scorePresentation.map((score) => <div key={`${name.id}-${score.key}`}><dt>{score.label}</dt><dd>{formatScore(name.scores[score.key])}</dd></div>)}
      </dl>
      <div className="metadata"><span>{name.silhouette.texture} texture</span><span>{name.silhouette.targetLength} target</span><span>{name.silhouette.rarityBand} rarity target</span></div>
      <div>
        <h3>Alternate spellings</h3>
        <p className="section-note">Generated from the same base name.</p>
        {name.variants.length > 0 ? (
          <ul className="variants">{name.variants.map((variant) => <li key={`${name.id}-${variant.value}`}><span>{variant.value}</span><em>{variant.kind}</em></li>)}</ul>
        ) : <p className="empty-state">No alternate spellings for this name.</p>}
      </div>
    </details>
  );
}
