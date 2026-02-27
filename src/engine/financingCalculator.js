// ─── Amortization helper ─────────────────────────────────────────────────────
function amortize(principal, apr, termMonths) {
  const monthlyRate = apr / 100 / 12;
  if (monthlyRate === 0) return principal / termMonths;
  return (
    principal *
    ((monthlyRate * Math.pow(1 + monthlyRate, termMonths)) /
      (Math.pow(1 + monthlyRate, termMonths) - 1))
  );
}

// ─── Per-product calculation functions ───────────────────────────────────────

function calcCreditCard(principal, apr, termMonths) {
  const monthlyPayment = amortize(principal, apr, termMonths);
  const totalCost = monthlyPayment * termMonths;
  const totalInterest = totalCost - principal;
  const sac = (totalInterest / principal) * (12 / termMonths) * 100;
  return { totalCost, totalInterest, monthlyPayment, sac, termMonths };
}

function calcSBA(principal, apr, termMonths) {
  // SBA guarantee fee based on loan amount
  const guaranteedPortion = principal * 0.75;
  let guaranteeFeeRate = 0.02;
  if (principal > 700000) guaranteeFeeRate = 0.0375;
  else if (principal > 150000) guaranteeFeeRate = 0.03;
  const guaranteeFee = guaranteedPortion * guaranteeFeeRate;

  const monthlyPayment = amortize(principal, apr, termMonths);
  const totalInterest = monthlyPayment * termMonths - principal + guaranteeFee;
  const totalCost = principal + totalInterest;
  const sac = (totalInterest / principal) * (12 / termMonths) * 100;
  return { totalCost, totalInterest, monthlyPayment, sac, termMonths };
}

function calcLineOfCredit(principal, apr, termMonths) {
  // Interest-only monthly, principal repaid at end. Annual maintenance fee 0.75%.
  const monthlyRate = apr / 100 / 12;
  const monthlyInterest = principal * monthlyRate;
  const annualFee = principal * 0.0075;
  const totalFees = annualFee * (termMonths / 12);
  const totalInterest = monthlyInterest * termMonths + totalFees;
  const totalCost = principal + totalInterest;
  const sac = (totalInterest / principal) * (12 / termMonths) * 100;
  return {
    totalCost,
    totalInterest,
    monthlyPayment: monthlyInterest + annualFee / 12,
    sac,
    termMonths,
  };
}

function calcMCA(principal, factorRate, termMonths) {
  const payback = principal * factorRate;
  const totalInterest = payback - principal;
  const monthlyPayment = payback / termMonths;
  const sac = (totalInterest / principal) * (12 / termMonths) * 100;
  return { totalCost: payback, totalInterest, monthlyPayment, sac, termMonths };
}

function calcInvoiceFactoring(principal, monthlyFeeRate, termMonths) {
  // Advance rate 85%; fee is % of invoice face value per month
  const advancedAmount = principal * 0.85;
  const totalFees = principal * (monthlyFeeRate / 100) * termMonths;
  const monthlyPayment = totalFees / termMonths;
  // SAC denominator = cash actually received (advance amount)
  const sac = (totalFees / advancedAmount) * (12 / termMonths) * 100;
  return {
    totalCost: totalFees,
    totalInterest: totalFees,
    monthlyPayment,
    sac,
    termMonths,
  };
}

function calcEquipmentFinancing(principal, apr, termMonths) {
  const monthlyPayment = amortize(principal, apr, termMonths);
  const totalCost = monthlyPayment * termMonths;
  const totalInterest = totalCost - principal;
  const sac = (totalInterest / principal) * (12 / termMonths) * 100;
  return { totalCost, totalInterest, monthlyPayment, sac, termMonths };
}

function calcTermLoan(principal, apr, termMonths) {
  // 3% origination fee
  const originationFee = principal * 0.03;
  const monthlyPayment = amortize(principal, apr, termMonths);
  const totalInterest = monthlyPayment * termMonths - principal + originationFee;
  const totalCost = principal + totalInterest;
  const sac = (totalInterest / principal) * (12 / termMonths) * 100;
  return { totalCost, totalInterest, monthlyPayment, sac, termMonths };
}

// ─── Credit score & age → rate adjustment ────────────────────────────────────

