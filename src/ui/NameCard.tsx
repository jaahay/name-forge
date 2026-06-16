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
          <span className="score-pill" aria-label={`Overall fit score ${formatScore(name.scores.overallFit)}`}>{formatScore(name.scores.overallFit)}</span>
        </div>
        <span className="collapse-cue">Details</span>
      </summary>
      <dl className="score-list" aria-label={`${name.name} score breakdown`}>
        {scorePresentation.map((score) => <div key={`${name.id}-${score.key}`}><dt>{score.label}</dt><dd>{formatScore(name.scores[score.key])}</dd></div>)}
      </dl>
      <div className="metadata"><span>{name.silhouette.syllableCount} syllables</span><span>{name.silhouette.texture} texture</span><span className={rarityClassName(name.silhouette.rarityBand)}>{rarity.label} rarity</span></div>
      <div><h3>Variants</h3><ul className="variants">{name.variants.map((variant) => <li key={`${name.id}-${variant.value}`}><span>{variant.value}</span><em>{variant.kind}</em></li>)}</ul></div>
      <details className="source-trace">
        <summary>Source trace</summary>
        <ul className="provenance">{name.provenance.map((item) => <li key={`${name.id}-${item.sourceId}-${item.label}`}><strong>{item.label}</strong><span>{item.detail}</span></li>)}</ul>
      </details>
    </details>
  );
}
