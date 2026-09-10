import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { HelpView } from './HelpView';

describe('HelpView', () => {
  it('provides stable operational help topics without reviving retired product semantics', () => {
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

    expect(html).toContain('There is no separate adherence');
    expect(html).toContain('not a cultural-authenticity claim');
    expect(html).toContain('Browser playback is an approximate voice draft');
    expect(html).toContain('Configure → Roles → Role guide');
    expect(html).toContain('Changing intent that affects a locked slot');
    expect(html).toContain('Titles, epithets, initials, particles, and other literals');

    expect(html).not.toContain('Naming style');
    expect(html).not.toContain('Style pack');
    expect(html).not.toContain('Loose');
    expect(html).not.toContain('Faithful');
    expect(html).not.toContain('authenticity score');
  });
});
