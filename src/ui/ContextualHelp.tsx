import type { ReactNode } from 'react';

interface ContextualHelpProps {
  readonly id: string;
  readonly label: string;
  readonly children: ReactNode;
}

export function ContextualHelp({ id, label, children }: ContextualHelpProps) {
  const contentId = `${id}-content`;

  return (
    <details className="contextual-help">
      <summary aria-label={`About ${label}`} aria-controls={contentId}>
        <span className="contextual-help-glyph" aria-hidden="true">i</span>
      </summary>
      <div id={contentId} className="contextual-help-body" role="note">
        {children}
      </div>
    </details>
  );
}
