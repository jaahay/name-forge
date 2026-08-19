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

function RerollIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M19 8V4l-2 2a7 7 0 1 0 1.4 8" />
      <path d="M19 4h-4" />
    </svg>
  );
}

function LockIcon({ locked }: { locked: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <rect x="6" y="10" width="12" height="10" rx="2" />
      <path d={locked ? 'M8.5 10V7.5a3.5 3.5 0 0 1 7 0V10' : 'M15.5 10V7.5a3.5 3.5 0 0 0-7 0'} />
    </svg>
  );
}

function castContext(name: FictionCastGeneratedName) {
  const rarity = rarityPresentation[name.rarityBand];
  const roleLabel = name.role?.label ?? 'No role';
  const roleInfluenceLabel = name.roleInfluence ? `${labelFor(name.roleInfluence.level)} influence` : 'Role-neutral';

  return (
    <section className="inspector-cast-context" aria-labelledby={`cast-context-heading-${name.id}`}>
      <h3 id={`cast-context-heading-${name.id}`}>Cast context</h3>
      <dl className="inspector-cast-context-facts">
        <div><dt>Role</dt><dd>{roleLabel}</dd></div>
        <div><dt>Format</dt><dd>{name.identity.format.label}</dd></div>
        <div><dt>Rarity</dt><dd>{rarity.label}</dd></div>
        <div><dt>Influence</dt><dd>{roleInfluenceLabel}</dd></div>
      </dl>
      {name.roleInfluence ? (
        <p className="inspector-cast-context-note">
          <strong>{name.roleInfluence.label}</strong>
          <span>{name.roleInfluence.effects.join(', ')}</span>
        </p>
      ) : null}
    </section>
  );
}

function castBreakdownSections(name: FictionCastGeneratedName) {
  const identity = name.identity;
  const primaryName = name.primaryName;
  const contextualScores = name.contextualScores;
  const soundParts = name.identityAudition.parts.filter((part) => part.kind === 'sound');
  const browserSpeechAvailable = canUseBrowserSpeech();
  const plan = primaryName.generationPlan;

  return (
    <>
      <section className="inspector-detail-group" aria-label={`${name.displayName} generation plan`}>
        <h3>Generation</h3>
        <dl className="inspector-detail-facts">
          <div><dt>Texture</dt><dd>{labelFor(plan.texture)}</dd></div>
          <div><dt>Syllables</dt><dd>{plan.syllableCount}</dd></div>
          <div><dt>Rhythm</dt><dd>{labelFor(plan.rhythm)}</dd></div>
          <div><dt>Length</dt><dd>{labelFor(plan.targetLength)}</dd></div>
          <div><dt>Stress</dt><dd>{plan.stressPattern}</dd></div>
          <div><dt>Shape</dt><dd>{plan.shape.join('-')}</dd></div>
        </dl>
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
      primaryPresentation="pronunciation-guide"
      actionPresentation="icon"
      showVariants={false}
      detailsLabel="Breakdown"
      detailsDescription="Sound, construction, read notes and scoring"
      extraActions={(
        <>
          <button
            type="button"
            className="secondary inspector-icon-action selected-name-reroll-action"
            aria-label={`Reroll ${name.displayName}`}
            disabled={isLocked}
            title={isLocked ? 'Unlock this name to reroll it.' : 'Reroll name'}
            onClick={onRerollName}
          >
            <RerollIcon />
          </button>
          <button
            type="button"
            className="secondary inspector-icon-action selected-name-lock-action"
            aria-pressed={isLocked}
            aria-label={`${isLocked ? 'Unlock' : 'Lock'} ${name.displayName}`}
            title={`${isLocked ? 'Unlock' : 'Lock'} name`}
            onClick={() => onToggleLockedName(name.id)}
          >
            <LockIcon locked={isLocked} />
          </button>
        </>
      )}
      promotedSections={castContext(name)}
      extraSections={castBreakdownSections(name)}
    />
  );
}
