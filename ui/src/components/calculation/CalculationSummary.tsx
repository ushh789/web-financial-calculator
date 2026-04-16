"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { computeCashFlowMetrics } from "@/lib/utils/cashflow.utils";
import type { CashFlow } from "./CashFlowTable";

interface Props {
  cashFlows: CashFlow[];
  currency: string;
}

interface KpiTileProps {
  label: string;
  value: string;
  variant?: "default" | "amber" | "destructive";
}

function KpiTile({ label, value, variant = "default" }: KpiTileProps) {
  const valueClass = cn(
    "text-xl font-bold tabular-nums",
    variant === "amber" && "text-amber-600 dark:text-amber-400",
    variant === "destructive" && "text-destructive",
  );

  return (
    <Card>
      <CardContent className="pt-4 pb-4">
        <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1.5 leading-none">
          {label}
        </p>
        <p className={valueClass}>{value}</p>
      </CardContent>
    </Card>
  );
}

export function CalculationSummary({ cashFlows, currency }: Props) {
  const t = useTranslations("summary");

  const m = useMemo(() => computeCashFlowMetrics(cashFlows), [cashFlows]);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
      <KpiTile
        label={t("totalPayments")}
        value={formatCurrency(m.totalPayments, currency)}
      />
      <KpiTile
        label={t("totalPrincipal")}
        value={formatCurrency(m.totalPrincipal, currency)}
      />
      <KpiTile
        label={t("totalInterest")}
        value={formatCurrency(m.totalInterest, currency)}
        variant="amber"
      />
      <KpiTile
        label={t("interestRatio")}
        value={`${m.interestRatio}%`}
        variant="amber"
      />
      <KpiTile
        label={t("overpayment")}
        value={formatCurrency(m.overpayment, currency)}
        variant="destructive"
      />
      <KpiTile
        label={t("paymentPeriod")}
        value={
          m.firstPaymentDate && m.lastPaymentDate
            ? `${formatDate(m.firstPaymentDate)} – ${formatDate(m.lastPaymentDate)}`
            : "—"
        }
      />
    </div>
  );
}
