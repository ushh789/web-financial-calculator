"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { VersionSelector } from "./VersionSelector";
import { CalculatorForm } from "./CalculatorForm";
import type { components } from "@/lib/types/api.types";

type CalculatorDto = components["schemas"]["CalculatorDto"];
type CalculatorVersionDto = components["schemas"]["CalculatorVersionDto"];

interface CalculatorDetailProps {
  calculator: CalculatorDto;
  versions: CalculatorVersionDto[];
}

export function CalculatorDetail({ calculator, versions }: CalculatorDetailProps) {
  const latestVersion = versions.at(-1);
  const [selectedVersionId, setSelectedVersionId] = useState<string>(
    latestVersion?.id ?? "",
  );

  const selectedVersion = versions.find((v) => v.id === selectedVersionId);
  const constraints = selectedVersion?.algorithmMetadata?.constraints;
  const defaults = selectedVersion?.algorithmMetadata?.defaults;

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <h1 className="page-title">{calculator.name}</h1>
          {calculator.description && (
            <p className="text-muted-foreground mt-1">{calculator.description}</p>
          )}
        </div>
        <Badge variant={calculator.active ? "default" : "outline"}>
          {calculator.active ? "Активний" : "Неактивний"}
        </Badge>
      </div>

      {versions.length > 0 && (
        <VersionSelector
          versions={versions}
          selectedVersionId={selectedVersionId}
          onChange={setSelectedVersionId}
        />
      )}

      {selectedVersion && (
        <>
          <Separator />
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Параметри продукту</CardTitle>
                <CardDescription>
                  Тип:{" "}
                  {selectedVersion.algorithmMetadata?.type === "LOAN"
                    ? "Кредит"
                    : "Депозит"}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm">
                <dl className="divide-y divide-border">
                  {[
                    { label: "Нарахування", value: selectedVersion.algorithmMetadata?.interest?.method },
                    { label: "Ставка",      value: selectedVersion.algorithmMetadata?.interest?.rateType },
                    { label: "Погашення",   value: selectedVersion.algorithmMetadata?.repayment?.strategy },
                    { label: "Частота",     value: selectedVersion.algorithmMetadata?.repayment?.frequency },
                    ...(defaults?.currency ? [{ label: "Валюта", value: defaults.currency }] : []),
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between py-2.5 gap-4">
                      <dt className="text-muted-foreground shrink-0">{label}</dt>
                      <dd className="font-medium text-right">{value ?? "—"}</dd>
                    </div>
                  ))}
                </dl>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Новий розрахунок</CardTitle>
                <CardDescription>Версія {selectedVersion.version}</CardDescription>
              </CardHeader>
              <CardContent>
                {calculator.id && selectedVersion.id ? (
                  <CalculatorForm
                    key={selectedVersion.id}
                    calculatorId={calculator.id}
                    calculatorVersionId={selectedVersion.id}
                    constraints={constraints}
                    defaults={defaults}
                  />
                ) : null}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
