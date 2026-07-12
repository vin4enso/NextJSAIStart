import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  permissions,
  rolePermissions,
  userRoles,
  roles,
} from "@/drizzle/schema";
import { and, eq } from "drizzle-orm";
import { Sidebar } from "@/components/sidebar";

async function checkAdminAccess() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect("/login");
  }

  const userId = session.user.id;

  const hasAccess = await db
    .select({ id: permissions.id })
    .from(permissions)
    .innerJoin(
      rolePermissions,
      eq(rolePermissions.permissionId, permissions.id),
    )
    .innerJoin(userRoles, eq(userRoles.roleId, rolePermissions.roleId))
    .where(
      and(eq(userRoles.userId, userId), eq(permissions.key, "admin.access")),
    )
    .limit(1);

  const isSystem = await db
    .select({ id: userRoles.roleId })
    .from(userRoles)
    .innerJoin(roles, eq(roles.id, userRoles.roleId))
    .where(and(eq(userRoles.userId, userId), eq(roles.isSystem, true)))
    .limit(1);

  if (hasAccess.length === 0 && isSystem.length === 0) {
    redirect("/403");
  }
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await checkAdminAccess();

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
