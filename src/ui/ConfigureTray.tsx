import { useEffect, useRef, useState, type FormEvent } from 'react';
import type { FictionCastSettings } from '../fictionCast/types';
import type { StylePackSummary } from '../engine/types';
import { resolveConfigureFocusTarget, shouldCloseConfigureOnKey } from './configureBehavior';
import { ConfigureCriteria, configureSummaryItems } from './ConfigureCriteria';
import { ConfigureLauncher } from './ConfigureLauncher';
import { FictionCastRolesConfiguration } from './FictionCastRolesConfiguration';
import type { NamingModeConfig } from './modes';

export { formatOptions } from './ConfigureCriteria';

interface ConfigureTrayProps {
  mode: NamingModeConfig;
  stylePacks: StylePackSummary[];
  settings: FictionCastSettings;
  committedSettings?: FictionCastSettings;
  isOpen: boolean;
  hasGeneratedCast: boolean;
  lockedCount: number;
  onOpen: () => void;
  onClose: () => void;
  onUpdateSetting: <K extends keyof FictionCastSettings>(key: K, value: FictionCastSettings[K]) => void;
  onGenerate: (event?: FormEvent<HTMLFormElement>) => void;
  onCommitSettings: () => void;
  onRandomizeCriteria: () => void;
  onClearLockedNames: () => void;
}

type ConfigureView = 'criteria' | 'roles';

export function ConfigureTray({
  mode,
  stylePacks,
  settings,
  committedSettings,
  isOpen,
  hasGeneratedCast,
  lockedCount,
  onOpen,
  onClose,
  onUpdateSetting,
  onGenerate,
  onCommitSettings,
  onRandomizeCriteria,
  onClearLockedNames,
}: ConfigureTrayProps) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const rolesTriggerRef = useRef<HTMLButtonElement>(null);
  const rolesBackButtonRef = useRef<HTMLButtonElement>(null);
  const wasOpenRef = useRef(false);
  const previousViewRef = useRef<ConfigureView>('criteria');
  const [configureView, setConfigureView] = useState<ConfigureView>('criteria');
  const summarySettings = committedSettings ?? settings;
  const summaryItems = configureSummaryItems(summarySettings, stylePacks);
  const isRolesView = configureView === 'roles';

  useEffect(() => {
    const focusTarget = resolveConfigureFocusTarget(wasOpenRef.current, isOpen);
    if (focusTarget === 'close') {
      closeButtonRef.current?.focus();
    } else if (focusTarget === 'trigger') {
      triggerRef.current?.focus();
    }
    wasOpenRef.current = isOpen;
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      previousViewRef.current = 'criteria';
      if (configureView !== 'criteria') setConfigureView('criteria');
      return;
    }

    const previousView = previousViewRef.current;
    if (previousView !== configureView) {
      if (configureView === 'roles') rolesBackButtonRef.current?.focus();
      else rolesTriggerRef.current?.focus();
    }
    previousViewRef.current = configureView;
  }, [configureView, isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;

    function closeOnEscape(event: globalThis.KeyboardEvent) {
      if (!shouldCloseConfigureOnKey(event.key)) return;
      event.preventDefault();
      setConfigureView('criteria');
      onClose();
    }

    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [isOpen, onClose]);

  function closeConfigure() {
    setConfigureView('criteria');
    onClose();
  }

  return (
    <>
      <ConfigureLauncher
        isOpen={isOpen}
        hasGeneratedCast={hasGeneratedCast}
        lockedCount={lockedCount}
        triggerRef={triggerRef}
        onOpen={onOpen}
        onGenerate={() => onGenerate()}
      />

      {isOpen ? (
        <form
          id="fiction-cast-configure-drawer"
          className="controls configure-drawer panel"
          role="dialog"
          aria-labelledby="fiction-cast-configure-title"
          onSubmit={onGenerate}
        >
          <header className="configure-drawer-header">
            <div className="configure-drawer-heading">
              <p className="eyebrow">{isRolesView ? 'Configure' : 'Tune cast'}</p>
              <h2 id="fiction-cast-configure-title">{isRolesView ? 'Roles' : 'Configure criteria'}</h2>
              <p className="configure-current-settings">
                {isRolesView ? 'Assignment · generation influence · cast members' : summaryItems.join(' · ')}
              </p>
            </div>
            <button
              ref={closeButtonRef}
              type="button"
              className="secondary configure-close"
              aria-label="Close configure"
              title="Close configure"
              onClick={closeConfigure}
            >
              ×
            </button>
          </header>

          {isRolesView ? (
            <div className="configure-sections configure-roles-sections">
              <FictionCastRolesConfiguration
                settings={settings}
                onUpdateSetting={onUpdateSetting}
                onBack={() => setConfigureView('criteria')}
                backButtonRef={rolesBackButtonRef}
              />
            </div>
          ) : (
            <ConfigureCriteria
              mode={mode}
              stylePacks={stylePacks}
              settings={settings}
              hasGeneratedCast={hasGeneratedCast}
              lockedCount={lockedCount}
              rolesTriggerRef={rolesTriggerRef}
              onOpenRoles={() => setConfigureView('roles')}
              onUpdateSetting={onUpdateSetting}
              onCommitSettings={onCommitSettings}
              onRandomizeCriteria={onRandomizeCriteria}
              onClearLockedNames={onClearLockedNames}
            />
          )}
        </form>
      ) : null}
    </>
  );
}
