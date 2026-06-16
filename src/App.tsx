import { FormEvent, useMemo, useState } from 'react';
import { createDefaultRegistry } from './engine/registry';
import { generateEnsemble } from './engine/ensemble';
import type { GenerationSettings, RarityBand } from './engine/types';

const registry = createDefaultRegistry();
const stylePacks = registry.listStylePacks();

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

const rarityPresentation: Record<RarityBand, { label: string; className: string }> = {
  common: { label: 'Common', className: 'rarity-common' },
  uncommon: { label: 'Uncommon', className: 'rarity-uncommon' },
  rare: { label: 'Rare', className: 'rarity-rare' },
  epic: { label: 'Epic', className: 'rarity-epic' },
  legendary: { label: 'Legendary', className: 'rarity-legendary' },
};

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

function formatScore(value: number): string {
  return Math.round(value * 100).toString();
}

function rarityClassName(rarity: RarityBand): string {
  return `rarity-pill ${rarityPresentation[rarity].className}`;
}

export default function App() {
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

  return (
    <main className="app-shell">
      <section className="hero panel">
        <div>
          <p className="eyebrow">Name Forge</p>
          <h1>Fictional names that are random, usable, and cast-aware.</h1>
          <p className="hero-copy">
            Generate a balanced ensemble by shaping name silhouettes first, scoring plausibility,
            suggesting spelling variants, and preserving provenance for every result.
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

          {scoreControls.map((control) => (
            <label className="slider" key={control.key} title={control.help}>
              <span>{control.label}<strong>{formatScore(Number(settings[control.key]))}</strong></span>
              <input type="range" min="0" max="1" step="0.01" value={Number(settings[control.key])} onChange={(event) => updateSetting(control.key, Number(event.target.value))} />
              <small>{control.help}</small>
            </label>
          ))}

          <label className="seed-control">
            <span>Seed</span>
            <input value={settings.seed} onChange={(event) => updateSetting('seed', event.target.value)} />
          </label>

          <div className="actions">
            <button type="submit">Generate cast</button>
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
                <article className="name-card panel" key={name.id}>
                  <div className="name-card-header">
                    <div><h2>{name.name}</h2><p>{name.silhouette.rhythm} rhythm</p></div>
                    <span className="score-pill">{formatScore(name.scores.plausibility)}</span>
                  </div>
                  <dl className="score-list">
                    <div><dt>Pronounce</dt><dd>{formatScore(name.scores.pronounceability)}</dd></div>
                    <div><dt>Memorable</dt><dd>{formatScore(name.scores.memorability)}</dd></div>
                    <div><dt>Novel</dt><dd>{formatScore(name.scores.novelty)}</dd></div>
                    <div><dt>Anchored</dt><dd>{formatScore(name.scores.culturalAnchoring)}</dd></div>
                    <div><dt>Natural</dt><dd>{formatScore(name.scores.orthographicNaturalness)}</dd></div>
                  </dl>
                  <div className="metadata"><span>{name.silhouette.syllableCount} syllables</span><span>{name.silhouette.texture} texture</span><span className={rarityClassName(name.silhouette.rarityBand)}>{rarity.label} rarity</span></div>
                  <div><h3>Variants</h3><ul className="variants">{name.variants.map((variant) => <li key={`${name.id}-${variant.value}`}><span>{variant.value}</span><em>{variant.kind}</em></li>)}</ul></div>
                  <div><h3>Provenance</h3><ul className="provenance">{name.provenance.map((item) => <li key={`${name.id}-${item.sourceId}-${item.label}`}><strong>{item.label}</strong><span>{item.detail}</span></li>)}</ul></div>
                </article>
              );
            })}
          </div>
        </section>
      </section>
    </main>
  );
}
