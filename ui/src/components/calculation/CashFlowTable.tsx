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
import { ArrowUp, ArrowDown, ChevronsUpDown, Download } from "lucide-react";
import { clsx } from "clsx";
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

const PAGE_SIZE = 20;
const coreRowModel = getCoreRowModel();
const sortedRowModel = getSortedRowModel();

export function CashFlowTable({ cashFlows, currency = "USD" }: Props) {
  "use no memo";
  const t = useTranslations("cashflow");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("ALL");
  const [page, setPage] = useState(0);

  const maxPrincipal = useMemo(
    () => Math.max(...cashFlows.map((cf) => cf.breakdown.principal.amount), 1),
    [cashFlows],
  );

  const filteredData = useMemo(() => {
    if (typeFilter === "ALL") return cashFlows;
    return cashFlows.filter((cf) => cf.type === typeFilter);
  }, [cashFlows, typeFilter]);

  const totalPages = Math.ceil(filteredData.length / PAGE_SIZE);
  const pageData = useMemo(
    () => filteredData.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE),
    [filteredData, page],
  );

  const totals = useMemo(() => {
    const rows = filteredData;
    return {
      principal: rows.reduce((s, cf) => s + cf.breakdown.principal.amount, 0),
      interest: rows.reduce((s, cf) => s + cf.breakdown.interest.amount, 0),
      total: rows.reduce((s, cf) => s + cf.totalAmount.amount, 0),
    };
  }, [filteredData]);

  const localizeDescription = (description: string) => {
    const normalized = description.trim().toLowerCase();
    if (normalized === "disbursement") return t("descriptions.disbursement");
    if (normalized === "monthly payment") return t("descriptions.monthlyPayment");
    return description;
  };

  const columns = useMemo<ColumnDef<CashFlow>[]>(
    () => [
      {
        accessorKey: "date",
        header: t("date"),
        cell: ({ getValue }) => (
          <span className="font-mono text-xs text-text-2">
            {formatDate(getValue<string>())}
          </span>
        ),
      },
      {
        accessorKey: "description",
        header: t("description"),
        cell: ({ getValue }) => (
          <span className="text-sm text-text-2">{localizeDescription(getValue<string>())}</span>
        ),
      },
      {
        accessorKey: "type",
        header: t("type"),
        cell: ({ getValue }) => {
          const type = getValue<string>();
          if (type === "INFLOW") {
            return (
              <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold bg-positive-soft text-positive border border-positive-line">
                {t("inflow")}
              </span>
            );
          }
          return (
            <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold bg-warn-soft text-warn border border-warn-line">
              {t("outflow")}
            </span>
          );
        },
      },
      {
        id: "principal",
        header: t("principal"),
        accessorFn: (row) => row.breakdown.principal.amount,
        cell: ({ row, getValue }) => {
          const val = getValue<number>();
          const pct = (val / maxPrincipal) * 100;
          return (
            <div className="relative">
              <div
                className="absolute inset-0 rounded bg-chart-principal/10"
                style={{ width: `${pct}%` }}
              />
              <span className="relative font-mono text-xs tabular-nums text-text">
                {formatCurrency(val, currency)}
              </span>
            </div>
          );
        },
      },
      {
        id: "interest",
        header: t("interest"),
        accessorFn: (row) => row.breakdown.interest.amount,
        cell: ({ getValue }) => (
          <span className="font-mono text-xs tabular-nums text-text">
            {formatCurrency(getValue<number>(), currency)}
          </span>
        ),
      },
      {
        id: "total",
        header: t("total"),
        accessorFn: (row) => row.totalAmount.amount,
        cell: ({ getValue }) => (
          <span className="font-mono text-xs font-medium tabular-nums text-text">
            {formatCurrency(getValue<number>(), currency)}
          </span>
        ),
      },
    ],
    [currency, t, maxPrincipal],
  );

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: pageData,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: coreRowModel,
    getSortedRowModel: sortedRowModel,
    manualPagination: true,
  });

  const exportToCsv = () => {
    const headers = [t("date"), t("description"), t("type"), t("principal"), t("interest"), t("total")];
    const rows = filteredData.map((cf) => [
      formatDate(cf.date),
      localizeDescription(cf.description),
      cf.type,
      cf.breakdown.principal.amount.toFixed(2),
      cf.breakdown.interest.amount.toFixed(2),
      cf.totalAmount.amount.toFixed(2),
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "cashflows.csv";
    link.click();
  };

  return (
    <div className="bg-surface rounded-lg border border-border shadow-1 overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border">
        <div className="flex items-center gap-1 bg-surface-sunken rounded-sm p-1">
          {(["ALL", "OUTFLOW", "INFLOW"] as const).map((type) => (
            <button
              key={type}
              onClick={() => { setTypeFilter(type); setPage(0); }}
              className={clsx(
                "px-3 py-1 rounded text-xs font-medium transition-colors",
                typeFilter === type
                  ? "bg-surface text-text shadow-1"
                  : "text-text-3 hover:text-text-2",
              )}
            >
              {type === "ALL" ? t("all") : type === "INFLOW" ? t("inflow") : t("outflow")}
            </button>
          ))}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={exportToCsv}
          className="h-8 gap-1.5 text-xs text-text-2 hover:text-text hover:bg-surface-sunken"
        >
          <Download className="w-3.5 h-3.5" />
          {t("exportCsv")}
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="bg-bg-tint border-b border-border">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="h-10 px-4 text-left text-[11px] font-medium uppercase tracking-[0.06em] text-text-3 cursor-pointer select-none whitespace-nowrap"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <span className="inline-flex items-center gap-1">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getCanSort() && (
                        <span className="text-text-4">
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
          <tbody className="divide-y divide-hairline">
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-8 text-center text-text-3 text-sm"
                >
                  {t("empty")}
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-surface-sunken transition-colors"
                  style={{ height: "var(--density-row)" }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-2">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
          {/* Totals row */}
          {filteredData.length > 0 && (
            <tfoot>
              <tr className="bg-surface-sunken border-t-2 border-border-strong">
                <td className="px-4 py-3 text-xs font-medium text-text-3 uppercase tracking-[0.06em]" colSpan={3}>
                  {t("total")}
                </td>
                <td className="px-4 py-3 font-mono text-xs font-medium tabular-nums text-text">
                  {formatCurrency(totals.principal, currency)}
                </td>
                <td className="px-4 py-3 font-mono text-xs font-medium tabular-nums text-text">
                  {formatCurrency(totals.interest, currency)}
                </td>
                <td className="px-4 py-3 font-mono text-xs font-medium tabular-nums text-text">
                  {formatCurrency(totals.total, currency)}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* Pagination footer */}
      {filteredData.length > 0 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-hairline">
          <p className="text-xs text-text-3">
            {t("showing", {
              shown: Math.min((page + 1) * PAGE_SIZE, filteredData.length),
              total: filteredData.length,
            })}
          </p>
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
                className="h-7 px-2 text-xs text-text-2 hover:bg-surface-sunken"
              >
                {t("prev")}
              </Button>
              <span className="text-xs text-text-3 px-2">
                {page + 1} / {totalPages}
              </span>
              <Button
                variant="ghost"
                size="sm"
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
                className="h-7 px-2 text-xs text-text-2 hover:bg-surface-sunken"
              >
                {t("next")}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
