import { NeedBadge } from './NeedBadge'

export function HistoryPanel({ history }) {
  if (!history.length) return null

  return (
    <section className="history-panel" aria-label="Historique des chemins">
      <div className="map-header">
        <div>
          <p className="eyebrow">Mémoire</p>
          <strong>Motifs récents</strong>
        </div>
      </div>

      <div className="history-list">
        {history.slice(0, 3).map((session) => {
          const dominant = session.needs?.[0]
          return (
            <article className="history-item" key={session.sessionId}>
              <small>{new Date(session.timestamp).toLocaleDateString('fr-FR')}</small>
              <strong>{session.feeling?.label}</strong>
              {dominant ? <NeedBadge need={dominant} subtle /> : null}
            </article>
          )
        })}
      </div>
    </section>
  )
}
