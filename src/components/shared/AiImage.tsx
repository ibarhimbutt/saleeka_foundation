
"use client";

import type React from 'react';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { generateIllustration, type GenerateIllustrationInput, type GenerateIllustrationOutput } from '@/ai/flows/generate-illustration-flow';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

type AiImageProps = {
  prompt: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  fallbackImageUrl?: string; 
  imageClassName?: string; 
};

const AiImage: React.FC<AiImageProps> = ({
  prompt,
  alt,
  width,
  height,
  className,
  fallbackImageUrl,
  imageClassName,
}) => {
  const [imageUrlToDisplay, setImageUrlToDisplay] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const cacheKey = `ai-image-url-cache::${prompt.toLowerCase().replace(/\s+/g, '-')}`;

    const generateOrFetchUrl = async () => {
      try {
        const cachedUrl = localStorage.getItem(cacheKey);
        if (cachedUrl && isMounted) {
          setImageUrlToDisplay(cachedUrl);
          setIsLoading(false);
          return;
        }
      } catch (e) {
        console.warn("AiImage: Failed to read image URL from localStorage:", e);
      }

      setIsLoading(true);
      setError(null);

      try {
        const input: GenerateIllustrationInput = { prompt: prompt };
        const result: GenerateIllustrationOutput = await generateIllustration(input);
        
        if (isMounted) {
          if (result.imageUrl) {
            setImageUrlToDisplay(result.imageUrl);
            try {
              localStorage.setItem(cacheKey, result.imageUrl);
            } catch (e) {
              console.warn("AiImage: Failed to write image URL to localStorage:", e);
            }
          } else {
            const flowError = result.error || "Image generation flow returned no image URL.";
            setError(flowError);
            if (flowError.toLowerCase().includes('rate limit')) {
              console.warn(`AiImage: Rate limit for prompt "${prompt}". Using fallback. Flow message: ${flowError}`);
            } else {
              console.error(`AiImage: Error for prompt "${prompt}". Using fallback. Flow message: ${flowError}`);
            }
          }
        }
      } catch (e: any) { 
        // This catch block is for unexpected errors from the flow call itself (e.g. network issue to flow)
        const errorMessage = e instanceof Error ? e.message : String(e);
        console.error(`AiImage: Unexpected error calling generateIllustration flow for prompt "${prompt}":`, errorMessage, e);
        if (isMounted) {
          setError("Failed to communicate with image generation service.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    if (prompt && prompt.trim() !== "") {
      generateOrFetchUrl();
    } else {
      setIsLoading(false);
      if (!fallbackImageUrl) {
          setError("No prompt provided for image generation.");
      } else {
        setImageUrlToDisplay(fallbackImageUrl);
      }
    }
    
    return () => {
      isMounted = false;
    };
  }, [prompt]); // Re-run if prompt changes. FallbackImageUrl, width, height, etc., are assumed stable for a given prompt.

  if (isLoading) {
    return (
      <Skeleton 
        className={cn("bg-muted/30", className)} 
        style={{ width: `${width}px`, height: `${height}px` }} 
        aria-label={`Loading image for ${alt}`}
      />
    );
  }

  const finalSrc = error ? fallbackImageUrl : (imageUrlToDisplay || fallbackImageUrl);

  if (!finalSrc) {
     return (
      <div 
        className={cn(
          "flex flex-col items-center justify-center bg-destructive/10 text-destructive border border-destructive rounded-md p-2",
          className
        )} 
        style={{ width: `${width}px`, height: `${height}px` }}
        role="alert"
        aria-live="polite"
      >
        <AlertCircle className="w-6 h-6 mb-1" />
        <p className="text-xs text-center">{alt}: {error || "Image not available"}</p>
      </div>
    );
  }

  return (
    <Image
      src={finalSrc}
      alt={alt}
      width={width}
      height={height}
      className={cn(className, imageClassName)}
      data-ai-source={error ? "error-or-fallback" : (imageUrlToDisplay === fallbackImageUrl && !imageUrlToDisplay?.startsWith('data:') ? "fallback-direct" : (imageUrlToDisplay ? "ai-generated-or-cached" : "fallback-implicit"))}
      unoptimized={finalSrc.startsWith('data:')} 
      onError={(e) => {
        // This Next/Image onError handles issues with the finalSrc itself (e.g. broken URL)
        if (isMounted && imageUrlToDisplay !== fallbackImageUrl && finalSrc !== fallbackImageUrl) { 
            console.warn(`AiImage: Next/Image failed to load src: "${finalSrc}". Attempting fallback for prompt: "${prompt}".`);
            setError("Image source failed to load."); 
            setImageUrlToDisplay(null); 
        } else if (isMounted && finalSrc === fallbackImageUrl && fallbackImageUrl) {
            // If even the fallback fails to load, log it.
            console.error(`AiImage: Fallback image also failed to load for prompt "${prompt}": ${fallbackImageUrl}`);
            setError("Fallback image also failed to load.");
        }
      }}
    />
  );
};

export default AiImage;
