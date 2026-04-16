"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { clsx } from "clsx";
import { LayoutDashboard, Calculator, FileText, ShieldCheck, TrendingUp } from "lucide-react";
import type { ElementType } from "react";
import { useAuthStore } from "@/lib/stores/auth.store";

export function Sidebar() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);

  const NAV_ITEMS: { href: string; label: string; icon: ElementType }[] = [
    { href: "/dashboard",    label: t("dashboard"),    icon: LayoutDashboard },
    { href: "/calculators",  label: t("calculators"),  icon: Calculator },
    { href: "/calculations", label: t("calculations"), icon: FileText },
    ...(user?.role === "ADMIN"
      ? [{ href: "/admin/calculators", label: t("admin"), icon: ShieldCheck }]
      : []),
  ];

  return (
    <aside className="w-60 shrink-0 border-r bg-sidebar flex flex-col min-h-screen">
      <div className="p-5 border-b flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary shrink-0">
          <TrendingUp className="h-4 w-4 text-sidebar-primary-foreground" />
        </div>
        <span className="font-semibold text-base text-sidebar-foreground tracking-tight">
          Фін. Калькулятор
        </span>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={clsx(
              "flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors",
              pathname.startsWith(href)
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
