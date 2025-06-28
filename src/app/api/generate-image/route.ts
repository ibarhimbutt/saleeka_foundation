import { NextResponse, type NextRequest } from 'next/server';
import OpenAI from 'openai';
import * as admin from 'firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import type { MediaItem } from '@/lib/firestoreTypes';
import { sanitizePromptForClientCacheKey } from '@/lib/utils';
import fetch from 'node-fetch';

// Initialize Firebase Admin SDK
let adminApp: admin.app.App | null = null;

try {
  // Check if Firebase Admin is already initialized
  if (admin.apps.length === 0) {
    console.log("api/generate-image: Initializing Firebase Admin SDK...");
    
    // Try different initialization methods
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      console.log("api/generate-image: Using GOOGLE_APPLICATION_CREDENTIALS");
      adminApp = admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      });
    } else if (process.env.FIREBASE_ADMIN_PRIVATE_KEY && process.env.FIREBASE_ADMIN_CLIENT_EMAIL) {
      console.log("api/generate-image: Using service account credentials from environment variables");
      adminApp = admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      });
    } else {
      console.log("api/generate-image: No Firebase Admin credentials found. Using default initialization.");
      // For development/testing - this might work in some environments
      adminApp = admin.initializeApp({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      });
    }
    
    console.log("api/generate-image: Firebase Admin SDK initialized successfully");
  } else {
    adminApp = admin.app();
    console.log("api/generate-image: Using existing Firebase Admin SDK instance");
  }
} catch (error: any) {
  console.error("api/generate-image: Firebase Admin SDK initialization failed:", error.message);
  adminApp = null;
}

// Get Firestore and Storage instances
const db = adminApp ? admin.firestore() : null;
const storage = adminApp ? admin.storage() : null;
const defaultBucket = storage ? storage.bucket() : null;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const MEDIA_COLLECTION_NAME = 'media';
const ILLUSTRATION_STORAGE_PATH = 'illustrations/cache';

export async function POST(req: NextRequest) {
  // Check if Firebase services are available
  if (!db || !defaultBucket) {
    console.error("api/generate-image: Firebase services not available");
    
    // Return a fallback response instead of failing completely
    return NextResponse.json({ 
      error: "Image generation service temporarily unavailable. Firebase Admin SDK not properly configured.",
      fallbackImageUrl: "https://placehold.co/1024x1024.png?text=Image+Generation+Unavailable"
    }, { status: 503 });
  }

  const { prompt } = await req.json();

  if (!prompt || typeof prompt !== 'string' || prompt.trim().length < 3) {
    return NextResponse.json({ error: 'A valid prompt is required (min 3 characters).' }, { status: 400 });
  }

  const promptKey = sanitizePromptForClientCacheKey(prompt);

  try {
    // Check cache first
    const mediaDocRef = db.collection(MEDIA_COLLECTION_NAME).doc(promptKey);
    const mediaDocSnap = await mediaDocRef.get();

    if (mediaDocSnap.exists) {
      const cachedMedia = mediaDocSnap.data() as MediaItem;
      if (cachedMedia.imageUrl) {
        console.log(`api/generate-image: Cache hit for promptKey "${promptKey}"`);
        return NextResponse.json({ imageUrl: cachedMedia.imageUrl, cached: true });
      }
    }
    
    console.log(`api/generate-image: Cache miss for promptKey "${promptKey}". Generating new image.`);

    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      console.error("api/generate-image: OpenAI API key not configured");
      return NextResponse.json({ 
        error: "Image generation service not configured. OpenAI API key missing.",
        fallbackImageUrl: "https://placehold.co/1024x1024.png?text=OpenAI+Not+Configured"
      }, { status: 503 });
    }

    // Generate image with OpenAI
    const aiResponse = await openai.images.generate({
      model: "dall-e-3",
      prompt: `A highly detailed, vibrant, and professional illustration suitable for a website. Ensure the style is modern and appealing. Prompt: ${prompt}`,
      n: 1,
      size: "1024x1024",
      response_format: "url",
    });

    const openAiImageUrl = aiResponse.data[0]?.url;

    if (!openAiImageUrl) {
      console.error("api/generate-image: OpenAI did not return an image URL");
      return NextResponse.json({ 
        error: "Image generation failed. OpenAI did not return a valid image.",
        fallbackImageUrl: "https://placehold.co/1024x1024.png?text=Generation+Failed"
      }, { status: 500 });
    }

    console.log(`api/generate-image: OpenAI generated image successfully`);

    // Download and upload to Firebase Storage
    try {
      const imageResponse = await fetch(openAiImageUrl);
      if (!imageResponse.ok) {
        throw new Error(`Failed to download image: ${imageResponse.status}`);
      }
      
      const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
      const mimeType = imageResponse.headers.get('content-type') || 'image/png';
      const fileExtension = mimeType.split('/')[1] || 'png';

      const fileName = `${promptKey}-${Date.now()}.${fileExtension}`;
      const filePath = `${ILLUSTRATION_STORAGE_PATH}/${fileName}`;
      const file = defaultBucket.file(filePath);

      await file.save(imageBuffer, {
        metadata: { contentType: mimeType },
        public: true,
      });
      
      await file.makePublic();
      const publicUrl = file.publicUrl();
      
      console.log(`api/generate-image: Uploaded to Firebase Storage successfully`);

      // Save to Firestore cache
      const mediaItem: MediaItem = {
        prompt: prompt,
        promptKey: promptKey,
        imageUrl: publicUrl,
        provider: 'openai_dall-e-3',
        createdAt: FieldValue.serverTimestamp() as admin.firestore.Timestamp,
        imageSizeBytes: imageBuffer.length,
        mimeType,
      };
      
      await db.collection(MEDIA_COLLECTION_NAME).doc(promptKey).set(mediaItem);
      console.log(`api/generate-image: Saved metadata to Firestore`);

      return NextResponse.json({ imageUrl: publicUrl, cached: false });
      
    } catch (storageError: any) {
      console.error("api/generate-image: Storage/Firestore error:", storageError.message);
      
      // Return the OpenAI URL directly if storage fails
      return NextResponse.json({ 
        imageUrl: openAiImageUrl, 
        cached: false,
        warning: "Image generated but not cached due to storage issues"
      });
    }

  } catch (error: any) {
    console.error(`api/generate-image: Error processing prompt "${prompt}":`, error.message);
    
    let userErrorMessage = "Image generation failed.";
    let fallbackUrl = "https://placehold.co/1024x1024.png?text=Generation+Error";
    
    if (error.message && error.message.toLowerCase().includes('billing')) {
      userErrorMessage = "Image generation failed due to a billing issue with the AI provider.";
    } else if (error.message && error.message.toLowerCase().includes('quota')) {
      userErrorMessage = "Image generation failed due to quota limits with the AI provider.";
    } else if (error.message && (error.message.toLowerCase().includes('safety') || error.message.toLowerCase().includes('policy'))) {
      userErrorMessage = "Image generation blocked by AI safety policy.";
    }
    
    return NextResponse.json({ 
      error: userErrorMessage, 
      fallbackImageUrl: fallbackUrl,
      details: error.message 
    }, { status: 500 });
  }
}