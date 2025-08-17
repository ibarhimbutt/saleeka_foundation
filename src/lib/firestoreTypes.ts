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
export type UserType = 'admin' | 'student' | 'mentor' | 'donor' | 'orgadmin' | 'unclassified';

// User Profile stored in Firestore 'users' collection
export interface UserProfile {
  uid: string; // Firebase Auth UID, also document ID
  email: string;
  displayName: string;
  firstName?: string;
  lastName?: string;
  photoURL?: string;
  bio?: string;
  phone?: string;
  location?: string;
  website?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  twitterUrl?: string;
  company?: string;
  jobTitle?: string;
  experience?: string;
  education?: string;
  interests?: string[];
  subscribeNewsletter: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  marketingEmails: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastLoginAt?: Timestamp;
  isActive: boolean;
  isVerified: boolean;
  profileVisibility: 'public' | 'private' | 'connections';
  showEmail: boolean;
  showPhone: boolean;
  showLocation: boolean;
  type: UserType;
  role: UserType;
  mentorCategory?: string; // Added for mentor profiles
  // Additional mentor-specific properties
  expertise?: string[];
  rating?: number;
  yearsOfExperience?: number;
  maxMentees?: number;
  currentMentees?: number;
  totalMentees?: number;
  specialties?: string[];
  certifications?: string[];
  availability?: string;
  industry?: string;
}

// User Settings for preferences
export interface UserSettings {
  uid: string;
  theme?: 'light' | 'dark' | 'system';
  language?: string;
  timezone?: string;
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  marketingEmails?: boolean;
  weeklyDigest?: boolean;
  mentorshipNotifications?: boolean;
  projectUpdates?: boolean;
  communityUpdates?: boolean;
  updatedAt: Timestamp;
}

// User Activity Log
export interface UserActivity {
  id: string;
  uid: string;
  action: string;
  description: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Timestamp;
}