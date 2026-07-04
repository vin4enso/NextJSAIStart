"use client";

import { useState, useEffect } from "react";
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
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AppForm } from "@/components/app-form";
import { apiClient } from "@/lib/api-client";
import { userApi } from "@/api/user.api";
import type { CreateUserDTO, UpdateUserDTO } from "@/schemas/user";

const formSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email"),
  password: z.string().optional(),
  isActive: z.boolean(),
  roleIds: z.array(z.string()),
});

type FormValues = z.infer<typeof formSchema>;

interface Role {
  id: string;
  name: string;
}

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  user?: {
    id: string;
    name: string;
    email: string;
    isActive: boolean;
    roles: { id: string; name: string }[];
  } | null;
}

export function UserFormDialog({
  open,
  onOpenChange,
  onSuccess,
  user,
}: UserFormDialogProps) {
  const t = useTranslations("user");
  const tCommon = useTranslations("common");
  const isEdit = !!user;
  const [rolesList, setRolesList] = useState<Role[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user?.name ?? "",
      email: user?.email ?? "",
      password: "",
      isActive: user?.isActive ?? true,
      roleIds: user?.roles.map((r) => r.id) ?? [],
    },
  });

  useEffect(() => {
    if (open) {
      setLoadingRoles(true);
      apiClient
        .get<Role[]>("/api/roles")
        .then((data) => {
          setRolesList(data);
        })
        .catch(() => {
          toast.error("Failed to load roles");
        })
        .finally(() => setLoadingRoles(false));
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      form.reset({
        name: user?.name ?? "",
        email: user?.email ?? "",
        password: "",
        isActive: user?.isActive ?? true,
        roleIds: user?.roles.map((r) => r.id) ?? [],
      });
    }
  }, [open, user, form]);

  const toggleRole = (roleId: string) => {
    const current = form.getValues("roleIds");
    if (current.includes(roleId)) {
      form.setValue(
        "roleIds",
        current.filter((id) => id !== roleId),
      );
    } else {
      form.setValue("roleIds", [...current, roleId]);
    }
  };

  const onSubmit = async (data: FormValues) => {
    setSubmitting(true);
    try {
      if (isEdit && user) {
        const updateData: UpdateUserDTO = {
          name: data.name,
          email: data.email,
          isActive: data.isActive,
          roleIds: data.roleIds,
        };
        await userApi.update(user.id, updateData);
        toast.success(t("updateSuccess"));
      } else {
        const createData: CreateUserDTO = {
          name: data.name,
          email: data.email,
          password: data.password ?? "",
          isActive: data.isActive,
          roleIds: data.roleIds,
        };
        await userApi.create(createData);
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
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? t("editUser") : t("createUser")}</DialogTitle>
          <DialogDescription>
            {isEdit ? t("edit") : t("create")}
          </DialogDescription>
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
              <Label htmlFor="email">{t("email")}</Label>
              <Input
                id="email"
                type="email"
                {...form.register("email")}
                placeholder={t("email")}
              />
              {form.formState.errors.email && (
                <p className="text-destructive text-xs">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>
            {!isEdit && (
              <div className="space-y-2">
                <Label htmlFor="password">{t("password")}</Label>
                <Input
                  id="password"
                  type="password"
                  {...form.register("password")}
                  placeholder={t("password")}
                />
                {form.formState.errors.password && (
                  <p className="text-destructive text-xs">
                    {form.formState.errors.password.message}
                  </p>
                )}
              </div>
            )}
            <div className="flex items-center gap-2">
              <input
                id="isActive"
                type="checkbox"
                {...form.register("isActive")}
                className="border-input rounded"
              />
              <Label htmlFor="isActive">{t("active")}</Label>
            </div>
            <div className="space-y-2">
              <Label>{t("roles")}</Label>
              {loadingRoles ? (
                <p className="text-muted-foreground text-xs">
                  {tCommon("loading")}
                </p>
              ) : rolesList.length === 0 ? (
                <p className="text-muted-foreground text-xs">{t("noRoles")}</p>
              ) : (
                <div className="space-y-1">
                  {rolesList.map((role) => (
                    <label
                      key={role.id}
                      className="flex items-center gap-2 text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={form.watch("roleIds").includes(role.id)}
                        onChange={() => toggleRole(role.id)}
                        className="border-input rounded"
                      />
                      {role.name}
                    </label>
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
