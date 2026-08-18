import { useState } from 'react';
import type { NameHistoryEntry } from '../engine/nameHistory';
import { NameArtifactInspector } from './NameArtifactInspector';

interface RecentNamesViewProps {
  readonly entries: readonly NameHistoryEntry[];
  readonly onClear: () => void;
}

function modeLabel(mode: string): string {
  if (mode === 'fiction-cast') return 'Fiction Cast';
  if (mode === 'game-npc') return 'Game NPC';
  return mode;
}

export function RecentNamesView({ entries, onClear }: RecentNamesViewProps) {
  const [selectedEntryId, setSelectedEntryId] = useState(entries[0]?.id ?? '');
  const selectedEntry = entries.find((entry) => entry.id === selectedEntryId) ?? entries[0];

  return (
    <section className="recent-names" aria-labelledby="recent-names-title">
      <header className="hero panel app-header">
        <div>
          <p className="eyebrow">Local history</p>
          <h1 id="recent-names-title">Recent names</h1>
          <p className="hero-copy">Restore and inspect names saved from explicit generation actions on this browser.</p>
        </div>
        <div className="hero-stats">
          <span>{entries.length} saved</span>
          <button type="button" className="secondary" disabled={entries.length === 0} onClick={onClear}>Clear history</button>
        </div>
      </header>

      {entries.length === 0 ? (
        <div className="empty-state panel">Generate a cast or NPC name to build local history.</div>
      ) : (
        <section className="recent-names-layout">
          <aside className="recent-names-list panel" aria-label="Recent generated names">
            {entries.map((entry) => (
              <button
                key={entry.id}
                type="button"
                className={entry.id === selectedEntry?.id ? 'recent-name-button active' : 'recent-name-button'}
                onClick={() => setSelectedEntryId(entry.id)}
              >
                <strong>{entry.artifact.spelling.text}</strong>
                <span>{modeLabel(entry.mode)}</span>
                <small>Seed {entry.seed}</small>
              </button>
            ))}
          </aside>

          {selectedEntry ? (
            <NameArtifactInspector
              artifact={selectedEntry.artifact}
              eyebrow={`Saved from ${modeLabel(selectedEntry.mode)}`}
              extraSections={<p className="section-note">Restored from local history without regenerating. Seed: {selectedEntry.seed}</p>}
            />
          ) : null}
        </section>
      )}
    </section>
  );
}
