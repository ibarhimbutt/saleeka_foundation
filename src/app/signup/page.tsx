"use client";

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
// FIREBASE IMPORTS COMMENTED OUT - NOW USING NEO4J
// import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
// import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
// import { auth, db } from '@/lib/firebase';

// Import Neo4j authentication
import { createUserWithEmailAndPassword, updateProfile, updateUserPassword } from '@/lib/neo4jAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import Link from 'next/link';
import { UserPlus, Eye, EyeOff, Sparkles } from 'lucide-react';
import type { UserProfile, UserType } from '@/lib/firestoreTypes';
import AiImage from '@/components/shared/AiImage';

type SignupFormData = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  userType: UserType;
  interests: string;
  bio: string;
  agreeToTerms: boolean;
  subscribeNewsletter: boolean;
};

export default function SignupPage() {
  const [formData, setFormData] = useState<SignupFormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'unclassified',
    interests: '',
    bio: '',
    agreeToTerms: false,
    subscribeNewsletter: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Password update state
  const [updateEmail, setUpdateEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordUpdateMessage, setPasswordUpdateMessage] = useState('');
  
  const router = useRouter();
  const { toast } = useToast();

  const handleInputChange = (field: keyof SignupFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(null);
  };

  const handlePasswordUpdate = async () => {
    if (!updateEmail || !newPassword) return;
    
    setIsUpdatingPassword(true);
    setPasswordUpdateMessage('');
    
    try {
      await updateUserPassword(updateEmail, newPassword);
      setPasswordUpdateMessage('Password updated successfully!');
      setUpdateEmail('');
      setNewPassword('');
    } catch (error) {
      setPasswordUpdateMessage(`Error updating password: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const validateForm = (): string | null => {
    if (!formData.firstName.trim()) return "First name is required";
    if (!formData.lastName.trim()) return "Last name is required";
    if (!formData.email.trim()) return "Email is required";
    if (!formData.password) return "Password is required";
    if (formData.password.length < 6) return "Password must be at least 6 characters";
    if (formData.password !== formData.confirmPassword) return "Passwords do not match";
    if (formData.userType === 'unclassified') return "Please select your role";
    if (!formData.agreeToTerms) return "You must agree to the terms and conditions";
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) return "Please enter a valid email address";
    
    return null;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Create user with Neo4j Auth
      const userCredential = await createUserWithEmailAndPassword(
        formData.email,
        formData.password,
        `${formData.firstName} ${formData.lastName}`,
        formData.userType
      );

      const user = userCredential.user;
      const displayName = `${formData.firstName} ${formData.lastName}`;

      // Update user profile with additional information
      // Note: Neo4j auth already creates the user profile, so we just update additional fields
      if (formData.interests || formData.bio || formData.subscribeNewsletter) {
        // Additional profile updates can be done here if needed
        // For now, the basic profile is created during user creation
      }

      toast({
        title: "Account Created Successfully!",
        description: `Welcome to Saleeka Foundation, ${formData.firstName}!`,
      });

      // Redirect based on user type
      if (formData.userType === 'admin') {
        router.push('/admin');
      } else {
        router.push('/my-saleeka');
      }

    } catch (err: any) {
      console.error("Signup error:", err);
      let errorMessage = "Failed to create account. Please try again.";
      
      if (err.message === 'auth/email-already-in-use') {
        errorMessage = "An account with this email already exists.";
      } else if (err.message === 'auth/weak-password') {
        errorMessage = "Password is too weak. Please choose a stronger password.";
      } else if (err.message === 'auth/invalid-email') {
        errorMessage = "Please enter a valid email address.";
      }
      
      setError(errorMessage);
      toast({
        title: "Signup Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-accent/5 to-background flex items-center justify-center p-4">
      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8 items-center">
        {/* Left side - Branding and AI Image */}
        <div className="hidden md:block space-y-6">
          <div className="text-center">
            <Image
              src="./saleeka-logo.png"
              alt="Saleeka Foundation Logo"
              width={200}
              height={67}
              className="object-contain mx-auto mb-6"
              priority
            />
            <h1 className="font-headline text-3xl font-bold text-primary mb-2">
              Join Saleeka Foundation
            </h1>
            <p className="text-muted-foreground text-lg">
              Discover Your Path. Empower Your Future.
            </p>
          </div>
          
          <div className="rounded-lg overflow-hidden shadow-xl">
            <AiImage
              prompt="diverse group of young professionals and students collaborating, representing community growth and empowerment"
              alt="Saleeka Community"
              width={500}
              height={400}
              className="w-full h-auto"
              imageClassName="object-cover"
              fallbackImageUrl="https://placehold.co/500x400.png"
            />
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 text-accent mb-2">
              <Sparkles className="h-5 w-5" />
              <span className="font-medium">AI-Powered Platform</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Experience personalized mentorship matching and intelligent project recommendations
            </p>
          </div>
        </div>

        {/* Right side - Signup Form */}
        <Card className="w-full shadow-2xl">
          <CardHeader className="text-center md:text-left">
            <div className="md:hidden mb-4">
              <Image
                src="./saleeka-logo.png"
                alt="Saleeka Foundation Logo"
                width={150}
                height={50}
                className="object-contain mx-auto"
                priority
              />
            </div>
            <CardTitle className="font-headline text-2xl text-primary flex items-center gap-2">
              <UserPlus className="h-6 w-6" />
              Create Your Account
            </CardTitle>
            <CardDescription>
              Join our community of students, professionals, and organizations
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john.doe@example.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Password Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      required
                      disabled={isLoading}
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      required
                      disabled={isLoading}
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      disabled={isLoading}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>

              {/* User Type */}
              <div className="space-y-2">
                <Label htmlFor="userType">I am a... *</Label>
                <Select
                  value={formData.userType}
                  onValueChange={(value: UserType) => handleInputChange('userType', value)}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="professional">Professional/Mentor</SelectItem>
                    <SelectItem value="orgadmin">Organization Representative</SelectItem>
                    <SelectItem value="donor">Donor/Supporter</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Interests */}
              <div className="space-y-2">
                <Label htmlFor="interests">Interests/Skills (optional)</Label>
                <Input
                  id="interests"
                  type="text"
                  placeholder="e.g., Web Development, AI, Marketing, Design"
                  value={formData.interests}
                  onChange={(e) => handleInputChange('interests', e.target.value)}
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground">Separate multiple interests with commas</p>
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio">Tell us about yourself (optional)</Label>
                <Textarea
                  id="bio"
                  placeholder="Share your background, goals, or what you hope to achieve with Saleeka..."
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  disabled={isLoading}
                  className="min-h-[80px]"
                />
              </div>

              {/* Checkboxes */}
              <div className="space-y-3">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onCheckedChange={(checked) => handleInputChange('agreeToTerms', checked as boolean)}
                    disabled={isLoading}
                  />
                  <Label htmlFor="agreeToTerms" className="text-sm leading-5">
                    I agree to the{' '}
                    <Link href="/terms" className="text-primary hover:underline">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" className="text-primary hover:underline">
                      Privacy Policy
                    </Link>
                    *
                  </Label>
                </div>
                
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="subscribeNewsletter"
                    checked={formData.subscribeNewsletter}
                    onCheckedChange={(checked) => handleInputChange('subscribeNewsletter', checked as boolean)}
                    disabled={isLoading}
                  />
                  <Label htmlFor="subscribeNewsletter" className="text-sm leading-5">
                    Subscribe to our newsletter for updates and opportunities
                  </Label>
                </div>
              </div>

              {error && (
                <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>

            {/* Temporary Password Update Section */}
            <div className="mt-6 p-4 border border-orange-200 bg-orange-50 rounded-lg">
              <h3 className="text-sm font-medium text-orange-800 mb-3">
                🔧 Temporary Password Update Tool (For Testing)
              </h3>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="updateEmail" className="text-xs text-orange-700">
                    Email to update:
                  </Label>
                  <Input
                    id="updateEmail"
                    type="email"
                    placeholder="user@example.com"
                    value={updateEmail}
                    onChange={(e) => setUpdateEmail(e.target.value)}
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="newPassword" className="text-xs text-orange-700">
                    New password:
                  </Label>
                  <Input
                    id="newPassword"
                    type="text"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="text-sm"
                  />
                </div>
                <Button
                  onClick={handlePasswordUpdate}
                  disabled={!updateEmail || !newPassword || isUpdatingPassword}
                  className="w-full text-xs bg-orange-600 hover:bg-orange-700 text-white"
                >
                  {isUpdatingPassword ? 'Updating...' : 'Update Password'}
                </Button>
                {passwordUpdateMessage && (
                  <div className={`text-xs p-2 rounded ${
                    passwordUpdateMessage.includes('successfully') 
                      ? 'bg-green-100 text-green-800 border border-green-200' 
                      : 'bg-red-100 text-red-800 border border-red-200'
                  }`}>
                    {passwordUpdateMessage}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="text-center">
            <div className="w-full space-y-4">
              <p className="text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link href="/admin/login" className="text-primary hover:underline font-medium">
                  Sign in here
                </Link>
              </p>
              <p className="text-xs text-muted-foreground">
                &copy; {new Date().getFullYear()} Saleeka Foundation. All rights reserved.
              </p>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}