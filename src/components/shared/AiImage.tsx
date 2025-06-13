
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
    console.log(`AiImage (${alt}): Component mounted. Initial isMounted: false.`);
    setIsMounted(true);
  }, [alt]);

  useEffect(() => {
    if (!isMounted) {
      console.log(`AiImage (${alt}): Effect run but isMounted is false. Skipping fetch.`);
      return;
    }
    console.log(`AiImage (${alt}): Effect run, isMounted is true. Prompt: "${prompt}"`);

    let isEffectMounted = true;
    const sanitizedPromptKey = sanitizePromptForClientCacheKey(prompt);
    const cacheKey = `ai-image-url-cache::${sanitizedPromptKey}`;
    console.log(`AiImage (${alt}): Using cacheKey: "${cacheKey}"`);

    const generateOrFetchUrl = async () => {
      try {
        const cachedUrl = localStorage.getItem(cacheKey);
        if (cachedUrl && isEffectMounted) {
          console.log(`AiImage (${alt}): Cache hit for key "${cacheKey}". URL: ${cachedUrl.substring(0, 60)}...`);
          setImageUrlToDisplay(cachedUrl);
          setIsLoading(false);
          return;
        }
        console.log(`AiImage (${alt}): Cache miss for key "${cacheKey}".`);
      } catch (e) {
        console.warn(`AiImage (${alt}): Failed to read image URL from localStorage for key "${cacheKey}":`, e);
      }

      setIsLoading(true);
      setError(null);
      console.log(`AiImage (${alt}): Calling generateIllustration flow for prompt: "${prompt}"`);

      try {
        const input: GenerateIllustrationInput = { prompt: prompt };
        const result: GenerateIllustrationOutput = await generateIllustration(input);
        console.log(`AiImage (${alt}): Flow result for prompt "${prompt}":`, JSON.stringify(result));

        if (isEffectMounted) {
          if (result.imageUrl) {
            console.log(`AiImage (${alt}): Flow success. Image URL: ${result.imageUrl.substring(0,60)}...`);
            setImageUrlToDisplay(result.imageUrl);
            try {
              localStorage.setItem(cacheKey, result.imageUrl);
              console.log(`AiImage (${alt}): Successfully cached URL for key "${cacheKey}"`);
            } catch (e) {
              console.warn(`AiImage (${alt}): Failed to write image URL to localStorage for key "${cacheKey}":`, e);
            }
          } else {
            const flowError = result.error || "Image generation flow returned no image URL and no specific error.";
            console.error(`AiImage (${alt}): Flow returned no imageUrl. Error: "${flowError}". Prompt: "${prompt}"`);
            setError(flowError); // Display more specific error
            // Additional logging based on error content was already in the flow.
          }
        } else {
          console.log(`AiImage (${alt}): Effect unmounted before flow result could be processed.`);
        }
      } catch (e: any) {
        const errorMessage = e instanceof Error ? e.message : String(e);
        console.error(`AiImage (${alt}): CRITICAL - Unexpected error calling generateIllustration flow for prompt "${prompt}":`, errorMessage, e);
        if (isEffectMounted) {
          setError(`Service communication error: ${errorMessage.substring(0,100)}...`);
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
      console.log(`AiImage (${alt}): No prompt provided or prompt is empty. Using fallback: ${fallbackImageUrl}`);
      setIsLoading(false);
      if (!fallbackImageUrl) {
          setError("No prompt provided and no fallback image available.");
      } else {
        setImageUrlToDisplay(fallbackImageUrl);
      }
    }

    return () => {
      console.log(`AiImage (${alt}): Effect cleanup. Prompt: "${prompt}"`);
      isEffectMounted = false;
    };
  }, [prompt, isMounted, alt]); // Added alt to dep array as it's used in logs

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
  console.log(`AiImage (${alt}): Determining finalSrc. Error: "${error}", imageUrlToDisplay: "${imageUrlToDisplay ? imageUrlToDisplay.substring(0,60)+'...' : null}", fallbackImageUrl: "${fallbackImageUrl ? fallbackImageUrl.substring(0,60)+'...' : null}". FinalSrc: "${finalSrc ? finalSrc.substring(0,60)+'...' : null}"`);


  if (!finalSrc) {
     console.error(`AiImage (${alt}): No finalSrc determined. Error was: "${error}". Fallback was: "${fallbackImageUrl}"`);
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
      unoptimized={finalSrc.startsWith('data:')} // Important for data URIs
      onError={(e) => {
        // Type assertion for the event target
        const target = e.target as HTMLImageElement;
        console.warn(`AiImage (${alt}): Next/Image onError event. Current src: "${target.src.substring(0,60)}...". Original prompt: "${prompt}". Error state: "${error}"`);
        if (isMounted && finalSrc !== fallbackImageUrl && fallbackImageUrl) {
            console.warn(`AiImage (${alt}): Next/Image failed to load src: "${finalSrc.substring(0,60)}...". Attempting fallback: "${fallbackImageUrl.substring(0,60)}..." for prompt: "${prompt}".`);
            setError("Image source failed to load, using fallback.");
            setImageUrlToDisplay(null); // Force re-evaluation of finalSrc to fallback
        } else if (isMounted && finalSrc === fallbackImageUrl && fallbackImageUrl) {
            console.error(`AiImage (${alt}): Fallback image also failed to load for prompt "${prompt}": ${fallbackImageUrl.substring(0,60)}...`);
            setError("Fallback image also failed to load.");
        } else if (isMounted && !fallbackImageUrl) {
            console.error(`AiImage (${alt}): Image failed to load and no fallback available for prompt: "${prompt}"`);
            setError("Image source failed to load, no fallback.");
        }
      }}
    />
  );
};

export default AiImage;

