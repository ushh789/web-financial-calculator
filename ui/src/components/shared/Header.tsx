"use client";

import { useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Sun, Moon, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LocaleSwitcher } from "./LocaleSwitcher";

function ThemeToggle() {
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
      aria-label="Toggle theme"
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
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const crumbs = segments.map((seg) => seg.charAt(0).toUpperCase() + seg.slice(1));
  const label = crumbs.join(" › ") || "Home";

  return (
    <nav aria-label="Breadcrumb">
      <span className="text-sm text-text-2">{label}</span>
    </nav>
  );
}

export function Header() {
  return (
    <header className="h-14 bg-bg/80 backdrop-blur-sm border-b border-border flex items-center justify-between px-6 gap-4">
      {/* Left: Breadcrumb */}
      <div className="flex-1 min-w-0">
        <Breadcrumb />
      </div>

      {/* Center: Search pill */}
      <div className="shrink-0">
        <div className="bg-surface-sunken rounded-full px-3 h-8 flex items-center gap-2 text-sm text-text-3 min-w-50">
          <Search className="h-3.5 w-3.5 shrink-0" />
          <span className="flex-1">Search...</span>
          <kbd className="ml-auto text-[10px] bg-surface border border-border rounded px-1.5 py-0.5 text-text-3">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 shrink-0">
        <ThemeToggle />
        <LocaleSwitcher />
      </div>
    </header>
  );
}

