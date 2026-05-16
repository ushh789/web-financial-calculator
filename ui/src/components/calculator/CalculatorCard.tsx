import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { TrendingUp, ArrowRight } from "lucide-react";
import type { components } from "@/lib/types/api.types";

type CalculatorDto = components["schemas"]["CalculatorDto"];

interface CalculatorCardProps {
  calculator: CalculatorDto;
}

export async function CalculatorCard({ calculator }: CalculatorCardProps) {
  const t = await getTranslations("calculator");

  return (
    <div
      className={`group relative flex flex-col min-w-[290px] rounded-lg border border-border bg-surface shadow-1 p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-(--shadow-2) ${
        !calculator.active ? "opacity-60" : ""
      }`}
    >
      {/* Icon + status */}
      <div className="flex items-start justify-between gap-2 mb-4">
        <div className="w-16 h-16 flex items-center justify-center rounded-lg bg-accent-soft shrink-0">
          <TrendingUp className="w-7 h-7 text-accent" />
        </div>
        {calculator.active && (
          <span className="text-[10px] uppercase tracking-[0.06em] font-semibold text-positive bg-positive-soft border border-positive-line rounded-full px-2 py-0.5">
            {t("active")}
          </span>
        )}
      </div>

      {/* Name & code */}
      <div className="flex-1">
        <h3 className="text-base font-semibold text-text leading-tight">
          {calculator.name}
        </h3>
        {calculator.description && (
          <p className="text-sm text-text-2 mt-1 line-clamp-2">
            {calculator.description}
          </p>
        )}
        <p className="text-xs text-text-2 font-mono mt-2">{calculator.code}</p>
      </div>

      {/* Arrow link */}
      {calculator.active ? (
        <Link
          href={`/calculators/${calculator.id}`}
          className="absolute bottom-4 right-4 w-7 h-7 flex items-center justify-center rounded-full bg-accent-soft text-accent opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label={t("open")}
        >
          <ArrowRight className="w-4 h-4" />
        </Link>
      ) : (
        <div className="mt-3 text-xs text-text-2">{t("inactive")}</div>
      )}
    </div>
  );
}

