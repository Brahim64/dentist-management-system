import {
  LayoutDashboard,
  Users,
  Calendar,
  ClipboardList,
  Receipt,
  Settings,
} from "lucide-react";
import { NavLink } from "react-router-dom";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const navItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Patients", url: "/patients", icon: Users },
  { title: "Appointments", url: "/appointments", icon: Calendar },
  { title: "Treatment plans", url: "/treatment-plans", icon: ClipboardList },
  { title: "Billing", url: "/billing", icon: Receipt },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader className="px-3 py-2 text-sm font-medium">
        Dentist Management System
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton>
                  <NavLink
                    to={item.url}
                    end={item.url === "/"}
                    className={({ isActive }) =>
                      isActive ? "font-medium" : ""
                    }
                  >
                    <div className="flex items-center gap-4">
                      <item.icon />
                      <span>{item.title}</span>
                    </div>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  );
}
