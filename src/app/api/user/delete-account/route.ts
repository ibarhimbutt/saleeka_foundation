import { NextRequest, NextResponse } from 'next/server';
import { Neo4jUserService } from '@/lib/neo4jService';

export async function DELETE(request: NextRequest) {
  try {
    const { uid } = await request.json();

    if (!uid) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Delete user data from Neo4j first
    try {
      await Neo4jUserService.deleteUser(uid);
      console.log(`User data deleted from Neo4j for UID: ${uid}`);
    } catch (error) {
      console.error('Error deleting user data from Neo4j:', error);
      // Continue with Firebase deletion even if Neo4j deletion fails
    }

    // Note: Firebase user deletion requires re-authentication
    // This endpoint will be called after the user re-authenticates on the frontend
    // The actual Firebase user deletion will happen in the frontend after re-authentication

    return NextResponse.json(
      { success: true, message: 'User account deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting user account:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete user account' },
      { status: 500 }
    );
  }
}
