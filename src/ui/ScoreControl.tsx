import { closestScoreChoice, type ControlKey, type ScoreControlDefinition } from './presentation';

interface ScoreControlProps {
  control: ScoreControlDefinition;
  value: number;
  onChange: (key: ControlKey, value: number) => void;
}

export function ScoreControl({ control, value, onChange }: ScoreControlProps) {
  const selectedChoice = closestScoreChoice(control, value);

  return (
    <label title={control.help}>
      <span>{control.label}</span>
      <select
        value={String(selectedChoice.value)}
        onChange={(event) => onChange(control.key, Number(event.target.value))}
      >
        {control.choices.map((choice) => (
          <option key={choice.label} value={String(choice.value)}>{choice.label}</option>
        ))}
      </select>
    </label>
  );
}
