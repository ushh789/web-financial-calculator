"use client";

import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import type { CashFlow } from "./CashFlowTable";

interface ChartDataPoint {
  date: string;
  principal: number;
  interest: number;
  balance: number;
}

interface Props {
  cashFlows: CashFlow[];
  initialAmount: number;
  currency?: string;
}

export function AmortizationChart({
  cashFlows,
  initialAmount,
  currency = "USD",
}: Props) {
  const t = useTranslations("cashflow");

  const chartData = useMemo<ChartDataPoint[]>(() => {
    const outflows = cashFlows.filter((cf) => cf.type === "OUTFLOW");
    return outflows.reduce<{ points: ChartDataPoint[]; balance: number }>(
      ({ points, balance }, cf) => {
        const newBalance = balance - cf.breakdown.principal.amount;
        return {
          balance: newBalance,
          points: [
            ...points,
            {
              date: formatDate(cf.date),
              principal: Number(cf.breakdown.principal.amount.toFixed(2)),
              interest: Number(cf.breakdown.interest.amount.toFixed(2)),
              balance: Number(Math.max(0, newBalance).toFixed(2)),
            },
          ],
        };
      },
      { points: [], balance: initialAmount },
    ).points;
  }, [cashFlows, initialAmount]);

  if (chartData.length === 0) {
    return (
      <div className="bg-[--surface] rounded-[--radius-lg] border border-[--border] py-12 text-center text-[--text-3] text-sm">
        {t("noChartData")}
      </div>
    );
  }

  return (
    <div className="bg-[--surface] rounded-[--radius-lg] border border-[--border] shadow-[--shadow-1] p-6">
      <p className="text-[11px] uppercase tracking-[0.08em] text-[--text-3] font-medium mb-4">
        {t("amortizationTitle")}
      </p>
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart
          data={chartData}
          margin={{ top: 10, right: 60, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="gradPrincipal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--chart-principal)" stopOpacity={0.3} />
              <stop offset="100%" stopColor="var(--chart-principal)" stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="gradInterest" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--chart-interest)" stopOpacity={0.3} />
              <stop offset="100%" stopColor="var(--chart-interest)" stopOpacity={0.05} />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--border)"
          />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: "var(--text-3)" }}
            interval="preserveStartEnd"
            axisLine={{ stroke: "var(--border)" }}
            tickLine={false}
          />
          <YAxis
            yAxisId="left"
            tickFormatter={(v: number) =>
              new Intl.NumberFormat("en-US", {
                notation: "compact",
                maximumFractionDigits: 0,
              }).format(v)
            }
            tick={{ fontSize: 11, fill: "var(--text-3)" }}
            width={70}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tickFormatter={(v: number) =>
              new Intl.NumberFormat("en-US", {
                notation: "compact",
                maximumFractionDigits: 0,
              }).format(v)
            }
            tick={{ fontSize: 11, fill: "var(--text-3)" }}
            width={70}
            axisLine={false}
            tickLine={false}
          />

          <Tooltip
            formatter={(value, name) => [
              typeof value === "number" ? formatCurrency(value, currency) : value,
              name === "principal"
                ? t("principal")
                : name === "interest"
                  ? t("interest")
                  : t("balance"),
            ]}
            labelFormatter={(label) => String(label)}
            contentStyle={{
              backgroundColor: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              boxShadow: "var(--shadow-2)",
              fontSize: "12px",
              color: "var(--text)",
            }}
          />

          <Legend
            formatter={(value: string) =>
              value === "principal"
                ? t("principal")
                : value === "interest"
                  ? t("interest")
                  : t("balance")
            }
            wrapperStyle={{ fontSize: "12px", color: "var(--text-2)" }}
          />

          <Area
            yAxisId="left"
            type="monotone"
            dataKey="principal"
            stroke="var(--chart-principal)"
            fill="url(#gradPrincipal)"
            strokeWidth={2}
          />
          <Area
            yAxisId="left"
            type="monotone"
            dataKey="interest"
            stroke="var(--chart-interest)"
            fill="url(#gradInterest)"
            strokeWidth={2}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="balance"
            stroke="var(--chart-balance)"
            strokeWidth={2}
            strokeDasharray="4 2"
            dot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
