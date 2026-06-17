import type { FormEvent } from 'react';
import { serializeCastAsJson, serializeCastAsMarkdown } from '../engine/export';
import type { GeneratedEnsemble, GenerationSettings, NameFormatKind, StylePackSummary } from '../engine/types';
import { scoreControls, type ControlKey } from './presentation';
import { ScoreControl } from './ScoreControl';
import { NameCard } from './NameCard';

interface GeneratorViewProps {
  stylePacks: StylePackSummary[];
  settings: GenerationSettings;
  ensemble: GeneratedEnsemble;
  onUpdateSetting: <K extends keyof GenerationSettings>(key: K, value: GenerationSettings[K]) => void;
  onRegenerate: (event?: FormEvent) => void;
  onRandomizeSeed: () => void;
  onRandomizeSliders: () => void;
  onRandomizeSlider: (key: ControlKey) => void;
}

const formatOptions: Array<{ value: NameFormatKind; label: string }> = [
  { value: 'mixed', label: 'Mixed cast formats' },
  { value: 'given-only', label: 'Given name only' },
  { value: 'given-family', label: 'Given + family' },
  { value: 'initials-family', label: 'Initials + family' },
  { value: 'title-name', label: 'Title + name' },
  { value: 'epithet-place', label: 'Epithet/place-style' },
];

function exportHref(mimeType: string, value: string): string {
  return `data:${mimeType};charset=utf-8,${encodeURIComponent(value)}`;
}

function copyExport(value: string) {
  void navigator.clipboard?.writeText(value);
}

export function GeneratorView({
  stylePacks,
  settings,
  ensemble,
  onUpdateSetting,
  onRegenerate,
  onRandomizeSeed,
  onRandomizeSliders,
  onRandomizeSlider,
}: GeneratorViewProps) {
  const jsonExport = serializeCastAsJson(ensemble);
  const markdownExport = serializeCastAsMarkdown(ensemble);

  return (
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
        <form className="controls panel" onSubmit={onRegenerate}>
          <div className="control-row split">
            <label>
              <span>Cast size</span>
              <input type="number" min="1" max="24" value={settings.castSize} onChange={(event) => onUpdateSetting('castSize', Number(event.target.value))} />
            </label>
            <label>
              <span>Style preset</span>
              <select value={settings.stylePackId} onChange={(event) => onUpdateSetting('stylePackId', event.target.value)}>
                {stylePacks.map((pack) => <option key={pack.id} value={pack.id}>{pack.label}</option>)}
              </select>
            </label>
          </div>

          <label>
            <span>Name format</span>
            <select value={settings.nameFormat ?? 'given-only'} onChange={(event) => onUpdateSetting('nameFormat', event.target.value as NameFormatKind)}>
              {formatOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>

          {scoreControls.map((control) => (
            <ScoreControl
              key={control.key}
              control={control}
              value={Number(settings[control.key])}
              onChange={(key, value) => onUpdateSetting(key, value)}
              onRandomize={onRandomizeSlider}
            />
          ))}

          <label className="seed-control">
            <span>Seed</span>
            <input value={settings.seed} onChange={(event) => onUpdateSetting('seed', event.target.value)} />
          </label>

          <div className="actions">
            <button type="submit">Generate cast</button>
            <button type="button" className="secondary" onClick={onRandomizeSliders}>Randomize sliders</button>
            <button type="button" className="secondary" onClick={onRandomizeSeed}>Randomize seed</button>
          </div>
        </form>

        <section className="output" aria-live="polite">
          <div className="ensemble-note panel">
            <h2>Ensemble balance</h2>
            <p>{ensemble.diagnostics.summary}</p>
          </div>

          <section className="export-panel panel" aria-labelledby="export-heading">
            <div className="export-heading">
              <div>
                <p className="eyebrow">Export</p>
                <h2 id="export-heading">Export generated cast</h2>
                <p>Download or copy the current deterministic cast as JSON or Markdown.</p>
              </div>
              <div className="export-actions" aria-label="Cast export actions">
                <a className="export-link" download="name-forge-cast.json" href={exportHref('application/json', jsonExport)}>Download JSON</a>
                <a className="export-link" download="name-forge-cast.md" href={exportHref('text/markdown', markdownExport)}>Download Markdown</a>
                <button type="button" className="secondary" onClick={() => copyExport(jsonExport)}>Copy JSON</button>
                <button type="button" className="secondary" onClick={() => copyExport(markdownExport)}>Copy Markdown</button>
              </div>
            </div>
            <label className="export-preview">
              <span>Markdown preview</span>
              <textarea value={markdownExport} readOnly rows={8} />
            </label>
          </section>

          <div className="name-grid">
            {ensemble.names.map((name) => <NameCard key={name.id} name={name} />)}
          </div>
        </section>
      </section>
    </>
  );
}
