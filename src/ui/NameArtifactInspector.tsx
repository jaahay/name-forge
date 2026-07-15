import type { ReactNode } from 'react';
import { renderAuditionCue } from '../engine/audition';
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

function variantMetadataLabel(variant: NameVariant): string {
  const relationship = variant.relationship.replace(/_/g, ' ');
  const generatedLabel = variant.generated ? 'generated' : 'listed';
  return `${relationship}; ${variant.confidence} confidence; ${generatedLabel}; ${variant.source.label}`;
}

function sameSoundSpellingMetadataLabel(candidate: SpellingCandidate, selectedSpellingId: string | undefined): string {
  return candidate.id === selectedSpellingId ? `selected; preference rank ${candidate.rank}` : `preference rank ${candidate.rank}`;
}

function copyText(value: string) {
  void navigator.clipboard?.writeText(value);
}

function canUseBrowserSpeech(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined';
}

function playVoiceDraft(speechText: string) {
  if (!canUseBrowserSpeech()) return;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(new SpeechSynthesisUtterance(speechText));
}

function detailsText(artifact: NameArtifact, pronunciationGuide?: string): string {
  const analysis = analyzeNameArtifact(artifact);
  const spellings = (artifact.spellingCandidates ?? [])
    .map((candidate) => `${candidate.text} (${sameSoundSpellingMetadataLabel(candidate, artifact.spelling?.id)})`)
    .join(', ') || 'None';

  return [
    artifact.displayText,
    artifact.sound ? `Sound sketch: ${artifact.sound.transcription}` : undefined,
    pronunciationGuide ? `Pronunciation guide: ${pronunciationGuide}` : undefined,
    analysis.structure ? `Structure: ${analysis.structure.syllableCount} syllable(s); ${analysis.structure.segmentCount} segments; ${analysis.structure.syllableShapes.join('-')}` : undefined,
    artifact.spelling ? `Selected spelling: ${artifact.spelling.text} (preference rank ${artifact.spelling.rank})` : undefined,
    analysis.spelling?.selectionSummary,
    `Same-sound spellings: ${spellings}`,
    `Read status: ${analysis.readability.diagnosticCount === 0 ? 'No deterministic read-friction notes' : `${analysis.readability.diagnosticCount} read notes`}`,
  ].filter(Boolean).join('\n');
}

