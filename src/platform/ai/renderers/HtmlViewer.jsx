export function HtmlViewer({ html, title = 'Application HTML générée' }) {
  return (
    <section className="html-viewer" aria-label={title}>
      <iframe
        title={title}
        sandbox="allow-scripts allow-forms allow-pointer-lock allow-popups allow-modals"
        srcDoc={html || '<!doctype html><html><body></body></html>'}
      />
    </section>
  )
}
