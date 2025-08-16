"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { apiService } from '@/lib/api';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { formatRelativeTime, formatActionName } from '@/lib/utils';
import type { UserActivity } from '@/lib/firestoreTypes';

export default function ActivityLog() {
  const { user } = useAuth();
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadActivities = async () => {
      
      if (user?.uid) {
        try {
          const response = await apiService.getUserActivities(user.uid, 20);
          if (response.success && response.activities) {
            setActivities(response.activities);
          } else {
            setActivities([]);
          }
        } catch (error) {
          console.error('Error loading activities:', error);
          setActivities([]);
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
          <LoadingSpinner size="lg" text="Loading activities..." />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Your recent actions and updates on the platform.</CardDescription>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No recent activity to display.</p>
            <p className="text-sm">Start using the platform to see your activity here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity, index) => (
              <div key={activity.id || index} className="flex items-start gap-3 p-3 rounded-lg border">
                <div className="flex-1 space-y-1">
                                     <div className="flex items-center gap-2">
                     <span className="font-medium text-sm">{activity.action}</span>
                     <Badge variant="secondary" className="text-xs">
                       {formatActionName(activity.action)}
                     </Badge>
                   </div>
                   <p className="text-sm text-muted-foreground">{activity.description}</p>
                   <div className="flex items-center gap-2 text-xs text-muted-foreground">
                     <span>{formatRelativeTime(activity.createdAt)}</span>
                     {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                       <span>• Additional details available</span>
                     )}
                   </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}