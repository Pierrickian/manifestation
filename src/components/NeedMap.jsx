import { NEED_BY_ID } from '../data/needs'
import { getWizardDiscovery } from '../logic/wizardScoring'
import { NeedBadge } from './NeedBadge'

function getStepNeed(step) {
  const discovery = getWizardDiscovery([step])
  return discovery.dominantNeed || NEED_BY_ID[Object.keys(step?.scores || {})[0]] || null
}

export function NeedMap({ steps, discovery, links }) {
  const hasSteps = steps.length > 0
  const activeNeedLinks = links?.needLinks?.filter((link) => link.strength === 'active') || []

  return (
    <aside className="need-map" aria-label="Carte du chemin intérieur">
      <div className="map-header">
        <div>
          <p className="eyebrow">Carte vivante</p>
          <strong>Le chemin que tu explores</strong>
        </div>
        {discovery?.dominantNeed ? <NeedBadge need={discovery.dominantNeed} subtle /> : null}
      </div>

      {hasSteps ? (
        <ol className="need-map-track">
          {steps.map((step, index) => {
            const need = getStepNeed(step)
            return (
              <li className="need-map-node" key={`${step.type}-${step.id}-${index}`} style={{ '--need-color': need?.uiColor }}>
                <span className="need-dot" aria-hidden="true" />
                <div>
                  <small>{step.kicker}</small>
                  <strong>{step.label}</strong>
                  {need ? <em>{need.name} · {need.needLabel}</em> : null}
                </div>
              </li>
            )
          })}
        </ol>
      ) : (
        <p className="empty-map">Ton paysage apparaîtra ici au fil de tes choix.</p>
      )}

      {activeNeedLinks.length > 0 ? (
        <div className="link-strip" aria-label="Liens actifs entre besoins">
          {activeNeedLinks.map((link) => (
            <span key={link.id}>
              {link.sourceLabel} → {link.targetLabel}
            </span>
          ))}
        </div>
      ) : null}
    </aside>
  )
}
