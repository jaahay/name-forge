import type { NameAuditionCue } from './audition';
import { createAuditionPhonology } from './auditionPhonology';
import { renderBrowserAuditionCue } from './browserAuditionProjection';
import type { SegmentSequence } from './soundGenerator';
import type { GeneratedName, GeneratedNamePart, NameIdentity, NameIdentityPhrasePart, NamePartRole } from './types';

export type IdentityAuditionPhraseContract = 'IdentityAuditionPhrase';
export type IdentityAuditionPhraseSource = 'name-identity';
export type IdentityAuditionPartKind = 'sound' | 'text' | 'literal';
export type IdentityAuditionPartRole = NamePartRole | 'literal';
export type IdentityAuditionTextSource = 'generated-sound' | 'identity-text' | 'format-literal';

export type IdentityAuditionSourceName = Pick<GeneratedName, 'id' | 'name' | 'sound'>;

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
  readonly role: 'given' | 'family' | 'place';
  readonly speechSource: 'generated-sound';
  readonly displaySource: 'generated-sound';
  readonly sourceNameId: string;
  readonly sourceName: string;
  readonly cue: NameAuditionCue;
}

export interface IdentityAuditionTextPart extends IdentityAuditionBasePart {
  readonly kind: 'text';
  readonly role: NamePartRole;
  readonly speechSource: 'identity-text';
  readonly displaySource: 'identity-text';
  readonly sourceNameId: string;
  readonly sourceName: string;
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
  readonly formatKind: NameIdentity['format']['kind'];
  readonly identityText: string;
  readonly speechText: string;
  readonly displayText: string;
  readonly parts: readonly IdentityAuditionPart[];
}

const soundBackedRoles: ReadonlySet<NamePartRole> = new Set(['given', 'family', 'place']);
const punctuationLiterals = new Set([',', '.', ':', ';', '-', '(', ')', '[', ']', '/', '&']);

function isSoundBackedRole(role: NamePartRole): role is IdentityAuditionSoundPart['role'] {
  return soundBackedRoles.has(role);
}

function sourceNameById(sourceNames: readonly IdentityAuditionSourceName[]): ReadonlyMap<string, IdentityAuditionSourceName> {
  return new Map(sourceNames.map((sourceName) => [sourceName.id, sourceName]));
}

function identityPartById(identity: NameIdentity): ReadonlyMap<string, GeneratedNamePart> {
  return new Map(identity.parts.map((part) => [part.id, part]));
}

function renderTextPart(index: number, part: GeneratedNamePart): IdentityAuditionTextPart {
  return {
    index,
    kind: 'text',
    role: part.role,
    value: part.value,
    speechText: part.value,
    displayText: part.value,
    speechSource: 'identity-text',
    displaySource: 'identity-text',
    sourceNameId: part.sourceNameId,
    sourceName: part.sourceName,
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

function renderNameAuditionCue(sequence: SegmentSequence): NameAuditionCue {
  const phonology = createAuditionPhonology(sequence);
  const browserCue = renderBrowserAuditionCue(phonology);

  return {
    ...browserCue,
    contract: 'NameAuditionCue',
    phonology,
  };
}

function renderIdentityPart(
  index: number,
  phrasePart: NameIdentityPhrasePart,
  partsById: ReadonlyMap<string, GeneratedNamePart>,
  sources: ReadonlyMap<string, IdentityAuditionSourceName>,
): IdentityAuditionPart | undefined {
  if (phrasePart.kind === 'literal') {
    return renderLiteralPart(index, phrasePart.value);
  }

  const part = partsById.get(phrasePart.partId);
  if (!part) return undefined;

  const sourceName = sources.get(part.sourceNameId);

  if (sourceName && isSoundBackedRole(part.role) && part.value === sourceName.name) {
    const cue = renderNameAuditionCue(sourceName.sound.sequence);

    return {
      index,
      kind: 'sound',
      role: part.role,
      value: part.value,
      speechText: cue.speechText,
      displayText: cue.displayText,
      speechSource: 'generated-sound',
      displaySource: 'generated-sound',
      sourceNameId: part.sourceNameId,
      sourceName: sourceName.name,
      cue,
    };
  }

  return renderTextPart(index, part);
}

function phraseText(parts: readonly IdentityAuditionPart[], field: 'speechText' | 'displayText'): string {
  return parts.reduce((text, part) => {
    if (text.length === 0) return part[field];
    if (part.kind === 'literal' && punctuationLiterals.has(part.value)) return `${text}${part[field]}`;
    return `${text} ${part[field]}`;
  }, '');
}

export function renderIdentityAuditionPhrase(
  identity: NameIdentity,
  sourceNames: readonly IdentityAuditionSourceName[],
): IdentityAuditionPhrase {
  const sources = sourceNameById(sourceNames);
  const partsById = identityPartById(identity);
  const parts: IdentityAuditionPart[] = [];

  for (const phrasePart of identity.phraseParts) {
    const auditionPart = renderIdentityPart(parts.length, phrasePart, partsById, sources);
    if (auditionPart) parts.push(auditionPart);
  }

  return {
    contract: 'IdentityAuditionPhrase',
    version: 1,
    source: 'name-identity',
    formatId: identity.format.id,
    formatKind: identity.format.kind,
    identityText: identity.displayName,
    speechText: phraseText(parts, 'speechText'),
    displayText: phraseText(parts, 'displayText'),
    parts,
  };
}
