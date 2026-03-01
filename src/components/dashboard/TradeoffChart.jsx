import { useMemo } from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
  ReferenceLine,
  ReferenceArea,
} from 'recharts';
import { formatCurrency } from '../../utils/formatters';

/* ── Quadrant label component ──────────────────────────────────────────────── */
function QuadrantLabels({ xMid, yMid, xMax, yMax }) {
  const labels = [
    { x: xMid * 0.25, y: yMax * 0.92, text: 'Low Cost\nHigh SAC', sub: 'Short-term trap', align: 'middle' },
    { x: xMax * 0.82, y: yMax * 0.92, text: 'High Cost\nHigh SAC', sub: 'Avoid', align: 'middle' },
    { x: xMid * 0.25, y: yMid * 0.25, text: 'Low Cost\nLow SAC', sub: '★ Sweet spot', align: 'middle' },
    { x: xMax * 0.82, y: yMid * 0.25, text: 'High Cost\nLow SAC', sub: 'Long-term play', align: 'middle' },
  ];

  return labels.map((l, i) => (
    <g key={i}>
      {l.text.split('\n').map((line, j) => (
        <text
          key={j}
          x={l.x}
          y={l.y + j * 11 - 4}
          textAnchor={l.align}
          fontSize={8}
          fontFamily="var(--font-sans)"
          fontWeight={600}
          fill="#d1d5db"
          style={{ pointerEvents: 'none' }}
        >
          {line}
        </text>
      ))}
      <text
        x={l.x}
        y={l.y + 18}
        textAnchor={l.align}
        fontSize={7}
        fontFamily="var(--font-sans)"
        fontWeight={500}
        fill={i === 2 ? '#2563EB' : '#d1d5db'}
        style={{ pointerEvents: 'none' }}
      >
        {l.sub}
      </text>
    </g>
  ));
}

/* ── Pareto frontier — connect non-dominated options ───────────────────────── */
function computePareto(data) {
  // Sort by totalCost ascending
  const sorted = [...data].sort((a, b) => a.totalCost - b.totalCost);
  const frontier = [];
  let minSAC = Infinity;
  for (const pt of sorted) {
    if (pt.sac <= minSAC) {
      frontier.push(pt);
      minSAC = pt.sac;
    }
  }
  return frontier;
}

/* ── Custom tooltip ────────────────────────────────────────────────────────── */
function CustomTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0].payload;
  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderLeft: `3px solid ${d.dimmed ? '#d1d5db' : d.color}`,
        borderRadius: 4,
        padding: '8px 12px',
        fontSize: 12,
        color: '#111827',
        lineHeight: 1.6,
        minWidth: 170,
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: 4 }}>{d.label}</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
        <span style={{ color: '#6b7280' }}>Total Cost</span>
        <strong style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>
          {formatCurrency(d.totalCost)}
        </strong>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
        <span style={{ color: '#6b7280' }}>SAC</span>
        <strong style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>
          {d.sac.toFixed(1)}%
        </strong>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
        <span style={{ color: '#6b7280' }}>Monthly</span>
        <strong style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>
          {formatCurrency(d.monthlyPayment)}
        </strong>
      </div>
      {d.hasWarnings && (
        <div style={{ color: '#d97706', fontSize: 11, marginTop: 4 }}>
          ⚠ Eligibility warnings
        </div>
      )}
      {d.isCheapest && (
        <div style={{ color: '#2563EB', fontWeight: 600, marginTop: 4, fontSize: 11 }}>
          ★ Lowest Total Cost
        </div>
      )}
    </div>
  );
}

/* ── Custom dot — supports selected, dimmed, and ineligible states ─────── */
function CustomDot(props) {
  const { cx, cy, payload } = props;
  if (!cx || !cy) return null;

  const isSelected = payload.selected;
  const isDimmed = payload.dimmed;
  const hasWarnings = payload.hasWarnings;
  const r = isSelected ? 9 : payload.isCheapest ? 8 : 6;

  if (isDimmed) {
    return (
      <g style={{ cursor: 'pointer' }}>
        <circle cx={cx} cy={cy} r={6} fill="none" stroke="#d1d5db" strokeWidth={1.5} opacity={0.5} />
      </g>
    );
  }

  return (
    <g style={{ cursor: 'pointer' }}>
      {/* Selection ring */}
      {isSelected && (
        <circle cx={cx} cy={cy} r={r + 4} fill="none" stroke="#2563EB" strokeWidth={2} opacity={0.4} />
      )}
      {/* Best option ring */}
      {payload.isCheapest && !isSelected && (
        <circle cx={cx} cy={cy} r={r + 3} fill="none" stroke="#2563EB" strokeWidth={2} opacity={0.5} />
      )}
      {/* Ineligible = outlined only */}
      {hasWarnings ? (
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={payload.color} strokeWidth={2} opacity={0.7} />
      ) : (
        <circle cx={cx} cy={cy} r={r} fill={payload.color} opacity={0.85} />
      )}
    </g>
  );
}

/* ── Custom label ──────────────────────────────────────────────────────────── */
function CustomLabel(props) {
  const { x, y, value, index } = props;
  const d = props.data?.[index];
  if (!d || d.dimmed) return null;
  return (
    <text
      x={x}
      y={y - (d.selected ? 16 : 12)}
      textAnchor="middle"
      fontSize={d.selected ? 11 : 10}
      fontWeight={d.selected || d.isCheapest ? 700 : 500}
      fontFamily="var(--font-sans)"
      fill={d.selected ? '#2563EB' : d.isCheapest ? '#2563EB' : '#6b7280'}
    >
      {value}
    </text>
  );
}

