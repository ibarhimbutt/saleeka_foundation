import { useState, useCallback } from 'react';
import { apiService } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

// Hook for user profile operations
export function useUserProfile() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const updateProfile = useCallback(async (uid: string, updates: any) => {
    setLoading(true);
    try {
      const result = await apiService.updateUserProfile(uid, updates);
      if (result.success) {
        toast({
          title: "Profile Updated",
          description: "Your profile has been successfully updated.",
        });
        return result;
      } else {
        throw new Error(result.message || 'Failed to update profile');
      }
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return { updateProfile, loading };
}

// Hook for user settings operations
export function useUserSettings() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const updateSettings = useCallback(async (uid: string, settings: any) => {
    setLoading(true);
    try {
      const result = await apiService.updateUserSettings(uid, settings);
      if (result.success) {
        toast({
          title: "Settings Updated",
          description: "Your settings have been successfully updated.",
        });
        return result;
      } else {
        throw new Error(result.message || 'Failed to update settings');
      }
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update settings. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return { updateSettings, loading };
}

// Hook for user interests operations
export function useUserInterests() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const updateInterests = useCallback(async (uid: string, interests: any[]) => {
    setLoading(true);
    try {
      const result = await apiService.updateUserInterests(uid, interests);
      if (result.success) {
        toast({
          title: "Interests Updated",
          description: "Your interests have been successfully updated.",
        });
        return result;
      } else {
        throw new Error(result.message || 'Failed to update interests');
      }
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update interests. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return { updateInterests, loading };
}

// Hook for user activity logging
export function useUserActivity() {
  const [loading, setLoading] = useState(false);

  const logActivity = useCallback(async (uid: string, action: string, description: string) => {
    setLoading(true);
    try {
      const result = await apiService.logUserActivity(uid, action, description);
      return result;
    } catch (error) {
      console.error('Failed to log activity:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return { logActivity, loading };
}

// Hook for image generation
export function useImageGeneration() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const generateImage = useCallback(async (prompt: string) => {
    setLoading(true);
    try {
      const result = await apiService.generateImage(prompt);
      if (result.imageUrl) {
        return result;
      } else {
        throw new Error(result.error || 'Failed to generate image');
      }
    } catch (error: any) {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate image. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return { generateImage, loading };
}

// Hook for profile generation
export function useProfileGeneration() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const generateProfile = useCallback(async (content: string) => {
    setLoading(true);
    try {
      const result = await apiService.generateProfile(content);
      if (result.summary) {
        toast({
          title: "Profile Generated",
          description: "AI profile has been generated successfully!",
        });
        return result;
      } else {
        throw new Error(result.error || 'Failed to generate profile');
      }
    } catch (error: any) {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate profile. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return { generateProfile, loading };
}
