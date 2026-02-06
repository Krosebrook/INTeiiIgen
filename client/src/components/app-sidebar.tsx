import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  Database,
  Sparkles,
  Building2,
  Wand2,
  LogOut,
  BarChart3,
  Plus,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";

const navItems = [
  {
    title: "Home",
    url: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Data",
    url: "/data",
    icon: Database,
    matchPaths: ["/data", "/sources", "/upload", "/cloud"],
  },
  {
    title: "Studio",
    url: "/studio",
    icon: Wand2,
  },
  {
    title: "Insights",
    url: "/insights",
    icon: Sparkles,
  },
  {
    title: "Organizations",
    url: "/organizations",
    icon: Building2,
  },
];

export function AppSidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  const getInitials = (firstName?: string | null, lastName?: string | null) => {
    const first = firstName?.charAt(0) || "";
    const last = lastName?.charAt(0) || "";
    return (first + last).toUpperCase() || "U";
  };

  const isActive = (item: typeof navItems[0]) => {
    if (item.matchPaths) {
      return item.matchPaths.some(p => location === p || location.startsWith(p + "/"));
    }
    if (item.url === "/") return location === "/";
    return location === item.url || location.startsWith(item.url + "/");
  };

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <Link href="/">
          <div className="flex items-center gap-3 cursor-pointer" data-testid="link-logo">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold">DashGen</span>
              <span className="text-xs text-muted-foreground">Dashboard Generator</span>
            </div>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <div className="px-2 mb-4">
          <Link href="/new">
            <Button className="w-full justify-start gap-2" data-testid="button-new-dashboard">
              <Plus className="h-4 w-4" />
              New Dashboard
            </Button>
          </Link>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item)}
                  >
                    <Link href={item.url} data-testid={`link-nav-${item.title.toLowerCase()}`}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.profileImageUrl || undefined} alt={user?.firstName || "User"} />
            <AvatarFallback className="text-xs">
              {getInitials(user?.firstName, user?.lastName)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {user?.firstName || "User"} {user?.lastName || ""}
            </p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => logout()}
            data-testid="button-logout"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
