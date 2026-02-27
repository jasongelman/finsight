import { Tooltip } from '../shared/Tooltip';
import { TOOLTIPS } from '../../data/tooltipContent';
import { formatCurrency, formatPercent } from '../../utils/formatters';

export function BestOptionCard({ results }) {
  const best = results.find((r) => r.isCheapest);
  if (!best) return null;

  return (
    <div className="best-option-card">
      <div className="best-badge">★ Best Estimated Deal</div>

      <div className="best-option-main">
        <div className="best-option-name">{best.label}</div>
        <div className="best-option-desc">{best.description}</div>
      </div>

      <div className="best-metrics">
        <div className="best-metric">
          <div className="best-metric-label">
            Total Cost
            <Tooltip content={TOOLTIPS.totalCost} />
          </div>
          <div className="best-metric-value">{formatCurrency(best.totalCost)}</div>
          <div className="best-metric-sub">{best.termMonths} month term</div>
        </div>

        <div className="best-metric">
          <div className="best-metric-label">
            SAC
            <Tooltip content={TOOLTIPS.sac} />
          </div>
          <div className="best-metric-value">{formatPercent(best.sac)}</div>
          <div className="best-metric-sub">annualized cost</div>
        </div>

        <div className="best-metric">
          <div className="best-metric-label">
            % Free Cashflow
            <Tooltip content={TOOLTIPS.freeCashflowPct} />
          </div>
          <div className="best-metric-value">{formatPercent(best.freeCashflowPct)}</div>
          <div className="best-metric-sub">of monthly FCF</div>
        </div>

        <div className="best-metric">
          <div className="best-metric-label">Avg Monthly</div>
          <div className="best-metric-value">{formatCurrency(best.monthlyPayment)}</div>
          <div className="best-metric-sub">per month</div>
        </div>
      </div>

      {best.eligibilityWarnings && best.eligibilityWarnings.length > 0 && (
        <div className="best-warnings">
          {best.eligibilityWarnings.map((w, i) => (
            <span key={i} className="warning-chip">⚠ {w}</span>
          ))}
        </div>
      )}
    </div>
  );
}
