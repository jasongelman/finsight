import { useState, useCallback } from 'react';
import { AppShell } from './components/layout/AppShell';
import { Sidebar } from './components/layout/Sidebar';
import { InputPanel } from './components/inputs/InputPanel';
import { BestOptionCard } from './components/dashboard/BestOptionCard';
import { ComparisonTable } from './components/dashboard/ComparisonTable';
import { CostChart } from './components/dashboard/CostChart';
import { WhatIfPanel } from './components/dashboard/WhatIfPanel';
import { GlossaryView } from './components/dashboard/GlossaryView';
import { ExportControls } from './components/export/ExportControls';
import { useFinancingResults } from './hooks/useFinancingResults';

const DEFAULT_INPUTS = {
  principal: 100000,
  annualRevenue: 500000,
  businessAge: 3,
  creditScore: 700,
};

export default function App() {
  const [inputs, setInputs] = useState(DEFAULT_INPUTS);
  const [activeView, setActiveView] = useState('dashboard');
  const [whatIfInputs, setWhatIfInputs] = useState(null);

  const updateInput = useCallback((key, value) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  }, []);

  const activeInputs = whatIfInputs ?? inputs;
  const results = useFinancingResults(activeInputs);

  return (
    <AppShell>
      <Sidebar activeView={activeView} onNavigate={setActiveView} />

      <main className="main-content">
        <header className="page-header">
          <div>
            <h1>Normalize financing options after comparable capital costs</h1>
            <p className="page-subtitle">
              Compare 7 financing products side-by-side using SAC — the fairest single cost metric.
            </p>
          </div>
          <ExportControls results={results} inputs={activeInputs} />
        </header>

        {/* Always show inputs */}
        <InputPanel inputs={inputs} onUpdate={updateInput} />

        {activeView === 'dashboard' && (
          <>
            <BestOptionCard results={results} />
            <ComparisonTable results={results} />
            <CostChart results={results} />
            <WhatIfPanel
              baseInputs={inputs}
              onScenarioChange={setWhatIfInputs}
              onReset={() => setWhatIfInputs(null)}
            />
          </>
        )}

        {activeView === 'whatif' && (
          <>
            <WhatIfPanel
              baseInputs={inputs}
              onScenarioChange={setWhatIfInputs}
              onReset={() => setWhatIfInputs(null)}
            />
            {whatIfInputs && (
              <>
                <BestOptionCard results={results} />
                <ComparisonTable results={results} />
                <CostChart results={results} />
              </>
            )}
          </>
        )}

        {activeView === 'glossary' && <GlossaryView />}
      </main>
    </AppShell>
  );
}
