import { NextRequest, NextResponse } from 'next/server';
import { Neo4jUserService } from '@/lib/neo4jService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email parameter is required' }, { status: 400 });
    }

    const user = await Neo4jUserService.getUserByEmail(email);
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Remove sensitive information
    const { password, ...safeUser } = user;
    
    return NextResponse.json({ 
      success: true, 
      user: safeUser 
    });
  } catch (error) {
    console.error('User profile API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { uid, updates } = body;

    if (!uid || !updates) {
      return NextResponse.json({ error: 'UID and updates are required' }, { status: 400 });
    }

    const updatedUser = await Neo4jUserService.updateUser(uid, updates);
    
    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Remove sensitive information
    const { password, ...safeUser } = updatedUser;
    
    return NextResponse.json({ 
      success: true, 
      user: safeUser 
    });
  } catch (error) {
    console.error('User profile update API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
