"use client";

import type React from 'react';
import { useState, useEffect } from 'react';
import Image from 'next/image';
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

    const fetchAndSetImageUrl = async () => {
      try {
        const cachedUrl = localStorage.getItem(cacheKey);
        if (cachedUrl && isEffectMounted) {
          console.log(`AiImage (${alt}): Cache hit for key "${cacheKey}"`);
          setImageUrlToDisplay(cachedUrl);
          setIsLoading(false);
          return;
        }
      } catch (e) {
        console.warn(`AiImage (${alt}): Failed to read from localStorage:`, e);
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/generate-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt }),
        });

        const result = await response.json();

        if (isEffectMounted) {
          if (response.ok && result.imageUrl) {
            setImageUrlToDisplay(result.imageUrl);
            try {
              localStorage.setItem(cacheKey, result.imageUrl);
            } catch (e) {
              console.warn(`AiImage (${alt}): Failed to cache URL:`, e);
            }
          } else if (result.fallbackImageUrl) {
            // Use fallback URL provided by API
            setImageUrlToDisplay(result.fallbackImageUrl);
            setError(result.error || "Service temporarily unavailable");
          } else {
            setError(result.error || "Image generation failed");
          }
        }
      } catch (e: any) {
        console.error(`AiImage (${alt}): API call failed:`, e);
        if (isEffectMounted) {
          setError(`Service error: ${e.message}`);
        }
      } finally {
        if (isEffectMounted) {
          setIsLoading(false);
        }
      }
    };

    if (prompt && prompt.trim() !== "") {
      fetchAndSetImageUrl();
    } else {
      setIsLoading(false);
      if (!fallbackImageUrl) {
        setError("No prompt provided and no fallback image available.");
      } else {
        setImageUrlToDisplay(fallbackImageUrl);
      }
    }

    return () => {
      isEffectMounted = false;
    };
  }, [prompt, isMounted, alt, fallbackImageUrl]);

  if (!isMounted) {
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
      data-ai-source={error ? "error-or-fallback" : (imageUrlToDisplay === fallbackImageUrl ? "fallback-direct" : "ai-generated-or-cached")}
      unoptimized={finalSrc.startsWith('data:')}
      onError={(e) => {
        const target = e.target as HTMLImageElement;
        console.warn(`AiImage (${alt}): Image failed to load:`, target.src);
        if (isMounted && finalSrc !== fallbackImageUrl && fallbackImageUrl) {
          setError("Image source failed to load, using fallback.");
          setImageUrlToDisplay(null);
        } else if (isMounted) {
          setError("Image failed to load.");
        }
      }}
    />
  );
};

export default AiImage;