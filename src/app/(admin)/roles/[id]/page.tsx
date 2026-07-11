import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { requirePermission } from "@/lib/rbac";
import { roleService } from "@/services/role.service";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTranslations } from "next-intl/server";

interface RoleDetailPageProps {
  params: Promise<{ id: string }>;
}

interface Permission {
  id: string;
  key: string;
  name: string;
  group: string;
}

async function getRole(id: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;

  try {
    await requirePermission(session.user.id, "roles.read");
  } catch {
    return null;
  }

  const role = await roleService.getById(id);
  if (!role) return null;

  return role;
}

function groupPermissions(
  permissions: Permission[],
): Record<string, Permission[]> {
  const grouped: Record<string, Permission[]> = {};
  for (const perm of permissions) {
    if (!grouped[perm.group]) {
      grouped[perm.group] = [];
    }
    grouped[perm.group].push(perm);
  }
  return grouped;
}

export default async function RoleDetailPage({ params }: RoleDetailPageProps) {
  const { id } = await params;
  const t = await getTranslations("role");
  const tNav = await getTranslations("nav");

  const role = await getRole(id);
  if (!role) {
    notFound();
  }

  const groupedPerms = groupPermissions(role.permissions);

  return (
    <div>
      <PageHeader
        title={role.name}
        breadcrumbs={[
          { label: tNav("dashboard"), href: "/dashboard" },
          { label: t("title"), href: "/admin/roles" },
          { label: role.name },
        ]}
      />
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t("title")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">{t("name")}:</span>
                <span className="ml-1 font-medium">{role.name}</span>
              </div>
              <div>
                <span className="text-muted-foreground">{t("system")}:</span>
                {role.isSystem ? (
                  <Badge variant="secondary" className="ml-1">
                    {t("system")}
                  </Badge>
                ) : (
                  <span className="text-muted-foreground ml-1 text-xs">No</span>
                )}
              </div>
            </div>
            {role.description && (
              <div className="text-sm">
                <span className="text-muted-foreground">
                  {t("description")}:
                </span>
                <p className="mt-1">{role.description}</p>
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t("permissions")}</CardTitle>
          </CardHeader>
          <CardContent>
            {role.permissions.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No permissions assigned
              </p>
            ) : (
              <div className="space-y-4">
                {Object.entries(groupedPerms).map(([group, perms]) => (
                  <div key={group}>
                    <h4 className="text-muted-foreground mb-2 text-xs font-medium capitalize">
                      {group}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {perms.map((perm) => (
                        <Badge key={perm.id} variant="outline">
                          {perm.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
