"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
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
      {/* Page header */}
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <p className="text-[11px] uppercase tracking-[0.08em] text-text-3 font-medium mb-1">
            {selectedVersion?.algorithmMetadata?.type === "LOAN" ? "Loan calculator" : "Calculator"}
          </p>
          <h1 className="text-2xl font-semibold text-text leading-tight">{calculator.name}</h1>
          {calculator.description && (
            <p className="text-text-2 mt-1 text-sm">{calculator.description}</p>
          )}
        </div>
        <Badge
          variant={calculator.active ? "default" : "outline"}
          className={calculator.active
            ? "bg-positive-soft text-positive border-positive-line hover:bg-positive-soft"
            : ""}
        >
          {calculator.active ? "Active" : "Inactive"}
        </Badge>
      </div>

      {/* Version selector */}
      {versions.length > 0 && (
        <VersionSelector
          versions={versions}
          selectedVersionId={selectedVersionId}
          onChange={setSelectedVersionId}
        />
      )}

      {/* Split layout */}
      {selectedVersion && calculator.id && selectedVersion.id ? (
        <CalculatorForm
          key={selectedVersion.id}
          calculatorId={calculator.id}
          calculatorVersionId={selectedVersion.id}
          constraints={constraints}
          defaults={defaults}
        />
      ) : null}
    </div>
  );
}

