import { analyzeNameArtifactSoundRelationships } from '../engine/nameArtifactAnalysis';
import { toFictionCastPrimaryNameArtifact } from '../fictionCast/nameArtifact';
import type { FictionCastGeneratedEnsemble } from '../fictionCast/types';
import type { FictionCastRarityBand } from '../fictionCast/rarity';
import { SoundRelationshipsPanel } from './SoundRelationshipsPanel';

type CastHealthTone = 'good' | 'warn';

interface CastHealthItem {
  id: string;
  tone: CastHealthTone;
  label: string;
  detail: string;
}

interface CastHealthPanelProps {
  ensemble: FictionCastGeneratedEnsemble;
  lockedNameIds: Set<string>;
  onSelectName: (id: string) => void;
}

const spotlightRarityBands: FictionCastRarityBand[] = ['rare', 'epic', 'legendary'];

function castHealthFor(ensemble: FictionCastGeneratedEnsemble, lockedNameIds: Set<string>): CastHealthItem[] {
  const names = ensemble.names;
  const spotlightCount = names.filter((name) => spotlightRarityBands.includes(name.rarityBand)).length;
  const groundedCount = names.length - spotlightCount;
  const spotlightBudget = Math.max(1, Math.ceil(names.length * 0.33));
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

function relationshipPairCount(relationships: ReturnType<typeof analyzeNameArtifactSoundRelationships>): number {
  return new Set(relationships.map((relationship) => JSON.stringify(relationship.artifactIds))).size;
}

export function CastHealthPanel({ ensemble, lockedNameIds, onSelectName }: CastHealthPanelProps) {
  const warningItems = castHealthFor(ensemble, lockedNameIds).filter((item) => item.tone === 'warn');
  // Compare the explicit primary sound-backed names while retaining Cast ids for relationship navigation.
  const soundRelationships = analyzeNameArtifactSoundRelationships(ensemble.names.map(toFictionCastPrimaryNameArtifact));
  const pairCount = relationshipPairCount(soundRelationships);

  return (
    <details className="cast-review" aria-label="Cast review">
      <summary>
        <span>Cast review</span>
        <small>
          {warningItems.length} {warningItems.length === 1 ? 'note' : 'notes'} · {pairCount} sound {pairCount === 1 ? 'pair' : 'pairs'}
        </small>
      </summary>
      <div className="cast-review-body">
        {warningItems.length > 0 ? (
          <section className="cast-review-notes" aria-label="Cast notes">
            <h2>Cast notes</h2>
            <ul className="cast-health-list">
              {warningItems.map((item) => (
                <li key={item.id} className="cast-health-item warn">
                  <span className="cast-health-status" aria-hidden="true">⚠</span>
                  <span><strong>{item.label}</strong>{item.detail}</span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
        <SoundRelationshipsPanel relationships={soundRelationships} onSelectName={onSelectName} />
      </div>
    </details>
  );
}
