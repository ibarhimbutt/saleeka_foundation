'use server';

/**
 * @fileOverview A content summarization AI agent.
 *
 * - summarizeContent - A function that handles the content summarization process.
 * - SummarizeContentInput - The input type for the summarizeContent function.
 * - SummarizeContentOutput - The return type for the summarizeContent function.
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
    
    if (!input.content || input.content.trim().length === 0) {
      throw new Error('Content is empty or invalid');
    }

    const result = await summarizeContentFlow(input);
    console.log('SummarizeContent: Successfully generated summary');
    return result;
  } catch (error: any) {
    console.error('SummarizeContent: Error during summarization:', error);
    throw new Error(`Failed to summarize content: ${error.message || 'Unknown error'}`);
  }
}

const prompt = ai.definePrompt({
  name: 'summarizeContentPrompt',
  input: {schema: SummarizeContentInputSchema},
  output: {schema: SummarizeContentOutputSchema},
  prompt: `You are an expert content summarizer. Please provide a clear, concise summary of the following content, highlighting the key points and main takeaways. Focus on the most important information that would be valuable to someone considering this program or opportunity.

Content to summarize:
{{{content}}}

Please provide a well-structured summary that captures:
- Main objectives and goals
- Key features or benefits
- Target audience
- Important requirements or qualifications (if any)
- Expected outcomes or value proposition

Keep the summary informative yet concise, around 2-4 sentences.`,
});

const summarizeContentFlow = ai.defineFlow(
  {
    name: 'summarizeContentFlow',
    inputSchema: SummarizeContentInputSchema,
    outputSchema: SummarizeContentOutputSchema,
  },
  async (input) => {
    try {
      console.log('SummarizeContentFlow: Processing content with AI...');
      
      const response = await ai.generate({
        model: defaultModel || 'openai/gpt-3.5-turbo',
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

      console.log('SummarizeContentFlow: AI response received, length:', summary.length);
      
      return { summary };
    } catch (error: any) {
      console.error('SummarizeContentFlow: Error in AI generation:', error);
      throw new Error(`AI generation failed: ${error.message || 'Unknown error'}`);
    }
  }
);