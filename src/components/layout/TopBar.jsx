import { useState, useEffect } from 'react';
import { RatesStatus } from '../shared/RatesStatus';
import { ExportControls } from '../export/ExportControls';

const TABS = [
  { id: 'compare', label: 'Compare' },
  { id: 'optimize', label: 'Optimize' },
  { id: 'learn', label: 'Learn' },
];

function scrollTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
}

export function TopBar({ rates, ratesStatus, results, inputs }) {
  const [activeSection, setActiveSection] = useState('compare');

  useEffect(() => {
    const ids = TABS.map((t) => t.id);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-45% 0px -45% 0px' },
    );

    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="top-bar">
      <div className="top-bar-logo">
        <span className="top-bar-mark">FS</span>
        <span className="top-bar-name">FINSIGHT</span>
      </div>

      <div className="top-bar-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`top-bar-tab${activeSection === tab.id ? ' active' : ''}`}
            onClick={() => scrollTo(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="top-bar-spacer" />

      <div className="top-bar-rates">
        <RatesStatus rates={rates} status={ratesStatus} compact />
      </div>

      <div className="top-bar-actions">
        <ExportControls results={results} inputs={inputs} compact />
      </div>
    </div>
  );
}
