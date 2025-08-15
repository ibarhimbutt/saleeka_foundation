import { NextRequest, NextResponse } from 'next/server';
import { Neo4jMigrationService } from '@/lib/neo4jMigration';

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();
    
    switch (action) {
      case 'init':
        console.log('🚀 Initializing Neo4j database...');
        await Neo4jMigrationService.initializeDatabase();
        return NextResponse.json({ 
          success: true, 
          message: 'Neo4j database initialized successfully' 
        });
        
      case 'test':
        console.log('🧪 Running Neo4j tests...');
        await Neo4jMigrationService.runAllTests();
        return NextResponse.json({ 
          success: true, 
          message: 'All Neo4j tests passed successfully' 
        });
        
      case 'stats':
        console.log('📊 Getting database statistics...');
        await Neo4jMigrationService.getDatabaseStats();
        return NextResponse.json({ 
          success: true, 
          message: 'Database statistics retrieved successfully' 
        });
        
      case 'sample-data':
        console.log('🌱 Creating sample data...');
        const studentUid = await Neo4jMigrationService.createSampleUser();
        const mentorUid = await Neo4jMigrationService.createSampleMentor();
        return NextResponse.json({ 
          success: true, 
          message: 'Sample data created successfully',
          data: { studentUid, mentorUid }
        });
        
      default:
        return NextResponse.json({ 
          success: false, 
          message: 'Invalid action. Use: init, test, stats, or sample-data' 
        }, { status: 400 });
    }
  } catch (error) {
    console.error('❌ Neo4j API error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'An error occurred',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Return available actions
    return NextResponse.json({
      success: true,
      message: 'Neo4j API is running',
      availableActions: [
        'init - Initialize database and create indexes',
        'test - Run all functionality tests',
        'stats - Get database statistics',
        'sample-data - Create sample users for testing'
      ],
      usage: 'Send POST request with { "action": "action_name" }'
    });
  } catch (error) {
    console.error('❌ Neo4j API GET error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'An error occurred',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
