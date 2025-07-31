'use server';
/**
 * @fileOverview A book recommendation AI agent.
 *
 * - generateBookRecommendations - A function that handles the book recommendation process.
 * - GenerateBookRecommendationsInput - The input type for the generateBookRecommendations function.
 * - GenerateBookRecommendationsOutput - The return type for the generateBookRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateBookRecommendationsInputSchema = z.object({
  readingHistory: z
    .string()
    .describe("The user's reading history, as a string."),
});
export type GenerateBookRecommendationsInput = z.infer<typeof GenerateBookRecommendationsInputSchema>;

const GenerateBookRecommendationsOutputSchema = z.object({
  recommendations: z.array(z.string()).describe('The list of recommended books.'),
});
export type GenerateBookRecommendationsOutput = z.infer<typeof GenerateBookRecommendationsOutputSchema>;

export async function generateBookRecommendations(input: GenerateBookRecommendationsInput): Promise<GenerateBookRecommendationsOutput> {
  return generateBookRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateBookRecommendationsPrompt',
  input: {schema: GenerateBookRecommendationsInputSchema},
  output: {schema: GenerateBookRecommendationsOutputSchema},
  prompt: `You are a book recommendation expert. Given the user's reading history, you will recommend a list of books that the user might enjoy.

Reading History: {{{readingHistory}}}

Please provide a list of book recommendations.`,
});

const generateBookRecommendationsFlow = ai.defineFlow(
  {
    name: 'generateBookRecommendationsFlow',
    inputSchema: GenerateBookRecommendationsInputSchema,
    outputSchema: GenerateBookRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
