export type ConfigureDrawerAction = 'open' | 'close' | 'generate' | 'shuffle';
export type ConfigureFocusTarget = 'close' | 'trigger' | null;

export function reduceConfigureDrawerOpen(isOpen: boolean, action: ConfigureDrawerAction): boolean {
  if (action === 'open') return true;
  if (action === 'close') return false;
  return isOpen;
}

export function resolveConfigureFocusTarget(wasOpen: boolean, isOpen: boolean): ConfigureFocusTarget {
  if (!wasOpen && isOpen) return 'close';
  if (wasOpen && !isOpen) return 'trigger';
  return null;
}

export function shouldCloseConfigureOnKey(key: string): boolean {
  return key === 'Escape';
}
