import { FormEvent, useState } from 'react';
import { generateEnsemble, type LockedNameSlot } from './fictionCast/ensemble';
import type { FictionCastGeneratedEnsemble, FictionCastSettings } from './fictionCast/types';
import {
  addNameHistoryEntries,
  clearNameHistory,
  loadNameHistory,
  saveNameHistory,
  type NameHistoryStorage,
} from './engine/nameHistory';
import { toNameArtifact, type NameArtifact } from './engine/nameArtifact';
import { createDefaultRegistry } from './engine/registry';
import { rerollSelectedCastName } from './fictionCastReroll';
import { AboutView } from './ui/AboutView';
import { ChangelogView } from './ui/ChangelogView';
import { GameNpcView } from './ui/GameNpcView';
import { GeneratorView } from './ui/GeneratorView';
import { fictionCastMode, gameNpcMode, type NamingModeId } from './ui/modes';
import type { AppView, ControlKey } from './ui/presentation';
import { RecentNamesView } from './ui/RecentNamesView';
import { randomizeScoreSettings, randomScore } from './ui/score';

const registry = createDefaultRegistry();
const stylePacks = registry.listStylePacks();
const initialSettings = fictionCastMode.defaultSettings(stylePacks[0]?.id ?? 'british-literary-fantasy');
const initialEnsemble = generateEnsemble(initialSettings, registry);
const authorSiteUrl = 'https://jameshay.org/';
const sourceUrl = 'https://github.com/jaahay/name-forge';
const commitHistoryUrl = `${sourceUrl}/commits/main/`;

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

function lockedSlotsFor(ensemble: FictionCastGeneratedEnsemble, lockedNameIds: Set<string>): LockedNameSlot[] {
  return ensemble.names.flatMap((name, index) => (lockedNameIds.has(name.id) ? [{ index, name }] : []));
}

function retainedLockIds(ensemble: FictionCastGeneratedEnsemble, lockedNameIds: Set<string>): Set<string> {
  const visibleIds = new Set(ensemble.names.map((name) => name.id));
  return new Set([...lockedNameIds].filter((id) => visibleIds.has(id)));
}

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('generator');
  const [activeModeId, setActiveModeId] = useState<NamingModeId>('fiction-cast');
  const [settings, setSettings] = useState<FictionCastSettings>(initialSettings);
  const [committedSettings, setCommittedSettings] = useState<FictionCastSettings>(initialSettings);
  const [ensemble, setEnsemble] = useState<FictionCastGeneratedEnsemble>(initialEnsemble);
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

  function updateSetting<K extends keyof FictionCastSettings>(key: K, value: FictionCastSettings[K]) {
    setSettings((current) => ({ ...current, [key]: value }));
  }

  function commitGeneration(nextSettings: FictionCastSettings, nextLockedNameIds = lockedNameIds) {
    const nextEnsemble = generateEnsemble(nextSettings, registry, lockedSlotsFor(ensemble, nextLockedNameIds));
    setCommittedSettings(nextSettings);
    setEnsemble(nextEnsemble);
    setLockedNameIds(retainedLockIds(nextEnsemble, nextLockedNameIds));
    recordArtifacts(nextEnsemble.names.map((name) => toNameArtifact(name.primaryName)), { mode: 'fiction-cast', seed: nextSettings.seed });
  }

  function generate(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    const nextSettings = { ...settings, seed: createRandomSeed() };
    setSettings(nextSettings);
    commitGeneration(nextSettings);
  }

  function commitCurrentSettings() {
    commitGeneration(settings);
  }

  function randomizeSliders() {
    const randomizedSettings = randomizeScoreSettings(settings);
    setSettings(randomizedSettings);
    commitGeneration(randomizedSettings);
  }

  function randomizeSlider(key: ControlKey) {
    const nextValue = randomScore();
    const nextSettings = { ...settings, [key]: nextValue };
    setSettings(nextSettings);
    commitGeneration(nextSettings);
  }

  function rerollSelectedName(id: string): string | undefined {
    const result = rerollSelectedCastName(
      ensemble,
      id,
      lockedNameIds,
      createRandomSeed(),
      registry,
    );
    if (!result) return undefined;

    setSettings((current) => ({ ...current, seed: result.committedSettings.seed }));
    setCommittedSettings(result.committedSettings);
    setEnsemble(result.ensemble);
    setLockedNameIds(result.lockedNameIds);
    recordArtifacts(result.historyArtifacts, {
      mode: 'fiction-cast',
      seed: result.committedSettings.seed,
    });
    return result.replacementId;
  }

  function toggleLockedName(id: string) {
    setLockedNameIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function clearLockedNames() {
    setLockedNameIds(new Set());
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
            lockedNameIds={lockedNameIds}
            onUpdateSetting={updateSetting}
            onGenerate={generate}
            onCommitSettings={commitCurrentSettings}
            onRandomizeSliders={randomizeSliders}
            onRandomizeSlider={randomizeSlider}
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
