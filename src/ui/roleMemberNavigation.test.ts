import { describe, expect, it } from 'vitest';
import {
  clampRoleMemberIndex,
  roleMemberIndexFromScroll,
  stepRoleMemberIndex,
} from './roleMemberNavigation';

describe('Roles member navigation', () => {
  it('clamps member indexes to the supported visible range', () => {
    expect(clampRoleMemberIndex(-4, 6)).toBe(0);
    expect(clampRoleMemberIndex(2, 6)).toBe(2);
    expect(clampRoleMemberIndex(99, 6)).toBe(5);
    expect(clampRoleMemberIndex(Number.NaN, 6)).toBe(0);
  });

  it('steps without wrapping past the first or last member', () => {
    expect(stepRoleMemberIndex(0, -1, 4)).toBe(0);
    expect(stepRoleMemberIndex(0, 1, 4)).toBe(1);
    expect(stepRoleMemberIndex(3, 1, 4)).toBe(3);
    expect(stepRoleMemberIndex(3, -1, 4)).toBe(2);
  });

  it('derives the active member from a snapped horizontal scroll position', () => {
    expect(roleMemberIndexFromScroll(0, 320, 5)).toBe(0);
    expect(roleMemberIndexFromScroll(320, 320, 5)).toBe(1);
    expect(roleMemberIndexFromScroll(640, 320, 5)).toBe(2);
    expect(roleMemberIndexFromScroll(10_000, 320, 5)).toBe(4);
    expect(roleMemberIndexFromScroll(320, 0, 5)).toBe(0);
  });
});
