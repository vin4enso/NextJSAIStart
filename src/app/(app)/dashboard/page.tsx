import { PageHeader } from "@/components/page-header";
import type { PageMeta } from "@/types";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { users, roles, permissions } from "@/drizzle/schema";
import { count, eq, isNull } from "drizzle-orm";
import { hasPermission } from "@/lib/rbac";
import { getTranslations } from "next-intl/server";
import { Card } from "@/components/ui/card";
import { Users, UserCheck, Shield, Key } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export const pageMeta: PageMeta = {
  title: "Dashboard",
  breadcrumbs: [{ label: "Dashboard" }],
};

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const t = await getTranslations("dashboard");
  const tNav = await getTranslations("nav");

  const [totalUsers] = db
    .select({ count: count() })
    .from(users)
    .where(isNull(users.deletedAt))
    .all();

  const [activeUsers] = db
    .select({ count: count() })
    .from(users)
    .where(eq(users.isActive, true))
    .all();

  const [totalRoles] = db.select({ count: count() }).from(roles).all();

  const [totalPermissions] = db
    .select({ count: count() })
    .from(permissions)
    .all();

  const canAccessAdmin = await hasPermission(session.user.id, "admin.access");

  const stats = [
    {
      label: t("totalUsers"),
      value: totalUsers.count,
      icon: Users,
    },
    {
      label: t("activeUsers"),
      value: activeUsers.count,
      icon: UserCheck,
    },
    {
      label: t("totalRoles"),
      value: totalRoles.count,
      icon: Shield,
    },
    {
      label: t("totalPermissions"),
      value: totalPermissions.count,
      icon: Key,
    },
  ];

  const quickLinks = canAccessAdmin
    ? [
        {
          label: tNav("users"),
          href: "/admin/users",
          icon: Users,
        },
        {
          label: tNav("roles"),
          href: "/admin/roles",
          icon: Shield,
        },
        {
          label: tNav("permissions"),
          href: "/admin/permissions",
          icon: Key,
        },
      ]
    : [];

  return (
    <div>
      <PageHeader
        title={t("title")}
        description={t("description", { name: session.user.name })}
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-muted flex size-10 items-center justify-center rounded-lg">
                <stat.icon className="text-muted-foreground size-5" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">{stat.label}</p>
                <p className="text-2xl font-semibold">{stat.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
      {quickLinks.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-3 text-sm font-medium">{t("quickLinks")}</h2>
          <div className="flex flex-wrap gap-3">
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="border-border bg-card hover:bg-muted flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors"
              >
                <link.icon className="size-4" />
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
