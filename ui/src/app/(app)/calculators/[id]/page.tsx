import { notFound } from "next/navigation";
import { CalculatorDetail } from "@/components/calculator/CalculatorDetail";
import { serverFetch } from "@/lib/api/serverFetch";
import type { components } from "@/lib/types/api.types";

type CalculatorDto = components["schemas"]["CalculatorDto"];
type CalculatorVersionDto = components["schemas"]["CalculatorVersionDto"];

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CalculatorPage({ params }: PageProps) {
  const { id } = await params;

  let calculator: CalculatorDto;
  let versions: CalculatorVersionDto[];

  try {
    [calculator, versions] = await Promise.all([
      serverFetch<CalculatorDto>(`/api/calculators/${id}`),
      serverFetch<CalculatorVersionDto[]>(`/api/calculators/${id}/versions`),
    ]);
  } catch {
    notFound();
  }

  return (
    <CalculatorDetail
      calculator={calculator!}
      versions={versions!}
    />
  );
}
