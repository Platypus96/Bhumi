
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

const prompt = ai.definePrompt({
  name: 'improveDescriptionPrompt',
  input: { schema: ImproveDescriptionInputSchema },
  output: { schema: ImproveDescriptionOutputSchema },
  prompt: `You are an expert real estate agent. Rewrite the following property description to be more professional, appealing, and descriptive.
  Focus on highlighting the key features and creating an attractive narrative for potential buyers.

  Original Description:
  "{{prompt}}"
  
  Improved Description:
  `,
});

const improveDescriptionFlow = ai.defineFlow(
  {
    name: 'improveDescriptionFlow',
    inputSchema: ImproveDescriptionInputSchema,
    outputSchema: ImproveDescriptionOutputSchema,
  },
  async (input) => {
    const { text } = await ai.generate({
        prompt: `You are an expert real estate agent. Rewrite the following property description to be more professional, appealing, and descriptive.
  Focus on highlighting the key features and creating an attractive narrative for potential buyers.

  Original Description:
  "${input}"
  
  Improved Description:`,
    });
    return text;
  }
);

    