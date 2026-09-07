import { renderAuditionCue, type NameAuditionCue } from '../engine/audition';
import type {
  FictionCastGeneratedIdentityComponent,
  FictionCastIdentityComponent,
  FictionCastIdentityPhrasePart,
  FictionCastIdentityRole,
  FictionCastMaterializedIdentity,
} from './identityTypes';

export type IdentityAuditionPhraseContract = 'IdentityAuditionPhrase';
export type IdentityAuditionPhraseSource = 'fiction-cast-identity';
export type IdentityAuditionPartKind = 'sound' | 'text' | 'literal';
export type IdentityAuditionPartRole = FictionCastIdentityRole | 'literal';
export type IdentityAuditionTextSource = 'generated-sound' | 'identity-text' | 'format-literal';

export interface IdentityAuditionBasePart {
  readonly index: number;
  readonly kind: IdentityAuditionPartKind;
  readonly role: IdentityAuditionPartRole;
  readonly value: string;
  readonly speechText: string;
  readonly displayText: string;
  readonly speechSource: IdentityAuditionTextSource;
  readonly displaySource: IdentityAuditionTextSource;
}

export interface IdentityAuditionSoundPart extends IdentityAuditionBasePart {
  readonly kind: 'sound';
  readonly role: FictionCastGeneratedIdentityComponent['role'];
  readonly speechSource: 'generated-sound';
  readonly displaySource: 'generated-sound';
  readonly componentId: string;
  readonly generatedNameId: string;
  readonly sourceName: string;
  readonly transcription: string;
  readonly cue: NameAuditionCue;
}

export interface IdentityAuditionTextPart extends IdentityAuditionBasePart {
  readonly kind: 'text';
  readonly role: FictionCastIdentityRole;
  readonly speechSource: 'identity-text';
  readonly displaySource: 'identity-text';
  readonly componentId: string;
  readonly componentKind: 'lexical' | 'derived';
}

export interface IdentityAuditionLiteralPart extends IdentityAuditionBasePart {
  readonly kind: 'literal';
  readonly role: 'literal';
  readonly speechSource: 'format-literal';
  readonly displaySource: 'format-literal';
}

export type IdentityAuditionPart = IdentityAuditionSoundPart | IdentityAuditionTextPart | IdentityAuditionLiteralPart;

export interface IdentityAuditionPhrase {
  readonly contract: IdentityAuditionPhraseContract;
  readonly version: 1;
  readonly source: IdentityAuditionPhraseSource;
  readonly formatId: string;
  readonly formatKind: FictionCastMaterializedIdentity['format']['kind'];
  readonly identityText: string;
  readonly speechText: string;
  readonly displayText: string;
  readonly parts: readonly IdentityAuditionPart[];
}

const punctuationLiterals = new Set([',', '.', ':', ';', '-', '(', ')', '[', ']', '/', '&']);

function componentById(identity: FictionCastMaterializedIdentity): ReadonlyMap<string, FictionCastIdentityComponent> {
  return new Map(identity.components.map((component) => [component.id, component]));
}

function renderTextPart(index: number, component: Exclude<FictionCastIdentityComponent, FictionCastGeneratedIdentityComponent>): IdentityAuditionTextPart {
  return {
    index,
    kind: 'text',
    role: component.role,
    value: component.value,
    speechText: component.value,
    displayText: component.value,
    speechSource: 'identity-text',
    displaySource: 'identity-text',
    componentId: component.id,
    componentKind: component.kind,
  };
}

function renderLiteralPart(index: number, value: string): IdentityAuditionLiteralPart {
  return {
    index,
    kind: 'literal',
    role: 'literal',
    value,
    speechText: value,
    displayText: value,
    speechSource: 'format-literal',
    displaySource: 'format-literal',
  };
}

function renderIdentityPart(
  index: number,
  phrasePart: FictionCastIdentityPhrasePart,
  componentsById: ReadonlyMap<string, FictionCastIdentityComponent>,
): IdentityAuditionPart | undefined {
  if (phrasePart.kind === 'literal') {
    return renderLiteralPart(index, phrasePart.value);
  }

  const component = componentsById.get(phrasePart.componentId);
  if (!component) return undefined;

  if (component.kind === 'generated' && component.value === component.generatedName.name) {
    const cue = renderAuditionCue(component.generatedName.sound.sequence);

    return {
      index,
      kind: 'sound',
      role: component.role,
      value: component.value,
      speechText: cue.speechText,
      displayText: cue.displayText,
      speechSource: 'generated-sound',
      displaySource: 'generated-sound',
      componentId: component.id,
      generatedNameId: component.generatedName.id,
      sourceName: component.generatedName.name,
      transcription: component.generatedName.sound.transcription,
      cue,
    };
  }

  if (component.kind === 'generated') {
    return {
      index,
      kind: 'text',
      role: component.role,
      value: component.value,
      speechText: component.value,
      displayText: component.value,
      speechSource: 'identity-text',
      displaySource: 'identity-text',
      componentId: component.id,
      componentKind: 'derived',
    };
  }

  return renderTextPart(index, component);
}

function phraseText(parts: readonly IdentityAuditionPart[], field: 'speechText' | 'displayText'): string {
  return parts.reduce((text, part) => {
    if (text.length === 0) return part[field];
    if (part.kind === 'literal' && punctuationLiterals.has(part.value)) return `${text}${part[field]}`;
    return `${text} ${part[field]}`;
  }, '');
}

export function renderIdentityAuditionPhrase(identity: FictionCastMaterializedIdentity): IdentityAuditionPhrase {
  const componentsById = componentById(identity);
  const parts: IdentityAuditionPart[] = [];

  for (const phrasePart of identity.phraseParts) {
    const auditionPart = renderIdentityPart(parts.length, phrasePart, componentsById);
    if (auditionPart) parts.push(auditionPart);
  }

  return {
    contract: 'IdentityAuditionPhrase',
    version: 1,
    source: 'fiction-cast-identity',
    formatId: identity.format.id,
    formatKind: identity.format.kind,
    identityText: identity.displayName,
    speechText: phraseText(parts, 'speechText'),
    displayText: phraseText(parts, 'displayText'),
    parts,
  };
}
