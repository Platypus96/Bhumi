
'use server';
/**
 * @fileOverview A flow to improve property descriptions using AI.
 *
 * - improveDescription - A function that takes a raw description and returns a polished one.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const ImproveDescriptionInputSchema = z.string();
const ImproveDescriptionOutputSchema = z.string();

export async function improveDescription(description: string): Promise<string> {
    const result = await improveDescriptionFlow(description);
    return result;
}

const promptTemplate = `You are an expert real estate agent. Rewrite the following property description to be more professional, appealing, and descriptive.
Focus on highlighting the key features and creating an attractive summary for potential buyers.
The output should be a list of 5-6 bullet points.

Original Description:
"{{prompt}}"

Improved Description (as a list of 5-6 bullet points):
`;

const prompt = ai.definePrompt({
  name: 'improveDescriptionPrompt',
  input: { schema: ImproveDescriptionInputSchema },
  output: { schema: ImproveDescriptionOutputSchema },
  prompt: promptTemplate,
});

const improveDescriptionFlow = ai.defineFlow(
  {
    name: 'improveDescriptionFlow',
    inputSchema: ImproveDescriptionInputSchema,
    outputSchema: ImproveDescriptionOutputSchema,
  },
  async (input) => {
    const { text } = await ai.generate({
        prompt: promptTemplate.replace('{{prompt}}', input),
    });
    return text;
  }
);
