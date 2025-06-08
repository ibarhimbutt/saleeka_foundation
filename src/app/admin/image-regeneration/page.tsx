
"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AiImage from '@/components/shared/AiImage';
import { Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AdminImageRegenerationPage() {
  const [prompt, setPrompt] = useState<string>('');
  const [imageKey, setImageKey] = useState<string>(Date.now().toString()); // Used to force AiImage re-render
  const [isLoading, setIsLoading] = useState(false);
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

    setIsLoading(true);

    // Clear client-side cache for this prompt
    const cacheKey = `ai-image-url-cache::${prompt.toLowerCase().replace(/\s+/g, '-')}`;
    try {
      localStorage.removeItem(cacheKey);
      toast({
        title: "Cache Cleared",
        description: `Local cache for prompt "${prompt}" cleared. Regenerating...`,
      });
    } catch (e) {
      console.warn("Failed to clear localStorage item:", e);
      // Continue even if localStorage fails
    }
    
    // Trigger AiImage re-render by changing its key.
    // AiImage will then call the flow because its local cache for this prompt is gone.
    setImageKey(Date.now().toString() + prompt); 

    // Note: isLoading is primarily for the button. AiImage has its own internal loading state.
    // We'll set a timeout to turn off this page's isLoading, 
    // assuming generation won't take extremely long.
    setTimeout(() => {
        setIsLoading(false);
    }, 5000); // Reset loading state after 5 seconds
  };

  return (
    <div className="space-y-6">
      <CardHeader className="p-0">
        <CardTitle className="font-headline text-2xl text-primary">Image Regeneration</CardTitle>
        <CardDescription>
          Enter a prompt to regenerate an AI image. This will clear any client-side cache for the prompt and request a new image from the generation service.
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
            {isLoading ? 'Regenerating...' : 'Regenerate Image'}
          </Button>
        </CardContent>
      </Card>

      {prompt && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Image</CardTitle>
            <CardDescription>
              Displaying image for prompt: &quot;{prompt}&quot;. This may take a moment to load if it&apos;s a new generation.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center items-center">
            {/* 
              The AiImage component will be re-mounted when imageKey changes.
              It will then attempt to load from its localStorage cache.
              Since we cleared the cache item for 'prompt', it will call the generation flow.
            */}
            <AiImage
              key={imageKey} // Crucial for re-triggering AiImage
              prompt={prompt}
              alt={`AI-generated image for: ${prompt}`}
              width={500}
              height={300}
              className="rounded-md border shadow-md"
              fallbackImageUrl="https://placehold.co/500x300.png"
              imageClassName="object-contain"
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
