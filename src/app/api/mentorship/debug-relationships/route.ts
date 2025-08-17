import { NextRequest, NextResponse } from 'next/server';
import { executeRead } from '@/lib/neo4j';

export async function GET(request: NextRequest) {
  try {
    console.log('Debug relationships endpoint called');
    
    // Check all mentorship relationships
    const allRelationshipsQuery = `
      MATCH (s:User)-[r:IS_MENTORED_BY]->(m:User)
      RETURN s.uid as studentUid, s.type as studentType, m.uid as mentorUid, m.type as mentorType, r.status as status, r.startDate as startDate
      ORDER BY r.startDate DESC
    `;
    
    const allRelationships = await executeRead(allRelationshipsQuery, {});
    console.log(`Found ${allRelationships.length} total mentorship relationships`);
    
    // Check pending relationships specifically
    const pendingRelationshipsQuery = `
      MATCH (s:User)-[r:IS_MENTORED_BY]->(m:User)
      WHERE r.status = 'pending'
      RETURN s.uid as studentUid, s.type as studentType, m.uid as mentorUid, m.type as mentorType, r.status as status, r.startDate as startDate
      ORDER BY r.startDate DESC
    `;
    
    const pendingRelationships = await executeRead(pendingRelationshipsQuery, {});
    console.log(`Found ${pendingRelationships.length} pending mentorship relationships`);
    
    // Check MENTORS relationships too
    const mentorsRelationshipsQuery = `
      MATCH (m:User)-[r:MENTORS]->(s:User)
      WHERE r.status = 'pending'
      RETURN m.uid as mentorUid, m.type as mentorType, s.uid as studentUid, s.type as studentType, r.status as status, r.startDate as startDate
      ORDER BY r.startDate DESC
    `;
    
    const mentorsRelationships = await executeRead(mentorsRelationshipsQuery, {});
    console.log(`Found ${mentorsRelationships.length} pending MENTORS relationships`);
    
    return NextResponse.json({
      success: true,
      totalRelationships: allRelationships.length,
      pendingRelationships: pendingRelationships.length,
      pendingMentorsRelationships: mentorsRelationships.length,
      allRelationships,
      pendingRelationships,
      pendingMentorsRelationships
    });
  } catch (error) {
    console.error('Error in debug relationships:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to debug relationships',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
