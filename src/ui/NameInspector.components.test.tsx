import { describe, expect, it } from 'vitest';
import type { FictionCastGeneratedName } from '../fictionCast/types';
import { fixtureName, nameInspectorSettings, renderInspector } from './nameInspectorTestSupport';

describe('NameInspector generated components', () => {
  it('promotes every genuinely generated component and keeps its detail local to the component controls', () => {
    const generatedSettings = { ...nameInspectorSettings, nameFormat: 'given-family' as const, seed: 'name-inspector-generated-components' };
    const name = fixtureName(generatedSettings);
    const familyComponent = name.identity.components.find((component) => component.kind === 'generated' && component.role === 'family');
    const html = renderInspector(name, false, generatedSettings);
    const titleIndex = html.indexOf(name.displayName);
    const componentsIndex = html.indexOf(`aria-label="${name.displayName} generated components"`);
    const localDetailIndex = html.indexOf(`aria-label="Given component ${name.primaryName.name} sound detail"`);
    const pronunciationIndex = html.indexOf(`aria-label="Sound guide for ${name.displayName}"`);

    expect(familyComponent).toBeDefined();
    expect(titleIndex).toBeGreaterThan(-1);
    expect(componentsIndex).toBeGreaterThan(titleIndex);
    expect(localDetailIndex).toBeGreaterThan(componentsIndex);
    expect(pronunciationIndex).toBeGreaterThan(localDetailIndex);
    expect(html).toContain('Generated components');
    expect(html).toContain(`<strong>${name.primaryName.name}</strong>`);
    expect(html).toContain(`<strong>${familyComponent?.value}</strong>`);
    expect(html).toContain(`aria-label="Inspect given component ${name.primaryName.name}"`);
    expect(html).toContain(`aria-label="Inspect family component ${familyComponent?.value}"`);
    expect(html).toContain(`aria-controls="generated-component-detail-${name.id}"`);
    expect(html).toContain(`id="generated-component-detail-${name.id}"`);
    expect(html).toContain(name.primaryName.sound.transcription);
    expect(html).not.toContain(`<strong>${name.primaryName.name}</strong><span>Given</span>`);
  });

  it('keeps the underlying generated given component visible when initials hide its spelling', () => {
    const generatedSettings = { ...nameInspectorSettings, nameFormat: 'initials-family' as const, seed: 'name-inspector-initials-components' };
    const name = fixtureName(generatedSettings);
    const primaryIdentityComponent = name.identity.components.find((component) => (
      component.kind === 'generated' && component.generatedName.id === name.primaryName.id
    ));
    const html = renderInspector(name, false, generatedSettings);

    expect(primaryIdentityComponent).toBeDefined();
    expect(primaryIdentityComponent?.value).toBe(name.primaryName.name);
    expect(name.identity.phraseParts.some((part) => part.kind === 'component' && part.componentId === primaryIdentityComponent?.id)).toBe(false);
    expect(html).toContain(`<strong>${name.primaryName.name}</strong>`);
    expect(html).toContain(`id="generated-component-detail-${name.id}"`);
    expect(html).toContain(name.primaryName.sound.transcription);
  });

  it('suppresses primary spelling alternates when initials hide the source name', () => {
    const generatedSettings = { ...nameInspectorSettings, nameFormat: 'initials-family' as const, seed: 'name-inspector-initials-guide' };
    const name = fixtureName(generatedSettings);
    const selected = name.primaryName.spelling;
    const alternative = {
      ...selected,
      text: `${selected.text}e`,
      rank: selected.rank + 1,
      score: selected.score - 0.01,
    };
    const withAlternative: FictionCastGeneratedName = {
      ...name,
      primaryName: {
        ...name.primaryName,
        spellingCandidates: [selected, alternative],
      },
    };
    const html = renderInspector(withAlternative, false, generatedSettings);

    expect(html).not.toContain('Alternative spellings');
    expect(html).not.toContain(alternative.text);
    expect(html).toContain(`id="generated-component-detail-${name.id}"`);
  });

  it('connects promoted generated components to one adjacent sound-detail region and icon audition', () => {
    const generatedSettings = { ...nameInspectorSettings, nameFormat: 'epithet-place' as const, seed: 'name-inspector-composed-provenance' };
    const name = fixtureName(generatedSettings);
    const generatedComponents = name.identity.components.filter((component) => component.kind === 'generated');
    const expectedComponentCount = new Set(generatedComponents.map((component) => component.generatedName.id)).size;
    const html = renderInspector(name, false, generatedSettings);

    const detailId = `generated-component-detail-${name.id}`;

    expect(name.identity.format.kind).toBe('epithet-place');
    expect(html).toContain('Generated components');
    expect(html).toContain(`aria-label="${name.displayName} generated components"`);
    expect((html.match(new RegExp(`aria-controls="${detailId}"`, 'g')) ?? [])).toHaveLength(expectedComponentCount);
    expect((html.match(new RegExp(`id="${detailId}"`, 'g')) ?? [])).toHaveLength(1);
    for (const component of generatedComponents) {
      expect(html).toContain(component.value);
      expect(html).toContain(`aria-label="Play approximate browser voice for ${component.generatedName.name}"`);
    }
    expect(html).toContain(name.primaryName.sound.transcription);
  });
});
