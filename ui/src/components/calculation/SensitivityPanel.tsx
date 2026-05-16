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
import { clsx } from "clsx";
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

  const probePoint = series.find((s) => Math.abs(s.x - sliderValue) < cfg.step * 0.6) ?? series[Math.floor(series.length / 2)];

  const formatAxisValue = (v: number) =>
    axis === "amount"
      ? formatCurrency(v, currency)
      : axis === "rate"
        ? `${v.toFixed(1)}%`
        : `${Math.round(v)} ${t("months")}`;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div data-testid="sensitivity-panel" className="space-y-5">
      {/* Axis selector */}
      <div className="flex items-center gap-1 bg-surface-sunken rounded-sm p-1 w-fit">
        {AXES.map((a) => (
          <button
            key={a}
            data-testid={`sensitivity-axis-${a}`}
            onClick={() => setAxis(a)}
            className={clsx(
              "px-3 py-1.5 rounded text-xs font-medium transition-colors",
              axis === a
                ? "bg-surface text-text shadow-1"
                : "text-text-3 hover:text-text-2",
            )}
          >
            {t(`axis.${a}`)}
          </button>
        ))}
      </div>

      {/* Slider */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-text-3">{t(`axis.${axis}`)}</span>
          <span className="font-medium text-text">{formatAxisValue(sliderValue)}</span>
        </div>
        <Slider
          min={cfg.min}
          max={cfg.max}
          step={cfg.step}
          value={[sliderValue]}
          onValueChange={(values) => setSliderValue((values as number[])[0] ?? sliderValue)}
          className="accent-accent"
        />
        <div className="flex justify-between text-xs text-text-3">
          <span>{formatAxisValue(cfg.min)}</span>
          <span>{formatAxisValue(cfg.max)}</span>
        </div>
      </div>

      {/* Probe summary */}
      {probePoint && (
        <div className="bg-surface-sunken rounded-lg p-3 flex items-center gap-6">
          <div>
            <p className="text-[11px] uppercase tracking-[0.06em] text-text-3 font-medium mb-0.5">
              {t("totalPayment")}
            </p>
            <p className="font-mono text-sm font-medium text-text tabular-nums">
              {formatCurrency(probePoint.totalPayment, currency)}
            </p>
          </div>
          <div className="w-px h-8 bg-border" />
          <div>
            <p className="text-[11px] uppercase tracking-[0.06em] text-text-3 font-medium mb-0.5">
              {t("totalInterest")}
            </p>
            <p className="font-mono text-sm font-medium text-warn tabular-nums">
              {formatCurrency(probePoint.totalInterest, currency)}
            </p>
          </div>
        </div>
      )}

      {/* Chart */}
      <div data-testid="sensitivity-chart">
      <ResponsiveContainer width="100%" height={280}>
        <LineChart
          data={series}
          margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis
            dataKey="x"
            tickFormatter={(v: number) =>
              axis === "amount"
                ? new Intl.NumberFormat("en-US", { notation: "compact" }).format(v)
                : axis === "rate"
                  ? `${v.toFixed(1)}%`
                  : `${Math.round(v)}`
            }
            tick={{ fontSize: 11, fill: "var(--text-3)" }}
            axisLine={{ stroke: "var(--border)" }}
            tickLine={false}
          />
          <YAxis
            tickFormatter={(v: number) =>
              new Intl.NumberFormat("en-US", { notation: "compact" }).format(v)
            }
            tick={{ fontSize: 11, fill: "var(--text-3)" }}
            width={70}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            formatter={(value, name) => [
              formatCurrency(value as number, currency),
              name,
            ]}
            labelFormatter={(label) => formatAxisValue(label as number)}
            contentStyle={{
              backgroundColor: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              boxShadow: "var(--shadow-2)",
              fontSize: "12px",
              color: "var(--text)",
            }}
          />
          <Legend wrapperStyle={{ fontSize: "12px", color: "var(--text-2)" }} />
          <ReferenceLine
            x={cfg.base}
            stroke="var(--text-4)"
            strokeDasharray="4 2"
            label={{ value: t("current"), fontSize: 11, fill: "var(--text-3)" }}
          />
          <Line
            type="monotone"
            dataKey="totalPayment"
            name={t("totalPayment")}
            stroke="var(--chart-principal)"
            dot={false}
            strokeWidth={2}
          />
          <Line
            type="monotone"
            dataKey="totalInterest"
            name={t("totalInterest")}
            stroke="var(--chart-interest)"
            dot={false}
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
      </div>

      <p className="text-xs text-text-3 italic">{t("disclaimer")}</p>
    </div>
  );
}

