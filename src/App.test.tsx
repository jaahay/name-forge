import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import App from './App';

describe('App', () => {
  it('renders the generation shell with the core controls, output regions, and project chrome', () => {
    const html = renderToString(<App />);

    expect(html).toContain('Name Forge');
    expect(html).toContain('Generator');
    expect(html).toContain('Changelog');
    expect(html).toContain('About');
    expect(html).toContain('Cast size');
    expect(html).toContain('Style preset');
    expect(html).toContain('Name format');
    expect(html).toContain('Mixed cast formats');
    expect(html).toContain('Initials + family');
    expect(html).toContain('Title + name');
    expect(html).toContain('Epithet/place-style');
    expect(html).toContain('Novelty value');
    expect(html).toContain('Randomize Novelty');
    expect(html).toContain('Randomize sliders');
    expect(html).toContain('Randomize seed');
    expect(html).toContain('Generate cast');
    expect(html).toContain('Ensemble balance');
    expect(html).toContain('name-forge-001');
    expect(html).toContain('<details');
    expect(html).toContain('texture-');
    expect(html).toContain('Details');
    expect(html).toContain('diagnostic score breakdown');
    expect(html).toContain('Style fit');
    expect(html).toContain('Cast fit');
    expect(html).toContain('Name parts');
    expect(html).toContain('Alternate spellings');
    expect(html).not.toContain('Source trace');
    expect(html).not.toContain('Overall fit score');
    expect(html).not.toContain('medium target');
    expect(html).not.toContain('rarity target');
    expect(html).not.toContain('Diagnostics explain why this name was selected');
    expect(html).not.toContain('Generated from the same base name');
    expect(html).not.toContain('Errata');
    expect(html).not.toContain('Unreleased');
    expect(html).not.toContain('Name Forge version');
    expect(html).not.toContain('Fictional names');
  });
});
