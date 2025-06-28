'use server';

/**
 * @fileOverview AI flow for generating personalized user recommendations.
 *
 * - generateUserRecommendations - A function that creates personalized recommendations based on user profile
 * - GenerateUserRecommendationsInput - The input type for the generateUserRecommendations function
 * - GenerateUserRecommendationsOutput - The return type for the generateUserRecommendations function
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateUserRecommendationsInputSchema = z.object({
  userType: z.string().describe('The type of user (student, professional, donor, etc.)'),
  interests: z.array(z.string()).describe('Array of user interests and skills'),
  bio: z.string().optional().describe('Optional user bio for additional context'),
  experience: z.string().optional().describe('Optional experience level'),
});
export type GenerateUserRecommendationsInput = z.infer<typeof GenerateUserRecommendationsInputSchema>;

const GenerateUserRecommendationsOutputSchema = z.object({
  programs: z.array(z.string()).describe('Recommended programs for the user'),
  skills: z.array(z.string()).describe('Skills the user should develop'),
  mentorship: z.array(z.string()).describe('Mentorship opportunities'),
  projects: z.array(z.string()).describe('Relevant project types'),
  connections: z.array(z.string()).describe('Suggested connections or networking opportunities'),
});
export type GenerateUserRecommendationsOutput = z.infer<typeof GenerateUserRecommendationsOutputSchema>;

export async function generateUserRecommendations(input: GenerateUserRecommendationsInput): Promise<GenerateUserRecommendationsOutput> {
  return generateUserRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateUserRecommendationsPrompt',
  input: {schema: GenerateUserRecommendationsInputSchema},
  output: {schema: GenerateUserRecommendationsOutputSchema},
  prompt: `Based on a user profile, generate personalized recommendations for the Saleeka Foundation platform.

User Type: {{{userType}}}
Interests: {{{interests}}}
{{#if bio}}Bio: {{{bio}}}{{/if}}
{{#if experience}}Experience: {{{experience}}}{{/if}}

Provide specific, actionable recommendations in these categories:
1. Programs - Relevant Saleeka programs they should join
2. Skills - Technical and soft skills they should develop
3. Mentorship - Areas where they could mentor others or seek mentorship
4. Projects - Types of projects that align with their interests
5. Connections - Networking opportunities and communities they should engage with

Make recommendations specific to their user type and interests. For students, focus on learning and growth opportunities. For professionals, emphasize mentoring and leadership. For organizations, suggest collaboration opportunities.`,
});

const generateUserRecommendationsFlow = ai.defineFlow(
  {
    name: 'generateUserRecommendationsFlow',
    inputSchema: GenerateUserRecommendationsInputSchema,
    outputSchema: GenerateUserRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);