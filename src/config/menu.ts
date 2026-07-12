export interface MenuItem {
  title: string;
  href?: string;
  icon: string;
  permission?: string;
  children?: MenuItem[];
}

export function filterMenuByPermissions(
  items: MenuItem[],
  permissions: string[],
): MenuItem[] {
  return items.reduce<MenuItem[]>((acc, item) => {
    if (item.permission && !permissions.includes(item.permission)) {
      return acc;
    }
    const filteredChildren = item.children
      ? filterMenuByPermissions(item.children, permissions)
      : undefined;
    acc.push({ ...item, children: filteredChildren });
    return acc;
  }, []);
}

export const menu: MenuItem[] = [
  { title: "nav.dashboard", href: "/dashboard", icon: "LayoutDashboard" },
  { title: "nav.profile", href: "/profile", icon: "User" },
  {
    title: "nav.administration",
    icon: "Shield",
    permission: "admin.access",
    children: [
      { title: "nav.users", href: "/admin/users", icon: "Users" },
      { title: "nav.roles", href: "/admin/roles", icon: "Shield" },
      { title: "nav.permissions", href: "/admin/permissions", icon: "Key" },
      {
        title: "nav.sections",
        href: "/admin/sections",
        icon: "FolderTree",
        permission: "sections.read",
      },
      {
        title: "nav.pages",
        href: "/admin/pages",
        icon: "FileText",
        permission: "pages.read",
      },
    ],
  },
];
