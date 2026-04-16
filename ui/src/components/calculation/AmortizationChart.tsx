"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useMemo } from "react";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

const CHART_COLORS = {
  light: { principal: "#4F6EF5", interest: "#E87040", balance: "#2AB58A" },
  dark:  { principal: "#7E9EFF", interest: "#F59560", balance: "#4FD5A5" },
} as const;

export function AmortizationChart({
  cashFlows,
  initialAmount,
  currency = "USD",
}: Props) {
  const { resolvedTheme } = useTheme();
  const t = useTranslations("cashflow");

  const colors = resolvedTheme === "dark" ? CHART_COLORS.dark : CHART_COLORS.light;

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
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground text-sm">
          {t("noChartData")}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("amortizationTitle")}</CardTitle>
      </CardHeader>
      <CardContent className="pb-6">
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorPrincipal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors.principal} stopOpacity={0.25} />
                <stop offset="95%" stopColor={colors.principal} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorInterest" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors.interest} stopOpacity={0.25} />
                <stop offset="95%" stopColor={colors.interest} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11 }}
              interval="preserveStartEnd"
            />
            <YAxis
              tickFormatter={(v: number) => formatCurrency(v, currency)}
              tick={{ fontSize: 11 }}
              width={90}
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
              labelFormatter={(label) => label}
              contentStyle={{
                backgroundColor: resolvedTheme === "dark" ? "#1c1c1c" : "#fff",
                borderColor: resolvedTheme === "dark" ? "rgba(255,255,255,0.1)" : "#e5e7eb",
                borderRadius: "0.5rem",
                fontSize: "0.75rem",
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
            />
            <Area
              type="monotone"
              dataKey="principal"
              stroke={colors.principal}
              fill="url(#colorPrincipal)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="interest"
              stroke={colors.interest}
              fill="url(#colorInterest)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="balance"
              stroke={colors.balance}
              fill="none"
              strokeWidth={2}
              strokeDasharray="5 5"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
