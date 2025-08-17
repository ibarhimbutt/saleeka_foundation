import { NextRequest, NextResponse } from 'next/server';
import { Neo4jMentorshipService } from '@/lib/neo4jService';
import { Neo4jUserService } from '@/lib/neo4jService';

export async function POST(request: NextRequest) {
  try {
    const { studentUid, mentorUid, action } = await request.json();

    if (!studentUid || !mentorUid || !action) {
      return NextResponse.json(
        { success: false, error: 'Student UID, Mentor UID, and action are required' },
        { status: 400 }
      );
    }

    if (!['accept', 'reject'].includes(action)) {
      return NextResponse.json(
        { success: false, error: 'Action must be either "accept" or "reject"' },
        { status: 400 }
      );
    }

    const newStatus = action === 'accept' ? 'active' : 'rejected';
    
    // Update the mentorship status (this will handle count updates automatically)
    await Neo4jMentorshipService.updateMentorshipStatus(studentUid, mentorUid, newStatus);

    return NextResponse.json({
      success: true,
      message: `Mentorship request ${action}ed successfully`,
      status: newStatus
    });
  } catch (error) {
    console.error('Error responding to mentorship request:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to respond to mentorship request'
      },
      { status: 500 }
    );
  }
}
