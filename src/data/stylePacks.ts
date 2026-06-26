import type { SourceDescriptor, StylePack } from '../engine/types';

const builtInStylePackSource: SourceDescriptor = {
  id: 'built-in-style-packs@0.1.0',
  label: 'Built-in style packs',
  channel: 'built-in',
  version: '0.1.0',
  assetKinds: ['style-pack', 'phonotactics', 'listed-variants', 'variant-rules'],
  license: 'project-local',
  locale: 'fictional-en-GB-literary',
  enabledByDefault: true,
  priority: 100,
  cachePolicy: 'none',
  sourceNotes: 'Bundled fictionalized starter pack data maintained with the application.',
  trustNotes: 'No remote loading or external name database dependency; safe for deterministic offline generation.',
};

export const stylePacks: StylePack[] = [{
  id: 'british-literary-fantasy',
  label: 'British literary fantasy',
  description: 'A soft-coded starter pack for bookish, folktale-adjacent names with fictionalized British literary texture.',
  source: {
    source: builtInStylePackSource,
    assetKind: 'style-pack',
    packId: 'british-literary-fantasy',
    packVersion: '0.1.0',
    sourcePath: 'src/data/stylePacks.ts#british-literary-fantasy',
    styleNotes: 'Bookish, folktale-adjacent, British-literary texture for fictional character naming.',
    limitations: [
      'Fictionalized style guidance, not a real-world cultural or etymological authority.',
      'Bundled starter data only; it should not be treated as exhaustive coverage of British naming traditions.',
    ],
  },
  style: {
    schemaVersion: 'name-forge.style.v1',
    label: 'British literary fantasy',
    summary: 'Bookish, folktale-adjacent, softly literary fantasy naming texture.',
    tags: ['fictional', 'literary', 'fantasy', 'folktale-adjacent', 'soft'],
  },
  version: '0.1.0',
  localeHint: 'fictional-en-GB-literary',
  culturalAnchors: ['Albion', 'Arthurian romance', 'Victorian novels', 'border ballads'],
  phonotactics: {
    onsets: ['', 'b', 'br', 'c', 'cl', 'd', 'dr', 'f', 'g', 'gw', 'h', 'l', 'm', 'n', 'p', 'r', 's', 't', 'th', 'v', 'w', 'y'].map((value, index) => ({ value, weight: index === 0 ? 3 : 4 })),
    nuclei: ['a', 'ae', 'e', 'ea', 'i', 'ia', 'o', 'oo', 'u', 'y'].map((value) => ({ value, weight: value.length === 1 ? 6 : 2 })),
    codas: ['', 'd', 'l', 'm', 'n', 'r', 's', 'th', 'v'].map((value) => ({ value, weight: value === '' ? 7 : 3 })),
    preferredEndings: ['a', 'an', 'en', 'eth', 'iel', 'in', 'or', 'wen'].map((value) => ({ value, weight: 4 })),
    rareGraphemes: ['ae', 'gw', 'th', 'wyn', 'y'],
    forbiddenFragments: ['qq', 'xx', 'jj', 'vvv', 'yyi', 'uuu', 'hh'],
  },
  silhouetteBias: {
    syllableCounts: [{ value: 2, weight: 7 }, { value: 3, weight: 9 }, { value: 4, weight: 3 }],
    textures: [{ value: 'soft', weight: 5 }, { value: 'balanced', weight: 6 }, { value: 'hard', weight: 2 }, { value: 'liquid', weight: 4 }],
    rarityBands: [{ value: 'common', weight: 7 }, { value: 'uncommon', weight: 6 }, { value: 'rare', weight: 3 }, { value: 'epic', weight: 1 }, { value: 'legendary', weight: 0.35 }],
  },
  listedVariants: { Aveline: ['Avelyn', 'Avelina'], Elowen: ['Elowyn', 'Elowenn'], Merryn: ['Meryn', 'Merren'], Oswin: ['Oswyn', 'Ossian'], Rowena: ['Rowenna', 'Roena'], Tamsin: ['Tamsyn', 'Tamzin'], Theobald: ['Theobold', 'Tybalt'], Wystan: ['Wistan', 'Wysten'] },
  variantRules: [
    { id: 'terminal-a-to-ia', label: 'Terminal -a to -ia', from: 'a$', to: 'ia', maxApplications: 1, sourceKind: 'style-pack', relationship: 'orthographic_variant', confidence: 'medium' },
    { id: 'i-to-y', label: 'Medial i to y', from: 'i', to: 'y', maxApplications: 1, sourceKind: 'algorithm', relationship: 'orthographic_variant', confidence: 'medium' },
    { id: 'single-n-to-double-n', label: 'Double terminal n', from: 'n$', to: 'nn', maxApplications: 1, sourceKind: 'algorithm', relationship: 'creative_respelling', confidence: 'medium' },
    { id: 'v-to-viv', label: 'Romance-style v expansion', from: '^v', to: 'viv', maxApplications: 1, sourceKind: 'algorithm', relationship: 'creative_respelling', confidence: 'medium' },
    { id: 'y-to-i', label: 'Medial y to i', from: 'y', to: 'i', maxApplications: 1, sourceKind: 'algorithm', relationship: 'orthographic_variant', confidence: 'medium' },
  ],
}];
