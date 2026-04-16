"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useAddScenario } from "@/lib/hooks/useScenarios";
import type { components } from "@/lib/types/api.types";

type CalculationInputDto = components["schemas"]["CalculationInputDto"];

const schema = z.object({
  scenarioName: z.string().min(1, "Введіть назву сценарію"),
  amount: z.number({ message: "Введіть суму" }).positive("Має бути > 0"),
  rate: z.number().positive("Має бути > 0").optional(),
  term: z.number().int("Ціле число").positive("Має бути > 0").optional(),
  startDate: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  calculationId: string;
  initialInput?: CalculationInputDto;
  onSuccess: () => void;
}

export function AddScenarioForm({ calculationId, initialInput, onSuccess }: Props) {
  const t = useTranslations("scenario.form");
  const { mutate: addScenario, isPending } = useAddScenario(calculationId);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      scenarioName: "",
      amount: initialInput?.amount,
      rate: initialInput?.rate,
      term: initialInput?.term,
      startDate: initialInput?.startDate,
    },
  });

  function onSubmit(data: FormData) {
    addScenario(
      {
        scenarioName: data.scenarioName,
        scenarioInput: {
          amount: data.amount,
          rate: data.rate,
          term: data.term,
          startDate: data.startDate || undefined,
        },
      },
      { onSuccess },
    );
  }

  return (
    <Card>
      <CardContent className="pt-4">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="scenarioName">{t("name")}</Label>
            <Input
              id="scenarioName"
              placeholder={t("namePlaceholder")}
              disabled={isPending}
              {...form.register("scenarioName")}
            />
            {form.formState.errors.scenarioName && (
              <p className="text-xs text-destructive">
                {form.formState.errors.scenarioName.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="amount">{t("amount")}</Label>
              <Input
                id="amount"
                type="number"
                step="any"
                placeholder="0"
                disabled={isPending}
                {...form.register("amount", { valueAsNumber: true })}
              />
              {form.formState.errors.amount && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.amount.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="rate">{t("rate")}</Label>
              <Input
                id="rate"
                type="number"
                step="any"
                placeholder="0"
                disabled={isPending}
                {...form.register("rate", { valueAsNumber: true })}
              />
              {form.formState.errors.rate && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.rate.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="term">{t("term")}</Label>
              <Input
                id="term"
                type="number"
                step="1"
                placeholder="0"
                disabled={isPending}
                {...form.register("term", { valueAsNumber: true })}
              />
              {form.formState.errors.term && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.term.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="startDate">{t("startDate")}</Label>
              <Input
                id="startDate"
                type="date"
                disabled={isPending}
                {...form.register("startDate")}
              />
            </div>
          </div>

          <Button type="submit" size="sm" disabled={isPending} className="w-full">
            {isPending ? t("submitting") : t("submit")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
