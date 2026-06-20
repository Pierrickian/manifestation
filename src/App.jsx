import React from 'react'
import AppShell from './app/App'

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('[Creatia App Error]', error, info)
  }

  resetApp = () => {
    try {
      localStorage.clear()
    } catch {
      // Ignore storage errors; reloading still gives the app a clean render attempt.
    }
    window.location.reload()
  }

  render() {
    if (this.state.error) {
      return (
        <main className="manifestation-shell" role="alert">
          <section className="wizard-card">
            <p className="eyebrow">Creatia</p>
            <h1>Impossible d’afficher l’aperçu.</h1>
            <p>Une erreur de rendu a été interceptée au lieu de laisser la preview vide.</p>
            <pre className="create-app-status error">{this.state.error?.message || 'Erreur inconnue'}</pre>
            <button type="button" className="primary-action" onClick={this.resetApp}>Réinitialiser et relancer</button>
          </section>
        </main>
      )
    }

    return this.props.children
  }
}

export default function App() {
  return (
    <AppErrorBoundary>
      <AppShell />
    </AppErrorBoundary>
  )
}
