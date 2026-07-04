"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import type { User } from "@/types";

interface SessionData {
  user: User;
  session: {
    id: string;
    expiresAt: number;
    token: string;
    createdAt: string;
    updatedAt: string;
    ipAddress?: string;
    userAgent?: string;
  };
}

export function useCurrentUser() {
  const [session, setSession] = useState<SessionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    authClient.getSession().then((res) => {
      if (res.data) {
        const data = res.data;
        const user: User = {
          id: data.user.id,
          email: data.user.email,
          name: data.user.name,
          avatar: data.user.image,
          isActive: true,
          createdAt:
            data.user.createdAt instanceof Date
              ? data.user.createdAt.toISOString()
              : String(data.user.createdAt),
          updatedAt:
            data.user.updatedAt instanceof Date
              ? data.user.updatedAt.toISOString()
              : String(data.user.updatedAt),
          deletedAt: null,
        };
        const rawSession = data.session as Record<string, unknown>;
        setSession({
          user,
          session: {
            id: String(rawSession.id),
            expiresAt:
              rawSession.expiresAt instanceof Date
                ? rawSession.expiresAt.getTime()
                : Number(rawSession.expiresAt),
            token: String(rawSession.token),
            createdAt:
              rawSession.createdAt instanceof Date
                ? rawSession.createdAt.toISOString()
                : String(rawSession.createdAt),
            updatedAt:
              rawSession.updatedAt instanceof Date
                ? rawSession.updatedAt.toISOString()
                : String(rawSession.updatedAt),
            ipAddress: rawSession.ipAddress
              ? String(rawSession.ipAddress)
              : undefined,
            userAgent: rawSession.userAgent
              ? String(rawSession.userAgent)
              : undefined,
          },
        });
      }
      setIsLoading(false);
    });
  }, []);

  return { session, user: session?.user ?? null, isLoading };
}
