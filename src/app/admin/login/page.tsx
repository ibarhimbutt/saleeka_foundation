"use client";

import { useState, type FormEvent, Suspense } from 'react';
import { useRouter } from 'next/navigation';
// FIREBASE IMPORTS COMMENTED OUT - NOW USING NEO4J
// import { signInWithEmailAndPassword } from 'firebase/auth';
// import { auth } from '@/lib/firebase'; // Client-side Firebase auth

// Import Neo4j authentication
import { signInWithEmailAndPassword } from '@/lib/neo4jAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import { createSession } from '@/lib/neo4jAuth';
import { Neo4jUserService } from '@/lib/neo4jService';
import type { UserProfile } from '@/lib/firestoreTypes';

// Utility function to convert Neo4j node to UserProfile
const convertNeo4jNodeToUserProfile = (neo4jNode: any): UserProfile => {
  // Map Neo4j role to UserProfile role
  const mapRole = (neo4jRole: string): any => {
    switch (neo4jRole) {
      case 'superAdmin':
      case 'editor':
      case 'viewer':
        return neo4jRole;
      case 'admin':
        return 'superAdmin';
      case 'student':
      case 'mentor':
      case 'professional':
      case 'donor':
        return 'viewer';
      default:
        return 'viewer';
    }
  };

  // Map Neo4j type to UserProfile type
  const mapType = (neo4jType: string): any => {
    switch (neo4jType) {
      case 'admin':
        return 'admin';
      case 'student':
        return 'student';
      case 'mentor':
      case 'professional':
        return 'professional';
      case 'donor':
        return 'donor';
      case 'orgadmin':
        return 'orgadmin';
      default:
        return 'unclassified';
    }
  };

  return {
    uid: neo4jNode.uid,
    email: neo4jNode.email,
    displayName: neo4jNode.displayName,
    firstName: neo4jNode.firstName,
    lastName: neo4jNode.lastName,
    role: mapRole(neo4jNode.role),
    type: mapType(neo4jNode.type),
    photoURL: neo4jNode.photoURL,
    bio: neo4jNode.bio,
    interests: neo4jNode.interests,
    phone: neo4jNode.phone,
    location: neo4jNode.location,
    website: neo4jNode.website,
    linkedinUrl: neo4jNode.linkedinUrl,
    githubUrl: neo4jNode.githubUrl,
    twitterUrl: neo4jNode.twitterUrl,
    company: neo4jNode.company,
    jobTitle: neo4jNode.jobTitle,
    skills: neo4jNode.skills,
    experience: neo4jNode.experience,
    education: neo4jNode.education,
    subscribeNewsletter: neo4jNode.subscribeNewsletter,
    emailNotifications: neo4jNode.emailNotifications,
    pushNotifications: neo4jNode.pushNotifications,
    marketingEmails: neo4jNode.marketingEmails,
    createdAt: neo4jNode.createdAt as any,
    updatedAt: neo4jNode.updatedAt as any,
    lastLoginAt: neo4jNode.lastLoginAt as any,
    isActive: neo4jNode.isActive,
    isVerified: neo4jNode.isVerified,
    profileVisibility: neo4jNode.profileVisibility,
    showEmail: neo4jNode.showEmail,
    showPhone: neo4jNode.showPhone,
    showLocation: neo4jNode.showLocation,
  };
};

// Client component that uses useSearchParams
function AdminLoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();
  const { user, userProfile, loading, setUser, setUserProfile } = useAuth();

  // Handle redirect after successful login
  useEffect(() => {
    console.log('useEffect triggered - loading:', loading, 'user:', user, 'userProfile:', userProfile);
    
    if (!loading && user && userProfile) {
      console.log('Conditions met for redirect');
      
      // Determine where to redirect based on user type and role
      const isAdmin = userProfile.type === 'admin' || userProfile.role === 'superAdmin' || userProfile.role === 'editor';
      console.log('User is admin:', isAdmin, 'userProfile.type:', userProfile.type, 'userProfile.role:', userProfile.role);
      
      if (isAdmin) {
        // Admin users go to admin dashboard
        console.log('Redirecting admin to dashboard');
        router.push('/admin');
        // Fallback redirect
        setTimeout(() => {
          if (window.location.pathname !== '/admin') {
            window.location.href = '/admin';
          }
        }, 1000);
      } else {
        // Regular users go to their personal dashboard
        console.log('Redirecting regular user to my-saleeka');
        router.push('/my-saleeka');
        // Fallback redirect
        setTimeout(() => {
          if (window.location.pathname !== '/my-saleeka') {
            window.location.href = '/my-saleeka';
          }
        }, 1000);
      }
    }
  }, [user, userProfile, loading, router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      console.log('Attempting login with email:', email);
      const result = await signInWithEmailAndPassword(email, password);
      console.log('Login successful, result:', result);
      
      // Set the user in the auth context
      console.log('Setting user in auth context:', result.user);
      setUser(result.user);
      
      // Create a session token and store it
      const sessionToken = createSession(result.user);
      console.log('Created session token:', sessionToken);
      localStorage.setItem('neo4j_session_token', sessionToken);
      
      // Fetch the actual user profile from Neo4j
      console.log('Fetching user profile from Neo4j...');
      const fetchedUserProfile = await Neo4jUserService.getUserByEmail(result.user.email);
      console.log('Fetched user profile:', fetchedUserProfile);
      if (fetchedUserProfile) {
        const convertedProfile = convertNeo4jNodeToUserProfile(fetchedUserProfile);
        console.log('Converted profile:', convertedProfile);
        setUserProfile(convertedProfile);
      }
      
      toast({
        title: "Login Successful",
        description: "Redirecting to dashboard...",
      });
      // Redirect will be handled by the useEffect above
    } catch (err: any) {
      console.error("Neo4j login error:", err);
      let errorMessage = "Failed to login. Please check your credentials.";
      if (err.message === 'auth/user-not-found' || err.message === 'auth/wrong-password' || err.message === 'auth/invalid-credential') {
        errorMessage = "Invalid email or password.";
      } else if (err.message === 'auth/invalid-email') {
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

// Main page component with Suspense boundary
export default function AdminLoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <Card className="w-full max-w-sm shadow-xl">
          <CardContent className="p-6 text-center">
            <p>Loading...</p>
          </CardContent>
        </Card>
      </div>
    }>
      <AdminLoginForm />
    </Suspense>
  );
}