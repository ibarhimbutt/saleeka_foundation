import { NextRequest, NextResponse } from 'next/server';
import { Neo4jMentorshipService } from '@/lib/neo4jService';
import { Neo4jUserService } from '@/lib/neo4jService';

export async function POST(request: NextRequest) {
  try {
    const { studentUid, mentorUid } = await request.json();

    if (!studentUid || !mentorUid) {
      return NextResponse.json(
        { success: false, error: 'Student UID and Mentor UID are required' },
        { status: 400 }
      );
    }

    // Create the mentorship relationship with pending status
    await Neo4jMentorshipService.createMentorship(studentUid, mentorUid, {
      status: 'pending',
      startDate: new Date().toISOString(),
      goals: [],
      notes: []
    });

    // Note: Counts are NOT incremented here - they will be incremented when mentor accepts the request

    return NextResponse.json({
      success: true,
      message: 'Mentorship request sent successfully'
    });
  } catch (error) {
    console.error('Error creating mentorship:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create mentorship relationship'
      },
      { status: 500 }
    );
  }
}
