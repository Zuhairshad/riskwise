
"use client";

import React from "react";
import Link from "next/link";
import { AppSidebar } from "@/components/layout/app-sidebar";

function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  
  return (
      <div className="flex min-h-screen">
        <AppSidebar />
        <div className="flex-1 bg-background/95">
          <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[radial-gradient(var(--grid-color)_1px,transparent_1px)] [background-size:16px_16px]"></div>
          <div className="glow-1 absolute -z-10" />
          <div className="glow-2 absolute -z-10" />
          <header className="sticky top-0 z-10 flex h-16 items-center justify-end gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
             {/* User avatar removed as there is no auth */}
          </header>
          <main className="flex-1 p-4 sm:p-6">{children}</main>
        </div>
      </div>
  );
}


export default MainLayout;
