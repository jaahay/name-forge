import type { FormEvent } from 'react';
import { serializeCastAsJson, serializeCastAsMarkdown } from '../engine/export';
import { rarityDistributionOptions } from '../engine/rarity';
import { castRoleOptions, castRolePresetOptions } from '../engine/roles';
import type { CastRole, CastRolePresetKind, GeneratedEnsemble, GenerationSettings, NameFormatKind, RarityDistributionPresetKind, StylePackSummary } from '../engine/types';
import { cardDensityOptions, scoreControls, type CardDensity, type ControlKey } from './presentation';
import { ScoreControl } from './ScoreControl';
import { NameCard } from './NameCard';

interface GeneratorViewProps {
  stylePacks: StylePackSummary[];
  settings: GenerationSettings;
  ensemble: GeneratedEnsemble;
  cardDensity: CardDensity;
  onUpdateCardDensity: (density: CardDensity) => void;
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

function clampCastSize(value: number): number {
  if (Number.isNaN(value)) return 1;
  return Math.max(1, Math.min(24, Math.round(value)));
}

function updateSlotRole(currentRoles: GenerationSettings['slotRoleOverrides'], index: number, role: CastRole | ''): GenerationSettings['slotRoleOverrides'] {
  const nextRoles = { ...(currentRoles ?? {}) };
  if (role === '') {
    delete nextRoles[index];
    return nextRoles;
  }
  nextRoles[index] = role;
  return nextRoles;
}

export function GeneratorView({
  stylePacks,
  settings,
  ensemble,
  cardDensity,
  onUpdateCardDensity,
  onUpdateSetting,
  onRegenerate,
  onRandomizeSeed,
  onRandomizeSliders,
  onRandomizeSlider,
}: GeneratorViewProps) {
  const jsonExport = serializeCastAsJson(ensemble);
  const markdownExport = serializeCastAsMarkdown(ensemble);
  const castSize = clampCastSize(settings.castSize);
  const slotRoleCount = Math.max(0, Math.min(castSize, 8));
  const hasRoleMix = (settings.rolePreset ?? 'none') !== 'none';

  function updateCastSize(value: number) {
    onUpdateSetting('castSize', clampCastSize(value));
  }

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
          <details className="control-section" open>
            <summary>Basics</summary>
            <div className="control-section-body">
              <label>
                <span>Cast size</span>
                <div className="cast-size-control">
                  <button type="button" className="stepper-button" onClick={() => updateCastSize(castSize - 1)} aria-label="Decrease cast size">-</button>
                  <input type="number" min="1" max="24" value={castSize} onChange={(event) => updateCastSize(Number(event.target.value))} />
                  <button type="button" className="stepper-button" onClick={() => updateCastSize(castSize + 1)} aria-label="Increase cast size">+</button>
                </div>
              </label>
              <label>
                <span>Style preset</span>
                <select value={settings.stylePackId} onChange={(event) => onUpdateSetting('stylePackId', event.target.value)}>
                  {stylePacks.map((pack) => <option key={pack.id} value={pack.id}>{pack.label}</option>)}
                </select>
              </label>
              <label>
                <span>Name format</span>
                <select value={settings.nameFormat ?? 'given-only'} onChange={(event) => onUpdateSetting('nameFormat', event.target.value as NameFormatKind)}>
                  {formatOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </label>
              <label className="seed-control">
                <span>Seed</span>
                <input value={settings.seed} onChange={(event) => onUpdateSetting('seed', event.target.value)} />
              </label>
            </div>
          </details>

          <details className="control-section" open>
            <summary>Fiction</summary>
            <div className="control-section-body">
              <label>
                <span>Cast role mix</span>
                <select value={settings.rolePreset ?? 'none'} onChange={(event) => onUpdateSetting('rolePreset', event.target.value as CastRolePresetKind)}>
                  {castRolePresetOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </label>
              {hasRoleMix ? (
                <details className="slot-overrides">
                  <summary>Customize slots</summary>
                  <div className="slot-role-grid" aria-label="Slot role overrides">
                    {Array.from({ length: slotRoleCount }, (_, index) => (
                      <label key={`slot-role-${index + 1}`}>
                        <span>Slot {index + 1}</span>
                        <select
                          value={settings.slotRoleOverrides?.[index] ?? ''}
                          onChange={(event) => onUpdateSetting('slotRoleOverrides', updateSlotRole(settings.slotRoleOverrides, index, event.target.value as CastRole | ''))}
                        >
                          <option value="">Use role mix</option>
                          {castRoleOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                        </select>
                      </label>
                    ))}
                    <p className="section-note">Slot overrides only affect selected slots and preserve the rest of the role mix.</p>
                  </div>
                </details>
              ) : (
                <p className="section-note">Choose a role mix to reveal optional slot-by-slot overrides.</p>
              )}
            </div>
          </details>

          <details className="control-section" open>
            <summary>Rarity & scoring</summary>
            <div className="control-section-body">
              <label>
                <span>Rarity distribution</span>
                <select value={settings.rarityDistribution ?? 'style-pack'} onChange={(event) => onUpdateSetting('rarityDistribution', event.target.value as RarityDistributionPresetKind)}>
                  {rarityDistributionOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
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
            </div>
          </details>

          <div className="actions">
            <button type="submit">Generate cast</button>
            <button type="button" className="secondary" onClick={onRandomizeSliders}>Randomize sliders</button>
            <button type="button" className="secondary" onClick={onRandomizeSeed}>Randomize seed</button>
          </div>
        </form>

        <section className="output" aria-live="polite">
          <div className="output-toolbar panel">
            <div className="ensemble-note">
              <h2>Ensemble balance</h2>
              <p>{ensemble.diagnostics.summary}</p>
            </div>
            <label className="density-control">
              <span>Card detail</span>
              <select value={cardDensity} onChange={(event) => onUpdateCardDensity(event.target.value as CardDensity)}>
                {cardDensityOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
              <small>{cardDensityOptions.find((option) => option.value === cardDensity)?.help}</small>
            </label>
          </div>

          <div className={`name-grid card-density-${cardDensity}`}>
            {ensemble.names.map((name) => <NameCard key={name.id} name={name} density={cardDensity} />)}
          </div>

          <section className="export-panel panel" aria-labelledby="export-heading">
            <div className="export-heading">
              <div>
                <p className="eyebrow">Export</p>
                <h2 id="export-heading">Export cast</h2>
              </div>
              <div className="export-actions" aria-label="Cast export actions">
                <a className="export-link" download="name-forge-cast.json" href={exportHref('application/json', jsonExport)}>JSON</a>
                <a className="export-link" download="name-forge-cast.md" href={exportHref('text/markdown', markdownExport)}>Markdown</a>
                <button type="button" className="secondary" onClick={() => copyExport(jsonExport)}>Copy JSON</button>
                <button type="button" className="secondary" onClick={() => copyExport(markdownExport)}>Copy Markdown</button>
              </div>
            </div>
            <details className="export-preview">
              <summary>Show Markdown preview</summary>
              <textarea value={markdownExport} readOnly rows={8} aria-label="Markdown export preview" />
            </details>
          </section>
        </section>
      </section>
    </>
  );
}
