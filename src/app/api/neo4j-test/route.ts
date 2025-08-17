import { NextRequest, NextResponse } from 'next/server';
import { executeRead } from '@/lib/neo4j';

export async function GET(request: NextRequest) {
  try {
    console.log('Testing Neo4j connection...');
    
    // Test basic connection
    const testQuery = 'RETURN "Neo4j connection successful" as message';
    const testResult = await executeRead(testQuery, {});
    
    // Count nodes
    const countQuery = 'MATCH (n) RETURN labels(n) as labels, count(n) as count ORDER BY count DESC';
    const countResult = await executeRead(countQuery, {});
    
    // Check for projects
    const projectsQuery = 'MATCH (p:Project) RETURN p.title, p.category, p.status LIMIT 5';
    const projectsResult = await executeRead(projectsQuery, {});
    
    // Check for organizations
    const orgsQuery = 'MATCH (o:Organization) RETURN o.name, o.type LIMIT 5';
    const orgsResult = await executeRead(orgsQuery, {});
    
    return NextResponse.json({
      success: true,
      connection: testResult[0] ? (testResult[0] as any).message || 'Unknown' : 'Unknown',
      nodeCounts: countResult,
      sampleProjects: projectsResult,
      sampleOrganizations: orgsResult,
      message: 'Neo4j connection test completed'
    });
  } catch (error) {
    console.error('Neo4j connection test failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Neo4j connection failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
