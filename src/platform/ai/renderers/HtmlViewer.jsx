const START_BUTTON_PATTERN = /(▶|play|start|commencer|jouer|lancer|démarrer|demarrer)/i

function buildStartPanelGuardScript() {
  return `
<script data-creatia-ui-guard="start-panel">
(() => {
  const startButtonPattern = ${START_BUTTON_PATTERN.toString()};
  const panelSelectors = ['[data-start-panel]', '.start-panel', '.intro-panel', '.welcome-panel', '.menu-panel', 'section', 'article', '.panel', '.card', 'div'];
  const buttons = Array.from(document.querySelectorAll('button, [role="button"], a'));
  const startButtons = buttons.filter((button) => startButtonPattern.test((button.textContent || '').trim()));

  startButtons.forEach((button) => {
    const panel = panelSelectors.map((selector) => button.closest(selector)).find((candidate) => candidate && candidate !== document.body);
    if (!panel || panel.dataset.creatiaStartPanelGuard === 'ready') return;

    panel.dataset.creatiaStartPanelGuard = 'ready';
    panel.classList.add('creatia-start-panel-active');
    button.setAttribute('aria-controls', button.getAttribute('aria-controls') || 'creatia-generated-game');

    button.addEventListener('click', () => {
      window.setTimeout(() => {
        panel.classList.add('creatia-start-panel-hidden');
        panel.setAttribute('aria-hidden', 'true');
      }, 80);
    });
  });
})();
</script>`
}

function buildStartPanelGuardStyle() {
  return `
<style data-creatia-ui-guard="start-panel">
  .creatia-start-panel-active { pointer-events: auto; }
  .creatia-start-panel-active button, .creatia-start-panel-active [role="button"], .creatia-start-panel-active a { pointer-events: auto; }
  .creatia-start-panel-hidden { opacity: 0 !important; pointer-events: none !important; transform: translateY(-10px) scale(0.98); transition: opacity 220ms ease, transform 220ms ease; }
</style>`
}

function withCreatiaUiGuards(html = '') {
  const source = html || '<!doctype html><html><body></body></html>'
  const guard = `${buildStartPanelGuardStyle()}${buildStartPanelGuardScript()}`

  if (source.includes('data-creatia-ui-guard="start-panel"')) return source
  if (/<\/body>/i.test(source)) return source.replace(/<\/body>/i, `${guard}</body>`)
  return `${source}${guard}`
}

export function HtmlViewer({ html, title = 'Page créée', onBack }) {
  return (
    <section className="html-viewer is-fullscreen" aria-label={title}>
      <div className="html-viewer-toolbar">
        <button type="button" className="html-viewer-back" onClick={onBack}>← Retour à Creatia</button>
      </div>
      <iframe
        title={title}
        sandbox="allow-scripts allow-forms allow-pointer-lock allow-popups allow-modals"
        srcDoc={withCreatiaUiGuards(html)}
      />
    </section>
  )
}
