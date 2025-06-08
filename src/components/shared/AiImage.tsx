
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
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const cacheKey = `ai-image-cache-${prompt}`;

    const generate = async () => {
      // Check cache first
      try {
        const cachedImage = localStorage.getItem(cacheKey);
        if (cachedImage && isMounted) {
          setImageUrl(cachedImage);
          setIsLoading(false);
          return;
        }
      } catch (e) {
        console.warn("Failed to read from localStorage:", e);
        // Proceed to generate if cache read fails
      }

      setIsLoading(true);
      setError(null);
      try {
        const input: GenerateIllustrationInput = { prompt: `Generate an illustration of ${prompt}` };
        const result = await generateIllustration(input);
        if (isMounted) {
          setImageUrl(result.imageDataUri);
          try {
            localStorage.setItem(cacheKey, result.imageDataUri);
          } catch (e) {
            console.warn("Failed to write to localStorage:", e);
            // Image is still displayed, just not cached
          }
        }
      } catch (e) {
        console.error("Error generating image:", e);
        if (isMounted) {
          setError("Failed to generate image.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    if (prompt) {
      generate();
    } else {
      setIsLoading(false);
      if (!fallbackImageUrl) {
          setError("No prompt provided for image generation.");
      }
    }
    
    return () => {
      isMounted = false;
    };
  }, [prompt]); // Re-run effect if prompt changes

  if (isLoading) {
    return (
      <Skeleton 
        className={cn("bg-muted/30", className)} 
        style={{ width: `${width}px`, height: `${height}px` }} 
      />
    );
  }

  if (error) {
    if (fallbackImageUrl) {
      return (
        <Image
          src={fallbackImageUrl}
          alt={alt}
          width={width}
          height={height}
          className={cn(className, imageClassName)}
          data-ai-generated="error-fallback"
        />
      );
    }
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
        <p className="text-xs text-center px-2">{alt}: Error</p>
      </div>
    );
  }

  if (imageUrl) {
    return (
      <Image
        src={imageUrl}
        alt={alt}
        width={width}
        height={height}
        className={cn(className, imageClassName)}
        data-ai-generated="success"
      />
    );
  }

  // Fallback if no image URL and no error (e.g. empty prompt or initial state before cache/generation)
  if (fallbackImageUrl) {
    return (
        <Image
            src={fallbackImageUrl}
            alt={alt}
            width={width}
            height={height}
            className={cn(className, imageClassName)}
            data-ai-generated="prompt-fallback"
        />
    );
  }

  // Final fallback to skeleton if all else fails (e.g., no prompt, no fallback)
  return (
    <Skeleton 
      className={cn("bg-muted/30", className)} 
      style={{ width: `${width}px`, height: `${height}px` }}
    />
  );
};

export default AiImage;