/* ── Pareto frontier as SVG path ───────────────────────────────────────────── */
function ParetoOverlay({ data, xScale, yScale }) {
  const frontier = useMemo(() => computePareto(data.filter((d) => !d.dimmed)), [data]);
  if (frontier.length < 2) return null;
  // We can't easily get the scale from Recharts, so we render as a Scatter
  return null; // Handled via ReferenceLine approach below
}

/* ── Main chart component ──────────────────────────────────────────────────── */
export function TradeoffChart({ results, selectedProduct, onSelectProduct, activeFilters = [] }) {
  if (!results || results.length === 0) return null;

  const chartData = useMemo(() => {
    return results.map((r) => {
      const hasWarnings = r.eligibilityWarnings?.length > 0;
      const dimmed = activeFilters.length > 0 && !activeFilters.includes('all') && !r._matchesFilter;
      return {
        id: r.id,
        shortLabel: r.shortLabel,
        label: r.label,
        totalCost: r.totalCost,
        sac: r.sac,
        monthlyPayment: r.monthlyPayment,
        color: r.color,
        isCheapest: r.isCheapest,
        hasWarnings,
        selected: selectedProduct === r.id,
        dimmed,
      };
    });
  }, [results, selectedProduct, activeFilters]);

  // Compute axis bounds for quadrant labels
  const costs = chartData.map((d) => d.totalCost);
  const sacs = chartData.map((d) => d.sac);
  const xMin = Math.min(...costs);
  const xMax = Math.max(...costs);
  const yMin = Math.min(...sacs);
  const yMax = Math.max(...sacs);
  const xMid = (xMin + xMax) / 2;
  const yMid = (yMin + yMax) / 2;
  const xPad = (xMax - xMin) * 0.15 || 1000;
  const yPad = (yMax - yMin) * 0.15 || 5;

  // Pareto frontier points for reference lines
  const frontier = useMemo(() => computePareto(chartData.filter((d) => !d.dimmed)), [chartData]);

  return (
    <div className="tradeoff-chart">
      <div className="section-header">
        <span className="section-title">Cost vs Efficiency</span>
        <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
          X = Total Cost · Y = SAC (annualized %)
        </span>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <ScatterChart
          margin={{ top: 20, right: 20, bottom: 10, left: 10 }}
          onClick={(e) => {
            if (e && e.activePayload) {
              const id = e.activePayload[0]?.payload?.id;
              if (id && onSelectProduct) {
                onSelectProduct(selectedProduct === id ? null : id);
              }
            }
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={true} />

          {/* Quadrant divider lines */}
          <ReferenceLine x={xMid} stroke="#f3f4f6" strokeDasharray="6 4" strokeWidth={1} />
          <ReferenceLine y={yMid} stroke="#f3f4f6" strokeDasharray="6 4" strokeWidth={1} />

          {/* Sweet-spot quadrant tint */}
          <ReferenceArea
            x1={xMin - xPad}
            x2={xMid}
            y1={yMin - yPad}
            y2={yMid}
            fill="#2563EB"
            fillOpacity={0.02}
          />

          <XAxis
            dataKey="totalCost"
            type="number"
            name="Total Cost"
            domain={[xMin - xPad, xMax + xPad]}
            tickFormatter={(val) => {
              if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
              if (val >= 1000) return `$${(val / 1000).toFixed(0)}k`;
              return `$${val}`;
            }}
            tick={{ fill: '#9ca3af', fontSize: 10, fontFamily: 'var(--font-mono)' }}
            axisLine={{ stroke: '#e5e7eb' }}
            tickLine={false}
          />
          <YAxis
            dataKey="sac"
            type="number"
            name="SAC %"
            domain={[Math.max(0, yMin - yPad), yMax + yPad]}
            tickFormatter={(v) => `${v.toFixed(1)}%`}
            tick={{ fill: '#9ca3af', fontSize: 10, fontFamily: 'var(--font-mono)' }}
            axisLine={{ stroke: '#e5e7eb' }}
            tickLine={false}
            width={48}
          />
          <Tooltip content={<CustomTooltip />} cursor={false} />

          {/* Pareto frontier dashed line segments */}
          {frontier.length >= 2 &&
            frontier.slice(0, -1).map((pt, i) => (
              <ReferenceLine
                key={`pareto-${i}`}
                segment={[
                  { x: pt.totalCost, y: pt.sac },
                  { x: frontier[i + 1].totalCost, y: frontier[i + 1].sac },
                ]}
                stroke="#2563EB"
                strokeDasharray="4 3"
                strokeWidth={1}
                strokeOpacity={0.35}
              />
            ))}

          <Scatter data={chartData} shape={<CustomDot />}>
            <LabelList
              dataKey="shortLabel"
              content={(props) => <CustomLabel {...props} data={chartData} />}
            />
          </Scatter>

          {/* Quadrant labels rendered via customized SVG */}
          <customized>
            <QuadrantLabels xMid={xMid} yMid={yMid} xMax={xMax + xPad} yMax={yMax + yPad} />
          </customized>
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
