import { NextRequest, NextResponse } from 'next/server';
import { Neo4jSkillService } from '@/lib/neo4jService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const uid = searchParams.get('uid');

    if (!uid) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Get user's current interests with DISTINCT to avoid duplicates
    const query = `
      MATCH (u:User {uid: $uid})-[r:INTERESTED_IN]->(i:Interest)
      RETURN DISTINCT i.name as name, i.category as category, i.description as description, i.popularity as popularity
      ORDER BY i.popularity DESC, i.name ASC
    `;

    const { executeRead } = await import('@/lib/neo4j');
    const result = await executeRead(query, { uid });
    
    const interests = result.map((record: any) => ({
      name: record.name,
      category: record.category || 'general',
      description: record.description || '',
      popularity: record.popularity || 1
    }));

    return NextResponse.json({ 
      success: true, 
      interests 
    });

  } catch (error) {
    console.error('User interests API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { uid, interestName, category, description, interests } = body;

    if (!uid) {
      return NextResponse.json({ error: 'UID is required' }, { status: 400 });
    }

    // Handle bulk interests update (from save profile)
    if (interests && Array.isArray(interests)) {
      // First, remove all existing interests for this user
      const clearQuery = `
        MATCH (u:User {uid: $uid})-[r:INTERESTED_IN]->(i:Interest)
        DELETE r
      `;
      
      const { executeWrite } = await import('@/lib/neo4j');
      await executeWrite(clearQuery, { uid });

      // Then add all new interests
      for (const interest of interests) {
        await Neo4jSkillService.addUserInterest(uid, {
          name: interest.name,
          category: interest.category || 'general',
          description: interest.description || ''
        });
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Interests updated successfully' 
      });
    }

    // Handle single interest addition (legacy support)
    if (!interestName) {
      return NextResponse.json({ error: 'Interest name is required for single interest addition' }, { status: 400 });
    }

    // Add single interest to user
    await Neo4jSkillService.addUserInterest(uid, {
      name: interestName,
      category: category || 'general',
      description: description || ''
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Interest added successfully' 
    });

  } catch (error) {
    console.error('Add user interest API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const uid = searchParams.get('uid');
    const interestName = searchParams.get('interest');

    if (!uid || !interestName) {
      return NextResponse.json({ error: 'UID and interest name are required' }, { status: 400 });
    }

    // Remove interest from user
    const query = `
      MATCH (u:User {uid: $uid})-[r:INTERESTED_IN]->(i:Interest {name: $interestName})
      DELETE r
      RETURN count(r) as deleted
    `;

    const { executeWrite } = await import('@/lib/neo4j');
    const result = await executeWrite(query, { uid, interestName });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Interest removed successfully',
      deleted: result
    });

  } catch (error) {
    console.error('Remove user interest API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
