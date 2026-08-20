import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
  type WheelEvent,
} from 'react';
import type { FictionCastGeneratedEnsemble } from '../fictionCast/types';

interface NameSelectionSurfaceProps {
  ensemble: FictionCastGeneratedEnsemble;
  lockedNameIds: Set<string>;
  selectedNameId: string;
  children: ReactNode;
  onSelectName: (id: string) => void;
}

interface NameRailOverflowState {
  before: boolean;
  after: boolean;
}

export function nameRailTargetIndex(key: string, currentIndex: number, count: number): number | undefined {
  if (count <= 0 || currentIndex < 0 || currentIndex >= count) return undefined;

  switch (key) {
    case 'ArrowLeft':
      return (currentIndex - 1 + count) % count;
    case 'ArrowRight':
      return (currentIndex + 1) % count;
    case 'Home':
      return 0;
    case 'End':
      return count - 1;
    default:
      return undefined;
  }
}

export function nameRailWheelDelta(
  deltaX: number,
  deltaY: number,
  scrollLeft: number,
  scrollWidth: number,
  clientWidth: number,
): number | undefined {
  if (Math.abs(deltaX) >= Math.abs(deltaY) || deltaY === 0) return undefined;

  const maxScrollLeft = Math.max(0, scrollWidth - clientWidth);
  if (maxScrollLeft === 0) return undefined;
  if (deltaY < 0 && scrollLeft <= 0) return undefined;
  if (deltaY > 0 && scrollLeft >= maxScrollLeft) return undefined;

  return deltaY;
}

export function NameSelectionSurface({
  ensemble,
  lockedNameIds,
  selectedNameId,
  children,
  onSelectName,
}: NameSelectionSurfaceProps) {
  const tabRefs = useRef(new Map<string, HTMLButtonElement>());
  const railRef = useRef<HTMLDivElement>(null);
  const [railOverflow, setRailOverflow] = useState<NameRailOverflowState>({ before: false, after: false });

  const updateRailOverflow = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;

    const maxScrollLeft = Math.max(0, rail.scrollWidth - rail.clientWidth);
    const next = {
      before: rail.scrollLeft > 1,
      after: rail.scrollLeft < maxScrollLeft - 1,
    };

    setRailOverflow((current) =>
      current.before === next.before && current.after === next.after ? current : next,
    );
  }, []);

  useEffect(() => {
    tabRefs.current.get(selectedNameId)?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    updateRailOverflow();
  }, [selectedNameId, updateRailOverflow]);

  useEffect(() => {
    updateRailOverflow();
    window.addEventListener('resize', updateRailOverflow);
    return () => window.removeEventListener('resize', updateRailOverflow);
  }, [ensemble.names.length, updateRailOverflow]);

  function handleRailKeyDown(event: KeyboardEvent<HTMLButtonElement>, currentIndex: number) {
    const targetIndex = nameRailTargetIndex(event.key, currentIndex, ensemble.names.length);
    if (targetIndex === undefined) return;

    const targetName = ensemble.names[targetIndex];
    if (!targetName) return;

    event.preventDefault();
    onSelectName(targetName.id);
    const targetTab = tabRefs.current.get(targetName.id);
    targetTab?.focus({ preventScroll: true });
    targetTab?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }

  function handleRailWheel(event: WheelEvent<HTMLDivElement>) {
    const rail = event.currentTarget;
    const delta = nameRailWheelDelta(
      event.deltaX,
      event.deltaY,
      rail.scrollLeft,
      rail.scrollWidth,
      rail.clientWidth,
    );
    if (delta === undefined) return;

    event.preventDefault();
    rail.scrollLeft += delta;
    updateRailOverflow();
  }

  const activeTabId = selectedNameId ? `name-rail-tab-${selectedNameId}` : undefined;

  return (
    <div className="results-layout inspector-rail-layout">
      <div className="cast-workbench-surface panel">
        <section className="adaptive-name-rail" aria-labelledby="adaptive-name-rail-title">
          <div className="rail-heading adaptive-name-rail-heading">
            <h2 id="adaptive-name-rail-title">Names</h2>
            <span>{ensemble.names.length} generated</span>
          </div>
          <div
            ref={railRef}
            className="adaptive-name-rail-scroll"
            role="tablist"
            aria-label="Generated cast"
            aria-orientation="horizontal"
            data-overflow-before={railOverflow.before ? 'true' : 'false'}
            data-overflow-after={railOverflow.after ? 'true' : 'false'}
            onScroll={updateRailOverflow}
            onWheel={handleRailWheel}
          >
            {ensemble.names.map((name, index) => {
              const isSelected = name.id === selectedNameId;
              const isLocked = lockedNameIds.has(name.id);
              const accessibleLabel = isLocked ? `${name.displayName}, locked` : name.displayName;

              return (
                <button
                  key={name.id}
                  ref={(element) => {
                    if (element) tabRefs.current.set(name.id, element);
                    else tabRefs.current.delete(name.id);
                  }}
                  id={`name-rail-tab-${name.id}`}
                  type="button"
                  role="tab"
                  className="adaptive-name-tab"
                  aria-selected={isSelected}
                  aria-controls="active-name-workspace"
                  aria-label={accessibleLabel}
                  data-locked={isLocked ? 'true' : 'false'}
                  tabIndex={isSelected ? 0 : -1}
                  title={name.displayName}
                  onClick={() => onSelectName(name.id)}
                  onKeyDown={(event) => handleRailKeyDown(event, index)}
                >
                  <span className="adaptive-name-tab-label">{name.displayName}</span>
                  {isLocked ? <span className="adaptive-name-lock-marker" aria-hidden="true" /> : null}
                </button>
              );
            })}
          </div>
        </section>
        <div
          id="active-name-workspace"
          className="cast-workbench-inspector"
          role="tabpanel"
          aria-labelledby={activeTabId}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
