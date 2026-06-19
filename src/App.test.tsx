import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import App from './App';

describe('App', () => {
  it('renders the fiction cast workbench with brand mark, compact header, roster, inspector, save/copy controls, and project chrome', () => {
    const html = renderToString(<App />);

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
      'Reroll names',
      'Shuffle feel',
      'Generate',
      'Selected',
      'Texture',
      'Checks',
      'Name parts',
      'Save',
      'Copy',
      'JSON',
      'Markdown',
      'Copy JSON',
      'Copy Markdown',
    ];
    const collapsedControlSectionSummaries = [
      'Cast setup',
      'Story roles',
      'Name feel',
      'Run options',
    ];

    for (const expected of expectedCopy) {
      expect(html).toContain(expected);
    }

    for (const summary of collapsedControlSectionSummaries) {
      expect(html).toMatch(new RegExp(`<details class="control-section"><summary>${summary}</summary>`));
    }

    expect(html).toContain('class="hero panel app-header"');
    expect(html).toContain('class="brand-mark"');
    expect(html).toContain('class="brand-sigil"');
    expect(html).toContain('class="workspace workbench"');
    expect(html).toContain('class="roster-panel panel"');
    expect(html).toContain('class="save-panel panel"');
    expect(html).toContain('class="save-group"');
    expect(html).toContain('aria-label="Naming modes"');
    expect(html).toContain('class="mode-tab active"');
    expect(html).toContain('class="name-grid"');
    expect(html).toContain('aria-label="Name tiles"');
    expect(html).toContain('class="selected-name-panel panel"');
    expect(html).toContain('class="selected-name-chips"');
    expect(html).toContain('class="inspector-summary"');
    expect(html).toContain('class="name-detail-grid"');
    expect(html).toContain('class="selection-cue"');
    expect(html).toContain('aria-pressed="true"');
    expect(html).toContain('aria-label="Generation actions"');
    expect(html).not.toContain('class="output-toolbar panel"');
    expect(html).not.toContain('class="name-grid has-selection"');
    expect(html).not.toContain('class="name-inline-detail"');
    expect(html).not.toContain('class="collapse-cue"');
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
    expect(html).not.toContain('Generated from');
    expect(html).not.toContain('Roll notes');
    expect(html).not.toContain('Save cast');
    expect(html).not.toContain('Preview Markdown');
    expect(html).not.toContain('Show Markdown preview');
    expect(html).not.toContain('In inspector');
    expect(html).not.toContain('Profile');
    expect(html).not.toContain('Construction');
    expect(html).not.toContain('Fit scores');
    expect(html).not.toContain('Export cast');
    expect(html).not.toContain('Randomize sliders');
    expect(html).not.toContain('Randomize seed');
    expect(html).not.toContain('Randomize Novelty');
    expect(html).not.toContain('<summary>Basics</summary>');
    expect(html).not.toContain('<summary>Fiction</summary>');
    expect(html).not.toContain('<summary>Name tuning</summary>');
    expect(html).not.toContain('<summary>Mode</summary>');
    expect(html).not.toContain('Density');
    expect(html).not.toContain('Comfortable');
    expect(html).not.toContain('<details class="control-section" open');
  });
});
