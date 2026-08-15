import type { ReactNode } from 'react';
import { renderAuditionCue } from '../engine/audition';
import type { IdentityAuditionSoundPart } from '../engine/identityAudition';
import type { NameArtifact } from '../engine/nameArtifact';
import { analyzeNameArtifact } from '../engine/nameArtifactAnalysis';
import type { NameVariant } from '../engine/types';
import { getNameDisplayLength, protectInitialBreaks } from './namePresentation';

interface NameArtifactInspectorProps {
  readonly artifact: NameArtifact;
  readonly eyebrow?: string;
  readonly extraActions?: ReactNode;
  readonly extraSections?: ReactNode;
}

type SpellingCandidate = NonNullable<NameArtifact['spellingCandidates']>[number];

const identityPartPauseMs = 150;
let speechPlaybackToken = 0;

function variantMetadataLabel(variant: NameVariant): string {
  const relationship = variant.relationship.replace(/_/g, ' ');
  const generatedLabel = variant.generated ? 'generated' : 'listed';
  return `${relationship}; ${variant.confidence} confidence; ${generatedLabel}; ${variant.source.label}`;
}

function isSelectedSpelling(candidate: SpellingCandidate, selected: SpellingCandidate | undefined): boolean {
  return Boolean(selected
    && candidate.text === selected.text
    && candidate.rank === selected.rank
    && candidate.score === selected.score);
}

function sameSoundSpellingMetadataLabel(candidate: SpellingCandidate, selected: SpellingCandidate | undefined): string {
  return isSelectedSpelling(candidate, selected) ? `selected; preference rank ${candidate.rank}` : `preference rank ${candidate.rank}`;
}

function copyText(value: string) {
  void navigator.clipboard?.writeText(value);
}

function canUseBrowserSpeech(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined';
}

function playVoiceDraft(segments: readonly string[], pauseMs = 0) {
  if (!canUseBrowserSpeech()) return;
  const speechSegments = segments.map((segment) => segment.trim()).filter(Boolean);
  if (speechSegments.length === 0) return;

  speechPlaybackToken += 1;
  const playbackToken = speechPlaybackToken;
  window.speechSynthesis.cancel();

  function speakSegment(index: number) {
    if (playbackToken !== speechPlaybackToken) return;
    const speechText = speechSegments[index];
    if (!speechText) return;

    const utterance = new SpeechSynthesisUtterance(speechText);
    utterance.onend = () => {
      if (playbackToken !== speechPlaybackToken || index >= speechSegments.length - 1) return;
      if (pauseMs > 0) {
        window.setTimeout(() => speakSegment(index + 1), pauseMs);
      } else {
        speakSegment(index + 1);
      }
    };
    window.speechSynthesis.speak(utterance);
  }

  speakSegment(0);
}

export function browserVoiceDraftText(artifact: NameArtifact, soundSpeechText?: string): string {
  return artifact.identityAudition?.speechText ?? soundSpeechText ?? artifact.displayText;
}

function appendSpeechChunk(current: string, next: string): string {
  if (!current) return next;
  return /^[,.;:!?)]/.test(next) ? `${current}${next}` : `${current} ${next}`;
}

export function browserVoiceDraftSegments(artifact: NameArtifact, soundSpeechText?: string): readonly string[] {
  const phrase = artifact.identityAudition;
  if (!phrase) return [browserVoiceDraftText(artifact, soundSpeechText)];

  const segments: string[] = [];
  let lexicalChunk = '';

  function flushLexicalChunk() {
    if (!lexicalChunk) return;
    segments.push(lexicalChunk);
    lexicalChunk = '';
  }

  for (const part of phrase.parts) {
    if (part.kind === 'sound') {
      flushLexicalChunk();
      segments.push(part.speechText);
      continue;
    }
    lexicalChunk = appendSpeechChunk(lexicalChunk, part.speechText);
  }
  flushLexicalChunk();

  return segments.length > 0 ? segments : [phrase.speechText];
}

function modeledSoundParts(artifact: NameArtifact): readonly IdentityAuditionSoundPart[] {
  return artifact.identityAudition?.parts.filter((part): part is IdentityAuditionSoundPart => part.kind === 'sound') ?? [];
}

