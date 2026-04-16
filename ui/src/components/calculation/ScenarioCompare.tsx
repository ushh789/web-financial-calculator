"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils/format";
import { computeCashFlowMetrics } from "@/lib/utils/cashflow.utils";
import type { components } from "@/lib/types/api.types";
import type { CashFlow } from "./CashFlowTable";

type CalculationScenarioDto = components["schemas"]["CalculationScenarioDto"];

function parseCashFlows(result?: Record<string, unknown> | null): CashFlow[] {
  if (!result || !Array.isArray(result.cashFlows)) return [];
  return result.cashFlows as CashFlow[];
}

const COLORS = ["#3B8BD4", "#D85A30"] as const;

interface Props {
  scenarios: CalculationScenarioDto[];
  currency?: string;
}

export function ScenarioCompare({ scenarios, currency = "USD" }: Props) {
  const t = useTranslations("scenario");
  const tc = useTranslations("cashflow");

  const metrics = useMemo(
    () =>
      scenarios.map((s) => {
        const cf = computeCashFlowMetrics(parseCashFlows(s.scenarioResult as Record<string, unknown> | null));
        return {
          name: s.scenarioName ?? `${t("title")} ${s.id?.slice(0, 6)}`,
          input: s.scenarioInput,
          totalPayment: cf.totalPayments,
          totalInterest: cf.totalInterest,
          totalPrincipal: cf.totalPrincipal,
        };
      }),
    [scenarios, t],
  );

  const [m0, m1] = metrics;

  const hasResults = (m0?.totalPayment ?? 0) > 0 || (m1?.totalPayment ?? 0) > 0;

  const chartData = [
    {
      name: tc("principal"),
      ...(m0 && { [m0.name]: m0.totalPrincipal }),
      ...(m1 && { [m1.name]: m1.totalPrincipal }),
    },
    {
      name: tc("interest"),
      ...(m0 && { [m0.name]: m0.totalInterest }),
      ...(m1 && { [m1.name]: m1.totalInterest }),
    },
    {
      name: tc("totalPayments"),
      ...(m0 && { [m0.name]: m0.totalPayment }),
      ...(m1 && { [m1.name]: m1.totalPayment }),
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{t("compareTitle")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Input params */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          {metrics.map((m, i) => (
            <div key={i} className="space-y-1">
              <p className="font-medium" style={{ color: COLORS[i] }}>
                {m.name}
              </p>
              {m.input && (
                <ul className="space-y-0.5 text-muted-foreground">
                  <li>{tc("principal")}: {formatCurrency(m.input.amount, currency)}</li>
                  {m.input.rate != null && <li>{tc("interest")}: {m.input.rate}%</li>}
                  {m.input.term != null && <li>{tc("total")}: {m.input.term} міс.</li>}
                  {m.input.startDate && <li>{m.input.startDate}</li>}
                </ul>
              )}
            </div>
          ))}
        </div>

        {/* Totals + chart */}
        {hasResults && (
          <>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {metrics.map((m, i) => (
                <div key={i} className="space-y-0.5 text-muted-foreground">
                  <p className="font-medium" style={{ color: COLORS[i] }}>
                    {t("totals")}
                  </p>
                  <p>{tc("totalPayments")}: {formatCurrency(m.totalPayment, currency)}</p>
                  <p>{tc("totalInterest")}: {formatCurrency(m.totalInterest, currency)}</p>
                  <p>{tc("totalPrincipal")}: {formatCurrency(m.totalPrincipal, currency)}</p>
                </div>
              ))}
            </div>

            <ResponsiveContainer width="100%" height={240}>
              <BarChart
                data={chartData}
                margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis
                  tickFormatter={(v: number) => formatCurrency(v, currency)}
                  tick={{ fontSize: 11 }}
                  width={90}
                />
                <Tooltip
                  formatter={(value) => formatCurrency(value as number, currency)}
                />
                <Legend />
                {m0 && <Bar dataKey={m0.name} fill={COLORS[0]} />}
                {m1 && <Bar dataKey={m1.name} fill={COLORS[1]} />}
              </BarChart>
            </ResponsiveContainer>
          </>
        )}
      </CardContent>
    </Card>
  );
}
