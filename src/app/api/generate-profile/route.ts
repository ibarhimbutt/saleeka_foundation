import { NextResponse, type NextRequest } from 'next/server';
import { ai } from '@/ai/genkit';

export async function POST(req: NextRequest) {
  try {
    const { userType, interests } = await req.json();

    if (!userType || !interests || !Array.isArray(interests)) {
      return NextResponse.json(
        { error: 'User type and interests are required' },
        { status: 400 }
      );
    }

    const interestsText = interests.join(', ');
    
    const prompt = `Generate a professional and engaging bio for a ${userType} with interests in: ${interestsText}. 
    
    The bio should be:
    - 2-3 sentences long
    - Professional but personable
    - Highlight their interests and goals
    - Suitable for a professional networking platform
    - Specific to their role as a ${userType}
    
    Do not include placeholder text or brackets. Write in first person.`;

    const response = await ai.generate({
      prompt,
      config: {
        temperature: 0.7,
        maxOutputTokens: 150,
      },
    });

    const profile = response.text?.trim() || '';

    if (!profile) {
      throw new Error('No profile generated');
    }

    return NextResponse.json({ profile });

  } catch (error: any) {
    console.error('Profile generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate profile' },
      { status: 500 }
    );
  }
}