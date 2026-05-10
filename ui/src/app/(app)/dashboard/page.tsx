"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Calculator, TrendingUp, ArrowRight } from "lucide-react";
import { useAuthStore } from "@/lib/stores/auth.store";
import { useUserCalculations } from "@/lib/hooks/useScenarios";
import { useCalculators } from "@/lib/hooks/useCalculators";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils/format";

export default function DashboardPage() {
  const t = useTranslations("dashboard");
  const user = useAuthStore((s) => s.user);
  const userId = user?.id ?? "";

  const { data, isLoading } = useUserCalculations(userId, 0, 5);
  const { data: statsData } = useUserCalculations(userId, 0, 1);
  const { data: calculatorsData, isLoading: calcLoading } = useCalculators(0, 10);

  const recent = data?.content ?? [];
  const totalCalculations = statsData?.totalElements ?? 0;
  const activeCalculators = calculatorsData?.content?.filter((c) => c.active).slice(0, 3) ?? [];

  return (
    <div className="space-y-8">
      {/* Hero greeting */}
      <div className="bg-surface rounded-lg border border-border shadow-1 px-8 py-7 flex items-center justify-between gap-8">
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-[0.08em] text-text-3 font-medium mb-2">
            {t("title")}
          </p>
          <h1 className="font-serif text-[32px] font-medium text-text leading-snug">
            {t("greeting", { name: user?.firstName ?? user?.username ?? "" })}
          </h1>
        </div>
        <div className="hidden lg:flex flex-col items-end shrink-0">
          <span className="font-serif text-[44px] font-medium text-text leading-none tabular-nums">
            {totalCalculations}
          </span>
          <span className="text-sm text-text-3 mt-1">Total calculations</span>
        </div>
      </div>

      {/* Two-column grid */}
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Recent calculations */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-text">{t("recent")}</h2>
            <Link
              href="/calculations"
              className="text-xs text-accent hover:underline underline-offset-4"
            >
              {t("allCalculations")}
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-17 w-full rounded-lg" />
              ))}
            </div>
          ) : recent.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border p-10 flex flex-col items-center gap-4 text-center">
              <div className="w-10 h-10 rounded-full bg-surface-sunken flex items-center justify-center">
                <Calculator className="h-5 w-5 text-text-3" />
              </div>
              <p className="text-sm text-text-3">{t("noCalculations")}</p>
              <Link
                href="/calculators"
                className="bg-accent text-accent-fg px-4 py-2 rounded-sm text-sm font-medium hover:bg-accent-strong transition-colors"
              >
                {t("goToCalculators")}
              </Link>
            </div>
          ) : (
            <div className="border border-border rounded-lg overflow-hidden bg-surface divide-y divide-hairline">
              {recent.map((calc) => (
                <div
                  key={calc.id}
                  className="flex items-center gap-4 px-4 py-3.5 hover:bg-surface-sunken transition-colors"
                >
                  <div className="w-9 h-9 rounded-full bg-accent-soft text-accent text-xs font-mono font-medium flex items-center justify-center shrink-0">
                    {calc.id?.slice(0, 2).toUpperCase() ?? "??"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-sm text-text font-medium">
                      {calc.id?.slice(0, 8)}…
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-text-3">
                        {calc.createdAt ? formatDate(calc.createdAt) : "—"}
                      </span>
                      {calc.currency && (
                        <span className="bg-surface-sunken text-text-2 text-[10px] font-mono px-1.5 py-0.5 rounded border border-border">
                          {calc.currency}
                        </span>
                      )}
                    </div>
                  </div>
                  <Link
                    href={`/calculations/${calc.id}`}
                    className="text-xs font-medium text-accent hover:underline underline-offset-4 shrink-0"
                  >
                    {t("open")}
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick start */}
        {(calcLoading || activeCalculators.length > 0) && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-text">Start a calculation</h2>
              <Link
                href="/calculators"
                className="text-xs text-accent hover:underline underline-offset-4"
              >
                View all
              </Link>
            </div>

            {calcLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 2 }).map((_, i) => (
                  <Skeleton key={i} className="h-17 w-full rounded-lg" />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {activeCalculators.map((calc) => (
                  <Link
                    key={calc.id}
                    href={`/calculators/${calc.id}`}
                    className="flex items-center gap-3 bg-surface border border-border rounded-lg p-4 hover:shadow-1 hover:border-accent/30 transition-all group"
                  >
                    <div className="w-9 h-9 flex items-center justify-center rounded-sm bg-accent-soft shrink-0">
                      <TrendingUp className="w-4 h-4 text-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text truncate">{calc.name}</p>
                      <p className="text-[10px] font-mono text-text-3 mt-0.5">{calc.code}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-text-3 group-hover:text-accent transition-colors shrink-0" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

