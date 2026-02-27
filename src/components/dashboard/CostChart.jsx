import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from 'recharts';
import { formatCurrency } from '../../utils/formatters';

function CustomTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0].payload;
  return (
    <div
      style={{
        background: '#1a2744',
        border: '1px solid #475569',
        borderRadius: 8,
        padding: '10px 14px',
        fontSize: 12,
        color: '#f1f5f9',
        lineHeight: 1.6,
        minWidth: 160,
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: 4 }}>{d.label}</div>
      <div>Total Cost: <strong>{formatCurrency(d.totalCost)}</strong></div>
      <div>SAC: <strong>{d.sac.toFixed(1)}%</strong></div>
      <div>Monthly: <strong>{formatCurrency(d.monthlyPayment)}</strong></div>
      {d.isCheapest && (
        <div style={{ color: '#f59e0b', fontWeight: 700, marginTop: 4 }}>★ Best Deal</div>
      )}
    </div>
  );
}

export function CostChart({ results }) {
  if (!results || results.length === 0) return null;

  const chartData = results.map((r) => ({
    name: r.shortLabel,
    label: r.label,
    totalCost: r.totalCost,
    sac: r.sac,
    monthlyPayment: r.monthlyPayment,
    color: r.color,
    isCheapest: r.isCheapest,
  }));

  const minCost = Math.min(...results.map((r) => r.totalCost));
  const maxCost = Math.max(...results.map((r) => r.totalCost));

  return (
    <div className="cost-chart-section">
      <div className="section-header">
        <span className="section-title">Cost Comparison</span>
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          Total cost over full term (principal + interest + fees)
        </span>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <BarChart
          data={chartData}
          margin={{ top: 16, right: 20, bottom: 8, left: 20 }}
          barCategoryGap="30%"
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.06)"
            vertical={false}
          />
          <XAxis
            dataKey="name"
            tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }}
            axisLine={{ stroke: '#334155' }}
            tickLine={false}
          />
          <YAxis
            tickFormatter={(val) => {
              if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
              if (val >= 1000) return `$${(val / 1000).toFixed(0)}k`;
              return `$${val}`;
            }}
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={55}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
          <ReferenceLine
            y={minCost}
            stroke="#f59e0b"
            strokeDasharray="5 4"
            strokeWidth={1.5}
            label={{
              value: 'Cheapest',
              fill: '#f59e0b',
              fontSize: 10,
              fontWeight: 700,
              position: 'insideTopRight',
            }}
          />
          <Bar dataKey="totalCost" radius={[5, 5, 0, 0]} maxBarSize={72}>
            {chartData.map((entry, i) => (
              <Cell
                key={i}
                fill={entry.color}
                opacity={entry.isCheapest ? 1 : 0.6}
                stroke={entry.isCheapest ? entry.color : 'transparent'}
                strokeWidth={2}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
