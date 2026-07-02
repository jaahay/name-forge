import type { NameAuditionCue } from './audition';
import { createAuditionPhonology } from './auditionPhonology';
import { renderBrowserAuditionCue } from './browserAuditionProjection';
import type { SegmentSequence } from './soundGenerator';
import type { GeneratedName, GeneratedNamePart, NameIdentity, NamePartRole } from './types';

export type IdentityAuditionPhraseContract = 'IdentityAuditionPhrase';
export type IdentityAuditionPhraseSource = 'name-identity';
export type IdentityAuditionPartKind = 'sound' | 'text' | 'literal';
export type IdentityAuditionPartRole = NamePartRole | 'literal';
export type IdentityAuditionTextSource = 'generated-sound' | 'identity-text' | 'format-literal';

export type IdentityAuditionSourceName = Pick<GeneratedName, 'id' | 'name' | 'sound'>;

interface IdentityFormatPlaceholderToken {
  readonly kind: 'placeholder';
  readonly role: NamePartRole;
}

interface IdentityFormatLiteralToken {
  readonly kind: 'literal';
  readonly value: string;
}

type IdentityFormatToken = IdentityFormatPlaceholderToken | IdentityFormatLiteralToken;

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

const namePartRoles: readonly NamePartRole[] = ['given', 'family', 'initial', 'title', 'epithet', 'place'];
const soundBackedRoles: ReadonlySet<NamePartRole> = new Set(['given', 'family', 'place']);
const punctuationLiterals = new Set([',', '.', ':', ';', '-', '(', ')', '[', ']', '/', '&']);

function isNamePartRole(value: string): value is NamePartRole {
  return namePartRoles.includes(value as NamePartRole);
}

function isSoundBackedRole(role: NamePartRole): role is IdentityAuditionSoundPart['role'] {
  return soundBackedRoles.has(role);
}

function isWhitespace(character: string): boolean {
  return character === ' ' || character === '\n' || character === '\t' || character === '\r';
}

function sourceNameById(sourceNames: readonly IdentityAuditionSourceName[]): ReadonlyMap<string, IdentityAuditionSourceName> {
  return new Map(sourceNames.map((sourceName) => [sourceName.id, sourceName]));
}

function partForRole(identity: NameIdentity, role: NamePartRole, occurrence: number): GeneratedNamePart | undefined {
  const matches = identity.parts.filter((part) => part.role === role);
  if (matches.length === 0) return undefined;
  return matches[occurrence] ?? matches[0];
}

function pushLiteralToken(tokens: IdentityFormatToken[], value: string): void {
  const trimmed = value.trim();
  if (trimmed.length === 0) return;
  tokens.push({ kind: 'literal', value: trimmed });
}

function pushLiteralTokens(tokens: IdentityFormatToken[], value: string): void {
  let literal = '';

  for (const character of value) {
    if (isWhitespace(character)) {
      pushLiteralToken(tokens, literal);
      literal = '';
      continue;
    }

    if (punctuationLiterals.has(character)) {
      pushLiteralToken(tokens, literal);
      literal = '';
      pushLiteralToken(tokens, character);
      continue;
    }

    literal = `${literal}${character}`;
  }

  pushLiteralToken(tokens, literal);
}

function parseIdentityFormatPattern(pattern: string): readonly IdentityFormatToken[] {
  const tokens: IdentityFormatToken[] = [];
  let index = 0;
  let literal = '';

  while (index < pattern.length) {
    const character = pattern[index];

    if (character === '{') {
      const end = pattern.indexOf('}', index + 1);

      if (end > index) {
        const role = pattern.slice(index + 1, end);

        if (isNamePartRole(role)) {
          pushLiteralTokens(tokens, literal);
          literal = '';
          tokens.push({ kind: 'placeholder', role });
          index = end + 1;
          continue;
        }
      }
    }

    literal = `${literal}${character}`;
    index += 1;
  }

  pushLiteralTokens(tokens, literal);
  return tokens;
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
  part: GeneratedNamePart,
  sources: ReadonlyMap<string, IdentityAuditionSourceName>,
): IdentityAuditionPart {
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
  const roleOccurrences = new Map<NamePartRole, number>();
  const parts: IdentityAuditionPart[] = [];

  for (const token of parseIdentityFormatPattern(identity.format.pattern)) {
    if (token.kind === 'literal') {
      parts.push(renderLiteralPart(parts.length, token.value));
      continue;
    }

    const occurrence = roleOccurrences.get(token.role) ?? 0;
    const part = partForRole(identity, token.role, occurrence);
    roleOccurrences.set(token.role, occurrence + 1);

    if (part) {
      parts.push(renderIdentityPart(parts.length, part, sources));
    }
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
