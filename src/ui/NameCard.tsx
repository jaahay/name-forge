import type { GeneratedName } from '../engine/types';
import { rarityPresentation } from './presentation';
import { textureClassName } from './score';
import { getNameDisplayLength, protectInitialBreaks } from './namePresentation';

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
