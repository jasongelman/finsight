import { useSort } from '../../hooks/useSort';
import { Tooltip } from '../shared/Tooltip';
import { TOOLTIPS } from '../../data/tooltipContent';
import { SPEED } from '../../data/speedData';
import { formatCurrency, formatPercent, formatMonths } from '../../utils/formatters';

const COLUMNS = [
  { key: 'rank',            label: '#',           sortable: false },
  { key: 'label',           label: 'Option',      sortable: false },
  { key: 'totalCost',       label: 'Total Cost',  sortable: true,  tooltip: TOOLTIPS.totalCost },
  { key: 'sac',             label: 'SAC',          sortable: true,  tooltip: TOOLTIPS.sac },
  { key: 'monthlyPayment',  label: 'Monthly',      sortable: true,  tooltip: TOOLTIPS.avgMonthly },
  { key: 'freeCashflowPct', label: 'FCF %',        sortable: true,  tooltip: TOOLTIPS.freeCashflowPct },
  { key: 'termMonths',      label: 'Term',         sortable: true },
  { key: 'speed',           label: 'Speed',        sortable: false },
  { key: 'eligibility',     label: 'Elig.',        sortable: false },
];

function sacCellClass(sac) {
  if (sac < 15) return 'sac-cell sac-cell-low';
  if (sac < 40) return 'sac-cell sac-cell-mid';
  return 'sac-cell sac-cell-high';
}

function isHardBlocked(row) {
  return row.eligibilityWarnings?.some((w) => /requires?/i.test(w));
}

export function ComparisonTable({ results }) {
  const { sorted, sortKey, sortDir, onSort } = useSort(results, 'totalCost', 'asc');

  if (!sorted || sorted.length === 0) return null;

  return (
    <div className="comparison-table-section">
      <div className="section-header">
        <span className="section-title">All Options</span>
        <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
          Click headers to sort
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
          {sorted.map((row, idx) => (
            <tr
              key={`${row.id}-${Math.round(row.totalCost)}`}
              className={row.isCheapest ? 'row-best' : ''}
            >
              {/* Rank */}
              <td>
                <span className="option-rank">{idx + 1}</span>
              </td>

              {/* Option name */}
              <td style={{ boxShadow: `inset 3px 0 0 ${row.color}` }}>
                <div className="option-cell">
                  <span className="option-name">{row.label}</span>
                  {row.isCheapest && <span className="option-badge-best">Best</span>}
                </div>
              </td>

              {/* Total Cost */}
              <td>{formatCurrency(row.totalCost)}</td>

              {/* SAC — heat map cell */}
              <td>
                <span className={sacCellClass(row.sac)}>
                  {formatPercent(row.sac)}
                </span>
              </td>

              {/* Monthly */}
              <td>{formatCurrency(row.monthlyPayment)}</td>

              {/* FCF % */}
              <td>{formatPercent(row.freeCashflowPct)}</td>

              {/* Term */}
              <td style={{ color: 'var(--text-secondary)' }}>{formatMonths(row.termMonths)}</td>

              {/* Speed */}
              <td>
                <span className="speed-cell">{SPEED[row.id]?.label ?? '—'}</span>
              </td>

              {/* Eligibility */}
              <td>
                {isHardBlocked(row) ? (
                  <span
                    className="eligibility-warn"
                    title={row.eligibilityWarnings?.join(', ')}
                  >
                    ⚠
                  </span>
                ) : row.eligibilityWarnings?.length ? (
                  <span
                    className="eligibility-warn"
                    title={row.eligibilityWarnings.join(', ')}
                  >
                    ⚠
                  </span>
                ) : (
                  <span className="eligibility-ok">✓</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
