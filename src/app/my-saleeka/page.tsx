
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Loader2, UserCircle, Briefcase, Settings } from 'lucide-react';

export default function MySaleekaPage() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/admin/login?redirect=/my-saleeka'); // Redirect to login if not authenticated
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-200px)] items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !userProfile) {
    // This case should ideally be handled by the redirect, but as a fallback:
    return (
        <div className="flex min-h-[calc(100vh-200px)] flex-col items-center justify-center text-center">
            <p className="mb-4">You need to be logged in to access this page.</p>
            <Button asChild>
                <Link href="/admin/login?redirect=/my-saleeka">Go to Login</Link>
            </Button>
      </div>
    );
  }

  // Placeholder content - customize based on user type/role if needed
  const greetingName = userProfile.displayName || user.email;
  const userTypeDisplay = userProfile.type ? userProfile.type.charAt(0).toUpperCase() + userProfile.type.slice(1) : 'User';


  return (
    <div className="container mx-auto py-8 space-y-8">
      <header className="mb-8">
        <h1 className="font-headline text-3xl font-bold text-primary">My Saleeka Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {greetingName}! ({userTypeDisplay})</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Profile</CardTitle>
            <UserCircle className="h-5 w-5 text-accent" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-2">View and update your personal information.</p>
            <Button variant="outline" size="sm" disabled>View Profile (Soon)</Button>
          </CardContent>
        </Card>

        {userProfile.type === 'student' && (
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">My Projects</CardTitle>
              <Briefcase className="h-5 w-5 text-accent" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-2">Track your project applications and progress.</p>
              <Button variant="outline" size="sm" disabled>My Projects (Soon)</Button>
            </CardContent>
          </Card>
        )}

        {userProfile.type === 'professional' && (
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mentorships</CardTitle>
              <Users className="h-5 w-5 text-accent" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-2">Manage your mentee connections and availability.</p>
              <Button variant="outline" size="sm" disabled>My Mentees (Soon)</Button>
            </CardContent>
          </Card>
        )}
         
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Account Settings</CardTitle>
            <Settings className="h-5 w-5 text-accent" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-2">Manage your notification preferences and password.</p>
            <Button variant="outline" size="sm" disabled>Settings (Soon)</Button>
          </CardContent>
        </Card>
      </div>

      <section className="mt-12">
        <h2 className="font-headline text-2xl font-semibold mb-4 text-primary">Announcements & Updates</h2>
        <Card>
            <CardContent className="pt-6">
                <p className="text-muted-foreground">No new announcements at this time. Check back later!</p>
            </CardContent>
        </Card>
      </section>

    </div>
  );
}
