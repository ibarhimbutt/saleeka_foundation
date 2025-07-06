'use server';

/**
 * @fileOverview A content summarization AI agent using OpenAI directly.
 */

import OpenAI from 'openai';

export type SummarizeContentInput = {
  content: string;
};

export type SummarizeContentOutput = {
  summary: string;
};


// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function summarizeContent(input: SummarizeContentInput): Promise<SummarizeContentOutput> {
  try {
    console.log('SummarizeContent: Starting summarization for content length:', input.content.length);
    
    if (!input.content || input.content.trim().length === 0) {
      throw new Error('Content is empty or invalid');
    }

    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key is missing. Please check your .env file.');
    }

    // Use OpenAI chat completions API
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an expert content summarizer. Provide clear, concise summaries that highlight key points and main takeaways. Focus on the most important information that would be valuable to someone considering this program or opportunity."
        },
        {
          role: "user",
          content: `Please provide a well-structured summary of the following content that captures:
- Main objectives and goals
- Key features or benefits
- Target audience
- Important requirements or qualifications (if any)
- Expected outcomes or value proposition

Keep the summary informative yet concise, around 2-4 sentences.

Content to summarize:
${input.content}`
        }
      ],
      max_tokens: 300,
      temperature: 0.7,
    });

    const summary = response.choices[0]?.message?.content?.trim();
    
    if (!summary) {
      throw new Error('OpenAI generated empty response');
    }

    console.log('SummarizeContent: Successfully generated summary, length:', summary.length);
    
    return { summary };
  } catch (error: any) {
    console.error('SummarizeContent: Error during summarization:', error);
    
    // Provide more specific error messages
    if (error.message?.includes('API key') || error.status === 401) {
      throw new Error('OpenAI API key is invalid or missing. Please check your .env file.');
    } else if (error.message?.includes('quota') || error.status === 429) {
      throw new Error('OpenAI API quota exceeded. Please check your OpenAI account.');
    } else if (error.message?.includes('rate limit')) {
      throw new Error('OpenAI API rate limit reached. Please try again in a moment.');
    } else {
      throw new Error(`Failed to summarize content: ${error.message || 'Unknown error'}`);
    }
  }
}