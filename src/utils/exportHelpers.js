import { formatCurrencyExact, formatPercent } from './formatters';

export function exportToCSV(results, inputs) {
  const meta = [
    ['Finsight — Financing Comparison Export'],
    [`Generated: ${new Date().toLocaleString()}`],
    [],
    ['--- Inputs ---'],
    ['Loan Amount', inputs.principal],
    ['Annual Revenue', inputs.annualRevenue],
    ['Business Age (yr)', inputs.businessAge],
    ['Credit Score', inputs.creditScore],
    [],
    ['--- Results ---'],
  ];

  const headers = [
    'Option',
    'Total Cost',
    'SAC (%)',
    'VS Cheapest ($)',
    'Cashflow % of Monthly FCF',
    'Avg Monthly Payment',
    'Term (months)',
    'Best Deal?',
  ];

  const rows = results.map((r) => [
    r.label,
    r.totalCost.toFixed(2),
    r.sac.toFixed(2),
    r.vsCheapest.toFixed(2),
    r.freeCashflowPct.toFixed(2),
    r.monthlyPayment.toFixed(2),
    r.termMonths,
    r.isCheapest ? 'YES' : '',
  ]);

  const csvLines = [
    ...meta.map((row) => row.map(escapeCsv).join(',')),
    headers.map(escapeCsv).join(','),
    ...rows.map((row) => row.map(escapeCsv).join(',')),
  ];

  const csvContent = csvLines.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `finsight-${Date.now()}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function escapeCsv(val) {
  const str = String(val ?? '');
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}
