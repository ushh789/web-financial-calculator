"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
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
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
      {/* Identity fields */}
      <div className="bg-surface-sunken rounded-lg border border-border p-5 space-y-4">
        <p className="text-[10px] uppercase tracking-[0.08em] text-text-3 font-medium">
          Product identity
        </p>

        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-text">{t("fields.code")}</Label>
          <Input
            placeholder="loan_annuity_v1"
            disabled={isPending}
            className="h-11 font-mono bg-surface border-border text-text"
            {...form.register("code")}
          />
          {form.formState.errors.code && (
            <p className="text-xs text-negative">{form.formState.errors.code.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-text">{t("fields.name")}</Label>
          <Input
            placeholder={t("namePlaceholder")}
            disabled={isPending}
            className="h-11 bg-surface border-border text-text"
            {...form.register("name")}
          />
          {form.formState.errors.name && (
            <p className="text-xs text-negative">{form.formState.errors.name.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-text">{t("fields.description")}</Label>
          <Input
            placeholder={t("optional")}
            disabled={isPending}
            className="h-11 bg-surface border-border text-text"
            {...form.register("description")}
          />
        </div>
      </div>

      <AlgorithmMetadataFields
        control={form.control}
        errors={form.formState.errors}
      />

      <button
        type="submit"
        disabled={isPending}
        className="w-full h-11 bg-accent text-accent-fg hover:bg-accent-strong font-medium rounded-sm transition-colors disabled:opacity-50"
      >
        {isPending ? t("creating") : t("createCalculator")}
      </button>
    </form>
  );
}

