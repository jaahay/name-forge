import { toFictionCastPrimaryNameArtifact } from '../fictionCast/nameArtifact';
import type { FictionCastGeneratedName } from '../fictionCast/types';
import { NameArtifactInspector } from './NameArtifactInspector';
import { rarityPresentation, scorePresentation } from './presentation';
import { formatScore } from './score';
import { labelFor } from './namePresentation';

interface NameInspectorProps {
  name: FictionCastGeneratedName;
  isLocked: boolean;
  onRerollName: () => void;
  onToggleLockedName: (id: string) => void;
}

let componentSpeechPlaybackToken = 0;

function canUseBrowserSpeech(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined';
}

function playComponentVoiceDraft(speechText: string) {
  if (!canUseBrowserSpeech() || !speechText.trim()) return;

  componentSpeechPlaybackToken += 1;
  const playbackToken = componentSpeechPlaybackToken;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(speechText);
  utterance.onend = () => {
    if (playbackToken !== componentSpeechPlaybackToken) return;
  };
  window.speechSynthesis.speak(utterance);
}

function castSections(name: FictionCastGeneratedName) {
  const identity = name.identity;
  const primaryName = name.primaryName;
  const rarity = rarityPresentation[name.rarityBand];
  const roleLabel = name.role?.label ?? 'No role';
  const roleInfluenceLabel = name.roleInfluence ? `${name.roleInfluence.level} influence` : 'Role-neutral';
  const textureLabel = `${labelFor(primaryName.generationPlan.texture)} texture`;
  const formatLabel = identity.format.label;
  const contextualScores = name.contextualScores;
  const soundParts = name.identityAudition.parts.filter((part) => part.kind === 'sound');
  const browserSpeechAvailable = canUseBrowserSpeech();

  return (
    <>
      <section className="inspector-detail-group">
        <h3>Cast context</h3>
        <dl className="inspector-detail-facts">
          <div><dt>Role</dt><dd>{roleLabel}</dd></div>
          <div><dt>Format</dt><dd>{formatLabel}</dd></div>
          <div><dt>Rarity</dt><dd>{rarity.label}</dd></div>
          <div><dt>Texture</dt><dd>{textureLabel}</dd></div>
          <div><dt>Syllables</dt><dd>{primaryName.generationPlan.syllableCount}</dd></div>
          <div><dt>Influence</dt><dd>{roleInfluenceLabel}</dd></div>
        </dl>
        {name.roleInfluence ? (
          <p className="inspector-detail-note">
            <strong>{name.roleInfluence.label}</strong>
            <span>{name.roleInfluence.effects.join(', ')}</span>
          </p>
        ) : null}
      </section>

      <section className="inspector-detail-group">
        <h3>Composition</h3>
        <ul className="inspector-name-parts">
          {identity.parts.map((part) => <li key={part.id}><span>{part.value}</span><em>{part.role}</em></li>)}
        </ul>
      </section>

      {soundParts.length > 0 ? (
        <section className="inspector-detail-group" aria-label={`${name.displayName} modeled sound parts`}>
          <h3>Component sound drafts</h3>
          <ul className="inspector-sound-parts inspector-sound-components">
            {soundParts.map((part) => {
              const playLabel = browserSpeechAvailable
                ? `Play sound draft for ${part.value}`
                : `Browser voice draft unavailable for ${part.value}`;
              return (
                <li key={`${name.id}-${part.index}-${part.sourceNameId}`}>
                  <div className="inspector-sound-component-copy">
                    <strong>{part.value}</strong>
                    <span>{part.displayText}</span>
                  </div>
                  <button
                    type="button"
                    className="inspector-component-play"
                    aria-label={playLabel}
                    disabled={!browserSpeechAvailable}
                    onClick={() => playComponentVoiceDraft(part.cue.speechText)}
                  >
                    Play
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      <section className="inspector-detail-group" aria-label={`${name.displayName} score breakdown`}>
        <h3>Score detail</h3>
        <dl className="score-list detail-score-list">
          {scorePresentation.map((score) => <div key={`${name.id}-${score.key}`}><dt>{score.label}</dt><dd>{formatScore(primaryName.scores[score.key])}</dd></div>)}
          <div><dt>Cast fit</dt><dd>{formatScore(contextualScores.ensembleFit)}</dd></div>
          <div><dt>Role fit</dt><dd>{formatScore(contextualScores.roleFit)}</dd></div>
        </dl>
      </section>
    </>
  );
}

export function NameInspector({ name, isLocked, onRerollName, onToggleLockedName }: NameInspectorProps) {
  return (
    <NameArtifactInspector
      artifact={toFictionCastPrimaryNameArtifact(name)}
      displayText={name.displayName}
      voiceDraftText={name.identityAudition.speechText}
      extraActions={(
        <>
          <button
            type="button"
            className="secondary selected-name-reroll-action"
            aria-label={`Reroll ${name.displayName}`}
            disabled={isLocked}
            title={isLocked ? 'Unlock this name to reroll it.' : undefined}
            onClick={onRerollName}
          >
            Reroll
          </button>
          <button
            type="button"
            className="secondary selected-name-lock-action"
            aria-pressed={isLocked}
            aria-label={`${isLocked ? 'Unlock' : 'Lock'} ${name.displayName}`}
            onClick={() => onToggleLockedName(name.id)}
          >
            {isLocked ? 'Unlock' : 'Lock'}
          </button>
        </>
      )}
      extraSections={castSections(name)}
    />
  );
}
