import { createSeededRandom } from './random';

export function selectFromOptions<T>(options: readonly T[], seed: string): T {
  if (options.length === 0) throw new Error('Cannot select from an empty option set.');
  return createSeededRandom(seed).pick(options);
}
