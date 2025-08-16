"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Loader2, UserCircle, Briefcase, Settings, Users, Activity, Calendar, BookOpen } from 'lucide-react';

// Utility function to format timestamp
const formatTimestamp = (timestamp: any): string => {
  if (!timestamp) return 'Unknown';
  
  try {
    const date = new Date(timestamp);
    return date.toLocaleDateString();
  } catch (error) {
    return 'Invalid date';
  }
};

export default function MySaleekaPage() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/admin/login?redirect=/my-saleeka');
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
    return (
      <div className="flex min-h-[calc(100vh-200px)] flex-col items-center justify-center text-center">
        <p className="mb-4">You need to be logged in to access this page.</p>
        <Button asChild>
          <Link href="/admin/login?redirect=/my-saleeka">Go to Login</Link>
        </Button>
      </div>
    );
  }

  const greetingName = userProfile.displayName || userProfile.firstName || user.email;
  const userTypeDisplay = userProfile.type ? userProfile.type.charAt(0).toUpperCase() + userProfile.type.slice(1) : 'User';

  return (
    <div className="container mx-auto py-8 space-y-8">
      <header className="mb-8">
        <h1 className="font-headline text-3xl font-bold text-primary">My Saleeka Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {greetingName}! ({userTypeDisplay})</p>
        {userProfile.createdAt && (
          <p className="text-sm text-muted-foreground">Member since {formatTimestamp(userProfile.createdAt)}</p>
        )}
      </header>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Profile Completion</p>
                <p className="text-2xl font-bold">
                  {userProfile.bio && userProfile.interests?.length ? '85%' : '45%'}
                </p>
              </div>
              <UserCircle className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Connections</p>
                <p className="text-2xl font-bold">12</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Projects</p>
                <p className="text-2xl font-bold">3</p>
              </div>
              <Briefcase className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Events</p>
                <p className="text-2xl font-bold">2</p>
              </div>
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Profile</CardTitle>
            <UserCircle className="h-5 w-5 text-accent" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-2">View and update your personal information.</p>
            <Button asChild variant="outline" size="sm">
              <Link href="/my-saleeka/settings">Manage Profile</Link>
            </Button>
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
            <p className="text-xs text-muted-foreground mb-2">Manage your notification preferences and privacy.</p>
            <Button asChild variant="outline" size="sm">
              <Link href="/my-saleeka/settings">Settings</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activity Log</CardTitle>
            <Activity className="h-5 w-5 text-accent" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-2">View your recent account activity and actions.</p>
            <Button asChild variant="outline" size="sm">
              <Link href="/my-saleeka/activity">View Activity</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Learning Resources</CardTitle>
            <BookOpen className="h-5 w-5 text-accent" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-2">Access courses, tutorials, and learning materials.</p>
            <Button variant="outline" size="sm" disabled>Resources (Soon)</Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
            <Calendar className="h-5 w-5 text-accent" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-2">View upcoming workshops, webinars, and networking events.</p>
            <Button variant="outline" size="sm" disabled>Events (Soon)</Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Section */}
      <section className="mt-12">
        <h2 className="font-headline text-2xl font-semibold mb-4 text-primary">Recent Updates</h2>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="p-2 rounded-full bg-blue-100 text-blue-800">
                  <UserCircle className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Welcome to Saleeka Foundation!</p>
                  <p className="text-xs text-muted-foreground">Complete your profile to get personalized recommendations</p>
                </div>
              </div>
              
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">More activity will appear here as you use the platform</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}