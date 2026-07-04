import { PageHeader } from "@/components/page-header";
import type { PageMeta } from "@/types";

export const pageMeta: PageMeta = {
  title: "Profile",
  breadcrumbs: [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Profile" },
  ],
};

export default function ProfilePage() {
  return (
    <div>
      <PageHeader
        title="Profile"
        description="Manage your personal information"
      />
      <p className="text-muted-foreground text-sm">
        Profile editing will be implemented in a future update.
      </p>
    </div>
  );
}
