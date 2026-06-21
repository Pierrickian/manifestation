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
  .creatia-runtime-step-log {
    position: fixed;
    left: max(12px, env(safe-area-inset-left));
    top: max(12px, env(safe-area-inset-top));
    z-index: 2147483646;
    width: min(420px, calc(100vw - 24px));
    max-height: 34vh;
    overflow: auto;
    padding: 10px;
    border-radius: 16px;
    border: 1px solid rgba(255,255,255,.18);
    background: rgba(12, 10, 24, .88);
    color: white;
    font: 11px/1.35 system-ui, sans-serif;
    box-shadow: 0 14px 38px rgba(0,0,0,.32);
    backdrop-filter: blur(12px);
    pointer-events: auto;
  }
  .creatia-runtime-step-log strong { display: block; margin-bottom: 6px; color: #ffeeb3; }
  .creatia-runtime-step-log ol { margin: 0; padding-left: 20px; }
  .creatia-runtime-step-log li { margin: 0 0 5px; color: rgba(255,255,255,.88); }
  .creatia-runtime-step-log small { display: block; color: rgba(255,255,255,.58); }
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
  .creatia-runtime-content {
    position: fixed;
    left: max(12px, env(safe-area-inset-left));
    right: max(12px, env(safe-area-inset-right));
    bottom: max(12px, env(safe-area-inset-bottom));
    z-index: 999998;
    max-height: min(38vh, 340px);
    overflow: auto;
    padding: 14px;
    border-radius: 18px;
    border: 1px solid rgba(255,255,255,.18);
    background: rgba(14, 12, 28, .92);
    color: white;
    font: 14px/1.45 system-ui, sans-serif;
    box-shadow: 0 18px 48px rgba(0,0,0,.34);
    backdrop-filter: blur(14px);
    pointer-events: auto;
  }
  .creatia-runtime-content h2 { margin: 0 0 8px; font-size: 17px; }
  .creatia-runtime-content p { margin: 0 0 10px; }
  .creatia-runtime-content button { width: 100%; margin: 6px 0 0; border: 0; border-radius: 12px; padding: 10px 12px; font-weight: 700; color: #161326; background: #ffeeb3; }
  .creatia-runtime-content details { margin-top: 10px; }
  .creatia-runtime-content pre { white-space: pre-wrap; overflow-wrap: anywhere; background: rgba(255,255,255,.08); padding: 8px; border-radius: 10px; max-height: 120px; overflow: auto; }
  @media (min-width: 720px) {
    .creatia-runtime-debug-panel { inset: 12px auto 12px 12px; width: 380px; max-height: none; border-radius: 18px; transform: translateX(-110%); }
    .creatia-runtime-debug-panel.is-open { transform: translateX(0); }
    .creatia-runtime-content { left: auto; width: min(420px, calc(100vw - 24px)); }
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
  const stepLogPanel = document.createElement('aside');
  stepLogPanel.className = 'creatia-runtime-step-log';
  stepLogPanel.setAttribute('aria-live', 'polite');
  stepLogPanel.setAttribute('aria-label', 'Runtime step-by-step log');
  const runtimeContext = ${serializedContext};
  const debugEnabled = runtimeContext.debugEnabled !== false;
  const runtimeCapabilities = runtimeContext.runtimeCapabilities || runtimeContext.capabilities?.runtimeCapabilities || {};
  const isNonEmptyObject = (value) => Boolean(value && typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length);
  const asArray = (value) => Array.isArray(value) ? value : [];
  const mergeContinuationPlan = (appPlan, hostPlan) => {
    if (isNonEmptyObject(appPlan) && isNonEmptyObject(hostPlan)) return { ...appPlan, ...hostPlan };
    if (isNonEmptyObject(hostPlan)) return hostPlan;
    if (isNonEmptyObject(appPlan)) return appPlan;
    return null;
  };
  const mergePreload = (appPreload, hostPreload) => {
    const appEntries = asArray(appPreload);
    const hostEntries = asArray(hostPreload);
    if (!hostEntries.length) return appEntries;
    if (!appEntries.length) return hostEntries;
    const seen = new Set();
    return [...appEntries, ...hostEntries].filter((entry, index) => {
      const key = entry?.id || entry?.trigger || entry?.preparedPrompt || entry?.prompt || 'entry-' + index;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };
  const hostContinuationPlan = runtimeContext.continuationPlan || null;
  const hostPreload = Array.isArray(runtimeContext.preload) ? runtimeContext.preload : [];
  const continuationPlan = mergeContinuationPlan(window.__continuationPlan || window.continuationPlan || null, hostContinuationPlan);
  const preload = mergePreload(window.__preload || window.preload || [], hostPreload);
  window.__creatiaRuntimeContext = runtimeContext;
  window.__continuationPlan = continuationPlan;
  window.__preload = preload;
  window.continuationPlan = mergeContinuationPlan(window.continuationPlan || null, continuationPlan);
  window.preload = mergePreload(window.preload || [], preload);
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
  window.creatiaRuntimeDiagnostics = diagnostics;
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
    lastResponse: null,
    stepCounter: 0
  };
  const sessionStart = Date.now();
  const log = (...args) => console.log('[AI RUNTIME]', ...args);
  const now = () => new Date().toISOString();
  const payloadPreview = (value) => {
    try { return JSON.stringify(value, null, 2).slice(0, 1200); } catch { return String(value).slice(0, 1200); }
  };
  function appendGeneratedAppLog(entry) {
    if (!debugEnabled) return;
    const host = document.querySelector('[data-creatia-generated-log], #log, .log');
    if (!host || host.closest?.('.creatia-runtime-debug-panel, .creatia-runtime-step-log')) return;
    const line = document.createElement('div');
    line.dataset.creatiaRuntimeLog = 'true';
    line.className = host.id === 'log' || host.classList?.contains('log') ? 'logItem' : '';
    line.textContent = entry.step + '. Runtime: ' + humanizeRuntimeEvent(entry.type, entry.detail);
    if (host.firstChild) host.insertBefore(line, host.firstChild); else host.appendChild(line);
  }
  function humanizeRuntimeEvent(type, detail = {}) {
    const labels = {
      runtime_guard_loaded: 'guard chargé dans l’iframe',
      provider_registered: 'bridge parent détecté',
      ai_request: 'demande envoyée au runtime host',
      generation_started: 'génération runtime démarrée',
      host_request_received: 'host a reçu la demande',
      host_dispatch_controller: 'host interroge l’IA',
      host_response_received: 'host a reçu la réponse IA',
      host_payload_posted: 'host renvoie le payload à l’iframe',
      generation_completed: 'réponse runtime reçue',
      runtime_payload_applied: 'payload appliqué dans l’app',
      generation_failed: 'échec runtime',
      runtime_error: 'erreur runtime'
    };
    return labels[type] || detail.message || type;
  }
  function renderStepLog() {
    if (!debugEnabled) return;
    const chronological = [...debugState.eventStream].reverse().slice(-18);
    stepLogPanel.innerHTML = '<strong>Debug runtime · étapes</strong><ol>' + chronological.map((entry) => '<li value="' + entry.step + '">' + escapeHtml(humanizeRuntimeEvent(entry.type, entry.detail)) + '<small>' + escapeHtml(entry.type) + '</small></li>').join('') + '</ol>';
  }
  const addEvent = (type, detail = {}) => {
    const entry = { step: ++debugState.stepCounter, timestamp: now(), type, detail };
    debugState.eventStream.unshift(entry);
    debugState.eventStream = debugState.eventStream.slice(0, 80);
    appendGeneratedAppLog(entry);
    renderStepLog();
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
  const connectedRuntimeStatusText = 'Runtime: connecté';
  const disconnectedRuntimeLabels = [
    /runtime\\s*:\\s*(indisponible|attendu|en attente|non disponible)/i,
    /runtime\\s+ai\\s+indisponible\\s+localement/i,
    /runtime\\s+indisponible/i,
    /runtime\\s+attendu/i,
    /ai\\s+runtime\\s+unavailable/i,
    /runtime\\s*:\\s*(unavailable|waiting|pending)/i,
    /bridge\\s+(en\\s+attente|indisponible|non\\s+disponible|waiting|pending|unavailable)/i,
    /aucun\\s+bridge\\s+creatia\\s+d[ée]tect[ée]/i
  ];
  const hasDisconnectedRuntimeLabel = (text = '') => disconnectedRuntimeLabels.some((pattern) => pattern.test(text));
  const connectedStatusFor = (text = '') => /bridge/i.test(text) ? 'Bridge prêt' : connectedRuntimeStatusText;
  const syncGeneratedStatusText = () => {
    if (!diagnostics.providerRegistered || diagnostics.status === 'Unavailable') return;
    const candidates = Array.from(document.querySelectorAll('[data-runtime-status], [data-ai-status], [role="status"], .runtime-status, .ai-status, .status, p, span, small, div, button'));
    candidates.forEach((node) => {
      if (!node || node.children.length > 3) return;
      const text = (node.textContent || '').replace(/\\s+/g, ' ').trim();
      if (!text || text.length > 96 || !hasDisconnectedRuntimeLabel(text)) return;
      const connectedText = connectedStatusFor(text);
      log('status text override', text + ' -> ' + connectedText, 'reason=provider_registered');
      node.textContent = connectedText;
      node.dataset.creatiaRuntimeSynced = 'true';
    });
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
    if (debugEnabled) {
      document.body.appendChild(dot);
      document.body.appendChild(stepLogPanel);
      document.body.appendChild(button);
      document.body.appendChild(panel);
    }
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
      syncGeneratedStatusText();
    }, 1500);
    const observer = new MutationObserver(() => syncGeneratedStatusText());
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    addEvent('runtime_guard_loaded', { debugEnabled });
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
    addEvent('provider_registered', { provider: window.CreatiaRuntime.aiProvider });
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
  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
  }
  function getRuntimeContentHost() {
    let host = document.getElementById('creatia-runtime-content');
    if (!host) {
      host = document.createElement('section');
      host.id = 'creatia-runtime-content';
      host.className = 'creatia-runtime-content';
      host.setAttribute('aria-live', 'polite');
      host.setAttribute('aria-label', 'AI generated runtime content');
      document.body.appendChild(host);
    }
    return host;
  }
  function mergeRuntimeStatePatch(statePatch = {}) {
    if (!statePatch || typeof statePatch !== 'object' || Array.isArray(statePatch)) return;
    const target = window.state || window.gameState || window.appState;
    if (target && typeof target === 'object') {
      Object.assign(target, statePatch);
      return;
    }
    window.appState = { ...(window.appState || {}), ...statePatch };
  }
  function normalizeRuntimeChoices(choices) {
    if (!Array.isArray(choices)) return [];
    return choices.map((choice, index) => {
      if (typeof choice === 'string') return { id: 'choice-' + index, label: choice, prompt: choice };
      if (choice && typeof choice === 'object') return choice;
      return { id: 'choice-' + index, label: 'Choice ' + (index + 1) };
    });
  }
  function applyRuntimePayloadFallback(runtimePayload = {}) {
    if (!runtimePayload || typeof runtimePayload !== 'object') {
      addDecision('AI response received but runtimePayload is missing or empty.', { runtimePayload });
      return false;
    }
    const room = runtimePayload.room && typeof runtimePayload.room === 'object' ? runtimePayload.room : null;
    const page = runtimePayload.page && typeof runtimePayload.page === 'object' ? runtimePayload.page : null;
    const screen = runtimePayload.screen && typeof runtimePayload.screen === 'object' ? runtimePayload.screen : null;
    const statePatch = runtimePayload.statePatch && typeof runtimePayload.statePatch === 'object' ? runtimePayload.statePatch : {};
    const narrative = runtimePayload.narrative || room?.narrative || room?.description || page?.text || page?.summary || page?.description || screen?.text || screen?.summary || screen?.description || runtimePayload.text || runtimePayload.summary || runtimePayload.description || statePatch.narrative || statePatch.story || '';
    const choices = normalizeRuntimeChoices(runtimePayload.choices || room?.choices || page?.choices || screen?.choices || statePatch.choices || []);
    mergeRuntimeStatePatch(statePatch);
    if (room) {
      const rooms = discoverRooms();
      if (rooms && typeof rooms === 'object') {
        const roomId = room.id || room.key || room.slug || 'runtime-room-' + Date.now();
        rooms[roomId] = { ...(rooms[roomId] || {}), ...room };
        const state = window.state || window.gameState || window.appState;
        if (state && typeof state === 'object') {
          const previousBranch = state.branch || state.currentBranch || state.room || state.currentRoom || '';
          console.log('TRANSITION', previousBranch, '->', roomId);
          addEvent('branch_changed', { previousBranch, nextBranch: roomId, reason: 'runtime_payload_room' });
          if ('branch' in state || !('currentBranch' in state)) state.branch = roomId;
          if ('currentBranch' in state) state.currentBranch = roomId;
          if ('room' in state) state.room = roomId;
          if ('currentRoom' in state) state.currentRoom = roomId;
        }
      }
    }
    const host = getRuntimeContentHost();
    const title = room?.title || room?.name || page?.title || page?.name || screen?.title || screen?.name || runtimePayload.title || statePatch.title || 'AI generated continuation';
    const chips = Array.isArray(runtimePayload.chips) ? runtimePayload.chips : Array.isArray(page?.chips) ? page.chips : Array.isArray(screen?.chips) ? screen.chips : [];
    const bullets = Array.isArray(runtimePayload.bullets) ? runtimePayload.bullets : Array.isArray(page?.bullets) ? page.bullets : Array.isArray(screen?.bullets) ? screen.bullets : [];
    const htmlFragment = runtimePayload.htmlFragment || page?.htmlFragment || screen?.htmlFragment || '';
    const domainBlocks = ['lesson', 'exercise', 'simulationStep', 'page', 'screen', 'route']
      .filter((key) => runtimePayload[key])
      .map((key) => '<details><summary>' + escapeHtml(key) + '</summary><pre>' + escapeHtml(payloadPreview(runtimePayload[key])) + '</pre></details>')
      .join('');
    host.innerHTML = '<h2>' + escapeHtml(title) + '</h2>'
      + (narrative ? '<p>' + escapeHtml(narrative) + '</p>' : '')
      + (htmlFragment ? '<div>' + htmlFragment + '</div>' : '')
      + (chips.length ? '<div>' + chips.map((chip) => '<span style="display:inline-block;margin:3px;padding:4px 8px;border-radius:999px;background:rgba(255,255,255,.12)">' + escapeHtml(chip) + '</span>').join('') + '</div>' : '')
      + (bullets.length ? '<ul>' + bullets.map((bullet) => '<li>' + escapeHtml(bullet) + '</li>').join('') + '</ul>' : '')
      + '<div data-creatia-runtime-choices></div>'
      + domainBlocks
      + '<details><summary>Runtime payload</summary><pre>' + escapeHtml(payloadPreview(runtimePayload)) + '</pre></details>';
    const choiceHost = host.querySelector('[data-creatia-runtime-choices]');
    choices.forEach((choice, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = choice.label || choice.title || choice.text || choice.prompt || ('Choice ' + (index + 1));
      button.addEventListener('click', () => {
        addEvent('user_choice', { choice });
        const state = window.state || window.gameState || window.appState || {};
        const nextBranch = choice.branch || choice.target || choice.room || choice.id || choice.trigger || '';
        if (nextBranch && state && typeof state === 'object') {
          const previousBranch = state.branch || state.currentBranch || state.room || state.currentRoom || '';
          console.log('TRANSITION', previousBranch, '->', nextBranch);
          addEvent('branch_changed', { previousBranch, nextBranch, reason: 'runtime_choice' });
          if ('branch' in state || !('currentBranch' in state)) state.branch = nextBranch;
          if ('currentBranch' in state) state.currentBranch = nextBranch;
        }
        if (choice.trigger && typeof window.requestAiGeneration === 'function') {
          window.requestAiGeneration({ trigger: choice.trigger, state: getRuntimeState(), context: { choice, runtimePayload } });
        }
      });
      choiceHost.appendChild(button);
    });
    if (Array.isArray(runtimePayload.preload) && runtimePayload.preload.length) {
      debugState.budget.preloadsGenerated += runtimePayload.preload.length;
    }
    addEvent('runtime_payload_applied', { hasRoom: Boolean(room), hasPage: Boolean(page), hasScreen: Boolean(screen), hasNarrative: Boolean(narrative), choices: choices.length, statePatchKeys: Object.keys(statePatch) });
    try {
      wrapRenderFunction();
      if (typeof window.render === 'function') window.render();
    } catch (error) {
      addError('applyRuntimePayloadFallback', error?.message || 'Runtime payload render failed', error);
    }
    renderDiagnostics();
    return true;
  }
  const runtimeCallbackEvents = ['ai_request', 'needs_generation', 'preload_requested', 'branch_requested', 'content_exhausted', 'runtime_generation_requested'];
  function createRuntimeRequestFromSource(trigger, detail = {}) {
    return {
      trigger: trigger || detail.trigger || detail.type || 'runtime_generation',
      state: detail.state || getRuntimeState(),
      continuationPlan: mergeContinuationPlan(
        mergeContinuationPlan(detail.continuationPlan || null, window.__continuationPlan || null),
        mergeContinuationPlan(window.continuationPlan || null, runtimeContext.continuationPlan || null)
      ),
      preload: mergePreload(
        mergePreload(detail.preload || [], window.__preload || []),
        mergePreload(window.preload || [], runtimeContext.preload || [])
      ),
      context: {
        ...detail.context,
        source: detail.source || 'runtime_callback',
        label: detail.label || '',
        detail
      }
    };
  }
  function dispatchRuntimeCallbackRequest(trigger, detail = {}) {
    addEvent('runtime_callback_requested', { trigger, detail });
    if (typeof window.requestAiGeneration !== 'function') {
      addDecision('Blocked because: Runtime AI callback requested before requestAiGeneration was available.', { trigger, detail });
      return null;
    }
    return window.requestAiGeneration(createRuntimeRequestFromSource(trigger, detail));
  }
  function runtimeTriggerFromElement(element) {
    if (!element) return '';
    return element.dataset.aiTrigger
      || element.dataset.runtimeTrigger
      || element.dataset.generationTrigger
      || element.dataset.preloadTrigger
      || element.dataset.trigger
      || element.getAttribute('data-ai-trigger')
      || element.getAttribute('data-runtime-trigger')
      || element.getAttribute('data-generation-trigger')
      || '';
  }
  function installRuntimeCallbackBridge() {
    if (window.__creatiaRuntimeCallbackBridgeInstalled) return;
    window.__creatiaRuntimeCallbackBridgeInstalled = true;
    runtimeCallbackEvents.forEach((eventName) => {
      window.addEventListener(eventName, (event) => {
        const detail = event?.detail && typeof event.detail === 'object' ? event.detail : {};
        dispatchRuntimeCallbackRequest(detail.trigger || eventName, { ...detail, source: eventName });
      });
    });
    document.addEventListener('click', (event) => {
      const target = event.target?.closest?.('button, [role="button"], a, [data-ai-trigger], [data-runtime-trigger], [data-generation-trigger], [data-preload-trigger], [data-trigger]');
      if (!target || target.closest?.('.creatia-runtime-debug-panel')) return;
      const trigger = runtimeTriggerFromElement(target);
      const needsAi = trigger
        || target.dataset.aiCallback === 'true'
        || target.dataset.needsGeneration === 'true'
        || target.getAttribute('aria-haspopup') === 'dialog' && /ai|generation|continue|next/i.test(target.textContent || '');
      if (!needsAi) return;
      if (target.dataset.creatiaRuntimeRequestPending === 'true') {
        addDecision('Blocked because: Request already in progress for this in-game AI callback button.', { trigger });
        return;
      }
      target.dataset.creatiaRuntimeRequestPending = 'true';
      dispatchRuntimeCallbackRequest(trigger || 'button_ai_callback', {
        source: 'button_click',
        label: (target.textContent || '').trim(),
        dataset: { ...target.dataset },
        href: target.getAttribute('href') || ''
      })?.finally?.(() => {
        delete target.dataset.creatiaRuntimeRequestPending;
      });
    }, true);
    const maybeWrapEmit = () => {
      if (typeof window.emit !== 'function' || window.emit.__creatiaRuntimeWrapped) return;
      const originalEmit = window.emit;
      window.emit = function creatiaRuntimeEmit(eventName, detail, ...rest) {
        const result = originalEmit.apply(this, [eventName, detail, ...rest]);
        if (runtimeCallbackEvents.includes(eventName)) {
          dispatchRuntimeCallbackRequest(detail?.trigger || eventName, { ...(detail || {}), source: 'emit' });
        }
        return result;
      };
      window.emit.__creatiaRuntimeWrapped = true;
    };
    maybeWrapEmit();
    window.setInterval(maybeWrapEmit, 1500);
  }
  function hasConsumableRuntimePayload(runtimePayload) {
    if (!runtimePayload || typeof runtimePayload !== 'object') return false;
    const room = runtimePayload.room && typeof runtimePayload.room === 'object' ? runtimePayload.room : null;
    const page = runtimePayload.page && typeof runtimePayload.page === 'object' ? runtimePayload.page : null;
    const screen = runtimePayload.screen && typeof runtimePayload.screen === 'object' ? runtimePayload.screen : null;
    const statePatch = runtimePayload.statePatch && typeof runtimePayload.statePatch === 'object' ? runtimePayload.statePatch : null;
    return Boolean(
      runtimePayload.narrative
      || runtimePayload.title
      || runtimePayload.text
      || runtimePayload.summary
      || runtimePayload.description
      || runtimePayload.htmlFragment
      || runtimePayload.route
      || (Array.isArray(runtimePayload.choices) && runtimePayload.choices.length)
      || (Array.isArray(runtimePayload.nextChoices) && runtimePayload.nextChoices.length)
      || (room && (room.narrative || room.description || room.choices?.length || room.nextChoices?.length))
      || (page && (page.title || page.text || page.summary || page.description || page.htmlFragment || page.choices?.length || page.bullets?.length || page.chips?.length))
      || (screen && (screen.title || screen.text || screen.summary || screen.description || screen.htmlFragment || screen.choices?.length || screen.bullets?.length || screen.chips?.length))
      || (statePatch && Object.keys(statePatch).length)
    );
  }
  function buildRuntimeErrorPayload(error, status = 'error') {
    return {
      kind: 'runtime_error',
      status: 'error',
      error,
      statePatch: {
        loading: false,
        isLoading: false,
        pending: false,
        busy: false,
        aiStatus: 'error',
        runtimeStatus: status,
        error
      }
    };
  }
  function deliverRuntimeError(error, status = 'error') {
    const payload = buildRuntimeErrorPayload(error, status);
    if (typeof window.applyRuntimePayload === 'function') window.applyRuntimePayload(payload);
    if (typeof window.onAiResponse === 'function') window.onAiResponse({ ok: false, responseType: 'generation_error', payload });
    return payload;
  }
  function clearRuntimeLoadingState(triggerElement) {
    const candidates = [
      triggerElement,
      document.activeElement,
      ...Array.from(document.querySelectorAll('[data-creatia-runtime-request-pending="true"], [data-loading="true"], [aria-busy="true"], button:disabled'))
    ].filter(Boolean);
    candidates.forEach((element) => {
      if (!element || !element.matches?.('button, [role="button"], a, [data-creatia-runtime-request-pending], [data-loading], [aria-busy]')) return;
      element.removeAttribute('disabled');
      element.setAttribute('aria-busy', 'false');
      delete element.dataset.creatiaRuntimeRequestPending;
      if (element.dataset.loading === 'true') element.dataset.loading = 'false';
      element.classList?.remove('loading', 'is-loading', 'pending', 'is-pending');
    });
  }
  const pendingRuntimeRequests = new Map();
  const pendingRuntimeRequestElements = new Map();
  window.addEventListener('message', (event) => {
    if (event.data?.source === 'creatia-host' && event.data?.type === 'creatia-runtime-host-log') {
      addEvent(event.data.step || 'host_log', { message: event.data.message, requestId: event.data.requestId, ...(event.data.detail || {}) });
      return;
    }
    if (event.data?.source !== 'creatia-host' || event.data?.type !== 'ai-runtime-generation-result') return;
    const requestId = event.data.requestId;
    const entry = debugState.aiRequests.find((item) => item.requestId === requestId);
    if (entry) {
      entry.status = event.data.ok ? 'Completed' : 'Failed';
      entry.durationMs = entry.startedAt ? Math.round(performance.now() - entry.startedAt) : entry.durationMs;
      end('Runtime AI generation result · ' + entry.trigger, Boolean(event.data.ok));
    }
    const triggerElement = pendingRuntimeRequestElements.get(requestId) || null;
    pendingRuntimeRequestElements.delete(requestId);
    const runtimePayload = event.data.runtimePayload || null;
    debugState.lastResponse = { type: event.data.responseType || 'runtime_generation', payload: runtimePayload || event.data.payload || event.data };
    debugState.aiResponses.unshift({ timestamp: now(), type: debugState.lastResponse.type, payload: debugState.lastResponse.payload });
    debugState.aiResponses = debugState.aiResponses.slice(0, 30);
    addEvent(event.data.ok ? 'generation_completed' : 'generation_failed', { requestId, responseType: debugState.lastResponse.type });
    const hasRuntimePayload = Boolean(runtimePayload && Object.keys(runtimePayload).length);
    const hasConsumablePayload = hasConsumableRuntimePayload(runtimePayload);
    const effectiveRuntimePayload = hasConsumablePayload ? runtimePayload : {
      kind: 'empty_runtime_payload',
      narrative: 'La réponse IA a été reçue, mais elle ne contenait pas de contenu directement applicable.',
      choices: [],
      nextChoices: [],
      statePatch: { loading: false, isLoading: false, pending: false }
    };
    const hasRuntimePayloadConsumer = typeof window.applyRuntimePayload === 'function';
    const hasConsumer = typeof window.onAiResponse === 'function'
      || hasRuntimePayloadConsumer
      || typeof window.applyGeneratedContent === 'function'
      || typeof window.applyGeneratedRoom === 'function';
    const resolver = pendingRuntimeRequests.get(requestId);
    if (!event.data.ok) {
      clearRuntimeLoadingState(triggerElement);
      const errorPayload = buildRuntimeErrorPayload(event.data.payload?.error || 'Runtime generation failed.', 'failed');
      if (resolver) {
        pendingRuntimeRequests.delete(requestId);
        resolver({ ...event.data, status: 'error', error: errorPayload.error, payload: errorPayload, runtimePayload: errorPayload, statePatch: errorPayload.statePatch });
      }
      if (hasRuntimePayloadConsumer) window.applyRuntimePayload(errorPayload);
      renderDiagnostics();
      return;
    }
    if (resolver) {
      pendingRuntimeRequests.delete(requestId);
      resolver({
        ...event.data,
        status: event.data.status === 'completed' ? 'ok' : event.data.status || 'ok',
        hostStatus: event.data.status || 'completed',
        payload: effectiveRuntimePayload,
        runtimePayload: effectiveRuntimePayload,
        statePatch: effectiveRuntimePayload.statePatch || {}
      });
    }
    if (event.data.ok && !hasRuntimePayload) addDecision('AI response received but runtimePayload is missing or empty.', { requestId });
    if (event.data.ok && !hasConsumablePayload) {
      addDecision('AI response received but no consumable runtimePayload was produced.', { requestId, runtimePayload });
      clearRuntimeLoadingState(triggerElement);
    }
    if (event.data.ok && !hasConsumer) addDecision('AI response received but no runtime consumer function was found. Applying host fallback renderer.', { requestId });
    if (typeof window.onAiResponse === 'function') window.onAiResponse(event.data);
    if (event.data.ok && hasRuntimePayloadConsumer) window.applyRuntimePayload(effectiveRuntimePayload);
    if (event.data.ok && !hasRuntimePayloadConsumer) applyRuntimePayloadFallback(effectiveRuntimePayload);
    if (event.data.ok && typeof window.applyGeneratedContent === 'function') window.applyGeneratedContent(event.data.payload);
    if (event.data.ok && typeof window.applyGeneratedRoom === 'function') window.applyGeneratedRoom(effectiveRuntimePayload?.room || effectiveRuntimePayload);
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
      addEvent('runtime_error', { status: 'unavailable', message: diagnostics.lastAiError });
      const payload = deliverRuntimeError(diagnostics.lastAiError, 'unavailable');
      return { status: 'unavailable', error: diagnostics.lastAiError, payload, runtimePayload: payload, statePatch: payload.statePatch };
    }
    if (diagnostics.pendingRequests > 0) {
      addDecision('Blocked because: Request already in progress.', { pendingRequests: diagnostics.pendingRequests });
      addEvent('runtime_error', { status: 'blocked', message: 'A runtime generation request is already pending.' });
      const payload = deliverRuntimeError('A runtime generation request is already pending.', 'blocked');
      return { status: 'blocked', error: 'A runtime generation request is already pending.', payload, runtimePayload: payload, statePatch: payload.statePatch };
    }
    const runtimeRequest = {
      requestId: request.requestId || 'runtime-' + Date.now() + '-' + Math.random().toString(16).slice(2),
      trigger: request.trigger || 'runtime_generation',
      state: request.state || {},
      continuationPlan: mergeContinuationPlan(
        mergeContinuationPlan(request.continuationPlan || null, window.__continuationPlan || null),
        mergeContinuationPlan(window.continuationPlan || null, runtimeContext.continuationPlan || null)
      ),
      preload: mergePreload(
        mergePreload(request.preload || [], window.__preload || []),
        mergePreload(window.preload || [], runtimeContext.preload || [])
      ),
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
    const triggerElement = document.activeElement?.matches?.('button, [role="button"], a') ? document.activeElement : null;
    if (triggerElement) pendingRuntimeRequestElements.set(runtimeRequest.requestId, triggerElement);
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
        const triggerElement = pendingRuntimeRequestElements.get(runtimeRequest.requestId) || null;
        pendingRuntimeRequestElements.delete(runtimeRequest.requestId);
        requestEntry.status = 'Failed';
        addDecision('Blocked because: runtime generation response timed out.', { requestId: runtimeRequest.requestId });
        clearRuntimeLoadingState(triggerElement);
        addEvent('runtime_error', { status: 'timeout', message: 'Runtime generation response timed out.' });
        const payload = deliverRuntimeError('Runtime generation response timed out.', 'timeout');
        end('Runtime AI generation timed out · ' + runtimeRequest.trigger, false);
        resolve({ status: 'timeout', error: payload.error, request: runtimeRequest, payload, runtimePayload: payload, statePatch: payload.statePatch });
      }, 45000);
    });
  };
  syncGeneratedStatusText();
  window.dispatchEvent(new CustomEvent('creatia-runtime-ready', { detail: { diagnostics: { ...diagnostics } } }));
  document.dispatchEvent(new CustomEvent('creatia-runtime-ready', { detail: { diagnostics: { ...diagnostics } } }));
  installRuntimeCallbackBridge();
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
  const guards = [
    source.includes('data-creatia-ui-guard="start-panel"') ? '' : `${buildStartPanelGuardStyle()}${buildStartPanelGuardScript()}`,
    source.includes('data-creatia-ui-guard="ai-activity"') ? '' : buildAiActivityMonitor(runtimeContext)
  ].join('')

  if (!guards) return source
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
