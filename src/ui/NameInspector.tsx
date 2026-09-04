import { useState, type ReactNode } from 'react';
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

interface ComponentSelection {
  readonly nameId: string;
  readonly sourceNameId: string;
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

function componentDetailId(name: FictionCastGeneratedName): string {
  return `generated-component-detail-${name.id}`;
}

function GeneratedComponents({
  name,
  components,
  selectedComponentId,
  onSelectComponent,
}: {
  name: FictionCastGeneratedName;
  components: GeneratedComponentEvidence[];
  selectedComponentId: string;
  onSelectComponent: (sourceNameId: string) => void;
}) {
  const browserSpeechAvailable = canUseBrowserSpeech();
  const selectedComponent = components.find((component) => component.sourceNameId === selectedComponentId) ?? components[0];
  if (!selectedComponent) return null;

  const detailId = componentDetailId(name);
  const selectedRoleLabel = labelFor(selectedComponent.role);

  return (
    <section className="inspector-generated-components" aria-label={`${name.displayName} generated components`}>
      <span className="inspector-generated-components-label">Generated components</span>
      <ul>
        {components.map((component) => {
          const roleLabel = labelFor(component.role);
          const playLabel = `Play approximate browser voice for ${component.value}`;
          const selected = component.sourceNameId === selectedComponent.sourceNameId;

          return (
            <li key={component.sourceNameId}>
              <button
                type="button"
                className="inspector-generated-component-focus"
                aria-controls={detailId}
                aria-pressed={selected}
                aria-label={`Inspect ${roleLabel.toLowerCase()} component ${component.value}`}
                onClick={() => onSelectComponent(component.sourceNameId)}
              >
                <strong>{component.value}</strong>
              </button>
              <button
                type="button"
                className="inspector-generated-component-play"
                aria-label={playLabel}
                title={browserSpeechAvailable ? `Play ${component.value}` : 'Approximate browser voice unavailable'}
                disabled={!browserSpeechAvailable}
                onClick={() => playComponentVoiceDraft(component.cue.speechText)}
              >
                <PlayIcon />
              </button>
            </li>
          );
        })}
      </ul>
      <div
        id={detailId}
        className="inspector-generated-component-detail"
        role="region"
        aria-live="polite"
        aria-label={`${selectedRoleLabel} component ${selectedComponent.value} sound detail`}
      >
        <div className="inspector-generated-component-detail-heading">
          <strong>{selectedComponent.value}</strong>
          <span>{selectedRoleLabel} component</span>
        </div>
        <div className="inspector-generated-component-sound">
          <span>{selectedComponent.cue.displayText ?? selectedComponent.transcription}</span>
          <code>{selectedComponent.transcription}</code>
        </div>
      </div>
    </section>
  );
}

function castContext(name: FictionCastGeneratedName) {
  const rarity = rarityPresentation[name.rarityBand];
  const roleLabel = name.role?.label ?? 'No role';

  return (
    <section className="inspector-detail-group inspector-cast-context" aria-labelledby={`cast-context-heading-${name.id}`}>
      <div className="inspector-detail-heading">
        <h3 id={`cast-context-heading-${name.id}`}>Cast context</h3>
        <InfoDisclosure label="Cast context">
          <p>This records the identity's assigned role, materialized format, and derived rarity. Rarity comes from generation-time novelty intent, not real-world or cultural rarity.</p>
        </InfoDisclosure>
      </div>
      <dl className="inspector-cast-context-facts">
        <div><dt>Role</dt><dd>{roleLabel}</dd></div>
        <div><dt>Format</dt><dd>{name.identity.format.label}</dd></div>
        <div><dt>Rarity</dt><dd>{rarity.label}</dd></div>
      </dl>
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

function whatShapedThisName(
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
  const roleEvidence = name.roleInfluence ? `${labelFor(name.roleInfluence.level)} · ${name.roleInfluence.label}` : 'None';

  return (
    <section className="inspector-detail-group inspector-name-shaping" aria-label={`${name.displayName} shaping context`}>
      <div className="inspector-detail-heading">
        <h3>What shaped this name</h3>
        <InfoDisclosure label="What shaped this name">
          <p>This keeps your requested baseline separate from generation-time Cast variation and role shaping. It is not a quality, faithfulness, or human-perception score.</p>
        </InfoDisclosure>
      </div>
      <div className="inspector-shaping-columns">
        <section className="inspector-shaping-group" aria-label="Requested baseline">
          <h4>Requested baseline</h4>
          <dl className="inspector-shaping-list">
            <div><dt>Familiar</dt><dd>{labelFor(baseline.familiarity)}</dd></div>
            <div><dt>Readable</dt><dd>{labelFor(baseline.readability)}</dd></div>
            <div><dt>Compact</dt><dd>{labelFor(baseline.compactness)}</dd></div>
            <div><dt>Naming style</dt><dd>{stylePackLabel}</dd></div>
            <div><dt>Spelling</dt><dd>{labelFor(baseline.spellingDistinctiveness)}</dd></div>
          </dl>
        </section>
        <section className="inspector-shaping-group" aria-label="Contextual shaping">
          <h4>Contextual shaping</h4>
          <dl className="inspector-shaping-list">
            <div><dt>Cast variation</dt><dd>{labelFor(castVariation)} · {variationEvidence}</dd></div>
            <div><dt>Role shaping</dt><dd>{roleEvidence}</dd></div>
          </dl>
        </section>
      </div>
    </section>
  );
}

function technicalConstruction(name: FictionCastGeneratedName) {
  const identity = name.identity;
  const plan = name.primaryName.generationPlan;

  return (
    <details className="inspector-technical-construction">
      <summary>
        <span>Technical construction</span>
        <small>Generation plan and identity composition</small>
      </summary>
      <div className="inspector-technical-body">
        <section className="inspector-detail-group" aria-label={`${name.displayName} primary generation plan`}>
          <h3>Primary generation plan</h3>
          <p className="inspector-technical-intro">Generator mechanics for the primary generated component. These values are diagnostic, not a quality score.</p>
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
      </div>
    </details>
  );
}

function castDetailSections(
  name: FictionCastGeneratedName,
  baseline: FictionCastSemanticBaseline,
  castVariation: FictionCastVariation,
  stylePackLabel: string,
) {
  return (
    <>
      {whatShapedThisName(name, baseline, castVariation, stylePackLabel)}
      {castContext(name)}
      {technicalConstruction(name)}
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
  const [componentSelection, setComponentSelection] = useState<ComponentSelection>({
    nameId: name.id,
    sourceNameId: name.primaryName.id,
  });
  const selectedComponentId = componentSelection.nameId === name.id
    && components.some((component) => component.sourceNameId === componentSelection.sourceNameId)
    ? componentSelection.sourceNameId
    : components[0]?.sourceNameId ?? name.primaryName.id;

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
      headingSupplement={(
        <GeneratedComponents
          name={name}
          components={components}
          selectedComponentId={selectedComponentId}
          onSelectComponent={(sourceNameId) => setComponentSelection({ nameId: name.id, sourceNameId })}
        />
      )}
      detailsLabel="Details"
      detailsDescription="Shaping, cast context and technical construction"
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
      extraSections={castDetailSections(name, baseline, castVariation, stylePackLabel)}
    />
  );
}