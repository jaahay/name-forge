interface ExportMenuProps {
  jsonExport: string;
  markdownExport: string;
}

function exportHref(mimeType: string, value: string): string {
  return 'data:' + mimeType + ';charset=utf-8,' + encodeURIComponent(value);
}

function copyExport(value: string) {
  void navigator.clipboard?.writeText(value);
}

export function ExportMenu({ jsonExport, markdownExport }: ExportMenuProps) {
  return (
    <details className="save-menu panel">
      <summary>Export</summary>
      <div className="save-menu-content" aria-label="Export cast">
        <div className="save-group" aria-label="Save files">
          <span className="save-group-label">Save</span>
          <a className="export-link" download="name-forge-cast.json" href={exportHref('application/json', jsonExport)}>JSON</a>
          <a className="export-link" download="name-forge-cast.md" href={exportHref('text/markdown', markdownExport)}>Markdown</a>
        </div>
        <div className="save-group" aria-label="Copy cast">
          <span className="save-group-label">Copy</span>
          <button type="button" className="secondary" aria-label="Copy JSON" onClick={() => copyExport(jsonExport)}>JSON</button>
          <button type="button" className="secondary" aria-label="Copy Markdown" onClick={() => copyExport(markdownExport)}>Markdown</button>
        </div>
      </div>
    </details>
  );
}
