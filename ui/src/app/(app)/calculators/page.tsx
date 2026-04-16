import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { CalculatorCard } from "@/components/calculator/CalculatorCard";
import { Skeleton } from "@/components/ui/skeleton";
import { serverFetch } from "@/lib/api/serverFetch";
import type { components } from "@/lib/types/api.types";

type PageCalculatorDto = components["schemas"]["PageCalculatorDto"];

async function CalculatorGrid() {
  const t = await getTranslations("calculator");
  const data = await serverFetch<PageCalculatorDto>("/api/calculators?page=0&size=50");
  const calculators = data.content ?? [];

  if (calculators.length === 0) {
    return (
      <p className="text-muted-foreground col-span-full text-center py-12">
        {t("empty")}
      </p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {calculators.map((calc) => (
        <CalculatorCard key={calc.id} calculator={calc} />
      ))}
    </div>
  );
}

function CalculatorGridSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-44 rounded-xl" />
      ))}
    </div>
  );
}

export default async function CalculatorsPage() {
  const t = await getTranslations("calculator");
  return (
    <div>
      <h1 className="page-title mb-6">{t("catalog")}</h1>
      <Suspense fallback={<CalculatorGridSkeleton />}>
        <CalculatorGrid />
      </Suspense>
    </div>
  );
}
