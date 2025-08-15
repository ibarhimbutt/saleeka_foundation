import { Neo4jUserService } from './neo4jService';
import { Neo4jActivityService } from './neo4jService';
import type { UserProfile } from './firestoreTypes';

// Simple in-memory session storage (in production, use Redis or similar)
const sessions = new Map<string, { uid: string; email: string; expires: number }>();

export interface AuthUser {
  uid: string;
  email: string;
  displayName?: string;
  emailVerified: boolean;
  isAnonymous: boolean;
}

export interface UserCredential {
  user: AuthUser;
}

export interface AuthError {
  code: string;
  message: string;
}

// Generate a simple session token
const generateSessionToken = (): string => {
  return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};

// Create a new user with email and password
export const createUserWithEmailAndPassword = async (
  email: string, 
  password: string,
  displayName?: string,
  userType?: string
): Promise<UserCredential> => {
  try {
    // Check if user already exists
    const existingUser = await Neo4jUserService.getUserByEmail(email);
    if (existingUser) {
      throw new Error('auth/email-already-in-use');
    }

    // Create a new user UID
    const uid = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    
    // Hash the password (in production, use bcrypt or similar)
    const hashedPassword = await hashPassword(password);
    console.log('User creation - Original password:', password);
    console.log('User creation - Generated hash:', hashedPassword);
    
    // Map user type to Neo4j node label
    const mapUserTypeToNeo4jType = (userType: string | undefined) => {
      switch (userType) {
        case 'admin':
          return 'admin';
        case 'student':
          return 'student';
        case 'professional':
          return 'professional';
        case 'donor':
          return 'donor';
        case 'orgadmin':
          return 'admin'; // Map orgadmin to admin for now
        default:
          return 'student'; // Default to student
      }
    };

    const neo4jType = mapUserTypeToNeo4jType(userType);
    
    // Create user profile
    const userProfile: any = {
      uid,
      email,
      password: hashedPassword,
      displayName,
      firstName: displayName ? displayName.split(' ')[0] || '' : '',
      lastName: displayName ? displayName.split(' ').slice(1).join(' ') || '' : '',
      role: userType || 'student',
      type: neo4jType,
      isActive: true,
      isVerified: false,
      profileVisibility: 'public',
      showEmail: false,
      showPhone: false,
      showLocation: true,
      subscribeNewsletter: false,
      emailNotifications: true,
      pushNotifications: false,
      marketingEmails: false
    };

    console.log('Creating user in Neo4j with profile:', userProfile);
    await Neo4jUserService.createUser(userProfile);
    console.log('User created successfully in Neo4j');
    
    // Log the activity
    console.log('Logging user activity...');
    await Neo4jActivityService.logUserActivity({
      uid,
      action: 'user_created',
      description: 'New user account created',
      metadata: { email, displayName },
      ipAddress: 'unknown', // In a real app, get this from request context
      userAgent: 'unknown'  // In a real app, get this from request context
    });
    console.log('User activity logged successfully');

    const user: AuthUser = {
      uid,
      email,
      displayName,
      emailVerified: false,
      isAnonymous: false
    };

    return { user };
  } catch (error) {
    console.error('Neo4j auth error:', error);
    if (error instanceof Error && error.message === 'auth/email-already-in-use') {
      throw error;
    }
    throw new Error('auth/internal-error');
  }
};

// Sign in with email and password
export const signInWithEmailAndPassword = async (
  email: string, 
  password: string
): Promise<UserCredential> => {
  try {
    // Find user by email
    const user = await Neo4jUserService.getUserByEmail(email);
    if (!user) {
      throw new Error('auth/user-not-found');
    }

    // Verify password (in production, use bcrypt or similar)
    console.log('Login attempt - Email:', email);
    console.log('Login attempt - Provided password:', password);
    console.log('Login attempt - Stored hash:', user.password);
    
    const isValidPassword = await verifyPassword(password, user.password || '');
    console.log('Login attempt - Password valid:', isValidPassword);
    
    if (!isValidPassword) {
      throw new Error('auth/wrong-password');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new Error('auth/user-disabled');
    }

    // Log the activity
    await Neo4jActivityService.logUserActivity({
      uid: user.uid,
      action: 'user_login',
      description: 'User logged in successfully',
      metadata: { email },
      ipAddress: 'unknown',
      userAgent: 'unknown'
    });

    const authUser: AuthUser = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      emailVerified: user.isVerified || false,
      isAnonymous: false
    };

    return { user: authUser };
  } catch (error) {
    if (error instanceof Error && (
      error.message === 'auth/user-not-found' ||
      error.message === 'auth/wrong-password' ||
      error.message === 'auth/user-disabled'
    )) {
      throw error;
    }
    throw new Error('auth/internal-error');
  }
};

// Sign out user
export const signOut = async (): Promise<void> => {
  // In a real implementation, you would invalidate the session token
  // For now, we'll just return successfully
  return Promise.resolve();
};

