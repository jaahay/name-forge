interface AboutViewProps {
  authorSiteUrl: string;
}

export function AboutView({ authorSiteUrl }: AboutViewProps) {
  return (
    <section className="about panel" aria-labelledby="about-title">
      <div className="about-heading">
        <p className="eyebrow">About</p>
        <h1 id="about-title">What Name Forge does</h1>
        <p>
          Name Forge is a cast-aware name generator. It creates a set of names together, then scores
          each result for usability, fit, shape, and ensemble balance.
        </p>
      </div>
      <div className="about-grid">
        <article>
          <h2>Controls shape the search</h2>
          <p>Use style presets, seed, cast size, and score sliders to steer the generator without hand-writing every result.</p>
        </article>
        <article>
          <h2>Cards explain the result</h2>
          <p>Each card shows score breakdowns, rarity, rhythm, texture, spelling variants, and an optional source trace.</p>
        </article>
        <article>
          <h2>About the author</h2>
          <p>Name Forge is made by <a href={authorSiteUrl} target="_blank" rel="noreferrer">James Hay</a>.</p>
        </article>
      </div>
    </section>
  );
}
