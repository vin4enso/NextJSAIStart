import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { roles, userRoles } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { requirePermission } from "@/lib/rbac";
import { userService } from "@/services/user.service";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getTranslations } from "next-intl/server";

interface UserDetailPageProps {
  params: Promise<{ id: string }>;
}

async function getUser(id: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;

  try {
    await requirePermission(session.user.id, "users.read");
  } catch {
    return null;
  }

  const user = await userService.getById(id);
  if (!user) return null;

  const userRolesData = db
    .select({
      roleId: roles.id,
      roleName: roles.name,
    })
    .from(userRoles)
    .innerJoin(roles, eq(roles.id, userRoles.roleId))
    .where(eq(userRoles.userId, id))
    .all();

  return {
    ...user,
    roles: userRolesData.map((r) => ({ id: r.roleId, name: r.roleName })),
  };
}

export default async function UserDetailPage({ params }: UserDetailPageProps) {
  const { id } = await params;
  const t = await getTranslations("user");
  const tNav = await getTranslations("nav");

  const user = await getUser(id);
  if (!user) {
    notFound();
  }

  const initials = user.name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div>
      <PageHeader
        title={user.name}
        description={t("details")}
        breadcrumbs={[
          { label: tNav("dashboard"), href: "/dashboard" },
          { label: t("title"), href: "/users" },
          { label: user.name },
        ]}
      />
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("details")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar size="lg">
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{user.name}</p>
                <p className="text-muted-foreground text-sm">{user.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">{t("status")}:</span>
                <Badge
                  variant={user.isActive ? "default" : "secondary"}
                  className="ml-2"
                >
                  {user.isActive ? t("active") : t("inactive")}
                </Badge>
              </div>
              <div>
                <span className="text-muted-foreground">
                  {t("memberSince")}:
                </span>
                <span className="ml-1">
                  {new Date(user.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t("roles")}</CardTitle>
          </CardHeader>
          <CardContent>
            {user.roles.length === 0 ? (
              <p className="text-muted-foreground text-sm">{t("noRoles")}</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {user.roles.map((role: { id: string; name: string }) => (
                  <Badge key={role.id} variant="secondary">
                    {role.name}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
