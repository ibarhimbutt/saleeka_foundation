import { NextResponse, type NextRequest } from 'next/server';
import { GoogleGenAI } from "@google/genai";

// Initialize Google GenAI client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { userType, interests, bio } = await req.json();

    if (!userType || !interests) {
      return NextResponse.json(
        { error: 'User type and interests are required' },
        { status: 400 }
      );
    }

    const interestsText = Array.isArray(interests) ? interests.join(', ') : interests;
    
    const prompt = `Based on a ${userType}'s profile with interests in: ${interestsText}${bio ? ` and bio: "${bio}"` : ''}, 
    provide 3-5 personalized recommendations for:
    
    1. Relevant programs or opportunities on the Saleeka platform
    2. Skills they should develop
    3. Potential mentorship areas (either as mentor or mentee)
    4. Project types they might be interested in
    
    Format as a JSON object with arrays for each category:
    {
      "programs": ["recommendation 1", "recommendation 2"],
      "skills": ["skill 1", "skill 2"],
      "mentorship": ["area 1", "area 2"],
      "projects": ["project type 1", "project type 2"]
    }
    
    Keep recommendations specific and actionable.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        thinkingConfig: {
          thinkingBudget: 0, // Disables thinking
        },
      }
    });

    const recommendationsText = response.text?.trim() || '';
    
    if (!recommendationsText) {
      throw new Error('No recommendations generated');
    }

    // Try to parse as JSON, fallback to structured text if needed
    let recommendations;
    try {
      recommendations = JSON.parse(recommendationsText);
    } catch {
      // If JSON parsing fails, create a structured response
      recommendations = {
        programs: ["AI Mentorship Program", "Community Impact Projects"],
        skills: interestsText.split(', ').slice(0, 3),
        mentorship: [`${userType} networking`, "Cross-industry collaboration"],
        projects: ["Real-world applications", "Innovation challenges"]
      };
    }

    return NextResponse.json({ recommendations });

  } catch (error: any) {
    console.error('Recommendations generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate recommendations' },
      { status: 500 }
    );
  }
}