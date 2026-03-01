import { useState, useCallback } from 'react';
import { AppShell } from './components/layout/AppShell';
import { TopBar } from './components/layout/TopBar';
import { InputPanel } from './components/inputs/InputPanel';
import { SummaryBar } from './components/dashboard/SummaryBar';
import { TradeoffChart } from './components/dashboard/TradeoffChart';
import { ComparisonTable } from './components/dashboard/ComparisonTable';
import { ScenarioAnalysis } from './components/dashboard/ScenarioAnalysis';
import { GlossaryView } from './components/dashboard/GlossaryView';
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

  const { rates, status: ratesStatus } = useLiveRates();

  const updateInput = useCallback((key, value) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  }, []);

  const results = useFinancingResults(inputs, rates);

  return (
    <AppShell>
      <TopBar
        rates={rates}
        ratesStatus={ratesStatus}
        results={results}
        inputs={inputs}
      />

      <InputPanel inputs={inputs} onUpdate={updateInput} />

      <main className="main-content">
        {/* ── Compare ── */}
        <section id="compare">
          <SummaryBar results={results} />
          <div className="compare-grid">
            <TradeoffChart results={results} />
            <ComparisonTable results={results} />
          </div>
        </section>

        {/* ── Optimize ── */}
        <div className="section-divider">Optimize</div>
        <section id="optimize">
          <ScenarioAnalysis
            baseInputs={inputs}
            baseResults={results}
            liveRates={rates}
          />
        </section>

        {/* ── Learn ── */}
        <div className="section-divider">Learn</div>
        <section id="learn">
          <GlossaryView />
        </section>
      </main>
    </AppShell>
  );
}
