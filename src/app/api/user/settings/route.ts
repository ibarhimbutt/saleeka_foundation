import { NextRequest, NextResponse } from 'next/server';
import { Neo4jSettingsService } from '@/lib/neo4jService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const uid = searchParams.get('uid');

    if (!uid) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const settings = await Neo4jSettingsService.getUserSettings(uid);
    
    if (!settings) {
      // Return default settings if none exist
      const defaultSettings = {
        theme: 'system',
        language: 'en',
        emailNotifications: true,
        pushNotifications: true,
        marketingEmails: false,
        weeklyDigest: true,
        mentorshipNotifications: true,
        projectUpdates: true,
        communityUpdates: true,
      };
      
      return NextResponse.json({ 
        success: true, 
        settings: defaultSettings 
      });
    }
    
    return NextResponse.json({ 
      success: true, 
      settings 
    });
  } catch (error) {
    console.error('User settings API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { uid, settings } = body;

    if (!uid || !settings) {
      return NextResponse.json({ error: 'UID and settings are required' }, { status: 400 });
    }

    await Neo4jSettingsService.upsertUserSettings(uid, settings);
    
    // Return the updated settings
    const updatedSettings = await Neo4jSettingsService.getUserSettings(uid);
    
    return NextResponse.json({ 
      success: true, 
      settings: updatedSettings 
    });
  } catch (error) {
    console.error('User settings update API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
