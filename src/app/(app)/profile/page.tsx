"use client";

import { useCallback, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
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
import { useCurrentUser } from "@/hooks/use-current-user";
import { profileApi } from "@/api/profile.api";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProfilePage() {
  const t = useTranslations("profile");
  const tNav = useTranslations("nav");
  const tCommon = useTranslations("common");

  const { user, isLoading: userLoading } = useCurrentUser();

  const [name, setName] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isUpdatingProfile, startUpdateProfile] = useTransition();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, startChangePassword] = useTransition();

  const handleAvatarSelect = useCallback((file: File) => {
    setAvatarFile(file);
  }, []);

  const handleUpdateProfile = useCallback(() => {
    if (!name.trim()) return;
    startUpdateProfile(async () => {
      try {
        let avatarUrl: string | undefined;

        if (avatarFile) {
          const { url } = await profileApi.uploadAvatar(avatarFile);
          avatarUrl = url;
        }

        await profileApi.update({
          name: name.trim(),
          ...(avatarUrl ? { avatar: avatarUrl } : {}),
        });

        setAvatarFile(null);
        toast.success(t("updateSuccess"));
      } catch {
        toast.error(tCommon("loading"));
      }
    });
  }, [name, avatarFile, t, tCommon]);

  const handleChangePassword = useCallback(() => {
    if (!currentPassword || !newPassword || !confirmPassword) return;
    if (newPassword !== confirmPassword) {
      toast.error(t("passwordMismatch"));
      return;
    }

    startChangePassword(async () => {
      try {
        await profileApi.changePassword({
          currentPassword,
          newPassword,
          confirmPassword,
        });

        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        toast.success(t("passwordChanged"));
      } catch {
        toast.error(tCommon("loading"));
      }
    });
  }, [currentPassword, newPassword, confirmPassword, t, tCommon]);

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
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <AvatarUpload
                src={avatarFile ? URL.createObjectURL(avatarFile) : user.avatar}
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
              <Input
                id="name"
                defaultValue={user.name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <Button onClick={handleUpdateProfile} disabled={isUpdatingProfile}>
              {isUpdatingProfile ? tCommon("loading") : tCommon("save")}
            </Button>
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
            <Button
              onClick={handleChangePassword}
              disabled={isChangingPassword}
            >
              {isChangingPassword ? tCommon("loading") : t("changePassword")}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
