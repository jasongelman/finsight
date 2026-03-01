import { useState, useCallback, useMemo } from 'react';
import { AppShell } from './components/layout/AppShell';
import { TopBar } from './components/layout/TopBar';
import { InputPanel } from './components/inputs/InputPanel';
import { SummaryBar } from './components/dashboard/SummaryBar';
import { FilterBar, matchesFilter } from './components/dashboard/FilterBar';
import { TradeoffChart } from './components/dashboard/TradeoffChart';
import { ComparisonTable } from './components/dashboard/ComparisonTable';
import { CostBreakdown } from './components/dashboard/CostBreakdown';
import { AffordabilityTool } from './components/dashboard/AffordabilityTool';
import { ScenarioAnalysis } from './components/dashboard/ScenarioAnalysis';
import { SensitivityChart } from './components/dashboard/SensitivityChart';
import { FundingTimeline } from './components/dashboard/FundingTimeline';
import { GlossaryView } from './components/dashboard/GlossaryView';
import { MethodologyPanel } from './components/dashboard/MethodologyPanel';
import { useFinancingResults } from './hooks/useFinancingResults';
import { useLiveRates } from './hooks/useLiveRates';
import { parseShareParams } from './utils/exportHelpers';

const DEFAULT_INPUTS = {
  principal: 100000,
  annualRevenue: 500000,
  businessAge: 3,
  creditScore: 700,
};

// Initialise inputs from share URL params if present
const INITIAL_INPUTS = parseShareParams() ?? DEFAULT_INPUTS;

export default function App() {
  const [inputs, setInputs] = useState(INITIAL_INPUTS);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');

  const { rates, status: ratesStatus } = useLiveRates();

  const updateInput = useCallback((key, value) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  }, []);

  const rawResults = useFinancingResults(inputs, rates);

  // Tag results with _matchesFilter for dimming
  const results = useMemo(() => {
    if (!rawResults) return rawResults;
    return rawResults.map((r) => ({
      ...r,
      _matchesFilter: activeFilter === 'all' ? true : matchesFilter(r, activeFilter, rawResults),
    }));
  }, [rawResults, activeFilter]);

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
          <SummaryBar results={results} selectedProduct={selectedProduct} />
          <FilterBar activeFilter={activeFilter} onFilterChange={setActiveFilter} />
          <div className="compare-grid">
            <TradeoffChart
              results={results}
              selectedProduct={selectedProduct}
              onSelectProduct={setSelectedProduct}
              activeFilters={activeFilter !== 'all' ? [activeFilter] : []}
            />
            <ComparisonTable
              results={results}
              selectedProduct={selectedProduct}
              onSelectProduct={setSelectedProduct}
            />
          </div>
          <div className="compare-bottom-grid">
            <CostBreakdown results={results} />
            <AffordabilityTool liveRates={rates} />
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
          <div className="optimize-bottom-grid">
            <SensitivityChart inputs={inputs} liveRates={rates} />
            <FundingTimeline results={results} />
          </div>
        </section>

        {/* ── Learn ── */}
        <div className="section-divider">Learn</div>
        <section id="learn">
          <GlossaryView results={results} inputs={inputs} />
          <MethodologyPanel />
        </section>
      </main>
    </AppShell>
  );
}
