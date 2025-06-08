
"use client";

import type React from 'react';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { generateIllustration, type GenerateIllustrationInput } from '@/ai/flows/generate-illustration-flow';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

type AiImageProps = {
  prompt: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  fallbackImageUrl?: string; // To show while loading or on error
  imageClassName?: string; // For specific styling of the next/image component
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
  const [error, setError] = useState<string | null>(null); // Stores a generic error message for UI

  useEffect(() => {
    let isMounted = true;
    // Using a more specific cache key format
    const cacheKey = `ai-image-url-cache::${prompt.toLowerCase().replace(/\s+/g, '-')}`;

    const generateOrFetchUrl = async () => {
      // Check localStorage for a cached URL first
      try {
        const cachedUrl = localStorage.getItem(cacheKey);
        if (cachedUrl && isMounted) {
          setImageUrlToDisplay(cachedUrl);
          setIsLoading(false);
          return;
        }
      } catch (e) {
        // Log localStorage read error as a warning, but don't let it break the flow
        console.warn("AiImage: Failed to read image URL from localStorage:", e);
      }

      setIsLoading(true);
      setError(null); // Reset error state for new attempt

      try {
        const input: GenerateIllustrationInput = { prompt: prompt }; // Ensure prompt is passed directly
        const result = await generateIllustration(input);
        
        if (isMounted) {
          if (result.imageUrl) { // Expecting a URL (could be data URI or public URL from future server cache)
            setImageUrlToDisplay(result.imageUrl);
            try {
              localStorage.setItem(cacheKey, result.imageUrl);
            } catch (e) {
              console.warn("AiImage: Failed to write image URL to localStorage:", e);
            }
          } else {
            // This case handles if the flow returns a result without a URL, but doesn't throw.
            setError("Image generation flow returned no URL.");
          }
        }
      } catch (e: any) { // Catching 'any' to inspect error properties
        let isRateLimitError = false;
        let errorMessage = "Failed to load image.";

        if (e instanceof Error && e.message) {
          errorMessage = e.message;
          if (e.message.includes('429') || e.message.includes('QuotaFailure') || e.message.toLowerCase().includes('rate limit')) {
            isRateLimitError = true;
          }
        } else if (typeof e === 'string') {
          errorMessage = e;
           if (e.includes('429') || e.includes('QuotaFailure') || e.toLowerCase().includes('rate limit')) {
            isRateLimitError = true;
          }
        }

        if (isRateLimitError) {
          console.warn(`AiImage: API rate limit hit for prompt "${prompt}". Using fallback. Details: ${errorMessage}`);
        } else {
          console.error(`AiImage: Error generating/fetching image URL for prompt "${prompt}":`, errorMessage, e);
        }
        
        if (isMounted) {
          setError(isRateLimitError ? "API rate limit reached." : "Failed to load image.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    if (prompt) {
      generateOrFetchUrl();
    } else {
      // No prompt provided, rely on fallback or show error.
      setIsLoading(false);
      if (!fallbackImageUrl) {
          setError("No prompt provided for image generation.");
      } else {
        // If no prompt but fallback is there, use fallback directly.
        setImageUrlToDisplay(fallbackImageUrl);
      }
    }
    
    return () => {
      isMounted = false;
    };
  }, [prompt]); // Dependency array only includes prompt

  if (isLoading) {
    return (
      <Skeleton 
        className={cn("bg-muted/30", className)} 
        style={{ width: `${width}px`, height: `${height}px` }} 
        aria-label={`Loading image for ${alt}`}
      />
    );
  }

  // Determine final source: error state takes precedence, then displayed URL, then fallback.
  const finalSrc = error ? fallbackImageUrl : (imageUrlToDisplay || fallbackImageUrl);

  if (!finalSrc) {
     // This block renders if there's an error AND no fallbackImageUrl, 
     // OR if imageUrlToDisplay is null AND no fallbackImageUrl.
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
      className={cn(className, imageClassName)} // Apply both general and specific image classNames
      data-ai-source={error ? "error-or-fallback" : (imageUrlToDisplay === fallbackImageUrl ? "fallback-direct" : (imageUrlToDisplay ? "ai-generated-or-cached" : "fallback-implicit"))}
      unoptimized={finalSrc.startsWith('data:')} 
      onError={() => {
        // This Next/Image onError can catch issues with the finalSrc itself (e.g. broken URL)
        // and force a fallback if not already in an error state from generation.
        if (isMounted && imageUrlToDisplay !== fallbackImageUrl) { // Avoid error loop if fallback also fails
            console.warn(`AiImage: Next/Image failed to load src: "${finalSrc}". Attempting fallback for prompt: "${prompt}".`);
            setError("Image source failed to load."); // This will make finalSrc pick fallbackImageUrl
            setImageUrlToDisplay(null); // Clear potentially bad URL
        }
      }}
    />
  );
};

export default AiImage;

