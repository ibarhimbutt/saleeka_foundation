
import type { Timestamp } from 'firebase/firestore';

// Program data structure (already adjusted for Firestore)
export type Program = {
  id: string; // Document ID from Firestore
  title: string;
  category: 'Mentorship' | 'Student Project' | 'Internship' | 'Scholarship';
  description: string;
  image?: string; // URL to image in Firebase Storage
  tags?: string[];
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
};

// For AI Generated Images stored in Firestore (renamed from GeneratedImageCache)
// This will be stored in the 'media' collection
export type MediaItem = {
  // Document ID will be a sanitized version of the prompt
  prompt: string; // The original AI prompt
  imageUrl: string; // Public URL from Firebase Storage
  provider: string; // e.g., 'googleai', 'openai'
  createdAt: Timestamp; // Firestore Server Timestamp
  imageSizeBytes?: number; // Size of the image in bytes
  mimeType?: string; // e.g., 'image/png'
  promptKey: string; // The sanitized key used as doc ID, stored for convenience
};


// RBAC Roles for Admin Users
export type UserRole = 'superAdmin' | 'editor' | 'viewer' | 'none';

// User Types for broader platform classification
export type UserType = 'admin' | 'student' | 'professional' | 'donor' | 'orgadmin' | 'unclassified';

// User Profile stored in Firestore 'users' collection
export interface UserProfile {
  uid: string; // Firebase Auth UID, also document ID
  email: string;
  displayName?: string;
  role: UserRole;
  type: UserType; // New field for user classification
  photoURL?: string;
  createdAt: Timestamp;
  lastLoginAt?: Timestamp;
  // any other relevant user profile fields
}

