import type { ReactNode } from 'react';
import { renderAuditionCue } from '../engine/audition';
import type { NameTexture } from '../engine/types';
import { toFictionCastPrimaryNameArtifact } from '../fictionCast/nameArtifact';
import type {
  FictionCastGeneratedName,
  FictionCastSemanticBaseline,
} from '../fictionCast/types';
import type { FictionCastVariation } from '../fictionCast/variation';
import { rarityPresentation } from './presentation';
import { labelFor } from './namePresentation';
import { NameArtifactInspector } from './NameArtifactInspector';

interface NameInspectorProps {
  name: FictionCastGeneratedName;
  baseline: FictionCastSemanticBaseline;
  castVariation: FictionCastVariation;
  stylePackLabel: string;
  isLocked: boolean;
  onRerollName: () => void;
  onToggleLockedName: (id: string) => void;
}

type GeneratedComponentRole = 'given' | 'family' | 'place';

type AuditionCue = ReturnType<typeof renderAuditionCue>;

interface GeneratedComponentEvidence {
  readonly sourceNameId: string;
  readonly value: string;
  readonly role: GeneratedComponentRole;
  readonly cue: AuditionCue;
  readonly transcription: string;
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

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M8 5.6v12.8L18 12 8 5.6Z" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 10.5v6M12 7.5h.01" />
    </svg>
  );
}

function InfoDisclosure({ label, children }: { label: string; children: ReactNode }) {
  return (
    <details className="inspector-info-disclosure">
      <summary aria-label={`About ${label}`}>
        <InfoIcon />
      </summary>
      <div className="inspector-info-copy">{children}</div>
    </details>
  );
}

function isGeneratedComponentRole(role: string): role is GeneratedComponentRole {
  return role === 'given' || role === 'family' || role === 'place';
}

function generatedComponents(name: FictionCastGeneratedName): GeneratedComponentEvidence[] {
  const primaryCue = renderAuditionCue(name.primaryName.sound.sequence);
  const components: GeneratedComponentEvidence[] = [{
    sourceNameId: name.primaryName.id,
    value: name.primaryName.name,
    role: 'given',
    cue: primaryCue,
    transcription: name.primaryName.sound.transcription,
  }];
  const seen = new Set([name.primaryName.id]);

  for (const part of name.identity.parts) {
    if (!part.generation || !isGeneratedComponentRole(part.role) || seen.has(part.sourceNameId)) continue;
    seen.add(part.sourceNameId);
    components.push({
      sourceNameId: part.sourceNameId,
      value: part.sourceName,
      role: part.role,
      cue: renderAuditionCue(part.generation.sound.sequence),
      transcription: part.generation.sound.transcription,
    });
  }

  return components;
}

function componentSoundTargetId(name: FictionCastGeneratedName, component: GeneratedComponentEvidence): string {
  return `generated-sound-${name.id}-${component.sourceNameId}`;
}

function focusComponentSound(targetId: string) {
  const target = document.getElementById(targetId);
  if (!(target instanceof HTMLElement)) return;
  const disclosure = target.closest('details');
  if (disclosure instanceof HTMLDetailsElement) disclosure.open = true;
  target.focus();
  target.scrollIntoView({ block: 'nearest' });
}

