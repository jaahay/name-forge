import type { GeneratedEnsemble, RarityBand } from '../engine/types';

type CastHealthTone = 'good' | 'warn';

interface CastHealthItem {
  id: string;
  tone: CastHealthTone;
  label: string;
  detail: string;
}

interface CastHealthPanelProps {
  ensemble: GeneratedEnsemble;
  lockedNameIds: Set<string>;
}

const spotlightRarityBands: RarityBand[] = ['rare', 'epic', 'legendary'];

function castHealthFor(ensemble: GeneratedEnsemble, lockedNameIds: Set<string>): CastHealthItem[] {
  const names = ensemble.names;
  const spotlightCount = names.filter((name) => spotlightRarityBands.includes(name.silhouette.rarityBand)).length;
  const groundedCount = names.length - spotlightCount;
  const spotlightBudget = Math.max(1, Math.ceil(names.length * 0.33));
  const initialIssueCount = ensemble.diagnostics.repeatedInitials;
  const endingIssueCount = ensemble.diagnostics.repeatedEndings;
  const cadenceIssueCount = ensemble.diagnostics.repeatedCadences;
  const readIssueCount = ensemble.diagnostics.readabilityIssues;
  const readWarningCount = ensemble.diagnostics.readabilityWarnings;
  const lockedCount = lockedNameIds.size;

  return [
    {
      id: 'spotlight-budget',
      tone: spotlightCount <= spotlightBudget ? 'good' : 'warn',
      label: spotlightCount <= spotlightBudget ? 'Spotlight budget held' : 'Spotlight budget crowded',
      detail: `${groundedCount} grounded names and ${spotlightCount} rare+ names; aim for ${spotlightBudget} or fewer spotlight names in this cast.`,
    },
    {
      id: 'initials',
      tone: initialIssueCount === 0 ? 'good' : 'warn',
      label: initialIssueCount === 0 ? 'Distinct initials' : 'Repeated initials',
      detail: initialIssueCount === 0 ? 'First-letter scan is clean across the roster.' : `${initialIssueCount} initial pattern${initialIssueCount === 1 ? '' : 's'} may blur at the table.`,
    },
    {
      id: 'endings',
      tone: endingIssueCount === 0 ? 'good' : 'warn',
      label: endingIssueCount === 0 ? 'Distinct endings' : 'Repeated endings',
      detail: endingIssueCount === 0 ? 'Terminal sounds are separated enough for table recall.' : `${endingIssueCount} ending pattern${endingIssueCount === 1 ? '' : 's'} repeat across the cast.`,
    },
    {
      id: 'cadence',
      tone: cadenceIssueCount <= 1 ? 'good' : 'warn',
      label: cadenceIssueCount <= 1 ? 'Rhythm variety' : 'Cadence cluster',
      detail: cadenceIssueCount <= 1 ? 'Cadences vary enough to keep names distinct.' : `${cadenceIssueCount} cadence repeats may make the cast feel samey.`,
    },
    {
      id: 'readability',
      tone: readWarningCount === 0 ? 'good' : 'warn',
      label: readWarningCount === 0 ? 'Read notes clear' : 'Readability friction',
      detail: readIssueCount === 0 ? 'No deterministic read-friction notes across this cast.' : ensemble.diagnostics.readabilitySummary,
    },
    {
      id: 'locks',
      tone: 'good',
      label: lockedCount > 0 ? `${lockedCount} locked` : 'No locks yet',
      detail: lockedCount > 0 ? 'Generate will preserve locked keepers and replace the rest.' : 'Lock keepers before rerolling to build a stronger final roster.',
    },
  ];
}

export function CastHealthPanel({ ensemble, lockedNameIds }: CastHealthPanelProps) {
  const healthItems = castHealthFor(ensemble, lockedNameIds);

  return (
    <section className="cast-health" aria-label="Cast health">
      <div className="cast-health-heading">
        <h2>Cast health</h2>
        <p>Table-read checks for spotlight, sound overlap, readability, and roster memory.</p>
      </div>
      <ul className="cast-health-list">
        {healthItems.map((item) => (
          <li key={item.id} className={`cast-health-item ${item.tone}`}>
            <span className="cast-health-status" aria-hidden="true">{item.tone === 'good' ? '✓' : '⚠'}</span>
            <span><strong>{item.label}</strong>{item.detail}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
