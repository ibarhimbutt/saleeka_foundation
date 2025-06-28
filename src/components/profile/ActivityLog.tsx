"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserActivity, formatDateTime } from '@/lib/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Activity, User, Settings, LogIn, UserPlus } from 'lucide-react';
import type { UserActivity } from '@/lib/firestoreTypes';

const getActivityIcon = (action: string) => {
  switch (action) {
    case 'profile_updated':
      return <User className="h-4 w-4" />;
    case 'settings_updated':
      return <Settings className="h-4 w-4" />;
    case 'login':
      return <LogIn className="h-4 w-4" />;
    case 'signup':
      return <UserPlus className="h-4 w-4" />;
    default:
      return <Activity className="h-4 w-4" />;
  }
};

const getActivityColor = (action: string) => {
  switch (action) {
    case 'profile_updated':
      return 'bg-blue-100 text-blue-800';
    case 'settings_updated':
      return 'bg-green-100 text-green-800';
    case 'login':
      return 'bg-purple-100 text-purple-800';
    case 'signup':
      return 'bg-orange-100 text-orange-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default function ActivityLog() {
  const { user } = useAuth();
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadActivities = async () => {
      if (user?.uid) {
        try {
          const userActivities = await getUserActivity(user.uid, 20);
          setActivities(userActivities);
        } catch (error) {
          console.error('Error loading activities:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadActivities();
  }, [user]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Recent Activity
        </CardTitle>
        <CardDescription>Your recent actions and account activity</CardDescription>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No recent activity found.</p>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg border">
                <div className={`p-2 rounded-full ${getActivityColor(activity.action)}`}>
                  {getActivityIcon(activity.action)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.description}
                    </p>
                    <Badge variant="outline" className="text-xs">
                      {activity.action.replace('_', ' ')}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDateTime(activity.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}