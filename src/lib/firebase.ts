
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

// Construct Firebase config from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;

// Check if all required Firebase config values are present
const requiredEnvVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
];

const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (typeof window !== 'undefined' && !getApps().length) {
  if (missingEnvVars.length > 0) {
    console.error(
      `Firebase Initialization Error: The following environment variables are missing: ${missingEnvVars.join(', ')}. ` +
      'Please check your .env.local or .env file. Firebase will not initialize correctly.'
    );
    // Assign dummy objects to prevent runtime errors when these are imported elsewhere
    app = {} as FirebaseApp;
    auth = {} as Auth;
    db = {} as Firestore;
    storage = {} as FirebaseStorage;
  } else {
    try {
      console.log("Attempting to initialize Firebase with config:", {
        apiKey: firebaseConfig.apiKey ? "****" : "MISSING", // Mask API key in logs
        authDomain: firebaseConfig.authDomain,
        projectId: firebaseConfig.projectId,
        // Add other config properties if needed for debugging, but be careful with sensitive info
      });
      app = initializeApp(firebaseConfig);
      auth = getAuth(app);
      db = getFirestore(app);
      storage = getStorage(app);
      console.log("Firebase client SDK initialized successfully.");
    } catch (error: any) {
      console.error("Error initializing Firebase client SDK:", error.message || error);
      // Fallback or dummy objects to prevent further errors if initialization fails
      app = {} as FirebaseApp;
      auth = {} as Auth;
      db = {} as Firestore;
      storage = {} as FirebaseStorage;
    }
  }
} else if (getApps().length > 0) {
  app = getApps()[0];
  // Re-assign auth, db, storage in case they weren't set if the above block was skipped
  // but an app instance already exists (e.g. Fast Refresh might re-run this module)
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  // console.log("Firebase client SDK already initialized."); // Optional: uncomment for debugging
} else {
  // This case should ideally not be hit in a typical client-side scenario
  // but if it is, provide dummy objects.
  console.warn("Firebase client SDK: Non-browser environment or unexpected initialization path during server-side rendering pass.");
  app = {} as FirebaseApp;
  auth = {} as Auth;
  db = {} as Firestore;
  storage = {} as FirebaseStorage;
}

export { app, auth, db, storage };
