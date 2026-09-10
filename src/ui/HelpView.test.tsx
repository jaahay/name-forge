import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { HelpView } from './HelpView';

describe('HelpView', () => {
  it('provides stable operational help topics without reviving retired or internal product semantics', () => {
    const html = renderToStaticMarkup(<HelpView />);

    for (const topic of [
      ['help-roles', 'Roles'],
      ['help-naming-idiom', 'Naming idiom'],
      ['help-generation', 'Generation &amp; reroll'],
      ['help-audition', 'Browser audition'],
      ['help-locking', 'Locking'],
      ['help-components', 'Identity components'],
    ]) {
      expect(html).toContain(`href="#${topic[0]}"`);
      expect(html).toContain(`id="${topic[0]}"`);
      expect(html).toContain(`>${topic[1]}</a>`);
    }

    expect(html).toContain('no separate adherence or strength setting for an idiom');
    expect(html).toContain('not cultural');
    expect(html).toContain('Browser playback is an approximate voice draft');
    expect(html).toContain('Configure → Roles → Role guide');
    expect(html).toContain('If you change a setting that would change a locked name');
    expect(html).toContain('titles, epithets, initials, and particles');

    for (const internalOrRetiredPhrase of [
      'Naming style',
      'Style pack',
      'Loose',
      'Faithful',
      'authenticity score',
      'bounded creative source',
      'independently declared intent',
      'generated sound evidence',
      'compatible generation intent',
      'singular generated-name engine',
    ]) {
      expect(html).not.toContain(internalOrRetiredPhrase);
    }
  });
});
