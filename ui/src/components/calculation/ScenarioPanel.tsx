"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { useScenarios, useSelectScenario } from "@/lib/hooks/useScenarios";
import { AddScenarioForm } from "./AddScenarioForm";
import { ScenarioCompare } from "./ScenarioCompare";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils/format";
import type { components } from "@/lib/types/api.types";

type CalculationDto = components["schemas"]["CalculationDto"];

interface Props {
  calculation: CalculationDto;
}

export function ScenarioPanel({ calculation }: Props) {
  const t = useTranslations("scenario");
  const { data: scenarios = [], isLoading } = useScenarios(calculation.id!);
  const { mutate: selectScenario, isPending: isSelecting } = useSelectScenario(
    calculation.id!,
  );
  const [showAddForm, setShowAddForm] = useState(false);
  const [compareIds, setCompareIds] = useState<string[]>([]);

  const toggleCompare = (scenarioId: string) => {
    setCompareIds((prev) =>
      prev.includes(scenarioId)
        ? prev.filter((id) => id !== scenarioId)
        : prev.length < 2
          ? [...prev, scenarioId]
          : [prev[1]!, scenarioId],
    );
  };

  const activeScenario =
    scenarios.find((s) => s.id === calculation.selectedScenarioId) ?? scenarios[0];

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-sm">
          {t("title")}{scenarios.length > 0 ? ` (${scenarios.length})` : ""}
        </h3>
        <Button size="sm" variant="outline" onClick={() => setShowAddForm((v) => !v)}>
          {showAddForm ? t("cancel") : t("add")}
        </Button>
      </div>

      {/* Add scenario form — animated */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: "hidden" }}
          >
            <AddScenarioForm
              calculationId={calculation.id!}
              initialInput={activeScenario?.scenarioInput ?? undefined}
              onSuccess={() => setShowAddForm(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scenario list */}
      {scenarios.length > 0 && (
        <div className="space-y-2">
          {scenarios.map((scenario) => {
            const isActive = scenario.id === calculation.selectedScenarioId;
            const isInCompare = compareIds.includes(scenario.id!);

            return (
              <Card
                key={scenario.id}
                className={isActive ? "ring-2 ring-primary bg-primary/5 border-transparent" : ""}
              >
                <CardContent className="py-3 px-4">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-medium text-sm truncate">
                        {scenario.scenarioName ?? `${t("title")} ${scenario.id?.slice(0, 8)}`}
                      </span>
                      {isActive && <Badge>{t("active")}</Badge>}
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDate(scenario.createdAt)}
                      </span>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button
                        size="sm"
                        variant={isInCompare ? "default" : "outline"}
                        onClick={() => toggleCompare(scenario.id!)}
                      >
                        {isInCompare ? t("selected") : t("compare")}
                      </Button>
                      {!isActive && (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={isSelecting}
                          onClick={() => selectScenario(scenario.id!)}
                        >
                          {t("activate")}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Side-by-side comparison */}
      {compareIds.length === 2 && (
        <ScenarioCompare
          scenarios={scenarios.filter((s) => compareIds.includes(s.id!))}
          currency={calculation.currency ?? "USD"}
        />
      )}
    </div>
  );
}
