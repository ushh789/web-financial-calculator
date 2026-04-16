"use client";

import { Controller, useWatch, type Control, type FieldErrors } from "react-hook-form";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CreateCalculatorFormValues } from "@/lib/schemas/admin.schema";

interface Props {
  control: Control<CreateCalculatorFormValues>;
  errors: FieldErrors<CreateCalculatorFormValues>;
}

const FREQUENCIES = [
  "ONCE",
  "DAILY",
  "WEEKLY",
  "BI_WEEKLY",
  "MONTHLY",
  "QUARTERLY",
  "SEMI_ANNUALLY",
  "ANNUALLY",
] as const;

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-destructive mt-1">{message}</p>;
}

export function AlgorithmMetadataFields({ control, errors }: Props) {
  const t = useTranslations("admin");
  const e = errors.algorithmMetadata;

  const method = useWatch({ control, name: "algorithmMetadata.interest.method" });

  return (
    <div className="space-y-6">
      {/* Product type */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label>{t("fields.type")}</Label>
          <Controller
            control={control}
            name="algorithmMetadata.type"
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOAN">{t("productType.LOAN")}</SelectItem>
                  <SelectItem value="DEPOSIT">{t("productType.DEPOSIT")}</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          <FieldError message={e?.type?.message} />
        </div>
      </div>

      {/* Interest */}
      <div>
        <p className="text-sm font-medium mb-3">{t("sections.interest")}</p>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label>{t("fields.interestMethod")}</Label>
            <Controller
              control={control}
              name="algorithmMetadata.interest.method"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SIMPLE">{t("interestMethod.SIMPLE")}</SelectItem>
                    <SelectItem value="COMPOUND">{t("interestMethod.COMPOUND")}</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError message={e?.interest?.method?.message} />
          </div>

          <div className="space-y-1">
            <Label>{t("fields.rateType")}</Label>
            <Controller
              control={control}
              name="algorithmMetadata.interest.rateType"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FIXED">{t("rateType.FIXED")}</SelectItem>
                    <SelectItem value="FLOATING">{t("rateType.FLOATING")}</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError message={e?.interest?.rateType?.message} />
          </div>

          <div className="space-y-1">
            <Label>{t("fields.dayCount")}</Label>
            <Controller
              control={control}
              name="algorithmMetadata.interest.dayCountConvention"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(["ACTUAL_365", "ACTUAL_360", "THIRTY_360", "ACTUAL_ACTUAL"] as const).map(
                      (v) => <SelectItem key={v} value={v}>{v}</SelectItem>,
                    )}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError message={e?.interest?.dayCountConvention?.message} />
          </div>

          <div className="space-y-1">
            <Label>{t("fields.accrualFreq")}</Label>
            <Controller
              control={control}
              name="algorithmMetadata.interest.accrualFrequency"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value ?? ""}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("optional")} />
                  </SelectTrigger>
                  <SelectContent>
                    {FREQUENCIES.map((f) => (
                      <SelectItem key={f} value={f}>{t(`frequency.${f}`)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {method === "COMPOUND" && (
            <div className="space-y-1">
              <Label>{t("fields.compoundingFreq")}</Label>
              <Controller
                control={control}
                name="algorithmMetadata.interest.compoundingFrequency"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value ?? ""}>
                    <SelectTrigger>
                      <SelectValue placeholder={t("optional")} />
                    </SelectTrigger>
                    <SelectContent>
                      {FREQUENCIES.map((f) => (
                        <SelectItem key={f} value={f}>{t(`frequency.${f}`)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          )}
        </div>
      </div>

      {/* Repayment */}
      <div>
        <p className="text-sm font-medium mb-3">{t("sections.repayment")}</p>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label>{t("fields.strategy")}</Label>
            <Controller
              control={control}
              name="algorithmMetadata.repayment.strategy"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(["ANNUITY", "LINEAR", "BULLET", "ZERO_COUPON"] as const).map((v) => (
                      <SelectItem key={v} value={v}>{t(`amortization.${v}`)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError message={e?.repayment?.strategy?.message} />
          </div>

          <div className="space-y-1">
            <Label>{t("fields.repaymentFreq")}</Label>
            <Controller
              control={control}
              name="algorithmMetadata.repayment.frequency"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FREQUENCIES.map((f) => (
                      <SelectItem key={f} value={f}>{t(`frequency.${f}`)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError message={e?.repayment?.frequency?.message} />
          </div>
        </div>
      </div>

      {/* Constraints */}
      <div>
        <p className="text-sm font-medium mb-3">{t("sections.constraints")}</p>
        <div className="grid grid-cols-3 gap-4">
          {(
            [
              ["algorithmMetadata.constraints.minAmount", t("fields.minAmount")],
              ["algorithmMetadata.constraints.maxAmount", t("fields.maxAmount")],
              ["algorithmMetadata.constraints.minRate", t("fields.minRate")],
              ["algorithmMetadata.constraints.maxRate", t("fields.maxRate")],
              ["algorithmMetadata.constraints.minTerm", t("fields.minTerm")],
              ["algorithmMetadata.constraints.maxTerm", t("fields.maxTerm")],
            ] as const
          ).map(([name, label]) => (
            <div key={name} className="space-y-1">
              <Label>{label}</Label>
              <Controller
                control={control}
                name={name}
                render={({ field }) => (
                  <Input
                    type="number"
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === "" ? undefined : Number(e.target.value),
                      )
                    }
                  />
                )}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Defaults */}
      <div>
        <p className="text-sm font-medium mb-3">{t("sections.defaults")}</p>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label>{t("fields.currency")}</Label>
            <Controller
              control={control}
              name="algorithmMetadata.defaults.currency"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value ?? "USD"}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(["USD", "EUR", "UAH", "GBP"] as const).map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-1">
            <Label>{t("fields.fixedRate")}</Label>
            <Controller
              control={control}
              name="algorithmMetadata.defaults.fixedRate"
              render={({ field }) => (
                <Input
                  type="number"
                  step="0.01"
                  {...field}
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value === "" ? undefined : Number(e.target.value),
                    )
                  }
                />
              )}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
