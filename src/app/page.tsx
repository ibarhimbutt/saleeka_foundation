
"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Presentation, Heart, Building2 } from 'lucide-react';
import SectionTitle from '@/components/shared/SectionTitle';
import AiImage from '@/components/shared/AiImage';
import StudentHomepage from '@/components/home/StudentHomepage';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

const pillars = [
  { name: 'Students', icon: Users, color: 'text-blue-500', description: 'Connect with mentors, find projects, and access resources to kickstart your career.' },
  { name: 'Mentors', icon: Presentation, color: 'text-green-500', description: 'Share your expertise, mentor aspiring talents, and give back to the community.' },
  { name: 'Organizations', icon: Building2, color: 'text-purple-500', description: 'Post projects, find skilled students for internships, and collaborate on impactful initiatives.' },
  { name: 'Donors', icon: Heart, color: 'text-red-500', description: 'Support our mission to empower individuals and build a stronger future for all.' },
];

export default function Home() {
  const { user, userProfile, loading } = useAuth();

  // Show loading spinner while auth state is being determined
  if (loading) {
    return (
      <div className="container py-12">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  // If user is logged in and is a student, show student homepage
  if (user && userProfile && userProfile.type === 'student') {
    return <StudentHomepage />;
  }

  // Otherwise show the default homepage for non-authenticated users and non-students
  return (
    <div className="space-y-16 md:space-y-24">
      {/* Hero Section */}
      <section className="text-center py-16 md:py-24 bg-gradient-to-br from-indigo-100 via-purple-50 to-background rounded-lg shadow-sm">
        <div className="container">
          <h1 className="font-headline text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
            Discover Your Path. <span className="text-accent">Empower Your Future.</span>
          </h1>
          <p className="font-headline text-2xl md:text-3xl text-primary mb-4 font-semibold">
            The SALEEKA Way.
          </p>
          <p className="max-w-2xl mx-auto text-lg text-muted-foreground mb-10">
            Saleeka Foundation connects Students, Mentors, Organizations, and Donors to create a thriving ecosystem of learning, growth, and opportunity.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Button asChild size="lg" className="font-semibold">
              <Link href="/get-involved?tab=students">Join as Student</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="font-semibold border-primary text-primary hover:bg-primary/10">
              <Link href="/get-involved?tab=mentors">Mentor a Student</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Intro to Saleeka Foundation */}
      <section className="container">
        <SectionTitle
          title="Welcome to Saleeka Foundation"
          subtitle="We are dedicated to fostering connections that empower individuals and communities. Our mission is to bridge the gap between education and industry, creating opportunities for all."
        />
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h3 className="font-headline text-2xl font-semibold mb-4">Our Core Mission</h3>
            <p className="text-muted-foreground mb-4">
              At Saleeka, we believe in the power of collaboration. We provide a platform where students can gain practical experience, mentors can share their wisdom, organizations can find fresh talent, and donors can make a tangible impact.
            </p>
            <p className="text-muted-foreground">
              Join us in building a brighter future, one connection at a time.
            </p>
          </div>
          <div className="rounded-lg overflow-hidden shadow-lg">
            <Image
              src="/aiMentor.png"
              alt="Saleeka Foundation Community"
              width={600}
              height={400}
              className="w-full h-auto object-cover"
              data-ai-hint="diverse group collaboration community growth"
            />
          </div>
        </div>
      </section>

      {/* Pillars Section */}
      <section className="container">
        <SectionTitle title="Our Four Pillars" subtitle="The interconnected foundation of Saleeka's ecosystem, driving growth and opportunity for everyone involved." />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((pillar) => (
            <Card key={pillar.name} className="text-center hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <div className="mx-auto bg-accent/10 p-4 rounded-full w-fit mb-4">
                  <pillar.icon className={`w-10 h-10 ${pillar.color}`} strokeWidth={1.5} />
                </div>
                <CardTitle className="font-headline text-xl">{pillar.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{pillar.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="mt-8 rounded-lg overflow-hidden shadow-lg">
          {/* Using AiImage for this one, but you could change it if needed */}
          <AiImage
            prompt="An abstract, modern network-style illustration featuring four distinct yet interconnected pillars, each representing one of the foundation’s core components: Students, Mentors, Organizations, and Donors. Each pillar should have its own unique color and subtle symbolic icon (e.g., book for Students, lightbulb for Mentors, building for Organizations, heart for Donors), with soft glowing lines connecting them in a harmonious circular network, conveying collaboration, support, and unity."
            alt="Four Pillars Connection Graphic"
            width={800}
            height={300}
            className="w-full h-auto"
            imageClassName="object-cover"
            fallbackImageUrl="/Banner.png"
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="container text-center py-12 bg-accent/10 rounded-lg shadow-sm">
        <h2 className="font-headline text-3xl font-bold mb-6">Ready to Get Involved?</h2>
        <p className="max-w-xl mx-auto text-muted-foreground mb-8">
          Whether you're looking to learn, mentor, collaborate, or support, there's a place for you at Saleeka.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button asChild size="lg" className="bg-accent hover:bg-accent/90">
            <Link href="/get-involved?tab=organizations">Post a Project</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="border-accent text-accent hover:bg-accent/10">
            <Link href="/get-involved?tab=donors">Support Us</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
