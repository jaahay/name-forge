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
          Name Forge is a cast-aware name workbench. It creates names as a set, then explains how each
          result fits the selected style, shape, role, rarity, rhythm, spelling, and ensemble.
        </p>
      </div>

      <div className="about-grid">
        <article>
          <h2>Controls shape the search</h2>
          <p>Basics set the cast, Fiction controls shape role metadata, and Rarity & scoring dials tune the search pressure.</p>
        </article>
        <article>
          <h2>Cards adapt to the task</h2>
          <p>Basic, Brief, and Detail density modes change how much each card shows while keeping every card expandable for inspection.</p>
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
          finished names it prefers. The score components still describe the name itself; the hidden overall fit
          score helps choose names that match your current settings.
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
          <li>
            <h3>Cast role mix</h3>
            <p>A fiction-cast structure that labels slots as protagonist, rival, mentor, sidekick, and related roles.</p>
            <small>Slot overrides can customize individual positions without changing the whole role mix.</small>
          </li>
          <li>
            <h3>Rarity distribution</h3>
            <p>A cast-level rarity plan, separate from novelty, for deciding how grounded or mythic the ensemble should feel.</p>
            <small>Example: a mythic arc can deliberately move from common names toward legendary ones.</small>
          </li>
          <li>
            <h3>Card detail</h3>
            <p>The browsing density for generated cards. Basic scans quickly, Brief is the default reading view, and Detail reveals diagnostics.</p>
            <small>Changing card detail does not regenerate names; it only changes presentation.</small>
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
        <h2 id="score-title">What the diagnostic scores are for</h2>
        <p>
          The numbers inside Detail mode are diagnostics, not grades and not percentiles. They explain why the generator
          picked a name and help compare close alternatives when you are tuning the dials.
        </p>
        <p>
          Since Name Forge already leaves out lower-scoring options, the visible numbers often cluster together.
          That is why the collapsed card focuses on concrete traits instead of a headline score.
        </p>
      </section>
    </section>
  );
}
