import type { GeneratedName, GeneratedNamePart, NameFormatKind, NameFormatRule, NameIdentity, ProvenanceNote } from './types';

export type MaterializedNameFormatKind = Exclude<NameFormatKind, 'mixed'>;

const mixedFormatSequence: MaterializedNameFormatKind[] = ['given-only', 'given-family', 'initials-family'];

const formatRuleProvenance: ProvenanceNote = {
  sourceId: 'name-forge:name-format-rules@0.1.0',
  sourceKind: 'algorithm',
  label: 'Selected name format rule',
  detail: 'Selected a deterministic identity frame that assigns generated name material to semantic parts before rendering the display name.',
};

const formatRules: Record<MaterializedNameFormatKind, NameFormatRule> = {
  'given-only': {
    id: 'format:given-only',
    kind: 'given-only',
    label: 'Given name only',
    pattern: '{given}',
    provenance: formatRuleProvenance,
  },
  'given-family': {
    id: 'format:given-family',
    kind: 'given-family',
    label: 'Given + family name',
    pattern: '{given} {family}',
    provenance: formatRuleProvenance,
  },
  'initials-family': {
    id: 'format:initials-family',
    kind: 'initials-family',
    label: 'Initials + family name',
    pattern: '{initials} {family}',
    provenance: formatRuleProvenance,
  },
};

export function resolveMaterializedFormatKind(format: NameFormatKind | undefined, index: number): MaterializedNameFormatKind {
  if (!format || format === 'mixed') return mixedFormatSequence[index % mixedFormatSequence.length];
  return format;
}

export function requiresFamilyName(format: MaterializedNameFormatKind): boolean {
  return format === 'given-family' || format === 'initials-family';
}

function partProvenance(role: GeneratedNamePart['role'], sourceName: GeneratedName): ProvenanceNote {
  return {
    sourceId: `name-forge:name-part:${role}@0.1.0`,
    sourceKind: 'algorithm',
    label: `${role.charAt(0).toUpperCase()}${role.slice(1)} name part`,
    detail: `Rendered the ${role} part from generated source name ${sourceName.name}.`,
  };
}

function createPart(role: GeneratedNamePart['role'], value: string, sourceName: GeneratedName): GeneratedNamePart {
  return {
    id: `${sourceName.id}:${role}`,
    role,
    value,
    sourceNameId: sourceName.id,
    sourceName: sourceName.name,
    provenance: [...sourceName.provenance, partProvenance(role, sourceName)],
  };
}

function initialsFor(name: string): string {
  return name
    .split(/[\s-]+/)
    .filter((part) => part.length > 0)
    .map((part) => `${part.charAt(0).toUpperCase()}.`)
    .join(' ');
}

export function createNameIdentity(given: GeneratedName, family: GeneratedName | undefined, format: MaterializedNameFormatKind): NameIdentity {
  const rule = formatRules[format];
  const givenPart = createPart('given', given.name, given);
  const familyPart = family ? createPart('family', family.name, family) : undefined;
  const initialPart = createPart('initial', initialsFor(given.name), given);

  if (format === 'given-only') {
    return {
      displayName: givenPart.value,
      format: rule,
      parts: [givenPart],
      provenance: [rule.provenance, ...givenPart.provenance],
    };
  }

  const safeFamilyPart = familyPart ?? createPart('family', given.name, given);
  if (format === 'initials-family') {
    return {
      displayName: `${initialPart.value} ${safeFamilyPart.value}`,
      format: rule,
      parts: [initialPart, safeFamilyPart],
      provenance: [rule.provenance, ...initialPart.provenance, ...safeFamilyPart.provenance],
    };
  }

  return {
    displayName: `${givenPart.value} ${safeFamilyPart.value}`,
    format: rule,
    parts: [givenPart, safeFamilyPart],
    provenance: [rule.provenance, ...givenPart.provenance, ...safeFamilyPart.provenance],
  };
}
