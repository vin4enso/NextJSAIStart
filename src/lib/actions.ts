"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getUserPermissionKeys } from "@/lib/rbac";

export async function getCurrentUserPermissions(): Promise<string[]> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return [];
  return getUserPermissionKeys(session.user.id);
}
