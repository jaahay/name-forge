import { useState } from 'react';
import { toFictionCastPrimaryNameArtifact } from '../fictionCast/nameArtifact';
import type {
  FictionCastGeneratedName,
  FictionCastSemanticBaseline,
} from '../fictionCast/types';
import type { FictionCastVariation } from '../fictionCast/variation';
import { FictionCastInspectorDetails } from './FictionCastInspectorDetails';
import { GeneratedComponents, generatedComponentsForName } from './GeneratedComponents';
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

interface ComponentSelection {
  readonly nameId: string;
  readonly componentId: string;
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

export function NameInspector({
  name,
  baseline,
  castVariation,
  stylePackLabel,
  isLocked,
  onRerollName,
  onToggleLockedName,
}: NameInspectorProps) {
  const primaryComponent = name.identity.components.find((component) => (
    component.kind === 'generated'
      && component.generatedName.id === name.primaryName.id
      && component.value === name.primaryName.name
  ));
  const primaryNameIsVisible = primaryComponent !== undefined && name.identity.phraseParts.some((phrasePart) => (
    phrasePart.kind === 'component' && phrasePart.componentId === primaryComponent.id
  ));
  const components = generatedComponentsForName(name);
  const defaultComponentId = components.find((component) => component.generatedNameId === name.primaryName.id)?.componentId
    ?? components[0]?.componentId
    ?? '';
  const [componentSelection, setComponentSelection] = useState<ComponentSelection>({
    nameId: name.id,
    componentId: defaultComponentId,
  });
  const selectedComponentId = componentSelection.nameId === name.id
    && components.some((component) => component.componentId === componentSelection.componentId)
    ? componentSelection.componentId
    : defaultComponentId;

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
          onSelectComponent={(componentId) => setComponentSelection({ nameId: name.id, componentId })}
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
      extraSections={(
        <FictionCastInspectorDetails
          name={name}
          baseline={baseline}
          castVariation={castVariation}
          stylePackLabel={stylePackLabel}
        />
      )}
    />
  );
}
