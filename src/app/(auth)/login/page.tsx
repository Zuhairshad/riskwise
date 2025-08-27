
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, OAuthProvider } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckSquare } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const GoogleIcon = () => (
    <svg className="h-5 w-5" viewBox="0 0 24 24">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
  
  const MicrosoftIcon = () => (
    <svg className="h-5 w-5" viewBox="0 0 24 24">
      <path fill="#F25022" d="M1 1h10v10H1z" />
      <path fill="#7FBA00" d="M13 1h10v10H13z" />
      <path fill="#00A4EF" d="M1 13h10v10H1z" />
      <path fill="#FFB900" d="M13 13h10v10H13z" />
    </svg>
  );

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState<boolean | string>(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading('email');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/dashboard");
    } catch (error: any) {
        toast({
            variant: "destructive",
            title: `Sign In Failed: ${error.code}`,
            description: error.message,
        });
      console.error("Error signing in with password and email", error);
    } finally {
        setLoading(false);
    }
  };

  const handleSocialSignIn = async (providerName: 'google' | 'microsoft') => {
    setLoading(providerName);
    const provider = providerName === 'google' ? new GoogleAuthProvider() : new OAuthProvider('microsoft.com');
    try {
      await signInWithPopup(auth, provider);
      router.push("/dashboard");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: `Sign In Failed: ${error.code}`,
        description: error.message,
      });
      console.error(`Error signing in with ${providerName}`, error);
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <Card className="shadow-2xl">
      <CardHeader className="space-y-4 text-center">
        <div className="flex justify-center">
            <CheckSquare className="h-12 w-12 text-primary" />
        </div>
        <CardTitle className="text-2xl font-bold">Welcome Back!</CardTitle>
        <CardDescription>
          Sign in to access your risk management dashboard.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" onClick={() => handleSocialSignIn('google')} disabled={!!loading} className="w-full">
                    {loading === 'google' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <GoogleIcon />}
                    Google
                </Button>
                <Button variant="outline" onClick={() => handleSocialSignIn('microsoft')} disabled={!!loading} className="w-full">
                    {loading === 'microsoft' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MicrosoftIcon />}
                    Microsoft
                </Button>
            </div>

            <div className="flex items-center space-x-2">
                <Separator className="flex-1" />
                <span className="text-xs text-muted-foreground">OR CONTINUE WITH</span>
                <Separator className="flex-1" />
            </div>
        </div>

        <form onSubmit={handleSignIn} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@company.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input 
                id="password" 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="h-11"
            />
          </div>
          <Button type="submit" className="w-full h-11" disabled={!!loading}>
            {loading === 'email' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sign In with Email
          </Button>
        </form>
        <div className="mt-6 text-center text-sm">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-semibold text-primary underline-offset-4 hover:underline">
            Sign up for free
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
