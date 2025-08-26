
"use client";

import React, { useState, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { auth, db } from "@/lib/firebase";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { updateProfile } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Trophy, Edit, Loader2 } from "lucide-react";

export default function ProfilePage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [isEditing, setIsEditing] = useState(false);
    const [displayName, setDisplayName] = useState(user?.displayName || "");
    const [newAvatar, setNewAvatar] = useState<File | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSignOut = async () => {
        await auth.signOut();
        router.push("/login");
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setNewAvatar(e.target.files[0]);
        }
    };

    const handleSaveChanges = async () => {
        if (!user) return;
        setIsSaving(true);
        try {
            let photoURL = user.photoURL;

            // 1. Upload new avatar if selected
            if (newAvatar) {
                const storage = getStorage();
                const storageRef = ref(storage, `avatars/${user.uid}/${newAvatar.name}`);
                const snapshot = await uploadBytes(storageRef, newAvatar);
                photoURL = await getDownloadURL(snapshot.ref);
            }

            // 2. Update Firebase Auth profile
            await updateProfile(user, {
                displayName: displayName,
                photoURL: photoURL
            });

            // 3. Update Firestore user document
            const userDocRef = doc(db, "users", user.uid);
            await updateDoc(userDocRef, {
                displayName: displayName,
                photoURL: photoURL
            });
            
            toast({ title: "Success", description: "Profile updated successfully!" });
            setIsEditing(false);
            setNewAvatar(null);
            // Force a reload of the user to get fresh data
            await user.reload();

        } catch (error: any) {
            console.error("Error updating profile: ", error);
            toast({ variant: "destructive", title: "Update Failed", description: error.message });
        } finally {
            setIsSaving(false);
        }
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
                <CardHeader className="items-center text-center relative">
                    <div className="absolute top-4 right-4">
                        <Button variant="ghost" size="icon" onClick={() => setIsEditing(!isEditing)}>
                            <Edit className="h-5 w-5" />
                        </Button>
                    </div>
                    <div className="relative">
                        <Avatar className="w-24 h-24 mb-4 ring-4 ring-primary/20">
                            <AvatarImage src={newAvatar ? URL.createObjectURL(newAvatar) : user.photoURL || `https://placehold.co/100x100.png`} alt={user.displayName || "User"} data-ai-hint="user avatar" />
                            <AvatarFallback className="text-3xl">{user.displayName?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        {isEditing && (
                            <Button size="sm" variant="outline" className="absolute bottom-4 right-0" onClick={handleAvatarClick}>
                                Change
                            </Button>
                        )}
                    </div>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />

                    {isEditing ? (
                        <Input
                            className="text-3xl text-center font-semibold h-auto p-0 border-0 focus-visible:ring-0"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                        />
                    ) : (
                        <CardTitle className="text-3xl">{user.displayName}</CardTitle>
                    )}
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
                </CardContent>
                 <CardFooter className="flex flex-col gap-4">
                    {isEditing && (
                        <Button onClick={handleSaveChanges} className="w-full" disabled={isSaving}>
                            {isSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Saving...</> : 'Save Changes'}
                        </Button>
                    )}
                    <Button onClick={handleSignOut} variant="outline" className="w-full">
                        Sign Out
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}
