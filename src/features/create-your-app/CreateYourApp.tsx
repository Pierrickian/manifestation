import { useRef, useState } from 'react'
import { submitCreateYourAppRequest, type CreateYourAppConfig, type CreateYourAppContext, type CreateYourAppSubmitResult } from './createYourApp'

type SpeechRecognitionConstructor = new () => SpeechRecognition

type SpeechRecognition = {
  lang: string
  interimResults: boolean
  maxAlternatives: number
  onstart: (() => void) | null
  onend: (() => void) | null
  onerror: ((event: { error?: string }) => void) | null
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null
  start: () => void
  stop: () => void
}

type CreateYourAppTargetOption = {
  id: string
  label: string
  description?: string
}

type CreateYourAppProps = {
  config: CreateYourAppConfig
  initialText?: string
  context?: CreateYourAppContext
  targetOptions?: CreateYourAppTargetOption[]
  speechLang?: string
  onClose: () => void
  onSuccess?: (result: CreateYourAppSubmitResult) => void
}

type SubmitStatus = 'idle' | 'submitting' | 'success' | 'error'

const NEW_APP_TARGET_ID = 'new-app'

function getSpeechRecognitionConstructor(): SpeechRecognitionConstructor | null {
  if (typeof window === 'undefined') return null
  const browserWindow = window as Window & {
    SpeechRecognition?: SpeechRecognitionConstructor
    webkitSpeechRecognition?: SpeechRecognitionConstructor
  }
  return browserWindow.SpeechRecognition || browserWindow.webkitSpeechRecognition || null
}

function appendTranscript(currentText: string, transcript: string) {
  const spacer = currentText.trim() ? '\n' : ''
  return `${currentText}${spacer}${transcript.trim()}`
}

export function CreateYourApp({
  config,
  initialText = '',
  context,
  targetOptions = [],
  speechLang = 'fr-FR',
  onClose,
  onSuccess
}: CreateYourAppProps) {
  const [requestText, setRequestText] = useState(initialText)
  const [targetId, setTargetId] = useState(NEW_APP_TARGET_ID)
  const [status, setStatus] = useState<SubmitStatus>('idle')
  const [message, setMessage] = useState('Décris l’app, son objectif, ses écrans et ce qu’elle doit éviter de casser.')
  const [githubUrl, setGithubUrl] = useState<string | null>(null)
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  function startVoiceInput() {
    const Recognition = getSpeechRecognitionConstructor()
    if (!Recognition) {
      setStatus('error')
      setMessage('La dictée vocale n’est pas supportée par ce navigateur. Tu peux écrire ta demande au clavier.')
      return
    }

    if (recognitionRef.current || isListening) return

    const recognition = new Recognition()
    recognition.lang = speechLang
    recognition.interimResults = false
    recognition.maxAlternatives = 1
    recognition.onstart = () => {
      setIsListening(true)
      setMessage('J’écoute… parle naturellement, une phrase finale suffit.')
    }
    recognition.onend = () => {
      setIsListening(false)
      recognitionRef.current = null
    }
    recognition.onerror = () => {
      setStatus('error')
      setMessage('La dictée vocale a été interrompue. Tu peux réessayer ou saisir le texte manuellement.')
    }
    recognition.onresult = (event) => {
      const firstResult = event.results[0]?.[0]?.transcript || ''
      if (firstResult) {
        setRequestText((currentText) => appendTranscript(currentText, firstResult))
        setStatus('idle')
        setMessage('Transcription ajoutée. Tu peux compléter ou envoyer la demande.')
      }
    }

    recognitionRef.current = recognition
    recognition.start()
  }

  function getSelectedTargetContext() {
    if (targetId === NEW_APP_TARGET_ID) {
      return {
        requestTarget: {
          type: 'new-app',
          label: 'Nouvelle app'
        }
      }
    }

    const selectedTarget = targetOptions.find((option) => option.id === targetId)
    return {
      requestTarget: {
        type: 'existing-app',
        appId: targetId,
        label: selectedTarget?.label || targetId
      }
    }
  }

  async function submitRequest() {
    setStatus('submitting')
    setMessage('Préparation de la demande…')
    setGithubUrl(null)

    try {
      const result = await submitCreateYourAppRequest({
        config,
        requestText,
        context: {
          ...(context || {}),
          ...getSelectedTargetContext()
        }
      })
      setStatus('success')
      setGithubUrl(result.url || null)
      setMessage(result.url ? 'Demande prête.' : `Demande créée${result.number ? ` #${result.number}` : ''}.`)
      onSuccess?.(result)
    } catch (error) {
      setStatus('error')
      setMessage(error instanceof Error ? error.message : 'Impossible d’envoyer la demande pour le moment.')
    }
  }

  return (
    <section className="create-app-panel" aria-labelledby="create-app-title">
      <div className="create-app-aurora" aria-hidden="true" />
      <div className="create-app-header">
        <p className="eyebrow">Portail d’inspiration</p>
        <h2 id="create-app-title">Crée ton App</h2>
        <p>Propose une app complète ou une évolution produit. Ta demande sera préparée pour rejoindre le portail de création.</p>
      </div>

      <label className="create-app-field">
        <span>Type de demande</span>
        <select className="create-app-select" value={targetId} onChange={(event) => setTargetId(event.target.value)}>
          <option value={NEW_APP_TARGET_ID}>Nouvelle app</option>
          {targetOptions.map((option) => (
            <option key={option.id} value={option.id}>{option.label}</option>
          ))}
        </select>
        <small>{targetId === NEW_APP_TARGET_ID ? 'La demande indiquera clairement qu’il s’agit d’une nouvelle app.' : 'La demande indiquera clairement l’app existante concernée.'}</small>
      </label>

      <label className="create-app-field">
        <span>Ton idée d’app</span>
        <textarea
          value={requestText}
          onChange={(event) => setRequestText(event.target.value)}
          placeholder="Ex: Je veux une app pour créer des routines du matin, avec choix vocaux, historique et suggestions personnalisées…"
          rows={9}
        />
      </label>

      <div className="create-app-actions">
        <button type="button" className={`ghost-action create-app-mic${isListening ? ' is-listening' : ''}`} onClick={startVoiceInput} disabled={status === 'submitting'}>
          {isListening ? '● Écoute…' : '🎙️ Micro'}
        </button>
        <button type="button" className="primary-action" onClick={submitRequest} disabled={status === 'submitting'}>
          {status === 'submitting' ? 'Envoi…' : 'Envoyer'}
        </button>
      </div>

      <div className={`create-app-status ${status}`} role="status">
        <strong>{status === 'idle' ? 'Info' : status}</strong>
        <span>{message}</span>
        {githubUrl ? <a href={githubUrl} target="_blank" rel="noreferrer">Ouvrir la demande</a> : null}
      </div>

      <button type="button" className="ghost-action" onClick={onClose}>Retour</button>
    </section>
  )
}
