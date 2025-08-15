// This file provides a drop-in replacement for Firebase functions
// It maintains the same API but uses Neo4j under the hood

import {
  Neo4jUserService,
  Neo4jMentorshipService,
  Neo4jSkillService,
  Neo4jProgramService,
  Neo4jActivityService,
  Neo4jSettingsService,
  Neo4jMediaService
} from './neo4jService';
import type { 
  UserProfile, 
  UserSettings, 
  UserActivity,
  Program,
  MediaItem
} from './firestoreTypes';

// ============================================================================
// USER PROFILE OPERATIONS (Firebase API compatible)
// ============================================================================

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const user = await Neo4jUserService.getUserByUid(uid);
    if (!user) return null;
    
    // Convert Neo4j user to Firebase-compatible format
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role as any,
      type: user.type as any,
      photoURL: user.photoURL,
      bio: user.bio,
      interests: (user as any).interests || [],
      phone: user.phone,
      location: user.location,
      website: user.website,
      linkedinUrl: user.linkedinUrl,
      githubUrl: user.githubUrl,
      twitterUrl: user.twitterUrl,
      company: user.company,
      jobTitle: user.jobTitle,
      skills: (user as any).skills || [],
      experience: user.experience,
      education: user.education,
      subscribeNewsletter: user.subscribeNewsletter,
      emailNotifications: user.emailNotifications,
      pushNotifications: user.pushNotifications,
      marketingEmails: user.marketingEmails,
      createdAt: new Date(user.createdAt) as any,
      updatedAt: user.updatedAt ? new Date(user.updatedAt) as any : undefined,
      lastLoginAt: user.lastLoginAt ? new Date(user.lastLoginAt) as any : undefined,
      isActive: user.isActive,
      isVerified: user.isVerified,
      profileVisibility: user.profileVisibility,
      showEmail: user.showEmail,
      showPhone: user.showPhone,
      showLocation: user.showLocation
    };
  } catch (error) {
    console.error('Error fetching user profile from Neo4j:', error);
    throw error;
  }
};

export const createUserProfile = async (profile: Omit<UserProfile, 'createdAt' | 'updatedAt'>): Promise<void> => {
  try {
    await Neo4jUserService.createUser({
      uid: profile.uid,
      email: profile.email,
      displayName: profile.displayName,
      firstName: profile.firstName,
      lastName: profile.lastName,
      role: profile.role === 'none' ? 'student' : (profile.role as any),
      type: profile.type === 'orgadmin' ? 'admin' : (profile.type as any),
      photoURL: profile.photoURL,
      bio: profile.bio,
      interests: profile.interests,
      phone: profile.phone,
      location: profile.location,
      website: profile.website,
      linkedinUrl: profile.linkedinUrl,
      githubUrl: profile.githubUrl,
      twitterUrl: profile.twitterUrl,
      company: profile.company,
      jobTitle: profile.jobTitle,
      skills: profile.skills,
      experience: profile.experience,
      education: profile.education,
      subscribeNewsletter: profile.subscribeNewsletter,
      emailNotifications: profile.emailNotifications,
      pushNotifications: profile.pushNotifications,
      marketingEmails: profile.marketingEmails,
      isActive: profile.isActive,
      isVerified: profile.isVerified,
      profileVisibility: profile.profileVisibility,
      showEmail: profile.showEmail,
      showPhone: profile.showPhone,
      showLocation: profile.showLocation
    });
  } catch (error) {
    console.error('Error creating user profile in Neo4j:', error);
    throw error;
  }
};

export const updateUserProfile = async (uid: string, updates: Partial<UserProfile>): Promise<void> => {
  try {
    await Neo4jUserService.updateUserProfile(uid, updates as any);
  } catch (error) {
    console.error('Error updating user profile in Neo4j:', error);
    throw error;
  }
};

// ============================================================================
// USER SETTINGS OPERATIONS (Firebase API compatible)
// ============================================================================

