import { render, screen } from "@testing-library/react";
import { SidebarContent } from "./sidebar";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const t: Record<string, string> = {
      "nav.dashboard": "Dashboard",
      "nav.profile": "Profile",
      "nav.administration": "Administration",
      "nav.users": "Users",
      "nav.roles": "Roles",
      "nav.permissions": "Permissions",
      "language": "Language",
      "lang.ru": "Russian",
      "lang.en": "English",
    };
    return t[key] ?? key;
  },
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard",
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("@/hooks/use-current-user", () => ({
  useCurrentUser: () => ({ user: null, isLoading: false }),
}));

vi.mock("@/lib/actions", () => ({
  getCurrentUserPermissions: vi.fn(() => Promise.resolve(["admin.access"])),
}));

describe("SidebarContent", () => {
  it("renders menu items when no permissions prop given (fetches from server)", async () => {
    render(<SidebarContent isCollapsed={false} />);
    expect(await screen.findByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Profile")).toBeInTheDocument();
    expect(screen.getByText("Administration")).toBeInTheDocument();
  });

  it("hides menu items with permission requirement when permissions are empty", () => {
    render(<SidebarContent isCollapsed={false} permissions={[]} />);
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Profile")).toBeInTheDocument();
    expect(screen.queryByText("Administration")).not.toBeInTheDocument();
  });

  it("shows menu items when user has required permission", () => {
    render(
      <SidebarContent isCollapsed={false} permissions={["admin.access"]} />,
    );
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Administration")).toBeInTheDocument();
  });
});
