import { useEffect, useRef } from 'react'

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

function buildRuntimeBridgeScript() {
  return `
<script data-creatia-ui-guard="runtime-bridge">
(() => {
  if (window.__creatiaRuntimeBridge) return;
  window.__creatiaRuntimeBridge = true;
  let pendingRequestId = null;
  const emitResult = (detail) => window.dispatchEvent(new CustomEvent('creatia:runtime-result', { detail }));
  window.requestAiGeneration = (request = {}) => {
    if (pendingRequestId) {
      return Promise.resolve({ source: 'creatia-host', type: 'ai-runtime-generation-result', requestId: pendingRequestId, ok: false, responseType: 'generation_error', payload: { error: 'A runtime generation request is already pending.' } });
    }
    const requestId = request.requestId || 'runtime-' + Date.now() + '-' + Math.random().toString(16).slice(2);
    pendingRequestId = requestId;
    window.parent?.postMessage({ source: 'creatia-runtime-bridge', type: 'ai-runtime-generation-request', requestId, request }, '*');
    return new Promise((resolve) => {
      const timeout = window.setTimeout(() => {
        if (pendingRequestId === requestId) pendingRequestId = null;
        const result = { source: 'creatia-host', type: 'ai-runtime-generation-result', requestId, ok: false, responseType: 'generation_error', payload: { error: 'Runtime generation timed out.' } };
        emitResult(result);
        resolve(result);
      }, 65000);
      const receive = (event) => {
        const data = event.data || {};
        if (data.source !== 'creatia-host' || data.type !== 'ai-runtime-generation-result' || data.requestId !== requestId) return;
        window.clearTimeout(timeout);
        window.removeEventListener('message', receive);
        if (pendingRequestId === requestId) pendingRequestId = null;
        if (data.ok && data.runtimePayload && typeof window.applyRuntimePayload === 'function') window.applyRuntimePayload(data.runtimePayload);
        emitResult(data);
        resolve(data);
      };
      window.addEventListener('message', receive);
    });
  };
})();
</script>`
}

export function withCreatiaUiGuards(html = '') {
  const source = html || '<!doctype html><html><body></body></html>'
  const guards = `${buildStartPanelGuardStyle()}${buildStartPanelGuardScript()}${buildAiActivityMonitor()}${buildRuntimeBridgeScript()}`

  if (source.includes('data-creatia-ui-guard="runtime-bridge"')) return source
  if (/<\/body>/i.test(source)) return source.replace(/<\/body>/i, `${guards}</body>`)
  return `${source}${guards}`
}

export function HtmlViewer({ html, title = 'Page créée', onBack, aiOverlay = null, onRuntimeGeneration = null }) {
  const iframeRef = useRef(null)

  useEffect(() => {
    if (!onRuntimeGeneration) return undefined
    async function handleRuntimeMessage(event) {
      const data = event.data || {}
      if (data.source !== 'creatia-runtime-bridge' || data.type !== 'ai-runtime-generation-request') return
      const result = await onRuntimeGeneration({ ...(data.request || {}), requestId: data.requestId })
      iframeRef.current?.contentWindow?.postMessage(result, '*')
    }
    window.addEventListener('message', handleRuntimeMessage)
    return () => window.removeEventListener('message', handleRuntimeMessage)
  }, [onRuntimeGeneration])

  return (
    <section className="html-viewer is-fullscreen" aria-label={title}>
      <div className="html-viewer-toolbar">
        <button type="button" className="html-viewer-back" onClick={onBack}>← Retour à Creatia</button>
      </div>
      {aiOverlay}
      <iframe
        ref={iframeRef}
        title={title}
        sandbox="allow-scripts allow-same-origin allow-forms allow-pointer-lock allow-popups allow-modals allow-downloads"
        srcDoc={withCreatiaUiGuards(html)}
      />
    </section>
  )
}
