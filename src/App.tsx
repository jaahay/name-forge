import { FormEvent, useMemo, useState } from 'react';
import { createDefaultRegistry } from './engine/registry';
import { generateEnsemble } from './engine/ensemble';
import type { GenerationSettings, NameTexture, RarityBand, ScoreKey } from './engine/types';

const registry = createDefaultRegistry();
const stylePacks = registry.listStylePacks();
const authorSiteUrl = 'https://jameshay.org/';
const sourceUrl = 'https://github.com/jaahay/name-forge';
const commitHistoryUrl = `${sourceUrl}/commits/main/`;

type AppView = 'generator' | 'changelog';

type ControlKey =
  | 'novelty'
  | 'pronounceability'
  | 'memorability'
  | 'culturalAnchoring'
  | 'orthographicWeirdness';

const scoreControls: Array<{
  key: ControlKey;
  label: string;
  help: string;
}> = [
  { key: 'novelty', label: 'Novelty', help: 'Higher values favor rarer silhouettes, letter textures, and less familiar spellings.' },
  { key: 'pronounceability', label: 'Pronounceability', help: 'Higher values favor open syllables and fewer consonant collisions.' },
  { key: 'memorability', label: 'Memorability', help: 'Higher values favor compact, distinctive names with clear rhythm.' },
  { key: 'culturalAnchoring', label: 'Cultural anchoring', help: 'Higher values keep names closer to the selected style pack anchors.' },
  { key: 'orthographicWeirdness', label: 'Orthographic weirdness', help: 'Higher values permit stranger spellings while still scoring naturalness separately.' },
];

const scoreAnchors = [0.25, 0.5, 0.75] as const;

const scorePresentation: Array<{ key: ScoreKey; label: string }> = [
  { key: 'pronounceability', label: 'Pronounce' },
  { key: 'memorability', label: 'Memorable' },
  { key: 'novelty', label: 'Novel' },
  { key: 'culturalAnchoring', label: 'Anchored' },
  { key: 'orthographicNaturalness', label: 'Natural' },
  { key: 'styleFit', label: 'Style fit' },
  { key: 'silhouetteFit', label: 'Shape fit' },
  { key: 'ensembleFit', label: 'Cast fit' },
];

const rarityPresentation: Record<RarityBand, { label: string; className: string }> = {
  common: { label: 'Common', className: 'rarity-common' },
  uncommon: { label: 'Uncommon', className: 'rarity-uncommon' },
  rare: { label: 'Rare', className: 'rarity-rare' },
  epic: { label: 'Epic', className: 'rarity-epic' },
  legendary: { label: 'Legendary', className: 'rarity-legendary' },
};

const changelogEntries = [
  {
    title: 'Card styling and controls',
    summary: 'Improves the result card surface and makes generation controls faster to tune.',
    changes: [
      'Closed cards now stay compact when another card in the same row is expanded.',
      'Name titles now inherit the rarity color used by each rarity pill.',
      'Added numeric score fields, 25/50/75 anchors, and global plus per-control randomize actions.',
    ],
  },
  {
    title: 'Site shell cleanup',
    summary: 'Removes index-page clutter and keeps project navigation focused.',
    changes: [
      'Moved the changelog into a separate in-site tab instead of stacking it under the generator.',
      'Removed the public version badge, errata link, and non-actionable generated-name disclaimer.',
      'Updated public copy so Name Forge is not framed as only a fiction-genre tool.',
    ],
  },
  {
    title: 'Initial generation shell',
    summary: 'Introduced the first deterministic, cast-aware Name Forge interface for shaping name ensembles.',
    changes: [
      'Added controls for cast size, style preset, seed, novelty, pronounceability, memorability, cultural anchoring, and spelling weirdness.',
      'Rendered generated names with fit scores, rarity, silhouette texture, variants, and source trace data.',
      'Added collapsible result cards and texture-aware visual styling for generated names.',
    ],
  },
];

const initialSettings: GenerationSettings = {
  castSize: 8,
  novelty: 0.48,
  pronounceability: 0.72,
  memorability: 0.65,
  culturalAnchoring: 0.62,
  orthographicWeirdness: 0.28,
  stylePackId: stylePacks[0]?.id ?? 'british-literary-fantasy',
  seed: 'name-forge-001',
};

