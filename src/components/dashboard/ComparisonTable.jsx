import { useSort } from '../../hooks/useSort';
import { Tooltip } from '../shared/Tooltip';
import { TOOLTIPS } from '../../data/tooltipContent';
import { formatCurrency, formatPercent, formatMonths } from '../../utils/formatters';

const COLUMNS = [
  { key: 'label',           label: 'Option',        sortable: false },
  { key: 'totalCost',       label: 'Total Cost',     sortable: true,  tooltip: TOOLTIPS.totalCost },
  { key: 'sac',             label: 'SAC',            sortable: true,  tooltip: TOOLTIPS.sac },
  { key: 'vsCheapest',      label: 'VS Cheapest',    sortable: true,  tooltip: TOOLTIPS.vsCheapest },
  { key: 'freeCashflowPct', label: '% Cashflow',     sortable: true,  tooltip: TOOLTIPS.freeCashflowPct },
  { key: 'monthlyPayment',  label: 'Avg Monthly',    sortable: true,  tooltip: TOOLTIPS.avgMonthly },
  { key: 'termMonths',      label: 'Term',           sortable: true },
];

function sacClass(sac) {
  if (sac < 15) return 'sac-low';
  if (sac < 40) return 'sac-mid';
  return 'sac-high';
}

function vsCheapestClass(val) {
  if (val === 0) return 'vs-cheapest-zero';
  if (val < 5000) return 'vs-cheapest-low';
  return 'vs-cheapest-high';
}

function cashflowColor(pct) {
  if (pct < 20) return 'var(--accent-green)';
  if (pct < 40) return 'var(--accent-amber)';
  return 'var(--accent-red)';
}

export function ComparisonTable({ results }) {
  const { sorted, sortKey, sortDir, onSort } = useSort(results, 'totalCost', 'asc');

  if (!sorted || sorted.length === 0) return null;

  return (
    <div className="comparison-table-section">
      <div className="section-header">
        <span className="section-title">Comparison</span>
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          Click column headers to sort
        </span>
      </div>

      <table className="comparison-table">
        <thead>
          <tr>
            {COLUMNS.map((col) => (
              <th
                key={col.key}
                className={col.sortable ? 'sortable' : ''}
                data-active={sortKey === col.key}
                onClick={() => col.sortable && onSort(col.key)}
              >
                {col.label}
                {col.tooltip && <Tooltip content={col.tooltip} />}
                {col.sortable && sortKey === col.key && (
                  <span className="sort-indicator">{sortDir === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row) => (
            <tr key={row.id} className={row.isCheapest ? 'row-best' : ''}>
              {/* Option name */}
              <td>
                <div className="option-cell">
                  <span className="option-dot" style={{ backgroundColor: row.color }} />
                  <span className="option-name">{row.label}</span>
                  {row.isCheapest && <span className="option-badge-best">Best</span>}
                </div>
              </td>

              {/* Total Cost */}
              <td>{formatCurrency(row.totalCost)}</td>

              {/* SAC */}
              <td>
                <span className="sac-value">
                  {formatPercent(row.sac)}
                  <span className={`sac-pill ${sacClass(row.sac)}`}>
                    {row.sac < 15 ? 'Low' : row.sac < 40 ? 'Mid' : 'High'}
                  </span>
                </span>
              </td>

              {/* VS Cheapest */}
              <td className={vsCheapestClass(row.vsCheapest)}>
                {row.isCheapest ? '— cheapest' : `+${formatCurrency(row.vsCheapest)}`}
              </td>

              {/* % Cashflow */}
              <td>
                <div className="cashflow-cell">
                  <div className="cashflow-bar-track">
                    <div
                      className="cashflow-bar-fill"
                      style={{
                        width: `${Math.min(row.freeCashflowPct, 100)}%`,
                        backgroundColor: cashflowColor(row.freeCashflowPct),
                      }}
                    />
                  </div>
                  <span>{formatPercent(row.freeCashflowPct)}</span>
                </div>
              </td>

              {/* Avg Monthly */}
              <td>{formatCurrency(row.monthlyPayment)}</td>

              {/* Term */}
              <td style={{ color: 'var(--text-secondary)' }}>{formatMonths(row.termMonths)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
