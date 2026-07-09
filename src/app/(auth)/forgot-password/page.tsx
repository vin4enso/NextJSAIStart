"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

export default function ForgotPasswordPage() {
  const t = useTranslations("auth");
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: reqError } = await authClient.requestPasswordReset({
      email,
      redirectTo: "/reset-password",
    });

    if (reqError) {
      setError(reqError.message ?? null);
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  };

  if (sent) {
    return (
      <Card>
        <CardHeader className="text-center">
          <CardTitle>{t("checkEmail")}</CardTitle>
          <CardDescription>{t("resetEmailSent")}</CardDescription>
        </CardHeader>
        <CardFooter className="justify-center">
          <Link href="/login" className="text-primary text-sm hover:underline">
            {t("backToLogin")}
          </Link>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card data-testid="forgot-password-form">
      <CardHeader className="text-center">
        <CardTitle>{t("forgotPassword")}</CardTitle>
        <CardDescription>{t("forgotPasswordDescription")}</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">{t("email")}</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              data-testid="forgot-password-email"
            />
          </div>
          {error && (
            <p
              className="text-destructive text-sm"
              data-testid="forgot-password-error"
            >
              {error}
            </p>
          )}
        </CardContent>
        <CardFooter className="flex-col gap-4">
          <Button
            type="submit"
            className="w-full"
            disabled={loading}
            data-testid="forgot-password-submit"
          >
            {loading ? t("sending") : t("sendResetLink")}
          </Button>
          <Link
            href="/login"
            className="text-muted-foreground hover:text-primary text-sm"
          >
            {t("backToLogin")}
          </Link>
        </CardFooter>
      </form>
    </Card>
  );
}