function GeneratedComponents({ name, components }: { name: FictionCastGeneratedName; components: GeneratedComponentEvidence[] }) {
  const browserSpeechAvailable = canUseBrowserSpeech();

  return (
    <section className="inspector-generated-components" aria-label={`${name.displayName} generated components`}>
      <span className="inspector-generated-components-label">Generated components</span>
      <ul>
        {components.map((component) => {
          const soundTargetId = componentSoundTargetId(name, component);
          const roleLabel = labelFor(component.role);
          const playLabel = `Play approximate browser voice for ${component.value}`;

          return (
            <li key={component.sourceNameId}>
              <button
                type="button"
                className="inspector-generated-component-focus"
                aria-controls={soundTargetId}
                onClick={() => focusComponentSound(soundTargetId)}
              >
                <strong>{component.value}</strong>
                <span>{roleLabel}</span>
              </button>
              <button
                type="button"
                className="inspector-generated-component-play"
                aria-label={playLabel}
                disabled={!browserSpeechAvailable}
                onClick={() => playComponentVoiceDraft(component.cue.speechText)}
              >
                <PlayIcon />
              </button>
            </li>
          );
        })}
      </ul>
    </section>
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

function textureDescription(texture: NameTexture): string {
  if (texture === 'soft') return 'Soft-leaning sound palette';
  if (texture === 'hard') return 'Hard-edged sound palette';
  if (texture === 'liquid') return 'Flowing, liquid sound palette';
  return 'Mixed sound palette';
}

function stressDescription(pattern: string): string {
  return pattern
    .split('-')
    .map((part) => part === 'S' ? 'STRONG' : part === 's' ? 'secondary' : 'weak')
    .join(' · ');
}

function syllableShapeDescription(shape: readonly string[]): string {
  return shape.map((syllable) => [...syllable]
    .map((part) => part === 'C' ? 'consonant' : part === 'V' ? 'vowel' : part)
    .join('-'))
    .join(' · ');
}

function variationPosition(delta: number): string {
  if (Math.abs(delta) < 0.000001) return 'At the cast baseline';
  return delta > 0 ? 'Shifted more unusual than the cast baseline' : 'Shifted more familiar than the cast baseline';
}

function readabilityEvidence(name: FictionCastGeneratedName): string {
  const warnings = name.readabilityDiagnostics.filter((diagnostic) => diagnostic.severity === 'warning').length;
  if (name.readabilityDiagnostics.length === 0) return 'No deterministic read-friction notes';
  if (warnings > 0) return `${name.readabilityDiagnostics.length} deterministic read note(s), including ${warnings} warning(s)`;
  return `${name.readabilityDiagnostics.length} deterministic read note(s)`;
}

function criteriaEvidence(
  name: FictionCastGeneratedName,
  fallbackBaseline: FictionCastSemanticBaseline,
  fallbackCastVariation: FictionCastVariation,
  stylePackLabel: string,
) {
  const retainedIntent = name.resolvedIntentEvidence;
  const baseline = retainedIntent?.baseline ?? fallbackBaseline;
  const castVariation = retainedIntent?.castVariation ?? fallbackCastVariation;
  const variationEvidence = retainedIntent
    ? variationPosition(retainedIntent.variationDelta)
    : 'Generation-time slot position unavailable for this older snapshot';
  const alternatives = Math.max(0, name.primaryName.spellingCandidates.length - 1);
  const roleEvidence = name.roleInfluence ? `${labelFor(name.roleInfluence.level)} · ${name.roleInfluence.label}` : undefined;
  const rarity = rarityPresentation[name.rarityBand];

  return (
    <section className="inspector-detail-group inspector-criteria-evidence" aria-label={`${name.displayName} criteria evidence`}>
      <div className="inspector-detail-heading">
        <h3>Criteria evidence</h3>
        <InfoDisclosure label="criteria evidence">
          <p>This compares retained user intent with generation-time and deterministic evidence. It is not a quality, faithfulness, or human-perception score.</p>
        </InfoDisclosure>
      </div>
      <p className="inspector-evidence-intro">Requested baseline stays visible; generation-time shaping and generated evidence are reported separately.</p>
      <dl className="inspector-evidence-list">
        <div><dt>Familiar</dt><dd>{labelFor(baseline.familiarity)} baseline</dd></div>
        <div><dt>Readable</dt><dd>{labelFor(baseline.readability)} baseline · {readabilityEvidence(name)}</dd></div>
        <div><dt>Compact</dt><dd>{labelFor(baseline.compactness)} baseline · {labelFor(name.primaryName.generationPlan.targetLength)} primary form plan</dd></div>
        <div><dt>Naming style</dt><dd>{stylePackLabel} selected</dd></div>
        <div><dt>Spelling</dt><dd>{labelFor(baseline.spellingDistinctiveness)} baseline · {alternatives === 0 ? 'No alternative same-sound spellings retained' : `${alternatives} alternative same-sound spelling(s) retained`}</dd></div>
        <div><dt>Cast variation</dt><dd>{labelFor(castVariation)} · {variationEvidence}</dd></div>
        <div><dt>Rarity label</dt><dd>{rarity.label} · derived from resolved novelty intent at generation time</dd></div>
        {roleEvidence ? <div><dt>Role shaping</dt><dd>{roleEvidence}</dd></div> : null}
      </dl>
    </section>
  );
}

function castBreakdownSections(
  name: FictionCastGeneratedName,
  baseline: FictionCastSemanticBaseline,
  castVariation: FictionCastVariation,
  stylePackLabel: string,
  components: GeneratedComponentEvidence[],
) {
  const identity = name.identity;
  const browserSpeechAvailable = canUseBrowserSpeech();
  const plan = name.primaryName.generationPlan;

  return (
    <>
      <section className="inspector-detail-group" aria-label={`${name.displayName} primary generation plan`}>
        <div className="inspector-detail-heading">
          <h3>Primary generation plan</h3>
          <InfoDisclosure label="primary generation plan">
            <p>This is the structural plan used to construct the primary generated component, not a quality score. Sound texture describes the palette of sounds; stress describes syllable emphasis; syllable shape describes consonant/vowel structure.</p>
          </InfoDisclosure>
        </div>
        <dl className="inspector-detail-facts inspector-generation-plan-facts">
          <div><dt>Sound texture</dt><dd>{textureDescription(plan.texture)}</dd><small>{labelFor(plan.texture)} texture</small></div>
          <div><dt>Syllables</dt><dd>{plan.syllableCount}</dd></div>
          <div><dt>Rhythm</dt><dd>{labelFor(plan.rhythm)}</dd></div>
          <div><dt>Length plan</dt><dd>{labelFor(plan.targetLength)}</dd></div>
          <div><dt>Stress pattern</dt><dd>{stressDescription(plan.stressPattern)}</dd><small>{plan.stressPattern}</small></div>
          <div><dt>Syllable shape</dt><dd>{syllableShapeDescription(plan.shape)}</dd><small>{plan.shape.join(' · ')} · C = consonant · V = vowel</small></div>
        </dl>
      </section>

      <section className="inspector-detail-group">
        <h3>Composition</h3>
        <ul className="inspector-name-parts">
          {identity.parts.map((part) => <li key={part.id}><span>{part.value}</span><em>{part.role}</em></li>)}
        </ul>
      </section>

      <section className="inspector-detail-group inspector-component-sound-group" aria-label={`${name.displayName} generated component sound evidence`}>
        <div className="inspector-detail-heading">
          <h3>Component sound drafts</h3>
          <InfoDisclosure label="component sound drafts">
            <p>These drafts come from each generated component's modeled sound. Browser playback is approximate and may not realize the modeled sound faithfully.</p>
          </InfoDisclosure>
        </div>
        <ul className="inspector-sound-parts inspector-sound-components">
          {components.map((component) => {
            const playLabel = `Play approximate browser voice for ${component.value}`;
            return (
              <li
                id={componentSoundTargetId(name, component)}
                tabIndex={-1}
                key={component.sourceNameId}
              >
                <div className="inspector-sound-component-copy">
                  <strong>{component.value} <small>{labelFor(component.role)}</small></strong>
                  <span>{component.cue.displayText}</span>
                  <code>{component.transcription}</code>
                </div>
                <button
                  type="button"
                  className="inspector-component-play"
                  aria-label={playLabel}
                  disabled={!browserSpeechAvailable}
                  onClick={() => playComponentVoiceDraft(component.cue.speechText)}
                >
                  <PlayIcon />
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      {criteriaEvidence(name, baseline, castVariation, stylePackLabel)}
    </>
  );
}

export function NameInspector({
  name,
  baseline,
  castVariation,
  stylePackLabel,
  isLocked,
  onRerollName,
  onToggleLockedName,
}: NameInspectorProps) {
  const primaryNameIsVisible = name.identity.parts.some((part) => (
    part.sourceNameId === name.primaryName.id && part.value === name.primaryName.name
  ));
  const components = generatedComponents(name);

  return (
    <NameArtifactInspector
      artifact={toFictionCastPrimaryNameArtifact(name)}
      displayText={name.displayName}
      voiceDraftText={name.identityAudition.speechText}
      pronunciationGuideText={name.identityAudition.displayText}
      guideLabel="Sound guide"
      primaryPresentation="pronunciation-guide"
      actionPresentation="icon"
      showVariants={false}
      showPronunciationAlternates={primaryNameIsVisible}
      showPrimarySoundEvidence={false}
      headingSupplement={<GeneratedComponents name={name} components={components} />}
      detailsLabel="Breakdown"
      detailsDescription="Sound, construction, read notes and criteria evidence"
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
      extraSections={castBreakdownSections(name, baseline, castVariation, stylePackLabel, components)}
    />
  );
}
