export interface AnnuityPoint {
  x: number;
  totalInterest: number;
  totalPayment: number;
}

export function computeAnnuityPoint(
  amount: number,
  annualRate: number,
  termMonths: number,
): AnnuityPoint {
  if (annualRate === 0) {
    return { x: 0, totalInterest: 0, totalPayment: amount };
  }
  const monthlyRate = annualRate / 12 / 100;
  const payment =
    (amount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -termMonths));
  const totalPayment = payment * termMonths;
  const totalInterest = totalPayment - amount;
  return { x: annualRate, totalInterest, totalPayment };
}

export type SensitivityAxis = "rate" | "term" | "amount";

export interface SensitivityDataPoint {
  x: number;
  totalInterest: number;
  totalPayment: number;
}

export function buildSensitivitySeries(
  baseAmount: number,
  baseRate: number,
  baseTerm: number,
  axis: SensitivityAxis,
  min: number,
  max: number,
  points = 30,
): SensitivityDataPoint[] {
  const step = (max - min) / (points - 1);
  return Array.from({ length: points }, (_, i) => {
    const x = min + step * i;
    let amount = baseAmount;
    let rate = baseRate;
    let term = baseTerm;

    if (axis === "rate") rate = x;
    else if (axis === "term") term = Math.round(x);
    else amount = x;

    if (rate === 0) {
      return { x, totalInterest: 0, totalPayment: amount };
    }
    const monthlyRate = rate / 12 / 100;
    const payment =
      (amount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -Math.round(term)));
    const totalPayment = payment * Math.round(term);
    const totalInterest = totalPayment - amount;
    return { x, totalInterest, totalPayment };
  });
}
