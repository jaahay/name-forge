import { useState, type FormEvent } from 'react';
import { generateNameResponse } from '../engine/nameResponse';
import type { NameResponse } from '../engine/nameRequest';
import type { StylePackSummary } from '../engine/types';
import { compileGameNpcStyleInput, defaultGameNpcStyleInput, type GameNpcSpellingStyle, type GameNpcStyleInput, type GameNpcTexture } from './gameNpc';
import { NameArtifactInspector } from './NameArtifactInspector';
import type { NamingModePresentation } from './modes';

interface GameNpcViewProps {
  readonly mode: NamingModePresentation;
  readonly stylePacks: StylePackSummary[];
}

function createRandomSeed(): string {
  return `name-forge-npc-${Math.random().toString(36).slice(2, 10)}`;
}

export function generateGameNpcResponse(input: GameNpcStyleInput, stylePackId: string, seed: string): NameResponse {
  return generateNameResponse({
    version: 1,
    mode: 'game-npc',
    criteria: compileGameNpcStyleInput(input),
    random: { seed },
  }, { stylePackId });
}

export function GameNpcView({ mode, stylePacks }: GameNpcViewProps) {
  const defaultStylePackId = stylePacks[0]?.id ?? 'british-literary-fantasy';
  const [input, setInput] = useState<GameNpcStyleInput>(defaultGameNpcStyleInput);
  const [stylePackId, setStylePackId] = useState(defaultStylePackId);
  const [response, setResponse] = useState(() => generateGameNpcResponse(defaultGameNpcStyleInput, defaultStylePackId, 'name-forge-npc-001'));
  const artifact = response.names[0];
  const criteria = compileGameNpcStyleInput(input);

  function updateInput<K extends keyof GameNpcStyleInput>(key: K, value: GameNpcStyleInput[K]) {
    setInput((current) => ({ ...current, [key]: value }));
  }

  function generate(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    setResponse(generateGameNpcResponse(input, stylePackId, createRandomSeed()));
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
          <span>{criteria.clauses.length} active criteria</span>
          <span>Seed {response.random.seed}</span>
        </div>
      </section>

      <section className="workspace workbench">
        <form className="controls configure-tray panel expanded" onSubmit={generate}>
          <div className="configure-summary-copy">
            <p className="eyebrow">Configure NPC name</p>
            <strong>Fast, singular, criteria-driven generation</strong>
            <p className="section-note">Choose only criteria the current engine implements explicitly.</p>
          </div>

          <label>
            Style source
            <select value={stylePackId} onChange={(event) => setStylePackId(event.target.value)}>
              {stylePacks.map((pack) => <option key={pack.id} value={pack.id}>{pack.label}</option>)}
            </select>
          </label>

          <label>
            Spelling style
            <select value={input.spellingStyle} onChange={(event) => updateInput('spellingStyle', event.target.value as GameNpcSpellingStyle)}>
              <option value="plain">Plain</option>
              <option value="balanced">Balanced</option>
              <option value="distinctive">Distinctive</option>
            </select>
          </label>

          <label>
            Sound texture
            <select value={input.texture} onChange={(event) => updateInput('texture', event.target.value as GameNpcTexture)}>
              <option value="balanced">Balanced</option>
              <option value="soft">Soft</option>
              <option value="hard">Hard</option>
              <option value="liquid">Liquid</option>
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
