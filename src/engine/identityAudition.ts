import { renderAuditionCue, type NameAuditionCue } from './audition';
import type { GeneratedName, GeneratedNamePart, NameIdentity, NamePartRole } from './types';

export type IdentityAuditionPhraseContract = 'IdentityAuditionPhrase';
export type IdentityAuditionPhraseSource = 'name-identity';
export type IdentityAuditionPartKind = 'sound' | 'text' | 'literal';
export type IdentityAuditionPartRole = NamePartRole | 'literal';

export type IdentityAuditionSourceName = Pick<GeneratedName, 'id' | 'name' | 'sound'>;

export interface IdentityAuditionBasePart {
  readonly index: number;
  readonly kind: IdentityAuditionPartKind;
  readonly role: IdentityAuditionPartRole;
  readonly value: string;
  readonly speechText: string;
  readonly displayText: string;
}

export interface IdentityAuditionSoundPart extends IdentityAuditionBasePart {
  readonly kind: 'sound';
  readonly role: 'given' | 'family' | 'place';
  readonly sourceNameId: string;
  readonly sourceName: string;
  readonly cue: NameAuditionCue;
}

export interface IdentityAuditionTextPart extends IdentityAuditionBasePart {
  readonly kind: 'text';
  readonly role: NamePartRole;
  readonly sourceNameId: string;
  readonly sourceName: string;
}

export interface IdentityAuditionLiteralPart extends IdentityAuditionBasePart {
  readonly kind: 'literal';
  readonly role: 'literal';
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

function isSoundBackedRole(role: NamePartRole): role is IdentityAuditionSoundPart['role'] {
  return soundBackedRoles.has(role);
}

function sourceNameById(sourceNames: readonly IdentityAuditionSourceName[]): ReadonlyMap<string, IdentityAuditionSourceName> {
  return new Map(sourceNames.map((sourceName) => [sourceName.id, sourceName]));
}

function identityPartByRole(identity: NameIdentity): ReadonlyMap<NamePartRole, GeneratedNamePart> {
  return new Map(identity.parts.map((part) => [part.role, part]));
}

function phraseTokens(pattern: string): readonly string[] {
  return pattern.split(/\s+/).filter((token) => token.length > 0);
}

function roleToken(token: string): NamePartRole | undefined {
  const match = /^\{(?<role>\w+)\}$/.exec(token);
  return match?.groups?.role as NamePartRole | undefined;
}

function renderTextPart(index: number, part: GeneratedNamePart): IdentityAuditionTextPart {
  return {
    index,
    kind: 'text',
    role: part.role,
    value: part.value,
    speechText: part.value,
    displayText: part.value,
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
  };
}

function renderIdentityPart(
  index: number,
  part: GeneratedNamePart,
  sources: ReadonlyMap<string, IdentityAuditionSourceName>,
): IdentityAuditionPart {
  const sourceName = sources.get(part.sourceNameId);

  if (sourceName && isSoundBackedRole(part.role) && part.value === sourceName.name) {
    const cue = renderAuditionCue(sourceName.sound.sequence);

    return {
      index,
      kind: 'sound',
      role: part.role,
      value: part.value,
      speechText: cue.speechText,
      displayText: cue.displayText,
      sourceNameId: part.sourceNameId,
      sourceName: sourceName.name,
      cue,
    };
  }

  return renderTextPart(index, part);
}

export function renderIdentityAuditionPhrase(
  identity: NameIdentity,
  sourceNames: readonly IdentityAuditionSourceName[],
): IdentityAuditionPhrase {
  const sources = sourceNameById(sourceNames);
  const partsByRole = identityPartByRole(identity);
  const parts = phraseTokens(identity.format.pattern).flatMap((token): IdentityAuditionPart[] => {
    const role = roleToken(token);
    const index = parts.length;

    if (!role) return [renderLiteralPart(index, token)];

    const part = partsByRole.get(role);
    if (!part) return [];

    return [renderIdentityPart(index, part, sources)];
  });

  return {
    contract: 'IdentityAuditionPhrase',
    version: 1,
    source: 'name-identity',
    formatId: identity.format.id,
    formatKind: identity.format.kind,
    identityText: identity.displayName,
    speechText: parts.map((part) => part.speechText).join(' '),
    displayText: parts.map((part) => part.displayText).join(' '),
    parts,
  };
}