export const getUserSettings = async (uid: string): Promise<UserSettings | null> => {
  try {
    const settings = await Neo4jSettingsService.getUserSettings(uid);
    if (!settings) return null;
    
    // Convert Neo4j settings to Firebase-compatible format
    return {
      uid: settings.uid,
      theme: settings.theme,
      language: settings.language,
      timezone: settings.timezone,
      emailNotifications: settings.emailNotifications,
      pushNotifications: settings.pushNotifications,
      marketingEmails: settings.marketingEmails,
      weeklyDigest: settings.weeklyDigest,
      mentorshipNotifications: settings.mentorshipNotifications,
      projectUpdates: settings.projectUpdates,
      communityUpdates: settings.communityUpdates,
      updatedAt: new Date(settings.updatedAt) as any
    };
  } catch (error) {
    console.error('Error fetching user settings from Neo4j:', error);
    throw error;
  }
};

export const updateUserSettings = async (uid: string, settings: Partial<UserSettings>): Promise<void> => {
  try {
    await Neo4jSettingsService.upsertUserSettings(uid, settings as any);
  } catch (error) {
    console.error('Error updating user settings in Neo4j:', error);
    throw error;
  }
};

// ============================================================================
// USER ACTIVITY OPERATIONS (Firebase API compatible)
// ============================================================================

export const logUserActivity = async (activity: Omit<UserActivity, 'id' | 'createdAt'>): Promise<void> => {
  try {
    await Neo4jActivityService.logUserActivity({
      uid: activity.uid,
      action: activity.action,
      description: activity.description,
      metadata: activity.metadata,
      ipAddress: activity.ipAddress,
      userAgent: activity.userAgent
    });
  } catch (error) {
    console.error('Error logging user activity in Neo4j:', error);
    throw error;
  }
};

export const getUserActivity = async (uid: string, limitCount: number = 10): Promise<UserActivity[]> => {
  try {
    const activities = await Neo4jActivityService.getUserActivity(uid, limitCount);
    
    // Convert Neo4j activities to Firebase-compatible format
    return activities.map(activity => ({
      id: activity.id,
      uid: activity.uid,
      action: activity.action,
      description: activity.description,
      metadata: activity.metadata,
      ipAddress: activity.ipAddress,
      userAgent: activity.userAgent,
      createdAt: new Date(activity.createdAt) as any
    }));
  } catch (error) {
    console.error('Error fetching user activity from Neo4j:', error);
    throw error;
  }
};

// ============================================================================
// PROGRAM OPERATIONS (Firebase API compatible)
// ============================================================================

export const getPrograms = async (): Promise<Program[]> => {
  try {
    const programs = await Neo4jProgramService.getAllPrograms();
    
    // Convert Neo4j programs to Firebase-compatible format
    return programs.map(program => ({
      id: program.id,
      title: program.title,
      category: program.category,
      description: program.description,
      image: program.image,
      tags: program.tags,
      createdAt: new Date(program.createdAt) as any,
      updatedAt: program.updatedAt ? new Date(program.updatedAt) as any : undefined
    }));
  } catch (error) {
    console.error('Error fetching programs from Neo4j:', error);
    throw error;
  }
};

export const getProgramById = async (id: string): Promise<Program | null> => {
  try {
    const program = await Neo4jProgramService.getProgramById(id);
    if (!program) return null;
    
    // Convert Neo4j program to Firebase-compatible format
    return {
      id: program.id,
      title: program.title,
      category: program.category,
      description: program.description,
      image: program.image,
      tags: program.tags,
      createdAt: new Date(program.createdAt) as any,
      updatedAt: program.updatedAt ? new Date(program.updatedAt) as any : undefined
    };
  } catch (error) {
    console.error('Error fetching program from Neo4j:', error);
    throw error;
  }
};

// ============================================================================
// MEDIA OPERATIONS (Firebase API compatible)
// ============================================================================

export const getMediaByPromptKey = async (promptKey: string): Promise<MediaItem | null> => {
  try {
    const media = await Neo4jMediaService.getMediaByPromptKey(promptKey);
    if (!media) return null;
    
    // Convert Neo4j media to Firebase-compatible format
    return {
      prompt: media.prompt,
      imageUrl: media.imageUrl,
      provider: media.provider,
      createdAt: new Date(media.createdAt) as any,
      imageSizeBytes: media.imageSizeBytes,
      mimeType: media.mimeType,
      promptKey: media.promptKey
    };
  } catch (error) {
    console.error('Error fetching media from Neo4j:', error);
    throw error;
  }
};

