import { FormEvent, useState } from 'react';
import { generateEnsemble, type LockedNameSlot } from './fictionCast/ensemble';
import type { FictionCastRememberedCast } from './fictionCast/rememberedCast';
import type { FictionCastGeneratedEnsemble, FictionCastSettings } from './fictionCast/types';
import {
  addNameHistoryEntries,
  clearNameHistory,
  loadNameHistory,
  saveNameHistory,
  type NameHistoryStorage,
} from './engine/nameHistory';
import type { NameArtifact } from './engine/nameArtifact';
import { createDefaultRegistry } from './engine/registry';
import { rerollSelectedCastName } from './fictionCastReroll';
import { AboutView } from './ui/AboutView';
import { ChangelogView } from './ui/ChangelogView';
import { GameNpcView } from './ui/GameNpcView';
import { GeneratorView } from './ui/GeneratorView';
import { fictionCastMode, gameNpcMode, type NamingModeId } from './ui/modes';
import type { AppView } from './ui/presentation';
import { RecentNamesView } from './ui/RecentNamesView';
import { randomizeScoreSettings } from './ui/score';

const registry = createDefaultRegistry();
const stylePacks = registry.listStylePacks();
const initialSettings = fictionCastMode.defaultSettings(stylePacks[0]?.id ?? 'british-literary-fantasy');
const authorSiteUrl = 'https://jameshay.org/';
const sourceUrl = 'https://github.com/jaahay/name-forge';
const commitHistoryUrl = `${sourceUrl}/commits/main/`;

interface AppProps {
  rememberedCasts?: readonly FictionCastRememberedCast[];
}

function browserStorage(): NameHistoryStorage | undefined {
  if (typeof window === 'undefined') return undefined;

  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}

function createRandomSeed(): string {
  return `name-forge-${Math.random().toString(36).slice(2, 10)}`;
}

function lockedSlotsFor(ensemble: FictionCastGeneratedEnsemble | null, lockedNameIds: Set<string>): LockedNameSlot[] {
  if (!ensemble) return [];
  return ensemble.names.flatMap((name, index) => (lockedNameIds.has(name.id) ? [{ index, name }] : []));
}

function retainedLockIds(ensemble: FictionCastGeneratedEnsemble, lockedNameIds: Set<string>): Set<string> {
  const visibleIds = new Set(ensemble.names.map((name) => name.id));
  return new Set([...lockedNameIds].filter((id) => visibleIds.has(id)));
}

