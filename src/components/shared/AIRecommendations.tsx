"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type Recommendations = {
  programs: string[];
  skills: string[];
  mentorship: string[];
  projects: string[];
};

type AIRecommendationsProps = {
  userType: string;
  interests: string;
  bio?: string;
};

export default function AIRecommendations({ userType, interests, bio }: AIRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Recommendations | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchRecommendations = async () => {
    if (!interests.trim()) return;

    setIsLoading(true);
    
    try {
      const response = await fetch('/api/ai-recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userType,
          interests: interests.split(',').map(i => i.trim()),
          bio,
        }),
      });

      const result = await response.json();

      if (response.ok && result.recommendations) {
        setRecommendations(result.recommendations);
      } else {
        throw new Error(result.error || 'Failed to get recommendations');
      }
    } catch (error: any) {
      console.error('Recommendations error:', error);
      toast({
        title: "Failed to Load Recommendations",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (interests.trim() && userType !== 'unclassified') {
      fetchRecommendations();
    }
  }, [userType, interests, bio]);

  if (!interests.trim() || userType === 'unclassified') {
    return null;
  }

  return (
    <Card className="border-accent/20 bg-gradient-to-br from-accent/5 to-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-accent">
          <Sparkles className="h-5 w-5" />
          AI Recommendations
        </CardTitle>
        <CardDescription>
          Personalized suggestions based on your profile
        </CardDescription>
        <Button
          onClick={fetchRecommendations}
          size="sm"
          variant="outline"
          className="w-fit"
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
          </div>
        ) : recommendations ? (
          <div className="space-y-4">
            {recommendations.programs && recommendations.programs.length > 0 && (
              <div>
                <h4 className="font-medium text-sm text-primary mb-2">Recommended Programs</h4>
                <div className="flex flex-wrap gap-2">
                  {recommendations.programs.map((program, index) => (
                    <Badge key={index} variant="secondary">{program}</Badge>
                  ))}
                </div>
              </div>
            )}

            {recommendations.skills && recommendations.skills.length > 0 && (
              <div>
                <h4 className="font-medium text-sm text-primary mb-2">Skills to Develop</h4>
                <div className="flex flex-wrap gap-2">
                  {recommendations.skills.map((skill, index) => (
                    <Badge key={index} variant="outline">{skill}</Badge>
                  ))}
                </div>
              </div>
            )}

            {recommendations.mentorship && recommendations.mentorship.length > 0 && (
              <div>
                <h4 className="font-medium text-sm text-primary mb-2">Mentorship Opportunities</h4>
                <div className="flex flex-wrap gap-2">
                  {recommendations.mentorship.map((area, index) => (
                    <Badge key={index} variant="secondary">{area}</Badge>
                  ))}
                </div>
              </div>
            )}

            {recommendations.projects && recommendations.projects.length > 0 && (
              <div>
                <h4 className="font-medium text-sm text-primary mb-2">Project Types</h4>
                <div className="flex flex-wrap gap-2">
                  {recommendations.projects.map((project, index) => (
                    <Badge key={index} variant="outline">{project}</Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            Add your interests to get personalized recommendations
          </p>
        )}
      </CardContent>
    </Card>
  );
}