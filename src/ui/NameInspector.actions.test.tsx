import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { toNameArtifact } from '../engine/nameArtifact';
import {
  browserVoiceDraftSegments,
  browserVoiceDraftText,
  NameArtifactInspector,
} from './NameArtifactInspector';
import { fixtureName, renderInspector } from './nameInspectorTestSupport';

describe('NameInspector actions and shared inspector boundaries', () => {
  it('uses icon-only whole-name actions with accessible names and tooltip titles', () => {
    const name = fixtureName();
    const html = renderInspector(name);

    expect(html).toContain('selected-name-actions');
    expect(html).toContain('selected-name-utilities');
    expect(html).toContain('inspector-icon-action');
    expect(html).toContain(`aria-label="Play approximate browser voice for ${name.displayName}"`);
    expect(html).toContain(`aria-label="Copy name ${name.displayName}"`);
    expect(html).toContain('title="Copy name"');
    expect(html).toContain(`aria-label="Copy details ${name.displayName}"`);
    expect(html).toContain('title="Copy details"');
    expect(html).toContain(`aria-label="Reroll ${name.displayName}"`);
    expect(html).toContain('title="Reroll name"');
    expect(html).toContain(`aria-label="Lock ${name.displayName}"`);
    expect(html).toContain('title="Lock name"');
    expect(html).toContain('aria-pressed="false"');
    expect(html).not.toContain('>Play name</button>');
    expect(html).not.toContain('>Reroll</button>');
    expect(html).not.toContain('>Lock</button>');
    expect(html).not.toContain('>Copy name</button>');
    expect(html).not.toContain('>Copy details</button>');
  });

  it('keeps shared voice helpers primitive while Fiction Cast owns the whole-identity speech text', () => {
    const composed = fixtureName({ nameFormat: 'epithet-place', seed: 'name-inspector-voice-phrase' });
    const primitiveArtifact = toNameArtifact(composed.primaryName);

    expect(browserVoiceDraftText(primitiveArtifact, 'fallback')).toBe('fallback');
    expect(browserVoiceDraftSegments(primitiveArtifact, 'fallback')).toEqual(['fallback']);
    expect(composed.identityAudition.speechText.length).toBeGreaterThan(0);
    expect(composed.identityAudition.identityText).toBe(composed.displayName);
  });

  it('keeps the shared artifact inspector default presentation unchanged for non-Cast callers', () => {
    const artifact = toNameArtifact(fixtureName().primaryName);
    const html = renderToString(<NameArtifactInspector artifact={artifact} />);

    expect(html).toContain('data-inspector-presentation="default"');
    expect(html).toContain('>Sound</h3>');
    expect(html).toContain('>Spelling</h3>');
    expect(html).toContain('Play name');
    expect(html).not.toContain('inspector-primary-compact');
  });

  it('reflects the locked state and disables selected-name reroll', () => {
    const name = fixtureName();
    const html = renderInspector(name, true);

    expect(html).toContain('selected-name-reroll-action');
    expect(html).toContain(`aria-label="Reroll ${name.displayName}"`);
    expect(html).toContain('disabled=""');
    expect(html).toContain('title="Unlock this name to reroll it."');
    expect(html).toContain('selected-name-lock-action');
    expect(html).toContain(`aria-label="Unlock ${name.displayName}"`);
    expect(html).toContain('title="Unlock name"');
    expect(html).toContain('aria-pressed="true"');
  });
});
