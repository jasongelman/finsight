import { FINANCING_TYPES, FINANCING_ORDER } from '../../data/financingTypes';

export function GlossaryView() {
  return (
    <div className="glossary-view">
      <div className="section-header">
        <span className="section-title">Financing Options — Reference Guide</span>
      </div>
      <div className="glossary-grid">
        {FINANCING_ORDER.map((id) => {
          const ft = FINANCING_TYPES[id];
          return (
            <div className="glossary-card" key={id}>
              <div className="glossary-card-header">
                <span className="glossary-dot" style={{ backgroundColor: ft.color }} />
                <span className="glossary-title">{ft.label}</span>
              </div>
              <p className="glossary-desc">{ft.description}</p>
              <div className="glossary-pros-cons">
                <div>
                  <div className="glossary-list-title pros-title">Pros</div>
                  <ul className="glossary-list pros-list">
                    {ft.pros.map((p, i) => <li key={i}>{p}</li>)}
                  </ul>
                </div>
                <div>
                  <div className="glossary-list-title cons-title">Cons</div>
                  <ul className="glossary-list cons-list">
                    {ft.cons.map((c, i) => <li key={i}>{c}</li>)}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
