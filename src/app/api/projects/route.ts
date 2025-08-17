import { NextRequest, NextResponse } from 'next/server';
import { Neo4jProjectService } from '@/lib/neo4jService';

export async function GET(request: NextRequest) {
  try {
    console.log('Fetching projects from Neo4j...');
    const projects = await Neo4jProjectService.getAllProjects();
    console.log('Projects fetched:', projects.length, 'projects');
    
    return NextResponse.json({
      success: true,
      projects,
      count: projects.length
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch projects',
        projects: []
      },
      { status: 500 }
    );
  }
}
