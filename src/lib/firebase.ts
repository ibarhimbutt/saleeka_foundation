
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

// Define types for services, potentially undefined if init fails
let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;
let storage: FirebaseStorage | undefined;

const firebaseConfigValues = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID, // Can be undefined if not used
};

// Log the specific values being attempted for Firebase config
if (typeof window !== 'undefined') {
  const missingConfigKeys = Object.entries(firebaseConfigValues)
    .filter(([key, value]) => !value && key !== 'measurementId') // measurementId is optional
    .map(([key]) => key);

  if (missingConfigKeys.length > 0) {
    console.warn(
      `Firebase.ts: WARNING - Missing Firebase config environment variables for client SDK: ${missingConfigKeys.join(", ")}. Check your .env file and ensure they are prefixed with NEXT_PUBLIC_.`
    );
  }
  console.log("Firebase.ts: Using Firebase config from environment variables (client-side):");
  console.log("- apiKey:", firebaseConfigValues.apiKey ? "Exists" : "MISSING!");
  console.log("- authDomain:", firebaseConfigValues.authDomain || "MISSING!");
  console.log("- projectId:", firebaseConfigValues.projectId || "MISSING!");
  console.log("- storageBucket:", firebaseConfigValues.storageBucket || "MISSING!");
  console.log("- messagingSenderId:", firebaseConfigValues.messagingSenderId || "MISSING!");
  console.log("- appId:", firebaseConfigValues.appId || "MISSING!");
}

// Client-side initialization
if (typeof window !== 'undefined') {
  if (!getApps().length) {
    // Check if all essential config values are present
    if (
      firebaseConfigValues.apiKey &&
      firebaseConfigValues.authDomain &&
      firebaseConfigValues.projectId &&
      firebaseConfigValues.storageBucket &&
      firebaseConfigValues.messagingSenderId &&
      firebaseConfigValues.appId
    ) {
      try {
        console.log("Firebase.ts: Attempting to initialize Firebase client SDK with environment variables...");
        const initializedApp = initializeApp(firebaseConfigValues as any); // Cast as any if some optional fields might be undefined based on your setup
        app = initializedApp;
        auth = getAuth(initializedApp);
        db = getFirestore(initializedApp);
        storage = getStorage(initializedApp);
        console.log("Firebase.ts: Firebase client SDK initialized successfully using environment variables.");
      } catch (error: any) {
        console.error(
          "CRITICAL Error during Firebase client SDK initialization (initializeApp call failed):",
          error.message || String(error),
          "\nEnsure all NEXT_PUBLIC_FIREBASE_... environment variables are correctly set in your .env file."
        );
        console.error("Firebase.ts: Firebase config that caused error (from env vars):", firebaseConfigValues);
      }
    } else {
      console.error(
        "Firebase.ts: CRITICAL - Cannot initialize Firebase client SDK. One or more essential NEXT_PUBLIC_FIREBASE_... environment variables are missing. Please check your .env file."
      );
    }
  } else {
    const existingApp = getApp(); 
    app = existingApp;
    if (!auth) auth = getAuth(existingApp);
    if (!db) db = getFirestore(existingApp);
    if (!storage) storage = getStorage(existingApp);
  }
}

export { app, auth, db, storage };
