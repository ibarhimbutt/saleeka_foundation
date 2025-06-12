
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

// Define types for services, potentially undefined if init fails
let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;
let storage: FirebaseStorage | undefined;

// Hardcoded Firebase configuration values (TEMPORARY WORKAROUND)
const firebaseConfigValues = {
  apiKey: "AIzaSyDCIkAgbB36p2u-xWXcVLHKWCKeIIAW364",
  authDomain: "saleeka-connect.firebaseapp.com",
  projectId: "saleeka-connect",
  storageBucket: "saleeka-connect.firebasestorage.app", // Corrected: removed leading space and .app
  messagingSenderId: "429561316956",
  appId: "1:429561316956:web:e935d62db3111a62ca8899",
  measurementId: "YOUR_FIREBASE_MEASUREMENT_ID" // Kept as placeholder, update if you have it
};

// Log the specific values being attempted for Firebase config
if (typeof window !== 'undefined') {
  console.log("Firebase.ts: Using HARDCODED Firebase config values (TEMPORARY WORKAROUND):");
  console.log("- apiKey:", firebaseConfigValues.apiKey ? "****" : "MISSING"); // Mask API key in logs
  console.log("- authDomain:", firebaseConfigValues.authDomain);
  console.log("- projectId:", firebaseConfigValues.projectId);
  console.log("- storageBucket:", firebaseConfigValues.storageBucket);
  console.log("- messagingSenderId:", firebaseConfigValues.messagingSenderId);
  console.log("- appId:", firebaseConfigValues.appId);
  console.log("- measurementId:", firebaseConfigValues.measurementId);
}

const requiredConfigKeys: (keyof typeof firebaseConfigValues)[] = [
  'apiKey',
  'authDomain',
  'projectId',
  'storageBucket',
  'messagingSenderId',
  'appId',
];

const missingConfigValues = requiredConfigKeys.filter(key => !firebaseConfigValues[key]);

if (typeof window !== 'undefined') { // Ensure this block only runs on client
  if (!getApps().length) { // Only initialize if no apps exist yet on the client
    if (missingConfigValues.length > 0) {
      console.error(
        `CRITICAL Firebase Initialization Error (Hardcoded Values): The following hardcoded Firebase configuration values are missing or empty in 'src/lib/firebase.ts': ${missingConfigValues.join(', ')}. ` +
        "Please ensure all required values are correctly set in the `firebaseConfigValues` object. " +
        "Firebase will not initialize correctly without these."
      );
      // app, auth, db, storage remain undefined
    } else {
      try {
        console.log("Firebase.ts: Attempting to initialize Firebase client SDK with hardcoded values...");
        const initializedApp = initializeApp(firebaseConfigValues);
        app = initializedApp;
        auth = getAuth(initializedApp);
        db = getFirestore(initializedApp);
        storage = getStorage(initializedApp);
        console.log("Firebase.ts: Firebase client SDK initialized successfully with hardcoded values.");
      } catch (error: any) {
        console.error(
          "CRITICAL Error during Firebase client SDK initialization (initializeApp call failed with hardcoded values):",
          error.message || String(error),
          "\nEnsure all hardcoded Firebase config values are correct, especially 'storageBucket' (usually 'YOUR_PROJECT_ID.appspot.com') and 'projectId'."
        );
        console.error("Firebase.ts: Hardcoded Firebase config that caused error:", firebaseConfigValues);
        // app, auth, db, storage remain undefined
      }
    }
  } else { // Firebase app already initialized on the client
    const existingApp = getApp(); // Get the default app
    app = existingApp;
    // Ensure services are assigned if re-evaluating module (e.g. HMR)
    if (!auth) auth = getAuth(existingApp);
    if (!db) db = getFirestore(existingApp);
    if (!storage) storage = getStorage(existingApp);
    // console.log("Firebase.ts: Firebase client SDK already initialized. Reusing existing instance.");
  }
}

// Export possibly undefined services. Components using them must check for their existence.
export { app, auth, db, storage };
