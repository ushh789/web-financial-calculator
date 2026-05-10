"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
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
  productType?: ProductType;
  repayment?: RepaymentConfigDto;
  interest?: InterestConfigDto;
}

function formatCurrency(value: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

type Frequency = components["schemas"]["Frequency"];
type InterestConfigDto = components["schemas"]["InterestConfigDto"];
type RepaymentConfigDto = components["schemas"]["RepaymentConfigDto"];
type ProductType = components["schemas"]["ProductType"];

function computeNextPaymentDate(startDate: string, frequency: Frequency): string | null {
  if (!startDate || frequency === "ONCE") return null;
  const d = new Date(startDate);
  switch (frequency) {
    case "DAILY":         d.setDate(d.getDate() + 1); break;
    case "WEEKLY":        d.setDate(d.getDate() + 7); break;
    case "BI_WEEKLY":     d.setDate(d.getDate() + 14); break;
    case "MONTHLY":       d.setMonth(d.getMonth() + 1); break;
    case "QUARTERLY":     d.setMonth(d.getMonth() + 3); break;
    case "SEMI_ANNUALLY": d.setMonth(d.getMonth() + 6); break;
    case "ANNUALLY":      d.setFullYear(d.getFullYear() + 1); break;
  }
  return d.toLocaleDateString("uk-UA", { year: "numeric", month: "short", day: "numeric" });
}

function computeEndDate(startDate: string, termMonths: number): string | null {
  if (!startDate || !termMonths || termMonths <= 0) return null;
  const d = new Date(startDate);
  d.setMonth(d.getMonth() + termMonths);
  return d.toLocaleDateString("uk-UA", { year: "numeric", month: "short", day: "numeric" });
}

function computePreview(amount: number, rate: number, term: number) {
  if (!amount || !rate || !term || amount <= 0 || rate <= 0 || term <= 0) {
    return null;
  }
  const monthlyRate = rate / 100 / 12;
  const payment =
    monthlyRate === 0
      ? amount / term
      : (amount * (monthlyRate * Math.pow(1 + monthlyRate, term))) /
        (Math.pow(1 + monthlyRate, term) - 1);
  const totalPaid = payment * term;
  const totalInterest = totalPaid - amount;
  const interestRatio = (totalInterest / amount) * 100;
  return { payment, totalPaid, totalInterest, interestRatio };
}

function LiveSummary({
  amount,
  rate,
  term,
  currency,
  startDate,
  frequency,
}: {
  amount: number;
  rate: number;
  term: number;
  currency: string;
  startDate: string;
  frequency: Frequency | undefined;
}) {
  const t = useTranslations("calculator.live");
  const tSensitivity = useTranslations("sensitivity");
  const preview = useMemo(
    () => computePreview(amount, rate, term),
    [amount, rate, term],
  );

  const hasData = !!preview;
  const nextPaymentDate = frequency && startDate
    ? computeNextPaymentDate(startDate, frequency)
    : null;
  const endDate = startDate && term > 0
    ? computeEndDate(startDate, term)
    : null;
  const hasDateData = !!(nextPaymentDate || endDate);

  return (
    <div className="space-y-5">
      <div>
        <p className="text-[11px] uppercase tracking-[0.08em] text-text-3 font-medium mb-2">
          {t("monthlyPaymentApprox")}
        </p>
        {hasData ? (
          <div className="flex items-baseline gap-1">
            <span className="text-text-3 text-2xl font-serif">{currency}</span>
            <span className="font-serif text-[52px] font-medium text-text leading-none">
              {preview.payment.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
        ) : (
          <div className="font-serif text-[52px] font-medium text-text-4 leading-none">
            {t("emptyValue")}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          {
            label: t("totalPayments"),
            value: hasData ? formatCurrency(preview.totalPaid, currency) : t("emptyValue"),
          },
          {
            label: t("totalInterest"),
            value: hasData ? formatCurrency(preview.totalInterest, currency) : t("emptyValue"),
            warn: hasData,
          },
          {
            label: t("principalAmount"),
            value: hasData ? formatCurrency(amount, currency) : t("emptyValue"),
          },
          {
            label: t("interestRatio"),
            value: hasData ? `${preview.interestRatio.toFixed(1)}%` : t("emptyValue"),
            warn: hasData,
          },
        ].map(({ label, value, warn }) => (
          <div key={label} className="bg-surface-sunken rounded-lg p-3">
            <p className="text-[11px] uppercase tracking-[0.06em] text-text-3 mb-1">{label}</p>
            <p className={`font-mono text-sm font-medium tabular-nums ${warn ? "text-warn" : "text-text"}`}>
              {value}
            </p>
          </div>
        ))}
      </div>

      {hasDateData && (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-surface-sunken rounded-lg p-3">
            <p className="text-[11px] uppercase tracking-[0.06em] text-text-3 mb-1">
              {t("nextPayment")}
            </p>
            <p className="font-mono text-sm font-medium tabular-nums text-text">
              {nextPaymentDate ?? t("emptyValue")}
            </p>
          </div>
          <div className="bg-surface-sunken rounded-lg p-3">
            <p className="text-[11px] uppercase tracking-[0.06em] text-text-3 mb-1">
              {t("endDate")}
            </p>
            <p className="font-mono text-sm font-medium tabular-nums text-text">
              {endDate ?? t("emptyValue")}
            </p>
          </div>
        </div>
      )}

      {hasData && (
        <div>
          <p className="text-[11px] uppercase tracking-[0.06em] text-text-3 mb-2">
            {t("principalVsInterest")}
          </p>
          <div className="flex h-2 rounded-full overflow-hidden">
            <div
              className="bg-chart-principal"
              style={{
                width: `${(amount / preview.totalPaid) * 100}%`,
              }}
            />
            <div className="bg-chart-interest flex-1" />
          </div>
          <div className="flex justify-between mt-1 text-[11px] text-text-3">
            <span>{tSensitivity("totalPrincipal")} {((amount / preview.totalPaid) * 100).toFixed(0)}%</span>
            <span>{tSensitivity("totalInterest")} {((preview.totalInterest / preview.totalPaid) * 100).toFixed(0)}%</span>
          </div>
        </div>
      )}

      {!hasData && (
        <p className="text-sm text-text-3 text-center py-4">{t("fillTheForm")}</p>
      )}
      {hasData && (
        <p className="text-xs text-text-3">{t("approxDisclaimer")}</p>
      )}
    </div>
  );
}

function VersionInfoCard({
  productType,
  repayment,
  interest,
}: {
  productType: ProductType | undefined;
  repayment: RepaymentConfigDto | undefined;
  interest: InterestConfigDto | undefined;
}) {
  const t = useTranslations("calculator.live");
  const tAdmin = useTranslations("admin");

  const fields = [
    {
      label: tAdmin("fields.type"),
      value: productType ? tAdmin(`productType.${productType}`) : "—",
    },
    {
      label: tAdmin("fields.repaymentFreq"),
      value: repayment?.frequency ? tAdmin(`frequency.${repayment.frequency}`) : "—",
    },
    {
      label: tAdmin("fields.strategy"),
      value: repayment?.strategy ? tAdmin(`amortization.${repayment.strategy}`) : "—",
    },
    {
      label: tAdmin("fields.interestMethod"),
      value: interest?.method ? tAdmin(`interestMethod.${interest.method}`) : "—",
    },
    {
      label: tAdmin("fields.rateType"),
      value: interest?.rateType ? tAdmin(`rateType.${interest.rateType}`) : "—",
    },
  ];

  return (
    <div className="bg-surface rounded-lg border border-border shadow-1 p-6">
      <p className="text-[11px] uppercase tracking-[0.08em] text-text-3 font-medium mb-4">
        {t("versionInfo")}
      </p>
      <div className="grid grid-cols-2 gap-3">
        {fields.map(({ label, value }) => (
          <div key={label} className="bg-surface-sunken rounded-lg p-3">
            <p className="text-[11px] uppercase tracking-[0.06em] text-text-3 mb-1">{label}</p>
            <p className="text-sm font-medium text-text">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CalculatorForm({
  calculatorId,
  constraints,
  defaults,
  productType,
  repayment,
  interest,
}: CalculatorFormProps) {
  const t = useTranslations("calculator.form");
  const tLive = useTranslations("calculator.live");
  const tCommon = useTranslations("common");
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

  const [watchedAmount, watchedRate, watchedTerm, watchedCurrency, watchedStartDate] = useWatch({
    control: form.control,
    name: ["amount", "rate", "term", "currency", "startDate"],
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
    <div className="grid gap-6 lg:grid-cols-[1.05fr_1fr]">
      <div className="bg-surface rounded-lg border border-border shadow-1">
        <div className="px-6 py-4 border-b border-border">
          <p className="text-[11px] uppercase tracking-[0.08em] text-text-3 font-medium">{t("inputs")}</p>
          <h2 className="text-base font-semibold text-text mt-0.5">{t("loanTerms")}</h2>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="amount" className="text-sm font-medium text-text">
              {t("amount")}
              {(constraints?.minAmount != null || constraints?.maxAmount != null) && (
                <span className="ml-1 text-xs text-text-3 font-normal">
                  {constraints?.minAmount ?? 0} - {constraints?.maxAmount ?? tCommon("infinity")}
                </span>
              )}
            </Label>
            <Input
              id="amount"
              type="number"
              step="any"
              placeholder="0"
              disabled={isPending}
              className="h-11 font-mono text-text bg-surface border-border focus:border-accent focus:ring-accent"
              {...form.register("amount", { valueAsNumber: true })}
            />
            {form.formState.errors.amount && (
              <p className="text-xs text-negative">{form.formState.errors.amount.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="rate" className="text-sm font-medium text-text">
              {t("rate")}
              {(constraints?.minRate != null || constraints?.maxRate != null) && (
                <span className="ml-1 text-xs text-text-3 font-normal">
                  {constraints?.minRate ?? 0}% - {constraints?.maxRate ?? tCommon("infinity")}%
                </span>
              )}
            </Label>
            <Input
              id="rate"
              type="number"
              step="any"
              placeholder="0"
              disabled={isPending}
              className="h-11 font-mono text-text bg-surface border-border focus:border-accent focus:ring-accent"
              {...form.register("rate", { valueAsNumber: true })}
            />
            {form.formState.errors.rate && (
              <p className="text-xs text-negative">{form.formState.errors.rate.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="term" className="text-sm font-medium text-text">
              {t("term")}
              {(constraints?.minTerm != null || constraints?.maxTerm != null) && (
                <span className="ml-1 text-xs text-text-3 font-normal">
                  {constraints?.minTerm ?? 0} - {constraints?.maxTerm ?? tCommon("infinity")} {tCommon("monthsShort")}
                </span>
              )}
            </Label>
            <Input
              id="term"
              type="number"
              step="1"
              placeholder="0"
              disabled={isPending}
              className="h-11 font-mono text-text bg-surface border-border focus:border-accent focus:ring-accent"
              {...form.register("term", { valueAsNumber: true })}
            />
            {form.formState.errors.term && (
              <p className="text-xs text-negative">{form.formState.errors.term.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="startDate" className="text-sm font-medium text-text">{t("startDate")}</Label>
            <Input
              id="startDate"
              type="date"
              disabled={isPending}
              className="h-11 text-text bg-surface border-border focus:border-accent focus:ring-accent"
              {...form.register("startDate")}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="currency" className="text-sm font-medium text-text">{t("currency")}</Label>
            <Input
              id="currency"
              maxLength={3}
              placeholder="USD"
              disabled={isPending}
              className="h-11 font-mono uppercase text-text bg-surface border-border focus:border-accent focus:ring-accent"
              {...form.register("currency")}
            />
            {form.formState.errors.currency && (
              <p className="text-xs text-negative">{form.formState.errors.currency.message}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isPending}
            className="w-full h-11 bg-accent text-accent-fg hover:bg-accent-strong font-medium"
          >
            {isPending ? t("submitting") : t("submit")}
          </Button>
        </form>
      </div>

      <div className="space-y-4">
        <VersionInfoCard
          productType={productType}
          repayment={repayment}
          interest={interest}
        />
        <div className="sticky top-20">
          <div className="bg-surface rounded-lg border border-border shadow-1 p-6">
            <p className="text-[11px] uppercase tracking-[0.08em] text-text-3 font-medium mb-4">{tLive("title")}</p>
            <LiveSummary
              amount={Number(watchedAmount) || 0}
              rate={Number(watchedRate) || 0}
              term={Number(watchedTerm) || 0}
              currency={watchedCurrency || defaults?.currency || "USD"}
              startDate={watchedStartDate ?? ""}
              frequency={repayment?.frequency}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
