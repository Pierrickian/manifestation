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
  .creatia-runtime-debug-button {
    position: fixed;
    top: 12px;
    right: 12px;
    z-index: 999999;
    min-width: 52px;
    min-height: 38px;
    border-radius: 999px;
    border: 1px solid rgba(255,255,255,.18);
    background: rgba(12, 10, 24, .86);
    color: white;
    font: 700 12px/1 system-ui, sans-serif;
    box-shadow: 0 14px 36px rgba(0,0,0,.28);
    backdrop-filter: blur(12px);
    pointer-events: auto;
  }
  .creatia-runtime-debug-panel {
    position: fixed;
    inset: auto 0 0 0;
    z-index: 2147483647;
    max-height: min(78vh, 720px);
    overflow: auto;
    padding: 14px;
    border-radius: 22px 22px 0 0;
    border: 1px solid rgba(255,255,255,.18);
    background: rgba(12, 10, 24, .96);
    color: white;
    font: 12px/1.4 system-ui, sans-serif;
    box-shadow: 0 -18px 48px rgba(0,0,0,.36);
    backdrop-filter: blur(16px);
    transform: translateY(105%);
    transition: transform 180ms ease;
  }
  .creatia-runtime-debug-panel.is-open { transform: translateY(0); }
  .creatia-runtime-debug-panel h2 { margin: 0 0 10px; font-size: 16px; }
  .creatia-runtime-debug-panel h3 { margin: 14px 0 6px; font-size: 13px; color: #ffeeb3; }
  .creatia-runtime-debug-panel pre { white-space: pre-wrap; overflow-wrap: anywhere; background: rgba(255,255,255,.08); padding: 8px; border-radius: 10px; max-height: 180px; overflow: auto; }
  .creatia-runtime-debug-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 6px; }
  .creatia-runtime-debug-item { background: rgba(255,255,255,.07); border-radius: 10px; padding: 7px; }
  .creatia-runtime-debug-item strong { display: block; font-size: 10px; text-transform: uppercase; opacity: .7; }
  .creatia-runtime-debug-row { border: 1px solid rgba(255,255,255,.12); border-radius: 10px; padding: 7px; margin: 5px 0; background: rgba(255,255,255,.05); }
  .creatia-runtime-debug-warning { color: #ffd166; }
  .creatia-runtime-debug-actions { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 8px; }
  .creatia-runtime-debug-actions button { border: 0; border-radius: 999px; padding: 8px 10px; font-weight: 700; }
  @media (min-width: 720px) {
    .creatia-runtime-debug-panel { inset: 12px auto 12px 12px; width: 380px; max-height: none; border-radius: 18px; transform: translateX(-110%); }
    .creatia-runtime-debug-panel.is-open { transform: translateX(0); }
  }
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
  const builderCapabilities = runtimeContext.capabilities || {};
  const debugState = {
    mode: runtimeContext.mode || 'create',
    builderCapabilities,
    runtimeCapabilities,
    eventStream: [],
    aiRequests: [],
    aiResponses: [],
    capabilityRequests: [],
    runtimeDecisions: [],
    errors: [],
    branchValidation: { checked: false, ok: true, missing: [], roomKeys: [], assignedBranches: [] },
    currentState: {},
    preloadState: preload.map((entry, index) => ({
      id: entry.id || 'preload-' + index,
      trigger: entry.trigger || 'contextual_followup',
      confidence: entry.confidence ?? null,
      preparedPrompt: entry.preparedPrompt || entry.prompt || '',
      consumed: Boolean(entry.consumed),
      applied: Boolean(entry.applied),
      createdAt: entry.createdAt || entry.at || new Date().toISOString(),
      status: entry.consumed ? 'Consumed' : entry.applied ? 'Applied' : 'Waiting',
      flow: ['Created', 'Stored', entry.consumed ? 'Consumed' : entry.applied ? 'Applied' : 'Waiting']
    })),
    budget: {
      aiCallsThisSession: 0,
      aiCallsThisMinute: 0,
      estimatedTokens: 0,
      preloadsGenerated: preload.length,
      preloadsConsumed: preload.filter((entry) => entry.consumed).length,
      preloadsDiscarded: preload.filter((entry) => entry.discarded).length
    },
    lastResponse: null
  };
  const sessionStart = Date.now();
  const log = (...args) => console.log('[AI RUNTIME]', ...args);
  const now = () => new Date().toISOString();
  const payloadPreview = (value) => {
    try { return JSON.stringify(value, null, 2).slice(0, 1200); } catch { return String(value).slice(0, 1200); }
  };
  const addEvent = (type, detail = {}) => {
    debugState.eventStream.unshift({ timestamp: now(), type, detail });
    debugState.eventStream = debugState.eventStream.slice(0, 80);
    renderDiagnostics();
  };
  const addDecision = (message, detail = {}) => {
    debugState.runtimeDecisions.unshift({ timestamp: now(), message, detail });
    debugState.runtimeDecisions = debugState.runtimeDecisions.slice(0, 30);
    addEvent('runtime_decision', { message, detail });
  };
  function getRuntimeState() {
    const state = window.state || window.gameState || window.appState || {};
    return {
      branch: state.branch || state.currentBranch || '',
      room: state.room || state.currentRoom || '',
      depth: state.depth ?? '',
      hp: state.hp ?? state.health ?? '',
      torch: state.torch ?? '',
      keys: state.keys || [],
      corruption: state.corruption ?? '',
      milestones: state.milestones || [],
      aiStatus: diagnostics.status
    };
  }
  function discoverRooms() {
    return window.rooms || window.ROOMS || window.gameRooms || null;
  }
  function validateBranchTargets() {
    const rooms = discoverRooms();
    const state = window.state || window.gameState || window.appState || {};
    const roomKeys = rooms && typeof rooms === 'object' ? Object.keys(rooms) : [];
    const assignedBranches = Array.from(new Set([state.branch, state.currentBranch, state.room, state.currentRoom].filter(Boolean)));
    const missing = assignedBranches.filter((branch) => roomKeys.length && !rooms[branch]);
    debugState.branchValidation = { checked: true, ok: missing.length === 0, missing, roomKeys, assignedBranches };
    if (missing.length) {
      const fallback = roomKeys[0] || '';
      addError('validateBranchTargets', 'Assigned branch missing room: ' + missing.join(', '));
      addDecision('Blocked because: Branch target missing. Redirecting to fallback room.', { missing, fallback });
      if (fallback && state.branch && !rooms[state.branch]) {
        console.log('TRANSITION', state.branch, '->', fallback);
        addEvent('branch_changed', { previousBranch: state.branch, nextBranch: fallback, reason: 'missing_branch_fallback' });
        state.branch = fallback;
      }
    }
    renderDiagnostics();
    return debugState.branchValidation;
  }
  function wrapRenderFunction() {
    if (typeof window.render !== 'function' || window.render.__creatiaSafeRender) return;
    const originalRender = window.render;
    window.render = function creatiaSafeRender(...args) {
      debugState.currentState = getRuntimeState();
      addEvent('render_started', debugState.currentState);
      try {
        const result = originalRender.apply(this, args);
        debugState.currentState = getRuntimeState();
        addEvent('render_completed', debugState.currentState);
        return result;
      } catch (error) {
        addError('render', error?.message || 'Render crashed', error);
        addDecision('Blocked because: Render crashed. Keeping last visible state and showing runtime error.', debugState.currentState);
        renderDiagnostics();
        return null;
      }
    };
    window.render.__creatiaSafeRender = true;
  }
  window.onerror = (message, source, lineno, colno, error) => {
    addError('window.onerror', String(message), error || { stack: source + ':' + lineno + ':' + colno });
    renderDiagnostics();
  };
  window.onunhandledrejection = (event) => {
    const reason = event?.reason;
    addError('unhandledrejection', reason?.message || String(reason), reason);
    renderDiagnostics();
  };
  const addError = (location, reason, error) => {
    const entry = { timestamp: now(), location, reason, stack: error?.stack || '', currentBranch: getRuntimeState().branch || '', currentRoom: getRuntimeState().room || '' };
    debugState.errors.unshift(entry);
    debugState.errors = debugState.errors.slice(0, 20);
    diagnostics.lastAiError = reason;
    addEvent('generation_failed', entry);
  };
  const logStatus = (nextStatus, reason) => {
    const previousStatus = diagnostics.status;
    diagnostics.status = nextStatus;
    console.log('[AI STATUS]', previousStatus, '->', nextStatus, reason);
    addEvent('ai_status_transition', { previousStatus, nextStatus, reason });
    renderDiagnostics();
    syncGeneratedStatusText();
  };
  const button = document.createElement('button');
  button.type = 'button';
  button.id = 'debugToggle';
  button.className = 'creatia-runtime-debug-button';
  button.textContent = 'Debug';
  button.setAttribute('aria-label', 'Open Runtime Debug Panel');
  const panel = document.createElement('aside');
  panel.className = 'creatia-runtime-debug-panel';
  panel.setAttribute('aria-live', 'polite');
  panel.setAttribute('aria-label', 'Runtime Debug Panel');
  const boolText = (value) => value ? 'Yes' : 'No';
  function buildDebugSnapshot() {
    return {
      exportedAt: now(),
      runtimeStatus: diagnostics,
      capabilities: { builder: builderCapabilities, runtime: runtimeCapabilities, mismatches: capabilityMismatches() },
      continuationPlan,
      preloadState: debugState.preloadState,
      eventHistory: debugState.eventStream,
      aiRequests: debugState.aiRequests,
      aiResponses: debugState.aiResponses,
      capabilityRequests: debugState.capabilityRequests,
      runtimeDecisions: debugState.runtimeDecisions,
      budget: debugState.budget,
      errors: debugState.errors
    };
  }
  function exportDebugSnapshot() {
    const snapshot = buildDebugSnapshot();
    const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'creatia-runtime-debug-snapshot.json';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    addEvent('debug_snapshot_exported', { entries: debugState.eventStream.length });
  }
  const capabilityMismatches = () => {
    const keys = Array.from(new Set([...Object.keys(builderCapabilities || {}), ...Object.keys(runtimeCapabilities || {})]));
    return keys.filter((key) => {
      if (key === 'runtimeCapabilities') return false;
      return JSON.stringify(builderCapabilities?.[key]) !== JSON.stringify(runtimeCapabilities?.[key]);
    });
  };
  const renderRows = (items, empty, formatter) => items.length ? items.map(formatter).join('') : '<div class="creatia-runtime-debug-row">' + empty + '</div>';
  const renderDiagnostics = () => {
    const mismatches = capabilityMismatches();
    debugState.currentState = getRuntimeState();
    panel.innerHTML = '<h2>Runtime Debug Panel</h2>'
      + '<div class="creatia-runtime-debug-actions"><button type="button" data-creatia-debug-close>Close</button><button type="button" data-creatia-debug-export>Export Debug Snapshot</button></div>'
      + '<h3>Runtime Status</h3><div class="creatia-runtime-debug-grid">'
      + '<div class="creatia-runtime-debug-item"><strong>Application Mode</strong>' + debugState.mode + '</div>'
      + '<div class="creatia-runtime-debug-item"><strong>AI Status</strong>' + diagnostics.status + '</div>'
      + '<div class="creatia-runtime-debug-item"><strong>Provider Registered</strong>' + boolText(diagnostics.providerRegistered) + '</div>'
      + '<div class="creatia-runtime-debug-item"><strong>Provider Connected</strong>' + boolText(diagnostics.providerConnected) + '</div>'
      + '<div class="creatia-runtime-debug-item"><strong>Runtime Online</strong>' + boolText(Boolean(runtimeCapabilities.online || diagnostics.providerConnected)) + '</div>'
      + '<div class="creatia-runtime-debug-item"><strong>Pending Requests</strong>' + diagnostics.pendingRequests + '</div></div>'
      + '<h3>Capabilities</h3>' + (mismatches.length ? '<div class="creatia-runtime-debug-warning">Mismatches: ' + mismatches.join(', ') + '</div>' : '<div>Builder and runtime capabilities aligned.</div>')
      + '<strong>Builder Capabilities</strong><pre>' + payloadPreview(builderCapabilities) + '</pre><strong>Runtime Capabilities</strong><pre>' + payloadPreview(runtimeCapabilities) + '</pre>'
      + '<h3>Current State</h3><pre>' + payloadPreview(debugState.currentState) + '</pre>'
      + '<h3>Branch Integrity</h3><div class="' + (debugState.branchValidation.ok ? '' : 'creatia-runtime-debug-warning') + '">Checked: ' + boolText(debugState.branchValidation.checked) + ' · OK: ' + boolText(debugState.branchValidation.ok) + '</div><pre>' + payloadPreview(debugState.branchValidation) + '</pre>'
      + '<h3>Continuation Plan</h3><div class="creatia-runtime-debug-grid">'
      + '<div class="creatia-runtime-debug-item"><strong>Present</strong>' + boolText(diagnostics.continuationPlanLoaded) + '</div>'
      + '<div class="creatia-runtime-debug-item"><strong>Role</strong>' + (continuationPlan?.role || continuationPlan?.aiRole || '—') + '</div></div>'
      + '<div><strong>Objectives</strong><pre>' + payloadPreview(continuationPlan?.objectives || continuationPlan?.longTermObjectives || []) + '</pre></div>'
      + '<div><strong>Callbacks</strong><pre>' + payloadPreview(continuationPlan?.callbacks || continuationPlan?.expectedCallbacks || []) + '</pre></div>'
      + '<div><strong>Rules</strong><pre>' + payloadPreview(continuationPlan?.rules || continuationPlan?.collaborationRules || []) + '</pre></div>'
      + '<details><summary>Full continuationPlan JSON</summary><pre>' + payloadPreview(continuationPlan) + '</pre></details>'
      + '<h3>Preload</h3><div>Preload Entries: ' + debugState.preloadState.length + '</div>'
      + renderRows(debugState.preloadState, 'No preload entries.', (entry) => '<div class="creatia-runtime-debug-row"><strong>' + entry.trigger + '</strong><div>Status: ' + entry.status + ' · Confidence: ' + (entry.confidence ?? '—') + '</div><div>Consumed: ' + boolText(entry.consumed) + ' · Applied: ' + boolText(entry.applied) + '</div><div>Created At: ' + entry.createdAt + '</div><details><summary>Prepared Prompt</summary><pre>' + payloadPreview(entry.preparedPrompt) + '</pre></details><div>Flow: ' + entry.flow.join(' ↓ ') + '</div></div>')
      + '<h3>AI Request Log</h3>' + renderRows(debugState.aiRequests, 'No AI requests yet.', (entry) => '<div class="creatia-runtime-debug-row"><strong>' + entry.trigger + '</strong><div>' + entry.timestamp + ' · ' + entry.requestId + ' · ' + entry.status + '</div><div>Duration: ' + (entry.durationMs ?? '—') + 'ms · Estimated Tokens: ' + (entry.estimatedTokens ?? '—') + '</div></div>')
      + '<h3>Last AI Response</h3><div class="creatia-runtime-debug-row"><strong>Response Type</strong>' + (debugState.lastResponse?.type || 'none') + '<pre>' + payloadPreview(debugState.lastResponse?.payload || {}) + '</pre></div>'
      + '<h3>Capability Negotiation</h3>' + renderRows(debugState.capabilityRequests, 'No capability requests.', (entry) => '<div class="creatia-runtime-debug-row"><strong>' + entry.status + '</strong><pre>' + payloadPreview(entry.requestedCapabilities) + '</pre></div>')
      + '<h3>Event Stream</h3>' + renderRows(debugState.eventStream, 'No runtime events yet.', (entry) => '<div class="creatia-runtime-debug-row"><strong>' + entry.type + '</strong><div>' + entry.timestamp + '</div><pre>' + payloadPreview(entry.detail) + '</pre></div>')
      + '<h3>Budget</h3><pre>' + payloadPreview(debugState.budget) + '</pre>'
      + '<h3>Runtime Decision Explainer</h3>' + renderRows(debugState.runtimeDecisions, 'No blocked decisions.', (entry) => '<div class="creatia-runtime-debug-row"><strong>Why was this request blocked?</strong><div>' + entry.message + '</div><pre>' + payloadPreview(entry.detail) + '</pre></div>')
      + '<h3>Last Error</h3>' + renderRows(debugState.errors, 'No runtime errors.', (entry) => '<div class="creatia-runtime-debug-row"><strong>' + entry.location + '</strong><div>' + entry.timestamp + '</div><div>' + entry.reason + '</div><pre>' + (entry.stack || '') + '</pre></div>');
    panel.querySelector('[data-creatia-debug-close]')?.addEventListener('click', () => panel.classList.remove('is-open'));
    panel.querySelector('[data-creatia-debug-export]')?.addEventListener('click', exportDebugSnapshot);
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
    document.body.appendChild(button);
    document.body.appendChild(panel);
    button.addEventListener('click', () => {
      panel.classList.toggle('is-open');
      addEvent('debug_panel_toggled', { open: panel.classList.contains('is-open') });
    });
    wrapRenderFunction();
    validateBranchTargets();
    window.setInterval(() => {
      wrapRenderFunction();
      debugState.currentState = getRuntimeState();
      renderDiagnostics();
    }, 1500);
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
  const pendingRuntimeRequests = new Map();
  window.addEventListener('message', (event) => {
    if (event.data?.source !== 'creatia-host' || event.data?.type !== 'ai-runtime-generation-result') return;
    const requestId = event.data.requestId;
    const entry = debugState.aiRequests.find((item) => item.requestId === requestId);
    if (entry) {
      entry.status = event.data.ok ? 'Completed' : 'Failed';
      entry.durationMs = entry.startedAt ? Math.round(performance.now() - entry.startedAt) : entry.durationMs;
      end('Runtime AI generation result · ' + entry.trigger, Boolean(event.data.ok));
    }
    debugState.lastResponse = { type: event.data.responseType || 'runtime_generation', payload: event.data.payload || event.data };
    debugState.aiResponses.unshift({ timestamp: now(), type: debugState.lastResponse.type, payload: debugState.lastResponse.payload });
    debugState.aiResponses = debugState.aiResponses.slice(0, 30);
    addEvent(event.data.ok ? 'generation_completed' : 'generation_failed', { requestId, responseType: debugState.lastResponse.type });
    const resolver = pendingRuntimeRequests.get(requestId);
    if (resolver) {
      pendingRuntimeRequests.delete(requestId);
      resolver(event.data);
    }
    if (typeof window.onAiResponse === 'function') window.onAiResponse(event.data);
    if (event.data.ok && typeof window.applyGeneratedContent === 'function') window.applyGeneratedContent(event.data.payload);
    if (event.data.ok && typeof window.applyGeneratedRoom === 'function') window.applyGeneratedRoom(event.data.payload);
    renderDiagnostics();
  });
  window.requestAiGeneration = window.requestAiGeneration || async (request = {}) => {
    log('AI request creation', request);
    if (!diagnostics.providerRegistered) {
      diagnostics.lastAiError = 'No runtime AI provider registered.';
      log('AI failures', diagnostics.lastAiError);
      addDecision('Blocked because: Provider not connected.', { request });
      addError('requestAiGeneration', diagnostics.lastAiError);
      logStatus('Unavailable', 'provider_missing_before_request');
      return { status: 'unavailable', error: diagnostics.lastAiError };
    }
    if (diagnostics.pendingRequests > 0) {
      addDecision('Blocked because: Request already in progress.', { pendingRequests: diagnostics.pendingRequests });
    }
    const runtimeRequest = {
      requestId: request.requestId || 'runtime-' + Date.now() + '-' + Math.random().toString(16).slice(2),
      trigger: request.trigger || 'runtime_generation',
      state: request.state || {},
      continuationPlan: request.continuationPlan || window.continuationPlan || window.__continuationPlan || null,
      preload: request.preload || window.preload || window.__preload || [],
      context: request.context || {}
    };
    const requestEntry = {
      timestamp: now(),
      trigger: runtimeRequest.trigger,
      requestId: runtimeRequest.requestId,
      status: 'Queued',
      durationMs: null,
      estimatedTokens: Math.ceil(payloadPreview(runtimeRequest).length / 4),
      startedAt: performance.now()
    };
    debugState.aiRequests.unshift(requestEntry);
    debugState.aiRequests = debugState.aiRequests.slice(0, 50);
    debugState.budget.aiCallsThisSession += 1;
    debugState.budget.aiCallsThisMinute = debugState.aiRequests.filter((entry) => Date.parse(entry.timestamp) > Date.now() - 60000).length;
    debugState.budget.estimatedTokens += requestEntry.estimatedTokens;
    addEvent('ai_request', { trigger: runtimeRequest.trigger, requestId: runtimeRequest.requestId });
    log('AI request dispatch', runtimeRequest);
    requestEntry.status = 'Generating';
    begin('Runtime AI generation · ' + runtimeRequest.trigger);
    requestEntry.status = 'Generating';
    addEvent('generation_started', { trigger: runtimeRequest.trigger, requestId: runtimeRequest.requestId });
    window.parent?.postMessage({
      source: 'creatia-generated-html',
      type: 'ai-runtime-generation',
      request: runtimeRequest,
      timestamp: new Date().toISOString()
    }, '*');
    notify('needs_generation', runtimeRequest.trigger);
    requestEntry.status = 'Sent';
    renderDiagnostics();
    return new Promise((resolve) => {
      pendingRuntimeRequests.set(runtimeRequest.requestId, resolve);
      window.setTimeout(() => {
        if (!pendingRuntimeRequests.has(runtimeRequest.requestId)) return;
        pendingRuntimeRequests.delete(runtimeRequest.requestId);
        requestEntry.status = 'Failed';
        addDecision('Blocked because: runtime generation response timed out.', { requestId: runtimeRequest.requestId });
        end('Runtime AI generation timed out · ' + runtimeRequest.trigger, false);
        resolve({ status: 'timeout', request: runtimeRequest });
      }, 45000);
    });
  };
  const originalFetch = window.fetch?.bind(window);
  if (originalFetch) {
    window.fetch = async (input, init = {}) => {
      if (!isAiUrl(input)) return originalFetch(input, init);
      const title = titleFromBody(init?.body);
      const requestId = 'fetch-' + Date.now() + '-' + Math.random().toString(16).slice(2);
      const requestEntry = { timestamp: now(), trigger: title, requestId, status: 'Sent', durationMs: null, estimatedTokens: Math.ceil(String(init?.body || '').length / 4), startedAt: performance.now() };
      debugState.aiRequests.unshift(requestEntry);
      debugState.aiRequests = debugState.aiRequests.slice(0, 50);
      debugState.budget.aiCallsThisSession += 1;
      debugState.budget.aiCallsThisMinute = debugState.aiRequests.filter((entry) => Date.parse(entry.timestamp) > Date.now() - 60000).length;
      debugState.budget.estimatedTokens += requestEntry.estimatedTokens;
      addEvent('ai_request', { trigger: title, requestId });
      begin(title);
      try {
        requestEntry.status = 'Generating';
        const response = await originalFetch(input, init);
        log('AI response reception', { ok: response.ok, status: response.status });
        requestEntry.status = response.ok ? 'Completed' : 'Failed';
        requestEntry.durationMs = Math.round(performance.now() - requestEntry.startedAt);
        debugState.lastResponse = { type: response.ok ? 'html_app' : 'generation_error', payload: { status: response.status, ok: response.ok } };
        debugState.aiResponses.unshift({ timestamp: now(), type: debugState.lastResponse.type, payload: debugState.lastResponse.payload });
        addEvent(response.ok ? 'generation_completed' : 'generation_failed', { trigger: title, requestId, status: response.status });
        end(title, response.ok);
        renderDiagnostics();
        return response;
      } catch (error) {
        diagnostics.lastAiError = error?.message || 'Fetch failed';
        log('AI failures', diagnostics.lastAiError);
        requestEntry.status = 'Failed';
        requestEntry.durationMs = Math.round(performance.now() - requestEntry.startedAt);
        addError('fetch', diagnostics.lastAiError, error);
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
