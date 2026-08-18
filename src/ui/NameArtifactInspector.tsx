import type { ReactNode } from 'react';
import { renderAuditionCue } from '../engine/audition';
import type { NameArtifact } from '../engine/nameArtifact';
import { analyzeNameArtifact } from '../engine/nameArtifactAnalysis';
import type { NameVariant } from '../engine/types';
import { getNameDisplayLength, protectInitialBreaks } from './namePresentation';

interface NameArtifactInspectorProps {
  readonly artifact: NameArtifact;
  readonly displayText?: string;
  readonly voiceDraftText?: string;
  readonly eyebrow?: string;
  readonly extraActions?: ReactNode;
  readonly extraSections?: ReactNode;
}

type SpellingCandidate = NameArtifact['spellingCandidates'][number];

let speechPlaybackToken = 0;

function variantMetadataLabel(variant: NameVariant): string {
  const relationship = variant.relationship.replace(/_/g, ' ');
  const generatedLabel = variant.generated ? 'generated' : 'listed';
  return `${relationship}; ${variant.confidence} confidence; ${generatedLabel}; ${variant.source.label}`;
}

function isSelectedSpelling(candidate: SpellingCandidate, selected: SpellingCandidate): boolean {
  return candidate.text === selected.text
    && candidate.rank === selected.rank
    && candidate.score === selected.score;
}

function sameSoundSpellingMetadataLabel(candidate: SpellingCandidate, selected: SpellingCandidate): string {
  return isSelectedSpelling(candidate, selected) ? `selected; preference rank ${candidate.rank}` : `preference rank ${candidate.rank}`;
}

function copyText(value: string) {
  void navigator.clipboard?.writeText(value);
}

function canUseBrowserSpeech(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined';
}

function playVoiceDraft(segments: readonly string[]) {
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
      speakSegment(index + 1);
    };
    window.speechSynthesis.speak(utterance);
  }

  speakSegment(0);
}

export function browserVoiceDraftText(artifact: NameArtifact, soundSpeechText?: string): string {
  return soundSpeechText ?? artifact.spelling.text;
}

export function browserVoiceDraftSegments(artifact: NameArtifact, soundSpeechText?: string): readonly string[] {
  return [browserVoiceDraftText(artifact, soundSpeechText)];
}

function detailsText(artifact: NameArtifact, displayText: string, pronunciationGuide?: string): string {
  const analysis = analyzeNameArtifact(artifact);
  const generatedText = artifact.spelling.text;
  const spellings = artifact.spellingCandidates
    .map((candidate) => `${candidate.text} (${sameSoundSpellingMetadataLabel(candidate, artifact.spelling)})`)
    .join(', ') || 'None';

  return [
    displayText,
    displayText === generatedText ? undefined : `Generated name evidence: ${generatedText}`,
    `Sound sketch: ${artifact.sound.transcription}`,
    pronunciationGuide ? `Pronunciation guide: ${pronunciationGuide}` : undefined,
    analysis.structure ? `Structure: ${analysis.structure.syllableCount} syllable(s); ${analysis.structure.segmentCount} segments; ${analysis.structure.syllableShapes.join('-')}` : undefined,
    `Selected spelling: ${artifact.spelling.text} (preference rank ${artifact.spelling.rank})`,
    analysis.spelling?.selectionSummary,
    `Same-sound spellings: ${spellings}`,
    `Read status: ${analysis.readability.diagnosticCount === 0 ? 'No deterministic read-friction notes' : `${analysis.readability.diagnosticCount} read notes`}`,
  ].filter(Boolean).join('\n');
}

export function NameArtifactInspector({
  artifact,
  displayText = artifact.spelling.text,
  voiceDraftText,
  eyebrow = 'Inspect',
  extraActions,
  extraSections,
}: NameArtifactInspectorProps) {
  const generatedText = artifact.spelling.text;
  const otherSpellings = artifact.spellingCandidates.filter((candidate) => !isSelectedSpelling(candidate, artifact.spelling));
  const readNotes = artifact.readabilityDiagnostics;
  const variants = artifact.variants;
  const auditionCue = renderAuditionCue(artifact.sound.sequence);
  const soundDescription = auditionCue.displayText ?? artifact.sound.transcription;
  const voiceText = voiceDraftText ?? browserVoiceDraftText(artifact, auditionCue.speechText);
  const browserSpeechAvailable = canUseBrowserSpeech();
  const displayName = protectInitialBreaks(displayText);
  const displayLength = getNameDisplayLength(displayText);
  const playVoiceDraftLabel = browserSpeechAvailable
    ? `Play browser voice draft for ${displayText}`
    : `Browser voice draft unavailable for ${displayText}`;
  const hasMoreDetails = readNotes.length > 0 || variants.length > 0 || Boolean(extraSections);
  const spellingLabel = displayText === generatedText ? 'Spelling' : 'Generated spelling';

  return (
    <aside className="selected-name-panel panel" aria-labelledby={`artifact-heading-${artifact.id}`}>
      <header className="selected-name-heading">
        <div className="selected-name-title-block">
          <p className="eyebrow inspector-eyebrow">{eyebrow}</p>
          <h2 id={`artifact-heading-${artifact.id}`} className="name-card-title" data-name-length={displayLength}>{displayName}</h2>
        </div>
        <div className="selected-name-heading-tools">
          <div className="selected-name-actions" aria-label={`${displayText} selected-name actions`}>
            <button type="button" className="secondary inspector-voice-action" aria-label={playVoiceDraftLabel} disabled={!browserSpeechAvailable} onClick={() => playVoiceDraft([voiceText])}>Play name</button>
            {extraActions}
          </div>
          <div className="selected-name-utilities" aria-label={`${displayText} copy actions`}>
            <button type="button" aria-label={`Copy name ${displayText}`} onClick={() => copyText(displayText)}>Copy name</button>
            <button type="button" aria-label={`Copy details ${displayText}`} onClick={() => copyText(detailsText(artifact, displayText, auditionCue.displayText))}>Copy details</button>
          </div>
        </div>
      </header>

      <div className="inspector-primary" aria-label={`Selected details for ${displayText}`}>
        <section className="inspector-essential inspector-sound" aria-labelledby={`sound-heading-${artifact.id}`}>
          <div className="inspector-essential-heading">
            <h3 id={`sound-heading-${artifact.id}`}>Sound</h3>
          </div>
          <p className="inspector-sound-description">{soundDescription}</p>
          <p className="inspector-transcription">{artifact.sound.transcription}</p>
        </section>

        <section className="inspector-essential inspector-spelling" aria-labelledby={`spelling-heading-${artifact.id}`}>
          <div className="inspector-essential-heading">
            <h3 id={`spelling-heading-${artifact.id}`}>{spellingLabel}</h3>
          </div>
          <p className="inspector-spelling-primary">{artifact.spelling.text}</p>
          {otherSpellings.length > 0 ? (
            <div className="inspector-alternates">
              <span>Alternates</span>
              <ul aria-label={`${generatedText} other spellings`}>
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
              <section className="inspector-detail-group inspector-read-details" aria-label={`${displayText} readability notes`}>
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
                <ul className="variants detail-variants" aria-label={`${generatedText} variants`}>
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
