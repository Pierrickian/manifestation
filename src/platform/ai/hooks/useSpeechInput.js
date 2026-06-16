import { useRef, useState } from 'react'

function getSpeechRecognitionConstructor() {
  if (typeof window === 'undefined') return null
  return window.SpeechRecognition || window.webkitSpeechRecognition || null
}

export function useSpeechInput({ enabled = false, lang = 'fr-FR', onTranscript, onStatus } = {}) {
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef(null)
  const isSupported = Boolean(getSpeechRecognitionConstructor())

  function start() {
    if (!enabled) return
    const Recognition = getSpeechRecognitionConstructor()
    if (!Recognition) {
      onStatus?.('La dictée vocale n’est pas supportée par ce navigateur.')
      return
    }
    if (recognitionRef.current || isListening) return

    const recognition = new Recognition()
    recognition.lang = lang
    recognition.interimResults = false
    recognition.maxAlternatives = 1
    recognition.onstart = () => { setIsListening(true); onStatus?.('J’écoute…') }
    recognition.onend = () => { setIsListening(false); recognitionRef.current = null }
    recognition.onerror = () => onStatus?.('La dictée vocale a été interrompue. Tu peux réessayer.')
    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript || ''
      if (transcript) onTranscript?.(transcript.trim())
    }
    recognitionRef.current = recognition
    recognition.start()
  }

  function stop() { recognitionRef.current?.stop?.() }

  return { isListening, isSupported, start, stop }
}
