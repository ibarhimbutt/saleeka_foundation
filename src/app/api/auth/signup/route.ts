import { NextRequest, NextResponse } from 'next/server';
import { Neo4jUserService } from '@/lib/neo4jService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { uid, email, displayName, firstName, lastName, userType, interests, bio, subscribeNewsletter, mentorCategory } = body;

    console.log('Signup API - Received data:', { uid, email, displayName, userType, mentorCategory });

    // Create user profile in Neo4j
    const userProfile: any = {
      uid,
      email,
      displayName,
      firstName,
      lastName,
      role: userType,
      type: userType,
      interests,
      bio,
      isActive: true,
      isVerified: false,
      profileVisibility: 'public',
      showEmail: false,
      showPhone: false,
      showLocation: true,
      subscribeNewsletter,
      emailNotifications: true,
      pushNotifications: false,
      marketingEmails: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Add mentor-specific fields if user is a mentor
    if (userType === 'mentor' && mentorCategory) {
      userProfile.category = mentorCategory;
      userProfile.expertise = [mentorCategory]; // Initialize with primary category
      userProfile.yearsOfExperience = 0; // Default value
      userProfile.maxMentees = 3; // Default value
      userProfile.currentMentees = 0; // Default value
      userProfile.rating = 0; // Default value
      userProfile.totalMentees = 0; // Default value
    }

    console.log('Signup API - User profile to create:', userProfile);

    await Neo4jUserService.createUser(userProfile);

    console.log('Signup API - User profile created successfully');

    return NextResponse.json({ 
      success: true, 
      message: 'User profile created successfully in Neo4j' 
    });

  } catch (error) {
    console.error('Signup API error:', error);
    console.error('Signup API error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json({ 
      error: 'Failed to create user profile' 
    }, { status: 500 });
  }
}
