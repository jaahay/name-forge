import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import App from './App';

function stripExportDataUrls(html: string): string {
  return html.replace(/href="data:[^"]+"/g, 'href="[export data omitted]"');
}

describe('App', () => {
  it('renders the fiction cast workbench with nav sigil, compact header, selected inspector rail, roster, export menu, lock controls, and project chrome', () => {
    const html = stripExportDataUrls(renderToString(<App />));

    const expectedCopy = [
      'Name Forge',
      'Product',
      'NPC',
      'Pen name',
      'Cast',
      'Changelog',
      'About',
      'Fiction Cast',
      'Roll fantasy names, tune the feel, and keep the cast that fits.',
      'Cast setup',
      'Story roles',
      'Name feel',
      'Run options',
      'Cast size',
      'Decrease cast size',
      'Increase cast size',
      'Style preset',
      'Name format',
      'Mixed cast formats',
      'Initials + family',
      'Title + name',
      'Epithet/place-style',
      'Cast role mix',
      'Role influence',
      'Off',
      'Light',
      'Strong',
      'Roles label cast slots only; generation and scoring stay role-neutral.',
      'Role influence is opt-in.',
      'sound patterns',
      'Choose a role mix to reveal optional slot-by-slot overrides.',
      'Rarity distribution',
      'Novelty value',
      'Shuffle Novelty',
      'Generation seed',
      'Reroll feel',
      'Generate',
      'Inspect',
      'Lock',
      'Export',
      'Save',
      'Copy',
      'JSON',
      'Markdown',
      'Copy JSON',
      'Copy Markdown',
      'Read',
      'Name parts',
      'Construction cues',
    ];
    const collapsedControlSectionSummaries = [
      'Cast setup',
      'Story roles',
      'Run options',
    ];

    for (const expected of expectedCopy) {
      expect(html).toContain(expected);
    }

    for (const summary of collapsedControlSectionSummaries) {
      expect(html).toMatch(new RegExp(`<details class="control-section"><summary>${summary}</summary>`));
    }

    expect(html).toMatch(/<details class="control-section" open=""><summary>Name feel<\/summary>/);
    expect(html).toContain('class="hero panel app-header"');
    expect(html).toContain('class="nav-primary"');
    expect(html).toContain('class="nav-brand"');
    expect(html).toContain('class="nav-divider"');
    expect(html).toContain('class="brand-mark"');
    expect(html).toContain('class="brand-sigil"');
    expect(html).toContain('class="workspace workbench"');
    expect(html).toContain('class="roster-panel panel"');
    expect(html).toContain('class="results-layout inspector-rail-layout"');
    expect(html).toContain('class="selected-name-panel panel"');
    expect(html).toContain('class="selected-name-chips"');
    expect(html).toContain('class="inspector-summary"');
    expect(html).toContain('class="name-detail-grid"');
    expect(html).toContain('aria-pressed="true"');
    expect(html).toContain('class="save-menu panel"');
    expect(html).toContain('class="save-menu-content"');
    expect(html).toContain('aria-label="Export cast"');
    expect(html).toContain('class="save-group"');
    expect(html).toContain('aria-label="Naming modes"');
    expect(html).toContain('class="mode-tab active"');
    expect(html).toContain('class="name-grid"');
    expect(html).toContain('aria-label="Name tiles"');
    expect(html).toContain('aria-label="Generation actions"');
    expect(html).toContain('class="anchor-button lock-toggle"');
    expect(html).toContain('aria-label="Lock ');
    expect(html).not.toContain('class="brand-lockup"');
    expect(html).not.toContain('class="save-panel panel"');
    expect(html).not.toContain('class="output-toolbar panel"');
    expect(html).not.toContain('class="inspector-empty-panel panel"');
    expect(html).not.toContain('class="name-grid has-selection"');
    expect(html).not.toContain('class="name-inline-detail"');
    expect(html).not.toContain('class="collapse-cue"');
    expect(html).not.toContain('class="selection-cue"');
    expect(html).not.toContain('class="generation-context export-summary"');
    expect(html).not.toContain('aria-expanded="true"');
    expect(html).not.toContain('Name Forge /');
    expect(html).not.toContain('Fiction cast mode');
    expect(html).not.toContain('Names that are random, usable, and cast-aware.');
    expect(html).not.toContain('NF');
    expect(html).not.toContain('Generated names');
    expect(html).not.toContain('Pick a tile');
    expect(html).not.toContain('Cast roster');
    expect(html).not.toContain('Selected name');
    expect(html).not.toContain('Selected</span>');
    expect(html).not.toContain('Generated from');
    expect(html).not.toContain('Roll notes');
    expect(html).not.toContain('Save / copy');
    expect(html).not.toContain('Save cast');
    expect(html).not.toContain('Preview Markdown');
    expect(html).not.toContain('Show Markdown preview');
    expect(html).not.toContain('In inspector');
    expect(html).not.toContain('Profile');
    expect(html).not.toContain('Checks');
    expect(html).not.toContain('Fit scores');
    expect(html).not.toContain('Reroll names');
    expect(html).not.toContain('Shuffle feel');
    expect(html).not.toContain('Randomize sliders');
    expect(html).not.toContain('New seed');
    expect(html).not.toContain('Randomize seed');
    expect(html).not.toContain('Randomize Novelty');
    expect(html).not.toContain('Regenerate unlocked');
    expect(html).not.toContain('Clear locks');
    expect(html).not.toContain('Locked</button>');
    expect(html).not.toContain('<summary>Basics</summary>');
    expect(html).not.toContain('<summary>Fiction</summary>');
    expect(html).not.toContain('<summary>Name tuning</summary>');
    expect(html).not.toContain('<summary>Mode</summary>');
    expect(html).not.toContain('Density');
    expect(html).not.toContain('Comfortable');
  });
});
