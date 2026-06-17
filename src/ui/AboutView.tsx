import { scoreControls } from './presentation';

interface AboutViewProps {
  authorSiteUrl: string;
}

const dialExamples: Record<string, string> = {
  novelty: 'Low novelty keeps names familiar; high novelty can move a cast from "Merryn" toward rarer shapes with less common sounds.',
  pronounceability: 'Low pronounceability allows chunkier clusters; high pronounceability prefers open syllables and fewer tongue-twisters.',
  memorability: 'Low memorability permits longer, softer blends; high memorability favors compact names with a clearer beat and stronger cast distinction.',
  culturalAnchoring: 'Low anchoring wanders away from the preset; high anchoring leans harder on curated examples and preferred endings from the selected style pack.',
  orthographicWeirdness: 'Low weirdness keeps spelling plain; high weirdness allows stranger letters and more aggressive spelling variants while still tracking naturalness separately.',
};

export function AboutView({ authorSiteUrl }: AboutViewProps) {
  return (
    <section className="about panel" aria-labelledby="about-title">
      <div className="about-heading">
        <p className="eyebrow">About</p>
        <h1 id="about-title">What Name Forge does</h1>
        <p>
          Name Forge is a cast-aware name generator. It creates names as a set, then explains how each
          result fits the selected style, shape, rhythm, spelling, and ensemble.
        </p>
      </div>

      <div className="about-grid">
        <article>
          <h2>Controls shape the search</h2>
          <p>Style preset, seed, cast size, and dials steer the generator without hand-writing every result.</p>
        </article>
        <article>
          <h2>Cards explain the result</h2>
          <p>Each card shows a fit band, score breakdowns, rarity, rhythm, texture, spelling variants, and source trace.</p>
        </article>
        <article>
          <h2>About the author</h2>
          <p>Name Forge is made by <a href={authorSiteUrl} target="_blank" rel="noreferrer">James Hay</a>.</p>
        </article>
      </div>

      <section className="about-section" aria-labelledby="dial-title">
        <h2 id="dial-title">What the dials mean</h2>
        <p>
          The dials are creative pressure controls. They change what kinds of names Name Forge tries and which
          finished names it prefers. The score components still describe the name itself; the overall fit score
          says how well that selected name matches your current dial settings.
        </p>
        <ul className="dial-list">
          <li>
            <h3>Cast size</h3>
            <p>How many names to generate together. Larger casts increase ensemble pressure so names do not all start, end, or sound alike.</p>
            <small>Example: a cast of 4 can stay tight; a cast of 12 needs more variety.</small>
          </li>
          <li>
            <h3>Style preset</h3>
            <p>The source pack for sounds, endings, curated examples, rarity, and style labels.</p>
            <small>Example: the British literary fantasy preset favors bookish, folktale-adjacent textures.</small>
          </li>
          <li>
            <h3>Seed</h3>
            <p>The repeat button for randomness. Reusing the same seed and settings should reproduce the same cast.</p>
            <small>Example: save a seed when a cast is close, then adjust one dial at a time.</small>
          </li>
          {scoreControls.map((control) => (
            <li key={control.key}>
              <h3>{control.label}</h3>
              <p>{control.help}</p>
              <small>{dialExamples[control.key]}</small>
            </li>
          ))}
        </ul>
      </section>

      <section className="about-section" aria-labelledby="score-title">
        <h2 id="score-title">Why scores often land in the 80s</h2>
        <p>
          The card score is <strong>Overall fit</strong>, not a school grade and not a percentile. For each spot in the
          cast, Name Forge tries several possible names, scores them, and shows the strongest fit. Because lower-scoring
          options are left out, visible names often cluster around strong-fit numbers such as the 70s and 80s.
        </p>
        <p>
          Use the number as a quick ranking signal, then read the band and score breakdown. An 83 means "strong fit for
          the current dials," not "83 percent objectively good."
        </p>
      </section>
    </section>
  );
}
