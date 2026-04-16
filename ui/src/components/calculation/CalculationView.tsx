"use client";

import { useTranslations } from "next-intl";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
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

interface Props {
  calculationId: string;
}

export function CalculationView({ calculationId }: Props) {
  const t = useTranslations("calculation");
  const user = useAuthStore((s) => s.user);
  const userId = user?.id ?? "";

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
    return <p className="text-muted-foreground">{t("notFound")}</p>;
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

  // derive constraints from the latest version
  const activeVersion = versions[versions.length - 1];
  const constraints = activeVersion?.algorithmMetadata?.constraints ?? null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="page-title">{t("title")}</h1>
          <p className="text-muted-foreground text-sm mt-1.5">
            {formatDate(calculation.createdAt)}
          </p>
        </div>
        <Badge variant="outline" className="font-mono text-sm mt-1 shrink-0">
          {currency}
        </Badge>
      </div>

      {/* Scenario panel */}
      <Card>
        <CardContent className="pt-4">
          <ScenarioPanel calculation={calculation} />
        </CardContent>
      </Card>

      {/* KPI summary */}
      {cashFlows.length > 0 && (
        <CalculationSummary cashFlows={cashFlows} currency={currency} />
      )}

      {/* Results */}
      {cashFlows.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            {t("noResults")}
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="table">
          <TabsList>
            <TabsTrigger value="table">{t("tabs.table")}</TabsTrigger>
            <TabsTrigger value="chart">{t("tabs.chart")}</TabsTrigger>
            <TabsTrigger value="sensitivity">
              {t("tabs.sensitivity")}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="table" className="mt-4">
            <CashFlowTable cashFlows={cashFlows} currency={currency} />
          </TabsContent>
          <TabsContent value="chart" className="mt-4">
            <AmortizationChart
              cashFlows={cashFlows}
              initialAmount={initialAmount}
              currency={currency}
            />
          </TabsContent>
          <TabsContent value="sensitivity" className="mt-4">
            <Card>
              <CardContent className="pt-6">
                <SensitivityPanel
                  baseAmount={activeScenario?.scenarioInput?.amount ?? 0}
                  baseRate={activeScenario?.scenarioInput?.rate ?? 5}
                  baseTerm={activeScenario?.scenarioInput?.term ?? 12}
                  constraints={constraints}
                  currency={currency}
                  isLoading={versionsLoading}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
