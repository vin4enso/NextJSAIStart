"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { permissionApi } from "@/api/permission.api";

interface PermissionItem {
  id: string;
  key: string;
  name: string;
  group: string;
  createdAt: string;
}

export default function PermissionsPage() {
  const t = useTranslations("permission");
  const tNav = useTranslations("nav");
  const [, startTransition] = useTransition();
  const [groups, setGroups] = useState<Record<string, PermissionItem[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const fetchedRef = useRef(false);

  const fetchPermissions = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const result = await permissionApi.list();
      startTransition(() => {
        setGroups(result);
      });
    } catch {
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, [startTransition]);

  useEffect(() => {
    if (!fetchedRef.current) {
      fetchedRef.current = true;
      fetchPermissions();
    }
  }, [fetchPermissions]);

  const pageMeta = {
    title: t("title"),
    description: t("description"),
    breadcrumbs: [
      { label: tNav("dashboard"), href: "/dashboard" },
      { label: t("title") },
    ],
  };

  return (
    <div>
      <PageHeader title={pageMeta.title} description={pageMeta.description} />
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <div className="bg-muted h-5 w-24 animate-pulse rounded" />
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3].map((j) => (
                    <div
                      key={j}
                      className="bg-muted h-6 w-20 animate-pulse rounded-full"
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center gap-2 py-12">
          <p className="text-muted-foreground text-sm">
            Failed to load permissions
          </p>
          <button
            onClick={fetchPermissions}
            className="text-primary text-sm underline"
          >
            Retry
          </button>
        </div>
      ) : Object.keys(groups).length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-12">
          <p className="text-muted-foreground text-sm">{t("title")}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(groups).map(([group, perms]) => (
            <Card key={group}>
              <CardHeader>
                <CardTitle className="capitalize">{group}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="divide-border divide-y">
                  {perms.map((perm) => (
                    <div
                      key={perm.id}
                      className="flex items-center justify-between py-2"
                    >
                      <div>
                        <span className="text-sm font-medium">{perm.name}</span>
                        <Badge variant="secondary" className="ml-2">
                          {perm.key}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
