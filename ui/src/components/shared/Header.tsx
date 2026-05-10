"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { calculatorsApi } from "@/lib/api/calculators";
import { LocaleSwitcher } from "./LocaleSwitcher";

function ThemeToggle() {
  const tCommon = useTranslations("common");
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={tCommon("toggleTheme")}
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      {mounted ? (
        theme === "dark" ? (
          <Sun className="h-4 w-4" />
        ) : (
          <Moon className="h-4 w-4" />
        )
      ) : (
        <span className="h-4 w-4 block" />
      )}
    </Button>
  );
}

function Breadcrumb() {
  const tNav = useTranslations("nav");
  const tCommon = useTranslations("common");
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const [calculatorName, setCalculatorName] = useState<string | null>(null);

  useEffect(() => {
    const isCalculatorDetailsPage = segments.length === 2 && segments[0] === "calculators";
    if (!isCalculatorDetailsPage) {
      setCalculatorName(null);
      return;
    }

    const calculatorId = segments[1];
    if (!calculatorId) return;

    let isActive = true;
    calculatorsApi
      .getById(calculatorId)
      .then((calculator) => {
        if (isActive) setCalculatorName(calculator.name ?? null);
      })
      .catch(() => {
        if (isActive) setCalculatorName(null);
      });

    return () => {
      isActive = false;
    };
  }, [pathname]);

  const crumbs = segments.map((seg, idx) => {
    if (segments[0] === "calculators" && idx === 1 && calculatorName) {
      return calculatorName;
    }
    if (seg === "dashboard") return tNav("dashboard");
    if (seg === "calculators") return tNav("calculators");
    if (seg === "calculations") return tNav("calculations");
    if (seg === "admin") return tNav("admin");
    return seg;
  });

  const label = crumbs.join(" > ") || tCommon("home");

  return (
    <nav aria-label={tCommon("breadcrumb")}>
      <span className="text-sm text-text-2">{label}</span>
    </nav>
  );
}

export function Header() {
  return (
    <header className="h-14 bg-bg/80 backdrop-blur-sm border-b border-border flex items-center justify-between px-6 gap-4">
      <div className="flex-1 min-w-0">
        <Breadcrumb />
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <ThemeToggle />
        <LocaleSwitcher />
      </div>
    </header>
  );
}
