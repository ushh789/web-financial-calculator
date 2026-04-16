"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useCalculators } from "@/lib/hooks/useCalculators";
import { CreateCalculatorForm } from "./CreateCalculatorForm";
import { AddVersionForm } from "./AddVersionForm";

export function AdminCalculatorsView() {
  const t = useTranslations("admin");
  const { data, isLoading } = useCalculators(0, 100);
  const calculators = data?.content ?? [];

  const [createOpen, setCreateOpen] = useState(false);
  const [versionDialogId, setVersionDialogId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="page-title">{t("title")}</h1>
        <Sheet open={createOpen} onOpenChange={setCreateOpen}>
          <SheetTrigger render={<Button />}>
            {t("createCalculator")}
          </SheetTrigger>
          <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
            <SheetHeader className="mb-6">
              <SheetTitle>{t("createCalculator")}</SheetTitle>
            </SheetHeader>
            <CreateCalculatorForm onSuccess={() => setCreateOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>

      {calculators.length === 0 ? (
        <p className="text-muted-foreground">{t("empty")}</p>
      ) : (
        <div className="rounded-md border overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="h-11 px-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t("cols.code")}
                </th>
                <th className="h-11 px-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t("cols.name")}
                </th>
                <th className="h-11 px-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t("cols.status")}
                </th>
                <th className="h-11 px-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t("cols.actions")}
                </th>
              </tr>
            </thead>
            <tbody>
              {calculators.map((calc) => (
                <tr key={calc.id} className="border-b hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs">{calc.code}</td>
                  <td className="px-4 py-3">{calc.name}</td>
                  <td className="px-4 py-3">
                    <Badge variant={calc.active ? "default" : "secondary"}>
                      {calc.active ? t("active") : t("inactive")}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Dialog
                      open={versionDialogId === calc.id}
                      onOpenChange={(open) =>
                        setVersionDialogId(open ? (calc.id ?? null) : null)
                      }
                    >
                      <DialogTrigger render={<Button variant="outline" size="sm" />}>
                        {t("addVersion")}
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>
                            {t("addVersionFor", { name: calc.name ?? "" })}
                          </DialogTitle>
                        </DialogHeader>
                        {calc.id && (
                          <AddVersionForm
                            calculatorId={calc.id}
                            onSuccess={() => setVersionDialogId(null)}
                          />
                        )}
                      </DialogContent>
                    </Dialog>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
