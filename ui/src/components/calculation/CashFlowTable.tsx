"use client";

import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { ArrowUp, ArrowDown, ChevronsUpDown } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { Button } from "@/components/ui/button";

export interface CashFlow {
  date: string;
  totalAmount: { amount: number; currencyCode: string };
  type: "INFLOW" | "OUTFLOW";
  description: string;
  breakdown: {
    principal: { amount: number; currencyCode: string };
    interest: { amount: number; currencyCode: string };
    fee: { amount: number; currencyCode: string };
  };
}

interface Props {
  cashFlows: CashFlow[];
  currency?: string;
}

type TypeFilter = "ALL" | "INFLOW" | "OUTFLOW";

export function CashFlowTable({ cashFlows, currency = "USD" }: Props) {
  "use no memo";
  const t = useTranslations("cashflow");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("ALL");

  const filteredData = useMemo(() => {
    if (typeFilter === "ALL") return cashFlows;
    return cashFlows.filter((cf) => cf.type === typeFilter);
  }, [cashFlows, typeFilter]);

  const columns = useMemo<ColumnDef<CashFlow>[]>(
    () => [
      {
        accessorKey: "date",
        header: t("date"),
        cell: ({ getValue }) => formatDate(getValue<string>()),
      },
      {
        accessorKey: "description",
        header: t("description"),
      },
      {
        accessorKey: "type",
        header: t("type"),
        cell: ({ getValue }) => {
          const type = getValue<string>();
          if (type === "INFLOW") {
            return (
              <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                {t("inflow")}
              </span>
            );
          }
          return (
            <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-rose-500/10 text-rose-700 dark:text-rose-400">
              {t("outflow")}
            </span>
          );
        },
      },
      {
        id: "principal",
        header: t("principal"),
        accessorFn: (row) => row.breakdown.principal.amount,
        cell: ({ getValue }) => formatCurrency(getValue<number>(), currency),
      },
      {
        id: "interest",
        header: t("interest"),
        accessorFn: (row) => row.breakdown.interest.amount,
        cell: ({ getValue }) => formatCurrency(getValue<number>(), currency),
      },
      {
        id: "total",
        header: t("total"),
        accessorFn: (row) => row.totalAmount.amount,
        cell: ({ getValue }) => (
          <span className="font-medium">
            {formatCurrency(getValue<number>(), currency)}
          </span>
        ),
      },
    ],
    [currency, t],
  );

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const exportToCsv = () => {
    const headers = [t("date"), t("description"), t("type"), t("principal"), t("interest"), t("total")];
    const rows = filteredData.map((cf) => [
      formatDate(cf.date),
      cf.description,
      cf.type,
      cf.breakdown.principal.amount.toFixed(2),
      cf.breakdown.interest.amount.toFixed(2),
      cf.totalAmount.amount.toFixed(2),
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "cashflows.csv";
    link.click();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex gap-2">
          {(["ALL", "INFLOW", "OUTFLOW"] as const).map((type) => (
            <Button
              key={type}
              variant={typeFilter === type ? "default" : "outline"}
              size="sm"
              onClick={() => setTypeFilter(type)}
            >
              {type === "ALL" ? t("all") : type === "INFLOW" ? t("inflow") : t("outflow")}
            </Button>
          ))}
        </div>
        <Button variant="outline" size="sm" onClick={exportToCsv}>
          {t("exportCsv")}
        </Button>
      </div>

      <div className="rounded-md border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b bg-muted/50">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="h-11 px-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground cursor-pointer select-none whitespace-nowrap"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <span className="inline-flex items-center gap-1">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getCanSort() && (
                        <span className="text-muted-foreground/50">
                          {header.column.getIsSorted() === "asc" ? (
                            <ArrowUp className="h-3 w-3" />
                          ) : header.column.getIsSorted() === "desc" ? (
                            <ArrowDown className="h-3 w-3" />
                          ) : (
                            <ChevronsUpDown className="h-3 w-3" />
                          )}
                        </span>
                      )}
                    </span>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  {t("empty")}
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b hover:bg-muted/30 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-muted-foreground">
        {t("showing", { shown: filteredData.length, total: cashFlows.length })}
      </p>
    </div>
  );
}
