"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { computeCashFlowMetrics } from "@/lib/utils/cashflow.utils";
import type { CashFlow } from "./CashFlowTable";

interface Props {
  cashFlows: CashFlow[];
  currency: string;
  amount?: number;
  rate?: number;
  term?: number;
}

export function CalculationSummary({ cashFlows, currency, amount, rate, term }: Props) {
  const t = useTranslations("summary");

  const m = useMemo(() => computeCashFlowMetrics(cashFlows), [cashFlows]);

  const outflows = cashFlows.filter((cf) => cf.type === "OUTFLOW");
  const monthlyPayment = outflows.length > 0 ? m.totalPayments / outflows.length : 0;

  const subtitleParts = [
    term
      ? term >= 12
        ? t("termYears", { value: Math.round(term / 12) })
        : t("termMonths", { value: term })
      : null,
    rate ? `${rate}%` : null,
    amount ? formatCurrency(amount, currency) : null,
  ].filter(Boolean);

  const principalPct = m.totalPayments > 0 ? (m.totalPrincipal / m.totalPayments) * 100 : 0;
  const interestPct = 100 - principalPct;

  return (
    <div className="bg-surface rounded-lg border border-border shadow-1 overflow-hidden">
      <div className="p-(--density-pad) border-b border-hairline">
        <p className="text-[11px] uppercase tracking-[0.08em] text-text-3 font-medium mb-2">
          {t("monthlyPayment")}
        </p>
        <div className="flex items-baseline gap-1.5">
          <span className="text-text-3 font-serif text-2xl">{currency}</span>
          <span className="font-serif text-[56px] font-medium text-text leading-none tabular-nums">
            {monthlyPayment.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </div>
        {subtitleParts.length > 0 && (
          <p className="text-sm text-text-3 mt-2">{subtitleParts.join(" · ")}</p>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-hairline">
        {[
          {
            label: t("totalPayments"),
            value: formatCurrency(m.totalPayments, currency),
          },
          {
            label: t("totalInterest"),
            value: formatCurrency(m.totalInterest, currency),
            warn: true,
          },
          {
            label: t("totalPrincipal"),
            value: formatCurrency(m.totalPrincipal, currency),
          },
          {
            label: t("paymentPeriod"),
            value:
              m.firstPaymentDate && m.lastPaymentDate
                ? `${formatDate(m.firstPaymentDate)} - ${formatDate(m.lastPaymentDate)}`
                : t("emptyValue"),
          },
        ].map(({ label, value, warn }) => (
          <div key={label} className="p-4">
            <p className="text-[11px] uppercase tracking-[0.06em] text-text-3 font-medium mb-1">
              {label}
            </p>
            <p className={`font-mono text-sm font-medium tabular-nums ${warn ? "text-warn" : "text-text"}`}>
              {value}
            </p>
          </div>
        ))}
      </div>

      {m.totalPayments > 0 && (
        <div className="px-(--density-pad) py-3 border-t border-hairline flex items-center gap-3">
          <div className="flex-1 flex h-1.5 rounded-full overflow-hidden bg-surface-sunken">
            <div className="bg-chart-principal rounded-l-full" style={{ width: `${principalPct}%` }} />
            <div className="bg-chart-interest flex-1 rounded-r-full" />
          </div>
          <div className="flex items-center gap-3 text-[11px] text-text-3 shrink-0">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-chart-principal inline-block" />
              {t("principal")} {principalPct.toFixed(0)}%
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-chart-interest inline-block" />
              {t("interest")} {interestPct.toFixed(0)}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