function detailsText(artifact: NameArtifact, pronunciationGuide?: string): string {
  const analysis = analyzeNameArtifact(artifact);
  const spellings = artifact.kind === 'generated-name'
    ? artifact.spellingCandidates
      .map((candidate) => `${candidate.text} (${sameSoundSpellingMetadataLabel(candidate, artifact.spelling)})`)
      .join(', ') || 'None'
    : undefined;
  const phraseSound = artifact.identityAudition?.displayText;
  const soundParts = modeledSoundParts(artifact)
    .map((part) => `${part.value}: ${part.transcription}`)
    .join(', ');

  return [
    artifact.displayText,
    phraseSound ? `Whole-name sound draft: ${phraseSound}` : undefined,
    soundParts ? `Modeled sound parts: ${soundParts}` : undefined,
    !phraseSound && artifact.sound ? `Sound sketch: ${artifact.sound.transcription}` : undefined,
    !phraseSound && pronunciationGuide ? `Pronunciation guide: ${pronunciationGuide}` : undefined,
    analysis.structure ? `Structure: ${analysis.structure.syllableCount} syllable(s); ${analysis.structure.segmentCount} segments; ${analysis.structure.syllableShapes.join('-')}` : undefined,
    artifact.spelling ? `Selected spelling: ${artifact.spelling.text} (preference rank ${artifact.spelling.rank})` : undefined,
    analysis.spelling?.selectionSummary,
    spellings ? `Same-sound spellings: ${spellings}` : undefined,
    `Read status: ${analysis.readability.diagnosticCount === 0 ? 'No deterministic read-friction notes' : `${analysis.readability.diagnosticCount} read notes`}`,
  ].filter(Boolean).join('\n');
}

