
"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AiImage from '@/components/shared/AiImage'; // AiImage will now use the new API route internally
import { Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { sanitizePromptForClientCacheKey } from '@/lib/utils';

export default function AdminImageRegenerationPage() {
  const [prompt, setPrompt] = useState<string>('');
  const [imageKey, setImageKey] = useState<string>(Date.now().toString()); // Used to force AiImage re-render
  const [isLoading, setIsLoading] = useState(false); // For the button's loading state
  const { toast } = useToast();

  const handleRegenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Prompt Required",
        description: "Please enter a prompt for the image.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true); // Indicate that the "Regenerate Image" button action is in progress

    // Clear client-side cache for this prompt. AiImage will do this too, but good practice.
    const sanitizedPromptKey = sanitizePromptForClientCacheKey(prompt);
    const cacheKey = `ai-image-url-cache::${sanitizedPromptKey}`;
    try {
      localStorage.removeItem(cacheKey);
      toast({
        title: "Local Cache Cleared",
        description: `Local cache for prompt "${prompt.substring(0,30)}..." (key: ${sanitizedPromptKey}) cleared. Requesting regeneration...`,
      });
    } catch (e) {
      console.warn("Failed to clear localStorage item:", e);
    }
    
    // The AiImage component will be re-mounted when imageKey changes.
    // Since its localStorage cache is cleared, it will call the /api/generate-image route.
    // The API route itself handles server-side cache and actual OpenAI generation.
    setImageKey(Date.now().toString() + prompt); 

    // The API call is made within AiImage. We don't need a direct API call here.
    // We set isLoading for the button itself. AiImage has its own internal loading state visible via Skeleton.
    // Reset button loading state after a short delay, assuming AiImage will pick up loading.
    setTimeout(() => {
        setIsLoading(false);
        // Toast for initiation. AiImage will show its own error/success via UI changes.
        toast({
            title: "Regeneration Requested",
            description: `Image regeneration for "${prompt.substring(0,30)}..." has been initiated.`
        });
    }, 1000); 
  };

  return (
    <div className="space-y-6">
      <CardHeader className="p-0">
        <CardTitle className="font-headline text-2xl text-primary">Image Regeneration</CardTitle>
        <CardDescription>
          Enter a prompt to regenerate an AI image. This will clear any client-side cache for the prompt and request a new image from the generation service (via /api/generate-image). The API service now uses Google GenAI (Gemini) and returns a data URL.
        </CardDescription>
      </CardHeader>

      <Card>
        <CardHeader>
          <CardTitle>Enter Prompt</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="image-prompt">Image Prompt</Label>
            <Input
              id="image-prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., a futuristic cityscape at dusk"
            />
          </div>
          <Button onClick={handleRegenerate} disabled={isLoading || !prompt.trim()}>
            <Wand2 className="mr-2 h-4 w-4" />
            {isLoading ? 'Requesting...' : 'Regenerate Image'}
          </Button>
        </CardContent>
      </Card>

      {prompt && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Image Display</CardTitle>
            <CardDescription>
              Displaying image for prompt: &quot;{prompt}&quot;. This will use the standard AiImage component which fetches via /api/generate-image.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center items-center">
            <AiImage
              key={imageKey} // Crucial for re-triggering AiImage to fetch
              prompt={prompt}
              alt={`AI-generated image for: ${prompt}`}
              width={500}
              height={300}
              className="rounded-md border shadow-md"
              fallbackImageUrl="https://placehold.co/500x300.png" // Standard fallback
              imageClassName="object-contain"
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
