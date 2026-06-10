import { NEED_BY_ID } from '../data/needs'

export function NeedMap({ path }) {
  if (path.length === 0) return null

  return (
    <aside className="need-map" aria-label="Chemin découvert">
      <p className="eyebrow">Chemin</p>
      <div className="need-map-track">
        {path.map((step, index) => {
          const need = NEED_BY_ID[step.needIds[0]]
          return (
            <div className="need-map-node" key={`${step.id}-${index}`}>
              <span className={`need-dot need-dot-${need?.id || 'neutral'}`} />
              <div>
                <strong>{step.label}</strong>
                {need ? <small>{need.color} · {need.label}</small> : null}
              </div>
            </div>
          )
        })}
      </div>
    </aside>
  )
}
