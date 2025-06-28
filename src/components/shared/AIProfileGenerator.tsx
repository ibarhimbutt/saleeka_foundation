"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Wand2, Loader2, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type AIProfileGeneratorProps = {
  userType: string;
  interests: string;
  onProfileGenerated: (profile: string) => void;
};

export default function AIProfileGenerator({ userType, interests, onProfileGenerated }: AIProfileGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedProfile, setGeneratedProfile] = useState<string>('');
  const { toast } = useToast();

  const generateProfile = async () => {
    if (!interests.trim()) {
      toast({
        title: "Interests Required",
        description: "Please add some interests or skills to generate a profile.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/generate-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userType,
          interests: interests.split(',').map(i => i.trim()),
        }),
      });

      const result = await response.json();

      if (response.ok && result.profile) {
        setGeneratedProfile(result.profile);
        onProfileGenerated(result.profile);
        toast({
          title: "Profile Generated!",
          description: "AI has created a personalized profile for you.",
        });
      } else {
        throw new Error(result.error || 'Failed to generate profile');
      }
    } catch (error: any) {
      console.error('Profile generation error:', error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const useGeneratedProfile = () => {
    onProfileGenerated(generatedProfile);
    toast({
      title: "Profile Applied",
      description: "The AI-generated profile has been added to your bio.",
    });
  };

  return (
    <Card className="border-accent/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-accent">
          <Wand2 className="h-5 w-5" />
          AI Profile Generator
        </CardTitle>
        <CardDescription>
          Let AI create a personalized profile based on your interests and role
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={generateProfile}
          disabled={isGenerating || !interests.trim()}
          className="w-full"
          variant="outline"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Wand2 className="mr-2 h-4 w-4" />
              Generate AI Profile
            </>
          )}
        </Button>

        {generatedProfile && (
          <div className="space-y-3">
            <Label>Generated Profile:</Label>
            <Textarea
              value={generatedProfile}
              readOnly
              className="min-h-[100px] bg-accent/5 border-accent/20"
            />
            <div className="flex gap-2">
              <Button onClick={useGeneratedProfile} size="sm">
                Use This Profile
              </Button>
              <Button onClick={generateProfile} size="sm" variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" />
                Regenerate
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}