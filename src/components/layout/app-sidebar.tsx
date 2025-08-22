
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { LayoutDashboard, PlusCircle, BarChart, CheckSquare, ClipboardList } from "lucide-react";

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="flex items-center gap-2 font-headline text-lg font-semibold text-primary"
          >
            <CheckSquare className="h-7 w-7 text-primary" />
            <span className="text-sidebar-foreground">Proactify+</span>
          </Link>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname === "/"}
              tooltip="Dashboard"
            >
              <Link href="/">
                <LayoutDashboard />
                <span>Dashboard</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
           <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname === "/executive-dashboard"}
              tooltip="Executive Dashboard"
            >
              <Link href="/executive-dashboard">
                <BarChart />
                <span>Executive View</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname === "/add"}
              tooltip="Add New"
            >
              <Link href="/add">
                <PlusCircle />
                <span>Add Risk/Issue</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname === "/benchmarking"}
              tooltip="Benchmarking"
            >
              <Link href="/benchmarking">
                <ClipboardList />
                <span>Benchmarking</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
