import type { GeneratedName } from '../engine/types';
import { rarityPresentation, scorePresentation } from './presentation';
import { formatScore, textureClassName } from './score';

type NameDisplayLength = 'short' | 'medium' | 'long' | 'very-long';

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
}

function labelFor(value: string): string {
  return value
    .split('-')
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(' ');
}

function getNameDisplayLength(name: string): NameDisplayLength {
  const length = name.length;
  const words = name.trim().split(/\s+/).filter(Boolean).length;

  if (length <= 18 && words <= 2) return 'short';
  if (length <= 30 && words <= 3) return 'medium';
  if (length <= 44 && words <= 5) return 'long';
  return 'very-long';
}

function protectInitialBreaks(name: string): string {
  return name.replace(/\b([A-Z])\.\s+/g, '$1.\u00A0');
}

function terminalCueFor(name: GeneratedName): string {
  const lettersOnly = name.name.replace(/[^A-Za-z]+/g, '');
  return (lettersOnly.slice(-3) || name.name.slice(-3)).toLowerCase();
}

function rarityCueFor(rarityBand: GeneratedName['silhouette']['rarityBand']): string {
  switch (rarityBand) {
    case 'common':
      return 'Grounded and table-ready; useful for guards, merchants, town records, and repeatable cultures.';
    case 'uncommon':
      return 'Distinctive without becoming plot-heavy; good for allies, rivals, named locals, and minor factions.';
    case 'rare':
      return 'Memorable and scene-forward; good for patrons, faction leaders, recurring villains, and marquee NPCs.';
    case 'epic':
      return 'Mythic or high-signal; good for ancient houses, boss-level NPCs, artifacts, and prophecy names.';
    case 'legendary':
      return 'Singular and campaign-defining; reserve for icons, lost empires, deities, or one-name legends.';
  }
}

function constructionCueFor(name: GeneratedName): string {
  const opening = name.identity?.parts?.[0]?.value ?? name.name.trim().split(/\s+/)[0] ?? name.name;
  const terminalCue = terminalCueFor(name);
  const texture = labelFor(name.silhouette.texture).toLowerCase();
  const rhythm = labelFor(name.silhouette.rhythm).toLowerCase();

  return `${texture} opening around ${opening}; ${rhythm} rhythm; terminal ${terminalCue} ending.`;
}

function NameCardHeader({ name }: NameCardHeaderProps) {
  const rarity = rarityPresentation[name.silhouette.rarityBand];
  const displayName = protectInitialBreaks(name.name);
  const displayLength = getNameDisplayLength(name.name);

  return (
    <div className="name-card-header">
      <div className="name-card-title-block">
        <h2 className={`name-card-title ${rarity.className}`} data-name-length={displayLength}>{displayName}</h2>
      </div>
      <div className="name-card-meta" aria-label={`${rarity.label} rarity, ${name.silhouette.syllableCount} syllables`}>
        <span className={`rarity-chip ${rarity.className}`}>{rarity.label}</span>
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

export function NameCard({ name, isSelected, isLocked, onSelect, onToggleLocked }: NameCardProps) {
  const displayLength = getNameDisplayLength(name.name);
  const cardClassName = `name-card panel ${textureClassName(name.silhouette.texture)}${isSelected ? ' selected' : ''}${isLocked ? ' locked' : ''}`;

  return (
    <article className={cardClassName} data-name-length={displayLength} data-rarity={name.silhouette.rarityBand} aria-current={isSelected ? 'true' : undefined}>
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
