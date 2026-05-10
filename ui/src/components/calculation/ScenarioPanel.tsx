"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import { useScenarios, useSelectScenario } from "@/lib/hooks/useScenarios";
import { AddScenarioForm } from "./AddScenarioForm";
import { ScenarioCompare } from "./ScenarioCompare";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils/format";
import { computeCashFlowMetrics } from "@/lib/utils/cashflow.utils";
import type { components } from "@/lib/types/api.types";
import type { CashFlow } from "./CashFlowTable";

type CalculationDto = components["schemas"]["CalculationDto"];
type CalculationScenarioDto = components["schemas"]["CalculationScenarioDto"];

function parseCashFlows(result?: Record<string, unknown> | null): CashFlow[] {
  if (!result || !Array.isArray(result.cashFlows)) return [];
  return result.cashFlows as CashFlow[];
}

function getScenarioSummary(scenario: CalculationScenarioDto, currency: string, monthsShort: string) {
  const inp = scenario.scenarioInput;
  if (!inp) return null;
  const parts = [
    inp.amount ? formatCurrency(inp.amount, currency) : null,
    inp.rate != null ? `${inp.rate}%` : null,
    inp.term != null ? `${inp.term} ${monthsShort}` : null,
  ].filter(Boolean);
  return parts.join(" · ");
}

function formatCurrencyCompact(value: number, currency: string): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M ${currency}`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}k ${currency}`;
  return formatCurrency(value, currency);
}

interface Props {
  calculation: CalculationDto;
}

export function ScenarioPanel({ calculation }: Props) {
  const t = useTranslations("scenario");
  const tCommon = useTranslations("common");
  const { data: scenarios = [], isLoading } = useScenarios(calculation.id!);
  const { mutate: selectScenario, isPending: isSelecting } = useSelectScenario(calculation.id!);
  const [showAddForm, setShowAddForm] = useState(false);
  const [compareIds, setCompareIds] = useState<string[]>([]);

  const currency = calculation.currency ?? "USD";

  const toggleCompare = (scenarioId: string) => {
    setCompareIds((prev) =>
      prev.includes(scenarioId)
        ? prev.filter((id) => id !== scenarioId)
        : prev.length < 2
          ? [...prev, scenarioId]
          : [prev[1]!, scenarioId],
    );
  };

  const activeScenario = scenarios.find((s) => s.id === calculation.selectedScenarioId) ?? scenarios[0];

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  const baseMetrics =
    activeScenario
      ? computeCashFlowMetrics(parseCashFlows(activeScenario.scenarioResult as Record<string, unknown> | null))
      : null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.08em] text-text-3 font-medium">{t("title")}</p>
          {scenarios.length > 0 && (
            <p className="text-xs text-text-3 mt-0.5">{t("count", { count: scenarios.length })}</p>
          )}
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setShowAddForm((v) => !v)}
          className="text-text-2 hover:text-text hover:bg-surface-sunken h-8 gap-1.5"
        >
          {showAddForm ? (
            t("cancel")
          ) : (
            <>
              <Plus className="w-3.5 h-3.5" />
              {t("add")}
            </>
          )}
        </Button>
      </div>

      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: "hidden" }}
          >
            <div className="border border-border rounded-lg p-4 bg-surface-sunken">
              <AddScenarioForm
                calculationId={calculation.id!}
                initialInput={activeScenario?.scenarioInput ?? undefined}
                onSuccess={() => setShowAddForm(false)}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {scenarios.length > 0 && (
        <div className="divide-y divide-hairline border border-border rounded-lg overflow-hidden">
          {scenarios.map((scenario, idx) => {
            const isActive = scenario.id === calculation.selectedScenarioId;
            const isInCompare = compareIds.includes(scenario.id!);
            const summary = getScenarioSummary(scenario, currency, tCommon("monthsShort"));
            const metrics = computeCashFlowMetrics(parseCashFlows(scenario.scenarioResult as Record<string, unknown> | null));
            const hasResults = metrics.totalPayments > 0;

            let delta: { label: string; positive: boolean } | null = null;
            if (hasResults && baseMetrics && !isActive && baseMetrics.totalPayments > 0) {
              const diff = metrics.totalPayments - baseMetrics.totalPayments;
              delta = {
                label: `${diff > 0 ? "▲" : "▼"} ${formatCurrencyCompact(Math.abs(diff), currency)}`,
                positive: diff < 0,
              };
            }

            return (
              <div key={scenario.id} className={`flex items-center gap-3 px-4 py-3 ${isActive ? "bg-accent-soft-2" : "bg-surface"}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium shrink-0 ${isActive ? "bg-accent text-accent-fg" : "bg-accent-soft text-accent"}`}>
                  {idx + 1}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium truncate ${isActive ? "text-accent" : "text-text"}`}>
                      {scenario.scenarioName ?? t("defaultName", { index: idx + 1 })}
                    </span>
                    {isActive && (
                      <span className="text-[10px] uppercase tracking-[0.06em] font-semibold text-positive bg-positive-soft border border-positive-line rounded-full px-1.5 py-0.5">
                        {t("active")}
                      </span>
                    )}
                  </div>
                  {summary && <p className="text-xs text-text-3 font-mono mt-0.5">{summary}</p>}
                </div>

                {hasResults && (
                  <div className="text-right shrink-0">
                    <p className="font-mono text-sm font-medium text-text tabular-nums">{formatCurrencyCompact(metrics.totalPayments, currency)}</p>
                    {delta && (
                      <p className={`text-xs font-mono tabular-nums ${delta.positive ? "text-positive" : "text-warn"}`}>
                        {delta.label}
                      </p>
                    )}
                  </div>
                )}

                <div className="flex gap-1.5 shrink-0">
                  <Button
                    size="sm"
                    variant={isInCompare ? "default" : "outline"}
                    onClick={() => toggleCompare(scenario.id!)}
                    className={`h-7 text-xs px-2 ${isInCompare ? "bg-accent text-accent-fg hover:bg-accent-strong" : "border-border text-text-2 hover:bg-surface-sunken"}`}
                  >
                    {isInCompare ? t("selected") : t("compare")}
                  </Button>
                  {!isActive && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={isSelecting}
                      onClick={() => selectScenario(scenario.id!)}
                      className="h-7 text-xs px-2 border-border text-text-2 hover:bg-surface-sunken"
                    >
                      {t("activate")}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {compareIds.length === 2 && (
        <ScenarioCompare scenarios={scenarios.filter((s) => compareIds.includes(s.id!))} currency={currency} />
      )}
    </div>
  );
}
