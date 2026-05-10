"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { Check } from "lucide-react";
import { formatCurrency } from "@/lib/utils/format";
import { computeCashFlowMetrics } from "@/lib/utils/cashflow.utils";
import type { components } from "@/lib/types/api.types";
import type { CashFlow } from "./CashFlowTable";

type CalculationScenarioDto = components["schemas"]["CalculationScenarioDto"];

function parseCashFlows(result?: Record<string, unknown> | null): CashFlow[] {
  if (!result || !Array.isArray(result.cashFlows)) return [];
  return result.cashFlows as CashFlow[];
}

interface Props {
  scenarios: CalculationScenarioDto[];
  currency?: string;
}

export function ScenarioCompare({ scenarios, currency = "USD" }: Props) {
  const t = useTranslations("scenario");
  const tc = useTranslations("cashflow");

  const metrics = useMemo(
    () =>
      scenarios.map((s) => {
        const cf = computeCashFlowMetrics(
          parseCashFlows(s.scenarioResult as Record<string, unknown> | null),
        );
        return {
          name: s.scenarioName ?? `Scenario ${s.id?.slice(0, 6)}`,
          input: s.scenarioInput,
          totalPayments: cf.totalPayments,
          totalInterest: cf.totalInterest,
          totalPrincipal: cf.totalPrincipal,
          interestRatio: cf.interestRatio,
        };
      }),
    [scenarios],
  );

  const [m0, m1] = metrics;
  if (!m0 || !m1) return null;

  const hasResults = m0.totalPayments > 0 || m1.totalPayments > 0;

  // Winner = lower total interest
  const winnerIdx = m0.totalInterest <= m1.totalInterest ? 0 : 1;
  const interestSavings = Math.abs(m0.totalInterest - m1.totalInterest);
  const winner = winnerIdx === 0 ? m0 : m1;
  const loser = winnerIdx === 0 ? m1 : m0;

  const cards = [m0, m1];

  return (
    <div className="space-y-4">
      {/* Winner banner */}
      {hasResults && (
        <div className="bg-positive-soft border border-positive-line rounded-lg p-4 flex items-start gap-3">
          <Check className="w-5 h-5 text-positive shrink-0 mt-0.5" />
          <div>
            <p className="font-serif text-[22px] font-medium text-positive leading-tight">
              {winner.name} saves you {formatCurrency(interestSavings, currency)} in interest
            </p>
            <p className="text-sm text-positive mt-1 opacity-80">
              vs {loser.name}
            </p>
          </div>
        </div>
      )}

      {/* Comparison cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {cards.map((m, i) => {
          const isWinner = i === winnerIdx;
          return (
            <div
              key={m.name}
              className={`relative bg-surface rounded-lg border overflow-hidden ${
                isWinner
                  ? "ring-2 ring-positive ring-offset-2 border-positive-line"
                  : "border-border"
              }`}
            >
              {/* Winner ribbon */}
              {isWinner && (
                <div className="absolute top-3 right-3 bg-positive text-positive-soft text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-[0.06em]">
                  Winner
                </div>
              )}

              <div className="p-5 border-b border-hairline">
                <p className="text-base font-semibold text-text">{m.name}</p>
                {m.input && (
                  <p className="text-xs text-text-3 mt-0.5 font-mono">
                    {m.input.amount ? formatCurrency(m.input.amount, currency) : "—"}
                    {m.input.rate != null ? ` · ${m.input.rate}%` : ""}
                    {m.input.term != null ? ` · ${m.input.term}mo.` : ""}
                  </p>
                )}
              </div>

              {hasResults && (
                <div className="p-5 space-y-3">
                  {[
                    {
                      label: "Monthly payment",
                      value: m.totalPayments > 0
                        ? formatCurrency(m.totalPayments / (m.input?.term ?? 1), currency)
                        : "—",
                    },
                    {
                      label: tc("totalPayments"),
                      value: formatCurrency(m.totalPayments, currency),
                    },
                    {
                      label: tc("totalInterest"),
                      value: formatCurrency(m.totalInterest, currency),
                      winning: isWinner && hasResults,
                    },
                    {
                      label: "Interest ratio",
                      value: `${m.interestRatio}%`,
                      winning: isWinner && hasResults,
                    },
                  ].map(({ label, value, winning }) => (
                    <div key={label} className="flex items-center justify-between">
                      <span className="text-sm text-text-3">{label}</span>
                      <span
                        className={`text-sm font-mono font-medium tabular-nums ${winning ? "text-positive" : "text-text"}`}
                      >
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Cost breakdown bar */}
      {hasResults && (
        <div className="bg-surface rounded-lg border border-border p-5">
          <p className="text-[11px] uppercase tracking-[0.06em] text-text-3 font-medium mb-3">
            {t("compareTitle")} — Interest breakdown
          </p>
          <div className="space-y-3">
            {cards.map((m, i) => {
              const isWinner = i === winnerIdx;
              const maxInterest = Math.max(m0.totalInterest, m1.totalInterest);
              const pct = maxInterest > 0 ? (m.totalInterest / maxInterest) * 100 : 0;
              return (
                <div key={m.name} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className={`font-medium ${isWinner ? "text-positive" : "text-text-2"}`}>
                      {m.name}
                    </span>
                    <span className={`font-mono tabular-nums ${isWinner ? "text-positive" : "text-text"}`}>
                      {formatCurrency(m.totalInterest, currency)}
                    </span>
                  </div>
                  <div className="h-2 bg-surface-sunken rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${isWinner ? "bg-positive" : "bg-chart-interest"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

