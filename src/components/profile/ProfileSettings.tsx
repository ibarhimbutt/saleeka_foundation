"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Save, User, Settings, Shield, Bell, Trash2 } from 'lucide-react';
import type { UserProfile, UserSettings } from '@/lib/firestoreTypes';
import { apiService } from '@/lib/api';
import { useUserProfile, useUserSettings, useUserInterests, useUserActivity } from '@/hooks/use-api';
import { InputField, TextareaField, SelectField, SwitchField } from '@/components/shared/FormField';
import InterestsManager from '@/components/shared/InterestsManager';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import ConfirmationDialog from '@/components/shared/ConfirmationDialog';
import ReauthDialog from '@/components/shared/ReauthDialog';

interface Interest {
  name: string;
  category: string;
  description: string;
  popularity: number;
}

export default function ProfileSettings() {
  const { user, userProfile, loading, deleteUser } = useAuth();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const router = useRouter();
  
  // Custom hooks for API operations
  const { updateProfile, loading: profileUpdating } = useUserProfile();
  const { updateSettings, loading: settingsUpdating } = useUserSettings();
  const { updateInterests, loading: interestsUpdating } = useUserInterests();
  const { logActivity } = useUserActivity();
  
  // Local state
  const [profileData, setProfileData] = useState<Partial<UserProfile>>({});
  const [settingsData, setSettingsData] = useState<Partial<UserSettings>>({});
  const [userInterests, setUserInterests] = useState<Interest[]>([]);
  const [showReauthDialog, setShowReauthDialog] = useState(false);
  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false);

  const isUpdating = profileUpdating || settingsUpdating || interestsUpdating;

  useEffect(() => {
    if (userProfile) {
      // Parse displayName into firstName and lastName for the form
      const nameParts = (userProfile.displayName || '').split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      setProfileData({
        firstName,
        lastName,
        email: userProfile.email || '',
        bio: userProfile.bio || '',
        phone: userProfile.phone || '',
        location: userProfile.location || '',
        website: userProfile.website || '',
        linkedinUrl: userProfile.linkedinUrl || '',
        githubUrl: userProfile.githubUrl || '',
        twitterUrl: userProfile.twitterUrl || '',
        company: userProfile.company || '',
        jobTitle: userProfile.jobTitle || '',

        profileVisibility: userProfile.profileVisibility || 'public',
        showEmail: userProfile.showEmail || false,
        showPhone: userProfile.showPhone || false,
        showLocation: userProfile.showLocation || true,
      });
    }
  }, [userProfile]);

  // Load user interests
  useEffect(() => {
    const loadUserInterests = async () => {
      if (user?.uid) {
        try {
          const response = await apiService.getUserInterests(user.uid);
          if (response.success && response.interests) {
            const uniqueInterests = response.interests.filter((interest: Interest, index: number, self: Interest[]) => 
              index === self.findIndex(i => i.name === interest.name)
            );
            setUserInterests(uniqueInterests);
          }
        } catch (error) {
          console.error('Error loading user interests:', error);
        }
      }
    };

    loadUserInterests();
  }, [user]);

  // Load user settings
  useEffect(() => {
    const loadUserSettings = async () => {
      if (user?.uid) {
        try {
          const response = await apiService.getUserSettings(user.uid);
          if (response.success && response.settings) {
            setSettingsData(response.settings);
          } else {
            // Set default settings
            setSettingsData({
              theme: theme,
              language: 'en',
              emailNotifications: true,
              pushNotifications: true,
              marketingEmails: false,
              weeklyDigest: true,
              mentorshipNotifications: true,
              projectUpdates: true,
              communityUpdates: true,
            });
          }
        } catch (error) {
          console.error('Error loading user settings:', error);
          // Set default settings on error
          setSettingsData({
            theme: theme,
            language: 'en',
            emailNotifications: true,
            pushNotifications: true,
            marketingEmails: false,
            weeklyDigest: true,
            mentorshipNotifications: true,
            projectUpdates: true,
            communityUpdates: true,
          });
        }
      }
    };

    loadUserSettings();
  }, [user, theme]);

  const handleProfileUpdate = async () => {
    if (!user?.uid) return;

    try {
      // Combine firstName and lastName into displayName
      const updates = { ...profileData };
      if (updates.firstName || updates.lastName) {
        updates.displayName = `${updates.firstName || ''} ${updates.lastName || ''}`.trim();
        // Remove firstName and lastName from updates to avoid creating redundant properties
        delete updates.firstName;
        delete updates.lastName;
      }

      // Update profile
      await updateProfile(user.uid, updates);

      // Save interests
      if (userInterests.length > 0) {
        await updateInterests(user.uid, userInterests);
      }
      
      // Log activity
      await logActivity(user.uid, 'profile_updated', 'User updated their profile information');
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleSettingsUpdate = async () => {
    if (!user?.uid) return;

    try {
      // Update settings
      await updateSettings(user.uid, settingsData);
      
      // Log activity
      await logActivity(user.uid, 'settings_updated', 'User updated their account settings');
    } catch (error) {
      console.error('Error updating settings:', error);
    }
  };

  const handleInputChange = (field: keyof UserProfile, value: string | boolean | string[]) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleSettingsChange = (field: keyof UserSettings, value: string | boolean) => {
    setSettingsData(prev => ({ ...prev, [field]: value }));
  };

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    handleSettingsChange('theme', newTheme);
  };

  const handleDeleteAccount = async () => {
    if (!user?.uid) return;

    try {
      await deleteUser();
      toast({
        title: "Account Deleted",
        description: "Your account has been successfully deleted.",
      });
    } catch (error: any) {
      console.error('Error deleting account:', error);
      
      // Check if re-authentication is required
      if (error.message === 'REAUTH_REQUIRED') {
        setShowReauthDialog(true);
      } else {
        toast({
          title: "Error",
          description: "Failed to delete account. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleDeleteConfirm = () => {
    setShowDeleteConfirmDialog(false);
    handleDeleteAccount();
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirmDialog(false);
  };

  const handleReauthSuccess = () => {
    setShowReauthDialog(false);
    toast({
      title: "Account Deleted",
      description: "Your account has been successfully deleted.",
    });
    // Redirect to homepage after successful deletion
    router.push('/');
  };

  const handleReauthClose = () => {
    setShowReauthDialog(false);
  };

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading profile..." />;
  }
  
  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="font-headline text-3xl font-bold text-primary">Profile & Settings</h1>
          <p className="text-muted-foreground">Manage your profile information and account preferences.</p>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="account" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Account
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Privacy
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your personal details and professional information.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <InputField
                    label="First Name"
                    id="firstName"
                    type="text"
                    value={profileData.firstName || ''}
                    onChange={(value) => handleInputChange('firstName', value)}
                  />
                  <InputField
                    label="Last Name"
                    id="lastName"
                    type="text"
                    value={profileData.lastName || ''}
                    onChange={(value) => handleInputChange('lastName', value)}
                  />
                </div>

                <InputField
                  label="Email"
                  id="email"
                  type="email"
                  value={profileData.email || ''}
                  onChange={(value) => handleInputChange('email', value)}
                  disabled
                  description="Email cannot be changed here. Contact support if needed."
                />

                <TextareaField
                  label="Bio"
                  id="bio"
                  value={profileData.bio || ''}
                  onChange={(value) => handleInputChange('bio', value)}
                  placeholder="Tell us about yourself..."
                  rows={4}
                />

                <div className="grid grid-cols-2 gap-4">
                  <InputField
                    label="Phone"
                    id="phone"
                    type="tel"
                    value={profileData.phone || ''}
                    onChange={(value) => handleInputChange('phone', value)}
                  />
                  <InputField
                    label="Location"
                    id="location"
                    type="text"
                    value={profileData.location || ''}
                    onChange={(value) => handleInputChange('location', value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <InputField
                    label="Company"
                    id="company"
                    type="text"
                    value={profileData.company || ''}
                    onChange={(value) => handleInputChange('company', value)}
                  />
                  <InputField
                    label="Job Title"
                    id="jobTitle"
                    type="text"
                    value={profileData.jobTitle || ''}
                    onChange={(value) => handleInputChange('jobTitle', value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Interests</label>
                  <InterestsManager
                    userInterests={userInterests}
                    onInterestsChange={setUserInterests}
                    disabled={isUpdating}
                    maxInterests={10}
                  />
                </div>



                <Button onClick={handleProfileUpdate} disabled={isUpdating}>
                  {isUpdating ? <LoadingSpinner size="sm" /> : <Save className="mr-2 h-4 w-4" />}
                  Save Profile
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Social Links</CardTitle>
                <CardDescription>Add your social media and professional profiles.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <InputField
                  label="Website"
                  id="website"
                  type="url"
                  value={profileData.website || ''}
                  onChange={(value) => handleInputChange('website', value)}
                  placeholder="https://yourwebsite.com"
                />

                <InputField
                  label="LinkedIn"
                  id="linkedinUrl"
                  type="url"
                  value={profileData.linkedinUrl || ''}
                  onChange={(value) => handleInputChange('linkedinUrl', value)}
                  placeholder="https://linkedin.com/in/yourprofile"
                />

                <InputField
                  label="GitHub"
                  id="githubUrl"
                  type="url"
                  value={profileData.githubUrl || ''}
                  onChange={(value) => handleInputChange('githubUrl', value)}
                  placeholder="https://github.com/yourusername"
                />

                <InputField
                  label="Twitter"
                  id="twitterUrl"
                  type="url"
                  value={profileData.twitterUrl || ''}
                  onChange={(value) => handleInputChange('twitterUrl', value)}
                  placeholder="https://twitter.com/yourusername"
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="account" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Preferences</CardTitle>
                <CardDescription>Customize your account settings and preferences.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                             <SelectField
                 label="Theme"
                 id="theme"
                 value={theme}
                 onValueChange={(value) => handleThemeChange(value as 'light' | 'dark' | 'system')}
                 options={[
                   { value: 'light', label: 'Light' },
                   { value: 'dark', label: 'Dark' },
                   { value: 'system', label: 'System' }
                 ]}
               />

              <SelectField
                label="Language"
                id="language"
                value={settingsData.language || 'en'}
                onValueChange={(value) => handleSettingsChange('language', value)}
                options={[
                  { value: 'en', label: 'English' },
                  { value: 'es', label: 'Spanish' },
                  { value: 'fr', label: 'French' },
                  { value: 'de', label: 'German' }
                ]}
              />

              <Button onClick={handleSettingsUpdate} disabled={isUpdating}>
                {isUpdating ? <LoadingSpinner size="sm" /> : <Save className="mr-2 h-4 w-4" />}
                Save Settings
              </Button>
            </CardContent>
          </Card>

          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
              <CardDescription>
                Irreversible and destructive actions. Please be careful.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Once you delete your account, there is no going back. Please be certain.
                </p>
                <Button 
                  variant="destructive" 
                  onClick={() => setShowDeleteConfirmDialog(true)}
                  disabled={isUpdating}
                  className="w-full sm:w-auto"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
              <CardDescription>Control who can see your information and how it&apos;s displayed.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <SelectField
                label="Profile Visibility"
                id="profileVisibility"
                value={profileData.profileVisibility || 'public'}
                onValueChange={(value) => handleInputChange('profileVisibility', value)}
                options={[
                  { value: 'public', label: 'Public' },
                  { value: 'members-only', label: 'Members Only' },
                  { value: 'private', label: 'Private' }
                ]}
              />

              <div className="space-y-4">
                <SwitchField
                  label="Show Email"
                  id="showEmail"
                  checked={profileData.showEmail || false}
                  onCheckedChange={(checked) => handleInputChange('showEmail', checked)}
                  description="Allow others to see your email address"
                />

                <SwitchField
                  label="Show Phone"
                  id="showPhone"
                  checked={profileData.showPhone || false}
                  onCheckedChange={(checked) => handleInputChange('showPhone', checked)}
                  description="Allow others to see your phone number"
                />

                <SwitchField
                  label="Show Location"
                  id="showLocation"
                  checked={profileData.showLocation || true}
                  onCheckedChange={(checked) => handleInputChange('showLocation', checked)}
                  description="Allow others to see your location"
                />
              </div>

              <Button onClick={handleProfileUpdate} disabled={isUpdating}>
                {isUpdating ? <LoadingSpinner size="sm" /> : <Save className="mr-2 h-4 w-4" />}
                Save Privacy Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Choose what notifications you want to receive.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <SwitchField
                  label="Email Notifications"
                  id="emailNotifications"
                  checked={settingsData.emailNotifications || true}
                  onCheckedChange={(checked) => handleSettingsChange('emailNotifications', checked)}
                  description="Receive notifications via email"
                />

                <SwitchField
                  label="Push Notifications"
                  id="pushNotifications"
                  checked={settingsData.pushNotifications || true}
                  onCheckedChange={(checked) => handleSettingsChange('pushNotifications', checked)}
                  description="Receive push notifications in your browser"
                />

                <SwitchField
                  label="Marketing Emails"
                  id="marketingEmails"
                  checked={settingsData.marketingEmails || false}
                  onCheckedChange={(checked) => handleSettingsChange('marketingEmails', checked)}
                  description="Receive promotional and marketing emails"
                />

                <SwitchField
                  label="Weekly Digest"
                  id="weeklyDigest"
                  checked={settingsData.weeklyDigest || true}
                  onCheckedChange={(checked) => handleSettingsChange('weeklyDigest', checked)}
                  description="Receive a weekly summary of platform activity"
                />

                <SwitchField
                  label="Mentorship Notifications"
                  id="mentorshipNotifications"
                  checked={settingsData.mentorshipNotifications || true}
                  onCheckedChange={(checked) => handleSettingsChange('mentorshipNotifications', checked)}
                  description="Get notified about mentorship opportunities"
                />

                <SwitchField
                  label="Project Updates"
                  id="projectUpdates"
                  checked={settingsData.projectUpdates || true}
                  onCheckedChange={(checked) => handleSettingsChange('projectUpdates', checked)}
                  description="Receive updates about your projects"
                />

                <SwitchField
                  label="Community Updates"
                  id="communityUpdates"
                  checked={settingsData.communityUpdates || true}
                  onCheckedChange={(checked) => handleSettingsChange('communityUpdates', checked)}
                  description="Stay updated with community news and events"
                />
              </div>

              <Button onClick={handleSettingsUpdate} disabled={isUpdating}>
                {isUpdating ? <LoadingSpinner size="sm" /> : <Save className="mr-2 h-4 w-4" />}
                Save Notification Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>

      {/* Re-authentication Dialog */}
      <ReauthDialog
        isOpen={showReauthDialog}
        onClose={handleReauthClose}
        onSuccess={handleReauthSuccess}
        userEmail={user?.email || ''}
        uid={user?.uid || ''}
      />

      {/* Confirmation Dialog for Account Deletion */}
      <ConfirmationDialog
        isOpen={showDeleteConfirmDialog}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Confirm Account Deletion"
        description="Are you sure you want to delete your account? This action cannot be undone and will permanently remove all your data."
        confirmText="Delete Account"
        cancelText="Cancel"
      />
    </>
  );
}