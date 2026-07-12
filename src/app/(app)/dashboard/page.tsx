import { PageHeader } from "@/components/page-header";
import type { PageMeta } from "@/types";
import { getTranslations } from "next-intl/server";
import { LayoutDashboard } from "lucide-react";
import Link from "next/link";

export const pageMeta: PageMeta = {
  title: "Dashboard",
  breadcrumbs: [{ label: "Dashboard" }],
};

export default async function DashboardPage() {
  const t = await getTranslations("dashboard");

  return (
    <div>
      <PageHeader
        title={t("title")}
        description="Quick access to your workspace"
      />
      <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
        <LayoutDashboard className="text-muted-foreground size-16" />
        <p className="text-muted-foreground max-w-md text-sm">
          The dashboard has been moved to the admin section.
        </p>
        <Link
          href="/admin"
          className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
        >
          <LayoutDashboard className="size-4" />
          Go to Admin Dashboard
        </Link>
      </div>
    </div>
  );
}
