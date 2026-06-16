import type { RarityBand, ScoreKey } from '../engine/types';

export type AppView = 'generator' | 'changelog' | 'about';

export type ControlKey =
  | 'novelty'
  | 'pronounceability'
  | 'memorability'
  | 'culturalAnchoring'
  | 'orthographicWeirdness';

export const scoreControls: Array<{
  key: ControlKey;
  label: string;
  help: string;
}> = [
  { key: 'novelty', label: 'Novelty', help: 'Higher values favor rarer silhouettes, letter textures, and less familiar spellings.' },
  { key: 'pronounceability', label: 'Pronounceability', help: 'Higher values favor open syllables and fewer consonant collisions.' },
  { key: 'memorability', label: 'Memorability', help: 'Higher values favor compact, distinctive names with clear rhythm.' },
  { key: 'culturalAnchoring', label: 'Cultural anchoring', help: 'Higher values keep names closer to the selected style pack anchors.' },
  { key: 'orthographicWeirdness', label: 'Orthographic weirdness', help: 'Higher values permit stranger spellings while still scoring naturalness separately.' },
];

export const scoreAnchors = [0.25, 0.5, 0.75] as const;

export const scorePresentation: Array<{ key: ScoreKey; label: string }> = [
  { key: 'pronounceability', label: 'Pronounce' },
  { key: 'memorability', label: 'Memorable' },
  { key: 'novelty', label: 'Novel' },
  { key: 'culturalAnchoring', label: 'Anchored' },
  { key: 'orthographicNaturalness', label: 'Natural' },
  { key: 'styleFit', label: 'Style fit' },
  { key: 'silhouetteFit', label: 'Shape fit' },
  { key: 'ensembleFit', label: 'Cast fit' },
];

export const rarityPresentation: Record<RarityBand, { label: string; className: string }> = {
  common: { label: 'Common', className: 'rarity-common' },
  uncommon: { label: 'Uncommon', className: 'rarity-uncommon' },
  rare: { label: 'Rare', className: 'rarity-rare' },
  epic: { label: 'Epic', className: 'rarity-epic' },
  legendary: { label: 'Legendary', className: 'rarity-legendary' },
};

export const changelogEntries = [
  {
    title: 'Card styling and controls',
    summary: 'Improves the result card surface and makes generation controls faster to tune.',
    changes: [
      'Closed cards now stay compact when another card in the same row is expanded.',
      'Name titles now inherit the rarity color used by each rarity pill.',
      'Added numeric score fields, 25/50/75 anchors, and global plus per-control randomize actions.',
    ],
  },
  {
    title: 'Site shell cleanup',
    summary: 'Removes index-page clutter and keeps project navigation focused.',
    changes: [
      'Moved the changelog into a separate in-site tab instead of stacking it under the generator.',
      'Added a dedicated About tab for product context and an author note.',
      'Removed the public version badge, errata link, and non-actionable generated-name disclaimer.',
      'Updated public copy so Name Forge is not framed as only a fiction-genre tool.',
    ],
  },
  {
    title: 'Initial generation shell',
    summary: 'Introduced the first deterministic, cast-aware Name Forge interface for shaping name ensembles.',
    changes: [
      'Added controls for cast size, style preset, seed, novelty, pronounceability, memorability, cultural anchoring, and spelling weirdness.',
      'Rendered generated names with fit scores, rarity, silhouette texture, variants, and source trace data.',
      'Added collapsible result cards and texture-aware visual styling for generated names.',
    ],
  },
];
