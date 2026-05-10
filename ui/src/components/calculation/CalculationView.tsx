"use client";

import { useTranslations } from "next-intl";
import { clsx } from "clsx";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { CashFlowTable, type CashFlow } from "./CashFlowTable";
import { AmortizationChart } from "./AmortizationChart";
import { ScenarioPanel } from "./ScenarioPanel";
import { CalculationSummary } from "./CalculationSummary";
import { SensitivityPanel } from "./SensitivityPanel";
import { useCalculation, useScenarios } from "@/lib/hooks/useScenarios";
import { useCalculatorVersions } from "@/lib/hooks/useCalculators";
import { useAuthStore } from "@/lib/stores/auth.store";
import { formatDate } from "@/lib/utils/format";
import { Badge } from "@/components/ui/badge";

interface CalculationResult {
  cashFlows: CashFlow[];
}

function parseResult(
  raw?: Record<string, unknown> | null,
): CalculationResult | null {
  if (!raw || !Array.isArray(raw.cashFlows)) return null;
  return raw as unknown as CalculationResult;
}

type Tab = "chart" | "table" | "sensitivity";

interface Props {
  calculationId: string;
}

export function CalculationView({ calculationId }: Props) {
  const t = useTranslations("calculation");
  const user = useAuthStore((s) => s.user);
  const userId = user?.id ?? "";
  const [activeTab, setActiveTab] = useState<Tab>("chart");

  const { data: calculation, isLoading: calcLoading } = useCalculation(
    calculationId,
    userId,
  );

  const { data: scenarios = [], isLoading: scenariosLoading } =
    useScenarios(calculationId);

  const { data: versions = [], isLoading: versionsLoading } =
    useCalculatorVersions(calculation?.calculatorId ?? "");

  if (calcLoading || scenariosLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  if (!calculation) {
    return <p className="text-[--text-3]">{t("notFound")}</p>;
  }

  const activeScenario =
    scenarios.find((s) => s.id === calculation.selectedScenarioId) ??
    scenarios[0];

  const result = parseResult(
    activeScenario?.scenarioResult as Record<string, unknown> | null,
  );
  const cashFlows = result?.cashFlows ?? [];
  const initialAmount = activeScenario?.scenarioInput?.amount ?? 0;
  const currency = calculation.currency ?? "USD";

  const activeVersion = versions[versions.length - 1];
  const constraints = activeVersion?.algorithmMetadata?.constraints ?? null;

  const TABS: { key: Tab; label: string }[] = [
    { key: "chart", label: t("tabs.chart") },
    { key: "table", label: t("tabs.table") },
    { key: "sensitivity", label: t("tabs.sensitivity") },
  ];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.08em] text-[--text-3] font-medium mb-1">
            {t("title")}
          </p>
          <h1 className="text-2xl font-semibold text-[--text]">
            {formatDate(calculation.createdAt)}
          </h1>
        </div>
        <Badge
          variant="outline"
          className="font-mono text-sm mt-1 shrink-0 text-[--text-2] border-[--border]"
        >
          {currency}
        </Badge>
      </div>

      {/* Scenario panel */}
      <div className="bg-[--surface] rounded-[--radius-lg] border border-[--border] shadow-[--shadow-1] p-5">
        <ScenarioPanel calculation={calculation} />
      </div>

      {/* KPI hero */}
      {cashFlows.length > 0 && (
        <CalculationSummary
          cashFlows={cashFlows}
          currency={currency}
          amount={activeScenario?.scenarioInput?.amount}
          rate={activeScenario?.scenarioInput?.rate}
          term={activeScenario?.scenarioInput?.term}
        />
      )}

      {/* Tabs + content */}
      {cashFlows.length === 0 ? (
        <div className="bg-[--surface] rounded-[--radius-lg] border border-[--border] py-12 text-center text-[--text-3] text-sm">
          {t("noResults")}
        </div>
      ) : (
        <div>
          {/* Aurelius tab bar */}
          <div className="border-b border-[--border] flex gap-0">
            {TABS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={clsx(
                  "px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors",
                  activeTab === key
                    ? "border-[--accent] text-[--text]"
                    : "border-transparent text-[--text-3] hover:text-[--text-2]",
                )}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="mt-4">
            {activeTab === "chart" && (
              <AmortizationChart
                cashFlows={cashFlows}
                initialAmount={initialAmount}
                currency={currency}
              />
            )}
            {activeTab === "table" && (
              <CashFlowTable cashFlows={cashFlows} currency={currency} />
            )}
            {activeTab === "sensitivity" && (
              <div className="bg-[--surface] rounded-[--radius-lg] border border-[--border] shadow-[--shadow-1] p-6">
                <SensitivityPanel
                  baseAmount={activeScenario?.scenarioInput?.amount ?? 0}
                  baseRate={activeScenario?.scenarioInput?.rate ?? 5}
                  baseTerm={activeScenario?.scenarioInput?.term ?? 12}
                  constraints={constraints}
                  currency={currency}
                  isLoading={versionsLoading}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
