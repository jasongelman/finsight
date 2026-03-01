import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from 'recharts';
import { formatCurrency } from '../../utils/formatters';

function CustomTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0].payload;
  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderLeft: `3px solid ${d.color}`,
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
      {d.isCheapest && (
        <div style={{ color: '#2563EB', fontWeight: 600, marginTop: 4, fontSize: 11 }}>
          ★ Lowest Total Cost
        </div>
      )}
    </div>
  );
}

function CustomDot(props) {
  const { cx, cy, payload } = props;
  const r = payload.isCheapest ? 8 : 6;
  return (
    <g>
      {payload.isCheapest && (
        <circle cx={cx} cy={cy} r={r + 3} fill="none" stroke="#2563EB" strokeWidth={2} opacity={0.5} />
      )}
      <circle cx={cx} cy={cy} r={r} fill={payload.color} opacity={0.85} />
    </g>
  );
}

function CustomLabel(props) {
  const { x, y, value, index } = props;
  const d = props.data?.[index];
  if (!d) return null;
  return (
    <text
      x={x}
      y={y - 12}
      textAnchor="middle"
      fontSize={10}
      fontWeight={d.isCheapest ? 700 : 500}
      fontFamily="var(--font-sans)"
      fill={d.isCheapest ? '#2563EB' : '#6b7280'}
    >
      {value}
    </text>
  );
}

export function TradeoffChart({ results }) {
  if (!results || results.length === 0) return null;

  const chartData = results.map((r) => ({
    shortLabel: r.shortLabel,
    label: r.label,
    totalCost: r.totalCost,
    sac: r.sac,
    monthlyPayment: r.monthlyPayment,
    color: r.color,
    isCheapest: r.isCheapest,
  }));

  return (
    <div className="tradeoff-chart">
      <div className="section-header">
        <span className="section-title">Cost vs Efficiency</span>
        <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
          X = Total Cost · Y = SAC (annualized %)
        </span>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <ScatterChart margin={{ top: 20, right: 20, bottom: 10, left: 10 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#f3f4f6"
            vertical={true}
          />
          <XAxis
            dataKey="totalCost"
            type="number"
            name="Total Cost"
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
            unit="%"
            tick={{ fill: '#9ca3af', fontSize: 10, fontFamily: 'var(--font-mono)' }}
            axisLine={{ stroke: '#e5e7eb' }}
            tickLine={false}
            width={42}
          />
          <Tooltip content={<CustomTooltip />} cursor={false} />
          <Scatter data={chartData} shape={<CustomDot />}>
            <LabelList
              dataKey="shortLabel"
              content={(props) => <CustomLabel {...props} data={chartData} />}
            />
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
