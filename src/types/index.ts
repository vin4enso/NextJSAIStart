export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface Session {
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

export interface Breadcrumb {
  label: string;
  href?: string;
}

export interface PageMeta {
  title: string;
  description?: string;
  breadcrumbs: Breadcrumb[];
}
