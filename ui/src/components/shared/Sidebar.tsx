"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { clsx } from "clsx";
import { LayoutDashboard, Calculator, FileText, ShieldCheck, Settings, LogOut } from "lucide-react";
import type { ElementType } from "react";
import { useAuthStore } from "@/lib/stores/auth.store";
import { useLogout } from "@/lib/hooks/useAuth";

function getInitials(user: {
  firstName?: string | null;
  lastName?: string | null;
  username?: string | null;
}): string {
  if (user.firstName && user.lastName) {
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  }
  if (user.firstName) {
    return user.firstName.slice(0, 2).toUpperCase();
  }
  return (user.username ?? "?").slice(0, 2).toUpperCase();
}

function NavItem({
  href,
  label,
  icon: Icon,
  pathname,
}: {
  href: string;
  label: string;
  icon: ElementType;
  pathname: string;
}) {
  const isActive = pathname.startsWith(href);
  return (
    <Link
      href={href}
      className={clsx(
        "flex items-center gap-2.5 px-3 py-2 rounded-sm text-sm transition-colors relative",
        isActive
          ? "bg-accent-soft-2 text-text font-medium before:absolute before:left-0 before:top-1 before:bottom-1 before:w-0.5 before:bg-accent before:rounded-r"
          : "text-text-2 hover:bg-surface-sunken",
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {label}
    </Link>
  );
}

export function Sidebar() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const { mutate: logout, isPending: isLoggingOut } = useLogout();

  const WORKSPACE_ITEMS: { href: string; label: string; icon: ElementType }[] = [
    { href: "/dashboard",    label: t("dashboard"),    icon: LayoutDashboard },
    { href: "/calculators",  label: t("calculators"),  icon: Calculator },
    { href: "/calculations", label: t("calculations"), icon: FileText },
  ];

  const ACCOUNT_ITEMS: { href: string; label: string; icon: ElementType }[] = [
    ...(user?.role === "ADMIN"
      ? [{ href: "/admin/calculators", label: t("admin"), icon: ShieldCheck }]
      : []),
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <aside className="w-62 shrink-0 border-r border-border bg-bg-tint flex flex-col min-h-screen">
      {/* Brand header */}
      <div className="p-4 border-b border-border flex items-center gap-2.5">
        <div className="w-5 h-5 flex items-center justify-center rounded bg-accent shrink-0">
          <span className="font-serif font-medium text-[13px] text-accent-fg leading-none">FL</span>
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-medium text-text leading-tight">Financial Calculator</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-4 overflow-y-auto">
        {/* Workspace section */}
        <div>
          <p className="uppercase text-text-3 text-[10px] tracking-[0.08em] font-medium px-3 mb-1">
            Workspace
          </p>
          <div className="space-y-0.5">
            {WORKSPACE_ITEMS.map((item) => (
              <NavItem key={item.href} {...item} pathname={pathname} />
            ))}
          </div>
        </div>

        {/* Account section */}
        <div>
          <p className="uppercase text-text-3 text-[10px] tracking-[0.08em] font-medium px-3 mb-1">
            Account
          </p>
          <div className="space-y-0.5">
            {ACCOUNT_ITEMS.map((item) => (
              <NavItem key={item.href} {...item} pathname={pathname} />
            ))}
          </div>
        </div>
      </nav>

      {/* Profile footer */}
      {user && (
        <div className="border-t border-border p-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-accent-soft text-accent text-xs font-medium flex items-center justify-center shrink-0">
            {getInitials(user)}
          </div>
          <div className="flex-1 flex flex-col min-w-0">
            <span className="text-sm font-medium text-text truncate">
              {user.firstName && user.lastName
                ? `${user.firstName} ${user.lastName}`
                : user.username}
            </span>
            {"email" in user && user.email && (
              <span className="text-xs text-text-3 truncate">{String(user.email)}</span>
            )}
          </div>
          <button
            onClick={() => logout()}
            disabled={isLoggingOut}
            aria-label={t("logout")}
            className="shrink-0 w-7 h-7 flex items-center justify-center rounded text-text-3 hover:text-text hover:bg-surface-sunken transition-colors disabled:opacity-50"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </aside>
  );
}

