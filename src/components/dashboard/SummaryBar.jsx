import { useMemo } from 'react';
import { SPEED } from '../../data/speedData';
import { formatCurrency, formatPercent } from '../../utils/formatters';

export function SummaryBar({ results }) {
  const summary = useMemo(() => {
    if (!results || results.length === 0) return null;

    const eligible = results.filter(
      (r) => !r.eligibilityWarnings?.some((w) => /requires?/i.test(w)),
    );
    const pool = eligible.length ? eligible : results;
    const best = [...pool].sort((a, b) => a.totalCost - b.totalCost)[0];

    const costs = pool.map((r) => r.totalCost);
    const min = Math.min(...costs);
    const max = Math.max(...costs);

    return { best, min, max };
  }, [results]);

  if (!summary) return null;

  const { best, min, max } = summary;
  const speed = SPEED[best.id]?.label;

  return (
    <div className="summary-bar">
      <span className="summary-star">★</span>
      <span className="summary-best-label">Best:</span>
      <span className="summary-dot" style={{ backgroundColor: best.color }} />
      <span className="summary-best-label">{best.label}</span>
      <span className="summary-sep">·</span>
      <span className="summary-detail">{formatCurrency(best.totalCost)} total</span>
      <span className="summary-sep">·</span>
      <span className="summary-detail">{formatPercent(best.sac)} SAC</span>
      <span className="summary-sep">·</span>
      <span className="summary-detail">{formatCurrency(best.monthlyPayment)}/mo</span>
      {speed && (
        <>
          <span className="summary-sep">·</span>
          <span className="summary-detail">{speed}</span>
        </>
      )}
      <span className="summary-spread">
        Spread: {formatCurrency(min)} – {formatCurrency(max)}
      </span>
    </div>
  );
}