export function NameArtifactInspector({ artifact, eyebrow = 'Inspect', extraActions, extraSections }: NameArtifactInspectorProps) {
  const isComposed = artifact.kind === 'composed-identity';
  const sameSoundSpellings = artifact.spellingCandidates ?? [];
  const otherSpellings = sameSoundSpellings.filter((candidate) => !isSelectedSpelling(candidate, artifact.spelling));
  const readNotes = artifact.readabilityDiagnostics;
  const variants = artifact.variants ?? [];
  const auditionCue = artifact.sound ? renderAuditionCue(artifact.sound.sequence) : undefined;
  const soundParts = modeledSoundParts(artifact);
  const showComponentSounds = isComposed && soundParts.length > 0;
  const soundDescription = auditionCue?.displayText ?? artifact.sound?.transcription;
  const voiceDraftSegments = browserVoiceDraftSegments(artifact, auditionCue?.speechText);
  const browserSpeechAvailable = canUseBrowserSpeech();
  const displayName = protectInitialBreaks(artifact.displayText);
  const displayLength = getNameDisplayLength(artifact.displayText);
  const playVoiceDraftLabel = browserSpeechAvailable
    ? `Play browser voice draft for ${artifact.displayText}`
    : `Browser voice draft unavailable for ${artifact.displayText}`;
  const hasMoreDetails = readNotes.length > 0 || variants.length > 0 || Boolean(extraSections);
  const spellingLabel = isComposed ? 'Display' : 'Spelling';

  return (
    <aside className="selected-name-panel panel" aria-labelledby={`artifact-heading-${artifact.id}`}>
      <header className="selected-name-heading">
        <div className="selected-name-title-block">
          <p className="eyebrow inspector-eyebrow">{eyebrow}</p>
          <h2 id={`artifact-heading-${artifact.id}`} className="name-card-title" data-name-length={displayLength}>{displayName}</h2>
        </div>
        <div className="selected-name-heading-tools">
          <div className="selected-name-actions" aria-label={`${artifact.displayText} selected-name actions`}>
            <button type="button" className="secondary inspector-voice-action" aria-label={playVoiceDraftLabel} disabled={!browserSpeechAvailable} onClick={() => playVoiceDraft(voiceDraftSegments, identityPartPauseMs)}>Play name</button>
            {extraActions}
          </div>
          <div className="selected-name-utilities" aria-label={`${artifact.displayText} copy actions`}>
            <button type="button" aria-label={`Copy name ${artifact.displayText}`} onClick={() => copyText(artifact.displayText)}>Copy name</button>
            <button type="button" aria-label={`Copy details ${artifact.displayText}`} onClick={() => copyText(detailsText(artifact, auditionCue?.displayText))}>Copy details</button>
          </div>
        </div>
      </header>

      <div className="inspector-primary" aria-label={`Selected details for ${artifact.displayText}`}>
        <section className="inspector-essential inspector-sound" aria-labelledby={`sound-heading-${artifact.id}`}>
          <div className="inspector-essential-heading">
            <h3 id={`sound-heading-${artifact.id}`}>Sound</h3>
            {showComponentSounds ? <span>modeled parts</span> : null}
          </div>
          {showComponentSounds ? (
            <ul className="inspector-sound-parts inspector-sound-components" aria-label={`${artifact.displayText} modeled sound parts`}>
              {soundParts.map((part) => {
                const partPlayLabel = browserSpeechAvailable
                  ? `Play sound draft for ${part.value}`
                  : `Browser voice draft unavailable for ${part.value}`;
                return (
                  <li key={`${artifact.id}-${part.index}-${part.sourceNameId}`}>
                    <div className="inspector-sound-component-copy">
                      <strong>{part.value}</strong>
                      <span>{part.displayText}</span>
                    </div>
                    <button
                      type="button"
                      className="inspector-component-play"
                      aria-label={partPlayLabel}
                      disabled={!browserSpeechAvailable}
                      onClick={() => playVoiceDraft([part.cue.speechText])}
                    >
                      Play
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <>
              <p className="inspector-sound-description">{soundDescription ?? 'Sound not available'}</p>
              {artifact.sound ? <p className="inspector-transcription">{artifact.sound.transcription}</p> : null}
            </>
          )}
        </section>

        <section className="inspector-essential inspector-spelling" aria-labelledby={`spelling-heading-${artifact.id}`}>
          <div className="inspector-essential-heading">
            <h3 id={`spelling-heading-${artifact.id}`}>{spellingLabel}</h3>
            {isComposed ? <span>composed identity</span> : null}
          </div>
          <p className="inspector-spelling-primary">{isComposed ? artifact.displayText : artifact.spelling.text}</p>
          {otherSpellings.length > 0 ? (
            <div className="inspector-alternates">
              <span>Alternates</span>
              <ul aria-label={`${artifact.displayText} other spellings`}>
                {otherSpellings.map((candidate) => <li key={`${artifact.id}-${candidate.rank}-${candidate.text}`}>{candidate.text}</li>)}
              </ul>
            </div>
          ) : null}
        </section>
      </div>

      {hasMoreDetails ? (
        <details className="inspector-more">
          <summary>
            <span>More details</span>
            <small>Read notes, context, variants and scoring</small>
          </summary>
          <div className="inspector-more-body">
            {readNotes.length > 0 ? (
              <section className="inspector-detail-group inspector-read-details" aria-label={`${artifact.displayText} readability notes`}>
                <h3>Read notes</h3>
                <div className="inspector-read-note-list">
                  {readNotes.map((diagnostic) => (
                    <p key={`${artifact.id}-${diagnostic.id}`} className={diagnostic.severity}>
                      <strong>{diagnostic.label}</strong>
                      <span>{diagnostic.detail}</span>
                    </p>
                  ))}
                </div>
              </section>
            ) : null}
            {variants.length > 0 ? (
              <section className="inspector-detail-group inspector-variants-group">
                <h3>Variants</h3>
                <ul className="variants detail-variants" aria-label={`${artifact.displayText} variants`}>
                  {variants.map((variant) => <li key={`${artifact.id}-${variant.value}`}><span>{variant.value}</span><em>{variantMetadataLabel(variant)}</em></li>)}
                </ul>
              </section>
            ) : null}
            {extraSections}
          </div>
        </details>
      ) : null}
    </aside>
  );
}
