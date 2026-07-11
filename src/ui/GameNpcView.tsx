import { useState, type FormEvent } from 'react';
import { generateNameResponse } from '../engine/nameResponse';
import type { NameArtifact } from '../engine/nameArtifact';
import type { NameResponse } from '../engine/nameRequest';
import type { StylePackSummary } from '../engine/types';
import { compileGameNpcStyleInput, defaultGameNpcStyleInput, type GameNpcFamiliarity, type GameNpcStyleInput, type GameNpcTexture } from './gameNpc';
import type { NamingModePresentation } from './modes';

interface GameNpcViewProps {
  readonly mode: NamingModePresentation;
  readonly stylePacks: StylePackSummary[];
}

function createRandomSeed(): string {
  return `name-forge-npc-${Math.random().toString(36).slice(2, 10)}`;
}

function generateNpc(input: GameNpcStyleInput, stylePackId: string, seed: string): NameResponse {
  return generateNameResponse({
    version: 1,
    mode: 'game-npc',
    criteria: compileGameNpcStyleInput(input),
    random: { seed },
  }, { stylePackId });
}

function copyText(value: string) {
  void navigator.clipboard?.writeText(value);
}

function scoreLabel(value: number): string {
  return `${Math.round(value * 100)}%`;
}

function ArtifactDetails({ artifact }: { readonly artifact: NameArtifact }) {
  const spellingCandidates = artifact.spellingCandidates ?? [];
  const readabilityDiagnostics = artifact.readabilityDiagnostics ?? [];
  const variants = artifact.variants ?? [];

  return (
    <section className="panel artifact-detail-block" aria-label="NPC name details">
      <div className="selected-name-actions" aria-label={`${artifact.displayText} actions`}>
        <button type="button" className="secondary" onClick={() => copyText(artifact.displayText)}>Copy name</button>
        <button type="button" className="secondary" onClick={() => copyText([
          artifact.displayText,
          artifact.sound ? `Sound sketch: ${artifact.sound.transcription}` : undefined,
          artifact.spelling ? `Selected spelling: ${artifact.spelling.text}` : undefined,
        ].filter(Boolean).join('\n'))}>Copy details</button>
      </div>

      <dl className="artifact-fact-list">
        {artifact.sound ? <><dt>Sound</dt><dd>{artifact.sound.transcription}</dd></> : null}
        {artifact.spelling ? <><dt>Selected spelling</dt><dd>{artifact.spelling.text} · rank {artifact.spelling.rank}</dd></> : null}
        <dt>Spelling candidates</dt>
        <dd>{spellingCandidates.length > 0 ? spellingCandidates.map((candidate) => candidate.text).join(', ') : 'None retained'}</dd>
        <dt>Readability</dt>
        <dd>{readabilityDiagnostics.length > 0 ? readabilityDiagnostics.map((diagnostic) => diagnostic.label).join(', ') : 'No read notes'}</dd>
        <dt>Variants</dt>
        <dd>{variants.length > 0 ? variants.map((variant) => variant.value).join(', ') : 'No variants'}</dd>
      </dl>
    </section>
  );
}

export function GameNpcView({ mode, stylePacks }: GameNpcViewProps) {
  const defaultStylePackId = stylePacks[0]?.id ?? 'british-literary-fantasy';
  const [input, setInput] = useState<GameNpcStyleInput>(defaultGameNpcStyleInput);
  const [stylePackId, setStylePackId] = useState(defaultStylePackId);
  const [response, setResponse] = useState(() => generateNpc(defaultGameNpcStyleInput, defaultStylePackId, 'name-forge-npc-001'));
  const artifact = response.names[0];
  const criteria = compileGameNpcStyleInput(input);

  function updateInput<K extends keyof GameNpcStyleInput>(key: K, value: GameNpcStyleInput[K]) {
    setInput((current) => ({ ...current, [key]: value }));
  }

  function generate(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    setResponse(generateNpc(input, stylePackId, createRandomSeed()));
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
            <p className="section-note">Choose only the signals needed during prep or live play.</p>
          </div>

          <label>
            Style source
            <select value={stylePackId} onChange={(event) => setStylePackId(event.target.value)}>
              {stylePacks.map((pack) => <option key={pack.id} value={pack.id}>{pack.label}</option>)}
            </select>
          </label>

          <label>
            Familiarity
            <select value={input.familiarity} onChange={(event) => updateInput('familiarity', event.target.value as GameNpcFamiliarity)}>
              <option value="familiar">Familiar</option>
              <option value="balanced">Balanced</option>
              <option value="strange">Strange</option>
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

          <label>
            Pronounceability · {scoreLabel(input.pronounceability)}
            <input type="range" min="0" max="1" step="0.01" value={input.pronounceability} onChange={(event) => updateInput('pronounceability', Number(event.target.value))} />
          </label>

          <button type="submit" className="primary">{mode.generateLabel}</button>
        </form>

        <section className="output" aria-live="polite">
          <section className="panel selected-name-panel">
            <p className="eyebrow">Current NPC name</p>
            <h2>{artifact?.displayText ?? 'No name generated'}</h2>
            <p className="section-note">Reroll keeps the configured criteria and resolves a fresh seed.</p>
            <button type="button" className="primary" onClick={() => generate()}>{mode.generateLabel}</button>
          </section>
          {artifact ? <ArtifactDetails artifact={artifact} /> : null}
        </section>
      </section>
    </>
  );
}
