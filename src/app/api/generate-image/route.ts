
import { NextResponse, type NextRequest } from 'next/server';
import { GoogleGenAI, Modality } from '@google/genai';

// Per request: use Google GenAI for image generation with the provided API key
const API_KEY = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({ apiKey: API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length < 3) {
      return NextResponse.json({ error: 'A valid prompt is required (min 3 characters).' }, { status: 400 });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-preview-image-generation',
      contents: prompt,
      config: {
        responseModalities: [Modality.TEXT, Modality.IMAGE],
      },
    });

    const candidates = response?.candidates ?? [];
    if (candidates.length === 0) {
      return NextResponse.json({ error: 'No candidates returned from the model.' }, { status: 500 });
    }

    const parts = candidates[0]?.content?.parts ?? [];
    let imageBase64: string | null = null;
    let mimeType = 'image/png';
    const texts: string[] = [];

    for (const part of parts) {
      // part.text or part.inlineData?.data
      if ((part as any).text) {
        texts.push((part as any).text as string);
      } else if ((part as any).inlineData?.data) {
        imageBase64 = (part as any).inlineData.data as string;
        if ((part as any).inlineData?.mimeType) {
          mimeType = (part as any).inlineData.mimeType as string;
        }
      }
    }

    if (!imageBase64) {
      return NextResponse.json({ error: 'Image generation failed: no image returned.' }, { status: 500 });
    }

    const dataUrl = `data:${mimeType};base64,${imageBase64}`;
    return NextResponse.json({
      imageUrl: dataUrl,
      provider: 'gemini-2.0-flash-preview-image-generation',
      text: texts.join('\n'),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Image generation failed.' },
      { status: 500 }
    );
  }
}
