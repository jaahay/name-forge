import { stylePacks } from '../data/stylePacks';
import { validateStylePack } from './stylePackValidation';
import type { DataSourceDescriptor, NameSourceProvider, StylePack, StylePackSummary, StylePackValidationResult } from './types';

class BuiltInStylePackProvider implements NameSourceProvider {
  id = 'built-in-style-packs';
  label = 'Built-in style packs';
  kind = 'style-pack' as const;
  source: DataSourceDescriptor = stylePacks[0].source;
  listStylePacks(): StylePackSummary[] { return stylePacks.map(({ id, label, description, source }) => ({ id, label, description, source })); }
  getStylePack(id: string): StylePack | undefined { return stylePacks.find((pack) => pack.id === id); }
  validateStylePack(id: string): StylePackValidationResult | undefined { const pack = this.getStylePack(id); return pack ? validateStylePack(pack) : undefined; }
}

export class SourceRegistry {
  private readonly providers = new Map<string, NameSourceProvider>();
  register(provider: NameSourceProvider): void { this.providers.set(provider.id, provider); }
  listStylePacks(): StylePackSummary[] { return [...this.providers.values()].flatMap((provider) => provider.listStylePacks()); }
  getStylePack(id: string): StylePack {
    for (const provider of this.providers.values()) { const pack = provider.getStylePack(id); if (pack) return pack; }
    const fallback = this.listStylePacks()[0];
    if (!fallback) throw new Error('No style packs are registered.');
    return this.getStylePack(fallback.id);
  }
  validateStylePack(id: string): StylePackValidationResult {
    for (const provider of this.providers.values()) { const result = provider.validateStylePack(id); if (result) return result; }
    return validateStylePack(this.getStylePack(id));
  }
}

export function createDefaultRegistry(): SourceRegistry { const registry = new SourceRegistry(); registry.register(new BuiltInStylePackProvider()); return registry; }
