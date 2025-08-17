import { NextRequest, NextResponse } from 'next/server';
import { Neo4jMentorshipService } from '@/lib/neo4jService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentUid = searchParams.get('studentUid');

    if (!studentUid) {
      return NextResponse.json(
        { success: false, error: 'Student UID is required' },
        { status: 400 }
      );
    }

    // Get active mentorships for the student
    const activeMentorships = await Neo4jMentorshipService.getActiveMentorships(studentUid, 'student');
    
    return NextResponse.json({
      success: true,
      activeMentorships,
      count: activeMentorships.length
    });
  } catch (error) {
    console.error('Error fetching active mentorships:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch active mentorships'
      },
      { status: 500 }
    );
  }
}
