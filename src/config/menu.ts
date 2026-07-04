export interface MenuItem {
  title: string;
  href?: string;
  icon: string;
  permission?: string;
  children?: MenuItem[];
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
    ],
  },
];
