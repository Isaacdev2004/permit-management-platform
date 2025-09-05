import { useState } from "react";
import {
  Home,
  FileText,
  Users,
  Download,
  Settings,
  Zap,
  Calendar,
  Filter,
  ChevronDown,
} from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const navigationItems = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Permits", url: "/permits", icon: FileText },
  { title: "Presets", url: "/presets", icon: Filter },
  { title: "Exports", url: "/exports", icon: Download },
  { title: "Clients", url: "/clients", icon: Users },
  { title: "Automations", url: "/automations", icon: Zap },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";

  const isActive = (path: string) => {
    if (path === "/") return currentPath === "/";
    return currentPath.startsWith(path);
  };

  const getNavClass = (path: string) => {
    const active = isActive(path);
    return active
      ? "bg-primary text-primary-foreground font-medium"
      : "hover:bg-sidebar-accent text-sidebar-foreground hover:text-sidebar-accent-foreground";
  };

  return (
    <Sidebar className={collapsed ? "w-16" : "w-64"} collapsible="icon">
      <SidebarContent className="bg-sidebar-background border-r border-sidebar-border">
        <div className="px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-primary-foreground" />
            </div>
            {!collapsed && (
              <span className="text-lg font-semibold text-sidebar-foreground">
                Permit Platform
              </span>
            )}
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={getNavClass(item.url)}
                      end={item.url === "/"}
                    >
                      <item.icon className="w-4 h-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="mt-auto p-4">
          <div className="flex items-center gap-3 p-2 rounded-lg bg-sidebar-accent">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-xs font-medium text-primary-foreground">
                A
              </span>
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-accent-foreground truncate">
                  {(() => {
                    try {
                      const u = localStorage.getItem("auth_user");
                      if (!u) return "Guest";
                      const { email } = JSON.parse(u);
                      return email || "Guest";
                    } catch {
                      return "Guest";
                    }
                  })()}
                </p>
                <p className="text-xs text-sidebar-foreground opacity-70">
                  Administrator
                </p>
              </div>
            )}
            {!collapsed && (
              <button
                onClick={() => {
                  localStorage.removeItem("auth_user");
                  navigate("/login");
                }}
                className="ml-auto text-xs underline text-sidebar-accent-foreground"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}