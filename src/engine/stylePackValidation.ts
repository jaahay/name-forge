import type { DataSourceDescriptor, NameVariantConfidence, NameVariantRelationship, SourceCapability, SourceDescriptorKind, SourceKind, SourceTrustBoundary, SourceValidationIssue, StylePack, StylePackCompatibleMode, StylePackDesignStatus, StylePackSourceDescriptor, StylePackValidationResult, WeightedValue } from './types';

const sourceDescriptorKinds: SourceDescriptorKind[] = ['built-in-bundle', 'local-file', 'http', 'api', 'package', 'user-pack'];
const sourceTrustBoundaries: SourceTrustBoundary[] = ['bundled-offline', 'local-user-file', 'remote-service', 'third-party-package', 'user-authored'];
const sourceCapabilities: SourceCapability[] = ['style-packs', 'phonotactics', 'listed-variants', 'variant-rules', 'role-profiles'];
const stylePackDesignStatuses: StylePackDesignStatus[] = ['experimental', 'starter', 'stable'];
const stylePackCompatibleModes: StylePackCompatibleMode[] = ['fiction-cast', 'game-npc'];
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

function validateDescriptor(source: DataSourceDescriptor | undefined, path = 'source.descriptor'): SourceValidationIssue[] {
  if (!source) return [issue(path, 'Style pack must declare a provider source descriptor.')];

  const issues: SourceValidationIssue[] = [];
  if (!hasText(source.id)) issues.push(issue(`${path}.id`, 'Source descriptor id is required.'));
  if (!hasText(source.label)) issues.push(issue(`${path}.label`, 'Source descriptor label is required.'));
  if (!sourceDescriptorKinds.includes(source.kind)) issues.push(issue(`${path}.kind`, `Unsupported source descriptor kind: ${source.kind}.`));
  if (!hasText(source.version)) issues.push(issue(`${path}.version`, 'Source descriptor version is required.'));
  if (!source.origin || !hasText(source.origin.value)) issues.push(issue(`${path}.origin`, 'Source descriptor origin is required.'));
  if (!sourceTrustBoundaries.includes(source.trustBoundary)) issues.push(issue(`${path}.trustBoundary`, `Unsupported trust boundary: ${source.trustBoundary}.`));
  if (source.capabilities.length === 0) issues.push(issue(`${path}.capabilities`, 'At least one source capability is required.'));
  source.capabilities.forEach((capability, index) => {
    if (!sourceCapabilities.includes(capability)) issues.push(issue(`${path}.capabilities.${index}`, `Unsupported source capability: ${capability}.`));
  });
  if (!hasText(source.sourceNotes)) issues.push(issue(`${path}.sourceNotes`, 'Source notes are required.'));
  if (!hasText(source.trustNotes)) issues.push(issue(`${path}.trustNotes`, 'Trust notes are required.'));
  return issues;
}

function validateStylePackSource(source: StylePackSourceDescriptor | undefined, pack: StylePack): SourceValidationIssue[] {
  if (!source) return [issue('source', 'Style pack must declare pack-level source metadata.')];

  const issues: SourceValidationIssue[] = [
    ...validateDescriptor(source.descriptor),
    ...(!hasText(source.packId) ? [issue('source.packId', 'Style pack source packId is required.')] : []),
    ...(!hasText(source.packVersion) ? [issue('source.packVersion', 'Style pack source packVersion is required.')] : []),
    ...(!hasText(source.sourcePath) ? [issue('source.sourcePath', 'Style pack source path is required.')] : []),
    ...(!hasText(source.licenseNotes) ? [issue('source.licenseNotes', 'Style pack license notes are required.')] : []),
    ...(!hasText(source.styleNotes) ? [issue('source.styleNotes', 'Style pack style notes are required.')] : []),
    ...validateStringArray('source.limitations', source.limitations),
  ];

  if (source.packId !== pack.id) issues.push(issue('source.packId', 'Style pack source packId must match the pack id.'));
  if (source.packVersion !== pack.version) issues.push(issue('source.packVersion', 'Style pack source packVersion must match the pack version.'));
  return issues;
}

function validateStylePackDesign(pack: StylePack): SourceValidationIssue[] {
  const design = pack.design;
  if (!design) return [issue('design', 'Style pack design manifest is required.')];

  const issues: SourceValidationIssue[] = [];
  if (design.schemaVersion !== 'name-forge.style-pack.v1') issues.push(issue('design.schemaVersion', 'Style pack schemaVersion must be name-forge.style-pack.v1.'));
  if (!stylePackDesignStatuses.includes(design.status)) issues.push(issue('design.status', `Unsupported style pack status: ${design.status}.`));
  if (!hasText(design.intendedUse)) issues.push(issue('design.intendedUse', 'Style pack intended use is required.'));
  if (design.compatibleModes.length === 0) issues.push(issue('design.compatibleModes', 'At least one compatible mode is required.'));
  design.compatibleModes.forEach((mode, index) => {
    if (!stylePackCompatibleModes.includes(mode)) issues.push(issue(`design.compatibleModes.${index}`, `Unsupported compatible mode: ${mode}.`));
  });
  issues.push(...validateStringArray('design.designPrinciples', design.designPrinciples));
  issues.push(...validateStringArray('design.safetyNotes', design.safetyNotes));
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
  return values.flatMap((value, index) => (hasText(value) ? [] : [issue(`${path}.${index}`, 'String array entries must not be blank.')]));
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
    ...validateStylePackSource(pack.source, pack),
    ...validateStylePackDesign(pack),
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