function creditMultiplier(creditScore) {
  if (creditScore >= 800) return 0.7;
  if (creditScore >= 740) return 0.85;
  if (creditScore >= 670) return 1.0;
  if (creditScore >= 580) return 1.25;
  return 1.6;
}

const BASE_PARAMS = {
  creditCard:         { apr: 18,   termMonths: 18 },
  sba:                { apr: 7.5,  termMonths: 84 },
  lineOfCredit:       { apr: 12,   termMonths: 12 },
  mca:                { factorRate: 1.35, termMonths: 9 },
  invoiceFactoring:   { monthlyFeeRate: 2.5, termMonths: 4 },
  equipmentFinancing: { apr: 8,    termMonths: 48 },
  termLoan:           { apr: 15,   termMonths: 36 },
};

function getParams(id, creditScore, businessAge) {
  const base = { ...BASE_PARAMS[id] };
  const cm = creditMultiplier(creditScore);
  const ageMult = businessAge < 2 ? 1.2 : 1.0;
  if (base.apr !== undefined) {
    base.apr = Math.min(base.apr * cm * ageMult, 99);
  }
  return base;
}

// ─── Eligibility hints ───────────────────────────────────────────────────────

function getEligibility(id, { creditScore, businessAge, annualRevenue, principal }) {
  const warnings = [];
  if (id === 'sba') {
    if (businessAge < 2) warnings.push('SBA typically requires 2+ years in business');
    if (creditScore < 640) warnings.push('SBA usually requires 640+ credit score');
    if (principal > 5000000) warnings.push('SBA max loan is $5M');
  }
  if (id === 'mca') {
    if (annualRevenue < principal * 2) warnings.push('MCA lenders typically require 2× revenue vs advance');
    warnings.push('Very high effective APR — last resort financing');
  }
  if (id === 'invoiceFactoring') {
    if (annualRevenue < 50000) warnings.push('Factoring best for businesses with regular B2B invoices');
  }
  if (id === 'lineOfCredit' && creditScore < 600) {
    warnings.push('Low credit score may limit line of credit approval');
  }
  return warnings;
}

// ─── Master orchestrator ─────────────────────────────────────────────────────

export function calculateAllOptions({ principal, annualRevenue, businessAge, creditScore }) {
  const monthlyFreeCashflow = (annualRevenue * 0.15) / 12;

  const products = [
    'creditCard',
    'sba',
    'lineOfCredit',
    'mca',
    'invoiceFactoring',
    'equipmentFinancing',
    'termLoan',
  ];

  const results = products.map((id) => {
    const params = getParams(id, creditScore, businessAge);
    let calc;
    switch (id) {
      case 'creditCard':
        calc = calcCreditCard(principal, params.apr, params.termMonths);
        break;
      case 'sba':
        calc = calcSBA(principal, params.apr, params.termMonths);
        break;
      case 'lineOfCredit':
        calc = calcLineOfCredit(principal, params.apr, params.termMonths);
        break;
      case 'mca':
        calc = calcMCA(principal, params.factorRate, params.termMonths);
        break;
      case 'invoiceFactoring':
        calc = calcInvoiceFactoring(principal, params.monthlyFeeRate, params.termMonths);
        break;
      case 'equipmentFinancing':
        calc = calcEquipmentFinancing(principal, params.apr, params.termMonths);
        break;
      case 'termLoan':
        calc = calcTermLoan(principal, params.apr, params.termMonths);
        break;
      default:
        calc = { totalCost: 0, totalInterest: 0, monthlyPayment: 0, sac: 0, termMonths: 12 };
    }

    return {
      id,
      ...calc,
      params,
      freeCashflowPct: monthlyFreeCashflow > 0 ? (calc.monthlyPayment / monthlyFreeCashflow) * 100 : 0,
      eligibilityWarnings: getEligibility(id, { creditScore, businessAge, annualRevenue, principal }),
    };
  });

  const cheapestCost = Math.min(...results.map((r) => r.totalCost));

  return results.map((r) => ({
    ...r,
    vsCheapest: r.totalCost - cheapestCost,
    isCheapest: Math.abs(r.totalCost - cheapestCost) < 0.01,
  }));
}
