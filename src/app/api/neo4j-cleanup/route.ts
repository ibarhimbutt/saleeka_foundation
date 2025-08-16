import { NextRequest, NextResponse } from 'next/server';
import { executeWrite, executeRead } from '@/lib/neo4j';

export async function POST(request: NextRequest) {
  try {
    // 1. Consolidate duplicate node labels (STUDENT -> User, Student -> User, etc.)
    const consolidateLabelsQuery = `
      MATCH (n)
      WHERE n:STUDENT OR n:Student OR n:MENTOR OR n:Mentor OR n:Professional OR n:Admin OR n:Donor
      REMOVE n:STUDENT, n:Student, n:MENTOR, n:Mentor, n:Professional, n:Admin, n:Donor
      SET n:User
      RETURN count(n) as nodesUpdated
    `;

    const labelResult = await executeWrite(consolidateLabelsQuery);
    console.log('Labels consolidated:', labelResult);

    // 2. Consolidate firstName/lastName into displayName for existing users
    const consolidateNamesQuery = `
      MATCH (u:User)
      WHERE (u.firstName IS NOT NULL OR u.lastName IS NOT NULL) AND (u.displayName IS NULL OR u.displayName = '')
      SET u.displayName = CASE 
        WHEN u.firstName IS NOT NULL AND u.lastName IS NOT NULL 
        THEN u.firstName + ' ' + u.lastName
        WHEN u.firstName IS NOT NULL 
        THEN u.firstName
        WHEN u.lastName IS NOT NULL 
        THEN u.lastName
        ELSE u.displayName
      END
      RETURN count(u) as namesConsolidated
    `;

    const namesResult = await executeWrite(consolidateNamesQuery);
    console.log('Names consolidated:', namesResult);

    // 3. Remove redundant firstName and lastName properties
    const removeRedundantPropsQuery = `
      MATCH (u:User)
      WHERE u.firstName IS NOT NULL OR u.lastName IS NOT NULL
      REMOVE u.firstName, u.lastName
      RETURN count(u) as propsRemoved
    `;

    const propsResult = await executeWrite(removeRedundantPropsQuery);
    console.log('Redundant properties removed:', propsResult);

    // 4. Create indexes for better performance
    const createIndexesQuery = `
      CREATE INDEX user_uid IF NOT EXISTS FOR (u:User) ON (u.uid);
      CREATE INDEX user_email IF NOT EXISTS FOR (u:User) ON (u.email);
      CREATE INDEX user_type IF NOT EXISTS FOR (u:User) ON (u.type);
    `;

    try {
      await executeWrite(createIndexesQuery);
      console.log('Indexes created/updated');
    } catch (error) {
      console.warn('Index creation warning:', error);
    }

    // 5. Get database statistics after cleanup
    const statsQuery = `
      MATCH (n)
      RETURN labels(n) as labels, count(n) as count
      ORDER BY count DESC
    `;

    const statsResult = await executeRead(statsQuery);
    console.log('Database stats after cleanup:', statsResult);

    return NextResponse.json({ 
      success: true, 
      message: 'Database cleanup completed successfully',
      results: {
        labelsConsolidated: labelResult,
        namesConsolidated: namesResult,
        propsRemoved: propsResult,
        finalStats: statsResult
      }
    });

  } catch (error) {
    console.error('Database cleanup error:', error);
    return NextResponse.json({ 
      error: 'Database cleanup failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
