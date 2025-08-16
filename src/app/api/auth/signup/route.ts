import { NextRequest, NextResponse } from 'next/server';
import { Neo4jUserService } from '@/lib/neo4jService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { uid, email, displayName, firstName, lastName, userType, interests, bio, subscribeNewsletter } = body;

    // Create user profile in Neo4j
    const userProfile: any = {
      uid,
      email,
      displayName,
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
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await Neo4jUserService.createUser(userProfile);

    return NextResponse.json({ 
      success: true, 
      message: 'User profile created successfully in Neo4j' 
    });

  } catch (error) {
    console.error('Signup API error:', error);
    return NextResponse.json({ 
      error: 'Failed to create user profile' 
    }, { status: 500 });
  }
}
