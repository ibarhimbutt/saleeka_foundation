'use server';

/**
 * @fileOverview A content summarization AI agent using OpenAI.
 */

import {ai, defaultModel} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeContentInputSchema = z.object({
  content: z.string().describe('The content to be summarized.'),
});
export type SummarizeContentInput = z.infer<typeof SummarizeContentInputSchema>;

const SummarizeContentOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the input content.'),
});
export type SummarizeContentOutput = z.infer<typeof SummarizeContentOutputSchema>;

export async function summarizeContent(input: SummarizeContentInput): Promise<SummarizeContentOutput> {
  try {
    console.log('SummarizeContent: Starting summarization for content length:', input.content.length);
    console.log('SummarizeContent: Using model:', defaultModel);
    
    if (!input.content || input.content.trim().length === 0) {
      throw new Error('Content is empty or invalid');
    }

    if (!defaultModel) {
      throw new Error('No AI model available. Please check your OpenAI API key configuration.');
    }

    // Use direct AI generation instead of flow to ensure OpenAI is used
    const response = await ai.generate({
      model: 'openai/gpt-3.5-turbo', // Explicitly specify OpenAI model
      prompt: `You are an expert content summarizer. Please provide a clear, concise summary of the following content, highlighting the key points and main takeaways. Focus on the most important information that would be valuable to someone considering this program or opportunity.

Content to summarize:
${input.content}

Please provide a well-structured summary that captures:
- Main objectives and goals
- Key features or benefits
- Target audience
- Important requirements or qualifications (if any)
- Expected outcomes or value proposition

Keep the summary informative yet concise, around 2-4 sentences.`,
      config: {
        temperature: 0.7,
        maxOutputTokens: 300,
      },
    });

    const summary = response.text?.trim();
    
    if (!summary) {
      throw new Error('AI generated empty response');
    }

    console.log('SummarizeContent: Successfully generated summary, length:', summary.length);
    
    return { summary };
  } catch (error: any) {
    console.error('SummarizeContent: Error during summarization:', error);
    
    // Provide more specific error messages
    if (error.message?.includes('API key')) {
      throw new Error('OpenAI API key is invalid or missing. Please check your .env file.');
    } else if (error.message?.includes('quota')) {
      throw new Error('OpenAI API quota exceeded. Please check your OpenAI account.');
    } else if (error.message?.includes('rate limit')) {
      throw new Error('OpenAI API rate limit reached. Please try again in a moment.');
    } else {
      throw new Error(`Failed to summarize content: ${error.message || 'Unknown error'}`);
    }
  }
}