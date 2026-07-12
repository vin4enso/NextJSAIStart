import { describe, it, expect } from "vitest";
import { filterMenuByPermissions, menu, type MenuItem } from "@/config/menu";

describe("filterMenuByPermissions", () => {
  const items: MenuItem[] = [
    { title: "nav.dashboard", href: "/dashboard", icon: "LayoutDashboard" },
    {
      title: "nav.profile",
      href: "/profile",
      icon: "User",
      permission: "users.read",
    },
    {
      title: "nav.administration",
      icon: "Shield",
      permission: "admin.access",
      children: [
        { title: "nav.users", href: "/admin/users", icon: "Users" },
        { title: "nav.roles", href: "/admin/roles", icon: "Shield" },
      ],
    },
    { title: "nav.public", href: "/public", icon: "LayoutDashboard" },
  ];

  it("shows items without permission requirement even with empty permissions", () => {
    const result = filterMenuByPermissions(items, []);
    expect(result).toHaveLength(2);
    expect(result[0].title).toBe("nav.dashboard");
    expect(result[1].title).toBe("nav.public");
  });

  it("shows items when user has required permission", () => {
    const result = filterMenuByPermissions(items, ["users.read"]);
    expect(result).toHaveLength(3);
    expect(result.find((i) => i.title === "nav.profile")).toBeDefined();
  });

  it("hides items when user lacks required permission", () => {
    const result = filterMenuByPermissions(items, []);
    expect(result.find((i) => i.title === "nav.profile")).toBeUndefined();
  });

  it("hides parent with children when user lacks required permission", () => {
    const result = filterMenuByPermissions(items, []);
    expect(
      result.find((i) => i.title === "nav.administration"),
    ).toBeUndefined();
  });

  it("shows parent with children when user has required permission", () => {
    const result = filterMenuByPermissions(items, ["admin.access"]);
    const admin = result.find((i) => i.title === "nav.administration");
    expect(admin).toBeDefined();
    expect(admin!.children).toHaveLength(2);
  });

  it("does not mutate the original array", () => {
    const original = [...items];
    filterMenuByPermissions(items, []);
    expect(items).toEqual(original);
  });
});

describe("menu config", () => {
  it("has dashboard item without permission", () => {
    const item = menu.find((i) => i.title === "nav.dashboard");
    expect(item).toBeDefined();
    expect(item?.permission).toBeUndefined();
  });

  it("has administration item with admin.access permission", () => {
    const item = menu.find((i) => i.title === "nav.administration");
    expect(item).toBeDefined();
    expect(item?.permission).toBe("admin.access");
  });
});
