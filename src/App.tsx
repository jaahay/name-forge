import { FormEvent, useState } from 'react';
import { createDefaultRegistry } from './engine/registry';
import { generateEnsemble, type LockedNameSlot } from './engine/ensemble';
import type { GeneratedEnsemble, GenerationSettings } from './engine/types';
import { AboutView } from './ui/AboutView';
import { ChangelogView } from './ui/ChangelogView';
import { GeneratorView } from './ui/GeneratorView';
import { fictionCastMode } from './ui/modes';
import type { AppView, ControlKey } from './ui/presentation';
import { randomizeScoreSettings, randomScore } from './ui/score';

const registry = createDefaultRegistry();
const stylePacks = registry.listStylePacks();
const activeMode = fictionCastMode;
const initialSettings = activeMode.defaultSettings(stylePacks[0]?.id ?? 'british-literary-fantasy');
const initialEnsemble = generateEnsemble(initialSettings, registry);
const authorSiteUrl = 'https://jameshay.org/';
const sourceUrl = 'https://github.com/jaahay/name-forge';
const commitHistoryUrl = `${sourceUrl}/commits/main/`;

function lockedSlotsFor(ensemble: GeneratedEnsemble, lockedNameIds: Set<string>): LockedNameSlot[] {
  return ensemble.names.flatMap((name, index) => (lockedNameIds.has(name.id) ? [{ index, name }] : []));
}

function retainedLockIds(ensemble: GeneratedEnsemble, lockedNameIds: Set<string>): Set<string> {
  const visibleIds = new Set(ensemble.names.map((name) => name.id));
  return new Set([...lockedNameIds].filter((id) => visibleIds.has(id)));
}

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('generator');
  const [settings, setSettings] = useState<GenerationSettings>(initialSettings);
  const [committedSettings, setCommittedSettings] = useState<GenerationSettings>(initialSettings);
  const [ensemble, setEnsemble] = useState<GeneratedEnsemble>(initialEnsemble);
  const [lockedNameIds, setLockedNameIds] = useState<Set<string>>(() => new Set());

  function updateSetting<K extends keyof GenerationSettings>(key: K, value: GenerationSettings[K]) {
    setSettings((current) => ({ ...current, [key]: value }));
  }

  function commitGeneration(nextSettings: GenerationSettings, nextLockedNameIds = lockedNameIds) {
    const nextEnsemble = generateEnsemble(nextSettings, registry, lockedSlotsFor(ensemble, nextLockedNameIds));
    setCommittedSettings(nextSettings);
    setEnsemble(nextEnsemble);
    setLockedNameIds(retainedLockIds(nextEnsemble, nextLockedNameIds));
  }

  function regenerate(event?: FormEvent) {
    event?.preventDefault();
    commitGeneration(settings);
  }

  function randomizeSeed() {
    const nextSeed = `name-forge-${Math.random().toString(36).slice(2, 10)}`;
    const nextSettings = { ...settings, seed: nextSeed };
    setSettings(nextSettings);
    commitGeneration(nextSettings);
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
            <button type="button" className="mode-tab" disabled>NPC</button>
            <button type="button" className="mode-tab" disabled>Pen name</button>
            <button type="button" className={currentView === 'generator' ? 'mode-tab active' : 'mode-tab'} onClick={() => setCurrentView('generator')}>Cast</button>
          </div>
        </div>
        <div className="utility-tabs" aria-label="Project links">
          <button type="button" className={currentView === 'changelog' ? 'tab-button active' : 'tab-button'} onClick={() => setCurrentView('changelog')}>Changelog</button>
          <button type="button" className={currentView === 'about' ? 'tab-button active' : 'tab-button'} onClick={() => setCurrentView('about')}>About</button>
          <a className="tab-link" href={sourceUrl} target="_blank" rel="noreferrer">Source</a>
        </div>
      </nav>

      {currentView === 'generator' ? (
        <GeneratorView
          mode={activeMode}
          stylePacks={stylePacks}
          settings={settings}
          committedSettings={committedSettings}
          ensemble={ensemble}
          lockedNameIds={lockedNameIds}
          onUpdateSetting={updateSetting}
          onRegenerate={regenerate}
          onRandomizeSeed={randomizeSeed}
          onRandomizeSliders={randomizeSliders}
          onRandomizeSlider={randomizeSlider}
          onToggleLockedName={toggleLockedName}
          onClearLockedNames={clearLockedNames}
        />
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
