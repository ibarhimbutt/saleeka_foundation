"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { summarizeContent, type SummarizeContentInput } from '@/lib/ai-utils';
import { Wand2, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { useToast } from '@/hooks/use-toast';

type SummarizeButtonProps = {
  contentToSummarize: string;
  buttonText?: string;
  label?: string;
};

export default function SummarizeButton({ 
  contentToSummarize, 
  buttonText = "Summarize with AI",
  label = "AI Summary" 
}: SummarizeButtonProps) {
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSummarize = async () => {
    if (!contentToSummarize || contentToSummarize.trim().length === 0) {
      toast({
        title: "No Content",
        description: "There's no content to summarize.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    setSummary(null);
    
    try {
      console.log('SummarizeButton: Starting summarization...');
      const input: SummarizeContentInput = { content: contentToSummarize };
      const result = await summarizeContent(input);
      
      setSummary(result.summary);
      toast({
        title: "Summary Generated",
        description: "AI summary has been generated successfully!",
      });
      console.log('SummarizeButton: Summary generated successfully');
    } catch (e: any) {
      const errorMessage = e.message || "Failed to generate summary. Please try again.";
      console.error("SummarizeButton: Error summarizing content:", e);
      setError(errorMessage);
      toast({
        title: "Summarization Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 my-4">
      <Button 
        onClick={handleSummarize} 
        disabled={isLoading || !contentToSummarize?.trim()} 
        className="gap-2"
        variant="outline"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Wand2 className="h-4 w-4" />
        )}
        {isLoading ? "Generating Summary..." : buttonText}
      </Button>
      
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {summary && (
        <Card className="bg-accent/10 border-accent">
          <CardHeader>
            <CardTitle className="text-accent font-headline flex items-center gap-2">
              <Wand2 size={20} /> {label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground leading-relaxed">{summary}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}