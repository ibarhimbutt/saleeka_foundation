import { NextRequest, NextResponse } from 'next/server';
import { Neo4jActivityService } from '@/lib/neo4jService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { uid, action, description, metadata } = body;

    if (!uid || !action || !description) {
      return NextResponse.json({ error: 'UID, action, and description are required' }, { status: 400 });
    }

    await Neo4jActivityService.logUserActivity({
      uid,
      action,
      description,
      metadata: metadata || {},
      ipAddress: 'unknown', // In a real app, get this from request context
      userAgent: 'unknown'  // In a real app, get this from request context
    });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Activity logged successfully' 
    });
  } catch (error) {
    console.error('User activity API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const uid = searchParams.get('uid');
    const limit = Math.floor(parseInt(searchParams.get('limit') || '10'));

    if (!uid) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const activities = await Neo4jActivityService.getUserActivity(uid, limit);
    
    return NextResponse.json({ 
      success: true, 
      activities 
    });
  } catch (error) {
    console.error('User activity fetch API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
