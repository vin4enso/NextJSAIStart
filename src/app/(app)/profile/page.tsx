"use client";

import { useCallback, useState } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { AvatarUpload } from "@/components/avatar-upload";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AppForm } from "@/components/app-form";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useFormMutation } from "@/hooks/use-form-mutation";
import { profileApi } from "@/api/profile.api";
import { Skeleton } from "@/components/ui/skeleton";

const profileSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
});

type ProfileForm = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const t = useTranslations("profile");
  const tNav = useTranslations("nav");
  const tCommon = useTranslations("common");

  const { user, isLoading: userLoading } = useCurrentUser();

  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const form = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    values: {
      name: user?.name ?? "",
    },
  });

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { mutate: updateProfile, isPending: isUpdating } = useFormMutation({
    mutationFn: async () => {
      let avatarUrl: string | undefined;

      if (avatarFile) {
        const { url } = await profileApi.uploadAvatar(avatarFile);
        avatarUrl = url;
      }

      const data = form.getValues();
      return profileApi.update({
        name: data.name.trim(),
        ...(avatarUrl ? { avatar: avatarUrl } : {}),
      });
    },
    onSuccess: () => setAvatarFile(null),
    successMessage: t("updateSuccess"),
    errorMessage: tCommon("updateError"),
  });

  const { mutate: changePassword, isPending: isChanging } = useFormMutation({
    mutationFn: async () => {
      if (!currentPassword || !newPassword || !confirmPassword) {
        throw new Error(t("passwordMismatch"));
      }
      if (newPassword !== confirmPassword) {
        throw new Error(t("passwordMismatch"));
      }
      return profileApi.changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });
    },
    onSuccess: () => {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    },
    successMessage: t("passwordChanged"),
    errorMessage: tCommon("updateError"),
  });

  const handleAvatarSelect = useCallback((file: File) => {
    setAvatarFile(file);
  }, []);

  if (userLoading) {
    return (
      <div>
        <PageHeader
          title={t("title")}
          description={t("description")}
          breadcrumbs={[
            { label: tNav("dashboard"), href: "/dashboard" },
            { label: t("title") },
          ]}
        />
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-60" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString()
    : "";

  return (
    <div>
      <PageHeader
        title={t("title")}
        description={t("description")}
        breadcrumbs={[
          { label: tNav("dashboard"), href: "/dashboard" },
          { label: t("title") },
        ]}
      />
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{t("profileInfo")}</CardTitle>
            <CardDescription>{t("profileInfoDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <AppForm onSubmit={form.handleSubmit(() => updateProfile())}>
              <div className="flex items-center gap-4">
                <AvatarUpload
                  src={
                    avatarFile ? URL.createObjectURL(avatarFile) : user.avatar
                  }
                  name={user.name}
                  onFileSelect={handleAvatarSelect}
                />
                <div>
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-muted-foreground text-xs">{t("avatar")}</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">{t("editProfile")}</Label>
                <Input id="name" {...form.register("name")} />
                {form.formState.errors.name && (
                  <p className="text-destructive text-xs">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>
              <Button type="submit" disabled={isUpdating}>
                {isUpdating ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : null}
                {isUpdating ? tCommon("loading") : tCommon("save")}
              </Button>
            </AppForm>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("account")}</CardTitle>
            <CardDescription>{t("accountDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-muted-foreground text-xs">
                {tNav("email")}
              </Label>
              <p className="text-sm">{user.email}</p>
            </div>
            <div>
              <Label className="text-muted-foreground text-xs">
                {t("memberSince")}
              </Label>
              <p className="text-sm">{memberSince}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("changePassword")}</CardTitle>
            <CardDescription>{t("changePasswordDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">{t("currentPassword")}</Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">{t("newPassword")}</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t("confirmPassword")}</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <Button onClick={changePassword} disabled={isChanging}>
              {isChanging ? <Loader2 className="size-4 animate-spin" /> : null}
              {isChanging ? tCommon("loading") : t("changePassword")}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
