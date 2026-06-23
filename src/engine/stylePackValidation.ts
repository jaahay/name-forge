import type { AssetDescriptor, AssetKind, NameVariantConfidence, NameVariantRelationship, SourceChannel, SourceDescriptor, SourceKind, SourceValidationIssue, StyleDescriptor, StylePack, StylePackSourceDescriptor, StylePackValidationResult, WeightedValue } from './types';

const sourceChannels: SourceChannel[] = ['built-in', 'user-authored', 'local-file', 'package', 'remote-http', 'remote-api'];
const assetKinds: AssetKind[] = ['style-pack', 'phonotactics', 'listed-variants', 'variant-rules', 'role-profiles', 'pronunciation-lexicon', 'ipa-rules', 'name-list'];
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

function validateSourceDescriptor(source: SourceDescriptor | undefined, path = 'source.source'): SourceValidationIssue[] {
  if (!source) return [issue(path, 'Style pack must declare a source descriptor.')];

  const issues: SourceValidationIssue[] = [];
  if (source.schemaVersion !== 'name-forge.source.v1') issues.push(issue(`${path}.schemaVersion`, 'Source descriptor schemaVersion must be name-forge.source.v1.'));
  if (!hasText(source.id)) issues.push(issue(`${path}.id`, 'Source descriptor id is required.'));
  if (!hasText(source.label)) issues.push(issue(`${path}.label`, 'Source descriptor label is required.'));
  if (!sourceChannels.includes(source.channel)) issues.push(issue(`${path}.channel`, `Unsupported source channel: ${source.channel}.`));
  if (!hasText(source.version)) issues.push(issue(`${path}.version`, 'Source descriptor version is required.'));
  if (!Array.isArray(source.assetKinds) || source.assetKinds.length === 0) {
    issues.push(issue(`${path}.assetKinds`, 'At least one source asset kind is required.'));
  } else {
    source.assetKinds.forEach((assetKind, index) => {
      if (!assetKinds.includes(assetKind)) issues.push(issue(`${path}.assetKinds.${index}`, `Unsupported asset kind: ${assetKind}.`));
    });
  }
  if (!hasText(source.license)) issues.push(issue(`${path}.license`, 'Source license is required.'));
  if (typeof source.enabledByDefault !== 'boolean') issues.push(issue(`${path}.enabledByDefault`, 'Source enabledByDefault must be a boolean.'));
  if (!Number.isFinite(source.priority)) issues.push(issue(`${path}.priority`, 'Source priority must be a finite number.'));
  if (!['none', 'session', 'persistent', 'external'].includes(source.cachePolicy)) issues.push(issue(`${path}.cachePolicy`, `Unsupported cache policy: ${source.cachePolicy}.`));
  if (!hasText(source.sourceNotes)) issues.push(issue(`${path}.sourceNotes`, 'Source notes are required.'));
  if (!hasText(source.trustNotes)) issues.push(issue(`${path}.trustNotes`, 'Trust notes are required.'));
  return issues;
}

function validateAssetDescriptor(asset: AssetDescriptor | undefined, source: SourceDescriptor | undefined, path = 'source.asset'): SourceValidationIssue[] {
  if (!asset) return [issue(path, 'Style pack must declare an asset descriptor.')];

  const issues: SourceValidationIssue[] = [];
  if (asset.schemaVersion !== 'name-forge.asset.v1') issues.push(issue(`${path}.schemaVersion`, 'Asset descriptor schemaVersion must be name-forge.asset.v1.'));
  if (!hasText(asset.id)) issues.push(issue(`${path}.id`, 'Asset descriptor id is required.'));
  if (!assetKinds.includes(asset.kind)) issues.push(issue(`${path}.kind`, `Unsupported asset kind: ${asset.kind}.`));
  if (!hasText(asset.sourceId)) issues.push(issue(`${path}.sourceId`, 'Asset descriptor sourceId is required.'));
  if (!hasText(asset.label)) issues.push(issue(`${path}.label`, 'Asset descriptor label is required.'));
  if (!hasText(asset.version)) issues.push(issue(`${path}.version`, 'Asset descriptor version is required.'));
  if (!hasText(asset.sourcePath)) issues.push(issue(`${path}.sourcePath`, 'Asset descriptor sourcePath is required.'));
  if (!hasText(asset.license)) issues.push(issue(`${path}.license`, 'Asset descriptor license is required.'));
  if (!hasText(asset.trustNotes)) issues.push(issue(`${path}.trustNotes`, 'Asset descriptor trust notes are required.'));
  issues.push(...validateStringArray(`${path}.limitations`, asset.limitations));
  if (source && asset.sourceId !== source.id) issues.push(issue(`${path}.sourceId`, 'Asset descriptor sourceId must match the source descriptor id.'));
  if (source && !source.assetKinds.includes(asset.kind)) issues.push(issue(`${path}.kind`, 'Asset kind must be declared by the source descriptor.'));
  return issues;
}

function validateStylePackSource(source: StylePackSourceDescriptor | undefined, pack: StylePack): SourceValidationIssue[] {
  if (!source) return [issue('source', 'Style pack must declare pack-level source metadata.')];

  const issues: SourceValidationIssue[] = [
    ...validateSourceDescriptor(source.source),
    ...validateAssetDescriptor(source.asset, source.source),
    ...(source.assetKind !== 'style-pack' ? [issue('source.assetKind', 'Style pack source assetKind must be style-pack.')] : []),
    ...(!hasText(source.packId) ? [issue('source.packId', 'Style pack source packId is required.')] : []),
    ...(!hasText(source.packVersion) ? [issue('source.packVersion', 'Style pack source packVersion is required.')] : []),
    ...(!hasText(source.sourcePath) ? [issue('source.sourcePath', 'Style pack source path is required.')] : []),
    ...(!hasText(source.styleNotes) ? [issue('source.styleNotes', 'Style pack style notes are required.')] : []),
    ...validateStringArray('source.limitations', source.limitations),
  ];

  if (source.asset.kind !== 'style-pack') issues.push(issue('source.asset.kind', 'Style pack asset kind must be style-pack.'));
  if (source.asset.id !== pack.provenance.sourceId) issues.push(issue('source.asset.id', 'Style pack asset id must match provenance sourceId.'));
  if (source.asset.version !== pack.version) issues.push(issue('source.asset.version', 'Style pack asset version must match the pack version.'));
  if (source.asset.sourcePath !== source.sourcePath) issues.push(issue('source.asset.sourcePath', 'Style pack asset sourcePath must match the pack source path.'));
  if (source.packId !== pack.id) issues.push(issue('source.packId', 'Style pack source packId must match the pack id.'));
  if (source.packVersion !== pack.version) issues.push(issue('source.packVersion', 'Style pack source packVersion must match the pack version.'));
  return issues;
}

function validateStyleDescriptor(style: StyleDescriptor | undefined): SourceValidationIssue[] {
  if (!style) return [issue('style', 'Style descriptor is required.')];

  const issues: SourceValidationIssue[] = [];
  if (style.schemaVersion !== 'name-forge.style.v1') issues.push(issue('style.schemaVersion', 'Style descriptor schemaVersion must be name-forge.style.v1.'));
  if (!hasText(style.label)) issues.push(issue('style.label', 'Style descriptor label is required.'));
  if (!hasText(style.summary)) issues.push(issue('style.summary', 'Style descriptor summary is required.'));
  issues.push(...validateStringArray('style.tags', style.tags));
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
    ...validateStyleDescriptor(pack.style),
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
