import type { CashFlow } from "@/components/calculation/CashFlowTable";

export interface CashFlowMetrics {
  totalPayments: number;
  totalPrincipal: number;
  totalInterest: number;
  interestRatio: number;
  overpayment: number;
  firstPaymentDate: string | null;
  lastPaymentDate: string | null;
}

export function computeCashFlowMetrics(cashFlows: CashFlow[]): CashFlowMetrics {
  const outflows = cashFlows.filter((cf) => cf.type === "OUTFLOW");

  const totalPayments = outflows.reduce(
    (sum, cf) => sum + cf.totalAmount.amount,
    0,
  );
  const totalPrincipal = outflows.reduce(
    (sum, cf) => sum + cf.breakdown.principal.amount,
    0,
  );
  const totalInterest = outflows.reduce(
    (sum, cf) => sum + cf.breakdown.interest.amount,
    0,
  );

  const interestRatio =
    totalPrincipal > 0
      ? Math.round((totalInterest / totalPrincipal) * 10000) / 100
      : 0;

  const overpayment = totalInterest;

  const dates = outflows.map((cf) => cf.date).sort();
  const firstPaymentDate = dates[0] ?? null;
  const lastPaymentDate = dates[dates.length - 1] ?? null;

  return {
    totalPayments,
    totalPrincipal,
    totalInterest,
    interestRatio,
    overpayment,
    firstPaymentDate,
    lastPaymentDate,
  };
}
