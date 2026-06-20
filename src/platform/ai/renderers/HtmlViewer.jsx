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
  html, body { overscroll-behavior-y: contain; }
  .creatia-start-panel-active { pointer-events: auto; }
  .creatia-start-panel-active button, .creatia-start-panel-active [role="button"], .creatia-start-panel-active a { pointer-events: auto; }
  .creatia-start-panel-hidden { opacity: 0 !important; pointer-events: none !important; transform: translateY(-10px) scale(0.98); transition: opacity 220ms ease, transform 220ms ease; }
</style>`
}


function buildCreatiaRuntimeBridge() {
  return `
<script data-creatia-runtime-bridge="parent-provider">
(() => {
  if (window.__creatiaRuntimeBridgeReady) return;
  window.__creatiaRuntimeBridgeReady = true;

  const CONNECTED_STATUS_TEXT = 'Runtime: connecté';
  const disconnectedRuntimeLabels = [
    /runtime\s*:\s*(indisponible|attendu|en attente|non disponible)/i,
    /runtime\s+ai\s+indisponible\s+localement/i,
    /runtime\s+indisponible/i,
    /runtime\s+attendu/i,
    /ai\s+runtime\s+unavailable/i,
    /runtime\s*:\s*(unavailable|waiting|pending)/i
  ];

  const diagnostics = window.creatiaRuntimeDiagnostics = window.creatiaRuntimeDiagnostics || {};

  function logStatus(status, reason) {
    diagnostics.status = status;
    diagnostics.reason = reason;
    diagnostics.updatedAt = new Date().toISOString();
  }

  function hasDisconnectedRuntimeLabel(text) {
    return disconnectedRuntimeLabels.some((pattern) => pattern.test(text));
  }

  function syncGeneratedStatusText() {
    if (diagnostics.providerRegistered !== true) return;

    const candidates = Array.from(document.querySelectorAll('[data-runtime-status], [data-ai-status], [role="status"], .runtime-status, .ai-status, .status, p, span, small, div, button'));
    candidates.forEach((node) => {
      if (!node || node.children.length > 3) return;
      const text = (node.textContent || '').replace(/\s+/g, ' ').trim();
      if (!text || text.length > 96 || !hasDisconnectedRuntimeLabel(text)) return;
      node.textContent = CONNECTED_STATUS_TEXT;
      node.dataset.creatiaRuntimeSynced = 'true';
    });
  }

  window.requestAiGeneration = window.requestAiGeneration || async (payload = {}) => {
    const response = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error('AI generation request failed');
    return response.json();
  };

  diagnostics.providerRegistered = true;
  logStatus('Connected', 'parent_bridge_registered');
  syncGeneratedStatusText();

  window.dispatchEvent(new CustomEvent('creatia-runtime-ready', { detail: { diagnostics: { ...diagnostics } } }));
  document.dispatchEvent(new CustomEvent('creatia-runtime-ready', { detail: { diagnostics: { ...diagnostics } } }));

  const observer = new MutationObserver(() => syncGeneratedStatusText());
  const observe = () => document.body && observer.observe(document.body, { childList: true, subtree: true, characterData: true });
  if (document.body) observe(); else document.addEventListener('DOMContentLoaded', () => { syncGeneratedStatusText(); observe(); }, { once: true });
})();
</script>`
}

function buildAiActivityMonitor() {
  return `
