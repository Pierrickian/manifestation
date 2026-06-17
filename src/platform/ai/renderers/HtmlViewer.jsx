export function HtmlViewer({ html, title = 'Page créée', onBack }) {
  return (
    <section className="html-viewer is-fullscreen" aria-label={title}>
      <div className="html-viewer-toolbar">
        <button type="button" className="html-viewer-back" onClick={onBack}>← Retour à IAview</button>
      </div>
      <iframe
        title={title}
        sandbox="allow-scripts allow-forms allow-pointer-lock allow-popups allow-modals"
        srcDoc={html || '<!doctype html><html><body></body></html>'}
      />
    </section>
  )
}
