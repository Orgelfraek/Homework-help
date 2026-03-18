import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface HomeworkSolution {
  summary: string;
  solvedImageUrl?: string;
}

export async function solveHomework(base64Image: string, mimeType: string): Promise<HomeworkSolution> {
  // Step 1: Solve the problems and get a text summary
  const solverResponse: GenerateContentResponse = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        inlineData: {
          mimeType,
          data: base64Image.split(',')[1] || base64Image,
        },
      },
      {
        text: `Role: The Relatable 14-Year-Old Academic Assistant.
Objective: Solve all problems in this worksheet.
Tone: Casual, "teen" style (e.g., "Alright, I got this," "Easy win").
Output: Provide a clear text summary of all answers so I can check them. Explain the logic simply.`,
      },
    ],
  });

  const summary = solverResponse.text || "Couldn't solve it, sorry!";

  // Step 2: Generate the handwritten version
  // We use the same image as context and ask for an edit/generation that looks handwritten
  const generatorResponse: GenerateContentResponse = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          inlineData: {
            mimeType,
            data: base64Image.split(',')[1] || base64Image,
          },
        },
        {
          text: `Objective: Generate a NEW version of this worksheet with the solutions written in.
Visual Style:
- Handwriting: Human-like, slightly inconsistent, legible but not perfect.
- Ink: Blue ballpoint pen or dark pencil.
- Mistakes: Include 1-2 small human touches (e.g., a crossed-out word, a tiny doodle like a smiley or geometric shape in the margin).
- Layout: Write answers directly in the provided spaces.
- Authenticity: Not a perfect printout. Varying pen pressure, slightly non-straight lines.
Solutions to include: ${summary}`,
        },
      ],
    },
    config: {
      imageConfig: {
        aspectRatio: "1:1", // Defaulting to 1:1, but could be dynamic
      },
    },
  });

  let solvedImageUrl: string | undefined;
  for (const part of generatorResponse.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      solvedImageUrl = `data:image/png;base64,${part.inlineData.data}`;
      break;
    }
  }

  return {
    summary,
    solvedImageUrl,
  };
}
