import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Users,
  Calendar,
  ClipboardList,
  Receipt,
  Moon,
  Sun,
} from "lucide-react";
import { NavLink, useMatch } from "react-router-dom";

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
];

function SidebarNavItem({
  item,
}: {
  item: (typeof navItems)[number];
}) {
  const isActive =
    useMatch({ path: item.url, end: item.url === "/" }) !== null;
  const Icon = item.icon;

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        render={<NavLink to={item.url} end={item.url === "/"} />}
        isActive={isActive}
        tooltip={item.title}
        className={
          isActive
            ? "relative data-active:bg-primary data-active:text-primary-foreground data-active:shadow-sm data-active:hover:bg-primary/90 data-active:hover:text-primary-foreground"
            : ""
        }
      >
        {isActive && (
          <span
            aria-hidden="true"
            className="absolute inset-y-1 left-0 w-1 rounded-r-full bg-primary-foreground"
          />
        )}
        <Icon />
        <span>{item.title}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

function SidebarThemeToggle() {
  const [isDarkMode, setIsDarkMode] = useState(
    () => window.localStorage.getItem("dental-practice-theme") === "dark",
  );
  const nextTheme = isDarkMode ? "light" : "dark";

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
    window.localStorage.setItem(
      "dental-practice-theme",
      isDarkMode ? "dark" : "light",
    );
  }, [isDarkMode]);

  const ThemeIcon = isDarkMode ? Moon : Sun;

  return (
    <SidebarMenuButton
      onClick={() => setIsDarkMode((current) => !current)}
      aria-label={`Switch to ${nextTheme} mode`}
      aria-pressed={isDarkMode}
      tooltip={`Switch to ${nextTheme} mode`}
      className="w-full"
    >
      <ThemeIcon />
      <span className="flex w-full items-center gap-2">
        <span className="flex-1">{isDarkMode ? "Dark mode" : "Light mode"}</span>
        <span
          aria-hidden="true"
          className="flex h-5 w-9 items-center rounded-full bg-muted p-0.5"
        >
          <span
            className={`size-4 rounded-full bg-background shadow-sm transition-transform ${
              isDarkMode ? "translate-x-4" : ""
            }`}
          />
        </span>
      </span>
    </SidebarMenuButton>
  );
}

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
              <SidebarNavItem key={item.title} item={item} />
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t p-2">
        <SidebarThemeToggle />
      </SidebarFooter>
    </Sidebar>
  );
}
