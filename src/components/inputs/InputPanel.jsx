import { Tooltip } from '../shared/Tooltip';
import { TOOLTIPS } from '../../data/tooltipContent';
import { formatCurrency, creditScoreLabel } from '../../utils/formatters';

export function InputPanel({ inputs, onUpdate }) {
  const { principal, annualRevenue, businessAge, creditScore } = inputs;

  return (
    <div className="input-panel">
      <InputGroup
        data-accent="blue"
        label="Loan Amount"
        tooltip={TOOLTIPS.loanAmount}
        value={formatCurrency(principal)}
      >
        <input
          type="range"
          min={5000}
          max={2000000}
          step={5000}
          value={principal}
          onChange={(e) => onUpdate('principal', Number(e.target.value))}
        />
      </InputGroup>

      <InputGroup
        data-accent="green"
        label="Annual Revenue"
        tooltip={TOOLTIPS.annualRevenue}
        value={formatCurrency(annualRevenue)}
      >
        <input
          type="range"
          min={50000}
          max={10000000}
          step={50000}
          value={annualRevenue}
          onChange={(e) => onUpdate('annualRevenue', Number(e.target.value))}
        />
      </InputGroup>

      <InputGroup
        data-accent="purple"
        label="Business Age"
        tooltip={TOOLTIPS.businessAge}
        value={`${businessAge} yr`}
        sub={businessAge < 2 ? 'Startup — higher rates' : null}
      >
        <input
          type="range"
          min={0}
          max={20}
          step={1}
          value={businessAge}
          onChange={(e) => onUpdate('businessAge', Number(e.target.value))}
        />
      </InputGroup>

      <InputGroup
        data-accent="amber"
        label="Credit Score"
        tooltip={TOOLTIPS.creditScore}
        value={creditScore}
        sub={creditScoreLabel(creditScore)}
      >
        <input
          type="range"
          min={300}
          max={850}
          step={10}
          value={creditScore}
          onChange={(e) => onUpdate('creditScore', Number(e.target.value))}
        />
        <div className="credit-score-bar" />
      </InputGroup>
    </div>
  );
}

function InputGroup({ label, tooltip, value, sub, children, 'data-accent': accent }) {
  return (
    <div className="input-group" data-accent={accent}>
      <div className="input-label-row">
        <span className="input-label">
          {label}
          {tooltip && <Tooltip content={tooltip} />}
        </span>
        <span className="input-value">{value}</span>
      </div>
      {children}
      {sub && <span className="input-sub">{sub}</span>}
    </div>
  );
}