function clampScore(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

function formatScore(value: number): string {
  return Math.round(value * 100).toString();
}

function scoreFromPercent(value: string): number {
  return clampScore(Number(value) / 100);
}

function randomScore(): number {
  return Math.round(Math.random() * 100) / 100;
}

function randomizeScoreSettings(settings: GenerationSettings): GenerationSettings {
  return scoreControls.reduce<GenerationSettings>((nextSettings, control) => ({
    ...nextSettings,
    [control.key]: randomScore(),
  }), settings);
}

function rarityClassName(rarity: RarityBand): string {
  return `rarity-pill ${rarityPresentation[rarity].className}`;
}

function textureClassName(texture: NameTexture): string {
  return `texture-${texture}`;
}

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
        <a className="tab-link" href={sourceUrl} target="_blank" rel="noreferrer">Source</a>
      </nav>

      {currentView === 'generator' ? (
        <>
          <section className="hero panel">
            <div>
              <p className="eyebrow">Name Forge</p>
              <h1>Names that are random, usable, and cast-aware.</h1>
              <p className="hero-copy">
                Generate a balanced ensemble by shaping name silhouettes first, scoring overall fit,
                suggesting spelling variants, and preserving source traces for every result.
              </p>
            </div>
            <div className="hero-stats" aria-label="Generation summary">
              <span>{ensemble.names.length} names</span>
              <span>{ensemble.diagnostics.repeatedInitials} repeated initials</span>
              <span>{ensemble.diagnostics.repeatedEndings} repeated endings</span>
            </div>
          </section>

          <section className="workspace">
            <form className="controls panel" onSubmit={regenerate}>
              <div className="control-row split">
                <label>
                  <span>Cast size</span>
                  <input type="number" min="1" max="24" value={settings.castSize} onChange={(event) => updateSetting('castSize', Number(event.target.value))} />
                </label>
                <label>
                  <span>Style preset</span>
                  <select value={settings.stylePackId} onChange={(event) => updateSetting('stylePackId', event.target.value)}>
                    {stylePacks.map((pack) => <option key={pack.id} value={pack.id}>{pack.label}</option>)}
                  </select>
                </label>
              </div>

              {scoreControls.map((control) => {
                const sliderId = `${control.key}-slider`;
                const value = Number(settings[control.key]);

                return (
                  <label className="slider" key={control.key} title={control.help} htmlFor={sliderId}>
                    <span className="slider-heading">
                      <span>{control.label}</span>
                      <span className="slider-tools">
                        <input
                          className="slider-value"
                          type="number"
                          min="0"
                          max="100"
                          step="1"
                          value={formatScore(value)}
                          aria-label={`${control.label} value`}
                          onChange={(event) => updateSetting(control.key, scoreFromPercent(event.target.value))}
                        />
                        <button type="button" className="anchor-button" onClick={() => randomizeSlider(control.key)}>Randomize</button>
                      </span>
                    </span>
                    <input
                      id={sliderId}
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={value}
                      list={`${sliderId}-anchors`}
                      onChange={(event) => updateSetting(control.key, clampScore(Number(event.target.value)))}
                    />
                    <datalist id={`${sliderId}-anchors`}>
                      {scoreAnchors.map((anchor) => <option key={anchor} value={anchor} />)}
                    </datalist>
                    <div className="slider-anchors" aria-label={`${control.label} anchor values`}>
                      {scoreAnchors.map((anchor) => (
                        <button type="button" className="anchor-button" key={anchor} onClick={() => updateSetting(control.key, anchor)}>{formatScore(anchor)}</button>
                      ))}
                    </div>
                    <small>{control.help}</small>
                  </label>
                );
              })}

              <label className="seed-control">
                <span>Seed</span>
                <input value={settings.seed} onChange={(event) => updateSetting('seed', event.target.value)} />
              </label>

              <div className="actions">
                <button type="submit">Generate cast</button>
                <button type="button" className="secondary" onClick={randomizeSliders}>Randomize sliders</button>
                <button type="button" className="secondary" onClick={randomizeSeed}>Randomize seed</button>
              </div>
            </form>

            <section className="output" aria-live="polite">
              <div className="ensemble-note panel">
                <h2>Ensemble balance</h2>
                <p>{ensemble.diagnostics.summary}</p>
              </div>

              <div className="name-grid">
                {ensemble.names.map((name) => {
                  const rarity = rarityPresentation[name.silhouette.rarityBand];

                  return (
                    <details className={`name-card panel ${textureClassName(name.silhouette.texture)}`} key={name.id}>
                      <summary className="name-card-summary">
                        <div className="name-card-header">
                          <div><h2 className={rarity.className}>{name.name}</h2><p>{name.silhouette.rhythm} rhythm</p></div>
                          <span className="score-pill" aria-label={`Overall fit score ${formatScore(name.scores.overallFit)}`}>{formatScore(name.scores.overallFit)}</span>
                        </div>
                        <span className="collapse-cue">Details</span>
                      </summary>
                      <dl className="score-list" aria-label={`${name.name} score breakdown`}>
                        {scorePresentation.map((score) => <div key={`${name.id}-${score.key}`}><dt>{score.label}</dt><dd>{formatScore(name.scores[score.key])}</dd></div>)}
                      </dl>
                      <div className="metadata"><span>{name.silhouette.syllableCount} syllables</span><span>{name.silhouette.texture} texture</span><span className={rarityClassName(name.silhouette.rarityBand)}>{rarity.label} rarity</span></div>
                      <div><h3>Variants</h3><ul className="variants">{name.variants.map((variant) => <li key={`${name.id}-${variant.value}`}><span>{variant.value}</span><em>{variant.kind}</em></li>)}</ul></div>
                      <details className="source-trace">
                        <summary>Source trace</summary>
                        <ul className="provenance">{name.provenance.map((item) => <li key={`${name.id}-${item.sourceId}-${item.label}`}><strong>{item.label}</strong><span>{item.detail}</span></li>)}</ul>
                      </details>
                    </details>
                  );
                })}
              </div>
            </section>
          </section>
        </>
      ) : (
        <section className="changelog panel" aria-labelledby="changelog-title">
          <div className="changelog-heading">
            <div>
              <p className="eyebrow">Changelog</p>
              <h1 id="changelog-title">What changed in Name Forge</h1>
            </div>
            <p>Polished product-facing notes are summarized here. The complete push-by-push history remains available in GitHub.</p>
          </div>
          <ol className="changelog-list">
            {changelogEntries.map((entry) => (
              <li key={entry.title}>
                <div className="changelog-entry-header">
                  <h2>{entry.title}</h2>
                </div>
                <p>{entry.summary}</p>
                <ul>
                  {entry.changes.map((change) => <li key={change}>{change}</li>)}
                </ul>
              </li>
            ))}
          </ol>
          <a className="history-link" href={commitHistoryUrl} target="_blank" rel="noreferrer">View full commit history</a>
        </section>
      )}

      <footer className="site-footer panel">
        <p>&copy; 2026 <a href={authorSiteUrl} target="_blank" rel="noreferrer">James Hay</a>. Name Forge.</p>
      </footer>
    </main>
  );
}
