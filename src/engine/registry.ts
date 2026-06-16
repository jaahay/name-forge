import { stylePacks } from '../data/stylePacks';
import type { NameSourceProvider, StylePack, StylePackSummary } from './types';

class BuiltInStylePackProvider implements NameSourceProvider {
  id = 'built-in-style-packs';
  label = 'Built-in style packs';
  kind = 'style-pack' as const;
  listStylePacks(): StylePackSummary[] { return stylePacks.map(({ id, label, description }) => ({ id, label, description })); }
  getStylePack(id: string): StylePack | undefined { return stylePacks.find((pack) => pack.id === id); }
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
}

export function createDefaultRegistry(): SourceRegistry { const registry = new SourceRegistry(); registry.register(new BuiltInStylePackProvider()); return registry; }
