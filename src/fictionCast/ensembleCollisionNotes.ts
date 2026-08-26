import type { FictionCastGeneratedName } from './types';

export type FictionCastCollisionKind = 'same-visible-identity' | 'shared-visible-ending';

export interface FictionCastCollisionMember {
  readonly id: string;
  readonly displayName: string;
}

export interface FictionCastCollisionNote {
  readonly id: string;
  readonly kind: FictionCastCollisionKind;
  readonly value: string;
  readonly members: readonly FictionCastCollisionMember[];
}

type CollisionSourceName = Pick<FictionCastGeneratedName, 'id' | 'displayName'>;

function normalizedVisibleIdentity(displayName: string): string {
  return displayName.trim().replace(/\s+/g, ' ').toLowerCase();
}

function visibleEndingKey(displayName: string): string {
  const normalized = normalizedVisibleIdentity(displayName);
  return normalized.slice(Math.max(0, normalized.length - 2));
}

function groupedMembers(
  names: readonly CollisionSourceName[],
  keyFor: (name: CollisionSourceName) => string,
): readonly { key: string; members: FictionCastCollisionMember[] }[] {
  const groups = new Map<string, FictionCastCollisionMember[]>();

  for (const name of names) {
    const key = keyFor(name);
    if (!key) continue;
    const members = groups.get(key) ?? [];
    members.push({ id: name.id, displayName: name.displayName });
    groups.set(key, members);
  }

  return [...groups.entries()]
    .filter(([, members]) => members.length > 1)
    .map(([key, members]) => ({ key, members }));
}

export function findFictionCastCollisionNotes(
  names: readonly CollisionSourceName[],
): readonly FictionCastCollisionNote[] {
  const duplicateGroups = groupedMembers(names, (name) => normalizedVisibleIdentity(name.displayName));
  const endingGroups = groupedMembers(names, (name) => visibleEndingKey(name.displayName));

  const duplicateNotes = duplicateGroups.map(({ key, members }) => ({
    id: `same-visible-identity:${key}`,
    kind: 'same-visible-identity' as const,
    value: members[0]?.displayName ?? key,
    members,
  }));

  const endingNotes = endingGroups
    .filter(({ members }) => new Set(members.map((member) => normalizedVisibleIdentity(member.displayName))).size > 1)
    .map(({ key, members }) => ({
      id: `shared-visible-ending:${key}`,
      kind: 'shared-visible-ending' as const,
      value: key,
      members,
    }));

  return [...duplicateNotes, ...endingNotes];
}
