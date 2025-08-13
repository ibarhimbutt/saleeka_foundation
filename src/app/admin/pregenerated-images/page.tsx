
"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, CheckCircle, AlertTriangle, ExternalLink, Image as ImageIconLucide } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { adminPredefinedImages, type AdminImageData } from '@/lib/admin-image-data';
import { sanitizePromptForClientCacheKey } from '@/lib/utils';
import Link from 'next/link';

type GenerationStatus = {
  status: 'idle' | 'loading' | 'success' | 'error';
  message?: string;
  imageUrl?: string | null;
  provider?: string; // Could be 'openai_dall-e-3' or 'cache-firestore' from API
  cachedByApi?: boolean;
};

export default function AdminPregeneratedImagesPage() {
  const { toast } = useToast();
  const [generationStates, setGenerationStates] = useState<Record<string, GenerationStatus>>(
    adminPredefinedImages.reduce((acc, img) => {
      acc[img.id] = { status: 'idle' };
      return acc;
    }, {} as Record<string, GenerationStatus>)
  );

  const handleGenerateImage = async (image: AdminImageData) => {
    // Clear client-side cache for this prompt before making the API call
    const sanitizedClientKey = sanitizePromptForClientCacheKey(image.prompt);
    const cacheKey = `ai-image-url-cache::${sanitizedClientKey}`;
    try {
        localStorage.removeItem(cacheKey);
        console.log(`AdminPregen: Cleared localStorage for ${cacheKey}`);
    } catch (e) {
        console.warn("AdminPregen: Failed to clear localStorage item:", e);
    }

    setGenerationStates(prev => ({
      ...prev,
      [image.id]: { status: 'loading', message: "Requesting from /api/generate-image..." }
    }));

    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: image.prompt }),
      });

      const result = await response.json();

      if (response.ok && result.imageUrl) {
        setGenerationStates(prev => ({
          ...prev,
          [image.id]: {
            status: 'success',
            imageUrl: result.imageUrl,
            provider: 'google_gemini_via_api',
            message: 'Generated via API (Gemini)',
            cachedByApi: false,
          }
        }));
        toast({
          title: "Image Processed by API",
          description: `Successfully processed image for: ${image.prompt.substring(0, 30)}...`,
        });
      } else {
        setGenerationStates(prev => ({
          ...prev,
          [image.id]: { status: 'error', message: result.error || "API generation failed with no error message.", imageUrl: null }
        }));
        toast({
          title: "API Generation Failed",
          description: result.error || `Failed to generate image via API for: ${image.prompt.substring(0, 30)}...`,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error(`AdminPregen: Error calling /api/generate-image for prompt "${image.prompt}":`, error);
      const errorMessage = error.message || "An unexpected error occurred contacting the API.";
      setGenerationStates(prev => ({
        ...prev,
        [image.id]: { status: 'error', message: errorMessage, imageUrl: null }
      }));
      toast({
        title: "API Call Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };
  
  const clearAllClientCache = () => {
    let clearedCount = 0;
    let failedCount = 0;
    adminPredefinedImages.forEach(image => {
        const sanitizedClientKey = sanitizePromptForClientCacheKey(image.prompt);
        const cacheKey = `ai-image-url-cache::${sanitizedClientKey}`;
        try {
            if (localStorage.getItem(cacheKey)) {
                localStorage.removeItem(cacheKey);
                clearedCount++;
            }
        } catch (e) {
            console.warn(`Failed to clear localStorage for ${cacheKey}:`, e);
            failedCount++;
        }
    });
    toast({
        title: "Client Cache Cleared",
        description: `Successfully cleared ${clearedCount} item(s) from client-side localStorage. ${failedCount > 0 ? `Failed to clear ${failedCount} item(s).` : ''}`,
    });
  };

  return (
    <div className="space-y-6">
      <CardHeader className="p-0">
        <CardTitle className="font-headline text-2xl text-primary">Predefined Image Management (via API)</CardTitle>
        <CardDescription>
          View and trigger generation for predefined AI images using the /api/generate-image route.
          This API now uses Google GenAI (Gemini) for image generation and returns the image as a data URL.
        </CardDescription>
      </CardHeader>

      <div className="mb-4">
        <Button onClick={clearAllClientCache} variant="outline">
          Clear All Client-Side Image Caches
        </Button>
        <p className="text-xs text-muted-foreground mt-1">
            This clears `localStorage` entries for `AiImage` components. Regeneration via API is separate.
        </p>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Image ID (Key)</TableHead>
                <TableHead>AI Prompt</TableHead>
                <TableHead className="w-[100px]">Size (WxH)</TableHead>
                <TableHead>Source Context</TableHead>
                <TableHead className="w-[200px]">Status</TableHead>
                <TableHead className="text-right w-[120px]">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {adminPredefinedImages.map((image) => {
                const state = generationStates[image.id] || { status: 'idle' };
                return (
                  <TableRow key={image.id}>
                    <TableCell className="font-mono text-xs break-all">{image.id}</TableCell>
                    <TableCell className="text-sm">{image.prompt}</TableCell>
                    <TableCell className="text-sm">{image.width}x{image.height}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{image.sourceContext}</TableCell>
                    <TableCell>
                      {state.status === 'idle' && <span className="text-xs text-muted-foreground">Idle</span>}
                      {state.status === 'loading' && <div className="flex items-center text-xs text-blue-500"><Loader2 className="mr-1 h-3 w-3 animate-spin" /> {state.message || "Generating..."}</div>}
                      {state.status === 'success' && (
                        <div className="text-xs text-green-600">
                          <div className="flex items-center"><CheckCircle className="mr-1 h-3 w-3" /> Success!</div>
                          {state.imageUrl && (
                            <Link href={state.imageUrl} target="_blank" rel="noopener noreferrer" className="flex items-center hover:underline text-blue-500">
                              View Image <ExternalLink className="ml-1 h-3 w-3" />
                            </Link>
                          )}
                           {state.provider && <span className="text-muted-foreground text-[10px]">({state.provider})</span>}
                           {state.cachedByApi !== undefined && <span className="text-muted-foreground text-[10px]">{state.cachedByApi ? " (API Cache Hit)" : " (New via API)"}</span>}
                        </div>
                      )}
                      {state.status === 'error' && (
                        <div className="text-xs text-red-600">
                           <div className="flex items-center"><AlertTriangle className="mr-1 h-3 w-3" /> Error</div>
                           <p className="truncate" title={state.message}>{state.message?.substring(0,50)}...</p>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleGenerateImage(image)}
                        disabled={state.status === 'loading'}
                      >
                        {state.status === 'loading' ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIconLucide className="h-4 w-4" />}
                         <span className="ml-1">Generate</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      {adminPredefinedImages.length === 0 && (
        <p className="text-center text-muted-foreground py-8">No predefined images found in the data.</p>
      )}
    </div>
  );
}
