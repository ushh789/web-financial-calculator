"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  buildCalculationSchema,
  type CalculationFormData,
} from "@/lib/schemas/calculation.schema";
import { useCreateCalculation } from "@/lib/hooks/useCalculators";
import { useAuthStore } from "@/lib/stores/auth.store";
import type { components } from "@/lib/types/api.types";

type ProductConstraintsDto = components["schemas"]["ProductConstraintsDto"];
type ProductDefaultsDto = components["schemas"]["ProductDefaultsDto"];

interface CalculatorFormProps {
  calculatorId: string;
  calculatorVersionId: string;
  constraints?: ProductConstraintsDto;
  defaults?: ProductDefaultsDto;
}

export function CalculatorForm({
  calculatorId,
  constraints,
  defaults,
}: CalculatorFormProps) {
  const t = useTranslations("calculator.form");
  const user = useAuthStore((s) => s.user);
  const { mutate: createCalculation, isPending } = useCreateCalculation();

  const schema = buildCalculationSchema(constraints);

  const form = useForm<CalculationFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      amount: undefined,
      rate: undefined,
      term: undefined,
      startDate: undefined,
      currency: defaults?.currency ?? "USD",
    },
  });

  function onSubmit(data: CalculationFormData) {
    if (!user?.id) return;
    createCalculation({
      userId: user.id,
      calculatorId,
      inputData: {
        amount: data.amount,
        rate: data.rate,
        term: data.term,
        startDate: data.startDate,
      },
      currency: data.currency,
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="amount">
          {t("amount")}{" "}
          {constraints?.minAmount != null || constraints?.maxAmount != null ? (
            <span className="text-muted-foreground text-xs">
              ({constraints.minAmount ?? "0"} – {constraints.maxAmount ?? "∞"})
            </span>
          ) : null}
        </Label>
        <Input
          id="amount"
          type="number"
          step="any"
          placeholder="0"
          disabled={isPending}
          {...form.register("amount", { valueAsNumber: true })}
        />
        {form.formState.errors.amount && (
          <p className="text-sm text-destructive">{form.formState.errors.amount.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="rate">
          {t("rate")}{" "}
          {constraints?.minRate != null || constraints?.maxRate != null ? (
            <span className="text-muted-foreground text-xs">
              ({constraints.minRate ?? "0"} – {constraints.maxRate ?? "∞"})
            </span>
          ) : null}
        </Label>
        <Input
          id="rate"
          type="number"
          step="any"
          placeholder="0"
          disabled={isPending}
          {...form.register("rate", { valueAsNumber: true })}
        />
        {form.formState.errors.rate && (
          <p className="text-sm text-destructive">{form.formState.errors.rate.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="term">
          {t("term")}{" "}
          {constraints?.minTerm != null || constraints?.maxTerm != null ? (
            <span className="text-muted-foreground text-xs">
              ({constraints.minTerm ?? "0"} – {constraints.maxTerm ?? "∞"})
            </span>
          ) : null}
        </Label>
        <Input
          id="term"
          type="number"
          step="1"
          placeholder="0"
          disabled={isPending}
          {...form.register("term", { valueAsNumber: true })}
        />
        {form.formState.errors.term && (
          <p className="text-sm text-destructive">{form.formState.errors.term.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="startDate">{t("startDate")}</Label>
        <Input
          id="startDate"
          type="date"
          disabled={isPending}
          {...form.register("startDate")}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="currency">{t("currency")}</Label>
        <Input
          id="currency"
          maxLength={3}
          placeholder="USD"
          disabled={isPending}
          {...form.register("currency")}
        />
        {form.formState.errors.currency && (
          <p className="text-sm text-destructive">{form.formState.errors.currency.message}</p>
        )}
      </div>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? t("submitting") : t("submit")}
      </Button>
    </form>
  );
}
