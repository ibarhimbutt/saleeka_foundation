
'use server';
/**
 * @fileOverview An AI flow for generating illustrations.
 * This flow aims to implement server-side caching (TODO).
 * OpenAI DALL-E fallback has been removed due to model access and plugin stability issues.
 *
 * - generateIllustration - A function that handles the image generation process.
 * - GenerateIllustrationInput - The input type for the generateIllustration function.
 * - GenerateIllustrationOutput - The return type for the generateIllustration function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
// TODO: Import Firebase Admin SDK for Storage and Firestore if implementing server-side caching
// import { initializeApp, cert } from 'firebase-admin/app';
// import { getStorage } from 'firebase-admin/storage';
// import { getFirestore } from 'firebase-admin/firestore';

// TODO: Initialize Firebase Admin (do this once, typically in a separate firebaseAdmin.ts file)
// if (!admin.apps.length) {
//   initializeApp({
//     credential: cert(serviceAccount), // Ensure your service account key is available
//     storageBucket: 'your-project-id.appspot.com'
//   });
// }
// const db = getFirestore();
// const storage = getStorage().bucket();

const GOOGLE_IMAGE_MODEL = 'googleai/gemini-2.0-flash-exp';

const GenerateIllustrationInputSchema = z.object({
  prompt: z.string().describe('A textual prompt describing the illustration to generate.'),
});
export type GenerateIllustrationInput = z.infer<typeof GenerateIllustrationInputSchema>;

const GenerateIllustrationOutputSchema = z.object({
  imageUrl: z.string().url().nullable().describe("The public URL of the generated or cached image (currently data URI), or null if generation failed."),
  error: z.string().optional().describe("An error message if image generation failed."),
  provider: z.string().optional().describe("The AI provider used for generation (e.g., 'googleai')."),
});
export type GenerateIllustrationOutput = z.infer<typeof GenerateIllustrationOutputSchema>;

export async function generateIllustration(input: GenerateIllustrationInput): Promise<GenerateIllustrationOutput> {
  return generateIllustrationFlow(input);
}

const generateIllustrationFlow = ai.defineFlow(
  {
    name: 'generateIllustrationFlow',
    inputSchema: GenerateIllustrationInputSchema,
    outputSchema: GenerateIllustrationOutputSchema,
  },
  async (input): Promise<GenerateIllustrationOutput> => {
    const promptKey = input.prompt.toLowerCase().replace(/\s+/g, '-'); // Simple key generation

    // TODO: Step 1: Check Firestore for an existing image URL for this promptKey
    // const imageDocRef = db.collection('generatedImages').doc(promptKey);
    // const imageDoc = await imageDocRef.get();
    // if (imageDoc.exists && imageDoc.data()?.imageUrl) {
    //   return { imageUrl: imageDoc.data()?.imageUrl, provider: imageDoc.data()?.provider || 'cache' };
    // }

    let imageUrl: string | null = null;
    let errorMessage: string | undefined;
    let providerUsed: string | undefined;

    // Attempt 1: Google Gemini
    try {
      console.log(`generateIllustrationFlow: Attempting Google Gemini (${GOOGLE_IMAGE_MODEL}) for prompt: "${input.prompt}"`);
      const {media} = await ai.generate({
        model: GOOGLE_IMAGE_MODEL,
        prompt: `Generate a vibrant and professional illustration for a website. Prompt: ${input.prompt}`,
        config: {
          responseModalities: ['TEXT', 'IMAGE'],
        },
      });

      if (media && media.url && media.url.startsWith('data:image/png;base64,')) {
        imageUrl = media.url; // This is a data URI
        providerUsed = 'googleai';
        // TODO: Upload data URI to Firebase Storage and get public URL
        // const base64Data = media.url.replace(/^data:image\/png;base64,/, "");
        // const imageBuffer = Buffer.from(base64Data, 'base64');
        // const fileName = `illustrations/googleai/${promptKey}-${Date.now()}.png`;
        // const file = storage.file(fileName);
        // await file.save(imageBuffer, { metadata: { contentType: 'image/png' }, public: true });
        // imageUrl = file.publicUrl(); // This would be the Firebase Storage URL
      } else {
        errorMessage = 'Google Gemini returned invalid image data or no media URL.';
        console.warn(`generateIllustrationFlow (Google): Image generation for prompt "${input.prompt}" returned invalid data URI format or no media.`);
      }
    } catch (e: any) {
      let originalError = e instanceof Error ? e.message : String(e);
      console.warn(`generateIllustrationFlow (Google): Error for prompt "${input.prompt}": ${originalError}`);
      if (originalError.includes('429') || originalError.includes('QuotaFailure') || originalError.toLowerCase().includes('rate limit')) {
        errorMessage = `Google Gemini API rate limit reached. Error: ${originalError.substring(0,100)}`;
      } else if ((originalError.toLowerCase().includes('model') && originalError.toLowerCase().includes('not found')) || originalError.toLowerCase().includes('not_found')) {
        errorMessage = `Google Gemini model '${GOOGLE_IMAGE_MODEL}' not found or inaccessible. Error: ${originalError.substring(0,100)}`;
      }
      else {
        errorMessage = `Google Gemini generation failed: ${originalError.substring(0,100)}`;
      }
    }

    // OpenAI DALL-E fallback is removed for now.

    if (!imageUrl && !errorMessage) {
      errorMessage = "Image generation failed with an unknown error from Google Gemini.";
    }
    
    // TODO: Step 4: Save the publicUrl (and providerUsed) to Firestore if an image was generated and uploaded
    // if (imageUrl && !imageUrl.startsWith('data:')) { // Only save if it's a public URL, not a data URI
    //   await imageDocRef.set({
    //     prompt: input.prompt,
    //     imageUrl: imageUrl,
    //     provider: providerUsed,
    //     createdAt: new Date(),
    //   });
    // }

    return { imageUrl, error: errorMessage, provider: providerUsed };
  }
);
