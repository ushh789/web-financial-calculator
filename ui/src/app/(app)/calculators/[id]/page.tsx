"use client";

import { useParams } from "next/navigation";
import { notFound } from "next/navigation";
import { CalculatorDetail } from "@/components/calculator/CalculatorDetail";
import { useCalculator, useCalculatorVersions } from "@/lib/hooks/useCalculators";
import { Skeleton } from "@/components/ui/skeleton";

export default function CalculatorPage() {
  const { id } = useParams<{ id: string }>();
  const { data: calculator, isLoading: calcLoading, isError: calcError } = useCalculator(id);
  const { data: versions = [], isLoading: versionsLoading } = useCalculatorVersions(id);

  if (calcLoading || versionsLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (calcError || !calculator) {
    notFound();
  }

  return <CalculatorDetail calculator={calculator!} versions={versions} />;
}
