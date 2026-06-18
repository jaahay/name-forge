import type { GeneratedName } from '../engine/types';
import { rarityPresentation, scorePresentation } from './presentation';
import { formatScore, textureClassName } from './score';

interface NameCardProps {
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

function NameCardHeader({ name }: NameCardProps) {
  return (
    <div className="name-card-header">
      <div className="name-card-title-block">
        <h2 className="name-card-title">{name.name}</h2>
        {variantList(name)}
      </div>
      <div className="name-card-meta" aria-label={`${name.silhouette.syllableCount} syllables`}>
        <span>{name.silhouette.syllableCount} syllables</span>
      </div>
    </div>
  );
}

export function NameCard({ name }: NameCardProps) {
  const identity = name.identity;
  const rarity = rarityPresentation[name.silhouette.rarityBand];
  const roleLabel = name.role?.label ?? 'No role';
  const roleInfluenceLabel = name.roleInfluence ? `${name.roleInfluence.level} influence` : 'role-neutral';
  const toneLabel = `${labelFor(name.silhouette.texture)} tone`;
  const formatLabel = identity ? identity.format.label : `${labelFor(name.silhouette.rhythm)} rhythm`;
  const densityClassName = `name-card panel ${textureClassName(name.silhouette.texture)}`;

  return (
    <details className={densityClassName}>
      <summary className="name-card-summary">
        <NameCardHeader name={name} />
        <span className="collapse-cue">Open</span>
      </summary>

      <div className="card-subviews">
        <details className="card-subview" open>
          <summary>Details</summary>
          <div className="card-subview-body">
            <ul className="metadata compact-metadata" aria-label={`${name.name} details`}>
              <li><span>Role</span><strong>{roleLabel}</strong></li>
              <li><span>Influence</span><strong>{roleInfluenceLabel}</strong></li>
              <li><span>Tone</span><strong>{toneLabel}</strong></li>
              <li><span>Format</span><strong>{formatLabel}</strong></li>
              <li><span>Rarity</span><strong className={rarity.className}>{rarity.label}</strong></li>
            </ul>

            {identity ? (
              <div>
                <h3>Name parts</h3>
                <ul className="variants">
                  {identity.parts.map((part) => <li key={part.id}><span>{part.value}</span><em>{part.role}</em></li>)}
                </ul>
              </div>
            ) : null}

            {name.roleInfluence ? (
              <div>
                <h3>Role influence</h3>
                <p className="section-note">{name.roleInfluence.label} nudged this result at {name.roleInfluence.level} strength: {name.roleInfluence.effects.join(', ')}.</p>
              </div>
            ) : null}
          </div>
        </details>

        <details className="card-subview">
          <summary>Diagnostics</summary>
          <div className="card-subview-body">
            <dl className="score-list compact-score-list" aria-label={`${name.name} diagnostic score breakdown`}>
              {scorePresentation.map((score) => <div key={`${name.id}-${score.key}`}><dt>{score.label}</dt><dd>{formatScore(name.scores[score.key])}</dd></div>)}
            </dl>
          </div>
        </details>
      </div>
    </details>
  );
}
