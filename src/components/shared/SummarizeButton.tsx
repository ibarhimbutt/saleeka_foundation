"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { summarizeContent, type SummarizeContentInput } from '@/ai/flows/summarize-content';
import { Wand2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

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

  const handleSummarize = async () => {
    setIsLoading(true);
    setError(null);
    setSummary(null);
    try {
      const input: SummarizeContentInput = { content: contentToSummarize };
      const result = await summarizeContent(input);
      setSummary(result.summary);
    } catch (e) {
      console.error("Error summarizing content:", e);
      setError("Failed to generate summary. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 my-4">
      <Button onClick={handleSummarize} disabled={isLoading} className="gap-2">
        <Wand2 size={18} />
        {isLoading ? "Summarizing..." : buttonText}
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
            <p className="text-sm text-foreground">{summary}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
