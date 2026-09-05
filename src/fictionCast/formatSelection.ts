import { createSeededRandom } from '../engine/random';
import type { NameFormatKind } from '../engine/types';
import type { MaterializedNameFormatKind } from './identityFormat';

export type { MaterializedNameFormatKind } from './identityFormat';

const mixedFormatOptions: readonly MaterializedNameFormatKind[] = [
  'given-only',
  'given-family',
  'initials-family',
  'title-name',
  'epithet-place',
];

function wouldCreateThreeFormatRun(
  candidate: MaterializedNameFormatKind,
  index: number,
  plannedFormats: readonly MaterializedNameFormatKind[],
  lockedFormats: ReadonlyMap<number, MaterializedNameFormatKind>,
): boolean {
  const previous = plannedFormats[index - 1];
  const twoBack = plannedFormats[index - 2];
  const nextLocked = lockedFormats.get(index + 1);
  const twoAheadLocked = lockedFormats.get(index + 2);

  return (
    (candidate === previous && candidate === twoBack)
    || (candidate === previous && candidate === nextLocked)
    || (candidate === nextLocked && candidate === twoAheadLocked)
  );
}

export function resolveMaterializedFormatPlan(
  format: NameFormatKind | undefined,
  seed: string,
  castSize: number,
  lockedFormats: ReadonlyMap<number, MaterializedNameFormatKind> = new Map(),
): MaterializedNameFormatKind[] {
  const plannedFormats: MaterializedNameFormatKind[] = [];

  for (let index = 0; index < castSize; index += 1) {
    const lockedFormat = lockedFormats.get(index);
    if (lockedFormat) {
      plannedFormats.push(lockedFormat);
      continue;
    }

    if (format && format !== 'mixed') {
      plannedFormats.push(format);
      continue;
    }

    const eligibleFormats = mixedFormatOptions.filter((candidate) => (
      !wouldCreateThreeFormatRun(candidate, index, plannedFormats, lockedFormats)
    ));
    const selected = createSeededRandom(`${seed}:fiction-cast:mixed-format:slot-${index}`).pick(eligibleFormats);
    plannedFormats.push(selected);
  }

  return plannedFormats;
}
