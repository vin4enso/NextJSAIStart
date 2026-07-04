"use client";

import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

interface HeaderProps {
  title?: string;
  actions?: React.ReactNode;
}

export function Header({ title, actions }: HeaderProps) {
  const t = useTranslations();
  const pathname = usePathname();

  const defaultTitle = pathname
    ? t(`nav.${pathname.split("/").filter(Boolean)[0] ?? "dashboard"}`, {
        fallback: "Dashboard",
      })
    : "";

  return (
    <header className="flex h-14 items-center justify-between border-b px-4 lg:px-6">
      <h2 className="text-sm font-medium">{title ?? defaultTitle}</h2>
      <div className="flex items-center gap-2">{actions}</div>
    </header>
  );
}
