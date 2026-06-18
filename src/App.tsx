import { FormEvent, useMemo, useState } from 'react';
import { createDefaultRegistry } from './engine/registry';
import { generateEnsemble } from './engine/ensemble';
import type { GenerationSettings } from './engine/types';
import { AboutView } from './ui/AboutView';
import { ChangelogView } from './ui/ChangelogView';
import { GeneratorView } from './ui/GeneratorView';
import type { AppView, ControlKey } from './ui/presentation';
import { randomizeScoreSettings, randomScore } from './ui/score';

const registry = createDefaultRegistry();
const stylePacks = registry.listStylePacks();
const authorSiteUrl = 'https://jameshay.org/';
const sourceUrl = 'https://github.com/jaahay/name-forge';
const commitHistoryUrl = `${sourceUrl}/commits/main/`;

const initialSettings: GenerationSettings = {
  castSize: 8,
  novelty: 0.48,
  pronounceability: 0.72,
  memorability: 0.65,
  culturalAnchoring: 0.62,
  orthographicWeirdness: 0.28,
  stylePackId: stylePacks[0]?.id ?? 'british-literary-fantasy',
  seed: 'name-forge-001',
  nameFormat: 'mixed',
  rarityDistribution: 'style-pack',
  rolePreset: 'none',
  roleInfluence: 'off',
  slotRoleOverrides: {},
};

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('generator');
  const [settings, setSettings] = useState<GenerationSettings>(initialSettings);
  const [committedSettings, setCommittedSettings] = useState<GenerationSettings>(initialSettings);
  const ensemble = useMemo(() => generateEnsemble(committedSettings, registry), [committedSettings]);

  function updateSetting<K extends keyof GenerationSettings>(key: K, value: GenerationSettings[K]) {
    setSettings((current) => ({ ...current, [key]: value }));
  }

  function regenerate(event?: FormEvent) {
    event?.preventDefault();
    setCommittedSettings(settings);
  }

  function randomizeSeed() {
    const nextSeed = `name-forge-${Math.random().toString(36).slice(2, 10)}`;
    setSettings((current) => ({ ...current, seed: nextSeed }));
    setCommittedSettings((current) => ({ ...current, seed: nextSeed }));
  }

  function randomizeSliders() {
    const randomizedSettings = randomizeScoreSettings(settings);
    setSettings(randomizedSettings);
    setCommittedSettings(randomizedSettings);
  }

  function randomizeSlider(key: ControlKey) {
    const nextValue = randomScore();
    setSettings((current) => ({ ...current, [key]: nextValue }));
    setCommittedSettings((current) => ({ ...current, [key]: nextValue }));
  }

  return (
    <main className="app-shell">
      <nav className="app-tabs" aria-label="Primary">
        <button type="button" className={currentView === 'generator' ? 'tab-button active' : 'tab-button'} onClick={() => setCurrentView('generator')}>Generator</button>
        <button type="button" className={currentView === 'changelog' ? 'tab-button active' : 'tab-button'} onClick={() => setCurrentView('changelog')}>Changelog</button>
        <button type="button" className={currentView === 'about' ? 'tab-button active' : 'tab-button'} onClick={() => setCurrentView('about')}>About</button>
        <a className="tab-link" href={sourceUrl} target="_blank" rel="noreferrer">Source</a>
      </nav>

      {currentView === 'generator' ? (
        <GeneratorView
          stylePacks={stylePacks}
          settings={settings}
          ensemble={ensemble}
          onUpdateSetting={updateSetting}
          onRegenerate={regenerate}
          onRandomizeSeed={randomizeSeed}
          onRandomizeSliders={randomizeSliders}
          onRandomizeSlider={randomizeSlider}
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
