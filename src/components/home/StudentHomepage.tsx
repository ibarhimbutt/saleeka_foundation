"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, MapPin, Briefcase, Users, Calendar, ArrowRight } from 'lucide-react';
import SectionTitle from '@/components/shared/SectionTitle';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { useAuth } from '@/contexts/AuthContext';

interface Mentor {
  uid: string;
  displayName: string;
  bio?: string;
  photoURL?: string;
  expertise: string[];
  yearsOfExperience: number;
  industry?: string;
  location?: string;
  rating?: number;
  totalMentees?: number;
  maxMentees?: number;
  currentMentees?: number;
  skills: string[];
  company?: string;
  jobTitle?: string;
}

export default function StudentHomepage() {
  const { user } = useAuth();
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  useEffect(() => {
    fetchMentors();
  }, [selectedCategory]);

  const fetchMentors = async () => {
    try {
      setLoading(true);
      const url = selectedCategory 
        ? `/api/mentors?category=${encodeURIComponent(selectedCategory)}`
        : '/api/mentors';
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setMentors(data.mentors || []);
      } else {
        console.error('Failed to fetch mentors');
        setMentors([]);
      }
    } catch (error) {
      console.error('Error fetching mentors:', error);
      setMentors([]);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    'Software Engineering',
    'Data Science',
    'Product Management',
    'Marketing',
    'Design',
    'Business',
    'Healthcare',
    'Education'
  ];

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getAvailabilityColor = (current: number, max: number) => {
    const ratio = current / max;
    if (ratio < 0.5) return 'text-green-600';
    if (ratio < 0.8) return 'text-yellow-600';
    return 'text-red-600';
  };



  return (
    <div className="space-y-16 md:space-y-24">
      {/* Welcome Section */}
      <section className="text-center py-16 md:py-24 bg-gradient-to-br from-blue-100 via-indigo-50 to-background rounded-lg shadow-sm">
        <div className="container">
          <h1 className="font-headline text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
            Welcome back, <span className="text-accent">{user?.displayName || 'Student'}!</span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-muted-foreground mb-10">
            Discover mentors, explore projects, and take the next step in your career journey. 
            Your personalized dashboard is ready to help you grow.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Button asChild size="lg" className="font-semibold">
              <Link href="/projects">Explore Projects</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="font-semibold border-primary text-primary hover:bg-primary/10">
              <Link href="/my-saleeka">My Dashboard</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-blue-600">{mentors.length}</div>
              <div className="text-sm text-muted-foreground">Available Mentors</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-600">
                {mentors.filter(m => m.currentMentees && m.maxMentees && m.currentMentees < m.maxMentees).length}
              </div>
              <div className="text-sm text-muted-foreground">Mentors Available</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-purple-600">
                {new Set(mentors.flatMap(m => m.expertise)).size}
              </div>
              <div className="text-sm text-muted-foreground">Expertise Areas</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-orange-600">
                {Math.round(mentors.reduce((acc, m) => acc + (m.rating || 0), 0) / Math.max(mentors.length, 1))}
              </div>
              <div className="text-sm text-muted-foreground">Avg. Rating</div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Mentors Section */}
      <section className="container">
        <SectionTitle
          title="Find Your Perfect Mentor"
          subtitle="Connect with experienced mentors who can guide your career journey"
        />
        
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          <Button
            variant={selectedCategory === '' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory('')}
          >
            All Categories
          </Button>
          {categories.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Mentors Grid */}
        {loading ? (
          <div className="text-center py-12">
            <LoadingSpinner size="lg" text="Loading mentors..." />
          </div>
        ) : (() => {
          // Additional client-side filtering to ensure strict category matching
          const filteredMentors = selectedCategory 
            ? mentors.filter(mentor => {
                const expertiseArray = Array.isArray(mentor.expertise) 
                  ? mentor.expertise 
                  : (typeof mentor.expertise === 'string' 
                      ? (() => { 
                          try { 
                            return JSON.parse(mentor.expertise); 
                          } catch { 
                            return []; 
                          } 
                        })() 
                      : []);
                
                // Check if mentor has the selected category in their expertise
                return expertiseArray.length > 0 && expertiseArray.includes(selectedCategory);
              })
            : mentors;
          
          if (filteredMentors.length === 0) {
            return (
              <div className="text-center py-12">
                <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {selectedCategory ? 'No mentors available' : 'No mentors found'}
                </h3>
                <p className="text-muted-foreground">
                  {selectedCategory 
                    ? `No mentors are currently available in the "${selectedCategory}" category. Try selecting a different category or check back later.`
                    : 'No mentors are currently available. Check back later for new mentor opportunities.'
                  }
                </p>
                {selectedCategory && (
                  <div className="mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedCategory('')}
                    >
                      View All Categories
                    </Button>
                  </div>
                )}
              </div>
            );
          }
          
          return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMentors.map((mentor) => (
                <Card key={mentor.uid} className="hover:shadow-lg transition-shadow duration-300">
                  <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                      <Avatar className="h-20 w-20">
                        <AvatarImage src={mentor.photoURL} alt={mentor.displayName} />
                        <AvatarFallback className="text-lg font-semibold">
                          {getInitials(mentor.displayName)}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <CardTitle className="text-lg">{mentor.displayName}</CardTitle>
                    {mentor.jobTitle && mentor.company && (
                      <p className="text-sm text-muted-foreground">
                        {mentor.jobTitle} at {mentor.company}
                      </p>
                    )}
                    {mentor.rating && (
                      <div className="flex items-center justify-center gap-1 mt-2">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{mentor.rating.toFixed(1)}</span>
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {mentor.bio && (
                      <p className="text-sm text-muted-foreground line-clamp-3 text-center">
                        {mentor.bio}
                      </p>
                    )}
                    
                    <div className="flex flex-wrap gap-2 justify-center">
                      {(() => {
                        // Ensure expertise is always an array
                        const expertiseArray = Array.isArray(mentor.expertise) 
                          ? mentor.expertise 
                          : (typeof mentor.expertise === 'string' 
                              ? (() => { 
                                  try { 
                                    return JSON.parse(mentor.expertise); 
                                  } catch { 
                                    return []; 
                                  } 
                                })() 
                              : []);
                        
                        return expertiseArray.length > 0 ? (
                          <>
                            {expertiseArray.slice(0, 3).map((expertise: string) => (
                              <Badge key={expertise} variant="secondary" className="text-xs">
                                {expertise}
                              </Badge>
                            ))}
                            {expertiseArray.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{expertiseArray.length - 3} more
                              </Badge>
                            )}
                          </>
                        ) : null;
                      })()}
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="truncate">{mentor.location || 'Remote'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                        <span>{mentor.yearsOfExperience}+ years</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className={getAvailabilityColor(mentor.currentMentees || 0, mentor.maxMentees || 1)}>
                          {mentor.currentMentees || 0}/{mentor.maxMentees || 5} mentees
                        </span>
                      </div>
                      {mentor.industry && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs bg-muted px-2 py-1 rounded">
                            {mentor.industry}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="pt-2">
                      <Button className="w-full" size="sm">
                        Connect with Mentor
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          );
        })()}
      </section>

      {/* Quick Actions */}
      <section className="container">
        <SectionTitle
          title="Quick Actions"
          subtitle="Jump right into what matters most for your growth"
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                Schedule Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Book one-on-one sessions with your mentors to discuss your goals and progress.
              </p>
              <Button className="w-full" size="sm">
                Book Session
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-green-600" />
                Apply to Projects
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Browse and apply to real-world projects that match your skills and interests.
              </p>
              <Button asChild className="w-full" size="sm">
                <Link href="/projects">View Projects</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-600" />
                Join Communities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Connect with peers and mentors in your field of interest.
              </p>
              <Button className="w-full" size="sm">
                Explore Communities
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container text-center py-12 bg-accent/10 rounded-lg shadow-sm">
        <h2 className="font-headline text-3xl font-bold mb-6">Ready to Take Action?</h2>
        <p className="max-w-xl mx-auto text-muted-foreground mb-8">
          Your next opportunity is waiting. Start exploring projects, connecting with mentors, 
          and building your professional network today.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button asChild size="lg" className="bg-accent hover:bg-accent/90">
            <Link href="/projects">Browse Projects</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="border-accent text-accent hover:bg-accent/10">
            <Link href="/my-saleeka">View Dashboard</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
