import { findFictionCastCollisionNotes } from '../fictionCast/ensembleCollisionNotes';
import type { FictionCastGeneratedName } from '../fictionCast/types';

interface CastNotesProps {
  names: readonly FictionCastGeneratedName[];
  onSelectName: (id: string) => void;
}

function noteLabel(kind: ReturnType<typeof findFictionCastCollisionNotes>[number]['kind'], value: string): string {
  if (kind === 'same-visible-identity') return 'Same visible identity';
  return `Shared ending “${value}”`;
}

export function CastNotes({ names, onSelectName }: CastNotesProps) {
  const notes = findFictionCastCollisionNotes(names);
  if (notes.length === 0) return null;

  return (
    <details className="cast-notes" aria-label="Cast notes">
      <summary>
        <span>Cast notes</span>
        <small>{notes.length} {notes.length === 1 ? 'note' : 'notes'}</small>
      </summary>
      <div className="cast-notes-body">
        <ul className="cast-note-list">
          {notes.map((note) => (
            <li className="cast-note" key={note.id}>
              <strong>{noteLabel(note.kind, note.value)}</strong>
              <div className="cast-note-members">
                {note.members.map((member) => (
                  <button
                    key={member.id}
                    type="button"
                    className="cast-note-member"
                    aria-label={`Inspect ${member.displayName} from cast notes`}
                    onClick={() => onSelectName(member.id)}
                  >
                    {member.displayName}
                  </button>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </details>
  );
}
