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
  readonly pronunciationGuideText?: string;
  readonly eyebrow?: string;
  readonly extraActions?: ReactNode;
  readonly promotedSections?: ReactNode;
  readonly extraSections?: ReactNode;
  readonly primaryPresentation?: 'default' | 'pronunciation-guide';
  readonly actionPresentation?: 'text' | 'icon';
  readonly showVariants?: boolean;
  readonly showPronunciationAlternates?: boolean;
  readonly detailsLabel?: string;
  readonly detailsDescription?: string;
}

type SpellingCandidate = NameArtifact['spellingCandidates'][number];

type InspectorActionIconKind = 'play' | 'copy' | 'details';

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

function InspectorActionIcon({ kind }: { kind: InspectorActionIconKind }) {
  if (kind === 'play') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M8 5.6v12.8L18 12 8 5.6Z" />
      </svg>
    );
  }

  if (kind === 'details') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M7 3.5h7l4 4V20.5H7V3.5Z" />
        <path d="M14 3.5v4h4M10 12h5M10 15h5" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <rect x="8" y="8" width="10" height="11" rx="1.5" />
      <path d="M6 16H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v1" />
    </svg>
  );
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
  pronunciationGuideText,
  eyebrow = 'Inspect',
  extraActions,
  promotedSections,
  extraSections,
  primaryPresentation = 'default',
  actionPresentation = 'text',
  showVariants = true,
  showPronunciationAlternates = true,
  detailsLabel = 'More details',
  detailsDescription = 'Read notes, context, variants and scoring',
}: NameArtifactInspectorProps) {
  const generatedText = artifact.spelling.text;
  const otherSpellings = artifact.spellingCandidates.filter((candidate) => !isSelectedSpelling(candidate, artifact.spelling));
  const readNotes = artifact.readabilityDiagnostics;
  const variants = artifact.variants;
  const auditionCue = renderAuditionCue(artifact.sound.sequence);
  const soundDescription = auditionCue.displayText ?? artifact.sound.transcription;
  const pronunciationGuide = pronunciationGuideText ?? soundDescription;
  const voiceText = voiceDraftText ?? browserVoiceDraftText(artifact, auditionCue.speechText);
  const browserSpeechAvailable = canUseBrowserSpeech();
  const displayName = protectInitialBreaks(displayText);
  const displayLength = getNameDisplayLength(displayText);
  const playVoiceDraftLabel = primaryPresentation === 'pronunciation-guide'
    ? `Play pronunciation guide for ${displayText}`
    : browserSpeechAvailable
      ? `Play browser voice draft for ${displayText}`
      : `Browser voice draft unavailable for ${displayText}`;
  const playVoiceDraftTitle = primaryPresentation === 'pronunciation-guide'
    ? browserSpeechAvailable ? 'Play pronunciation guide' : 'Pronunciation guide playback unavailable'
    : undefined;
  const hasMoreDetails = readNotes.length > 0 || (showVariants && variants.length > 0) || Boolean(extraSections);
  const spellingLabel = displayText === generatedText ? 'Spelling' : 'Generated spelling';
  const useIconActions = actionPresentation === 'icon';
  const composedEvidence = primaryPresentation === 'pronunciation-guide' && displayText !== generatedText;
  const artifactEvidenceText = composedEvidence ? generatedText : displayText;
  const detailsPronunciationGuide = primaryPresentation === 'pronunciation-guide' ? pronunciationGuide : auditionCue.displayText;

  return (
    <aside
      className="selected-name-panel panel"
      aria-labelledby={`artifact-heading-${artifact.id}`}
      data-inspector-presentation={primaryPresentation}
    >
      <header className="selected-name-heading">
        <div className="selected-name-title-block">
          <p className="eyebrow inspector-eyebrow">{eyebrow}</p>
          <h2 id={`artifact-heading-${artifact.id}`} className="selected-name-title" data-name-length={displayLength}>{displayName}</h2>
        </div>
        <div className="selected-name-heading-tools">
          <div className="selected-name-actions" aria-label={`${displayText} selected-name actions`}>
            {primaryPresentation === 'default' ? (
              <button
                type="button"
                className={`secondary inspector-voice-action${useIconActions ? ' inspector-icon-action' : ''}`}
                aria-label={playVoiceDraftLabel}
                disabled={!browserSpeechAvailable}
                onClick={() => playVoiceDraft([voiceText])}
              >
                {useIconActions ? <InspectorActionIcon kind="play" /> : 'Play name'}
              </button>
            ) : null}
            {extraActions}
          </div>
          <div className="selected-name-utilities" aria-label={`${displayText} copy actions`}>
            <button
              type="button"
              className={useIconActions ? 'inspector-icon-action selected-name-copy-action' : undefined}
              aria-label={`Copy name ${displayText}`}
              title={useIconActions ? 'Copy name' : undefined}
              onClick={() => copyText(displayText)}
            >
              {useIconActions ? <InspectorActionIcon kind="copy" /> : 'Copy name'}
            </button>
            <button
              type="button"
              className={useIconActions ? 'inspector-icon-action selected-details-copy-action' : undefined}
              aria-label={`Copy details ${displayText}`}
              title={useIconActions ? 'Copy details' : undefined}
              onClick={() => copyText(detailsText(artifact, displayText, detailsPronunciationGuide))}
            >
              {useIconActions ? <InspectorActionIcon kind="details" /> : 'Copy details'}
            </button>
          </div>
        </div>
      </header>

      {primaryPresentation === 'pronunciation-guide' ? (
        <div className="inspector-primary inspector-primary-compact" aria-label={`Selected details for ${displayText}`}>
          <section className="inspector-pronunciation" aria-label={`Pronunciation guide for ${displayText}`}>
            <div className="inspector-pronunciation-line">
              <p className="inspector-sound-description">{pronunciationGuide}</p>
              <button
                type="button"
                className="secondary inspector-icon-action inspector-pronunciation-play"
                aria-label={playVoiceDraftLabel}
                title={playVoiceDraftTitle}
                disabled={!browserSpeechAvailable}
                onClick={() => playVoiceDraft([voiceText])}
              >
                <InspectorActionIcon kind="play" />
              </button>
            </div>
            {showPronunciationAlternates && otherSpellings.length > 0 ? (
              <div className="inspector-alternates inspector-alternates-compact">
                <span>Alternative spellings</span>
                <ul aria-label={`${generatedText} other spellings`}>
                  {otherSpellings.map((candidate) => <li key={`${artifact.id}-${candidate.rank}-${candidate.text}`}>{candidate.text}</li>)}
                </ul>
              </div>
            ) : null}
          </section>
        </div>
      ) : (
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
      )}

      {promotedSections ? <div className="inspector-promoted">{promotedSections}</div> : null}

      {hasMoreDetails ? (
        <details className="inspector-more">
          <summary>
            <span>{detailsLabel}</span>
            <small>{detailsDescription}</small>
          </summary>
          <div className="inspector-more-body">
            {primaryPresentation === 'pronunciation-guide' ? (
              <section className="inspector-detail-group inspector-sound-evidence" aria-label={`${artifactEvidenceText} sound evidence`}>
                <h3>{composedEvidence ? 'Generated component sound' : 'Sound evidence'}</h3>
                <p className="inspector-transcription">{artifact.sound.transcription}</p>
                {composedEvidence ? (
                  <dl className="inspector-detail-facts">
                    <div><dt>Component</dt><dd>{generatedText}</dd></div>
                  </dl>
                ) : null}
              </section>
            ) : null}
            {readNotes.length > 0 ? (
              <section className="inspector-detail-group inspector-read-details" aria-label={`${artifactEvidenceText} readability notes`}>
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
            {showVariants && variants.length > 0 ? (
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
