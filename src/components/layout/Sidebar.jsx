const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: '◈' },
  { id: 'strategy',  label: 'Strategy',  icon: '⊕' },
  { id: 'glossary',  label: 'Glossary',  icon: '?' },
];

export function Sidebar({ activeView, onNavigate }) {
  return (
    <nav className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">$</div>
        <span className="logo-text">Finsight</span>
      </div>

      <div>
        <div className="nav-section-label">Navigation</div>
        <ul className="nav-list">
          {NAV_ITEMS.map((item) => (
            <li
              key={item.id}
              className={`nav-item${activeView === item.id ? ' active' : ''}`}
              onClick={() => onNavigate(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
