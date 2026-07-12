"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AppForm } from "@/components/app-form";
import { roleApi } from "@/api/role.api";
import { permissionApi } from "@/api/permission.api";

const formSchema = z.object({
  name: z.string().min(1, "Name is required").max(50),
  description: z.string().optional(),
  permissionIds: z.array(z.string()),
});

type FormValues = z.infer<typeof formSchema>;

interface PermissionItem {
  id: string;
  key: string;
  name: string;
  group: string;
}

interface RoleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  role?: {
    id: string;
    name: string;
    description: string | null;
    permissions: { id: string }[];
  } | null;
}

export function RoleFormDialog({
  open,
  onOpenChange,
  onSuccess,
  role,
}: RoleFormDialogProps) {
  const t = useTranslations("role");
  const tCommon = useTranslations("common");
  const isEdit = !!role;
  const [permissions, setPermissions] = useState<
    Record<string, PermissionItem[]>
  >({});
  const [loadingPerms, setLoadingPerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const hasFetched = useRef(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: role?.name ?? "",
      description: role?.description ?? "",
      permissionIds: role?.permissions.map((p) => p.id) ?? [],
    },
  });

  useEffect(() => {
    if (open && !hasFetched.current) {
      hasFetched.current = true;
      setLoadingPerms(true);
      permissionApi
        .list()
        .then(setPermissions)
        .catch(() => toast.error("Failed to load permissions"))
        .finally(() => setLoadingPerms(false));
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      hasFetched.current = false;
      form.reset({
        name: role?.name ?? "",
        description: role?.description ?? "",
        permissionIds: role?.permissions.map((p) => p.id) ?? [],
      });
    }
  }, [open, role, form]);

  const togglePermission = useCallback(
    (permissionId: string) => {
      const current = form.getValues("permissionIds");
      if (current.includes(permissionId)) {
        form.setValue(
          "permissionIds",
          current.filter((id) => id !== permissionId),
        );
      } else {
        form.setValue("permissionIds", [...current, permissionId]);
      }
    },
    [form],
  );

  const onSubmit = useCallback(
    async (data: FormValues) => {
      setSubmitting(true);
      try {
        if (isEdit && role) {
          await roleApi.update(role.id, {
            name: data.name,
            description: data.description || undefined,
            permissionIds: data.permissionIds,
          });
          toast.success(t("updateSuccess"));
        } else {
          await roleApi.create({
            name: data.name,
            description: data.description || undefined,
            permissionIds: data.permissionIds,
          });
          toast.success(t("createSuccess"));
        }
        onSuccess();
        onOpenChange(false);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Something went wrong";
        toast.error(message);
      } finally {
        setSubmitting(false);
      }
    },
    [isEdit, role, onSuccess, onOpenChange, t],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? t("edit") : t("create")}</DialogTitle>
        </DialogHeader>
        <AppForm onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t("name")}</Label>
              <Input
                id="name"
                {...form.register("name")}
                placeholder={t("name")}
              />
              {form.formState.errors.name && (
                <p className="text-destructive text-xs">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">{t("description")}</Label>
              <Input
                id="description"
                {...form.register("description")}
                placeholder={t("description")}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("permissions")}</Label>
              {loadingPerms ? (
                <p className="text-muted-foreground text-xs">
                  {tCommon("loading")}
                </p>
              ) : Object.keys(permissions).length === 0 ? (
                <p className="text-muted-foreground text-xs">
                  No permissions available
                </p>
              ) : (
                <div className="max-h-60 space-y-3 overflow-y-auto rounded-lg border p-3">
                  {Object.entries(permissions).map(([group, perms]) => (
                    <div key={group}>
                      <p className="text-muted-foreground mb-1 text-xs font-medium capitalize">
                        {group}
                      </p>
                      <div className="space-y-1">
                        {perms.map((perm) => (
                          <label
                            key={perm.id}
                            className="flex items-center gap-2 text-sm"
                          >
                            <input
                              type="checkbox"
                              checked={form
                                .watch("permissionIds")
                                .includes(perm.id)}
                              onChange={() => togglePermission(perm.id)}
                              className="border-input rounded"
                            />
                            {perm.name}
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              {tCommon("cancel")}
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? tCommon("loading") : tCommon("save")}
            </Button>
          </DialogFooter>
        </AppForm>
      </DialogContent>
    </Dialog>
  );
}
