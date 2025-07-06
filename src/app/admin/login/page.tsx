"use client";

import { useState, type FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase'; // Client-side Firebase auth
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { user, userProfile, loading } = useAuth();

  // Handle redirect after successful login
  useEffect(() => {
    if (!loading && user && userProfile) {
      const redirectTo = searchParams.get('redirect');
      
      // Determine where to redirect based on user type and role
      const isAdmin = userProfile.type === 'admin' || userProfile.role === 'superAdmin' || userProfile.role === 'editor';
      
      if (redirectTo) {
        // If there's a specific redirect URL, use it
        router.push(redirectTo);
      } else if (isAdmin) {
        // Admin users go to admin dashboard
        router.push('/admin');
      } else {
        // Regular users go to their personal dashboard
        router.push('/my-saleeka');
      }
    }
  }, [user, userProfile, loading, router, searchParams]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: "Login Successful",
        description: "Redirecting to dashboard...",
      });
      // Redirect will be handled by the useEffect above
    } catch (err: any) {
      console.error("Firebase login error:", err);
      let errorMessage = "Failed to login. Please check your credentials.";
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        errorMessage = "Invalid email or password.";
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = "Please enter a valid email address.";
      }
      setError(errorMessage);
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // If user is already logged in, show loading while redirecting
  if (!loading && user && userProfile) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <Card className="w-full max-w-sm shadow-xl">
          <CardContent className="p-6 text-center">
            <p>Redirecting to your dashboard...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm shadow-xl">
        <CardHeader className="text-center">
           <Image
                src="/saleeka-logo.png" // Using static logo
                alt="Saleeka Foundation Logo"
                width={150} // Adjust as needed
                height={50}  // Adjust as needed
                className="object-contain mx-auto mb-4"
                priority
              />
          <CardTitle className="font-headline text-2xl text-primary">Login</CardTitle>
          <CardDescription>Access your Saleeka Foundation account.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
        </CardContent>
         <CardFooter className="text-center text-xs text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Saleeka Foundation</p>
        </CardFooter>
      </Card>
    </div>
  );
}