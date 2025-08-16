import { NextRequest, NextResponse } from 'next/server';
import { Neo4jUserService } from '@/lib/neo4jService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const uid = searchParams.get('uid');

    if (!uid) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const userProfile = await Neo4jUserService.getUserByUid(uid);

    if (!userProfile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      user: userProfile 
    });

  } catch (error) {
    console.error('Profile API error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch user profile' 
    }, { status: 500 });
  }
}
