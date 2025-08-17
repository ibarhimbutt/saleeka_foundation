import { NextRequest, NextResponse } from 'next/server';
import { Neo4jMentorshipService } from '@/lib/neo4jService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mentorUid = searchParams.get('mentorUid');
    const studentUid = searchParams.get('studentUid');

    console.log('Pending requests API called with params:', { mentorUid, studentUid });

    if (!mentorUid && !studentUid) {
      console.log('Error: No mentorUid or studentUid provided');
      return NextResponse.json(
        { success: false, error: 'Either Mentor UID or Student UID is required' },
        { status: 400 }
      );
    }

    let pendingRequests: any[] = [];
    
    if (mentorUid) {
      console.log(`Fetching pending requests for mentor: ${mentorUid}`);
      // Get pending mentorship requests for the mentor
      pendingRequests = await Neo4jMentorshipService.getPendingMentorshipRequests(mentorUid);
      console.log(`Found ${pendingRequests.length} pending requests for mentor ${mentorUid}`);
    } else if (studentUid) {
      console.log(`Fetching pending requests for student: ${studentUid}`);
      // Get pending mentorship requests for the student
      pendingRequests = await Neo4jMentorshipService.getPendingMentorshipRequestsForStudent(studentUid);
      console.log(`Found ${pendingRequests.length} pending requests for student ${studentUid}`);
    }
    
    console.log('Returning pending requests:', { count: pendingRequests.length, requests: pendingRequests });
    
    return NextResponse.json({
      success: true,
      pendingRequests,
      count: pendingRequests.length
    });
  } catch (error) {
    console.error('Error fetching pending mentorship requests:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch pending mentorship requests'
      },
      { status: 500 }
    );
  }
}