export const createMediaItem = async (mediaData: Omit<MediaItem, 'createdAt'>): Promise<void> => {
  try {
    await Neo4jMediaService.createMediaItem({
      prompt: mediaData.prompt,
      imageUrl: mediaData.imageUrl,
      provider: mediaData.provider,
      promptKey: mediaData.promptKey,
      imageSizeBytes: mediaData.imageSizeBytes,
      mimeType: mediaData.mimeType
    });
  } catch (error) {
    console.error('Error creating media item in Neo4j:', error);
    throw error;
  }
};

// ============================================================================
// UTILITY FUNCTIONS (Firebase API compatible)
// ============================================================================

export const formatTimestamp = (timestamp: any): string => {
  if (!timestamp) return 'N/A';
  
  try {
    // Handle Neo4j date strings
    if (typeof timestamp === 'string') {
      return new Date(timestamp).toLocaleDateString();
    }
    
    // Handle Date objects
    if (timestamp instanceof Date) {
      return timestamp.toLocaleDateString();
    }
    
    // Handle Firebase Timestamp objects (fallback)
    if (timestamp && typeof timestamp.toDate === 'function') {
      return timestamp.toDate().toLocaleDateString();
    }
    
    return 'N/A';
  } catch (error) {
    console.error('Error formatting timestamp:', error);
    return 'N/A';
  }
};

export const formatDateTime = (timestamp: any): string => {
  if (!timestamp) return 'N/A';
  
  try {
    // Handle Neo4j date strings
    if (typeof timestamp === 'string') {
      return new Date(timestamp).toLocaleString();
    }
    
    // Handle Date objects
    if (timestamp instanceof Date) {
      return timestamp.toLocaleString();
    }
    
    // Handle Firebase Timestamp objects (fallback)
    if (timestamp && typeof timestamp.toDate === 'function') {
      return timestamp.toDate().toLocaleString();
    }
    
    return 'N/A';
  } catch (error) {
    console.error('Error formatting datetime:', error);
    return 'N/A';
  }
};

// ============================================================================
// NEO4J-SPECIFIC FUNCTIONS (New functionality)
// ============================================================================

export const getMentorshipMatches = async (studentUid: string, limit: number = 10) => {
  try {
    return await Neo4jMentorshipService.getMentorshipMatches(studentUid, limit);
  } catch (error) {
    console.error('Error getting mentorship matches:', error);
    throw error;
  }
};

export const createMentorship = async (studentUid: string, mentorUid: string, relationshipData: any) => {
  try {
    await Neo4jMentorshipService.createMentorship(studentUid, mentorUid, relationshipData);
  } catch (error) {
    console.error('Error creating mentorship:', error);
    throw error;
  }
};

export const getUserSkills = async (uid: string) => {
  try {
    return await Neo4jSkillService.getUserSkills(uid);
  } catch (error) {
    console.error('Error getting user skills:', error);
    throw error;
  }
};

export const addUserSkill = async (uid: string, skillData: any, relationshipData: any) => {
  try {
    await Neo4jSkillService.addUserSkill(uid, skillData, relationshipData);
  } catch (error) {
    console.error('Error adding user skill:', error);
    throw error;
  }
};

export const getUserInterests = async (uid: string) => {
  try {
    return await Neo4jSkillService.getUserInterests(uid);
  } catch (error) {
    console.error('Error getting user interests:', error);
    throw error;
  }
};

export const addUserInterest = async (uid: string, interestData: any) => {
  try {
    await Neo4jSkillService.addUserInterest(uid, interestData);
  } catch (error) {
    console.error('Error adding user interest:', error);
    throw error;
  }
};

export const enrollUserInProgram = async (uid: string, programId: string, enrollmentData?: any) => {
  try {
    await Neo4jProgramService.enrollUserInProgram(uid, programId, enrollmentData);
  } catch (error) {
    console.error('Error enrolling user in program:', error);
    throw error;
  }
};

export const getUserPrograms = async (uid: string) => {
  try {
    return await Neo4jProgramService.getUserPrograms(uid);
  } catch (error) {
    console.error('Error getting user programs:', error);
    throw error;
  }
};
