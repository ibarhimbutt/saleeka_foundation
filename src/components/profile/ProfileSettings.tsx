"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { updateUserProfile, getUserSettings, updateUserSettings, logUserActivity } from '@/lib/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, User, Settings, Shield, Bell } from 'lucide-react';
import type { UserProfile, UserSettings } from '@/lib/firestoreTypes';

export default function ProfileSettings() {
  const { user, userProfile, loading } = useAuth();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [profileData, setProfileData] = useState<Partial<UserProfile>>({});
  const [settingsData, setSettingsData] = useState<Partial<UserSettings>>({});

  useEffect(() => {
    if (userProfile) {
      setProfileData({
        firstName: userProfile.firstName || '',
        lastName: userProfile.lastName || '',
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
        interests: userProfile.interests || [],
        skills: userProfile.skills || [],
        profileVisibility: userProfile.profileVisibility || 'public',
        showEmail: userProfile.showEmail || false,
        showPhone: userProfile.showPhone || false,
        showLocation: userProfile.showLocation || true,
      });
    }
  }, [userProfile]);

  useEffect(() => {
    const loadUserSettings = async () => {
      if (user?.uid) {
        try {
          const settings = await getUserSettings(user.uid);
          if (settings) {
            setSettingsData(settings);
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
        }
      }
    };

    loadUserSettings();
  }, [user, theme]);

  const handleProfileUpdate = async () => {
    if (!user?.uid) return;

    setIsUpdating(true);
    try {
      await updateUserProfile(user.uid, profileData);
      
      // Log activity
      await logUserActivity({
        uid: user.uid,
        action: 'profile_updated',
        description: 'User updated their profile information',
      });

      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSettingsUpdate = async () => {
    if (!user?.uid) return;

    setIsUpdating(true);
    try {
      await updateUserSettings(user.uid, settingsData);
      
      // Log activity
      await logUserActivity({
        uid: user.uid,
        action: 'settings_updated',
        description: 'User updated their account settings',
      });

      toast({
        title: "Settings Updated",
        description: "Your settings have been successfully updated.",
      });
    } catch (error) {
      console.error('Error updating settings:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleInputChange = (field: keyof UserProfile, value: any) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleSettingsChange = (field: keyof UserSettings, value: any) => {
    setSettingsData(prev => ({ ...prev, [field]: value }));
  };

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    handleSettingsChange('theme', newTheme);
  };

  const handleInterestsChange = (value: string) => {
    const interests = value.split(',').map(item => item.trim()).filter(Boolean);
    handleInputChange('interests', interests);
  };

  const handleSkillsChange = (value: string) => {
    const skills = value.split(',').map(item => item.trim()).filter(Boolean);
    handleInputChange('skills', skills);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
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
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={profileData.firstName || ''}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={profileData.lastName || ''}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profileData.email || ''}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  disabled
                />
                <p className="text-xs text-muted-foreground">Email cannot be changed here. Contact support if needed.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell us about yourself..."
                  value={profileData.bio || ''}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  className="min-h-[100px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={profileData.phone || ''}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={profileData.location || ''}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    value={profileData.company || ''}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="jobTitle">Job Title</Label>
                  <Input
                    id="jobTitle"
                    value={profileData.jobTitle || ''}
                    onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="interests">Interests</Label>
                <Input
                  id="interests"
                  placeholder="Web Development, AI, Marketing (comma-separated)"
                  value={profileData.interests?.join(', ') || ''}
                  onChange={(e) => handleInterestsChange(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="skills">Skills</Label>
                <Input
                  id="skills"
                  placeholder="JavaScript, React, Python (comma-separated)"
                  value={profileData.skills?.join(', ') || ''}
                  onChange={(e) => handleSkillsChange(e.target.value)}
                />
              </div>

              <Button onClick={handleProfileUpdate} disabled={isUpdating}>
                {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
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
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  placeholder="https://yourwebsite.com"
                  value={profileData.website || ''}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="linkedinUrl">LinkedIn</Label>
                <Input
                  id="linkedinUrl"
                  placeholder="https://linkedin.com/in/yourprofile"
                  value={profileData.linkedinUrl || ''}
                  onChange={(e) => handleInputChange('linkedinUrl', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="githubUrl">GitHub</Label>
                <Input
                  id="githubUrl"
                  placeholder="https://github.com/yourusername"
                  value={profileData.githubUrl || ''}
                  onChange={(e) => handleInputChange('githubUrl', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="twitterUrl">Twitter</Label>
                <Input
                  id="twitterUrl"
                  placeholder="https://twitter.com/yourusername"
                  value={profileData.twitterUrl || ''}
                  onChange={(e) => handleInputChange('twitterUrl', e.target.value)}
                />
              </div>
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
              <div className="space-y-2">
                <Label htmlFor="theme">Theme</Label>
                <Select
                  value={theme}
                  onValueChange={handleThemeChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select
                  value={settingsData.language || 'en'}
                  onValueChange={(value) => handleSettingsChange('language', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleSettingsUpdate} disabled={isUpdating}>
                {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
              <CardDescription>Control who can see your information and how it's displayed.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="profileVisibility">Profile Visibility</Label>
                <Select
                  value={profileData.profileVisibility || 'public'}
                  onValueChange={(value) => handleInputChange('profileVisibility', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select visibility" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="members-only">Members Only</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Show Email</Label>
                    <p className="text-sm text-muted-foreground">Allow others to see your email address</p>
                  </div>
                  <Switch
                    checked={profileData.showEmail || false}
                    onCheckedChange={(checked) => handleInputChange('showEmail', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Show Phone</Label>
                    <p className="text-sm text-muted-foreground">Allow others to see your phone number</p>
                  </div>
                  <Switch
                    checked={profileData.showPhone || false}
                    onCheckedChange={(checked) => handleInputChange('showPhone', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Show Location</Label>
                    <p className="text-sm text-muted-foreground">Allow others to see your location</p>
                  </div>
                  <Switch
                    checked={profileData.showLocation || true}
                    onCheckedChange={(checked) => handleInputChange('showLocation', checked)}
                  />
                </div>
              </div>

              <Button onClick={handleProfileUpdate} disabled={isUpdating}>
                {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
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
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                  </div>
                  <Switch
                    checked={settingsData.emailNotifications || true}
                    onCheckedChange={(checked) => handleSettingsChange('emailNotifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive push notifications in your browser</p>
                  </div>
                  <Switch
                    checked={settingsData.pushNotifications || true}
                    onCheckedChange={(checked) => handleSettingsChange('pushNotifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Marketing Emails</Label>
                    <p className="text-sm text-muted-foreground">Receive promotional and marketing emails</p>
                  </div>
                  <Switch
                    checked={settingsData.marketingEmails || false}
                    onCheckedChange={(checked) => handleSettingsChange('marketingEmails', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Weekly Digest</Label>
                    <p className="text-sm text-muted-foreground">Receive a weekly summary of platform activity</p>
                  </div>
                  <Switch
                    checked={settingsData.weeklyDigest || true}
                    onCheckedChange={(checked) => handleSettingsChange('weeklyDigest', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Mentorship Notifications</Label>
                    <p className="text-sm text-muted-foreground">Get notified about mentorship opportunities</p>
                  </div>
                  <Switch
                    checked={settingsData.mentorshipNotifications || true}
                    onCheckedChange={(checked) => handleSettingsChange('mentorshipNotifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Project Updates</Label>
                    <p className="text-sm text-muted-foreground">Receive updates about your projects</p>
                  </div>
                  <Switch
                    checked={settingsData.projectUpdates || true}
                    onCheckedChange={(checked) => handleSettingsChange('projectUpdates', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Community Updates</Label>
                    <p className="text-sm text-muted-foreground">Stay updated with community news and events</p>
                  </div>
                  <Switch
                    checked={settingsData.communityUpdates || true}
                    onCheckedChange={(checked) => handleSettingsChange('communityUpdates', checked)}
                  />
                </div>
              </div>

              <Button onClick={handleSettingsUpdate} disabled={isUpdating}>
                {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save Notification Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}