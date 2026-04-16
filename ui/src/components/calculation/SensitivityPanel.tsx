"use client";

import { useState, useEffect, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils/format";
import {
  buildSensitivitySeries,
  type SensitivityAxis,
} from "@/lib/utils/sensitivity.utils";
import type { components } from "@/lib/types/api.types";

type ProductConstraintsDto = components["schemas"]["ProductConstraintsDto"];

interface Props {
  baseAmount: number;
  baseRate: number;
  baseTerm: number;
  constraints?: ProductConstraintsDto | null;
  currency: string;
  isLoading?: boolean;
}

const AXES: SensitivityAxis[] = ["rate", "term", "amount"];

export function SensitivityPanel({
  baseAmount,
  baseRate,
  baseTerm,
  constraints,
  currency,
  isLoading,
}: Props) {
  const t = useTranslations("sensitivity");
  const { resolvedTheme } = useTheme();
  const chartColors = resolvedTheme === "dark"
    ? { payment: "#7E9EFF", interest: "#F59560" }
    : { payment: "#4F6EF5", interest: "#E87040" };

  const [axis, setAxis] = useState<SensitivityAxis>("rate");

  const axisConfig = useMemo(() => {
    return {
      rate: {
        min: constraints?.minRate ?? Math.max(0.1, baseRate * 0.5),
        max: constraints?.maxRate ?? baseRate * 2,
        base: baseRate,
        step: 0.1,
      },
      term: {
        min: constraints?.minTerm ?? Math.max(1, Math.round(baseTerm * 0.5)),
        max: constraints?.maxTerm ?? Math.round(baseTerm * 2),
        base: baseTerm,
        step: 1,
      },
      amount: {
        min: constraints?.minAmount ?? Math.round(baseAmount * 0.5),
        max: constraints?.maxAmount ?? Math.round(baseAmount * 2),
        base: baseAmount,
        step: 100,
      },
    };
  }, [constraints, baseAmount, baseRate, baseTerm]);

  const [sliderValue, setSliderValue] = useState<number>(axisConfig[axis].base);

  useEffect(() => {
    setSliderValue(axisConfig[axis].base);
  }, [axis, axisConfig]);

  const series = useMemo(() => {
    const cfg = axisConfig[axis];
    return buildSensitivitySeries(
      axis === "amount" ? sliderValue : baseAmount,
      axis === "rate" ? sliderValue : baseRate,
      axis === "term" ? sliderValue : baseTerm,
      axis,
      cfg.min,
      cfg.max,
    );
  }, [axis, sliderValue, baseAmount, baseRate, baseTerm, axisConfig]);

  const cfg = axisConfig[axis];

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Axis selector */}
      <div className="flex gap-2 flex-wrap">
        {AXES.map((a) => (
          <Button
            key={a}
            variant={axis === a ? "default" : "outline"}
            size="sm"
            onClick={() => setAxis(a)}
          >
            {t(`axis.${a}`)}
          </Button>
        ))}
      </div>

      {/* Slider */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{t(`axis.${axis}`)}</span>
          <span className="font-medium text-foreground">
            {axis === "amount"
              ? formatCurrency(sliderValue, currency)
              : axis === "rate"
                ? `${sliderValue.toFixed(1)}%`
                : `${Math.round(sliderValue)} ${t("months")}`}
          </span>
        </div>
        <Slider
          min={cfg.min}
          max={cfg.max}
          step={cfg.step}
          value={[sliderValue]}
          onValueChange={(values) => setSliderValue((values as number[])[0] ?? sliderValue)}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>
            {axis === "amount"
              ? formatCurrency(cfg.min, currency)
              : axis === "rate"
                ? `${cfg.min}%`
                : `${cfg.min} ${t("months")}`}
          </span>
          <span>
            {axis === "amount"
              ? formatCurrency(cfg.max, currency)
              : axis === "rate"
                ? `${cfg.max}%`
                : `${cfg.max} ${t("months")}`}
          </span>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={280}>
        <LineChart
          data={series}
          margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis
            dataKey="x"
            tickFormatter={(v: number) =>
              axis === "amount"
                ? formatCurrency(v, currency)
                : axis === "rate"
                  ? `${v.toFixed(1)}%`
                  : `${Math.round(v)}`
            }
            tick={{ fontSize: 11 }}
          />
          <YAxis
            tickFormatter={(v: number) => formatCurrency(v, currency)}
            tick={{ fontSize: 11 }}
            width={90}
          />
          <Tooltip
            formatter={(value, name) => [
              formatCurrency(value as number, currency),
              name,
            ]}
            labelFormatter={(label) => {
              const n = label as number;
              return axis === "amount"
                ? formatCurrency(n, currency)
                : axis === "rate"
                  ? `${n.toFixed(1)}%`
                  : `${Math.round(n)} ${t("months")}`;
            }}
          />
          <Legend />
          <ReferenceLine
            x={cfg.base}
            stroke="hsl(var(--muted-foreground))"
            strokeDasharray="4 2"
            label={{ value: t("current"), fontSize: 11 }}
          />
          <Line
            type="monotone"
            dataKey="totalPayment"
            name={t("totalPayment")}
            stroke={chartColors.payment}
            dot={false}
            strokeWidth={2}
          />
          <Line
            type="monotone"
            dataKey="totalInterest"
            name={t("totalInterest")}
            stroke={chartColors.interest}
            dot={false}
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>

      <p className="text-xs text-muted-foreground">{t("disclaimer")}</p>
    </div>
  );
}
