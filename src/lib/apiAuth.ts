// API-based authentication service for client-side use
export interface AuthUser {
  uid: string;
  email: string;
  displayName?: string;
  role?: string;
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

// Sign in with email and password using API route
export const signInWithEmailAndPassword = async (
  email: string, 
  password: string
): Promise<UserCredential> => {
  try {
    const response = await fetch('/api/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'signIn',
        email,
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'auth/internal-error');
    }

    if (!data.success) {
      throw new Error('auth/internal-error');
    }

    return { user: data.user };
  } catch (error) {
    console.error('API sign in error:', error);
    throw error;
  }
};

// Create user with email and password using API route
export const createUserWithEmailAndPassword = async (
  email: string, 
  password: string,
  displayName?: string,
  userType?: string
): Promise<UserCredential> => {
  try {
    const response = await fetch('/api/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'signUp',
        email,
        password,
        displayName,
        userType,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'auth/internal-error');
    }

    if (!data.success) {
      throw new Error('auth/internal-error');
    }

    return { user: data.user };
  } catch (error) {
    console.error('API sign up error:', error);
    throw error;
  }
};

// Get user profile using API route
export const getUserProfile = async (email: string) => {
  try {
    const response = await fetch(`/api/user/profile?email=${encodeURIComponent(email)}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch user profile');
    }

    const data = await response.json();
    return data.user;
  } catch (error) {
    console.error('API get user profile error:', error);
    throw error;
  }
};

// Update user password using API route
export const updateUserPassword = async (email: string, newPassword: string): Promise<void> => {
  try {
    const response = await fetch('/api/user/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        updates: { password: newPassword },
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to update password');
    }
  } catch (error) {
    console.error('API update password error:', error);
    throw error;
  }
};

// Update user profile using API route
export const updateProfile = async (user: AuthUser, updates: Partial<AuthUser>): Promise<void> => {
  try {
    const response = await fetch('/api/user/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        uid: user.uid,
        updates,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to update profile');
    }
  } catch (error) {
    console.error('API update profile error:', error);
    throw error;
  }
};
