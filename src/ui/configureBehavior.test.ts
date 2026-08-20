import { describe, expect, it } from 'vitest';
import {
  reduceConfigureDrawerOpen,
  resolveConfigureFocusTarget,
  shouldCloseConfigureOnKey,
} from './configureBehavior';

describe('Configure drawer behavior', () => {
  it('opens and closes only for explicit drawer actions', () => {
    expect(reduceConfigureDrawerOpen(false, 'open')).toBe(true);
    expect(reduceConfigureDrawerOpen(true, 'close')).toBe(false);
  });

  it('preserves the current drawer state while generating or shuffling', () => {
    for (const action of ['generate', 'shuffle'] as const) {
      expect(reduceConfigureDrawerOpen(true, action)).toBe(true);
      expect(reduceConfigureDrawerOpen(false, action)).toBe(false);
    }
  });

  it('moves focus into Configure when it opens, including an initially open drawer', () => {
    expect(resolveConfigureFocusTarget(false, true)).toBe('close');
  });

  it('returns focus to the Configure trigger when the drawer closes', () => {
    expect(resolveConfigureFocusTarget(true, false)).toBe('trigger');
  });

  it('does not move focus when the drawer state is unchanged', () => {
    expect(resolveConfigureFocusTarget(false, false)).toBeNull();
    expect(resolveConfigureFocusTarget(true, true)).toBeNull();
  });

  it('treats Escape as the drawer close key without intercepting other keys', () => {
    expect(shouldCloseConfigureOnKey('Escape')).toBe(true);
    expect(shouldCloseConfigureOnKey('Enter')).toBe(false);
    expect(shouldCloseConfigureOnKey('Tab')).toBe(false);
  });
});
