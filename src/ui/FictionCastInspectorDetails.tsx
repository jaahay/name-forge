import type { ReactNode } from 'react';
import type { NameTexture } from '../engine/types';
import type {
  FictionCastGeneratedName,
  FictionCastSemanticBaseline,
} from '../fictionCast/types';
import type { FictionCastVariation } from '../fictionCast/variation';
import { labelFor } from './namePresentation';
import { rarityPresentation } from './presentation';

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

function CastContext({ name }: { name: FictionCastGeneratedName }) {
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

function WhatShapedThisName({
  name,
  fallbackBaseline,
  fallbackCastVariation,
  stylePackLabel,
}: {
  name: FictionCastGeneratedName;
  fallbackBaseline: FictionCastSemanticBaseline;
  fallbackCastVariation: FictionCastVariation;
  stylePackLabel: string;
}) {
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
            <div><dt>Naming idiom</dt><dd>{stylePackLabel}</dd></div>
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

function TechnicalConstruction({ name }: { name: FictionCastGeneratedName }) {
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
            {identity.components.map((component) => <li key={component.id}><span>{component.value}</span><em>{component.role}</em></li>)}
          </ul>
        </section>
      </div>
    </details>
  );
}

export function FictionCastInspectorDetails({
  name,
  baseline,
  castVariation,
  stylePackLabel,
}: {
  name: FictionCastGeneratedName;
  baseline: FictionCastSemanticBaseline;
  castVariation: FictionCastVariation;
  stylePackLabel: string;
}) {
  return (
    <>
      <WhatShapedThisName
        name={name}
        fallbackBaseline={baseline}
        fallbackCastVariation={castVariation}
        stylePackLabel={stylePackLabel}
      />
      <CastContext name={name} />
      <TechnicalConstruction name={name} />
    </>
  );
}
