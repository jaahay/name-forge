import type { RarityBand, ScoreKey } from '../engine/types';

export type AppView = 'generator' | 'changelog' | 'about';

export type ControlKey =
  | 'novelty'
  | 'pronounceability'
  | 'memorability'
  | 'culturalAnchoring'
  | 'orthographicWeirdness';

export const primaryScoreControls: Array<{
  key: ControlKey;
  label: string;
  help: string;
}> = [
  { key: 'novelty', label: 'Rarity', help: 'Higher values push names toward less familiar silhouettes, letter textures, and spellings.' },
  { key: 'pronounceability', label: 'Readability', help: 'Higher values favor names that are easier to read aloud on first sight.' },
];

export const advancedScoreControls: Array<{
  key: ControlKey;
  label: string;
  help: string;
}> = [
  { key: 'memorability', label: 'Compactness', help: 'Higher values favor compact, distinctive names with clearer rhythm.' },
  { key: 'culturalAnchoring', label: 'Style anchoring', help: 'Higher values keep names closer to the selected style pack anchors.' },
  { key: 'orthographicWeirdness', label: 'Spelling style', help: 'Higher values permit more stylized spellings while still scoring naturalness separately.' },
];

export const scoreControls = [...primaryScoreControls, ...advancedScoreControls];
export const scoreAnchors = [0, 0.25, 0.5, 0.75, 1] as const;

export const scorePresentation: Array<{ key: ScoreKey; label: string }> = [
  { key: 'pronounceability', label: 'Pronounce' },
  { key: 'memorability', label: 'Memorable' },
  { key: 'novelty', label: 'Novel' },
  { key: 'culturalAnchoring', label: 'Anchored' },
  { key: 'orthographicNaturalness', label: 'Natural' },
  { key: 'styleFit', label: 'Style fit' },
  { key: 'silhouetteFit', label: 'Shape fit' },
  { key: 'ensembleFit', label: 'Cast fit' },
  { key: 'roleFit', label: 'Role fit' },
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
    title: 'Control surface cleanup',
    summary: 'Keeps the generator focused on style, role, rarity, and readability while moving lower-level scoring knobs into advanced tuning.',
    changes: [
      'Renamed the main pack selector to Style pack so it no longer implies a user-facing preset system.',
      'Promoted Rarity and Readability as the visible feel controls and tucked compactness, anchoring, and spelling style into Advanced tuning.',
      'Kept the underlying engine controls intact so this is a presentation cleanup rather than a scoring-model rewrite.',
    ],
  },
  {
    title: 'Fiction cast mode boundary',
    summary: 'Makes the current generator explicitly operate as the first Name Forge mode while preserving shared engine primitives.',
    changes: [
      'Added a mode boundary for the active Fiction cast workflow and moved its defaults and presentation copy into a mode config.',
      'Added a disabled "What are you naming?" mode selector to establish the product shape before adding additional modes.',
      'Adjusted CI so it runs at merge-readiness signals instead of every branch update.',
    ],
  },
  {
    title: 'Fiction workflow layout',
    summary: 'Restructures the generator around cast setup, fiction controls, compact browsing cards, and late-stage export.',
    changes: [
      'Moved export below the generated cards and collapsed the preview behind an explicit toggle.',
      'Grouped controls into Basics, Fiction, and Rarity & scoring sections with slot overrides hidden until a role mix is selected.',
      'Made collapsed result cards the default browsing surface, with nested Details and Fit sections inside each opened card.',
    ],
  },
  {
    title: 'Card styling and controls',
    summary: 'Improves the result card surface and makes generation controls faster to tune.',
    changes: [
      'Closed cards now stay compact when another card in the same row is expanded.',
      'Name titles now inherit the rarity color used by each rarity pill.',
      'Added numeric score fields, 0/25/50/75/100 anchors, and global plus per-control randomize actions.',
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
