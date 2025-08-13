'use server';

/**
 * @fileOverview A content summarization AI agent using Google GenAI.
 */

import { GoogleGenAI } from "@google/genai";

export type SummarizeContentInput = {
  content: string;
};

export type SummarizeContentOutput = {
  summary: string;
};

// Initialize Google GenAI client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
});

export async function summarizeContent(input: SummarizeContentInput): Promise<SummarizeContentOutput> {
  try {
    console.log('SummarizeContent: Starting summarization for content length:', input.content.length);
    
    if (!input.content || input.content.trim().length === 0) {
      throw new Error('Content is empty or invalid');
    }

    if (!process.env.GEMINI_API_KEY) {
      throw new Error('Google GenAI API key is missing. Please check your .env file.');
    }

    // Use Google GenAI generateContent API
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `You are an expert content summarizer. Provide clear, concise summaries that highlight key points and main takeaways. Focus on the most important information that would be valuable to someone considering this program or opportunity.

Please provide a well-structured summary of the following content that captures:
- Main objectives and goals
- Key features or benefits
- Target audience
- Important requirements or qualifications (if any)
- Expected outcomes or value proposition

Keep the summary informative yet concise, around 2-4 sentences.

Content to summarize:
${input.content}`,
      config: {
        thinkingConfig: {
          thinkingBudget: 0, // Disables thinking
        },
      }
    });

    const summary = response.text?.trim();
    
    if (!summary) {
      throw new Error('Google GenAI generated empty response');
    }

    console.log('SummarizeContent: Successfully generated summary, length:', summary.length);
    
    return { summary };
  } catch (error: any) {
    console.error('SummarizeContent: Error during summarization:', error);
    
    // Provide more specific error messages
    if (error.message?.includes('API key') || error.status === 401) {
      throw new Error('Google GenAI API key is invalid or missing. Please check your .env file.');
    } else if (error.message?.includes('quota') || error.status === 429) {
      throw new Error('Google GenAI API quota exceeded. Please check your Google account.');
    } else if (error.message?.includes('rate limit')) {
      throw new Error('Google GenAI API rate limit reached. Please try again in a moment.');
    } else {
      throw new Error(`Failed to summarize content: ${error.message || 'Unknown error'}`);
    }
  }
}