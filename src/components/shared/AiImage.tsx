
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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const cacheKey = `ai-image-url-cache-${prompt}`; // Cache the final image URL

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
        console.warn("Failed to read image URL from localStorage:", e);
      }

      setIsLoading(true);
      setError(null);
      try {
        const input: GenerateIllustrationInput = { prompt: `Generate an illustration of ${prompt}` };
        // This flow is now expected to return a public URL from server-side cache/storage,
        // or generate, store, and then return the public URL.
        const result = await generateIllustration(input);
        
        if (isMounted) {
          if (result.imageUrl) {
            setImageUrlToDisplay(result.imageUrl);
            try {
              localStorage.setItem(cacheKey, result.imageUrl); // Cache the fetched/generated URL
            } catch (e) {
              console.warn("Failed to write image URL to localStorage:", e);
            }
          } else {
            throw new Error('Image generation flow returned no URL.');
          }
        }
      } catch (e) {
        console.error("Error generating/fetching image URL:", e);
        if (isMounted) {
          setError("Failed to load image.");
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
      setIsLoading(false);
      if (!fallbackImageUrl) {
          setError("No prompt provided for image generation.");
      }
    }
    
    return () => {
      isMounted = false;
    };
  }, [prompt]);

  if (isLoading) {
    return (
      <Skeleton 
        className={cn("bg-muted/30", className)} 
        style={{ width: `${width}px`, height: `${height}px` }} 
      />
    );
  }

  const finalSrc = error ? fallbackImageUrl : imageUrlToDisplay;

  if (!finalSrc) {
     return (
      <div 
        className={cn(
          "flex flex-col items-center justify-center bg-destructive/10 text-destructive border border-destructive rounded-md",
          className
        )} 
        style={{ width: `${width}px`, height: `${height}px` }}
        role="alert"
      >
        <AlertCircle className="w-8 h-8 mb-2" />
        <p className="text-xs text-center px-2">{alt}: {error || "Image unavailable"}</p>
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
      data-ai-source={error ? "error-or-fallback" : (imageUrlToDisplay === fallbackImageUrl ? "fallback" : "ai-generated-or-cached")}
      unoptimized={finalSrc.startsWith('data:')} // Keep unoptimized for base64, server URLs are optimized by Next/Image
    />
  );
};

export default AiImage;
