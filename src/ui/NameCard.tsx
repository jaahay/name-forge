import type { FictionCastGeneratedName } from '../fictionCast/types';
import { rarityPresentation } from './presentation';
import { textureClassName } from './score';
import { getNameDisplayLength, protectInitialBreaks } from './namePresentation';

interface NameCardHeaderProps {
  name: FictionCastGeneratedName;
}

interface NameCardProps {
  name: FictionCastGeneratedName;
  isSelected: boolean;
  isLocked: boolean;
  showExpandedSurface?: boolean;
  onSelect: (id: string) => void;
  onToggleLocked: (id: string) => void;
}

function readNoteLabel(name: FictionCastGeneratedName): string {
  const noteCount = name.readabilityDiagnostics.length;
  if (noteCount === 0) return 'Clean read';
  return `${noteCount} read note${noteCount === 1 ? '' : 's'}`;
}

function NameCardHeader({ name }: NameCardHeaderProps) {
  const rarity = rarityPresentation[name.rarityBand];
  const displayName = protectInitialBreaks(name.displayName);
  const displayLength = getNameDisplayLength(name.displayName);

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
    <div className="name-card-expanded" aria-label={`${name.displayName} quick details`}>
      <div className="name-card-sound-row">
        <span className="name-card-expanded-label">Sound sketch</span>
        <span className="name-card-sound-sketch">{name.primaryName.sound.transcription}</span>
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
  const displayLength = getNameDisplayLength(name.displayName);
  const readNoteCount = name.readabilityDiagnostics.length;
  const rarityBand = name.rarityBand;
  const cardClassName = `name-card panel ${textureClassName(name.primaryName.generationPlan.texture)}${isSelected ? ' selected' : ''}${isLocked ? ' locked' : ''}`;
  const isExpanded = isSelected && showExpandedSurface;
  const lockActionLabel = `${isLocked ? 'Unlock' : 'Lock'} ${name.displayName}`;

  return (
    <article
      className={cardClassName}
      data-expanded={isExpanded ? 'true' : 'false'}
      data-name-length={displayLength}
      data-rarity={rarityBand}
      data-role={name.role?.role ?? 'none'}
      data-read-notes={readNoteCount}
      aria-current={isSelected ? 'true' : undefined}
      aria-label={`${isExpanded ? 'Expanded' : 'Collapsed'} name card for ${name.displayName}`}
    >
      <button
        type="button"
        className="name-card-button name-card-select-control"
        aria-pressed={isSelected}
        aria-label={`Inspect ${name.displayName}`}
        onClick={() => onSelect(name.id)}
      >
        <NameCardHeader name={name} />
      </button>
      {isExpanded ? <ExpandedCardSurface name={name} /> : null}
      <div className="name-card-actions" aria-label={`${name.displayName} card actions`}>
        <button
          type="button"
          className="anchor-button lock-toggle name-card-lock-control"
          aria-pressed={isLocked}
          aria-label={lockActionLabel}
          title={isLocked ? 'Unlock name' : 'Lock name'}
          onClick={() => onToggleLocked(name.id)}
        >
          <span className="lock-toggle-icon" aria-hidden="true" />
        </button>
      </div>
    </article>
  );
}
