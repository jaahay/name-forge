import type { ReactNode } from 'react';
import { renderAuditionCue } from '../engine/audition';
import type { NameArtifact } from '../engine/nameArtifact';
import { analyzeNameArtifact } from '../engine/nameArtifactAnalysis';
import type { NameVariant } from '../engine/types';
import { formatScore } from './score';
import { getNameDisplayLength, protectInitialBreaks } from './namePresentation';

interface NameArtifactInspectorProps {
  readonly artifact: NameArtifact;
  readonly eyebrow?: string;
  readonly extraActions?: ReactNode;
  readonly extraSections?: ReactNode;
}

export const visibleSpellingCandidateLimit = 6;

type SpellingCandidate = NonNullable<NameArtifact['spellingCandidates']>[number];

function variantMetadataLabel(variant: NameVariant): string {
  const relationship = variant.relationship.replace(/_/g, ' ');
  const generatedLabel = variant.generated ? 'generated' : 'listed';
  return `${relationship}; ${variant.confidence} confidence; ${generatedLabel}; ${variant.source.label}`;
}

function spellingCandidateMetadataLabel(candidate: SpellingCandidate, selectedSpellingId: string | undefined): string {
  const selectedLabel = candidate.id === selectedSpellingId ? 'selected; ' : '';
  return `${selectedLabel}rank ${candidate.rank}; score ${formatScore(candidate.score)}`;
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
  const candidates = (artifact.spellingCandidates ?? [])
    .slice(0, visibleSpellingCandidateLimit)
    .map((candidate) => `${candidate.text} (${spellingCandidateMetadataLabel(candidate, artifact.spelling?.id)})`)
    .join(', ') || 'None';

  return [
    artifact.displayText,
    artifact.sound ? `Sound sketch: ${artifact.sound.transcription}` : undefined,
    pronunciationGuide ? `Pronunciation guide: ${pronunciationGuide}` : undefined,
    analysis.structure ? `Structure: ${analysis.structure.syllableCount} syllable(s); ${analysis.structure.segmentCount} segments; ${analysis.structure.syllableShapes.join('-')}` : undefined,
    artifact.spelling ? `Selected spelling: ${artifact.spelling.text} (rank ${artifact.spelling.rank}, score ${formatScore(artifact.spelling.score)})` : undefined,
    analysis.spelling?.selectionSummary,
    `Spelling candidates: ${candidates}`,
    `Read status: ${analysis.readability.diagnosticCount === 0 ? 'No deterministic read-friction notes' : `${analysis.readability.diagnosticCount} read notes`}`,
  ].filter(Boolean).join('\n');
}

export function NameArtifactInspector({ artifact, eyebrow = 'Inspect', extraActions, extraSections }: NameArtifactInspectorProps) {
  const analysis = analyzeNameArtifact(artifact);
  const spellingCandidates = (artifact.spellingCandidates ?? []).slice(0, visibleSpellingCandidateLimit);
  const hiddenCandidateCount = Math.max(0, (artifact.spellingCandidates?.length ?? 0) - spellingCandidates.length);
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
          <section className="detail-block artifact-detail-block">
            <h3>Structure</h3>
            <dl className="artifact-fact-list">
              <div><dt>Segments</dt><dd>{analysis.structure.segmentCount}</dd></div>
              <div><dt>Syllables</dt><dd>{analysis.structure.syllableCount}</dd></div>
              <div><dt>Shapes</dt><dd>{analysis.structure.syllableShapes.join(' · ')}</dd></div>
              <div><dt>Stress</dt><dd>{analysis.structure.stressPattern.join(' · ')}</dd></div>
              {analysis.structure.cadence ? <div><dt>Cadence</dt><dd>{analysis.structure.cadence}</dd></div> : null}
            </dl>
          </section>
        ) : null}

        <section className="detail-block artifact-detail-block">
          <h3>Spelling</h3>
          <dl className="artifact-fact-list">
            <div><dt>Selected spelling</dt><dd>{artifact.spelling?.text ?? artifact.displayText}</dd></div>
            <div><dt>Rank</dt><dd>{artifact.spelling?.rank ?? 'Not ranked'}</dd></div>
            <div><dt>Score</dt><dd>{artifact.spelling ? formatScore(artifact.spelling.score) : 'Not scored'}</dd></div>
            {analysis.spelling?.runnerUpText ? <div><dt>Runner-up</dt><dd>{analysis.spelling.runnerUpText}</dd></div> : null}
          </dl>
          {analysis.spelling ? <p className="section-note">{analysis.spelling.selectionSummary}</p> : null}
        </section>

        <section className="detail-block artifact-detail-block">
          <h3>Spelling candidates</h3>
          {spellingCandidates.length > 0 ? (
            <ul className="variants detail-variants" aria-label={`${artifact.displayText} ranked spelling candidates`}>
              {spellingCandidates.map((candidate) => <li key={`${artifact.id}-${candidate.id}`}><span>{candidate.text}</span><em>{spellingCandidateMetadataLabel(candidate, artifact.spelling?.id)}</em></li>)}
            </ul>
          ) : <p className="section-note">No retained spelling candidates.</p>}
          {hiddenCandidateCount > 0 ? <p className="section-note">Showing top {visibleSpellingCandidateLimit} of {artifact.spellingCandidates?.length} ranked spelling candidates.</p> : null}
        </section>

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
          <section className="detail-block">
            <h3>Variants</h3>
            <ul className="variants detail-variants" aria-label={`${artifact.displayText} variants`}>
              {variants.map((variant) => <li key={`${artifact.id}-${variant.value}`}><span>{variant.value}</span><em>{variantMetadataLabel(variant)}</em></li>)}
            </ul>
          </section>
        ) : null}

        {extraSections}
      </div>
    </aside>
  );
}
