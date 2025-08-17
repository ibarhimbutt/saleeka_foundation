import { NextRequest, NextResponse } from 'next/server';
import { Neo4jMentorService } from '@/lib/neo4jService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '12');
    const category = searchParams.get('category') || undefined;
    
    const mentors = await Neo4jMentorService.getAllMentors(limit, category);
    
    return NextResponse.json({
      success: true,
      mentors,
      count: mentors.length
    });
  } catch (error) {
    console.error('Error fetching mentors:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch mentors',
        mentors: []
      },
      { status: 500 }
    );
  }
}