export function NameArtifactInspector({ artifact, eyebrow = 'Inspect', extraActions, extraSections }: NameArtifactInspectorProps) {
  const analysis = analyzeNameArtifact(artifact);
  const sameSoundSpellings = artifact.spellingCandidates ?? [];
  const readNotes = artifact.readabilityDiagnostics ?? [];
  const variants = artifact.variants ?? [];
  const auditionCue = artifact.sound ? renderAuditionCue(artifact.sound.sequence) : undefined;
  const browserSpeechAvailable = Boolean(auditionCue) && canUseBrowserSpeech();
  const displayName = protectInitialBreaks(artifact.displayText);
  const displayLength = getNameDisplayLength(artifact.displayText);
  const playVoiceDraftLabel = browserSpeechAvailable
    ? `Play browser voice draft for ${artifact.displayText}`
    : `Browser voice draft unavailable for ${artifact.displayText}`;

  return (
    <aside className="selected-name-panel panel" aria-labelledby={`artifact-heading-${artifact.id}`}>
      <header className="selected-name-heading">
        <div className="selected-name-title-block">
          <p className="eyebrow inspector-eyebrow">{eyebrow}</p>
          <h2 id={`artifact-heading-${artifact.id}`} className="name-card-title" data-name-length={displayLength}>{displayName}</h2>
        </div>
        <div className="selected-name-heading-tools">
          <div className="selected-name-actions" aria-label={`${artifact.displayText} selected-name actions`}>
            <button type="button" className="secondary" aria-label={`Copy name ${artifact.displayText}`} onClick={() => copyText(artifact.displayText)}>Copy name</button>
            <button type="button" className="secondary" aria-label={`Copy details ${artifact.displayText}`} onClick={() => copyText(detailsText(artifact, auditionCue?.displayText))}>Copy details</button>
            {auditionCue ? <button type="button" className="secondary" aria-label={playVoiceDraftLabel} disabled={!browserSpeechAvailable} onClick={() => playVoiceDraft(auditionCue.speechText)}>Play voice draft</button> : null}
            {extraActions}
          </div>
        </div>
      </header>

      <div className="name-detail-grid" aria-label={`Selected details for ${artifact.displayText}`}>
        <section className="detail-block artifact-detail-block">
          <h3>Sound</h3>
          <dl className="artifact-fact-list">
            <div><dt>Sound sketch</dt><dd>{artifact.sound?.transcription ?? 'Not available'}</dd></div>
            <div><dt>Pronunciation guide</dt><dd>{auditionCue?.displayText ?? 'Not available'}</dd></div>
            <div><dt>Playback</dt><dd>{browserSpeechAvailable ? 'Browser voice draft available' : 'Browser voice unavailable'}</dd></div>
          </dl>
          <p className="section-note">Guide is generated from the sound model. Browser voice is an approximation, not a canonical pronunciation. Neither is a measured ease score.</p>
        </section>

        {analysis.structure ? (
          <details className="detail-block artifact-detail-block">
            <summary>Technical sound structure</summary>
            <dl className="artifact-fact-list">
              <div><dt>Segments</dt><dd>{analysis.structure.segmentCount}</dd></div>
              <div><dt>Syllables</dt><dd>{analysis.structure.syllableCount}</dd></div>
              <div><dt>Shapes</dt><dd>{analysis.structure.syllableShapes.join(' · ')}</dd></div>
              <div><dt>Stress</dt><dd>{analysis.structure.stressPattern.join(' · ')}</dd></div>
              {analysis.structure.cadence ? <div><dt>Cadence</dt><dd>{analysis.structure.cadence}</dd></div> : null}
            </dl>
          </details>
        ) : null}

        <section className="detail-block artifact-detail-block">
          <h3>Selected spelling</h3>
          <dl className="artifact-fact-list">
            <div><dt>Spelling</dt><dd>{artifact.spelling?.text ?? artifact.displayText}</dd></div>
            <div><dt>Preference rank</dt><dd>{artifact.spelling?.rank ?? 'Not ranked'}</dd></div>
            <div><dt>Same-sound options</dt><dd>{sameSoundSpellings.length}</dd></div>
            {analysis.spelling?.runnerUpText ? <div><dt>Next option</dt><dd>{analysis.spelling.runnerUpText}</dd></div> : null}
          </dl>
          {analysis.spelling ? <p className="section-note">{analysis.spelling.selectionSummary}</p> : null}
        </section>

        <details className="detail-block artifact-detail-block">
          <summary>All same-sound spellings ({sameSoundSpellings.length})</summary>
          <p className="section-note">Every spelling below is generated from the same sound sequence using the current spelling-rule inventory. Preference rank orders the options; it is not a quality percentage.</p>
          {sameSoundSpellings.length > 0 ? (
            <ul className="variants detail-variants" aria-label={`${artifact.displayText} same-sound spellings`}>
              {sameSoundSpellings.map((candidate) => <li key={`${artifact.id}-${candidate.id}`}><span>{candidate.text}</span><em>{sameSoundSpellingMetadataLabel(candidate, artifact.spelling?.id)}</em></li>)}
            </ul>
          ) : <p className="section-note">No retained same-sound spellings.</p>}
        </details>

        <section className="detail-block artifact-detail-block">
          <h3>Readability</h3>
          <dl className="artifact-fact-list">
            <div><dt>Notices</dt><dd>{analysis.readability.noticeCount}</dd></div>
            <div><dt>Warnings</dt><dd>{analysis.readability.warningCount}</dd></div>
          </dl>
          {readNotes.length > 0 ? (
            <ul className="readability-list" aria-label={`${artifact.displayText} readability notes`}>
              {readNotes.map((diagnostic) => <li key={`${artifact.id}-${diagnostic.id}`} className={`readability-note ${diagnostic.severity}`}><strong>{diagnostic.label}</strong><span>{diagnostic.detail}</span></li>)}
            </ul>
          ) : <p className="section-note">No deterministic read-friction notes. This does not establish pronunciation ease or familiarity.</p>}
        </section>

        {variants.length > 0 ? (
          <details className="detail-block">
            <summary>Other variants</summary>
            <ul className="variants detail-variants" aria-label={`${artifact.displayText} variants`}>
              {variants.map((variant) => <li key={`${artifact.id}-${variant.value}`}><span>{variant.value}</span><em>{variantMetadataLabel(variant)}</em></li>)}
            </ul>
          </details>
        ) : null}

        {extraSections}
      </div>
    </aside>
  );
}
