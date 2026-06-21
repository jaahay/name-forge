import type { GenerationSettings, NameVariant, NameVariantConfidence, NameVariantRelationship, ProvenanceNote, SourceKind, SpellingVariantRule, StylePack } from './types';
import { lerp } from './random';

function titleCase(value: string): string { return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase(); }
function applyRuleOnce(name: string, from: string, to: string): string | undefined { const expression = new RegExp(from, 'i'); if (!expression.test(name)) return undefined; const next = name.replace(expression, to); return next === name ? undefined : titleCase(next); }

function sourceMetadata(provenance: ProvenanceNote): NameVariant['source'] {
  return {
    id: provenance.sourceId,
    kind: provenance.sourceKind,
    label: provenance.label,
    detail: provenance.detail,
  };
}

function listedVariant(name: string, pack: StylePack): NameVariant {
  const provenance = {
    sourceId: `${pack.id}:listedVariants`,
    sourceKind: 'listed-source' as SourceKind,
    label: 'Listed alternate',
    detail: `Listed as an alternate spelling in the ${pack.label} style pack.`,
  };

  return {
    value: name,
    kind: 'listed',
    relationship: 'orthographic_variant',
    confidence: 'high',
    source: sourceMetadata(provenance),
    locale: pack.localeHint,
    generated: false,
    ruleId: 'listed-style-pack-alternate',
    provenance,
  };
}

function relationshipForRule(rule: SpellingVariantRule): NameVariantRelationship {
  if (rule.relationship) return rule.relationship;
  if (rule.id.includes('to-y') || rule.id.includes('to-i')) return 'orthographic_variant';
  if (rule.id.includes('double') || rule.id.includes('expansion')) return 'creative_respelling';
  return rule.sourceKind === 'algorithm' ? 'creative_respelling' : 'orthographic_variant';
}

function confidenceForRule(rule: SpellingVariantRule): NameVariantConfidence {
  if (rule.confidence) return rule.confidence;
  return rule.sourceKind === 'algorithm' ? 'medium' : 'medium';
}

function kindForRule(rule: SpellingVariantRule): NameVariant['kind'] {
  return rule.sourceKind === 'listed-source' ? 'listed' : 'generated';
}

function generatedFlagForRule(rule: SpellingVariantRule): boolean {
  return kindForRule(rule) === 'generated';
}

function ruleVariant(name: string, rule: SpellingVariantRule, pack: StylePack): NameVariant {
  const provenance = {
    sourceId: `${pack.id}:${rule.id}`,
    sourceKind: rule.sourceKind,
    label: rule.label,
    detail: `Variant produced by replacing /${rule.from}/ with "${rule.to}" under orthographic weirdness pressure.`,
  };

  return {
    value: name,
    kind: kindForRule(rule),
    relationship: relationshipForRule(rule),
    confidence: confidenceForRule(rule),
    source: sourceMetadata(provenance),
    locale: pack.localeHint,
    generated: generatedFlagForRule(rule),
    ruleId: rule.id,
    provenance,
  };
}

export function variantLimitFor(settings?: Pick<GenerationSettings, 'orthographicWeirdness'>): number {
  return Math.round(lerp(2, 4, settings?.orthographicWeirdness ?? 0.5));
}

export function generateVariants(name: string, pack: StylePack, settings?: Pick<GenerationSettings, 'orthographicWeirdness'>): NameVariant[] {
  const listed = pack.listedVariants[name] ?? [];
  const limit = variantLimitFor(settings);
  const variants = new Map<string, NameVariant>();
  for (const value of listed) {
    if (variants.size >= limit) break;
    variants.set(value, listedVariant(value, pack));
  }
  for (const rule of pack.variantRules) {
    if (variants.size >= limit) break;
    const next = applyRuleOnce(name, rule.from, rule.to);
    if (!next || next === name || variants.has(next)) continue;
    variants.set(next, ruleVariant(next, rule, pack));
  }
  return [...variants.values()];
}
