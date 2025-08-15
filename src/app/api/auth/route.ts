import { NextRequest, NextResponse } from 'next/server';
import { Neo4jUserService } from '@/lib/neo4jService';
import { hashPassword, verifyPassword } from '@/lib/neo4jAuth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, email, password, displayName, userType } = body;

    switch (action) {
      case 'signIn':
        // Sign in logic
        const user = await Neo4jUserService.getUserByEmail(email);
        if (!user) {
          return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const isValidPassword = await verifyPassword(password, user.password || '');
        if (!isValidPassword) {
          return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
        }

        return NextResponse.json({ 
          success: true, 
          user: {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            role: user.role,
            emailVerified: false,
            isAnonymous: false
          }
        });

      case 'signUp':
        // Check if user already exists
        const existingUser = await Neo4jUserService.getUserByEmail(email);
        if (existingUser) {
          return NextResponse.json({ error: 'User already exists' }, { status: 409 });
        }

        // Create new user
        const uid = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        const hashedPassword = await hashPassword(password);
        
        const userProfile = {
          uid,
          email,
          password: hashedPassword,
          displayName,
          firstName: displayName ? displayName.split(' ')[0] || '' : '',
          lastName: displayName ? displayName.split(' ').slice(1).join(' ') || '' : '',
          role: userType || 'student',
          type: userType || 'student',
          isActive: true,
          isVerified: false,
          profileVisibility: 'public' as const,
          showEmail: false,
          showPhone: false,
          showLocation: true,
          subscribeNewsletter: false,
          emailNotifications: true,
          pushNotifications: false,
          marketingEmails: false
        };

        await Neo4jUserService.createUser(userProfile);

        return NextResponse.json({ 
          success: true, 
          user: {
            uid,
            email,
            displayName,
            role: userType || 'student',
            emailVerified: false,
            isAnonymous: false
          }
        });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Auth API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
