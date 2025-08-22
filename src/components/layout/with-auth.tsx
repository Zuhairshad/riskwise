
"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect, ComponentType, FC } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export function withAuth<P extends object>(WrappedComponent: ComponentType<P>): FC<P> {
  const WithAuthComponent: FC<P> = (props) => {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading && !user) {
        router.push("/login");
      }
    }, [user, loading, router]);

    if (loading || !user) {
       return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <Skeleton className="h-8 w-48 mb-2" />
                        <Skeleton className="h-4 w-64" />
                    </div>
                    <Skeleton className="h-10 w-36" />
                </div>
                
                <Skeleton className="h-36 w-full" />
                
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Skeleton className="h-28" />
                    <Skeleton className="h-28" />
                    <Skeleton className="h-28" />
                    <Skeleton className="h-28" />
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    <Skeleton className="h-96 col-span-full lg:col-span-4" />
                    <div className="col-span-full lg:col-span-3 space-y-4">
                        <Skeleton className="h-48" />
                        <Skeleton className="h-48" />
                    </div>
                </div>
                 
                 <Skeleton className="h-[400px]" />
            </div>
        )
    }

    return <WrappedComponent {...props} />;
  };

  WithAuthComponent.displayName = `withAuth(${(WrappedComponent.displayName || WrappedComponent.name || 'Component')})`;

  return WithAuthComponent;
};
