
'use server';
/**
 * @fileOverview An AI flow for generating illustrations with fallback to OpenAI DALL-E.
 * This flow aims to implement server-side caching (TODO).
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
  imageUrl: z.string().url().nullable().describe("The public URL of the generated or cached image, or null if generation failed."),
  error: z.string().optional().describe("An error message if image generation failed."),
  provider: z.string().optional().describe("The AI provider used for generation (e.g., 'googleai', 'openai')."),
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
      console.log(`generateIllustrationFlow: Attempting Google Gemini for prompt: "${input.prompt}"`);
      const {media} = await ai.generate({
        model: 'googleai/gemini-2.0-flash-exp',
        prompt: `Generate a vibrant and professional illustration for a website. Prompt: ${input.prompt}`,
        config: {
          responseModalities: ['TEXT', 'IMAGE'],
        },
      });

      if (media && media.url && media.url.startsWith('data:image/png;base64,')) {
        imageUrl = media.url; // This is a data URI
        providerUsed = 'googleai';
        // TODO: Upload to Firebase Storage and get public URL
        // const base64Data = media.url.replace(/^data:image\/png;base64,/, "");
        // const imageBuffer = Buffer.from(base64Data, 'base64');
        // const fileName = `illustrations/googleai/${promptKey}-${Date.now()}.png`;
        // const file = storage.file(fileName);
        // await file.save(imageBuffer, { metadata: { contentType: 'image/png' }, public: true });
        // imageUrl = file.publicUrl();
      } else {
        errorMessage = 'Google Gemini returned invalid image data.';
        console.warn(`generateIllustrationFlow (Google): Image generation for prompt "${input.prompt}" returned invalid data URI format or no media.`);
      }
    } catch (e: any) {
      let originalError = e instanceof Error ? e.message : String(e);
      console.warn(`generateIllustrationFlow (Google): Error for prompt "${input.prompt}": ${originalError}`);
      if (originalError.includes('429') || originalError.includes('QuotaFailure') || originalError.toLowerCase().includes('rate limit')) {
        errorMessage = "Google Gemini API rate limit reached. Attempting fallback.";
        // Fallback will be attempted below
      } else {
        errorMessage = `Google Gemini generation failed: ${originalError.substring(0,100)}`;
      }
    }

    // Attempt 2: OpenAI DALL-E (if Google Gemini failed with a rate limit or specific error)
    if (!imageUrl && errorMessage && errorMessage.includes("rate limit reached")) {
      console.log(`generateIllustrationFlow: Google Gemini failed due to rate limit, attempting OpenAI DALL-E for prompt: "${input.prompt}"`);
      errorMessage = undefined; // Reset error message for DALL-E attempt
      try {
        const dalleResponse = await ai.generate({
          model: 'openai/dall-e-3', // Ensure this model identifier is correct for your Genkit OpenAI plugin version
          prompt: input.prompt, // DALL-E 3 generally prefers direct, descriptive prompts
          config: {
            // DALL-E specific config if needed, e.g., size, quality.
            // For example: size: "1024x1024", n: 1, response_format: "url"
            // Genkit plugin might handle these abstractions.
            // Assuming the plugin returns a URL directly or in a similar media structure.
          },
        });
        
        // The DALL-E response structure might differ.
        // Common DALL-E API responses provide an array of objects, each with a 'url'.
        // We need to adapt based on how the @genkit-ai/openai plugin structures this.
        // Let's assume it might be in `dalleResponse.output.url` or `dalleResponse.media.url`
        // or directly `dalleResponse.output[0].url` if it's an array.

        let dalleImageUrl: string | undefined;
        if (dalleResponse.output && typeof dalleResponse.output === 'object') {
            // Check for a direct URL or an array of image objects
            if ('url' in (dalleResponse.output as any) && typeof (dalleResponse.output as any).url === 'string') {
                dalleImageUrl = (dalleResponse.output as any).url;
            } else if (Array.isArray((dalleResponse.output as any).images) && (dalleResponse.output as any).images.length > 0) {
                 // Example if it's like { images: [{url: '...'}]}
                dalleImageUrl = (dalleResponse.output as any).images[0].url;
            } else if (Array.isArray(dalleResponse.output) && dalleResponse.output.length > 0 && (dalleResponse.output[0] as any).url) {
                // Example if it's like [{url: '...'}]
                dalleImageUrl = (dalleResponse.output[0] as any).url;
            }
        } else if (dalleResponse.media && dalleResponse.media.url) {
             dalleImageUrl = dalleResponse.media.url;
        }


        if (dalleImageUrl) {
          imageUrl = dalleImageUrl; // This should be a public URL from DALL-E
          providerUsed = 'openai';
          // TODO: If you want to store DALL-E images in your Firebase Storage too (optional, as DALL-E URLs are public but might expire)
          // You might download it and re-upload, or just use the DALL-E URL.
          // For consistency, re-uploading might be better.
          // const response = await fetch(dalleImageUrl);
          // const imageBuffer = Buffer.from(await response.arrayBuffer());
          // const fileName = `illustrations/openai/${promptKey}-${Date.now()}.png`;
          // const file = storage.file(fileName);
          // await file.save(imageBuffer, { metadata: { contentType: 'image/png' }, public: true });
          // imageUrl = file.publicUrl();
        } else {
          errorMessage = 'OpenAI DALL-E generation did not return a valid image URL.';
          console.warn(`generateIllustrationFlow (OpenAI): DALL-E for prompt "${input.prompt}" did not return a valid URL. Response:`, JSON.stringify(dalleResponse));
        }
      } catch (e: any) {
        let originalError = e instanceof Error ? e.message : String(e);
        console.error(`generateIllustrationFlow (OpenAI): Error for prompt "${input.prompt}":`, originalError, e);
        errorMessage = `OpenAI DALL-E generation failed: ${originalError.substring(0,100)}`;
      }
    }

    if (!imageUrl && !errorMessage) {
      errorMessage = "Image generation failed with an unknown error from all providers.";
    }
    
    // TODO: Step 4: Save the publicUrl (and providerUsed) to Firestore if an image was generated
    // if (imageUrl) {
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
