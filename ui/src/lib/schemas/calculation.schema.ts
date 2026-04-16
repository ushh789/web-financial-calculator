import { z } from "zod";
import type { components } from "@/lib/types/api.types";

type ProductConstraintsDto = components["schemas"]["ProductConstraintsDto"];
export type CalculationFormData = {
  amount: number;
  rate?: number;
  term?: number;
  startDate?: string;
  currency: string;
};

export function buildCalculationSchema(constraints?: ProductConstraintsDto) {
  let amount = z.number({ message: "Введіть число" }).positive("Має бути > 0");
  if (constraints?.minAmount != null)
    amount = amount.min(constraints.minAmount, `Мінімальна сума ${constraints.minAmount}`);
  if (constraints?.maxAmount != null)
    amount = amount.max(constraints.maxAmount, `Максимальна сума ${constraints.maxAmount}`);

  let rate = z.number({ message: "Введіть число" }).positive("Має бути > 0");
  if (constraints?.minRate != null)
    rate = rate.min(constraints.minRate, `Мінімальна ставка ${constraints.minRate}%`);
  if (constraints?.maxRate != null)
    rate = rate.max(constraints.maxRate, `Максимальна ставка ${constraints.maxRate}%`);

  let term = z
    .number({ message: "Введіть число" })
    .int("Ціле число")
    .positive("Має бути > 0");
  if (constraints?.minTerm != null)
    term = term.min(constraints.minTerm, `Мінімальний термін ${constraints.minTerm}`);
  if (constraints?.maxTerm != null)
    term = term.max(constraints.maxTerm, `Максимальний термін ${constraints.maxTerm}`);

  return z.object({
    amount: amount,
    rate: rate.optional(),
    term: term.optional(),
    startDate: z.string().optional(),
    currency: z.string().length(3, "3 символи"),
  }) as z.ZodType<CalculationFormData, CalculationFormData>;
}
