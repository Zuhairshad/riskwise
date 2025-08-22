
"use client";

import Link from "next/link";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
    const { user, loading, logout } = useAuth();
    const router = useRouter();

    if (loading) {
        return (
             <div className="flex min-h-screen">
                <div className="w-64 border-r p-4">
                    <Skeleton className="h-8 w-32 mb-8" />
                    <div className="space-y-4">
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                    </div>
                </div>
                <div className="flex-1 p-6">
                    <Skeleton className="h-full w-full" />
                </div>
            </div>
        )
    }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <AppSidebar />
        <SidebarInset>
          <header className="sticky top-0 z-10 flex h-16 items-center justify-end gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
             {user ? (
                 <>
                    <Button variant="outline" onClick={logout}>Logout</Button>
                    <Link href="/profile" aria-label="View Profile">
                    <Avatar>
                        <AvatarImage src={user.photoURL || "https://placehold.co/40x40.png"} alt="User" data-ai-hint="user avatar" />
                        <AvatarFallback>{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    </Link>
                </>
             ) : (
                <Button onClick={() => router.push('/login')}>Login</Button>
             )}
          </header>
          <main className="flex-1 p-4 sm:p-6">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
