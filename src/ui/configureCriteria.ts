import type { GenerationSettings } from '../engine/types';

function tierLabel(value: number, low: string, middle: string, high: string): string {
  if (value < 0.38) return low;
  if (value > 0.62) return high;
  return middle;
}

export function criteriaSummaryItems(settings: GenerationSettings, stylePackLabel: string): string[] {
  return [
    `Style source: ${stylePackLabel}`,
    `Rarity target: ${tierLabel(settings.novelty, 'familiar', 'balanced', 'rarer')}`,
    `Readability target: ${tierLabel(settings.pronounceability, 'loose', 'balanced', 'easy to read')}`,
    `Spelling target: ${tierLabel(settings.orthographicWeirdness, 'plain', 'balanced', 'distinctive')}`,
  ];
}
