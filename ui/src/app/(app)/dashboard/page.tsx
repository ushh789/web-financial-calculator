"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Calculator } from "lucide-react";
import { useAuthStore } from "@/lib/stores/auth.store";
import { useUserCalculations } from "@/lib/hooks/useScenarios";
import { Skeleton } from "@/components/ui/skeleton";
import { buttonVariants } from "@/components/ui/button";
import { formatDate } from "@/lib/utils/format";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const t = useTranslations("dashboard");
  const user = useAuthStore((s) => s.user);
  const userId = user?.id ?? "";

  const { data, isLoading } = useUserCalculations(userId, 0, 5);
  const recent = data?.content ?? [];

  return (
    <div className="space-y-6">
      <div className="rounded-lg bg-primary/5 border border-primary/10 px-4 py-3">
        <h1 className="page-title">{t("title")}</h1>
        {user && (
          <p className="text-muted-foreground mt-0.5">
            {t("greeting", { name: user.firstName ?? user.username ?? "" })}
          </p>
        )}
      </div>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-medium">{t("recent")}</h2>
          <Link
            href="/calculations"
            className="text-sm text-primary underline-offset-4 hover:underline"
          >
            {t("allCalculations")}
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-lg" />
            ))}
          </div>
        ) : recent.length === 0 ? (
          <div className="rounded-xl border border-dashed p-8 text-center flex flex-col items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
              <Calculator className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-sm">{t("noCalculations")}</p>
            <Link href="/calculators" className={cn(buttonVariants({ size: "sm" }))}>
              {t("goToCalculators")}
            </Link>
          </div>
        ) : (
          <div className="rounded-xl border overflow-hidden">
            {recent.map((calc) => (
              <div
                key={calc.id}
                className="flex items-center justify-between px-4 py-3 border-b last:border-0 hover:bg-muted/30 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium font-mono">
                    {calc.id?.slice(0, 8)}…
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {calc.createdAt ? formatDate(calc.createdAt) : "—"} ·{" "}
                    {calc.currency ?? "USD"}
                  </p>
                </div>
                <Link
                  href={`/calculations/${calc.id}`}
                  className={cn(buttonVariants({ size: "sm", variant: "outline" }))}
                >
                  {t("open")}
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
