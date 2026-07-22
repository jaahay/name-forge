import { useState, type FormEvent } from 'react';
import { generateNameResponse } from '../engine/nameResponse';
import type { NameResponse } from '../engine/nameRequest';
import type { NameArtifact } from '../engine/nameArtifact';
import type { StylePackSummary } from '../engine/types';
import { NameArtifactInspector } from './NameArtifactInspector';
import type { NamingModePresentation } from './modes';

interface GameNpcViewProps {
  readonly mode: NamingModePresentation;
  readonly stylePacks: StylePackSummary[];
  readonly onGenerated?: (artifacts: readonly NameArtifact[], context: { readonly mode: string; readonly seed: string }) => void;
}

function createRandomSeed(): string {
  return `name-forge-npc-${Math.random().toString(36).slice(2, 10)}`;
}

export function generateGameNpcResponse(stylePackId: string, seed: string): NameResponse {
  return generateNameResponse({
    version: 1,
    mode: 'game-npc',
    criteria: {
      clauses: [
        {
          id: 'game-npc-single-name',
          family: 'practical',
          polarity: 'require',
          target: 'single-name',
          strength: 1,
        },
      ],
    },
    random: { seed },
  }, { stylePackId });
}

export function GameNpcView({ mode, stylePacks, onGenerated }: GameNpcViewProps) {
  const defaultStylePackId = stylePacks[0]?.id ?? 'british-literary-fantasy';
  const [stylePackId, setStylePackId] = useState(defaultStylePackId);
  const [response, setResponse] = useState(() => generateGameNpcResponse(defaultStylePackId, 'name-forge-npc-001'));
  const artifact = response.names[0];

  function generate(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    const nextResponse = generateGameNpcResponse(stylePackId, createRandomSeed());
    setResponse(nextResponse);
    onGenerated?.(nextResponse.names, { mode: 'game-npc', seed: nextResponse.random.seed });
  }

  return (
    <>
      <section className="hero panel app-header">
        <div>
          <h1>{mode.label}</h1>
          <p className="hero-copy">{mode.heroCopy}</p>
        </div>
        <div className="hero-stats" aria-label="NPC generation summary">
          <span>1 name</span>
          <span>Deterministic by seed</span>
          <span>Seed {response.random.seed}</span>
        </div>
      </section>

      <section className="workspace workbench">
        <form className="controls configure-tray panel expanded" onSubmit={generate}>
          <div className="configure-summary-copy">
            <p className="eyebrow">Generate NPC name</p>
            <strong>One generated name, fully inspectable and reproducible</strong>
            <p className="section-note">Choose the source model, then copy, inspect, or reroll the result.</p>
          </div>

          <label>
            Style source
            <select value={stylePackId} onChange={(event) => setStylePackId(event.target.value)}>
              {stylePacks.map((pack) => <option key={pack.id} value={pack.id}>{pack.label}</option>)}
            </select>
          </label>

          <button type="submit" className="primary">{mode.generateLabel}</button>
        </form>

        <section className="output" aria-live="polite">
          {artifact ? (
            <NameArtifactInspector
              artifact={artifact}
              eyebrow={mode.outputHeading}
              extraActions={<button type="button" className="primary" onClick={() => generate()}>{mode.generateLabel}</button>}
            />
          ) : <div className="empty-state panel">Generate an NPC name.</div>}
        </section>
      </section>
    </>
  );
}