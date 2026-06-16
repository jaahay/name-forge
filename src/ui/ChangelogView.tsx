import { changelogEntries } from './presentation';

interface ChangelogViewProps {
  commitHistoryUrl: string;
}

export function ChangelogView({ commitHistoryUrl }: ChangelogViewProps) {
  return (
    <section className="changelog panel" aria-labelledby="changelog-title">
      <div className="changelog-heading">
        <div>
          <p className="eyebrow">Changelog</p>
          <h1 id="changelog-title">What changed in Name Forge</h1>
        </div>
        <p>Recent changes, grouped by what they mean for the product.</p>
      </div>
      <ol className="changelog-list">
        {changelogEntries.map((entry) => (
          <li key={entry.title}>
            <div className="changelog-entry-header">
              <h2>{entry.title}</h2>
            </div>
            <p>{entry.summary}</p>
            <ul>
              {entry.changes.map((change) => <li key={change}>{change}</li>)}
            </ul>
          </li>
        ))}
      </ol>
      <a className="history-link" href={commitHistoryUrl} target="_blank" rel="noreferrer">View full commit history</a>
    </section>
  );
}
