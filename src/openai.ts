import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

export async function createCompletion(systemPromptText: string, inputLabelText: string): Promise<string> {
  const response = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: `${systemPromptText}\n\n${inputLabelText}`,
    max_tokens: 50,
  });

  return response.data.choices[0].text.trim();
}
