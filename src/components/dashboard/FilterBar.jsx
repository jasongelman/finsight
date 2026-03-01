import { SPEED } from '../../data/speedData';

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'fast', label: 'Fast (<1 wk)' },
  { id: 'lowCost', label: 'Low Cost' },
  { id: 'lowMonthly', label: 'Low Monthly' },
  { id: 'eligible', label: 'Eligible Only' },
];

/**
 * Returns true if a result matches the given filter.
 * This is also exported so App.jsx can tag results with _matchesFilter.
 */
export function matchesFilter(result, filterId, results) {
  if (filterId === 'all') return true;

  if (filterId === 'fast') {
    const tier = SPEED[result.id]?.tier;
    return tier === 'fast';
  }

  if (filterId === 'lowCost') {
    // Bottom 3 by total cost
    const sorted = [...results].sort((a, b) => a.totalCost - b.totalCost);
    const threshold = sorted[Math.min(2, sorted.length - 1)]?.totalCost ?? Infinity;
    return result.totalCost <= threshold;
  }

  if (filterId === 'lowMonthly') {
    // Bottom 3 by monthly payment
    const sorted = [...results].sort((a, b) => a.monthlyPayment - b.monthlyPayment);
    const threshold = sorted[Math.min(2, sorted.length - 1)]?.monthlyPayment ?? Infinity;
    return result.monthlyPayment <= threshold;
  }

  if (filterId === 'eligible') {
    return !result.eligibilityWarnings?.some((w) => /requires?/i.test(w));
  }

  return true;
}

export function FilterBar({ activeFilter, onFilterChange }) {
  return (
    <div className="filter-bar">
      {FILTERS.map((f) => (
        <button
          key={f.id}
          className={`filter-pill${activeFilter === f.id ? ' active' : ''}`}
          onClick={() => onFilterChange(activeFilter === f.id ? 'all' : f.id)}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}
