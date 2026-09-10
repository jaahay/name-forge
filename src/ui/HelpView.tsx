const helpTopics = [
  { id: 'help-roles', label: 'Roles' },
  { id: 'help-naming-idiom', label: 'Naming idiom' },
  { id: 'help-generation', label: 'Generation & reroll' },
  { id: 'help-audition', label: 'Browser audition' },
  { id: 'help-locking', label: 'Locking' },
  { id: 'help-components', label: 'Identity components' },
] as const;

export function HelpView() {
  return (
    <section className="help-view panel" aria-labelledby="help-title">
      <div className="help-heading">
        <p className="eyebrow">Help</p>
        <h1 id="help-title">Using Name Forge</h1>
        <p>
          Most controls are intended to stand on their own. This guide covers the operational concepts that need more context
          than a label or short inline note can responsibly provide.
        </p>
      </div>

      <nav className="help-topic-nav" aria-label="Help topics">
        {helpTopics.map((topic) => <a key={topic.id} href={`#${topic.id}`}>{topic.label}</a>)}
      </nav>

      <div className="help-sections">
        <section id="help-roles" className="help-section" aria-labelledby="help-roles-title">
          <h2 id="help-roles-title">Roles and generation influence</h2>
          <p>
            Roles assign story context to cast slots. <strong>Generation influence</strong> controls whether and how strongly an
            assigned role shapes that slot's naming tendencies. With influence off, a role remains context only; an unassigned
            slot has no role shaping to apply.
          </p>
          <p>
            The role-specific creative directions live in <strong>Configure → Roles → Role guide</strong>. Those directions are
            fictional naming prompts, not claims that real people or story roles inherently sound a certain way.
          </p>
        </section>

        <section id="help-naming-idiom" className="help-section" aria-labelledby="help-naming-idiom-title">
          <h2 id="help-naming-idiom-title">Naming idiom</h2>
          <p>
            A Naming idiom is a bounded creative source for characteristic naming tendencies such as sound, form, and spelling
            where those mechanics are supported. It contributes to generation; it is not the complete generation request and it
            is not a cultural-authenticity claim.
          </p>
          <p>
            Familiar, Readable, Compact, Spelling, Cast variation, Roles, identity structure, and seed remain independently
            declared intent. Selecting an idiom does not silently rewrite those controls, and there is no separate adherence,
            influence, or strength setting for the idiom.
          </p>
        </section>

        <section id="help-generation" className="help-section" aria-labelledby="help-generation-title">
          <h2 id="help-generation-title">Deterministic generation and reroll</h2>
          <p>
            Generation is deterministic from the resolved settings and seed: reuse the same generation inputs and seed to
            reproduce the same result. <strong>Start cast</strong> and <strong>Generate</strong> deliberately choose a fresh seed.
          </p>
          <p>
            For an existing cast, editing <strong>Generation seed</strong> and leaving the field applies that seed to the current
            settings. Rerolling one selected, unlocked identity uses a fresh seed while preserving the other cast slots.
          </p>
        </section>

        <section id="help-audition" className="help-section" aria-labelledby="help-audition-title">
          <h2 id="help-audition-title">Browser audition and pronunciation</h2>
          <p>
            Browser playback is an approximate voice draft. It is useful for hearing a possible reading, but the browser's speech
            engine is not pronunciation authority and may render an invented name differently from the generated sound evidence.
          </p>
          <p>
            The visible sound guide and retained sound evidence describe generated intent. They should not be read as a universal
            claim about how every person, accent, or speech system will pronounce the name.
          </p>
        </section>

        <section id="help-locking" className="help-section" aria-labelledby="help-locking-title">
          <h2 id="help-locking-title">Locking names</h2>
          <p>
            A lock preserves an identity while compatible generation intent remains unchanged. Generate keeps locked names and
            regenerates the rest; a locked selected name cannot be targeted by reroll until it is unlocked.
          </p>
          <p>
            Changing intent that affects a locked slot—such as its Naming idiom, semantic tuning, identity structure, variation,
            or applicable role shaping—releases that lock rather than silently rebinding the old name to new intent.
          </p>
        </section>

        <section id="help-components" className="help-section" aria-labelledby="help-components-title">
          <h2 id="help-components-title">Generated and composed identity material</h2>
          <p>
            Fiction Cast can build one visible identity from several kinds of material. Generated given, additional, family, or
            place components retain their own sound and spelling evidence. You can inspect those generated components separately.
          </p>
          <p>
            Titles, epithets, initials, particles, and other literals may instead be selected, derived, or composed by Fiction Cast.
            Their presence in the visible identity does not imply that each piece came from the singular generated-name engine or
            has independent generated-name evidence.
          </p>
        </section>
      </div>
    </section>
  );
}
