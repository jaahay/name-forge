import { renderAuditionCue } from '../engine/audition';
import type { FictionCastGeneratedName } from '../fictionCast/types';
import { labelFor } from './namePresentation';

type GeneratedComponentRole = 'given' | 'additional-personal' | 'family' | 'place';
type AuditionCue = ReturnType<typeof renderAuditionCue>;

export interface GeneratedComponentEvidence {
  readonly componentId: string;
  readonly generatedNameId: string;
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

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M8 5.6v12.8L18 12 8 5.6Z" />
    </svg>
  );
}

export function generatedComponentsForName(name: FictionCastGeneratedName): GeneratedComponentEvidence[] {
  const components: GeneratedComponentEvidence[] = [];
  const seenGeneratedNames = new Set<string>();

  for (const component of name.identity.components) {
    if (component.kind !== 'generated' || seenGeneratedNames.has(component.generatedName.id)) continue;
    seenGeneratedNames.add(component.generatedName.id);
    components.push({
      componentId: component.id,
      generatedNameId: component.generatedName.id,
      value: component.generatedName.name,
      role: component.role,
      cue: renderAuditionCue(component.generatedName.sound.sequence),
      transcription: component.generatedName.sound.transcription,
    });
  }

  return components;
}

function componentDetailId(name: FictionCastGeneratedName): string {
  return `generated-component-detail-${name.id}`;
}

export function GeneratedComponents({
  name,
  components,
  selectedComponentId,
  onSelectComponent,
}: {
  name: FictionCastGeneratedName;
  components: GeneratedComponentEvidence[];
  selectedComponentId: string;
  onSelectComponent: (componentId: string) => void;
}) {
  const browserSpeechAvailable = canUseBrowserSpeech();
  const selectedComponent = components.find((component) => component.componentId === selectedComponentId) ?? components[0];
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
          const selected = component.componentId === selectedComponent.componentId;

          return (
            <li key={component.componentId}>
              <button
                type="button"
                className="inspector-generated-component-focus"
                aria-controls={detailId}
                aria-pressed={selected}
                aria-label={`Inspect ${roleLabel.toLowerCase()} component ${component.value}`}
                onClick={() => onSelectComponent(component.componentId)}
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
