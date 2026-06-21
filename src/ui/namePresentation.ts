import type { GeneratedName, RarityBand } from '../engine/types';

export type NameDisplayLength = 'short' | 'medium' | 'long' | 'very-long';

export function labelFor(value: string): string {
  return value
    .split('-')
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(' ');
}

export function getNameDisplayLength(name: string): NameDisplayLength {
  const length = name.length;
  const words = name.trim().split(/\s+/).filter(Boolean).length;

  if (length <= 18 && words <= 2) return 'short';
  if (length <= 30 && words <= 3) return 'medium';
  if (length <= 44 && words <= 5) return 'long';
  return 'very-long';
}

export function protectInitialBreaks(name: string): string {
  return name.replace(/\b([A-Z])\.\s+/g, '$1.\u00A0');
}

function terminalCueFor(name: GeneratedName): string {
  const lettersOnly = name.name.replace(/[^A-Za-z]+/g, '');
  return (lettersOnly.slice(-3) || name.name.slice(-3)).toLowerCase();
}

export function rarityCueFor(rarityBand: RarityBand): string {
  switch (rarityBand) {
    case 'common':
      return 'Grounded and table-ready; useful for guards, merchants, town records, and repeatable cultures.';
    case 'uncommon':
      return 'Distinctive without becoming plot-heavy; good for allies, rivals, named locals, and minor factions.';
    case 'rare':
      return 'Memorable and scene-forward; good for patrons, faction leaders, recurring villains, and marquee NPCs.';
    case 'epic':
      return 'Mythic or high-signal; good for ancient houses, boss-level NPCs, artifacts, and prophecy names.';
    case 'legendary':
      return 'Singular and campaign-defining; reserve for icons, lost empires, deities, or one-name legends.';
  }
}

export function constructionCueFor(name: GeneratedName): string {
  const opening = name.identity?.parts?.[0]?.value ?? name.name.trim().split(/\s+/)[0] ?? name.name;
  const terminalCue = terminalCueFor(name);
  const texture = labelFor(name.silhouette.texture).toLowerCase();
  const rhythm = labelFor(name.silhouette.rhythm).toLowerCase();

  return `${texture} opening around ${opening}; ${rhythm} rhythm; terminal ${terminalCue} ending.`;
}
