'use server';

/**
 * @fileOverview A license plate autocompletion AI agent.
 *
 * - licensePlateAutocomplete - A function that handles the license plate autocompletion process.
 * - LicensePlateAutocompleteInput - The input type for the licensePlateAutocomplete function.
 * - LicensePlateAutocompleteOutput - The return type for the licensePlateAutocomplete function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const LicensePlateAutocompleteInputSchema = z.object({
  partialLicensePlate: z
    .string()
    .describe('The partial license plate entered by the user.'),
  existingLicensePlates: z
    .array(z.string())
    .describe('The list of existing license plates for the user.'),
});
export type LicensePlateAutocompleteInput = z.infer<
  typeof LicensePlateAutocompleteInputSchema
>;

const LicensePlateAutocompleteOutputSchema = z.object({
  suggestions: z
    .array(z.string())
    .describe(
      'A list of suggested license plates based on the partial input.'
    ),
});
export type LicensePlateAutocompleteOutput = z.infer<
  typeof LicensePlateAutocompleteOutputSchema
>;

export async function licensePlateAutocomplete(
  input: LicensePlateAutocompleteInput
): Promise<LicensePlateAutocompleteOutput> {
  return licensePlateAutocompleteFlow(input);
}

const prompt = ai.definePrompt({
  name: 'licensePlateAutocompletePrompt',
  input: {schema: LicensePlateAutocompleteInputSchema},
  output: {schema: LicensePlateAutocompleteOutputSchema},
  prompt: `You are a helpful assistant that suggests license plates based on a partial input and a list of existing license plates.\n\nGiven the following partial license plate: {{{partialLicensePlate}}}\nAnd the following list of existing license plates: {{#each existingLicensePlates}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}\n\nSuggest up to 5 license plates that the user might be typing. Only include suggestions that start with the partial license plate. Return an empty array if there are no suggestions.\n\nEnsure that the suggestions are in the same format as the existing license plates, meaning don't add any extra punctuation or spaces.`,
});

const licensePlateAutocompleteFlow = ai.defineFlow(
  {
    name: 'licensePlateAutocompleteFlow',
    inputSchema: LicensePlateAutocompleteInputSchema,
    outputSchema: LicensePlateAutocompleteOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
