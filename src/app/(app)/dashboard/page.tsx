import { PageHeader } from "@/components/page-header";
import type { PageMeta } from "@/types";

export const pageMeta: PageMeta = {
  title: "Dashboard",
  breadcrumbs: [{ label: "Dashboard" }],
};

export default function DashboardPage() {
  return (
    <div>
      <PageHeader title="Dashboard" description="Welcome to your dashboard" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border p-4">
          <p className="text-muted-foreground text-sm">Total Users</p>
          <p className="mt-1 text-2xl font-semibold">—</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-muted-foreground text-sm">Total Roles</p>
          <p className="mt-1 text-2xl font-semibold">—</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-muted-foreground text-sm">Permissions</p>
          <p className="mt-1 text-2xl font-semibold">—</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-muted-foreground text-sm">Active Users</p>
          <p className="mt-1 text-2xl font-semibold">—</p>
        </div>
      </div>
    </div>
  );
}
