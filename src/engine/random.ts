import type { WeightedValue } from './types';

export interface SeededRandom { next(): number; int(minInclusive: number, maxInclusive: number): number; chance(probability: number): boolean; pick<T>(items: readonly T[]): T; pickWeighted<T>(items: ReadonlyArray<WeightedValue<T>>): T; fork(label: string): SeededRandom; }

function cyrb128(seed: string): [number, number, number, number] {
  let h1 = 1779033703; let h2 = 3144134277; let h3 = 1013904242; let h4 = 2773480762;
  for (let index = 0; index < seed.length; index += 1) { const code = seed.charCodeAt(index); h1 = h2 ^ Math.imul(h1 ^ code, 597399067); h2 = h3 ^ Math.imul(h2 ^ code, 2869860233); h3 = h4 ^ Math.imul(h3 ^ code, 951274213); h4 = h1 ^ Math.imul(h4 ^ code, 2716044179); }
  h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067); h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233); h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213); h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
  return [h1 ^ h2 ^ h3 ^ h4, h2 ^ h1, h3 ^ h1, h4 ^ h1];
}

function sfc32(a: number, b: number, c: number, d: number) { return () => { a >>>= 0; b >>>= 0; c >>>= 0; d >>>= 0; const t = (a + b) | 0; a = b ^ (b >>> 9); b = (c + (c << 3)) | 0; c = (c << 21) | (c >>> 11); d = (d + 1) | 0; const next = (t + d) | 0; c = (c + next) | 0; return (next >>> 0) / 4294967296; }; }

export function createSeededRandom(seed: string): SeededRandom {
  const parts = cyrb128(seed || 'name-forge'); const nextValue = sfc32(parts[0], parts[1], parts[2], parts[3]);
  return { next: nextValue, int(minInclusive: number, maxInclusive: number) { const min = Math.ceil(minInclusive); const max = Math.floor(maxInclusive); return Math.floor(nextValue() * (max - min + 1)) + min; }, chance(probability: number) { return nextValue() < clamp(probability); }, pick<T>(items: readonly T[]): T { if (items.length === 0) throw new Error('Cannot pick from an empty collection.'); return items[this.int(0, items.length - 1)]; }, pickWeighted<T>(items: ReadonlyArray<WeightedValue<T>>): T { if (items.length === 0) throw new Error('Cannot pick from an empty weighted collection.'); const total = items.reduce((sum, item) => sum + Math.max(item.weight, 0), 0); if (total <= 0) return items[0].value; let cursor = nextValue() * total; for (const item of items) { cursor -= Math.max(item.weight, 0); if (cursor <= 0) return item.value; } return items[items.length - 1].value; }, fork(label: string) { return createSeededRandom(`${seed}:${label}`); } };
}

export function clamp(value: number, min = 0, max = 1): number { return Math.min(max, Math.max(min, value)); }
export function lerp(min: number, max: number, amount: number): number { return min + (max - min) * clamp(amount); }
