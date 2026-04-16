"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { FileText } from "lucide-react";
import { useAuthStore } from "@/lib/stores/auth.store";
import { useUserCalculations } from "@/lib/hooks/useScenarios";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { buttonVariants } from "@/components/ui/button";
import { formatDate } from "@/lib/utils/format";
import { cn } from "@/lib/utils";

function CalculationRow({
  id,
  currency,
  createdAt,
  viewLabel,
}: {
  id: string;
  currency?: string;
  createdAt?: string;
  viewLabel: string;
}) {
  return (
    <div className="flex items-center gap-4 px-4 py-3.5 border-b last:border-0 hover:bg-muted/40 transition-colors">
      <div className="shrink-0 flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <FileText className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0 space-y-0.5">
        <p className="text-sm font-medium font-mono leading-tight">{id.slice(0, 8)}&hellip;</p>
        <p className="text-xs text-muted-foreground">
          {createdAt ? formatDate(createdAt) : "—"}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Badge variant="outline" className="font-mono text-xs">
          {currency ?? "USD"}
        </Badge>
        <Link
          href={`/calculations/${id}`}
          className={cn(buttonVariants({ size: "sm", variant: "outline" }))}
        >
          {viewLabel}
        </Link>
      </div>
    </div>
  );
}

export default function CalculationsPage() {
  const t = useTranslations("calculation");
  const user = useAuthStore((s) => s.user);
  const userId = user?.id ?? "";

  const { data, isLoading } = useUserCalculations(userId);
  const calculations = data?.content ?? [];

  return (
    <div>
      <h1 className="page-title mb-6">{t("myTitle")}</h1>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      ) : calculations.length === 0 ? (
        <p className="text-muted-foreground">
          {t("empty")}{" "}
          <Link href="/calculators" className="underline text-primary">
            {t("emptyLink")}
          </Link>
          .
        </p>
      ) : (
        <div className="rounded-xl border overflow-hidden">
          {calculations.map((calc) => (
            <CalculationRow
              key={calc.id}
              id={calc.id!}
              currency={calc.currency}
              createdAt={calc.createdAt}
              viewLabel={t("view")}
            />
          ))}
        </div>
      )}

      {data && (data.totalPages ?? 0) > 1 && (
        <p className="text-xs text-muted-foreground mt-4 text-center">
          {t("showing", {
            count: calculations.length,
            total: data.totalElements ?? 0,
          })}
        </p>
      )}
    </div>
  );
}
