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

function serializeRuntimeContext(context = {}) {
  return JSON.stringify(context || {}).replace(/</g, '\\u003c')
}

function buildAiActivityMonitor(runtimeContext = {}) {
  const serializedContext = serializeRuntimeContext(runtimeContext)
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
  .creatia-runtime-diagnostics {
    position: fixed;
    left: max(10px, env(safe-area-inset-left));
    bottom: max(10px, env(safe-area-inset-bottom));
    z-index: 2147483647;
    max-width: min(330px, calc(100vw - 20px));
    padding: 10px 12px;
    border-radius: 14px;
    border: 1px solid rgba(255,255,255,.18);
    background: rgba(12, 10, 24, .72);
    color: white;
    font: 11px/1.35 ui-monospace, SFMono-Regular, Menlo, monospace;
    box-shadow: 0 14px 36px rgba(0,0,0,.28);
    backdrop-filter: blur(12px);
    pointer-events: none;
  }
  .creatia-runtime-diagnostics strong { display: block; margin-bottom: 4px; font-size: 12px; }
  .creatia-runtime-diagnostics span { display: block; opacity: .82; }
  @keyframes creatiaAiSpin { to { transform: rotate(360deg); } }
</style>
<script data-creatia-ui-guard="ai-activity">
(() => {
  if (window.__creatiaAiActivityMonitor) return;
  window.__creatiaAiActivityMonitor = true;
  const dot = document.createElement('div');
  dot.className = 'creatia-ai-activity-dot';
  dot.setAttribute('aria-hidden', 'true');
  const runtimeContext = ${serializedContext};
  const runtimeCapabilities = runtimeContext.runtimeCapabilities || runtimeContext.capabilities?.runtimeCapabilities || {};
  const continuationPlan = runtimeContext.continuationPlan || null;
  const preload = Array.isArray(runtimeContext.preload) ? runtimeContext.preload : [];
  window.__creatiaRuntimeContext = runtimeContext;
  window.__continuationPlan = continuationPlan;
  window.__preload = preload;
  window.continuationPlan = window.continuationPlan || continuationPlan;
  window.preload = window.preload || preload;
  const diagnostics = {
    status: 'Disconnected',
    providerRegistered: false,
    providerConnected: false,
    runtimeCapabilities,
    continuationPlanLoaded: Boolean(continuationPlan && Object.keys(continuationPlan).length),
    preloadEntries: preload.length,
    pendingRequests: 0,
    lastAiError: ''
  };
  const log = (...args) => console.log('[AI RUNTIME]', ...args);
  const logStatus = (nextStatus, reason) => {
    const previousStatus = diagnostics.status;
    diagnostics.status = nextStatus;
    console.log('[AI STATUS]', previousStatus, '->', nextStatus, reason);
    renderDiagnostics();
    syncGeneratedStatusText();
  };
  const panel = document.createElement('div');
  panel.className = 'creatia-runtime-diagnostics';
  panel.setAttribute('aria-live', 'polite');
  const renderDiagnostics = () => {
    panel.innerHTML = '<strong>AI Status: ' + diagnostics.status + '</strong>'
      + '<span>Provider Registered: ' + String(diagnostics.providerRegistered) + '</span>'
      + '<span>Provider Connected: ' + String(diagnostics.providerConnected) + '</span>'
      + '<span>Capabilities: ' + JSON.stringify(diagnostics.runtimeCapabilities) + '</span>'
      + '<span>ContinuationPlan Loaded: ' + String(diagnostics.continuationPlanLoaded) + '</span>'
      + '<span>Preload Entries: ' + diagnostics.preloadEntries + '</span>'
      + '<span>Pending Requests: ' + diagnostics.pendingRequests + '</span>'
      + '<span>Last AI Error: ' + (diagnostics.lastAiError || 'none') + '</span>';
  };
  const syncGeneratedStatusText = () => {
    if (!diagnostics.providerRegistered || diagnostics.status === 'Unavailable') return;
    const walker = document.createTreeWalker(document.body || document.documentElement, NodeFilter.SHOW_TEXT);
    const replacements = [];
    while (walker.nextNode()) {
      if ((walker.currentNode.nodeValue || '').trim() === 'AI Unavailable') replacements.push(walker.currentNode);
    }
    replacements.forEach((node) => {
      log('status text override', 'AI Unavailable -> AI Idle', 'reason=provider_registered');
      node.nodeValue = node.nodeValue.replace('AI Unavailable', 'AI Idle');
    });
  };
  const ready = () => {
    if (!document.body) return;
    document.body.appendChild(dot);
    document.body.appendChild(panel);
    renderDiagnostics();
    syncGeneratedStatusText();
  };
  if (document.body) ready(); else document.addEventListener('DOMContentLoaded', ready, { once: true });
  let pending = 0;
  const hasHostBridge = window.parent && window.parent !== window;
  log('provider discovery', { hasHostBridge, runtimeCapabilities });
  log('runtime capabilities', runtimeCapabilities);
  log('continuationPlan loading', { loaded: diagnostics.continuationPlanLoaded });
  log('preload loading', { entries: diagnostics.preloadEntries });
  if (hasHostBridge) {
    diagnostics.providerRegistered = true;
    diagnostics.providerConnected = true;
    window.CreatiaRuntime = {
      diagnostics,
      aiProvider: 'postMessage-parent-bridge',
      requestAiGeneration: (...args) => window.requestAiGeneration(...args),
      registerAiProvider(provider) {
        diagnostics.providerRegistered = Boolean(provider);
        diagnostics.providerConnected = Boolean(provider);
        log('provider registration', { providerRegistered: diagnostics.providerRegistered });
        logStatus(diagnostics.providerRegistered ? 'Connected' : 'Unavailable', diagnostics.providerRegistered ? 'provider_registered' : 'provider_missing');
      }
    };
    log('provider registration', { provider: window.CreatiaRuntime.aiProvider, providerRegistered: true });
    logStatus('Connected', 'parent_bridge_registered');
    logStatus('Idle', 'provider_ready_no_pending_request');
  } else {
    window.CreatiaRuntime = { diagnostics, aiProvider: null, requestAiGeneration: (...args) => window.requestAiGeneration(...args), registerAiProvider: () => {} };
    log('provider registration', { provider: null, providerRegistered: false });
    logStatus('Unavailable', 'provider_missing_no_parent_bridge');
  }
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
  const begin = (title) => { pending += 1; diagnostics.pendingRequests = pending; dot.classList.add('is-active'); logStatus('Generating', title); notify('request', title); };
  const end = (title, ok) => { pending = Math.max(0, pending - 1); diagnostics.pendingRequests = pending; if (!pending) dot.classList.remove('is-active'); if (!ok) diagnostics.lastAiError = title; logStatus(ok ? (pending ? 'Generating' : 'Idle') : 'Error', title); notify(ok ? 'response' : 'error', title); };
  window.requestAiGeneration = window.requestAiGeneration || async (request = {}) => {
    log('AI request creation', request);
    if (!diagnostics.providerRegistered) {
      diagnostics.lastAiError = 'No runtime AI provider registered.';
      log('AI failures', diagnostics.lastAiError);
      logStatus('Unavailable', 'provider_missing_before_request');
      return { status: 'unavailable', error: diagnostics.lastAiError };
    }
    const runtimeRequest = {
      trigger: request.trigger || 'runtime_generation',
      state: request.state || {},
      continuationPlan: request.continuationPlan || window.continuationPlan || window.__continuationPlan || null,
      preload: request.preload || window.preload || window.__preload || [],
      context: request.context || {}
    };
    log('AI request dispatch', runtimeRequest);
    begin('Runtime AI generation · ' + runtimeRequest.trigger);
    window.parent?.postMessage({
      source: 'creatia-generated-html',
      type: 'ai-runtime-generation',
      request: runtimeRequest,
      timestamp: new Date().toISOString()
    }, '*');
    notify('needs_generation', runtimeRequest.trigger);
    end('Runtime AI generation queued · ' + runtimeRequest.trigger, true);
    return { status: 'queued', fallback: false, request: runtimeRequest };
  };
  const originalFetch = window.fetch?.bind(window);
  if (originalFetch) {
    window.fetch = async (input, init = {}) => {
      if (!isAiUrl(input)) return originalFetch(input, init);
      const title = titleFromBody(init?.body);
      begin(title);
      try {
        const response = await originalFetch(input, init);
        log('AI response reception', { ok: response.ok, status: response.status });
        end(title, response.ok);
        return response;
      } catch (error) {
        diagnostics.lastAiError = error?.message || 'Fetch failed';
        log('AI failures', diagnostics.lastAiError);
        end(title, false);
        throw error;
      }
    };
  }
})();
</script>`
}

export function withCreatiaUiGuards(html = '', runtimeContext = {}) {
  const source = html || '<!doctype html><html><body></body></html>'
  const guards = `${buildStartPanelGuardStyle()}${buildStartPanelGuardScript()}${buildAiActivityMonitor(runtimeContext)}`

  if (source.includes('data-creatia-ui-guard="ai-activity"')) return source
  if (/<\/body>/i.test(source)) return source.replace(/<\/body>/i, `${guards}</body>`)
  return `${source}${guards}`
}

export function HtmlViewer({ html, title = 'Page créée', onBack, aiOverlay = null, runtimeContext = {} }) {
  return (
    <section className="html-viewer is-fullscreen" aria-label={title}>
      <div className="html-viewer-toolbar">
        <button type="button" className="html-viewer-back" onClick={onBack}>← Retour à Creatia</button>
      </div>
      {aiOverlay}
      <iframe
        title={title}
        sandbox="allow-scripts allow-same-origin allow-forms allow-pointer-lock allow-popups allow-modals allow-downloads"
        srcDoc={withCreatiaUiGuards(html, runtimeContext)}
      />
    </section>
  )
}
