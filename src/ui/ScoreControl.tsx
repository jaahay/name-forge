import type { ControlKey } from './presentation';
import { scoreAnchors } from './presentation';
import { clampScore, formatScore, scoreFromPercent } from './score';

interface ScoreControlProps {
  control: {
    key: ControlKey;
    label: string;
    help: string;
  };
  value: number;
  onChange: (key: ControlKey, value: number) => void;
  onRandomize: (key: ControlKey) => void;
}

export function ScoreControl({ control, value, onChange, onRandomize }: ScoreControlProps) {
  const sliderId = `${control.key}-slider`;

  return (
    <label className="slider" title={control.help} htmlFor={sliderId}>
      <span className="slider-heading">
        <span>{control.label}</span>
        <span className="slider-tools">
          <input
            className="slider-value"
            type="number"
            min="0"
            max="100"
            step="1"
            value={formatScore(value)}
            aria-label={`${control.label} value`}
            onChange={(event) => onChange(control.key, scoreFromPercent(event.target.value))}
          />
          <button
            type="button"
            className="anchor-button"
            aria-label={`Randomize ${control.label}`}
            title={`Randomize ${control.label}`}
            onClick={() => onRandomize(control.key)}
          >{'\u21bb Random'}</button>
        </span>
      </span>
      <input
        id={sliderId}
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={value}
        list={`${sliderId}-anchors`}
        onChange={(event) => onChange(control.key, clampScore(Number(event.target.value)))}
      />
      <datalist id={`${sliderId}-anchors`}>
        {scoreAnchors.map((anchor) => <option key={anchor} value={anchor} />)}
      </datalist>
      <div className="slider-anchors" aria-label={`${control.label} anchor values`}>
        {scoreAnchors.map((anchor) => (
          <button type="button" className="anchor-button" key={anchor} onClick={() => onChange(control.key, anchor)}>{formatScore(anchor)}</button>
        ))}
      </div>
      <small>{control.help}</small>
    </label>
  );
}
