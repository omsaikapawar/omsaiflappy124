import { GoogleGenAI, Type } from "@google/genai";
import { Question, Subject, Difficulty } from "../types";

// The API key is injected by Vite at build time from Netlify environment variables
const API_KEY = process.env.API_KEY;

export async function fetchRevisionQuestion(
  subjects: Subject[],
  difficulty: Difficulty,
  askedQuestionIds: string[]
): Promise<Question> {
  if (!API_KEY) {
    throw new Error("Gemini API Key is missing. Please set it in Netlify environment variables.");
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const subjectList = subjects.join(", ");
  
  const prompt = `Generate exactly 1 MCQ for CBSE Class 10.
    DIFFICULTY: ${difficulty}
    ALLOWED SUBJECTS: [${subjectList}]
    EXCLUDED IDs: ${askedQuestionIds.slice(-20).join(", ")}
    
    CRITICAL RULE: The question MUST be from one of the ALLOWED SUBJECTS. 
    If only one subject is listed in [${subjectList}], you MUST ONLY generate a question for that specific subject. 
    Do not mention or use topics from any other subject.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      systemInstruction: `You are a strict CBSE Class 10 examination bot.
      1. SUBJECT LOCK: You are restricted to these subjects: ${subjectList}. 
         If only ONE subject is provided, you ARE FORBIDDEN from generating questions for any other subject.
      2. SYLLABUS DEPTH: Do not repeat basic introductory topics. Pick from the ENTIRE NCERT syllabus including late-year chapters.
      3. DIFFICULTY: The question must strictly be of ${difficulty} difficulty.
      4. OUTPUT: Return only valid JSON matching the schema.`,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          subject: { type: Type.STRING, description: "Must be one of the provided allowed subjects" },
          text: { type: Type.STRING },
          options: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            minItems: 4,
            maxItems: 4
          },
          correctIndex: { type: Type.INTEGER },
          explanation: { type: Type.STRING }
        },
        required: ["id", "subject", "text", "options", "correctIndex", "explanation"]
      }
    }
  });

  try {
    const text = response.text;
    if (!text) throw new Error("Empty response from AI");
    const questionData = JSON.parse(text.trim());
    return {
      ...questionData,
      difficulty
    };
  } catch (err) {
    console.error("Failed to parse AI response", response.text);
    throw new Error("Invalid question format received");
  }
}