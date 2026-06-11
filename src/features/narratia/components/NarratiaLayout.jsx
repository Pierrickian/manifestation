export function NarratiaLayout({ eyebrow, title, intro, children, footer }) {
  return (
    <section className="narratia-panel" aria-labelledby="narratia-title">
      <div className="narratia-panel__glow" aria-hidden="true" />
      <div className="narratia-heading">
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h2 id="narratia-title">{title}</h2>
        {intro ? <p>{intro}</p> : null}
      </div>
      <div className="narratia-content">{children}</div>
      {footer ? <div className="narratia-footer">{footer}</div> : null}
    </section>
  )
}