// Get current user
export const getCurrentUser = async (): Promise<AuthUser | null> => {
  try {
    // Check for session token in localStorage
    if (typeof window !== 'undefined') {
      const sessionToken = localStorage.getItem('neo4j_session_token');
      if (sessionToken) {
        const session = validateSession(sessionToken);
        if (session) {
          // Return the user from the session
          return {
            uid: session.uid,
            email: session.email,
            displayName: undefined,
            emailVerified: false,
            isAnonymous: false
          };
        }
      }
    }
    return null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

// Update user profile
export const updateProfile = async (user: AuthUser, updates: { displayName?: string; photoURL?: string }): Promise<void> => {
  try {
    await Neo4jUserService.updateUserProfile(user.uid, updates);
    
    // Log the activity
    await Neo4jActivityService.logUserActivity({
      uid: user.uid,
      action: 'profile_updated',
      description: 'User profile updated',
      metadata: updates,
      ipAddress: 'unknown',
      userAgent: 'unknown'
    });
  } catch (error) {
    throw new Error('auth/internal-error');
  }
};

// Send email verification
export const sendEmailVerification = async (user: AuthUser): Promise<void> => {
  try {
    // In a real implementation, you would send an email
    // For now, we'll just mark the user as verified
    await Neo4jUserService.updateUserProfile(user.uid, { isVerified: true });
    
    // Log the activity
    await Neo4jActivityService.logUserActivity({
      uid: user.uid,
      action: 'email_verification_sent',
      description: 'Email verification sent',
      metadata: { email: user.email },
      ipAddress: 'unknown',
      userAgent: 'unknown'
    });
  } catch (error) {
    throw new Error('auth/internal-error');
  }
};

// Reset password
export const sendPasswordResetEmail = async (email: string): Promise<void> => {
  try {
    // In a real implementation, you would send a password reset email
    // For now, we'll just log the activity
    const user = await Neo4jUserService.getUserByEmail(email);
    if (user) {
      await Neo4jActivityService.logUserActivity({
        uid: user.uid,
        action: 'password_reset_requested',
        description: 'Password reset email requested',
        metadata: { email },
        ipAddress: 'unknown',
        userAgent: 'unknown'
      });
    }
  } catch (error) {
    // Don't reveal if email exists or not
    return Promise.resolve();
  }
};

// Delete user account
export const deleteUser = async (user: AuthUser): Promise<void> => {
  try {
    await Neo4jUserService.deleteUser(user.uid);
    
    // Log the activity (this will be the last activity for this user)
    await Neo4jActivityService.logUserActivity({
      uid: user.uid,
      action: 'user_deleted',
      description: 'User account deleted',
      metadata: { email: user.email },
      ipAddress: 'unknown',
      userAgent: 'unknown'
    });
  } catch (error) {
    throw new Error('auth/internal-error');
  }
};

// Simple password hashing (in production, use bcrypt)
export const hashPassword = async (password: string): Promise<string> => {
  // For demo purposes, store password as-is (NOT recommended for production!)
  console.log('hashPassword - Input:', password, 'Output:', password);
  return password;
};

// Simple password verification (in production, use bcrypt)
export const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  // For demo purposes, compare passwords directly (NOT recommended for production!)
  console.log('verifyPassword - Input password:', password);
  console.log('verifyPassword - Stored password:', hashedPassword);
  console.log('verifyPassword - Match:', password === hashedPassword);
  
  return password === hashedPassword;
};

// Create a session for the user
export const createSession = (user: AuthUser): string => {
  const token = generateSessionToken();
  const expires = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
  
  sessions.set(token, {
    uid: user.uid,
    email: user.email,
    expires
  });
  
  return token;
};

// Validate session token
export const validateSession = (token: string): { uid: string; email: string } | null => {
  const session = sessions.get(token);
  if (!session || session.expires < Date.now()) {
    sessions.delete(token);
    return null;
  }
  return { uid: session.uid, email: session.email };
};

// Clear expired sessions
export const cleanupSessions = (): void => {
  const now = Date.now();
  for (const [token, session] of sessions.entries()) {
    if (session.expires < now) {
      sessions.delete(token);
    }
  }
};

// Run cleanup every hour
setInterval(cleanupSessions, 60 * 60 * 1000);

// Utility function to update existing user passwords to new format
export const updateUserPassword = async (email: string, newPassword: string): Promise<void> => {
  try {
    console.log('updateUserPassword - Looking for user with email:', email);
    
    const user = await Neo4jUserService.getUserByEmail(email);
    console.log('updateUserPassword - Retrieved user:', user);
    console.log('uiduiduiduiduiduiduiduiduiduiduiduid', user?.uid);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    if (!user.uid) {
      console.error('updateUserPassword - User object missing uid field:', user);
      throw new Error('User object missing uid field');
    }
    
    console.log('updateUserPassword - Retrieved user:', user.uid);
    
    const newHashedPassword = await hashPassword(newPassword);
    console.log('updateUserPassword - New hashed password:', newHashedPassword);
    
    await Neo4jUserService.updateUserProfile(user.uid, { password: newHashedPassword });
    
    console.log('Password updated successfully for user:', email);
  } catch (error) {
    console.error('Failed to update password:', error);
    throw error;
  }
};
