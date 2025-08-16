"use client";

import { useState, type FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import Link from 'next/link';
import { UserPlus, Eye, EyeOff, Sparkles, X, Plus } from 'lucide-react';
import type { UserProfile, UserType } from '@/lib/firestoreTypes';
import AiImage from '@/components/shared/AiImage';

interface Interest {
  name: string;
  category: string;
  description: string;
  popularity: number;
}

type SignupFormData = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  userType: UserType;
  interests: Interest[];
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
    interests: [],
    bio: '',
    agreeToTerms: false,
    subscribeNewsletter: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Interests state
  const [availableInterests, setAvailableInterests] = useState<Interest[]>([]);
  const [selectedInterest, setSelectedInterest] = useState<string>('');
  const [loadingInterests, setLoadingInterests] = useState(false);
  
  const router = useRouter();
  const { toast } = useToast();

  // Load available interests
  useEffect(() => {
    const loadInterests = async () => {
      setLoadingInterests(true);
      try {
        const response = await fetch('/api/interests');
        if (response.ok) {
          const data = await response.json();
          setAvailableInterests(data.interests || []);
        }
      } catch (error) {
        console.error('Error loading interests:', error);
      } finally {
        setLoadingInterests(false);
      }
    };

    loadInterests();
  }, []);

  const handleInputChange = (field: keyof SignupFormData, value: string | boolean | Interest[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(null);
  };

  // Add interest to form
  const addInterest = (interestName: string) => {
    const interest = availableInterests.find(i => i.name === interestName);
    if (interest && !formData.interests.some(i => i.name === interest.name)) {
      setFormData(prev => {
        const newInterests = [...prev.interests, interest];
        // Remove any duplicates that might exist
        const uniqueInterests = newInterests.filter((item, index, self) => 
          index === self.findIndex(i => i.name === item.name)
        );
        return {
          ...prev,
          interests: uniqueInterests
        };
      });
      setSelectedInterest('');
    } else if (interest && formData.interests.some(i => i.name === interest.name)) {
      // Show toast for duplicate interest
      toast({
        title: "Interest Already Added",
        description: `${interest.name} is already in your interests.`,
        variant: "destructive",
      });
    }
  };

  // Remove interest from form
  const removeInterest = (interestName: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.filter(i => i.name !== interestName)
    }));
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
      // Check if auth is available
      if (!auth) {
        throw new Error('Firebase auth is not initialized');
      }

      // Create user with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      const user = userCredential.user;
      const displayName = `${formData.firstName} ${formData.lastName}`;

      // Update Firebase user profile
      await updateProfile(user, { displayName });

      // Create user profile in Neo4j via API route
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uid: user.uid,
          email: user.email,
          displayName,
          userType: formData.userType,
          interests: formData.interests.map(i => i.name), // Send interest names
          bio: formData.bio,
          subscribeNewsletter: formData.subscribeNewsletter,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create user profile');
      }

      // Add interests to user (create relationships)
      for (const interest of formData.interests) {
        try {
          await fetch('/api/user/interests', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              uid: user.uid,
              interestName: interest.name,
              category: interest.category,
              description: interest.description,
            }),
          });
        } catch (error) {
          console.warn('Failed to add interest:', interest.name, error);
          // Continue with other interests even if one fails
        }
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
      
      if (err.code === 'auth/email-already-in-use') {
        errorMessage = "An account with this email already exists.";
      } else if (err.code === 'auth/weak-password') {
        errorMessage = "Password is too weak. Please choose a stronger password.";
      } else if (err.code === 'auth/invalid-email') {
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
              src="/saleeka-logo.png"
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
                src="/saleeka-logo.png"
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
                  <SelectContent position="popper" side="bottom" align="start">
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="professional">Professional/Mentor</SelectItem>
                    <SelectItem value="orgadmin">Organization Representative</SelectItem>
                    <SelectItem value="donor">Donor/Supporter</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Interests */}
              <div className="space-y-3">
                <Label htmlFor="interests">Interests/Skills (optional)</Label>
                
                {/* Interest Selection Dropdown - Fixed Position */}
                <div className="relative">
                  {availableInterests.length > 0 && (
                    <Select
                      value={selectedInterest}
                      onValueChange={(value) => addInterest(value)}
                      disabled={loadingInterests || formData.interests.length >= 5} // Limit to 5 interests
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Add Interest" />
                      </SelectTrigger>
                      <SelectContent position="popper" side="bottom" align="start">
                        {availableInterests.map((interest) => (
                          <SelectItem key={interest.name} value={interest.name}>
                            {interest.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                {/* Selected Interests Display - Below Dropdown */}
                {formData.interests.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Your Interests:</span>
                      <span className="text-xs text-muted-foreground">
                        {formData.interests.length}/5
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.interests.map((interest) => (
                        <Badge key={interest.name} variant="secondary" className="flex items-center gap-1">
                          {interest.name}
                          <X 
                            className="ml-1 h-3 w-3 cursor-pointer hover:text-destructive" 
                            onClick={() => removeInterest(interest.name)} 
                          />
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <p className="text-xs text-muted-foreground">
                  Select an interest from the dropdown above to add it. You can add up to 5 interests.
                </p>
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