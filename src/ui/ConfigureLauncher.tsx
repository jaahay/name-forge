import type { Ref } from 'react';

interface ConfigureLauncherProps {
  readonly isOpen: boolean;
  readonly hasGeneratedCast: boolean;
  readonly lockedCount: number;
  readonly triggerRef: Ref<HTMLButtonElement>;
  readonly onOpen: () => void;
  readonly onGenerate: () => void;
}

export function ConfigureLauncher({
  isOpen,
  hasGeneratedCast,
  lockedCount,
  triggerRef,
  onOpen,
  onGenerate,
}: ConfigureLauncherProps) {
  const generateLabel = hasGeneratedCast ? 'Regenerate' : 'Start cast';

  return (
    <div className="configure-launcher panel" aria-label="Generation controls">
      <button
        ref={triggerRef}
        type="button"
        className="secondary configure-trigger"
        aria-controls="fiction-cast-configure-drawer"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        onClick={onOpen}
      >
        Configure
      </button>
      <button type="button" onClick={onGenerate}>{generateLabel}</button>
      {lockedCount > 0 ? <span className="configure-lock-count">{lockedCount} locked</span> : null}
    </div>
  );
}
