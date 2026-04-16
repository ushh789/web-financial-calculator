import { CalculationView } from "@/components/calculation/CalculationView";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CalculationPage({ params }: PageProps) {
  const { id } = await params;
  return <CalculationView calculationId={id} />;
}
