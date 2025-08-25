
'use client';

import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function RootPage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading) {
        if (user) {
          router.replace('/dashboard');
        } else {
          router.replace('/login');
        }
      }
    }, [user, loading, router]);

    return (
        <div className="flex h-screen w-full items-center justify-center">
           <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-muted-foreground">Loading...</p>
           </div>
        </div>
      );
}
