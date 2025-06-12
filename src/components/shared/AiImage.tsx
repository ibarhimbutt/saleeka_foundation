
"use client";

import type React from 'react';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { generateIllustration, type GenerateIllustrationInput, type GenerateIllustrationOutput } from '@/ai/flows/generate-illustration-flow';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';
import { cn, sanitizePromptForClientCacheKey } from '@/lib/utils';

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
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    let isEffectMounted = true;
    const sanitizedPromptKey = sanitizePromptForClientCacheKey(prompt);
    const cacheKey = `ai-image-url-cache::${sanitizedPromptKey}`;

    const generateOrFetchUrl = async () => {
      try {
        const cachedUrl = localStorage.getItem(cacheKey);
        if (cachedUrl && isEffectMounted) {
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
        const input: GenerateIllustrationInput = { prompt: prompt }; // Send original prompt to flow
        const result: GenerateIllustrationOutput = await generateIllustration(input);
        
        if (isEffectMounted) {
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
            const flowErrorLower = flowError.toLowerCase();
            if (flowErrorLower.includes('rate limit') || flowErrorLower.includes('quota')) {
              console.warn(`AiImage: Rate limit for prompt "${prompt}". Using fallback. Flow message: ${flowError}`);
            } else if (flowErrorLower.includes('model') && (flowErrorLower.includes('not found') || flowErrorLower.includes('inaccessible'))) {
              console.warn(`AiImage: Model not found/inaccessible for prompt "${prompt}". Using fallback. Flow message: ${flowError}`);
            }
            else {
              console.error(`AiImage: Error for prompt "${prompt}". Using fallback. Flow message: ${flowError}`);
            }
          }
        }
      } catch (e: any) { 
        const errorMessage = e instanceof Error ? e.message : String(e);
        console.error(`AiImage: Unexpected error calling generateIllustration flow for prompt "${prompt}":`, errorMessage, e);
        if (isEffectMounted) {
          setError("Failed to communicate with image generation service.");
        }
      } finally {
        if (isEffectMounted) {
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
      isEffectMounted = false;
    };
  }, [prompt, isMounted]); // Added isMounted to dependency array

  if (!isMounted) {
    // Render skeleton or null on the server or before hydration to avoid mismatches
    return (
      <Skeleton 
        className={cn("bg-muted/30", className)} 
        style={{ width: `${width}px`, height: `${height}px` }} 
        aria-label={`Loading image for ${alt}`}
      />
    );
  }

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
      onError={() => { 
        if (isMounted && finalSrc !== fallbackImageUrl && fallbackImageUrl) { 
            console.warn(`AiImage: Next/Image failed to load src: "${finalSrc}". Attempting fallback for prompt: "${prompt}".`);
            setError("Image source failed to load, using fallback."); 
            setImageUrlToDisplay(null); 
        } else if (isMounted && finalSrc === fallbackImageUrl && fallbackImageUrl) {
            console.error(`AiImage: Fallback image also failed to load for prompt "${prompt}": ${fallbackImageUrl}`);
            setError("Fallback image also failed to load.");
        } else if (isMounted && !fallbackImageUrl) {
            console.error(`AiImage: Image failed to load and no fallback available for prompt: "${prompt}"`);
            setError("Image source failed to load, no fallback.");
        }
      }}
    />
  );
};

export default AiImage;
