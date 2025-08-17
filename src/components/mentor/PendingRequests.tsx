"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Clock, User, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PendingRequest {
  student: {
    uid: string;
    displayName?: string;
    email?: string;
    photoURL?: string;
  };
  studentProfile: {
    interests?: string[];
    skills?: string[];
    currentProgram?: string;
    graduationYear?: number;
    bio?: string;
    displayName?: string;
    email?: string;
  };
  user: {
    displayName: string;
    email: string;
    photoURL?: string;
    bio?: string;
  };
  relationship: {
    startDate: string;
    goals: string[];
    notes: string[];
  };
}

interface PendingRequestsProps {
  mentorUid: string;
}

export default function PendingRequests({ mentorUid }: PendingRequestsProps) {
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchPendingRequests();
  }, [mentorUid]);

  const fetchPendingRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/mentorship/pending-requests?mentorUid=${mentorUid}`);
      const data = await response.json();
      
      if (data.success) {
        setPendingRequests(data.pendingRequests || []);
      } else {
        console.error('Failed to fetch pending requests:', data.error);
        setPendingRequests([]);
      }
    } catch (error) {
      console.error('Error fetching pending requests:', error);
      setPendingRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (studentUid: string, action: 'accept' | 'reject') => {
    setResponding(studentUid);
    try {
      const response = await fetch('/api/mentorship/respond', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentUid,
          mentorUid,
          action,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success!",
          description: data.message,
        });
        
        // Remove the request from the list
        setPendingRequests(prev => prev.filter(req => req.student.uid !== studentUid));
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to respond to request",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error responding to request:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setResponding(null);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Unknown date';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (pendingRequests.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Pending Requests</h3>
            <p className="text-muted-foreground">
              You don't have any pending mentorship requests at the moment.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-primary">Pending Mentorship Requests</h3>
      {pendingRequests.map((request) => (
        <Card key={request.student.uid} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={request.user.photoURL} alt={request.user.displayName} />
                  <AvatarFallback className="text-sm font-semibold">
                    {getInitials(request.user.displayName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-base">{request.user.displayName}</CardTitle>
                  <p className="text-sm text-muted-foreground">{request.user.email}</p>
                  <p className="text-xs text-muted-foreground">
                    Requested: {formatDate(request.relationship.startDate)}
                  </p>
                </div>
              </div>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Pending
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {request.user.bio && (
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {request.user.bio}
              </p>
            )}
            
            <div className="flex flex-wrap gap-2 mb-4">
              {request.studentProfile?.interests?.slice(0, 3).map((interest: string) => (
                <Badge key={interest} variant="outline" className="text-xs">
                  {interest}
                </Badge>
              ))}
              {request.studentProfile?.skills?.slice(0, 3).map((skill: string) => (
                <Badge key={skill} variant="outline" className="text-xs">
                  {skill}
                </Badge>
              ))}
              {(!request.studentProfile?.interests || request.studentProfile.interests.length === 0) && 
               (!request.studentProfile?.skills || request.studentProfile.skills.length === 0) && (
                <span className="text-xs text-muted-foreground">No interests or skills listed</span>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                className="flex-1 bg-green-600 hover:bg-green-700"
                onClick={() => handleRespond(request.student.uid, 'accept')}
                disabled={responding === request.student.uid}
              >
                {responding === request.student.uid ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                Accept
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1 text-red-600 border-red-600 hover:bg-red-50"
                onClick={() => handleRespond(request.student.uid, 'reject')}
                disabled={responding === request.student.uid}
              >
                {responding === request.student.uid ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <XCircle className="h-4 w-4 mr-2" />
                )}
                Reject
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