<style data-creatia-ui-guard="ai-activity">
  .creatia-ai-activity-dot {
    position: fixed;
    top: max(12px, env(safe-area-inset-top));
    right: max(12px, env(safe-area-inset-right));
    z-index: 2147483647;
    width: 38px;
    height: 38px;
    border-radius: 999px;
    border: 1px solid rgba(255, 255, 255, 0.46);
    background: rgba(18, 15, 35, 0.48);
    box-shadow: 0 12px 34px rgba(0, 0, 0, 0.22), inset 0 0 18px rgba(170, 135, 255, 0.24);
    opacity: 0;
    pointer-events: none;
    transform: scale(0.84);
    transition: opacity 180ms ease, transform 180ms ease;
    backdrop-filter: blur(10px);
  }
  .creatia-ai-activity-dot::before {
    content: '';
    position: absolute;
    inset: 7px;
    border-radius: inherit;
    border: 3px solid rgba(255, 255, 255, 0.24);
    border-top-color: rgba(255, 242, 173, 0.94);
    animation: creatiaAiSpin 850ms linear infinite;
  }
  .creatia-ai-activity-dot.is-active { opacity: 0.78; transform: scale(1); }
  @keyframes creatiaAiSpin { to { transform: rotate(360deg); } }
</style>
<script data-creatia-ui-guard="ai-activity">
(() => {
  if (window.__creatiaAiActivityMonitor) return;
  window.__creatiaAiActivityMonitor = true;
  const dot = document.createElement('div');
  dot.className = 'creatia-ai-activity-dot';
  dot.setAttribute('aria-hidden', 'true');
  const ready = () => document.body && document.body.appendChild(dot);
  if (document.body) ready(); else document.addEventListener('DOMContentLoaded', ready, { once: true });
  let pending = 0;
  const isAiUrl = (input) => String(typeof input === 'string' ? input : input?.url || '').includes('/api/ai');
  const titleFromBody = (body) => {
    try {
      const payload = JSON.parse(body || '{}');
      const kind = payload.kind || 'requête IA';
      const prompt = payload.context?.prompt || payload.context?.userRequest || '';
      return prompt ? kind + ' · ' + String(prompt).slice(0, 48) : kind;
    } catch { return 'requête IA in-game'; }
  };
  const notify = (status, title) => {
    window.parent?.postMessage({ source: 'creatia-generated-html', type: 'ai-activity', status, title, timestamp: new Date().toISOString() }, '*');
  };
  const begin = (title) => { pending += 1; dot.classList.add('is-active'); notify('request', title); };
  const end = (title, ok) => { pending = Math.max(0, pending - 1); if (!pending) dot.classList.remove('is-active'); notify(ok ? 'response' : 'error', title); };
  const originalFetch = window.fetch?.bind(window);
  if (originalFetch) {
    window.fetch = async (input, init = {}) => {
      if (!isAiUrl(input)) return originalFetch(input, init);
      const title = titleFromBody(init?.body);
      begin(title);
      try {
        const response = await originalFetch(input, init);
        end(title, response.ok);
        return response;
      } catch (error) {
        end(title, false);
        throw error;
      }
    };
  }
})();
</script>`
}

export function withCreatiaUiGuards(html = '') {
  const source = html || '<!doctype html><html><body></body></html>'
  const guards = [
    source.includes('data-creatia-ui-guard="start-panel"') ? '' : `${buildStartPanelGuardStyle()}${buildStartPanelGuardScript()}`,
    source.includes('data-creatia-runtime-bridge="parent-provider"') ? '' : buildCreatiaRuntimeBridge(),
    source.includes('data-creatia-ui-guard="ai-activity"') ? '' : buildAiActivityMonitor()
  ].join('')

  if (!guards) return source
  if (/<\/body>/i.test(source)) return source.replace(/<\/body>/i, `${guards}</body>`)
  return `${source}${guards}`
}

export function HtmlViewer({ html, title = 'Page créée', onBack, aiOverlay = null }) {
  return (
    <section className="html-viewer is-fullscreen" aria-label={title}>
      <div className="html-viewer-toolbar">
        <button type="button" className="html-viewer-back" onClick={onBack}>← Retour à Creatia</button>
      </div>
      {aiOverlay}
      <iframe
        title={title}
        sandbox="allow-scripts allow-same-origin allow-forms allow-pointer-lock allow-popups allow-modals allow-downloads"
        srcDoc={withCreatiaUiGuards(html)}
      />
    </section>
  )
}
