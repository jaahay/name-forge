import type { GeneratedName } from '../engine/types';
import { rarityPresentation, scorePresentation } from './presentation';
import { formatScore } from './score';
import { constructionCueFor, getNameDisplayLength, labelFor, protectInitialBreaks, rarityCueFor } from './namePresentation';

interface NameInspectorProps {
  name: GeneratedName;
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
  const displayName = protectInitialBreaks(name.name);
  const displayLength = getNameDisplayLength(name.name);

  return (
    <aside className="selected-name-panel panel" aria-labelledby="selected-name-heading">
      <header className="selected-name-heading">
        <div className="selected-name-title-block">
          <p className="eyebrow inspector-eyebrow">Inspect</p>
          <h2 id="selected-name-heading" className={`name-card-title ${rarity.className}`} data-name-length={displayLength}>{displayName}</h2>
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
        <section className="detail-block">
          <h3>Rarity cue</h3>
          <p className="section-note"><strong>{rarity.label}</strong> is a narrative tier, not a quality score. {rarityCueFor(name.silhouette.rarityBand)}</p>
        </section>

        <section className="detail-block">
          <h3>Construction cues</h3>
          <p className="section-note">{constructionCueFor(name)}</p>
        </section>

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
