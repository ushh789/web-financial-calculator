"use client";

import { useTransition } from "react";
import { useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { setLocale } from "@/lib/actions/locale";

export function LocaleSwitcher() {
  const locale = useLocale();
  const [isPending, startTransition] = useTransition();

  const next = locale === "uk" ? "en" : "uk";

  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={isPending}
      onClick={() => startTransition(() => setLocale(next))}
    >
      {locale === "uk" ? "EN" : "UA"}
    </Button>
  );
}
