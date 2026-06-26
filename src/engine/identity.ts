import type { GeneratedName, GeneratedNamePart, NameFormatKind, NameFormatRule, NameIdentity } from './types';

export type MaterializedNameFormatKind = Exclude<NameFormatKind, 'mixed'>;

const mixedFormatSequence: MaterializedNameFormatKind[] = ['given-only', 'given-family', 'initials-family', 'title-name', 'epithet-place'];
const titleOptions = ['Archivist', 'Captain', 'Chronicler', 'Doctor', 'Keeper', 'Marshal', 'Professor', 'Warden'];
const epithetOptions = ['the Ashen', 'the Bright', 'the Far', 'the Kindled', 'the Riverwise', 'the Silver', 'the Starlit', 'the Wry'];
const placeSuffixes = ['ford', 'hearth', 'holt', 'mere', 'reach', 'vale', 'wick', 'wold'];

const formatRules: Record<MaterializedNameFormatKind, NameFormatRule> = {
  'given-only': { id: 'format:given-only', kind: 'given-only', label: 'Given name only', pattern: '{given}' },
  'given-family': { id: 'format:given-family', kind: 'given-family', label: 'Given + family name', pattern: '{given} {family}' },
  'initials-family': { id: 'format:initials-family', kind: 'initials-family', label: 'Initials + family name', pattern: '{initials} {family}' },
  'title-name': { id: 'format:title-name', kind: 'title-name', label: 'Title + name', pattern: '{title} {given}' },
  'epithet-place': { id: 'format:epithet-place', kind: 'epithet-place', label: 'Epithet/place-style name', pattern: '{given} {epithet} of {place}' },
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

function fingerprint(value: string): number {
  return [...value].reduce((total, character, index) => total + character.charCodeAt(0) * (index + 1), 0);
}

function pickDeterministic(options: string[], key: string): string {
  const selected = options[fingerprint(key) % options.length];
  return selected ?? options[0] ?? '';
}

function initialsFor(name: string): string {
  return name.split(/[\s-]+/).filter((part) => part.length > 0).map((part) => `${part.charAt(0).toUpperCase()}.`).join(' ');
}

function placeNameFor(name: string): string {
  const compactName = name.replace(/[^A-Za-z]/g, '');
  const baseStem = compactName.length >= 3 ? compactName.slice(0, Math.min(8, compactName.length)) : 'North';
  const stem = `${baseStem.charAt(0).toUpperCase()}${baseStem.slice(1).toLowerCase()}`;
  const suffix = pickDeterministic(placeSuffixes, name);
  return stem.toLowerCase().endsWith(suffix) ? stem : `${stem}${suffix}`;
}

export function createNameIdentity(given: GeneratedName, supportingName: GeneratedName | undefined, format: MaterializedNameFormatKind): NameIdentity {
  const rule = formatRules[format];
  const givenPart = createPart('given', given.name, given);
  const familyPart = supportingName ? createPart('family', supportingName.name, supportingName) : undefined;
  const initialPart = createPart('initial', initialsFor(given.name), given);
  const titlePart = createPart('title', pickDeterministic(titleOptions, given.name), given);
  const epithetPart = createPart('epithet', pickDeterministic(epithetOptions, given.name), given);

  if (format === 'given-only') return { displayName: givenPart.value, format: rule, parts: [givenPart] };
  if (format === 'title-name') return { displayName: `${titlePart.value} ${givenPart.value}`, format: rule, parts: [titlePart, givenPart] };
  if (format === 'epithet-place') {
    const placeSource = supportingName ?? given;
    const placePart = createPart('place', placeNameFor(placeSource.name), placeSource);
    return { displayName: `${givenPart.value} ${epithetPart.value} of ${placePart.value}`, format: rule, parts: [givenPart, epithetPart, placePart] };
  }

  const safeFamilyPart = familyPart ?? createPart('family', given.name, given);
  if (format === 'initials-family') return { displayName: `${initialPart.value} ${safeFamilyPart.value}`, format: rule, parts: [initialPart, safeFamilyPart] };
  return { displayName: `${givenPart.value} ${safeFamilyPart.value}`, format: rule, parts: [givenPart, safeFamilyPart] };
}
