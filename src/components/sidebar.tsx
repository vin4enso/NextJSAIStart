"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  LayoutDashboard,
  User,
  Shield,
  Users,
  Key,
  ChevronDown,
  ChevronRight,
  LogOut,
  Menu,
} from "lucide-react";
import { useState } from "react";
import { menu, type MenuItem } from "@/config/menu";
import { useCurrentUser } from "@/hooks/use-current-user";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  User,
  Shield,
  Users,
  Key,
};

function SidebarItem({
  item,
  isCollapsed,
  onNavigate,
}: {
  item: MenuItem;
  isCollapsed: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const t = useTranslations();
  const [expanded, setExpanded] = useState(false);
  const Icon = item.icon ? iconMap[item.icon] : null;
  const hasChildren = !!(item.children && item.children.length > 0);
  const isActive = item.href
    ? pathname === item.href || pathname.startsWith(item.href + "/")
    : false;

  if (hasChildren) {
    return (
      <div>
        <button
          onClick={() => setExpanded(!expanded)}
          className={cn(
            "hover:bg-accent hover:text-accent-foreground flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
            isCollapsed && "justify-center px-2",
          )}
        >
          {Icon && <Icon className="size-4 shrink-0" />}
          {!isCollapsed && (
            <>
              <span className="flex-1 text-left">{t(item.title)}</span>
              {expanded ? (
                <ChevronDown className="text-muted-foreground size-3.5" />
              ) : (
                <ChevronRight className="text-muted-foreground size-3.5" />
              )}
            </>
          )}
        </button>
        {!isCollapsed && expanded && (
          <div className="mt-1 ml-3 space-y-1 border-l pl-3">
            {item.children!.map((child) => (
              <SidebarItem
                key={child.title}
                item={child}
                isCollapsed={false}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      href={item.href ?? "#"}
      onClick={onNavigate}
      className={cn(
        "hover:bg-accent hover:text-accent-foreground flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
        isActive
          ? "bg-accent text-accent-foreground font-medium"
          : "text-muted-foreground",
        isCollapsed && "justify-center px-2",
      )}
    >
      {Icon && <Icon className="size-4 shrink-0" />}
      {!isCollapsed && <span>{t(item.title)}</span>}
    </Link>
  );
}

function SidebarContent({
  isCollapsed,
  onNavigate,
}: {
  isCollapsed: boolean;
  onNavigate?: () => void;
}) {
  const { user } = useCurrentUser();
  const router = useRouter();
  const t = useTranslations();

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/login");
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 px-4 py-5">
        <div className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-lg text-sm font-bold">
          N
        </div>
        {!isCollapsed && (
          <span className="text-sm font-semibold">Next.js Starter</span>
        )}
      </div>

      <nav className="flex-1 space-y-1 px-2">
        {menu.map((item) => (
          <SidebarItem
            key={item.title}
            item={item}
            isCollapsed={isCollapsed}
            onNavigate={onNavigate}
          />
        ))}
      </nav>

      <div className="border-t p-2">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                className={cn(
                  "hover:bg-accent flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  isCollapsed && "justify-center",
                )}
              />
            }
          >
            <Avatar className="size-7">
              <AvatarImage src={user?.avatar ?? undefined} />
              <AvatarFallback className="text-xs">
                {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
              </AvatarFallback>
            </Avatar>
            {!isCollapsed && (
              <div className="flex-1 truncate text-left">
                <p className="truncate text-sm font-medium">{user?.name}</p>
                <p className="text-muted-foreground truncate text-xs">
                  {user?.email}
                </p>
              </div>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="right" className="w-48">
            <DropdownMenuItem render={<Link href="/profile" />}>
              <User className="mr-2 size-4" />
              {t("nav.profile")}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleSignOut}
              className="text-destructive"
            >
              <LogOut className="mr-2 size-4" />
              {t("auth.logout")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

export function Sidebar() {
  return (
    <>
      <aside className="bg-sidebar hidden w-60 border-r lg:block">
        <SidebarContent isCollapsed={false} />
      </aside>

      <Sheet>
        <SheetTrigger
          render={<Button variant="ghost" size="icon" className="lg:hidden" />}
        >
          <Menu className="size-5" />
          <span className="sr-only">Toggle menu</span>
        </SheetTrigger>
        <SheetContent side="left" className="w-60 p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation</SheetTitle>
          </SheetHeader>
          <SidebarContent isCollapsed={false} onNavigate={() => {}} />
        </SheetContent>
      </Sheet>
    </>
  );
}
