import type { DataSourceDescriptor, NameVariantConfidence, NameVariantRelationship, SourceDescriptorKind, SourceKind, SourceValidationIssue, StylePack, StylePackValidationResult, WeightedValue } from './types';

const sourceDescriptorKinds: SourceDescriptorKind[] = ['built-in-bundle', 'local-file', 'http', 'api', 'package', 'user-pack'];
const sourceKinds: SourceKind[] = ['style-pack', 'algorithm', 'listed-source', 'remote-pack'];
const variantRelationships: NameVariantRelationship[] = [
  'same_pronunciation',
  'near_pronunciation',
  'orthographic_variant',
  'regional_variant',
  'historical_variant',
  'transliteration',
  'cognate',
  'diminutive',
  'nickname',
  'creative_respelling',
  'alias',
];
const variantConfidences: NameVariantConfidence[] = ['low', 'medium', 'high'];

function issue(path: string, message: string, severity: SourceValidationIssue['severity'] = 'error'): SourceValidationIssue {
  return { severity, path, message };
}

function hasText(value: string | undefined): boolean {
  return typeof value === 'string' && value.trim().length > 0;
}

function validateDescriptor(source: DataSourceDescriptor | undefined): SourceValidationIssue[] {
  if (!source) return [issue('source', 'Style pack must declare a source descriptor.')];

  const issues: SourceValidationIssue[] = [];
  if (!hasText(source.id)) issues.push(issue('source.id', 'Source descriptor id is required.'));
  if (!hasText(source.label)) issues.push(issue('source.label', 'Source descriptor label is required.'));
  if (!sourceDescriptorKinds.includes(source.kind)) issues.push(issue('source.kind', `Unsupported source descriptor kind: ${source.kind}.`));
  if (!hasText(source.version)) issues.push(issue('source.version', 'Source descriptor version is required.'));
  if (!source.origin || !hasText(source.origin.value)) issues.push(issue('source.origin', 'Source descriptor origin is required.'));
  if (!hasText(source.sourceNotes)) issues.push(issue('source.sourceNotes', 'Source notes are required.'));
  if (!hasText(source.trustNotes)) issues.push(issue('source.trustNotes', 'Trust notes are required.'));
  return issues;
}

function validateWeightedValues(path: string, values: Array<WeightedValue<string | number>>): SourceValidationIssue[] {
  if (values.length === 0) return [issue(path, 'Weighted values must not be empty.')];
  return values.flatMap((entry, index) => {
    const entryIssues: SourceValidationIssue[] = [];
    if (entry.value === undefined || entry.value === null) entryIssues.push(issue(`${path}.${index}.value`, 'Weighted value is required.'));
    if (!Number.isFinite(entry.weight) || entry.weight <= 0) entryIssues.push(issue(`${path}.${index}.weight`, 'Weight must be a positive finite number.'));
    return entryIssues;
  });
}

function validateStringArray(path: string, values: string[]): SourceValidationIssue[] {
  if (values.length === 0) return [issue(path, 'String array must not be empty.')];
  return values.flatMap((value, index) => (hasText(value) ? [] : [issue(`${path}.${index}`, 'String array entries must not be blank.')]);
}

function validateListedVariants(pack: StylePack): SourceValidationIssue[] {
  return Object.entries(pack.listedVariants).flatMap(([name, variants]) => {
    const issues: SourceValidationIssue[] = [];
    if (!hasText(name)) issues.push(issue('listedVariants', 'Listed variant source names must not be blank.'));
    if (variants.length === 0) issues.push(issue(`listedVariants.${name}`, 'Listed variant arrays must not be empty.'));
    variants.forEach((variant, index) => {
      if (!hasText(variant)) issues.push(issue(`listedVariants.${name}.${index}`, 'Listed variants must not be blank.'));
    });
    return issues;
  });
}

function validateVariantRules(pack: StylePack): SourceValidationIssue[] {
  if (pack.variantRules.length === 0) return [issue('variantRules', 'At least one variant rule is required.', 'warning')];

  return pack.variantRules.flatMap((rule, index) => {
    const path = `variantRules.${index}`;
    const issues: SourceValidationIssue[] = [];
    if (!hasText(rule.id)) issues.push(issue(`${path}.id`, 'Variant rule id is required.'));
    if (!hasText(rule.label)) issues.push(issue(`${path}.label`, 'Variant rule label is required.'));
    if (!hasText(rule.from)) issues.push(issue(`${path}.from`, 'Variant rule source pattern is required.'));
    if (!hasText(rule.to)) issues.push(issue(`${path}.to`, 'Variant rule replacement is required.'));
    if (!sourceKinds.includes(rule.sourceKind)) issues.push(issue(`${path}.sourceKind`, `Unsupported variant rule source kind: ${rule.sourceKind}.`));
    if (rule.relationship && !variantRelationships.includes(rule.relationship)) issues.push(issue(`${path}.relationship`, `Unsupported variant relationship: ${rule.relationship}.`));
    if (rule.confidence && !variantConfidences.includes(rule.confidence)) issues.push(issue(`${path}.confidence`, `Unsupported variant confidence: ${rule.confidence}.`));
    if (rule.maxApplications !== undefined && (!Number.isInteger(rule.maxApplications) || rule.maxApplications <= 0)) issues.push(issue(`${path}.maxApplications`, 'Variant rule maxApplications must be a positive integer.'));
    return issues;
  });
}

export function validateStylePack(pack: StylePack): StylePackValidationResult {
  const issues: SourceValidationIssue[] = [
    ...validateDescriptor(pack.source),
    ...(!hasText(pack.id) ? [issue('id', 'Style pack id is required.')] : []),
    ...(!hasText(pack.label) ? [issue('label', 'Style pack label is required.')] : []),
    ...(!hasText(pack.description) ? [issue('description', 'Style pack description is required.')] : []),
    ...(!hasText(pack.version) ? [issue('version', 'Style pack version is required.')] : []),
    ...(!hasText(pack.localeHint) ? [issue('localeHint', 'Style pack locale hint is required.')] : []),
    ...validateStringArray('culturalAnchors', pack.culturalAnchors),
    ...validateWeightedValues('phonotactics.onsets', pack.phonotactics.onsets),
    ...validateWeightedValues('phonotactics.nuclei', pack.phonotactics.nuclei),
    ...validateWeightedValues('phonotactics.codas', pack.phonotactics.codas),
    ...validateWeightedValues('phonotactics.preferredEndings', pack.phonotactics.preferredEndings),
    ...validateStringArray('phonotactics.rareGraphemes', pack.phonotactics.rareGraphemes),
    ...validateStringArray('phonotactics.forbiddenFragments', pack.phonotactics.forbiddenFragments),
    ...validateWeightedValues('silhouetteBias.syllableCounts', pack.silhouetteBias.syllableCounts),
    ...validateWeightedValues('silhouetteBias.textures', pack.silhouetteBias.textures),
    ...validateWeightedValues('silhouetteBias.rarityBands', pack.silhouetteBias.rarityBands),
    ...validateListedVariants(pack),
    ...validateVariantRules(pack),
  ];

  return {
    packId: pack.id,
    valid: issues.every((entry) => entry.severity !== 'error'),
    issues,
  };
}
