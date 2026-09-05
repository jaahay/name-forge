export function clampRoleMemberIndex(index: number, memberCount: number): number {
  const safeCount = Math.max(1, Math.round(memberCount));
  if (!Number.isFinite(index)) return 0;
  return Math.max(0, Math.min(safeCount - 1, Math.round(index)));
}

export function stepRoleMemberIndex(
  currentIndex: number,
  direction: -1 | 1,
  memberCount: number,
): number {
  return clampRoleMemberIndex(currentIndex + direction, memberCount);
}

export function roleMemberIndexFromScroll(
  scrollLeft: number,
  viewportWidth: number,
  memberCount: number,
): number {
  if (!Number.isFinite(viewportWidth) || viewportWidth <= 0) return 0;
  return clampRoleMemberIndex(Math.round(Math.max(0, scrollLeft) / viewportWidth), memberCount);
}
