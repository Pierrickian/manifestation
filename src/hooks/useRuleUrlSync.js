import { useEffect, useRef } from 'react'
import { DEFAULT_RULE_ID, hasRule } from '../core/engine/ruleRegistry.js'

const RULE_PATH_PREFIX = '/rules/'

function normalizeRuleId(ruleId) {
  return ruleId ? ruleId.trim().toLowerCase() : null
}

function getRuleFromPath(pathname) {
  const normalizedPath = pathname.replace(/\/+$/, '')
  if (!normalizedPath.startsWith(RULE_PATH_PREFIX)) return null

  return normalizeRuleId(decodeURIComponent(normalizedPath.slice(RULE_PATH_PREFIX.length).split('/')[0] || ''))
}

export function readRuleUrlState(location = window.location) {
  const searchParams = new URLSearchParams(location.search)
  const params = Object.fromEntries(searchParams.entries())
  const queryRule = normalizeRuleId(searchParams.get('rule') || searchParams.get('rule?'))
  const pathRule = getRuleFromPath(location.pathname)

  return {
    ruleId: queryRule || pathRule,
    source: queryRule ? 'query' : pathRule ? 'path' : 'none',
    params
  }
}

export function getInitialRuleIdFromUrl({ fallbackRuleId = DEFAULT_RULE_ID, isKnownRule = hasRule } = {}) {
  if (typeof window === 'undefined') return fallbackRuleId

  const { ruleId } = readRuleUrlState(window.location)
  return ruleId && isKnownRule(ruleId) ? ruleId : fallbackRuleId
}

function createRuleUrl(ruleId, location = window.location) {
  const url = new URL(location.href)
  url.pathname = '/'
  url.searchParams.set('rule', ruleId)
  return `${url.pathname}${url.search}${url.hash}`
}

function warnUnknownRule(ruleId) {
  if (!ruleId || import.meta.env.PROD) return

  console.warn(`[Manifestation] Unknown rule in URL: "${ruleId}". Falling back to the current default rule.`)
}

export function useRuleUrlSync({ activeRuleId, onRuleChange, isKnownRule = hasRule }) {
  const activeRuleIdRef = useRef(activeRuleId)
  const historyModeRef = useRef('replace')
  const onRuleChangeRef = useRef(onRuleChange)

  useEffect(() => {
    activeRuleIdRef.current = activeRuleId
  }, [activeRuleId])

  useEffect(() => {
    onRuleChangeRef.current = onRuleChange
  }, [onRuleChange])

  useEffect(() => {
    const { ruleId } = readRuleUrlState(window.location)
    if (ruleId && !isKnownRule(ruleId)) {
      warnUnknownRule(ruleId)
    }

    function handlePopState() {
      const nextUrlState = readRuleUrlState(window.location)
      const nextRuleId = nextUrlState.ruleId

      if (!nextRuleId) return

      if (!isKnownRule(nextRuleId)) {
        warnUnknownRule(nextRuleId)
        return
      }

      if (nextRuleId !== activeRuleIdRef.current) {
        historyModeRef.current = 'skip'
        onRuleChangeRef.current(nextRuleId)
      }
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [isKnownRule])

  useEffect(() => {
    const { ruleId } = readRuleUrlState(window.location)

    if (ruleId === activeRuleId) {
      historyModeRef.current = 'replace'
      return
    }

    const nextUrl = createRuleUrl(activeRuleId, window.location)
    const mode = historyModeRef.current
    historyModeRef.current = 'replace'

    if (mode === 'skip') return

    if (mode === 'push') {
      window.history.pushState({ ruleId: activeRuleId }, '', nextUrl)
      return
    }

    window.history.replaceState({ ruleId: activeRuleId }, '', nextUrl)
  }, [activeRuleId])

  function selectRuleFromUi(ruleId) {
    historyModeRef.current = 'push'
    onRuleChange(ruleId)
  }

  return { selectRuleFromUi }
}
