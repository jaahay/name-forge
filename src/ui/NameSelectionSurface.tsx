import type { ReactNode } from 'react';
import type { GeneratedEnsemble } from '../engine/types';
import { NameCard } from './NameCard';
import { allNamesSelectorValue, selectedNameIdFromView, type NameSelectionView } from './workbenchSelection';

interface NameSelectionSurfaceProps {
  ensemble: GeneratedEnsemble;
  lockedNameIds: Set<string>;
  selection: NameSelectionView;
  selectedNameId: string;
  hasPreviousName: boolean;
  hasNextName: boolean;
  children: ReactNode;
  onSelectName: (id: string) => void;
  onSelectAllNames: () => void;
  onSelectPreviousName: () => void;
  onSelectNextName: () => void;
  onToggleLockedName: (id: string) => void;
}

export function NameSelectionSurface({
  ensemble,
  lockedNameIds,
  selection,
  selectedNameId,
  hasPreviousName,
  hasNextName,
  children,
  onSelectName,
  onSelectAllNames,
  onSelectPreviousName,
  onSelectNextName,
  onToggleLockedName,
}: NameSelectionSurfaceProps) {
  const selectionClassName = selection.kind === 'all-names' ? 'selection-kind-all' : 'selection-kind-name';
  const selectorValue = selectedNameIdFromView(selection) || allNamesSelectorValue;

  function selectValue(value: string) {
    if (value === allNamesSelectorValue) {
      onSelectAllNames();
      return;
    }
    onSelectName(value);
  }

  const nameRail = (
    <section className="roster-panel name-rail panel" aria-label="Name roster">
      <div className="rail-heading">
        <h2>Names</h2>
        <span>{ensemble.names.length} generated</span>
      </div>
      <div className="name-grid" aria-label="Name tiles">
        {ensemble.names.map((name) => (
          <NameCard
            key={name.id}
            name={name}
            isSelected={name.id === selectedNameId}
            isLocked={lockedNameIds.has(name.id)}
            showExpandedSurface={false}
            onSelect={onSelectName}
            onToggleLocked={onToggleLockedName}
          />
        ))}
      </div>
    </section>
  );

  return (
    <div className={`results-layout inspector-rail-layout ${selectionClassName}`}>
      <section className="name-selector-panel panel" aria-label="Name selection">
        <label>
          <span>Name</span>
          <select value={selectorValue} onChange={(event) => selectValue(event.target.value)} aria-label="Selected name">
            <option value={allNamesSelectorValue}>All names</option>
            {ensemble.names.map((name) => <option key={name.id} value={name.id}>{name.name}</option>)}
          </select>
        </label>
        <div className="name-stepper" aria-label="Review names sequentially">
          <button type="button" className="secondary" onClick={onSelectPreviousName} disabled={!hasPreviousName}>Previous</button>
          <button type="button" className="secondary" onClick={onSelectNextName} disabled={!hasNextName}>Next</button>
        </div>
      </section>
      {nameRail}
      {children}
    </div>
  );
}
