import type { GeneratedName, GeneratedNamePart, NameFormatKind, NameFormatRule, NameIdentity, NameIdentityPhrasePart } from './types';
import type { SoundProfileLexeme } from './soundProfile';

export type MaterializedNameFormatKind = Exclude<NameFormatKind, 'mixed'>;

const mixedFormatSequence: MaterializedNameFormatKind[] = ['given-only', 'given-family', 'initials-family', 'title-name', 'epithet-place'];

const formatRules: Record<MaterializedNameFormatKind, NameFormatRule> = {
  'given-only': { id: 'format:given-only', kind: 'given-only', label: 'Given name only' },
  'given-family': { id: 'format:given-family', kind: 'given-family', label: 'Given + family name' },
  'initials-family': { id: 'format:initials-family', kind: 'initials-family', label: 'Initials + family name' },
  'title-name': { id: 'format:title-name', kind: 'title-name', label: 'Title + name' },
  'epithet-place': { id: 'format:epithet-place', kind: 'epithet-place', label: 'Epithet/place-style name' },
};

export function resolveMaterializedFormatKind(format: NameFormatKind | undefined, index: number): MaterializedNameFormatKind {
  if (!format || format === 'mixed') return mixedFormatSequence[index % mixedFormatSequence.length];
  return format;
}

export function requiresSupportingName(format: MaterializedNameFormatKind): boolean {
  return format === 'given-family' || format === 'initials-family' || format === 'epithet-place';
}

function createPart(role: GeneratedNamePart['role'], value: string, sourceName: GeneratedName): GeneratedNamePart {
  return { id: `${sourceName.id}:${role}`, role, value, sourceNameId: sourceName.id, sourceName: sourceName.name };
}

function phrasePart(part: GeneratedNamePart): NameIdentityPhrasePart {
  return { kind: 'part', partId: part.id, role: part.role };
}

function literalPart(value: string): NameIdentityPhrasePart {
  return { kind: 'literal', value };
}

function createIdentity(displayName: string, format: NameFormatRule, parts: GeneratedNamePart[], phraseParts: NameIdentityPhrasePart[]): NameIdentity {
  return {
    displayName,
    format,
    parts,
    phraseParts,
  };
}

function fingerprint(value: string): number {
  return [...value].reduce((total, character, index) => total + character.charCodeAt(0) * (index + 1), 0);
}

function pickProfileLexeme(options: readonly SoundProfileLexeme[], key: string, role: SoundProfileLexeme['kind']): SoundProfileLexeme {
  const matchingOptions = options.filter((option) => option.kind === role);
  const selected = matchingOptions[fingerprint(key) % matchingOptions.length];

  if (!selected) {
    throw new Error(`SoundProfile has no ${role} lexemes available for identity construction.`);
  }

  return selected;
}

function initialsFor(name: string): string {
  return name.split(/[\s-]+/).filter((part) => part.length > 0).map((part) => `${part.charAt(0).toUpperCase()}.`).join(' ');
}

export function createNameIdentity(given: GeneratedName, supportingName: GeneratedName | undefined, format: MaterializedNameFormatKind): NameIdentity {
  const rule = formatRules[format];
  const givenPart = createPart('given', given.name, given);
  const familyPart = supportingName ? createPart('family', supportingName.name, supportingName) : undefined;
  const initialPart = createPart('initial', initialsFor(given.name), given);
  const titleLexeme = pickProfileLexeme(given.soundProfile.lexicon.titles, given.name, 'title');
  const epithetLexeme = pickProfileLexeme(given.soundProfile.lexicon.epithets, given.name, 'epithet');
  const titlePart = createPart('title', titleLexeme.text, given);
  const epithetPart = createPart('epithet', epithetLexeme.text, given);

  if (format === 'given-only') {
    return createIdentity(givenPart.value, rule, [givenPart], [phrasePart(givenPart)]);
  }

  if (format === 'title-name') {
    return createIdentity(`${titlePart.value} ${givenPart.value}`, rule, [titlePart, givenPart], [phrasePart(titlePart), phrasePart(givenPart)]);
  }

  if (format === 'epithet-place') {
    const placeSource = supportingName ?? given;
    const placePart = createPart('place', placeSource.name, placeSource);
    return createIdentity(
      `${givenPart.value} ${epithetPart.value} of ${placePart.value}`,
      rule,
      [givenPart, epithetPart, placePart],
      [phrasePart(givenPart), phrasePart(epithetPart), literalPart('of'), phrasePart(placePart)],
    );
  }

  const safeFamilyPart = familyPart ?? createPart('family', given.name, given);

  if (format === 'initials-family') {
    return createIdentity(`${initialPart.value} ${safeFamilyPart.value}`, rule, [initialPart, safeFamilyPart], [phrasePart(initialPart), phrasePart(safeFamilyPart)]);
  }

  return createIdentity(`${givenPart.value} ${safeFamilyPart.value}`, rule, [givenPart, safeFamilyPart], [phrasePart(givenPart), phrasePart(safeFamilyPart)]);
}
