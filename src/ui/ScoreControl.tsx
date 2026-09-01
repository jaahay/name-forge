import type { FictionCastSemanticControlValue } from '../fictionCast/semanticIntent';
import type { ControlKey, ScoreControlDefinition } from './presentation';

interface ScoreControlProps {
  control: ScoreControlDefinition;
  value: FictionCastSemanticControlValue;
  onChange: (key: ControlKey, value: FictionCastSemanticControlValue) => void;
}

export function ScoreControl({ control, value, onChange }: ScoreControlProps) {
  return (
    <fieldset className="semantic-score-control" title={control.help}>
      <legend>{control.label}</legend>
      <div className="semantic-score-options">
        {control.choices.map((choice, index) => {
          const optionId = `score-${control.key}-${index}`;
          return (
            <label className="semantic-score-option" htmlFor={optionId} key={choice.label}>
              <input
                id={optionId}
                type="radio"
                name={`score-${control.key}`}
                value={choice.value}
                checked={value === choice.value}
                onChange={() => onChange(control.key, choice.value)}
              />
              <span>{choice.label}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
