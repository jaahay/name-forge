import type { NameAuditionCue } from './audition';
import { createAuditionPhonology } from './auditionPhonology';
import { renderBrowserAuditionCue } from './browserAuditionProjection';
import type { SegmentSequence } from './soundGenerator';
import type { GeneratedNamePart, NameIdentity, NameIdentityPhrasePart, NamePartRole } from './types';

export type IdentityAuditionPhraseContract = 'IdentityAuditionPhrase';
export type IdentityAuditionPhraseSource = 'name-identity';
export type IdentityAuditionPartKind = 'sound' | 'text' | 'literal';
export type IdentityAuditionPartRole = NamePartRole | 'literal';
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
  readonly role: 'given' | 'family' | 'place';
  readonly speechSource: 'generated-sound';
  readonly displaySource: 'generated-sound';
  readonly sourceNameId: string;
  readonly sourceName: string;
  readonly transcription: string;
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
const identityRoles: ReadonlySet<NamePartRole> = new Set(['given', 'family', 'initial', 'title', 'epithet', 'place']);
const identityFormatKinds: ReadonlySet<NameIdentity['format']['kind']> = new Set(['given-only', 'given-family', 'initials-family', 'title-name', 'epithet-place']);
const punctuationLiterals = new Set([',', '.', ':', ';', '-', '(', ')', '[', ']', '/', '&']);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}

function isNamePartRole(value: unknown): value is NamePartRole {
  return typeof value === 'string' && identityRoles.has(value as NamePartRole);
}

function isSoundBackedRole(role: NamePartRole): role is IdentityAuditionSoundPart['role'] {
  return soundBackedRoles.has(role);
}

function isIdentityAuditionPart(value: unknown): value is IdentityAuditionPart {
  if (!isRecord(value)
    || !Number.isInteger(value.index)
    || (value.index as number) < 0
    || !isNonEmptyString(value.value)
    || !isNonEmptyString(value.speechText)
    || !isNonEmptyString(value.displayText)) {
    return false;
  }

  if (value.kind === 'sound') {
    return isNamePartRole(value.role)
      && isSoundBackedRole(value.role)
      && value.speechSource === 'generated-sound'
      && value.displaySource === 'generated-sound'
      && isNonEmptyString(value.sourceNameId)
      && isNonEmptyString(value.sourceName)
      && isNonEmptyString(value.transcription)
      && isRecord(value.cue)
      && value.cue.contract === 'NameAuditionCue'
      && isNonEmptyString(value.cue.speechText)
      && isNonEmptyString(value.cue.displayText);
  }

  if (value.kind === 'text') {
    return isNamePartRole(value.role)
      && value.speechSource === 'identity-text'
      && value.displaySource === 'identity-text'
      && isNonEmptyString(value.sourceNameId)
      && isNonEmptyString(value.sourceName);
  }

  if (value.kind === 'literal') {
    return value.role === 'literal'
      && value.speechSource === 'format-literal'
      && value.displaySource === 'format-literal';
  }

  return false;
}

export function isIdentityAuditionPhrase(value: unknown): value is IdentityAuditionPhrase {
  return isRecord(value)
    && value.contract === 'IdentityAuditionPhrase'
    && value.version === 1
    && value.source === 'name-identity'
    && isNonEmptyString(value.formatId)
    && typeof value.formatKind === 'string'
    && identityFormatKinds.has(value.formatKind as NameIdentity['format']['kind'])
    && isNonEmptyString(value.identityText)
    && isNonEmptyString(value.speechText)
    && isNonEmptyString(value.displayText)
    && Array.isArray(value.parts)
    && value.parts.length > 0
    && value.parts.every(isIdentityAuditionPart);
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
): IdentityAuditionPart | undefined {
  if (phrasePart.kind === 'literal') {
    return renderLiteralPart(index, phrasePart.value);
  }

  const part = partsById.get(phrasePart.partId);
  if (!part) return undefined;

  if (part.generation && isSoundBackedRole(part.role) && part.value === part.sourceName) {
    const cue = renderNameAuditionCue(part.generation.sound.sequence);

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
      sourceName: part.sourceName,
      transcription: part.generation.sound.transcription,
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

export function renderIdentityAuditionPhrase(identity: NameIdentity): IdentityAuditionPhrase {
  const partsById = identityPartById(identity);
  const parts: IdentityAuditionPart[] = [];

  for (const phrasePart of identity.phraseParts) {
    const auditionPart = renderIdentityPart(parts.length, phrasePart, partsById);
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
