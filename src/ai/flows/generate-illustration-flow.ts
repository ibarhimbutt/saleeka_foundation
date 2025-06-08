
'use server';
/**
 * @fileOverview An AI flow for generating illustrations.
 * This flow aims to implement server-side caching.
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

const GenerateIllustrationInputSchema = z.object({
  prompt: z.string().describe('A textual prompt describing the illustration to generate.'),
});
export type GenerateIllustrationInput = z.infer<typeof GenerateIllustrationInputSchema>;

const GenerateIllustrationOutputSchema = z.object({
  // This will now be a public URL to the image, likely from Firebase Storage
  imageUrl: z.string().url().describe("The public URL of the generated or cached image."),
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
  async (input) => {
    const promptKey = input.prompt.toLowerCase().replace(/\s+/g, '-'); // Simple key generation

    // TODO: Step 1: Check Firestore for an existing image URL for this promptKey
    // const imageDocRef = db.collection('generatedImages').doc(promptKey);
    // const imageDoc = await imageDocRef.get();
    // if (imageDoc.exists && imageDoc.data()?.imageUrl) {
    //   return { imageUrl: imageDoc.data()?.imageUrl };
    // }

    // Step 2: If not found in Firestore, generate the image
    const {media} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-exp',
      prompt: `Generate a vibrant and professional illustration for a website. Prompt: ${input.prompt}`,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media || !media.url || !media.url.startsWith('data:image/png;base64,')) {
      throw new Error('Image generation failed or returned an invalid data URI.');
    }

    const base64Data = media.url.replace(/^data:image\/png;base64,/, "");
    // TODO: Step 3: Upload the generated image (base64Data) to Firebase Storage
    // const imageBuffer = Buffer.from(base64Data, 'base64');
    // const fileName = `illustrations/${promptKey}-${Date.now()}.png`;
    // const file = storage.file(fileName);
    // await file.save(imageBuffer, {
    //   metadata: { contentType: 'image/png' },
    //   public: true, // Make it publicly readable
    // });
    // const publicUrl = file.publicUrl(); 
    // For testing without actual upload, you can return the data URI, but AiImage expects a real URL
    // const publicUrl = media.url; // TEMPORARY: remove this once firebase storage is integrated
    
    // For now, to avoid breaking, we'll return the data URI, but the goal is to return a public URL from storage
    // The AiImage component will handle 'data:' URIs but it's better if it gets a real URL.
    // Replace this with the actual publicUrl from Firebase Storage once integrated.
    const publicUrl = media.url; 

    // TODO: Step 4: Save the publicUrl to Firestore
    // await imageDocRef.set({
    //   prompt: input.prompt,
    //   imageUrl: publicUrl,
    //   createdAt: new Date(),
    // });

    return { imageUrl: publicUrl };
  }
);
