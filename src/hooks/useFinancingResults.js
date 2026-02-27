import { useMemo } from 'react';
import { calculateAllOptions } from '../engine/financingCalculator';
import { FINANCING_TYPES } from '../data/financingTypes';

export function useFinancingResults(inputs) {
  return useMemo(() => {
    const { principal, annualRevenue, businessAge, creditScore } = inputs;
    if (!principal || principal <= 0 || !annualRevenue || annualRevenue <= 0) {
      return [];
    }
    const raw = calculateAllOptions({ principal, annualRevenue, businessAge, creditScore });
    return raw.map((r) => ({
      ...FINANCING_TYPES[r.id],
      ...r,
    }));
  }, [inputs.principal, inputs.annualRevenue, inputs.businessAge, inputs.creditScore]);
}
