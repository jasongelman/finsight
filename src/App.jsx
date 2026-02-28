import { useState, useCallback } from 'react';
import { AppShell } from './components/layout/AppShell';
import { Sidebar } from './components/layout/Sidebar';
import { InputPanel } from './components/inputs/InputPanel';
import { BestOptionCard } from './components/dashboard/BestOptionCard';
import { ComparisonTable } from './components/dashboard/ComparisonTable';
import { CostChart } from './components/dashboard/CostChart';
import { ScenarioAnalysis } from './components/dashboard/ScenarioAnalysis';
import { GlossaryView } from './components/dashboard/GlossaryView';
import { ExportControls } from './components/export/ExportControls';
import { RatesStatus } from './components/shared/RatesStatus';
import { useFinancingResults } from './hooks/useFinancingResults';
import { useLiveRates } from './hooks/useLiveRates';

const DEFAULT_INPUTS = {
  principal: 100000,
  annualRevenue: 500000,
  businessAge: 3,
  creditScore: 700,
};

export default function App() {
  const [inputs, setInputs] = useState(DEFAULT_INPUTS);
  const [activeView, setActiveView] = useState('dashboard');

  const { rates, status: ratesStatus } = useLiveRates();

  const updateInput = useCallback((key, value) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  }, []);

  const results = useFinancingResults(inputs, rates);

  return (
    <AppShell>
      <Sidebar activeView={activeView} onNavigate={setActiveView} />

      <main className="main-content">
        <header className="page-header">
          <div>
            <h1>Normalize financing options after comparable capital costs</h1>
            <p className="page-subtitle">
              Compare 7 financing products side-by-side using SAC — the fairest single cost metric.
              {rates?.live && ' Rates anchored to live Federal Reserve data.'}
            </p>
          </div>
          <ExportControls results={results} inputs={inputs} />
        </header>

        <InputPanel inputs={inputs} onUpdate={updateInput} />

        {activeView === 'dashboard' && (
          <>
            <BestOptionCard results={results} />
            <ComparisonTable results={results} />
            <CostChart results={results} />
          </>
        )}

        {activeView === 'strategy' && (
          <ScenarioAnalysis
            baseInputs={inputs}
            baseResults={results}
            liveRates={rates}
          />
        )}

        {activeView === 'glossary' && <GlossaryView />}

        <RatesStatus rates={rates} status={ratesStatus} />
      </main>
    </AppShell>
  );
}
