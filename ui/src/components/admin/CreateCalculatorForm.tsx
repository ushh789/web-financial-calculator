"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlgorithmMetadataFields } from "./AlgorithmMetadataFields";
import {
  createCalculatorSchema,
  type CreateCalculatorFormValues,
} from "@/lib/schemas/admin.schema";
import { useCreateCalculator } from "@/lib/hooks/useCalculators";

interface Props {
  onSuccess?: () => void;
}

export function CreateCalculatorForm({ onSuccess }: Props) {
  const t = useTranslations("admin");
  const { mutate: create, isPending } = useCreateCalculator();

  const form = useForm<CreateCalculatorFormValues>({
    resolver: zodResolver(createCalculatorSchema) as never,
    defaultValues: {
      code: "",
      name: "",
      description: "",
      algorithmMetadata: {
        type: "LOAN",
        interest: {
          method: "SIMPLE",
          dayCountConvention: "ACTUAL_365",
          rateType: "FIXED",
        },
        repayment: {
          strategy: "ANNUITY",
          frequency: "MONTHLY",
        },
        defaults: {
          currency: "USD",
          roundingScale: 2,
          roundingMode: "HALF_UP",
        },
      },
    },
  });

  function onSubmit(data: CreateCalculatorFormValues) {
    create(data, { onSuccess });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-1">
          <Label>{t("fields.code")}</Label>
          <Input
            placeholder="loan_annuity_v1"
            disabled={isPending}
            {...form.register("code")}
          />
          {form.formState.errors.code && (
            <p className="text-xs text-destructive">{form.formState.errors.code.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <Label>{t("fields.name")}</Label>
          <Input
            placeholder={t("namePlaceholder")}
            disabled={isPending}
            {...form.register("name")}
          />
          {form.formState.errors.name && (
            <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <Label>{t("fields.description")}</Label>
          <Input
            placeholder={t("optional")}
            disabled={isPending}
            {...form.register("description")}
          />
        </div>
      </div>

      <AlgorithmMetadataFields
        control={form.control}
        errors={form.formState.errors}
      />

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? t("creating") : t("createCalculator")}
      </Button>
    </form>
  );
}
