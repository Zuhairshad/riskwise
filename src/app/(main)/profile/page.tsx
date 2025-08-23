
"use client";

import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Trophy } from "lucide-react";

export default function ProfilePage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    const handleSignOut = async () => {
        await auth.signOut();
        router.push("/login");
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-4 w-64" />
                <Card>
                    <CardHeader>
                        <Skeleton className="h-24 w-24 rounded-full mx-auto" />
                    </CardHeader>
                    <CardContent className="text-center space-y-2">
                        <Skeleton className="h-6 w-48 mx-auto" />
                        <Skeleton className="h-4 w-56 mx-auto" />
                        <Skeleton className="h-10 w-24 mx-auto mt-4" />
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (!user) {
        // This should be handled by withAuth HOC, but as a fallback
        router.push('/login');
        return null;
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
                <p className="text-muted-foreground">
                    View and manage your account details.
                </p>
            </div>

            <Card className="max-w-lg mx-auto">
                <CardHeader className="items-center text-center">
                    <Avatar className="w-24 h-24 mb-4 ring-4 ring-primary/20">
                        <AvatarImage src={user.photoURL || `https://placehold.co/100x100.png`} alt={user.displayName || "User"} data-ai-hint="user avatar" />
                        <AvatarFallback className="text-3xl">{user.displayName?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <CardTitle className="text-3xl">{user.displayName}</CardTitle>
                    <CardDescription>{user.email}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2"><Trophy className="text-yellow-500" /> Stats & Badges</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex justify-around text-center">
                                    <div>
                                        <p className="text-2xl font-bold">1,250</p>
                                        <p className="text-sm text-muted-foreground">Points</p>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold">#5</p>
                                        <p className="text-sm text-muted-foreground">Rank</p>
                                    </div>
                                </div>
                                <div className="mt-4 flex flex-wrap justify-center gap-2">
                                     <Badge variant="secondary">On-Time Closer</Badge>
                                     <Badge variant="secondary">Prompt Updater</Badge>
                                     <Badge variant="secondary">Team Helper</Badge>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                    <Button onClick={handleSignOut} variant="outline" className="w-full">
                        Sign Out
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
