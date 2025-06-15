
// This file is no longer used by AiImage.tsx or admin pages for image generation.
// Its functionality has been replaced by the /api/generate-image Next.js API route.
// It's kept here temporarily in case there are other direct backend usages or for reference,
// but it should be considered deprecated for UI-driven image generation.

'use server';
/**
 * @fileOverview DEPRECATED AI flow for generating illustrations.
 * Replaced by /src/app/api/generate-image/route.ts for UI image generation.
 *
 * - generateIllustration - A function that handles the image generation and caching process.
 * - GenerateIllustrationInput - The input type for the generateIllustration function.
 * - GenerateIllustrationOutput - The return type for the generateIllustration function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import * as admin from 'firebase-admin';
import type { DecodedIdToken } from 'firebase-admin/auth';
import { FieldValue } from 'firebase-admin/firestore';
import type { MediaItem } from '@/lib/firestoreTypes';
import fetch from 'node-fetch'; 

if (!admin.apps.length) {
  try {
    admin.initializeApp();
    console.warn("DEPRECATED generateIllustrationFlow: Firebase Admin SDK initialized. This flow is deprecated.");
  } catch (e: any) {
    console.error("DEPRECATED generateIllustrationFlow: Firebase Admin SDK failed to initialize. Error:", e.message);
  }
}

const db = admin.apps.length ? admin.firestore() : null;
const storageBucket = admin.apps.length ? admin.storage().bucket() : null;

const OPENAI_IMAGE_MODEL = 'dall-e-3'; // This was the target model
const MEDIA_COLLECTION_NAME = 'media';
const ILLUSTRATION_STORAGE_PATH = 'illustrations/cache';


const GenerateIllustrationInputSchema = z.object({
  prompt: z.string().min(3, { message: "Prompt must be at least 3 characters long."})
    .describe('A textual prompt describing the illustration to generate.'),
});
export type GenerateIllustrationInput = z.infer<typeof GenerateIllustrationInputSchema>;

const GenerateIllustrationOutputSchema = z.object({
  imageUrl: z.string().url().nullable().describe("The public URL of the generated or cached image, or null if generation failed."),
  error: z.string().optional().describe("An error message if image generation failed."),
  provider: z.string().optional().describe("The AI provider used for generation (e.g., 'openai', 'cache')."),
  cached: z.boolean().optional().describe("Indicates if the image was served from cache.")
});
export type GenerateIllustrationOutput = z.infer<typeof GenerateIllustrationOutputSchema>;


const createPromptKey = (prompt: string): string => {
  return prompt
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .slice(0, 150);
};

export async function generateIllustration(input: GenerateIllustrationInput): Promise<GenerateIllustrationOutput> {
  console.warn(`DEPRECATED generateIllustrationFlow called for prompt: ${input.prompt.substring(0,50)}... This flow is deprecated. Use /api/generate-image instead.`);
  // Returning a dummy error as this flow should not be used.
  return {
    imageUrl: null,
    error: "This Genkit flow (generateIllustrationFlow) is deprecated. Image generation is now handled by /api/generate-image.",
    provider: "deprecated-flow",
    cached: false,
  };
}

// The rest of the original flow logic is commented out or removed to prevent accidental use.
/*
const generateIllustrationFlow = ai.defineFlow(
  // ... original flow definition ...
);
async function directGenerate(prompt: string): Promise<GenerateIllustrationOutput> {
  // ... original directGenerate logic ...
}
*/
console.warn("src/ai/flows/generate-illustration-flow.ts is DEPRECATED and should no longer be actively used for UI image generation. Functionality moved to /app/api/generate-image/route.ts.");
