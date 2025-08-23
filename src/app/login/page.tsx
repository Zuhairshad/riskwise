
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, OAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckSquare } from 'lucide-react';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
  } from "@/components/ui/form";

const loginSchema = z.object({
    email: z.string().email({ message: "Please enter a valid email address." }),
    password: z.string().min(1, { message: "Password is required." }),
});

export default function LoginPage() {
    const [loading, setLoading] = useState(false);
    const [providerLoading, setProviderLoading] = useState<string | null>(null);

    const router = useRouter();
    const { toast } = useToast();

    const form = useForm<z.infer<typeof loginSchema>>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        }
    });

    const handleLogin = async (values: z.infer<typeof loginSchema>) => {
        setLoading(true);
        try {
            await signInWithEmailAndPassword(auth, values.email, values.password);
            toast({ title: 'Login Successful', description: "Welcome back!" });
            router.push('/');
        } catch (error: any) {
            let errorMessage = "An unknown error occurred.";
            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                errorMessage = "Invalid email or password. Please try again.";
            } else {
                errorMessage = error.message;
            }
            toast({ variant: 'destructive', title: 'Login Failed', description: errorMessage });
        } finally {
            setLoading(false);
        }
    };

    const handleAzureSignIn = async () => {
        setProviderLoading('azure');
        const provider = new OAuthProvider('microsoft.com');
        try {
            await signInWithPopup(auth, provider);
            toast({ title: 'Login Successful', description: "Welcome!" });
            router.push('/');
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Login Failed', description: error.message });
        } finally {
            setProviderLoading(null);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center space-y-2">
                    <div className="flex justify-center items-center gap-2">
                        <CheckSquare className="h-8 w-8 text-primary" />
                        <h1 className="text-3xl font-headline font-bold">Proactify+</h1>
                    </div>
                    <CardTitle className="text-2xl pt-4">Welcome Back</CardTitle>
                    <CardDescription>Sign in to continue to your dashboard.</CardDescription>
                </CardHeader>
                <CardContent>
                     <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleLogin)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input placeholder="name@example.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <Input type="password" placeholder="••••••••" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Sign In
                            </Button>
                        </form>
                    </Form>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">
                            Or continue with
                            </span>
                        </div>
                    </div>

                    <Button 
                        variant="outline" 
                        className="w-full" 
                        onClick={handleAzureSignIn} 
                        disabled={!!providerLoading}
                    >
                        {providerLoading === 'azure' ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                           <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5.7207 5.7207L11.7001 5.7207V11.7001H5.7207V5.7207Z" fill="#F25022"></path><path d="M12.2999 5.7207L18.2793 5.7207V11.7001H12.2999V5.7207Z" fill="#7FBA00"></path><path d="M5.7207 12.2999L11.7001 12.2999V18.2793H5.7207V12.2999Z" fill="#00A4EF"></path><path d="M12.2999 12.2999L18.2793 12.2999V18.2793H12.2999V12.2999Z" fill="#FFB900"></path></svg>
                        )}
                        Sign in with Microsoft
                    </Button>
                </CardContent>
                <CardFooter className="flex-col items-center justify-center space-y-4">
                    <p className="text-center text-sm text-muted-foreground">
                        Don't have an account? <Link href="/signup" className="font-semibold text-primary hover:underline">Sign up</Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}

