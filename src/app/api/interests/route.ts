import { NextRequest, NextResponse } from 'next/server';
import { Neo4jSkillService } from '@/lib/neo4jService';

export async function GET(request: NextRequest) {
  try {
    // Get all interests from Neo4j with DISTINCT to avoid duplicates
    const query = `
      MATCH (i:Interest)
      RETURN DISTINCT i.name as name, i.category as category, i.description as description, i.popularity as popularity
      ORDER BY i.popularity DESC, i.name ASC
    `;

    const { executeRead } = await import('@/lib/neo4j');
    const result = await executeRead(query, {});
    
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
    console.error('Interests API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { uid, interestName, category, description } = body;

    if (!uid || !interestName) {
      return NextResponse.json({ error: 'UID and interest name are required' }, { status: 400 });
    }

    // Add interest to user using Neo4j service
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
    console.error('Add interest API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