export default function App({ rememberedCasts = [] }: AppProps = {}) {
  const [currentView, setCurrentView] = useState<AppView>('generator');
  const [activeModeId, setActiveModeId] = useState<NamingModeId>('fiction-cast');
  const [settings, setSettings] = useState<FictionCastSettings>(initialSettings);
  const [committedSettings, setCommittedSettings] = useState<FictionCastSettings>(initialSettings);
  const [ensemble, setEnsemble] = useState<FictionCastGeneratedEnsemble | null>(null);
  const [activeRememberedCastId, setActiveRememberedCastId] = useState<string>();
  const [lockedNameIds, setLockedNameIds] = useState<Set<string>>(() => new Set());
  const [history, setHistory] = useState(() => loadNameHistory(browserStorage()));

  function showMode(modeId: NamingModeId) {
    setActiveModeId(modeId);
    setCurrentView('generator');
  }

  function recordArtifacts(artifacts: readonly NameArtifact[], context: { readonly mode: string; readonly seed: string }) {
    if (artifacts.length === 0) return;
    setHistory((current) => {
      const next = addNameHistoryEntries(current, artifacts, {
        ...context,
        savedAt: new Date().toISOString(),
      });
      saveNameHistory(browserStorage(), next);
      return next;
    });
  }

  function clearHistory() {
    setHistory(clearNameHistory(browserStorage()));
  }

  function detachRememberedCast() {
    setActiveRememberedCastId(undefined);
  }

  function updateSetting<K extends keyof FictionCastSettings>(key: K, value: FictionCastSettings[K]) {
    detachRememberedCast();
    setSettings((current) => ({ ...current, [key]: value }));
  }

  function commitGeneration(nextSettings: FictionCastSettings, nextLockedNameIds = lockedNameIds) {
    const nextEnsemble = generateEnsemble(nextSettings, registry, lockedSlotsFor(ensemble, nextLockedNameIds));
    detachRememberedCast();
    setCommittedSettings(nextSettings);
    setEnsemble(nextEnsemble);
    setLockedNameIds(retainedLockIds(nextEnsemble, nextLockedNameIds));
  }

  function generate(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    const nextSettings = { ...settings, seed: createRandomSeed() };
    setSettings(nextSettings);
    commitGeneration(nextSettings);
  }

  function commitCurrentSettings() {
    if (!ensemble) return;
    commitGeneration(settings);
  }

  function randomizeCriteria() {
    const randomizedSettings = randomizeScoreSettings(settings);
    setSettings(randomizedSettings);
    if (ensemble) commitGeneration(randomizedSettings);
  }

  function rerollSelectedName(id: string): string | undefined {
    if (!ensemble) return undefined;

    const result = rerollSelectedCastName(
      ensemble,
      id,
      lockedNameIds,
      createRandomSeed(),
      registry,
    );
    if (!result) return undefined;

    detachRememberedCast();
    setSettings((current) => ({ ...current, seed: result.committedSettings.seed }));
    setCommittedSettings(result.committedSettings);
    setEnsemble(result.ensemble);
    setLockedNameIds(result.lockedNameIds);
    return result.replacementId;
  }

  function toggleLockedName(id: string) {
    detachRememberedCast();
    setLockedNameIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function clearLockedNames() {
    detachRememberedCast();
    setLockedNameIds(new Set());
  }

  function startNewCast() {
    setSettings(initialSettings);
    setCommittedSettings(initialSettings);
    setEnsemble(null);
    setActiveRememberedCastId(undefined);
    setLockedNameIds(new Set());
  }

  function loadRememberedCast(rememberedCast: FictionCastRememberedCast) {
    setSettings(rememberedCast.ensemble.settings);
    setCommittedSettings(rememberedCast.ensemble.settings);
    setEnsemble(rememberedCast.ensemble);
    setActiveRememberedCastId(rememberedCast.id);
    setLockedNameIds(retainedLockIds(rememberedCast.ensemble, new Set(rememberedCast.lockedNameIds)));
  }

  return (
    <main className="app-shell">
      <nav className="app-tabs" aria-label="Primary">
        <div className="nav-primary">
          <div className="nav-brand" aria-label="Name Forge">
            <span className="brand-mark" aria-hidden="true"><span className="brand-sigil" /></span>
          </div>
          <span className="nav-divider" aria-hidden="true" />
          <div className="mode-tabs" aria-label="Naming modes">
            <button type="button" className="mode-tab" disabled>Product</button>
            <button type="button" className={currentView === 'generator' && activeModeId === 'game-npc' ? 'mode-tab active' : 'mode-tab'} onClick={() => showMode('game-npc')}>NPC</button>
            <button type="button" className="mode-tab" disabled>Pen name</button>
            <button type="button" className={currentView === 'generator' && activeModeId === 'fiction-cast' ? 'mode-tab active' : 'mode-tab'} onClick={() => showMode('fiction-cast')}>Cast</button>
          </div>
        </div>
        <div className="utility-tabs" aria-label="Project links">
          <button type="button" className={currentView === 'recent-names' ? 'tab-button active' : 'tab-button'} onClick={() => setCurrentView('recent-names')}>Recent names</button>
          <button type="button" className={currentView === 'changelog' ? 'tab-button active' : 'tab-button'} onClick={() => setCurrentView('changelog')}>Changelog</button>
          <button type="button" className={currentView === 'about' ? 'tab-button active' : 'tab-button'} onClick={() => setCurrentView('about')}>About</button>
          <a className="tab-link" href={sourceUrl} target="_blank" rel="noreferrer">Source</a>
        </div>
      </nav>

      {currentView === 'generator' ? (
        activeModeId === 'game-npc' ? (
          <GameNpcView mode={gameNpcMode} stylePacks={stylePacks} onGenerated={recordArtifacts} />
        ) : (
          <GeneratorView
            mode={fictionCastMode}
            stylePacks={stylePacks}
            settings={settings}
            committedSettings={committedSettings}
            ensemble={ensemble}
            rememberedCasts={rememberedCasts}
            activeRememberedCastId={activeRememberedCastId}
            lockedNameIds={lockedNameIds}
            onStartNewCast={startNewCast}
            onLoadRememberedCast={loadRememberedCast}
            onUpdateSetting={updateSetting}
            onGenerate={generate}
            onCommitSettings={commitCurrentSettings}
            onRandomizeCriteria={randomizeCriteria}
            onRerollName={rerollSelectedName}
            onToggleLockedName={toggleLockedName}
            onClearLockedNames={clearLockedNames}
          />
        )
      ) : currentView === 'recent-names' ? (
        <RecentNamesView entries={history.entries} onClear={clearHistory} />
      ) : currentView === 'changelog' ? (
        <ChangelogView commitHistoryUrl={commitHistoryUrl} />
      ) : (
        <AboutView authorSiteUrl={authorSiteUrl} />
      )}

      <footer className="site-footer panel">
        <p>&copy; 2026 <a href={authorSiteUrl} target="_blank" rel="noreferrer">James Hay</a>. Name Forge.</p>
      </footer>
    </main>
  );
}
