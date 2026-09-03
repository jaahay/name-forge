import { createSeededRandom } from '../engine/random';

export type FictionCastVariation = 'tight' | 'balanced' | 'wide';

export interface FictionCastVariationSettings {
  readonly castSize: number;
  readonly castVariation?: FictionCastVariation;
  readonly seed: string;
}

export const castVariationOptions: Array<{ value: FictionCastVariation; label: string }> = [
  { value: 'tight', label: 'Tight' },
  { value: 'balanced', label: 'Balanced' },
  { value: 'wide', label: 'Wide' },
];

const variationAmplitude: Record<FictionCastVariation, number> = {
  tight: 0.05,
  balanced: 0.12,
  wide: 0.2,
};

function normalizedOffsets(castSize: number): number[] {
  const size = Math.max(1, Math.min(24, Math.round(castSize)));
  if (size === 1) return [0];

  return Array.from({ length: size }, (_, index) => ((index / (size - 1)) * 2) - 1);
}

function deterministicallyAssignOffsets(offsets: readonly number[], seed: string): number[] {
  const assigned = [...offsets];
  const random = createSeededRandom(`${seed}:fiction-cast:variation:${assigned.length}`);

  for (let index = assigned.length - 1; index > 0; index -= 1) {
    const swapIndex = random.int(0, index);
    [assigned[index], assigned[swapIndex]] = [assigned[swapIndex], assigned[index]];
  }

  return assigned;
}

export function resolveFictionCastVariationOffsets(settings: FictionCastVariationSettings): readonly number[] {
  const variation = settings.castVariation ?? 'balanced';
  const amplitude = variationAmplitude[variation];
  const normalized = normalizedOffsets(settings.castSize);
  return deterministicallyAssignOffsets(normalized, settings.seed).map((offset) => offset * amplitude);
}

export function resolveFictionCastVariationDelta(settings: FictionCastVariationSettings, slotIndex: number): number {
  const offsets = resolveFictionCastVariationOffsets(settings);
  const normalizedIndex = ((slotIndex % offsets.length) + offsets.length) % offsets.length;
  return offsets[normalizedIndex] ?? 0;
}
