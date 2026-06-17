import type { GenerationSettings, NameVariant, StylePack } from './types';
import { lerp } from './random';

function titleCase(value: string): string { return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase(); }
function applyRuleOnce(name: string, from: string, to: string): string | undefined { const expression = new RegExp(from, 'i'); if (!expression.test(name)) return undefined; const next = name.replace(expression, to); return next === name ? undefined : titleCase(next); }

export function variantLimitFor(settings?: Pick<GenerationSettings, 'orthographicWeirdness'>): number {
  return Math.round(lerp(2, 4, settings?.orthographicWeirdness ?? 0.5));
}

export function generateVariants(name: string, pack: StylePack, settings?: Pick<GenerationSettings, 'orthographicWeirdness'>): NameVariant[] {
  const listed = pack.listedVariants[name] ?? [];
  const limit = variantLimitFor(settings);
  const variants = new Map<string, NameVariant>();
  for (const value of listed) {
    if (variants.size >= limit) break;
    variants.set(value, { value, kind: 'listed', ruleId: 'listed-style-pack-alternate', provenance: { sourceId: `${pack.id}:listedVariants`, sourceKind: 'listed-source', label: 'Listed alternate', detail: `Listed as an alternate spelling in the ${pack.label} style pack.` } });
  }
  for (const rule of pack.variantRules) {
    if (variants.size >= limit) break;
    const next = applyRuleOnce(name, rule.from, rule.to);
    if (!next || next === name || variants.has(next)) continue;
    variants.set(next, { value: next, kind: rule.sourceKind === 'algorithm' ? 'generated' : 'listed', ruleId: rule.id, provenance: { sourceId: `${pack.id}:${rule.id}`, sourceKind: rule.sourceKind, label: rule.label, detail: `Variant produced by replacing /${rule.from}/ with "${rule.to}" under orthographic weirdness pressure.` } });
  }
  return [...variants.values()];
}
