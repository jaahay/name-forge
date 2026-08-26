interface AboutViewProps {
  authorSiteUrl: string;
}

export function AboutView({ authorSiteUrl }: AboutViewProps) {
  return (
    <section className="about panel" aria-labelledby="about-title">
      <div className="about-heading">
        <p className="eyebrow">About</p>
        <h1 id="about-title">About Name Forge</h1>
        <p>
          Name Forge is a multi-mode random-name workbench for generating names that are usable, tunable,
          reproducible, and inspectable. Different naming tasks can build on the same generation foundation
          without being forced into the same workflow.
        </p>
      </div>

      <div className="about-grid">
        <article>
          <h2>Fiction Cast</h2>
          <p>Generate and refine a coherent but distinct ensemble of fictional character identities.</p>
        </article>
        <article>
          <h2>Game NPC</h2>
          <p>Generate one inspectable name quickly for preparation or live play.</p>
        </article>
        <article>
          <h2>About the author</h2>
          <p>Name Forge is made by <a href={authorSiteUrl} target="_blank" rel="noreferrer">James Hay</a>.</p>
        </article>
      </div>

      <section className="about-section" aria-labelledby="approach-title">
        <h2 id="approach-title">How Name Forge approaches names</h2>
        <p>
          Names are generated from explicit settings and deterministic randomness. Sound, spelling, alternatives,
          and other generated evidence remain available for inspection.
        </p>
        <p>
          Each naming mode owns what it builds around those generated names. Fiction Cast can compose several
          generated components into a character identity, while Game NPC keeps a singular generated name as its result.
        </p>
      </section>

      <section className="about-section" aria-labelledby="evidence-title">
        <h2 id="evidence-title">Generated evidence, not human claims</h2>
        <p>
          Name Forge distinguishes generated or modeled evidence from claims about how people will perceive a name.
          Readability observations, spelling relationships, and modeled sound relationships can support inspection;
          memorability, cultural authenticity, beauty, and realism are not treated as objective facts.
        </p>
      </section>

      <section className="about-section" aria-labelledby="scope-title">
        <h2 id="scope-title">Scope</h2>
        <p>Name Forge is about naming. It is not a character generator, biography generator, or general writing assistant.</p>
      </section>
    </section>
  );
}
