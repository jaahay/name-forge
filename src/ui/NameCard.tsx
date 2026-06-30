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
  showExpandedSurface?: boolean;
  onSelect: (id: string) => void;
  onToggleLocked: (id: string) => void;
}

function readNoteLabel(name: GeneratedName): string {
  const noteCount = name.readabilityDiagnostics.length;
  if (noteCount === 0) return 'Clean read';
  return `${noteCount} read note${noteCount === 1 ? '' : 's'}`;
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
    </div>
  );
}

function ExpandedCardSurface({ name }: NameCardHeaderProps) {
  return (
    <div className="name-card-expanded" aria-label={`${name.name} quick details`}>
      <div className="name-card-sound-row">
        <span className="name-card-expanded-label">Sound sketch</span>
        <span className="name-card-sound-sketch">{name.sound.transcription}</span>
        <span
          className="sound-playback-placeholder"
          role="img"
          aria-label="Sound playback planned"
          title="Sound playback planned"
        >
          <span aria-hidden="true">♪</span>
        </span>
      </div>
      <div className="name-card-read-status">{readNoteLabel(name)}</div>
    </div>
  );
}

export function NameCard({ name, isSelected, isLocked, showExpandedSurface = true, onSelect, onToggleLocked }: NameCardProps) {
  const displayLength = getNameDisplayLength(name.name);
  const readNoteCount = name.readabilityDiagnostics.length;
  const cardClassName = `name-card panel ${textureClassName(name.silhouette.texture)}${isSelected ? ' selected' : ''}${isLocked ? ' locked' : ''}`;
  const isExpanded = isSelected && showExpandedSurface;

  return (
    <article
      className={cardClassName}
      data-expanded={isExpanded ? 'true' : 'false'}
      data-name-length={displayLength}
      data-rarity={name.silhouette.rarityBand}
      data-role={name.role?.role ?? 'none'}
      data-read-notes={readNoteCount}
      aria-current={isSelected ? 'true' : undefined}
      aria-label={`${isExpanded ? 'Expanded' : 'Collapsed'} name card for ${name.name}`}
    >
      <button
        type="button"
        className="name-card-button"
        aria-pressed={isSelected}
        aria-label={`Inspect ${name.name}`}
        onClick={() => onSelect(name.id)}
      >
        <NameCardHeader name={name} />
      </button>
      {isExpanded ? <ExpandedCardSurface name={name} /> : null}
      <button
        type="button"
        className="anchor-button lock-toggle"
        aria-pressed={isLocked}
        aria-label={`${isLocked ? 'Unlock' : 'Lock'} ${name.name}`}
        title={isLocked ? 'Unlock name' : 'Lock name'}
        onClick={() => onToggleLocked(name.id)}
      >
        <span className="lock-toggle-icon" aria-hidden="true" />
      </button>
    </article>
  );
}
